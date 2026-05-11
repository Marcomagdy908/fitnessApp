import { Response, NextFunction } from "express";
import { z } from "zod";
import { db } from "../services/db";
import { AuthRequest } from "../middleware/auth";
import { TrainerBookingRow, TrainerRow, PaymentRow } from "../types/db";
import { ResultSetHeader } from "mysql2";

/* Ensure Payment table exists */
const ensurePaymentTable = async () => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS Payment (
      id INT AUTO_INCREMENT PRIMARY KEY,
      trainerBookingId INT DEFAULT NULL,
      classBookingId INT DEFAULT NULL,
      subscriptionId INT DEFAULT NULL,
      amount FLOAT NOT NULL DEFAULT 0,
      currency VARCHAR(10) NOT NULL DEFAULT 'USD',
      status ENUM('pending', 'completed', 'failed', 'refunded') NOT NULL DEFAULT 'pending',
      method VARCHAR(50) DEFAULT NULL,
      transactionRef VARCHAR(255) DEFAULT NULL,
      paidAt DATETIME DEFAULT NULL,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (trainerBookingId) REFERENCES TrainerBooking(id) ON DELETE CASCADE,
      FOREIGN KEY (classBookingId) REFERENCES GymClassBooking(id) ON DELETE CASCADE,
      FOREIGN KEY (subscriptionId) REFERENCES Subscription(id) ON DELETE CASCADE
    )
  `);
};
ensurePaymentTable().catch(() => {});

const bookingSchema = z.object({
  trainerId: z.number(),
  scheduledAt: z.string().transform((val) => new Date(val)),
  durationMins: z.number().default(60),
  notes: z.string().optional(),
  paymentMethod: z.string().optional().default("card"),
});

/* ═══ USER-SIDE ═══════════════════════════════════════════════ */

/**
 * GET /api/trainer-bookings
 * Returns all personal training session bookings for the logged-in user,
 * enriched with trainer info and payment status.
 */
export const getMyBookings = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const [rows] = await db.query<TrainerBookingRow[] & { length: number }>(
      `SELECT tb.*,
         t.name as trainerName, t.avatar as trainerAvatar,
         t.specialty as trainerSpecialty, t.specialtyColor as trainerSpecialtyColor,
         t.imageUrl as trainerImageUrl,
         p.id as paymentId, p.status as paymentStatus, p.method as paymentMethod,
         p.amount as paymentAmount, p.paidAt
       FROM TrainerBooking tb
       JOIN Trainer t ON tb.trainerId = t.id
       LEFT JOIN Payment p ON p.trainerBookingId = tb.id
       WHERE tb.userId = ?
       ORDER BY tb.scheduledAt DESC`,
      [req.user!.id]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/trainer-bookings
 * User books a personal training session.
 * Automatically creates a Payment record with status 'pending'.
 */
export const createBooking = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const conn = await db.getConnection();
  try {
    const { trainerId, scheduledAt, durationMins, notes, paymentMethod } =
      bookingSchema.parse(req.body);

    // Fetch trainer to get price
    const [trainers] = await conn.query<TrainerRow[] & { length: number }>(
      "SELECT * FROM Trainer WHERE id = ?",
      [trainerId]
    );

    if (trainers.length === 0) {
      res.status(404).json({ success: false, message: "Trainer not found" });
      return;
    }

    const trainer = trainers[0];
    const totalPrice = (trainer.pricePerSession / 60) * durationMins;

    await conn.beginTransaction();

    // Create the booking
    const [bookingResult] = await conn.query<ResultSetHeader>(
      `INSERT INTO TrainerBooking
         (userId, trainerId, scheduledAt, durationMins, status, notes, totalPrice)
       VALUES (?, ?, ?, ?, 'pending', ?, ?)`,
      [req.user!.id, trainerId, scheduledAt, durationMins, notes || null, totalPrice]
    );

    const bookingId = bookingResult.insertId;

    // Create a linked payment record (pending — awaiting trainer confirmation)
    const [paymentResult] = await conn.query<ResultSetHeader>(
      `INSERT INTO Payment (trainerBookingId, amount, currency, status, method)
       VALUES (?, ?, 'USD', 'pending', ?)`,
      [bookingId, totalPrice, paymentMethod || "card"]
    );

    await conn.commit();

    res.json({
      success: true,
      data: {
        id: bookingId,
        userId: req.user!.id,
        trainerId,
        trainerName: trainer.name,
        scheduledAt,
        durationMins,
        status: "pending",
        paymentStatus: "pending",
        notes,
        totalPrice,
        payment: {
          id: paymentResult.insertId,
          status: "pending",
          amount: totalPrice,
          method: paymentMethod || "card",
        },
      },
    });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
};

/**
 * PATCH /api/trainer-bookings/:id/cancel
 * User cancels their own booking. Payment is refunded if it was paid.
 */
export const cancelBooking = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const conn = await db.getConnection();
  try {
    const { id } = req.params;

    // Fetch booking to check ownership & payment
    const [rows] = await conn.query<TrainerBookingRow[] & { length: number }>(
      "SELECT * FROM TrainerBooking WHERE id = ? AND userId = ?",
      [id, req.user!.id]
    );

    if (rows.length === 0) {
      res.status(404).json({ success: false, message: "Booking not found" });
      return;
    }

    const booking = rows[0];

    if (booking.status === "cancelled") {
      res.status(400).json({ success: false, message: "Booking already cancelled" });
      return;
    }

    await conn.beginTransaction();

    // Cancel the booking
    await conn.query(
      "UPDATE TrainerBooking SET status = 'cancelled' WHERE id = ?",
      [id]
    );

    // Mark any payment as refunded
    await conn.query(
      "UPDATE Payment SET status = 'refunded' WHERE trainerBookingId = ?",
      [id]
    );

    await conn.commit();

    res.json({ success: true, message: "Booking cancelled and payment refunded" });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
};

/* ═══ TRAINER-SIDE ═══════════════════════════════════════════════ */

/**
 * GET /api/trainer-bookings/incoming
 * Trainer views all incoming session requests with client and payment info.
 */
export const getTrainerIncomingBookings = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const [trainerRows] = await db.query<any[] & { length: number }>(
      "SELECT id FROM Trainer WHERE userId = ?",
      [req.user!.id]
    );
    if (trainerRows.length === 0) {
      res.status(403).json({ success: false, message: "Trainer profile not found" });
      return;
    }
    const trainerId = trainerRows[0].id;

    const [rows] = await db.query<any[] & { length: number }>(
      `SELECT tb.*,
         u.name as clientName, u.email as clientEmail, u.avatar as clientAvatar,
         p.id as paymentId, p.status as paymentStatus,
         p.amount as paymentAmount, p.method as paymentMethod, p.paidAt
       FROM TrainerBooking tb
       JOIN User u ON tb.userId = u.id
       LEFT JOIN Payment p ON p.trainerBookingId = tb.id
       WHERE tb.trainerId = ?
       ORDER BY tb.scheduledAt ASC`,
      [trainerId]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/trainer-bookings/:id/status
 * Trainer confirms or cancels a booking.
 * - confirmed  → paymentStatus becomes 'awaiting_payment'
 * - cancelled  → paymentStatus becomes 'refunded'
 * - completed  → paymentStatus becomes 'paid' (session done, money released)
 */
export const updateBookingStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const conn = await db.getConnection();
  try {
    const { id } = req.params;
    const { status } = req.body as { status: string };

    const validStatuses = ["confirmed", "cancelled", "completed"];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ success: false, message: "Invalid status. Use: confirmed, cancelled, completed" });
      return;
    }

    const [trainerRows] = await conn.query<any[] & { length: number }>(
      "SELECT id FROM Trainer WHERE userId = ?",
      [req.user!.id]
    );
    if (trainerRows.length === 0) {
      res.status(403).json({ success: false, message: "Trainer profile not found" });
      return;
    }
    const trainerId = trainerRows[0].id;

    const paymentStatusMap: Record<string, string> = {
      confirmed: "pending",
      cancelled: "refunded",
      completed: "completed",
    };
    const newPaymentStatus = paymentStatusMap[status];

    await conn.beginTransaction();

    const [result] = await conn.query<ResultSetHeader>(
      "UPDATE TrainerBooking SET status = ? WHERE id = ? AND trainerId = ?",
      [status, id, trainerId]
    );

    if (result.affectedRows === 0) {
      await conn.rollback();
      res.status(404).json({ success: false, message: "Booking not found" });
      return;
    }

    // Update payment record to match
    const paymentFields: string[] = ["status = ?"];
    const paymentValues: any[] = [newPaymentStatus === "paid" ? "completed" : newPaymentStatus === "refunded" ? "refunded" : "pending"];

    if (status === "completed") {
      paymentFields.push("paidAt = NOW()");
    }

    await conn.query(
      `UPDATE Payment SET ${paymentFields.join(", ")} WHERE trainerBookingId = ?`,
      [...paymentValues, id]
    );

    await conn.commit();

    res.json({ success: true, message: `Booking ${status}`, paymentStatus: newPaymentStatus });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
};

/* ═══ SHARED — PAYMENT DETAILS ═══════════════════════════════════ */

/**
 * GET /api/trainer-bookings/:id/payment
 * Get payment details for a specific booking (accessible by user or trainer).
 */
export const getBookingPayment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Check if user is the client
    const [bookingRows] = await db.query<TrainerBookingRow[] & { length: number }>(
      `SELECT tb.*, t.name as trainerName
       FROM TrainerBooking tb
       JOIN Trainer t ON tb.trainerId = t.id
       WHERE tb.id = ? AND (tb.userId = ? OR t.userId = ?)`,
      [id, userId, userId]
    );

    if (bookingRows.length === 0) {
      res.status(404).json({ success: false, message: "Booking not found or access denied" });
      return;
    }

    const [payments] = await db.query<PaymentRow[] & { length: number }>(
      "SELECT * FROM Payment WHERE trainerBookingId = ?",
      [id]
    );

    res.json({
      success: true,
      data: {
        booking: bookingRows[0],
        payment: payments[0] || null,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/trainer-bookings/:id/pay
 * User marks a booking as paid (simulating payment gateway callback).
 * In production, replace this with a real payment gateway webhook.
 */
export const markBookingPaid = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const conn = await db.getConnection();
  try {
    const { id } = req.params;
    const { transactionRef } = req.body as { transactionRef?: string };

    // Verify the user owns this booking
    const [rows] = await conn.query<TrainerBookingRow[] & { length: number }>(
      "SELECT * FROM TrainerBooking WHERE id = ? AND userId = ?",
      [id, req.user!.id]
    );

    if (rows.length === 0) {
      res.status(404).json({ success: false, message: "Booking not found" });
      return;
    }

    const booking = rows[0];

    if (booking.status !== "confirmed" && booking.status !== "pending") {
      res.status(400).json({ success: false, message: "Cannot pay for a booking that is not confirmed or pending" });
      return;
    }

    await conn.beginTransaction();

    // Mark booking as cancelled if needed? No, user just said remove paymentStatus.
    // The previous code updated TrainerBooking.paymentStatus to 'paid'.
    // Now we just update the Payment record.
    // So I can just remove the whole TrainerBooking update here.

    // Update payment record
    await conn.query(
      `UPDATE Payment
       SET status = 'completed', paidAt = NOW(), transactionRef = ?
       WHERE trainerBookingId = ?`,
      [transactionRef || `TXN-${Date.now()}`, id]
    );

    await conn.commit();

    res.json({ success: true, message: "Payment recorded successfully" });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
};
