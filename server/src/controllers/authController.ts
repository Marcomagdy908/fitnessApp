import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { db } from "../services/db";
import { env } from "../config/env";
import { AuthRequest } from "../middleware/auth";
import { UserRow } from "../types/db";
import { ResultSetHeader } from "mysql2";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function generateToken(userId: number): string {
  return jwt.sign({ id: userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });
}

function setAuthCookies(res: Response, token: string) {
  const isProduction = env.NODE_ENV === "production";
  
  res.cookie("token", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, 
  });
  res.cookie("isLoggedIn", "true", {
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export const register = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const body = registerSchema.parse(req.body);
    const [rows] = await db.query<UserRow[] & { length: number }>(
      "SELECT * FROM User WHERE email = ?",
      [body.email]
    );

    if (rows.length > 0) {
      res.status(409).json({ success: false, message: "Email already in use" });
      return;
    }

    const hashed = await bcrypt.hash(body.password, 10);
    const [result] = await db.query<ResultSetHeader>(
      "INSERT INTO User (name, email, password) VALUES (?, ?, ?)",
      [body.name, body.email, hashed]
    );

    const [newUsers] = await db.query<any[] & { length: number }>(
      `SELECT u.id, u.name, u.username, u.email, u.role, u.avatar, u.targetCalories, u.targetProtein, u.targetCarbs, u.targetFat, u.createdAt, 
              COALESCE(s.plan, 'free') as subscriptionPlan,
              t.id as trainerId 
       FROM User u 
       LEFT JOIN Trainer t ON u.id = t.userId 
       LEFT JOIN Subscription s ON u.id = s.userId
       WHERE u.id = ?`,
      [result.insertId]
    );
    const user = newUsers[0];

    const token = generateToken(user.id);
    setAuthCookies(res, token);
    res.status(201).json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

export const login = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const body = loginSchema.parse(req.body);
    const [rows] = await db.query<any[] & { length: number }>(
      `SELECT u.*, COALESCE(s.plan, 'free') as subscriptionPlan, t.id as trainerId 
       FROM User u 
       LEFT JOIN Trainer t ON u.id = t.userId 
       LEFT JOIN Subscription s ON u.id = s.userId
       WHERE u.email = ?`,
      [body.email]
    );
    
    const user = rows[0];

    if (!user || !(await bcrypt.compare(body.password, user.password || ''))) {
      res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
      return;
    }
    const token = generateToken(user.id);
    setAuthCookies(res, token);
    const { password: _, ...safeUser } = user;
    res.json({ success: true, user: safeUser });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const [rows] = await db.query<any[] & { length: number }>(
      `SELECT u.id, u.name, u.username, u.email, u.role, u.avatar, u.targetCalories, u.targetProtein, u.targetCarbs, u.targetFat, u.createdAt, 
              COALESCE(s.plan, 'free') as subscriptionPlan,
              t.id as trainerId 
       FROM User u 
       LEFT JOIN Trainer t ON u.id = t.userId 
       LEFT JOIN Subscription s ON u.id = s.userId
       WHERE u.id = ?`,
      [req.user!.id]
    );
    const user = rows[0];
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

export const logout = (req: Request, res: Response) => {
  const isProduction = env.NODE_ENV === "production";
  
  res.cookie("token", "", { 
    maxAge: 0, 
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax"
  });
  res.cookie("isLoggedIn", "", { 
    maxAge: 0,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax"
  });
  res.json({ success: true, message: "Logged out successfully" });
};
