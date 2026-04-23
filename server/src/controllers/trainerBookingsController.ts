import { Response, NextFunction } from "express";
import { z } from "zod";
import { db } from "../services/db";
import { AuthRequest } from "../middleware/auth";
import { TrainerBookingRow, TrainerRow } from "../types/db";
import { ResultSetHeader } from "mysql2";

const bookingSchema = z.object({
  trainerId: z.number(),
  scheduledAt: z.string().transform((val) => new Date(val)),
  durationMins: z.number().default(60),
  notes: z.string().optional(),
});

export const getMyBookings = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const [rows] = await db.query<TrainerBookingRow[] & { length: number }>(
      `SELECT tb.*, t.name as trainerName, t.avatar as trainerAvatar, t.specialty as trainerSpecialty, t.specialtyColor as trainerSpecialtyColor
       FROM TrainerBooking tb
       JOIN Trainer t ON tb.trainerId = t.id
       WHERE tb.userId = ?
       ORDER BY tb.scheduledAt DESC`,
      [req.user!.id]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};

export const createBooking = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { trainerId, scheduledAt, durationMins, notes } = bookingSchema.parse(req.body);

    // Fetch trainer to get price
    const [trainers] = await db.query<TrainerRow[] & { length: number }>(
      "SELECT * FROM Trainer WHERE id = ?",
      [trainerId]
    );
    
    if (trainers.length === 0) {
      res.status(404).json({ success: false, message: "Trainer not found" });
      return;
    }

    const trainer = trainers[0];
    const totalPrice = (trainer.pricePerSession / 60) * durationMins;

    const [result] = await db.query<ResultSetHeader>(
      `INSERT INTO TrainerBooking (userId, trainerId, scheduledAt, durationMins, status, notes, totalPrice)
       VALUES (?, ?, ?, ?, 'pending', ?, ?)`,
      [req.user!.id, trainerId, scheduledAt, durationMins, notes || null, totalPrice]
    );

    res.json({ 
      success: true, 
      data: { 
        id: result.insertId,
        userId: req.user!.id,
        trainerId,
        scheduledAt,
        durationMins,
        status: 'pending',
        notes,
        totalPrice
      } 
    });
  } catch (err) {
    next(err);
  }
};

export const cancelBooking = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    await db.query(
      "UPDATE TrainerBooking SET status = 'cancelled' WHERE id = ? AND userId = ?",
      [id, req.user!.id]
    );
    res.json({ success: true, message: "Booking cancelled successfully" });
  } catch (err) {
    next(err);
  }
};
