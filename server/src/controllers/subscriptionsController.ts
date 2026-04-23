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
    id: "basic",
    name: "Basic",
    price: 29.99,
    features: [
      "Gym floor access (6AM – 10PM)",
      "Free weights & machines",
      "Cardio zone",
      "Changing rooms & lockers",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 59.99,
    features: [
      "Gym floor access (24/7)",
      "Unlimited group fitness classes",
      "Swimming pool & jacuzzi",
      "Sauna & steam room",
    ],
  },
  {
    id: "elite",
    name: "VIP Elite",
    price: 99.99,
    features: [
      "Everything in Pro",
      "4× personal trainer sessions / mo",
      "Monthly nutrition consultation",
      "Guest passes (4/month)",
    ],
  },
];

const subscribeSchema = z.object({
  plan: z.enum(["free", "basic", "pro", "elite"]),
  billingCycle: z.enum(["monthly", "annual"]).default("monthly"),
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
    const { plan, billingCycle } = subscribeSchema.parse(req.body);
    
    // Set expiresAt based on billing cycle
    const expiresAt = new Date();
    if (billingCycle === "annual") {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    } else {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    }

    await db.query(
      `INSERT INTO Subscription (userId, plan, status, billingCycle, autoRenew, startsAt, expiresAt) 
       VALUES (?, ?, 'active', ?, true, NOW(), ?) 
       ON DUPLICATE KEY UPDATE 
        plan = VALUES(plan), 
        status = VALUES(status), 
        billingCycle = VALUES(billingCycle),
        expiresAt = VALUES(expiresAt)`,
      [req.user!.id, plan, billingCycle, expiresAt]
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

export const cancelSubscription = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    await db.query(
      "UPDATE Subscription SET autoRenew = false WHERE userId = ?",
      [req.user!.id]
    );
    res.json({ success: true, message: "Subscription cancelled successfully. It will remain active until the end of the billing period." });
  } catch (err) {
    next(err);
  }
};
