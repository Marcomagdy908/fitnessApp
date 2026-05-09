import { Response, NextFunction } from "express";
import { z } from "zod";
import { db } from "../services/db";
import { AuthRequest } from "../middleware/auth";
import { WorkoutPlanRow, WorkoutExerciseRow, ExerciseRow } from "../types/db";
import { ResultSetHeader } from "mysql2";

const createPlanSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  daysPerWeek: z.number().int().min(1).max(7).optional(),
  level: z.string().optional(),
  weeks: z.number().int().min(1).optional(),
  goal: z.string().optional(),
  label: z.string().optional(),
  targetUserId: z.number().int().nullable().optional(), // null = public
  isPublic: z.boolean().optional(),
});

const addExerciseSchema = z.object({
  exerciseId: z.number().int(),
  sets: z.number().int().min(1),
  reps: z.number().int().min(1),
  restSecs: z.number().int().min(0).optional(),
  day: z.number().int().min(1).max(7),
  orderIndex: z.number().int().min(0).optional(),
});

export const getPlans = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const isTrainerOrAdmin = req.user!.role === "TRAINER" || req.user!.role === "ADMIN";
    // Trainers see plans they created + public plans. Admins see everything.
    const [plans] = await db.query<WorkoutPlanRow[] & { length: number }>(
      req.user!.role === "ADMIN"
        ? "SELECT id, userId, name, description, daysPerWeek, level, weeks, goal, label, isActive, createdAt, updatedAt FROM WorkoutPlan ORDER BY createdAt DESC"
        : "SELECT id, userId, name, description, daysPerWeek, level, weeks, goal, label, isActive, createdAt, updatedAt FROM WorkoutPlan WHERE userId = ? OR userId IS NULL ORDER BY createdAt DESC",
      req.user!.role === "ADMIN" ? [] : [req.user!.id]
    );

    if (plans.length > 0) {
      const planIds = plans.map(p => p.id);
      const [exercises] = await db.query<any[]>(
        `SELECT we.*, 
                e.id as e_id, e.name as e_name, e.category as e_category, e.difficulty as e_difficulty, 
                e.description as e_description, e.instructions as e_instructions, e.muscleGroups as e_muscleGroups, 
                e.imageUrl as e_imageUrl, e.videoUrl as e_videoUrl
         FROM WorkoutExercise we 
         JOIN Exercise e ON we.exerciseId = e.id 
         WHERE we.planId IN (?) 
         ORDER BY we.day ASC, we.orderIndex ASC`,
        [planIds]
      );

      const exercisesByPlan: Record<number, any[]> = {};
      for (const row of exercises) {
        if (!exercisesByPlan[row.planId]) exercisesByPlan[row.planId] = [];
        
        const exerciseData = {
          id: row.e_id,
          name: row.e_name,
          category: row.e_category,
          difficulty: row.e_difficulty,
          description: row.e_description,
          instructions: row.e_instructions,
          muscleGroups: row.e_muscleGroups,
          imageUrl: row.e_imageUrl,
          videoUrl: row.e_videoUrl
        };
        
        exercisesByPlan[row.planId].push({
          id: row.id,
          planId: row.planId,
          exerciseId: row.exerciseId,
          sets: row.sets,
          reps: row.reps,
          restSecs: row.restSecs,
          day: row.day,
          orderIndex: row.orderIndex,
          createdAt: row.createdAt,
          exercise: exerciseData
        });
      }

      for (const plan of plans) {
        (plan as any).exercises = exercisesByPlan[plan.id] || [];
      }
    }

    res.json({ success: true, data: plans });
  } catch (err) {
    next(err);
  }
};

export const getPlan = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const [plans] = await db.query<WorkoutPlanRow[] & { length: number }>(
      "SELECT id, userId, name, description, daysPerWeek, level, weeks, goal, label, isActive, createdAt, updatedAt FROM WorkoutPlan WHERE id = ? AND (userId = ? OR userId IS NULL)",
      [parseInt(req.params.id), req.user!.id]
    );

    const plan = plans[0];
    if (!plan) {
      res.status(404).json({ success: false, message: "Plan not found" });
      return;
    }

    const [exercises] = await db.query<any[]>(
      `SELECT we.*, 
              e.id as e_id, e.name as e_name, e.category as e_category, e.difficulty as e_difficulty, 
              e.description as e_description, e.instructions as e_instructions, e.muscleGroups as e_muscleGroups, 
              e.imageUrl as e_imageUrl, e.videoUrl as e_videoUrl
       FROM WorkoutExercise we 
       JOIN Exercise e ON we.exerciseId = e.id 
       WHERE we.planId = ? 
       ORDER BY we.day ASC, we.orderIndex ASC`,
      [plan.id]
    );

    (plan as any).exercises = exercises.map(row => ({
      id: row.id,
      planId: row.planId,
      exerciseId: row.exerciseId,
      sets: row.sets,
      reps: row.reps,
      restSecs: row.restSecs,
      day: row.day,
      orderIndex: row.orderIndex,
      createdAt: row.createdAt,
      exercise: {
        id: row.e_id,
        name: row.e_name,
        category: row.e_category,
        difficulty: row.e_difficulty,
        description: row.e_description,
        instructions: row.e_instructions,
        muscleGroups: row.e_muscleGroups,
        imageUrl: row.e_imageUrl,
        videoUrl: row.e_videoUrl
      }
    }));

    res.json({ success: true, data: plan });
  } catch (err) {
    next(err);
  }
};

