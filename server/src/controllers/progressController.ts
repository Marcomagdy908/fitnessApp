import { Response, NextFunction } from "express";
import { z } from "zod";
import { db } from "../services/db";
import { AuthRequest } from "../middleware/auth";
import { ProgressEntryRow } from "../types/db";
import { ResultSetHeader } from "mysql2";

const createEntrySchema = z.object({
  weight: z.number().positive().optional(),
  bodyFat: z.number().min(0).max(100).optional(),
  notes: z.string().optional(),
  date: z.string().datetime().optional(),
});

export const getProgress = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const [entries] = await db.query<ProgressEntryRow[] & { length: number }>(
      "SELECT * FROM ProgressEntry WHERE userId = ? ORDER BY date DESC",
      [req.user!.id]
    );
    res.json({ success: true, data: entries });
  } catch (err) {
    next(err);
  }
};

export const addProgress = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const body = createEntrySchema.parse(req.body);
    const date = body.date ? new Date(body.date) : new Date();

    const [result] = await db.query<ResultSetHeader>(
      "INSERT INTO ProgressEntry (userId, weight, bodyFat, notes, date) VALUES (?, ?, ?, ?, ?)",
      [req.user!.id, body.weight ?? null, body.bodyFat ?? null, body.notes ?? null, date]
    );

    const [rows] = await db.query<ProgressEntryRow[] & { length: number }>(
      "SELECT * FROM ProgressEntry WHERE id = ?",
      [result.insertId]
    );

    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
};

export const deleteProgress = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const [result] = await db.query<ResultSetHeader>(
      "DELETE FROM ProgressEntry WHERE id = ? AND userId = ?",
      [parseInt(req.params.id), req.user!.id]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ success: false, message: "Entry not found" });
      return;
    }
    
    res.json({ success: true, message: "Entry deleted" });
  } catch (err) {
    next(err);
  }
};
