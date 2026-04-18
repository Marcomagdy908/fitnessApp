import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { db } from "../services/db";
import { ExerciseRow } from "../types/db";
import { ResultSetHeader } from "mysql2";

const createExerciseSchema = z.object({
  name: z.string().min(2),
  category: z.string(),
  difficulty: z.string(),
  description: z.string(),
  instructions: z.string(),
  muscleGroups: z.string(),
  imageUrl: z.string().url().optional(),
  videoUrl: z.string().url().optional(),
});

export const getExercises = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const {
      category,
      difficulty,
      search,
      page = "1",
      limit = "20",
    } = req.query as Record<string, string>;
    
    const limitNum = parseInt(limit);
    const skipNum = (parseInt(page) - 1) * limitNum;

    let baseQuery = "FROM Exercise WHERE 1=1";
    const params: any[] = [];

    if (category) {
      baseQuery += " AND category = ?";
      params.push(category);
    }
    
    if (difficulty) {
      baseQuery += " AND difficulty = ?";
      params.push(difficulty);
    }
    
    if (search) {
      baseQuery += " AND (name LIKE ? OR muscleGroups LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    const [[{ total }]] = await db.query<any>(
      `SELECT COUNT(*) as total ${baseQuery}`,
      params
    );

    const [exercises] = await db.query<ExerciseRow[] & { length: number }>(
      `SELECT * ${baseQuery} ORDER BY name ASC LIMIT ? OFFSET ?`,
      [...params, limitNum, skipNum]
    );

    res.json({
      success: true,
      data: exercises,
      pagination: { total, page: parseInt(page), limit: limitNum },
    });
  } catch (err) {
    next(err);
  }
};

export const getExercise = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const [rows] = await db.query<ExerciseRow[] & { length: number }>(
      "SELECT * FROM Exercise WHERE id = ?",
      [parseInt(id)]
    );
    const exercise = rows[0];
    if (!exercise) {
      res.status(404).json({ success: false, message: "Exercise not found" });
      return;
    }
    res.json({ success: true, data: exercise });
  } catch (err) {
    next(err);
  }
};

export const createExercise = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const body = createExerciseSchema.parse(req.body);
    const [result] = await db.query<ResultSetHeader>(
      `INSERT INTO Exercise (name, category, difficulty, description, instructions, muscleGroups, imageUrl, videoUrl)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [body.name, body.category, body.difficulty, body.description, body.instructions, body.muscleGroups, body.imageUrl ?? null, body.videoUrl ?? null]
    );
    
    const [rows] = await db.query<ExerciseRow[] & { length: number }>(
      "SELECT * FROM Exercise WHERE id = ?",
      [result.insertId]
    );
    
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
};

export const updateExercise = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const body = createExerciseSchema.partial().parse(req.body);
    
    const fields: string[] = [];
    const values: any[] = [];
    
    for (const [key, value] of Object.entries(body)) {
      if (value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (fields.length > 0) {
      values.push(parseInt(id));
      await db.query(
        `UPDATE Exercise SET ${fields.join(', ')} WHERE id = ?`,
        values
      );
    }

    const [rows] = await db.query<ExerciseRow[] & { length: number }>(
      "SELECT * FROM Exercise WHERE id = ?",
      [parseInt(id)]
    );
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
};

export const deleteExercise = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM Exercise WHERE id = ?", [parseInt(id)]);
    res.json({ success: true, message: "Exercise deleted" });
  } catch (err) {
    next(err);
  }
};
