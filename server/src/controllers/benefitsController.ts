import { Response, NextFunction } from "express";
import { z } from "zod";
import { db } from "../services/db";
import { AuthRequest } from "../middleware/auth";
import { ResultSetHeader } from "mysql2";

const benefitSchema = z.object({
  planId: z.string().min(1),
  benefitText: z.string().min(1),
  isIncluded: z.boolean().default(true),
});

export const getBenefits = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM SubscriptionBenefit ORDER BY planId, id",
    );
    res.json({ success: true, benefits: rows });
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
    const [result] = await db.query<ResultSetHeader>(
      "INSERT INTO SubscriptionBenefit (planId, benefitText, isIncluded) VALUES (?, ?, ?)",
      [body.planId, body.benefitText, body.isIncluded],
    );
    res.status(201).json({ success: true, benefit: { id: result.insertId, ...body } });
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
    const { id } = req.params;
    const body = benefitSchema.parse(req.body);
    await db.query(
      "UPDATE SubscriptionBenefit SET planId = ?, benefitText = ?, isIncluded = ? WHERE id = ?",
      [body.planId, body.benefitText, body.isIncluded, id],
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
    const { id } = req.params;
    await db.query("DELETE FROM SubscriptionBenefit WHERE id = ?", [id]);
    res.json({ success: true, message: "Benefit deleted" });
  } catch (err) {
    next(err);
  }
};
