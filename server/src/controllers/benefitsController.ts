import { Response, NextFunction } from "express";
import { z } from "zod";
import { db } from "../services/db";
import { AuthRequest } from "../middleware/auth";

const benefitSchema = z.object({
  planId: z.string().min(1),
  benefitText: z.string().min(1),
  isIncluded: z.boolean().default(true),
  limit: z.number().optional(),
  key: z.string().optional(),
});

export const getBenefits = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const [plans] = await db.query<any[]>("SELECT planId, benefits FROM SubscriptionPlan");
    const allBenefits: any[] = [];
    
    plans.forEach(p => {
      if (p.benefits) {
        const benefits = typeof p.benefits === 'string' ? JSON.parse(p.benefits) : p.benefits;
        benefits.forEach((b: any, index: number) => {
          allBenefits.push({
            id: `${p.planId}-${index}`, // Synthetic ID for Admin UI compatibility
            planId: p.planId,
            benefitText: b.text || b.benefitText,
            isIncluded: b.included !== undefined ? b.included : (b.isIncluded !== undefined ? b.isIncluded : true),
            limit: b.limit,
            key: b.key || `${p.planId}-${index}`
          });
        });
      }
    });
    
    res.json({ success: true, benefits: allBenefits });
  } catch (err) {
    next(err);
  }
};

export const createBenefit = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const body = benefitSchema.parse(req.body);
    
    // 1. Get existing benefits
    const [plans] = await db.query<any[]>("SELECT benefits FROM SubscriptionPlan WHERE planId = ?", [body.planId]);
    if (plans.length === 0) {
      res.status(404).json({ success: false, message: "Plan not found" });
      return;
    }

    const benefits = plans[0].benefits ? (typeof plans[0].benefits === 'string' ? JSON.parse(plans[0].benefits) : plans[0].benefits) : [];
    
    // 2. Add new benefit
    const newBenefit = {
      key: body.key || `benefit-${Date.now()}`,
      text: body.benefitText,
      included: body.isIncluded,
      limit: body.limit
    };
    benefits.push(newBenefit);

    // 3. Save back
    await db.query(
      "UPDATE SubscriptionPlan SET benefits = ? WHERE planId = ?",
      [JSON.stringify(benefits), body.planId]
    );

    res.status(201).json({ success: true, benefit: { id: `${body.planId}-${benefits.length - 1}`, ...body } });
  } catch (err) {
    next(err);
  }
};

export const updateBenefit = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params; // Expects "planId-index"
    const body = benefitSchema.parse(req.body);
    
    const [planId, indexStr] = id.split('-');
    const index = parseInt(indexStr);

    const [plans] = await db.query<any[]>("SELECT benefits FROM SubscriptionPlan WHERE planId = ?", [planId]);
    if (plans.length === 0) {
      res.status(404).json({ success: false, message: "Plan not found" });
      return;
    }

    let benefits = plans[0].benefits ? (typeof plans[0].benefits === 'string' ? JSON.parse(plans[0].benefits) : plans[0].benefits) : [];
    
    if (index >= 0 && index < benefits.length) {
      benefits[index] = {
        ...benefits[index],
        text: body.benefitText,
        included: body.isIncluded,
        limit: body.limit,
        key: body.key || benefits[index].key
      };
    } else {
       res.status(404).json({ success: false, message: "Benefit index not found" });
       return;
    }

    await db.query(
      "UPDATE SubscriptionPlan SET benefits = ? WHERE planId = ?",
      [JSON.stringify(benefits), planId]
    );

    res.json({ success: true, benefit: { id, ...body } });
  } catch (err) {
    next(err);
  }
};

export const deleteBenefit = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params; // Expects "planId-index"
    const [planId, indexStr] = id.split('-');
    const index = parseInt(indexStr);

    const [plans] = await db.query<any[]>("SELECT benefits FROM SubscriptionPlan WHERE planId = ?", [planId]);
    if (plans.length === 0) {
      res.status(404).json({ success: false, message: "Plan not found" });
      return;
    }

    let benefits = plans[0].benefits ? (typeof plans[0].benefits === 'string' ? JSON.parse(plans[0].benefits) : plans[0].benefits) : [];
    
    if (index >= 0 && index < benefits.length) {
      benefits.splice(index, 1);
    } else {
       res.status(404).json({ success: false, message: "Benefit index not found" });
       return;
    }

    await db.query(
      "UPDATE SubscriptionPlan SET benefits = ? WHERE planId = ?",
      [JSON.stringify(benefits), planId]
    );

    res.json({ success: true, message: "Benefit deleted" });
  } catch (err) {
    next(err);
  }
};
