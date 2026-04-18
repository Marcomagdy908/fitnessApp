import { Response, NextFunction } from "express";
import { z } from "zod";
import { db } from "../services/db";
import { AuthRequest } from "../middleware/auth";
import { MealLogRow } from "../types/db";
import { ResultSetHeader } from "mysql2";

const mealSchema = z.object({
  name: z.string().min(1),
  mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]),
  calories: z.number().int().min(0),
  protein: z.number().min(0).default(0),
  carbs: z.number().min(0).default(0),
  fat: z.number().min(0).default(0),
  date: z.string().datetime().optional(),
});

export const getMeals = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { date } = req.query as { date?: string };
    
    let query = "SELECT * FROM MealLog WHERE userId = ?";
    const params: any[] = [req.user!.id];

    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      
      query += " AND date >= ? AND date < ?";
      params.push(start, end);
    }
    
    query += " ORDER BY date DESC";

    const [meals] = await db.query<MealLogRow[] & { length: number }>(query, params);
    
    res.json({ success: true, data: meals });
  } catch (err) {
    next(err);
  }
};

export const addMeal = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const body = mealSchema.parse(req.body);
    const date = body.date ? new Date(body.date) : new Date();

    const [result] = await db.query<ResultSetHeader>(
      `INSERT INTO MealLog (userId, name, mealType, calories, protein, carbs, fat, date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user!.id, body.name, body.mealType, body.calories, body.protein, body.carbs, body.fat, date]
    );

    const [rows] = await db.query<MealLogRow[] & { length: number }>(
      "SELECT * FROM MealLog WHERE id = ?",
      [result.insertId]
    );

    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
};

export const deleteMeal = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const [result] = await db.query<ResultSetHeader>(
      "DELETE FROM MealLog WHERE id = ? AND userId = ?",
      [parseInt(req.params.id), req.user!.id]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ success: false, message: "Meal not found" });
      return;
    }
    res.json({ success: true, message: "Meal deleted" });
  } catch (err) {
    next(err);
  }
};