export const createPlan = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const body = createPlanSchema.parse(req.body);
    const isTrainerOrAdmin = req.user!.role === "TRAINER" || req.user!.role === "ADMIN";

    // Trainers/admins can assign to a specific user or make public (null userId)
    // Regular users always get the plan assigned to themselves
    let assignedUserId: number | null;
    if (isTrainerOrAdmin) {
      if (body.isPublic) {
        assignedUserId = null;
      } else {
        assignedUserId = body.targetUserId !== undefined ? body.targetUserId : req.user!.id;
      }
    } else {
      assignedUserId = req.user!.id;
    }

    const [result] = await db.query<ResultSetHeader>(
      `INSERT INTO WorkoutPlan (userId, name, description, daysPerWeek, level, weeks, goal, label) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        assignedUserId,
        body.name,
        body.description ?? null,
        body.daysPerWeek ?? 3,
        body.level ?? "Intermediate",
        body.weeks ?? 12,
        body.goal ?? "Fitness",
        body.label ?? null,
      ]
    );
    
    const [rows] = await db.query<WorkoutPlanRow[] & { length: number }>(
      "SELECT * FROM WorkoutPlan WHERE id = ?",
      [result.insertId]
    );
    
    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
};

export const updatePlan = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const body = createPlanSchema
      .partial()
      .merge(z.object({ isActive: z.boolean().optional() }))
      .parse(req.body);

    const fields: string[] = [];
    const values: any[] = [];
    
    if (body.name !== undefined) { fields.push("name = ?"); values.push(body.name); }
    if (body.description !== undefined) { fields.push("description = ?"); values.push(body.description); }
    if (body.daysPerWeek !== undefined) { fields.push("daysPerWeek = ?"); values.push(body.daysPerWeek); }
    if (body.level !== undefined) { fields.push("level = ?"); values.push(body.level); }
    if (body.weeks !== undefined) { fields.push("weeks = ?"); values.push(body.weeks); }
    if (body.goal !== undefined) { fields.push("goal = ?"); values.push(body.goal); }
    if (body.label !== undefined) { fields.push("label = ?"); values.push(body.label); }
    if (body.isActive !== undefined) { fields.push("isActive = ?"); values.push(body.isActive ? 1 : 0); }

    // Trainers/admins can reassign or change visibility
    const isTrainerOrAdmin = req.user!.role === "TRAINER" || req.user!.role === "ADMIN";
    if (isTrainerOrAdmin && body.isPublic !== undefined) {
      if (body.isPublic) {
        fields.push("userId = NULL");
      } else if (body.targetUserId !== undefined) {
        fields.push("userId = ?");
        values.push(body.targetUserId);
      }
    }

    if (fields.length > 0) {
      const planId = parseInt(req.params.id);
      // Trainers/admins can update any plan; users can only update their own
      if (isTrainerOrAdmin) {
        values.push(planId);
        const [result] = await db.query<ResultSetHeader>(
          `UPDATE WorkoutPlan SET ${fields.join(', ')} WHERE id = ?`,
          values
        );
        if (result.affectedRows === 0) {
          res.status(404).json({ success: false, message: "Plan not found" });
          return;
        }
      } else {
        values.push(planId, req.user!.id);
        const [result] = await db.query<ResultSetHeader>(
          `UPDATE WorkoutPlan SET ${fields.join(', ')} WHERE id = ? AND userId = ?`,
          values
        );
        if (result.affectedRows === 0) {
          res.status(404).json({ success: false, message: "Plan not found" });
          return;
        }
      }
    }
    
    res.json({ success: true, message: "Plan updated" });
  } catch (err) {
    next(err);
  }
};

export const deletePlan = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const isTrainerOrAdmin = req.user!.role === "TRAINER" || req.user!.role === "ADMIN";
    let result;
    if (isTrainerOrAdmin) {
      [result] = await db.query<ResultSetHeader>(
        "DELETE FROM WorkoutPlan WHERE id = ?",
        [parseInt(req.params.id)]
      );
    } else {
      [result] = await db.query<ResultSetHeader>(
        "DELETE FROM WorkoutPlan WHERE id = ? AND userId = ?",
        [parseInt(req.params.id), req.user!.id]
      );
    }
    if ((result as ResultSetHeader).affectedRows === 0) {
      res.status(404).json({ success: false, message: "Plan not found" });
      return;
    }
    res.json({ success: true, message: "Plan deleted" });
  } catch (err) {
    next(err);
  }
};

export const addExerciseToPlan = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const body = addExerciseSchema.parse(req.body);
    const planId = parseInt(req.params.id);
    
    // Trainers can add exercises to plans they own or public plans they created
    const [plans] = await db.query<WorkoutPlanRow[] & { length: number }>(
      "SELECT id FROM WorkoutPlan WHERE id = ? AND (userId = ? OR userId IS NULL)",
      [planId, req.user!.id]
    );
    
    const plan = plans[0];
    if (!plan) {
      res.status(404).json({ success: false, message: "Plan not found" });
      return;
    }

    const [result] = await db.query<ResultSetHeader>(
      `INSERT INTO WorkoutExercise (planId, exerciseId, sets, reps, restSecs, day, orderIndex)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [plan.id, body.exerciseId, body.sets, body.reps, body.restSecs ?? 60, body.day, body.orderIndex ?? 0]
    );

    const [exercises] = await db.query<any[]>(
      `SELECT we.*, 
              e.id as e_id, e.name as e_name, e.category as e_category, e.difficulty as e_difficulty, 
              e.description as e_description, e.instructions as e_instructions, e.muscleGroups as e_muscleGroups, 
              e.imageUrl as e_imageUrl, e.videoUrl as e_videoUrl
       FROM WorkoutExercise we 
       JOIN Exercise e ON we.exerciseId = e.id 
       WHERE we.id = ?`,
      [result.insertId]
    );
    
    const row = exercises[0];
    const we = {
      id: row.id, planId: row.planId, exerciseId: row.exerciseId, sets: row.sets, reps: row.reps, 
      restSecs: row.restSecs, day: row.day, orderIndex: row.orderIndex, createdAt: row.createdAt,
      exercise: {
        id: row.e_id, name: row.e_name, category: row.e_category, difficulty: row.e_difficulty, 
        description: row.e_description, instructions: row.e_instructions, muscleGroups: row.e_muscleGroups, 
        imageUrl: row.e_imageUrl, videoUrl: row.e_videoUrl
      }
    };

    res.status(201).json({ success: true, data: we });
  } catch (err) {
    next(err);
  }
};

