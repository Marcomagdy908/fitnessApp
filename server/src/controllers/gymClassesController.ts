import { Response, NextFunction } from "express";
import { db } from "../services/db";
import { AuthRequest } from "../middleware/auth";
import { GymClassRow, SubscriptionRow } from "../types/db";
import { ResultSetHeader } from "mysql2";
import { z } from "zod";

const createClassSchema = z.object({
  name: z.string().min(1),
  scheduledAt: z.string(),
  durationMins: z.number().min(1),
  maxSpots: z.number().min(1),
  color: z.string().optional(),
  description: z.string().optional(),
  requiredPlan: z.enum(["basic", "pro", "elite"]).default("basic"),
});

export const getGymClasses = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const [rows] = await db.query<GymClassRow[] & { length: number }>(
      `SELECT gc.*, t.name as trainerName, t.avatar as trainerAvatar,
       (SELECT COUNT(*) FROM GymClassBooking WHERE classId = gc.id AND userId = ?) as isBooked
       FROM GymClass gc
       LEFT JOIN Trainer t ON gc.trainerId = t.id
       WHERE gc.scheduledAt >= NOW()
       ORDER BY gc.scheduledAt ASC`,
      [req.user!.id]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};

export const bookClass = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const classId = parseInt(req.params.id);

    // Check if class exists and has spots
    const [classes] = await db.query<GymClassRow[] & { length: number }>(
      "SELECT * FROM GymClass WHERE id = ?",
      [classId]
    );

    if (classes.length === 0) {
      res.status(404).json({ success: false, message: "Class not found" });
      return;
    }

    const gymClass = classes[0];

    if (gymClass.spotsBooked >= gymClass.maxSpots) {
      res.status(400).json({ success: false, message: "Class is full" });
      return;
    }

    // Check subscription
    const [subs] = await db.query<SubscriptionRow[] & { length: number }>(
      "SELECT * FROM Subscription WHERE userId = ? AND status = 'active'",
      [req.user!.id]
    );

    if (subs.length === 0 || subs[0].plan === 'free') {
      res.status(403).json({ success: false, message: "Active subscription required to book classes" });
      return;
    }

    // Check if plan matches required plan
    // Simple logic: elite > pro > basic
    const planLevels: Record<string, number> = { 'free': 0, 'basic': 1, 'pro': 2, 'elite': 3 };
    if (planLevels[subs[0].plan] < planLevels[gymClass.requiredPlan]) {
      res.status(403).json({ success: false, message: `This class requires a ${gymClass.requiredPlan} plan or higher` });
      return;
    }

    await db.query(
      "INSERT INTO GymClassBooking (userId, classId) VALUES (?, ?)",
      [req.user!.id, classId]
    );

    await db.query(
      "UPDATE GymClass SET spotsBooked = spotsBooked + 1 WHERE id = ?",
      [classId]
    );

    res.json({ success: true, message: "Class booked successfully" });
  } catch (err) {
    if ((err as any).code === 'ER_DUP_ENTRY') {
      res.status(400).json({ success: false, message: "You have already booked this class" });
      return;
    }
    next(err);
  }
};

/* ── Trainer-side: manage their own classes ── */

export const getTrainerClasses = async (
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
      `SELECT gc.*,
        (SELECT COUNT(*) FROM GymClassBooking WHERE classId = gc.id) as actualBookings
       FROM GymClass gc
       WHERE gc.trainerId = ?
       ORDER BY gc.scheduledAt DESC`,
      [trainerId]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};

export const createClass = async (
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

    const { name, scheduledAt, durationMins, maxSpots, color, description, requiredPlan } =
      createClassSchema.parse(req.body);

    const [result] = await db.query<ResultSetHeader>(
      `INSERT INTO GymClass (name, trainerId, scheduledAt, durationMins, maxSpots, spotsBooked, color, description, requiredPlan)
       VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?)`,
      [name, trainerId, new Date(scheduledAt), durationMins, maxSpots, color || "#3dffff", description || "", requiredPlan]
    );

    res.json({ success: true, data: { id: result.insertId, name, scheduledAt, durationMins, maxSpots, requiredPlan } });
  } catch (err) {
    next(err);
  }
};

export const deleteTrainerClass = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const classId = parseInt(req.params.id);
    const [trainerRows] = await db.query<any[] & { length: number }>(
      "SELECT id FROM Trainer WHERE userId = ?",
      [req.user!.id]
    );
    if (trainerRows.length === 0) {
      res.status(403).json({ success: false, message: "Trainer profile not found" });
      return;
    }
    const trainerId = trainerRows[0].id;

    // Only allow deleting own classes
    const [result] = await db.query<ResultSetHeader>(
      "DELETE FROM GymClass WHERE id = ? AND trainerId = ?",
      [classId, trainerId]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ success: false, message: "Class not found or not yours" });
      return;
    }

    res.json({ success: true, message: "Class deleted" });
  } catch (err) {
    next(err);
  }
};

export const getClassAttendees = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const classId = parseInt(req.params.id);
    const [trainerRows] = await db.query<any[] & { length: number }>(
      "SELECT id FROM Trainer WHERE userId = ?",
      [req.user!.id]
    );
    if (trainerRows.length === 0) {
      res.status(403).json({ success: false, message: "Trainer profile not found" });
      return;
    }
    const trainerId = trainerRows[0].id;

    // Verify class belongs to trainer
    const [classes] = await db.query<any[] & { length: number }>(
      "SELECT id FROM GymClass WHERE id = ? AND trainerId = ?",
      [classId, trainerId]
    );

    if (classes.length === 0) {
      res.status(404).json({ success: false, message: "Class not found or not yours" });
      return;
    }

    const [attendees] = await db.query<any[] & { length: number }>(
      `SELECT u.id, u.name, u.email, u.avatar, gcb.bookedAt
       FROM GymClassBooking gcb
       JOIN User u ON gcb.userId = u.id
       WHERE gcb.classId = ?
       ORDER BY gcb.bookedAt ASC`,
      [classId]
    );

    res.json({ success: true, data: attendees });
  } catch (err) {
    next(err);
  }
};

export const cancelClassBooking = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const classId = parseInt(req.params.id);

    const [result] = await db.query<ResultSetHeader>(
      "DELETE FROM GymClassBooking WHERE userId = ? AND classId = ?",
      [req.user!.id, classId]
    );

    if (result.affectedRows > 0) {
      await db.query(
        "UPDATE GymClass SET spotsBooked = spotsBooked - 1 WHERE id = ?",
        [classId]
      );
    }

    res.json({ success: true, message: "Booking cancelled successfully" });
  } catch (err) {
    next(err);
  }
};
