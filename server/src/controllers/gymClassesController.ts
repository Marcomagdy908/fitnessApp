import { Response, NextFunction } from "express";
import { db } from "../services/db";
import { AuthRequest } from "../middleware/auth";
import { GymClassRow, SubscriptionRow } from "../types/db";
import { ResultSetHeader } from "mysql2";

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
