import { Response, NextFunction } from "express";
import { db } from "../services/db";
import { AuthRequest } from "../middleware/auth";
import { ResultSetHeader } from "mysql2";
import { z } from "zod";

const injurySchema = z.object({
  type: z.string().min(1),
  description: z.string().optional().nullable(),
  severity: z.enum(["mild", "moderate", "severe"]).default("moderate"),
  status: z.enum(["active", "recovering", "healed"]).default("active"),
});

export const getMyInjuries = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const [rows] = await db.query<any[] & { length: number }>(
      "SELECT * FROM Injury WHERE userId = ? ORDER BY createdAt DESC",
      [req.user!.id]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};

export const addInjury = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const body = injurySchema.parse(req.body);
    const [result] = await db.query<ResultSetHeader>(
      "INSERT INTO Injury (userId, type, description, severity, status) VALUES (?, ?, ?, ?, ?)",
      [req.user!.id, body.type, body.description, body.severity, body.status]
    );

    res.json({
      success: true,
      data: { id: result.insertId, userId: req.user!.id, ...body },
    });
  } catch (err) {
    next(err);
  }
};

export const updateInjury = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const body = injurySchema.partial().parse(req.body);

    const fields: string[] = [];
    const values: any[] = [];

    if (body.type) { fields.push("type = ?"); values.push(body.type); }
    if (body.description !== undefined) { fields.push("description = ?"); values.push(body.description); }
    if (body.severity) { fields.push("severity = ?"); values.push(body.severity); }
    if (body.status) { fields.push("status = ?"); values.push(body.status); }

    if (fields.length === 0) {
      res.status(400).json({ success: false, message: "No fields to update" });
      return;
    }

    values.push(id, req.user!.id);
    const [result] = await db.query<ResultSetHeader>(
      `UPDATE Injury SET ${fields.join(", ")} WHERE id = ? AND userId = ?`,
      values
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ success: false, message: "Injury not found" });
      return;
    }

    res.json({ success: true, message: "Injury updated" });
  } catch (err) {
    next(err);
  }
};

export const deleteInjury = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const [result] = await db.query<ResultSetHeader>(
      "DELETE FROM Injury WHERE id = ? AND userId = ?",
      [id, req.user!.id]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ success: false, message: "Injury not found" });
      return;
    }

    res.json({ success: true, message: "Injury deleted" });
  } catch (err) {
    next(err);
  }
};
