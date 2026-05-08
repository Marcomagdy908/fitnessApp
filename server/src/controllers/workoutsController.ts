import { Response, NextFunction } from "express";
import { z } from "zod";
import { db } from "../services/db";
import { AuthRequest } from "../middleware/auth";
import { ResultSetHeader } from "mysql2";

const setSchema = z.object({
  exerciseId: z.number().int(),
  setNumber: z.number().int(),
  reps: z.number().int().optional(),
  weight: z.number().optional(),
  timeSecs: z.number().int().optional(),
  isCompleted: z.boolean().default(true),
});

const logWorkoutSchema = z.object({
  name: z.string(),
  planId: z.number().int().optional(),
  durationSecs: z.number().int().default(0),
  caloriesBurned: z.number().int().default(0),
  date: z.string().datetime().optional(),
  sets: z.array(setSchema),
});

export const logWorkout = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const body = logWorkoutSchema.parse(req.body);
    const userId = req.user!.id;
    const date = body.date ? new Date(body.date) : new Date();

    const [sessionResult] = await db.query<ResultSetHeader>(
      `INSERT INTO WorkoutSession (userId, planId, name, durationSecs, caloriesBurned, date)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, body.planId ?? null, body.name, body.durationSecs, body.caloriesBurned, date]
    );

    const sessionId = sessionResult.insertId;

    if (body.sets.length > 0) {
      const setValues = body.sets.map(s => [
        sessionId,
        s.exerciseId,
        s.setNumber,
        s.reps ?? null,
        s.weight ?? null,
        s.timeSecs ?? null,
        s.isCompleted ? 1 : 0
      ]);

      await db.query(
        `INSERT INTO WorkoutSessionSet (sessionId, exerciseId, setNumber, reps, weight, timeSecs, isCompleted)
         VALUES ?`,
        [setValues]
      );
    }

    res.status(201).json({
      success: true,
      message: "Workout logged successfully",
      data: { sessionId }
    });
  } catch (err) {
    next(err);
  }
};

export const getWorkouts = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const [workouts] = await db.query<any[]>(
      `SELECT ws.*, COUNT(wss.id) as setCount
       FROM WorkoutSession ws
       LEFT JOIN WorkoutSessionSet wss ON ws.id = wss.sessionId
       WHERE ws.userId = ?
       GROUP BY ws.id
       ORDER BY ws.date DESC`,
      [req.user!.id]
    );
    res.json({ success: true, data: workouts });
  } catch (err) {
    next(err);
  }
};
