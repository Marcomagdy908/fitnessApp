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