export const removeExerciseFromPlan = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    await db.query("DELETE FROM WorkoutExercise WHERE id = ?", [parseInt(req.params.exerciseId)]);
    res.json({ success: true, message: "Exercise removed from plan" });
  } catch (err) {
    next(err);
  }
};

// Replace all exercises for a plan in one shot (used by the trainer weekly schedule builder)
export const replaceExercises = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const planId = parseInt(req.params.id);
    const { exercises } = req.body as {
      exercises: Array<{
        exerciseId: number;
        sets: number;
        reps: number;
        restSecs?: number;
        day: number;
        orderIndex?: number;
      }>;
    };

    if (!Array.isArray(exercises)) {
      res.status(400).json({ success: false, message: "exercises must be an array" });
      return;
    }

    // Verify the requester owns this plan (or it's public and they created it)
    const isTrainerOrAdmin = req.user!.role === "TRAINER" || req.user!.role === "ADMIN";
    const [plans] = await db.query<WorkoutPlanRow[] & { length: number }>(
      isTrainerOrAdmin
        ? "SELECT id FROM WorkoutPlan WHERE id = ? AND (userId = ? OR userId IS NULL)"
        : "SELECT id FROM WorkoutPlan WHERE id = ? AND userId = ?",
      [planId, req.user!.id]
    );
    if (!plans[0]) {
      res.status(404).json({ success: false, message: "Plan not found" });
      return;
    }

    // Wipe existing exercises then insert fresh set
    await db.query("DELETE FROM WorkoutExercise WHERE planId = ?", [planId]);

    for (let i = 0; i < exercises.length; i++) {
      const ex = exercises[i];
      await db.query(
        `INSERT INTO WorkoutExercise (planId, exerciseId, sets, reps, restSecs, day, orderIndex)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [planId, ex.exerciseId, ex.sets, ex.reps, ex.restSecs ?? 60, ex.day, ex.orderIndex ?? i]
      );
    }

    res.json({ success: true, message: "Exercises updated" });
  } catch (err) {
    next(err);
  }
};
