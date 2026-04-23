import { Response, NextFunction } from "express";
import { z } from "zod";
import { db } from "../services/db";
import { AuthRequest } from "../middleware/auth";
import { UserRow } from "../types/db";

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  username: z.string().min(3).optional(),
  avatar: z.string().url().optional(),
});

const adminUpdateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  role: z.enum(["USER", "ADMIN"]).optional(),
  avatar: z.string().url().optional(),
  subscriptionPlan: z.string().optional(),
  
});

export const getProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const [rows] = await db.query<UserRow[] & { length: number }>(
      "SELECT id, name, username, email, role, avatar, createdAt FROM User WHERE id = ?",
      [req.user!.id]
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

    if (fields.length > 0) {
      values.push(req.user!.id);
      await db.query(
        `UPDATE User SET ${fields.join(', ')} WHERE id = ?`,
        values
      );
    }

    const [rows] = await db.query<UserRow[] & { length: number }>(
      "SELECT id, name, username, email, role, avatar, updatedAt FROM User WHERE id = ?",
      [req.user!.id]
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
      "SELECT id, name, username, email, role, avatar, subscriptionPlan, createdAt FROM User ORDER BY createdAt DESC"
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

    if (fields.length > 0) {
      values.push(id);
      await db.query(
        `UPDATE User SET ${fields.join(', ')} WHERE id = ?`,
        values
      );
    }

    const [rows] = await db.query<UserRow[] & { length: number }>(
      "SELECT id, name, username, email, role, avatar, subscriptionPlan, updatedAt FROM User WHERE id = ?",
      [id]
    );
    res.json({ success: true, user: rows[0] });
  } catch (err) {
    next(err);
  }
};
