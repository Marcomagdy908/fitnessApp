import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { db } from "../services/db";
import { UserRow } from "../types/db";

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    res
      .status(401)
      .json({ success: false, message: "Not authorized — no token" });
    return;
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as { id: number };
    const [rows] = await db.query<UserRow[] & { length: number }>(
      "SELECT id, email, role FROM User WHERE id = ?",
      [decoded.id]
    );
    const user = rows[0];

    if (!user) {
      res
        .status(401)
        .json({ success: false, message: "Not authorized — user not found" });
      return;
    }

    req.user = user;
    next();
  } catch {
    res
      .status(401)
      .json({ success: false, message: "Not authorized — invalid token" });
  }
};

export const adminOnly = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
  if (req.user?.role !== "ADMIN") {
    res
      .status(403)
      .json({ success: false, message: "Forbidden — admin access only" });
    return;
  }
  next();
};

export const trainerOnly = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
  if (req.user?.role !== "TRAINER" && req.user?.role !== "ADMIN") {
    res
      .status(403)
      .json({ success: false, message: "Forbidden — trainer access only" });
    return;
  }
  next();
};
