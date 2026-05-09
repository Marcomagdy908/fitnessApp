import { Request, Response, NextFunction } from "express";
import { db } from "../services/db";
import { TrainerRow } from "../types/db";
import { AuthRequest } from "../middleware/auth";

export const getTrainers = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const [trainers] = await db.query<TrainerRow[] & { length: number }>(
      "SELECT * FROM Trainer ORDER BY rating DESC",
    );
    
    const parseJSON = (str: string | null) => {
      if (!str) return [];
      try {
        return JSON.parse(str);
      } catch (e) {
        console.error("Failed to parse JSON:", str);
        return [];
      }
    };
    
    // Parse JSON strings
    const parsedTrainers = trainers.map(t => ({
      ...t,
      tags: parseJSON(t.tags),
      certifications: parseJSON(t.certifications)
    }));

    res.json({ success: true, data: parsedTrainers });
  } catch (err) {
    next(err);
  }
};

export const getTrainer = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const [rows] = await db.query<TrainerRow[] & { length: number }>(
      "SELECT * FROM Trainer WHERE id = ?",
      [parseInt(req.params.id)],
    );
    const [bookings] = await db.query(
      `SELECT 
      tb.id,
      tb.scheduledAt,
      tb.status,
      tb.totalPrice,
      u.name AS userName
   FROM TrainerBooking tb
   JOIN User u ON u.id = tb.userId
   WHERE tb.trainerId = ?
   ORDER BY tb.scheduledAt DESC`,
      [parseInt(req.params.id)],
    );
    const trainer = rows[0];
    if (!trainer) {
      res.status(404).json({ success: false, message: "Trainer not found" });
      return;
    }

    const parseJSON = (str: string | null) => {
      if (!str) return [];
      try {
        return JSON.parse(str);
      } catch (e) {
        console.error("Failed to parse JSON:", str);
        return [];
      }
    };

    const parsedTrainer = {
      ...trainer,
      tags: parseJSON(trainer.tags),
      certifications: parseJSON(trainer.certifications)
    };

    res.json({
      success: true,
      data: {
        ...parsedTrainer,
        bookings,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const initializeProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (req.user?.role !== "TRAINER") {
      res.status(403).json({ success: false, message: "Only trainers can initialize a profile" });
      return;
    }

    const [existing] = await db.query<any[]>("SELECT id FROM Trainer WHERE userId = ?", [req.user.id]);
    if (existing.length > 0) {
      res.json({ success: true, trainerId: existing[0].id });
      return;
    }

    const [uRows] = await db.query<any[]>("SELECT name FROM User WHERE id = ?", [req.user.id]);
    const name = uRows[0]?.name || "New Trainer";

    const [result] = await db.query<any>(
      `INSERT INTO Trainer (userId, name, specialty, bio, certifications, tags) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.user.id, name, "General Fitness", "", "[]", "[]"]
    );

    res.json({ success: true, trainerId: result.insertId });
  } catch (err) {
    next(err);
  }
};
