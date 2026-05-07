import { Response, NextFunction } from "express";
import { z } from "zod";
import { db } from "../services/db";
import { AuthRequest } from "../middleware/auth";
import { UserRow } from "../types/db";

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  username: z.string().min(3).optional(),
  avatar: z.string().url().optional(),
  theme: z.enum(["light", "dark"]).optional(),
});

const adminUpdateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  role: z.enum(["USER", "ADMIN", "TRAINER"]).optional(),
  avatar: z.string().url().optional(),
  subscriptionPlan: z.string().optional(),
  maxVisits: z.number().optional(),
  usedVisits: z.number().optional(),
  theme: z.enum(["light", "dark"]).optional(),
});

export const getProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const [rows] = await db.query<UserRow[] & { length: number }>(
      "SELECT id, name, username, email, role, avatar, theme, createdAt FROM User WHERE id = ?",
      [req.user!.id],
    );
    res.json({ success: true, user: rows[0] });
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const body = updateProfileSchema.parse(req.body);

    // Build dynamic UPDATE query
    const fields: string[] = [];
    const values: any[] = [];
    if (body.name !== undefined) {
      fields.push("name = ?");
      values.push(body.name);
    }
    if (body.username !== undefined) {
      fields.push("username = ?");
      values.push(body.username);
    }
    if (body.avatar !== undefined) {
      fields.push("avatar = ?");
      values.push(body.avatar);
    }
    if (body.theme !== undefined) {
      fields.push("theme = ?");
      values.push(body.theme);
    }

    if (fields.length > 0) {
      values.push(req.user!.id);
      await db.query(
        `UPDATE User SET ${fields.join(", ")} WHERE id = ?`,
        values,
      );
    }

    const [rows] = await db.query<UserRow[] & { length: number }>(
      "SELECT id, name, username, email, role, avatar, theme, updatedAt FROM User WHERE id = ?",
      [req.user!.id],
    );
    res.json({ success: true, user: rows[0] });
  } catch (err) {
    next(err);
  }
};

export const getAllUsers = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const [rows] = await db.query<UserRow[] & { length: number }>(
      `SELECT u.id, u.name, u.username, u.email, u.role, u.avatar, u.subscriptionPlan, u.theme, u.createdAt,
              s.maxVisits, s.usedVisits
       FROM User u
       LEFT JOIN Subscription s ON u.id = s.userId
       ORDER BY u.createdAt DESC`,
    );
    res.json({ success: true, users: rows });
  } catch (err) {
    next(err);
  }
};

export const adminUpdateUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const body = adminUpdateUserSchema.parse(req.body);

    const fields: string[] = [];
    const values: any[] = [];

    if (body.name !== undefined) {
      fields.push("name = ?");
      values.push(body.name);
    }
    if (body.email !== undefined) {
      fields.push("email = ?");
      values.push(body.email);
    }
    if (body.role !== undefined) {
      fields.push("role = ?");
      values.push(body.role);
    }
    if (body.avatar !== undefined) {
      fields.push("avatar = ?");
      values.push(body.avatar);
    }
    if (body.subscriptionPlan !== undefined) {
      fields.push("subscriptionPlan = ?");
      values.push(body.subscriptionPlan);
    }
    if (body.theme !== undefined) {
      fields.push("theme = ?");
      values.push(body.theme);
    }

    if (fields.length > 0) {
      values.push(id);
      await db.query(
        `UPDATE User SET ${fields.join(", ")} WHERE id = ?`,
        values,
      );
    }

    // Update Subscription visits if provided
    if (body.maxVisits !== undefined || body.usedVisits !== undefined) {
      const subFields: string[] = [];
      const subValues: any[] = [];
      if (body.maxVisits !== undefined) {
        subFields.push("maxVisits = ?");
        subValues.push(body.maxVisits);
      }
      if (body.usedVisits !== undefined) {
        subFields.push("usedVisits = ?");
        subValues.push(body.usedVisits);
      }
      subValues.push(id);
      await db.query(
        `UPDATE Subscription SET ${subFields.join(", ")} WHERE userId = ?`,
        subValues,
      );
    }

    const [rows] = await db.query<UserRow[] & { length: number }>(
      `SELECT u.id, u.name, u.username, u.email, u.role, u.avatar, u.subscriptionPlan, u.theme, u.updatedAt,
              s.maxVisits, s.usedVisits
       FROM User u
       LEFT JOIN Subscription s ON u.id = s.userId
       WHERE u.id = ?`,
      [id],
    );
    res.json({ success: true, user: rows[0] });
  } catch (err) {
    next(err);
  }
};

export const getUserBenefits = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    // Get user's current plan first
    const [userRows] = await db.query<UserRow[] & { length: number }>(
      "SELECT subscriptionPlan FROM User WHERE id = ?",
      [id]
    );
    if (userRows.length === 0) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }
    const planId = userRows[0].subscriptionPlan;

    // Get all benefits for this plan, joining with user-specific tracking data
    const [rows] = await db.query(
      `SELECT sb.id as benefitId, sb.benefitText, sb.planId, 
              ub.id as userBenefitId, 
              COALESCE(ub.usedCount, 0) as usedCount, 
              COALESCE(ub.maxCount, 0) as maxCount, 
              ub.expiresAt
       FROM SubscriptionBenefit sb
       LEFT JOIN UserBenefit ub ON sb.id = ub.benefitId AND ub.userId = ?
       WHERE sb.planId = ?`,
      [id, planId]
    );
    res.json({ success: true, benefits: rows });
  } catch (err) {
    next(err);
  }
};

export const updateUserBenefit = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { benefitId, usedCount, maxCount, expiresAt } = req.body;
    
    await db.query(
      `INSERT INTO UserBenefit (userId, benefitId, usedCount, maxCount, expiresAt)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE usedCount = VALUES(usedCount), maxCount = VALUES(maxCount), expiresAt = VALUES(expiresAt)`,
      [id, benefitId, usedCount, maxCount, expiresAt]
    );
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
