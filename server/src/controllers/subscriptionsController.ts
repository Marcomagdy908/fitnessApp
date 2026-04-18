import { Response, NextFunction } from "express";
import { z } from "zod";
import { db } from "../services/db";
import { AuthRequest } from "../middleware/auth";
import { SubscriptionRow } from "../types/db";

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: 0,
    features: ["Basic exercises", "Progress tracking"],
  },
  {
    id: "pro",
    name: "Pro",
    price: 9.99,
    features: [
      "All exercises",
      "Meal tracking",
      "Custom plans",
      "Trainer access",
    ],
  },
  {
    id: "elite",
    name: "Elite",
    price: 19.99,
    features: [
      "Everything in Pro",
      "Personal trainer sessions",
      "Advanced analytics",
    ],
  },
];

const subscribeSchema = z.object({
  plan: z.enum(["free", "pro", "elite"]),
});

export const getSubscriptionPlans = (
  _req: AuthRequest,
  res: Response,
): void => {
  res.json({ success: true, data: PLANS });
};

export const getMySubscription = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const [rows] = await db.query<SubscriptionRow[] & { length: number }>(
      "SELECT * FROM Subscription WHERE userId = ?",
      [req.user!.id]
    );
    res.json({ success: true, data: rows[0] ?? null });
  } catch (err) {
    next(err);
  }
};

export const subscribe = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { plan } = subscribeSchema.parse(req.body);
    await db.query(
      `INSERT INTO Subscription (userId, plan, status) 
       VALUES (?, ?, 'active') 
       ON DUPLICATE KEY UPDATE plan = VALUES(plan), status = VALUES(status)`,
      [req.user!.id, plan]
    );

    const [rows] = await db.query<SubscriptionRow[] & { length: number }>(
      "SELECT * FROM Subscription WHERE userId = ?",
      [req.user!.id]
    );
    
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
};
