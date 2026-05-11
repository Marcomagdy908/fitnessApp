import { Response, NextFunction } from "express";
import { z } from "zod";
import { db } from "../services/db";
import { AuthRequest } from '../middleware/auth';
import { MealLogRow, AlternativeMealRow, DietPlanRow, DietPlanMealRow } from '../types/db';
import { ResultSetHeader } from 'mysql2';

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

export const getAlternativeMeals = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { injury } = req.query as { injury?: string };
    let query = 'SELECT * FROM AlternativeMeal';
    const params: any[] = [];
    if (injury) {
      query += ' WHERE injuryType = ?';
      params.push(injury);
    }
    query += ' ORDER BY injuryType ASC, id ASC';
    const [meals] = await db.query<AlternativeMealRow[] & { length: number }>(query, params);
    res.json({ success: true, data: meals });
  } catch (err) {
    next(err);
  }
};
export const getDietPlans = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Trainers see plans they created + public plans. Admins see everything.
    const [plans] = await db.query<DietPlanRow[]>(
      req.user!.role === "ADMIN"
        ? "SELECT * FROM DietPlan ORDER BY createdAt DESC"
        : "SELECT * FROM DietPlan WHERE userId = ? OR userId IS NULL ORDER BY createdAt DESC",
      req.user!.role === "ADMIN" ? [] : [req.user!.id]
    );
    const plansWithMeals = await Promise.all(
      plans.map(async (plan) => {
        const [meals] = await db.query<DietPlanMealRow[]>(
          "SELECT * FROM DietPlanMeal WHERE dietPlanId = ? ORDER BY id ASC",
          [plan.id]
        );

        const mealsWithParsedFoods = meals.map((m) => {
          let mFoods = [];
          try {
            mFoods = typeof m.foods === 'string' ? JSON.parse(m.foods) : (m.foods || []);
          } catch (e) {
            mFoods = [m.foods];
          }
          return { ...m, foods: mFoods };
        });

        return {
          ...plan,
          meals: mealsWithParsedFoods,
        };
      })
    );
    res.json({ success: true, data: plansWithMeals });
  } catch (err) {
    next(err);
  }
};

export const createDietPlan = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { planId, name, goal, description, calories, protein, carbs, fat,
            meals, targetUserId, isPublic } = req.body;

    const isTrainerOrAdmin = req.user!.role === "TRAINER" || req.user!.role === "ADMIN";
    let assignedUserId: number | null;
    if (isTrainerOrAdmin) {
      assignedUserId = isPublic ? null : (targetUserId ?? req.user!.id);
    } else {
      assignedUserId = req.user!.id;
    }

    const [result] = await db.query<ResultSetHeader>(
      `INSERT INTO DietPlan (userId, planId, name, goal, description, calories, protein, carbs, fat)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [assignedUserId, planId || name.toLowerCase().replace(/\s+/g, '-'), name, goal || 'General',
       description || '', calories || 0, protein || 0, carbs || 0, fat || 0]
    );

    const dietPlanId = result.insertId;
    if (meals && Array.isArray(meals)) {
      for (const m of meals) {
        await db.query(
          `INSERT INTO DietPlanMeal (dietPlanId, time, name, foods, calories, protein, carbs, fat) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [dietPlanId, m.time || '', m.name, JSON.stringify(Array.isArray(m.foods) ? m.foods : [m.name]), m.calories || 0, m.protein || 0, m.carbs || 0, m.fat || 0]
        );
      }
    }

    const [rows] = await db.query<DietPlanRow[]>("SELECT * FROM DietPlan WHERE id = ?", [dietPlanId]);
    const [mealRows] = await db.query<DietPlanMealRow[]>("SELECT * FROM DietPlanMeal WHERE dietPlanId = ? ORDER BY id ASC", [dietPlanId]);
    
    const processedMeals = mealRows.map(m => {
      let mFoods = [];
      try {
        mFoods = typeof m.foods === 'string' ? JSON.parse(m.foods) : (m.foods || []);
      } catch (e) {
        mFoods = [m.foods];
      }
      return { ...m, foods: mFoods };
    });

    res.status(201).json({ success: true, data: { ...rows[0], meals: processedMeals } });
  } catch (err) {
    next(err);
  }
};

export const updateDietPlan = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, goal, description, calories, protein, carbs, fat,
            meals, targetUserId, isPublic } = req.body;

    const isTrainerOrAdmin = req.user!.role === "TRAINER" || req.user!.role === "ADMIN";
    
    const fields: string[] = [];
    const values: any[] = [];
    if (name !== undefined) { fields.push("name = ?"); values.push(name); }
    if (goal !== undefined) { fields.push("goal = ?"); values.push(goal); }
    if (description !== undefined) { fields.push("description = ?"); values.push(description); }
    if (calories !== undefined) { fields.push("calories = ?"); values.push(calories); }
    if (protein !== undefined) { fields.push("protein = ?"); values.push(protein); }
    if (carbs !== undefined) { fields.push("carbs = ?"); values.push(carbs); }
    if (fat !== undefined) { fields.push("fat = ?"); values.push(fat); }
    if (isTrainerOrAdmin && isPublic !== undefined) {
      if (isPublic) { fields.push("userId = NULL"); }
      else if (targetUserId !== undefined) { fields.push("userId = ?"); values.push(targetUserId); }
    }

    if (fields.length > 0) {
      values.push(id);
      await db.query(`UPDATE DietPlan SET ${fields.join(", ")} WHERE id = ?`, values);
    }

    // Replace meals if provided
    if (meals && Array.isArray(meals)) {
      await db.query("DELETE FROM DietPlanMeal WHERE dietPlanId = ?", [id]);
      for (const m of meals) {
        await db.query(
          `INSERT INTO DietPlanMeal (dietPlanId, time, name, foods, calories, protein, carbs, fat) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [id, m.time || '', m.name, JSON.stringify(Array.isArray(m.foods) ? m.foods : [m.name]), m.calories || 0, m.protein || 0, m.carbs || 0, m.fat || 0]
        );
      }
    }

    res.json({ success: true, message: "Diet plan updated" });
  } catch (err) {
    next(err);
  }
};

export const deleteDietPlan = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const isTrainerOrAdmin = req.user!.role === "TRAINER" || req.user!.role === "ADMIN";
    const [result] = await db.query<ResultSetHeader>(
      isTrainerOrAdmin
        ? "DELETE FROM DietPlan WHERE id = ?"
        : "DELETE FROM DietPlan WHERE id = ? AND userId = ?",
      isTrainerOrAdmin ? [id] : [id, req.user!.id]
    );
    if ((result as ResultSetHeader).affectedRows === 0) {
      res.status(404).json({ success: false, message: "Diet plan not found" });
      return;
    }
    res.json({ success: true, message: "Diet plan deleted" });
  } catch (err) {
    next(err);
  }
};
export const getNutritionTips = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const [tips] = await db.query<any[]>("SELECT * FROM NutritionTip");
    // Shuffle and pick 3
    const shuffled = [...tips].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3);
    res.json({ success: true, data: selected });
  } catch (err) {
    next(err);
  }
};
