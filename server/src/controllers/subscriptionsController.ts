import { Response, NextFunction } from "express";
import { z } from "zod";
import { db } from "../services/db";
import { AuthRequest } from "../middleware/auth";
import { SubscriptionRow } from "../types/db";

const subscribeSchema = z.object({
  planId: z.string(),
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

    const data = plans.map(p => {
      let planBenefits = [];
      if (p.benefits) {
        planBenefits = typeof p.benefits === 'string' ? JSON.parse(p.benefits) : p.benefits;
      }
      return {
        ...p,
        id: p.planId, // Align with frontend expectations
        features: planBenefits.map((b: any) => ({ 
          text: b.text || b.benefitText, 
          included: b.included !== undefined ? !!b.included : true 
        }))
      };
    });

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
    const data = rows[0] ? { ...rows[0], plan: rows[0].planId } : null;
    res.json({ success: true, data });
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
    const { planId, billingCycle, paymentMethod, transactionRef, amount } = subscribeSchema.parse(req.body);

    // Set expiresAt based on billing cycle
    const expiresAt = new Date();
    if (billingCycle === "annual") {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    } else {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    }

    await db.query(
      `INSERT INTO Subscription (userId, planId, status, billingCycle, autoRenew, startsAt, expiresAt) 
       VALUES (?, ?, 'active', ?, true, NOW(), ?) 
       ON DUPLICATE KEY UPDATE 
        planId = VALUES(planId), 
        status = VALUES(status), 
        billingCycle = VALUES(billingCycle),
        expiresAt = VALUES(expiresAt)`,
      [req.user!.id, planId, billingCycle, expiresAt]
    );

    const [subRows] = await db.query<any[]>("SELECT id FROM Subscription WHERE userId = ?", [req.user!.id]);
    const subscriptionId = subRows[0]?.id;

    // Record Payment if provided
    if (transactionRef && subscriptionId) {
      await db.query(
        `INSERT INTO Payment (subscriptionId, amount, status, method, transactionRef, paidAt)
         VALUES (?, ?, 'completed', ?, ?, NOW())`,
        [subscriptionId, amount || 0, paymentMethod || 'card', transactionRef]
      );
    }

    const [rows] = await db.query<SubscriptionRow[] & { length: number }>(
      "SELECT * FROM Subscription WHERE userId = ?",
      [req.user!.id]
    );

    const data = rows[0] ? { ...rows[0], plan: rows[0].planId } : null;
    res.json({ success: true, data });
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
