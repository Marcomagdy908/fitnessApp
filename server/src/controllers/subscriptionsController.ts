import { Response, NextFunction } from "express";
import { z } from "zod";
import { db } from "../services/db";
import { AuthRequest } from "../middleware/auth";
import { SubscriptionRow } from "../types/db";

const subscribeSchema = z.object({
  plan: z.string(),
  billingCycle: z.enum(["monthly", "annual"]).default("monthly"),
  paymentMethod: z.string().optional(),
  transactionRef: z.string().optional(),
  amount: z.number().optional(),
});

export const getSubscriptionPlans = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const [plans] = await db.query<any[]>("SELECT * FROM SubscriptionPlan");
    const [benefits] = await db.query<any[]>("SELECT * FROM SubscriptionBenefit");
    
    const data = plans.map(p => ({
      ...p,
      id: p.planId, // Align with frontend expectations
      features: benefits
        .filter(b => b.planId === p.planId)
        .map(b => ({ text: b.benefitText, included: !!b.isIncluded }))
    }));

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
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
    const { plan, billingCycle, paymentMethod, transactionRef, amount } = subscribeSchema.parse(req.body);
    
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

    const [subRows] = await db.query<any[]>("SELECT id FROM Subscription WHERE userId = ?", [req.user!.id]);
    const subscriptionId = subRows[0]?.id;

    // Record Payment if provided
    if (transactionRef && subscriptionId) {
      await db.query(
        `INSERT INTO Payment (userId, bookingId, bookingType, amount, status, method, transactionRef, paidAt)
         VALUES (?, ?, 'subscription', ?, 'completed', ?, ?, NOW())`,
        [req.user!.id, subscriptionId, amount || 0, paymentMethod || 'card', transactionRef]
      );
    }

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
