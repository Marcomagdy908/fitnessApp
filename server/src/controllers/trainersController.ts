import { Request, Response, NextFunction } from "express";
import { db } from "../services/db";
import { TrainerRow } from "../types/db";

export const getTrainers = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const [trainers] = await db.query<TrainerRow[] & { length: number }>(
      "SELECT * FROM Trainer ORDER BY rating DESC"
    );
    res.json({ success: true, data: trainers });
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
      [parseInt(req.params.id)]
    );
    const trainer = rows[0];
    if (!trainer) {
      res.status(404).json({ success: false, message: "Trainer not found" });
      return;
    }
    res.json({ success: true, data: trainer });
  } catch (err) {
    next(err);
  }
};
