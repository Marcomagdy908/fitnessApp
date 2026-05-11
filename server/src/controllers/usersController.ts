import { Response, NextFunction } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "../services/db";
import { AuthRequest } from "../middleware/auth";
import { UserRow } from "../types/db";
import { ResultSetHeader } from "mysql2";

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  username: z.string().min(0).optional(),
  avatar: z.string().url().optional(),
  theme: z.enum(["light", "dark"]).optional(),
});

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
});

const adminUpdateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  role: z.enum(["USER", "ADMIN", "TRAINER"]).optional(),
  avatar: z.string().url().optional(),
  subscriptionPlan: z.string().optional(),
  maxVisits: z.number().optional(),
  usedVisits: z.number().optional(),
  theme: z.enum(["light", "dark"]).optional(),
});

export const getProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const [rows] = await db.query<any[] & { length: number }>(
      `SELECT u.id, u.name, u.username, u.email, u.role, u.avatar, u.theme, u.createdAt, t.id as trainerId 
       FROM User u 
       LEFT JOIN Trainer t ON u.id = t.userId 
       WHERE u.id = ?`,
      [req.user!.id],
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
    if (body.theme !== undefined) {
      fields.push("theme = ?");
      values.push(body.theme);
    }

    if (fields.length > 0) {
      values.push(req.user!.id);
      await db.query(
        `UPDATE User SET ${fields.join(", ")} WHERE id = ?`,
        values,
      );
    }

    const [rows] = await db.query<any[] & { length: number }>(
      `SELECT u.id, u.name, u.username, u.email, u.role, u.avatar, u.theme, u.updatedAt, t.id as trainerId 
       FROM User u 
       LEFT JOIN Trainer t ON u.id = t.userId 
       WHERE u.id = ?`,
      [req.user!.id],
    );
    res.json({ success: true, user: rows[0] });
  } catch (err) {
    next(err);
  }
};

export const getAllUsers = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const [rows] = await db.query<any[] & { length: number }>(
      `SELECT u.id, u.name, u.username, u.email, u.role, u.avatar, u.theme, u.createdAt,
              COALESCE(s.planId, 'free') as subscriptionPlan,
              s.maxVisits, s.usedVisits
       FROM User u
       LEFT JOIN Subscription s ON u.id = s.userId
       ORDER BY u.createdAt DESC`,
    );
    res.json({ success: true, users: rows });
  } catch (err) {
    next(err);
  }
};

export const adminUpdateUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const connection = await db.getConnection();
  await connection.beginTransaction();
  try {
    const { id } = req.params;
    const body = adminUpdateUserSchema.parse(req.body);

    const fields: string[] = [];
    const values: any[] = [];

    if (body.name !== undefined) {
      fields.push("name = ?");
      values.push(body.name);
    }
    if (body.email !== undefined) {
      fields.push("email = ?");
      values.push(body.email);
    }
    if (body.role !== undefined) {
      fields.push("role = ?");
      values.push(body.role);
    }
    if (body.avatar !== undefined) {
      fields.push("avatar = ?");
      values.push(body.avatar);
    }
    // subscriptionPlan update is handled separately below via the Subscription table
    if (body.theme !== undefined) {
      fields.push("theme = ?");
      values.push(body.theme);
    }

    if (fields.length > 0) {
      values.push(id);
      await connection.query(
        `UPDATE User SET ${fields.join(", ")} WHERE id = ?`,
        values,
      );
    }

    // Update Subscription plan/visits if provided
    if (body.subscriptionPlan !== undefined || body.maxVisits !== undefined || body.usedVisits !== undefined) {
      const subFields: string[] = [];
      const subValues: any[] = [];
      if (body.subscriptionPlan !== undefined) {
        subFields.push("planId = ?");
        subValues.push(body.subscriptionPlan);
      }
      if (body.maxVisits !== undefined) {
        subFields.push("maxVisits = ?");
        subValues.push(body.maxVisits);
      }
      if (body.usedVisits !== undefined) {
        subFields.push("usedVisits = ?");
        subValues.push(body.usedVisits);
      }
      subValues.push(id);
      
      await connection.query(
        `INSERT INTO Subscription (userId, planId, maxVisits, usedVisits, status) 
         VALUES (?, ?, ?, ?, 'active')
         ON DUPLICATE KEY UPDATE ${subFields.join(", ")}`,
        [id, body.subscriptionPlan || 'free', body.maxVisits || 0, body.usedVisits || 0, ...subValues.slice(0, -1)]
      );
    }

    // Handle Trainer Profile Creation
    if (body.role === "TRAINER") {
      const [existing] = await connection.query<any[]>(
        "SELECT id FROM Trainer WHERE userId = ?",
        [id]
      );
      if (existing.length === 0) {
        let trainerName = body.name;
        if (!trainerName) {
           const [uRows] = await connection.query<any[]>("SELECT name FROM User WHERE id = ?", [id]);
           trainerName = uRows[0]?.name || "New Trainer";
        }

        await connection.query(
          `INSERT INTO Trainer (userId, name, specialty, bio, certifications, tags) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [id, trainerName, "General Fitness", "", "[]", "[]"]
        );
      }
    }

    await connection.commit();

    const [rows] = await connection.query<any[] & { length: number }>(
      `SELECT u.id, u.name, u.username, u.email, u.role, u.avatar, u.theme, u.updatedAt,
              COALESCE(s.planId, 'free') as subscriptionPlan,
              s.maxVisits, s.usedVisits
       FROM User u
       LEFT JOIN Subscription s ON u.id = s.userId
       WHERE u.id = ?`,
      [id],
    );
    res.json({ success: true, user: rows[0] });
  } catch (err) {
    await connection.rollback();
    next(err);
  } finally {
    connection.release();
  }
};

export const getUserBenefits = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    
    // 1. Get user's current plan and its JSON benefits
    // We use COALESCE and a JOIN to ensure even users without a Subscription row get the 'free' plan benefits
    const [planRows] = await db.query<any[] & { length: number }>(
      `SELECT s.id as subscriptionId, 
              COALESCE(s.planId, 'free') as planId, 
              sp.benefits 
       FROM User u 
       LEFT JOIN Subscription s ON u.id = s.userId 
       LEFT JOIN SubscriptionPlan sp ON COALESCE(s.planId, 'free') = sp.planId
       WHERE u.id = ?`,
      [id]
    );

    if (planRows.length === 0) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    const { subscriptionId, benefits: planBenefitsJson } = planRows[0];
    
    // Safe JSON parsing: MySQL driver might return string or object
    let planBenefits = [];
    if (planBenefitsJson) {
      planBenefits = typeof planBenefitsJson === 'string' ? JSON.parse(planBenefitsJson) : planBenefitsJson;
    }

    // 2. Get user's usage tracking from UserBenefit table
    // If no subscriptionId yet, usage is obviously 0
    let usageRows: any[] = [];
    if (subscriptionId) {
      [usageRows] = await db.query<any[]>(
        "SELECT * FROM UserBenefit WHERE subscriptionId = ?",
        [subscriptionId]
      );
    }

    // 3. Merge: Map usage onto the plan templates
    const mergedBenefits = planBenefits.map((pb: any) => {
      const usage = usageRows.find(u => u.benefitKey === pb.key);
      return {
        ...pb,
        benefitId: pb.key, // UI expects benefitId, we use the key
        benefitText: pb.text || pb.benefitText || pb.key, // Map name for UI compatibility
        usedCount: usage ? usage.usedCount : 0,
        maxCount: pb.limit || pb.maxCount || 0,
        expiresAt: usage ? usage.expiresAt : null,
        isIncluded: true
      };
    });

    res.json({ success: true, benefits: mergedBenefits });
  } catch (err) {
    next(err);
  }
};

export const updateUserBenefit = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { benefitId, usedCount, maxCount, expiresAt } = req.body;
    // benefitId here refers to the benefitKey (e.g. 'pt_sessions')

    // 1. Resolve subscriptionId
    let [subRows] = await db.query<any[]>("SELECT id FROM Subscription WHERE userId = ?", [id]);
    
    // 2. If no subscription row exists, create a default 'free' one so we can track usage
    if (subRows.length === 0) {
      const [insertResult] = await db.query<ResultSetHeader>(
        "INSERT INTO Subscription (userId, planId, status) VALUES (?, 'free', 'active')",
        [id]
      );
      subRows = [{ id: insertResult.insertId }];
    }
    
    const subscriptionId = subRows[0].id;
    
    // 3. Update the benefit usage
    await db.query(
      `INSERT INTO UserBenefit (subscriptionId, benefitKey, usedCount, maxCount, expiresAt)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE usedCount = VALUES(usedCount), maxCount = VALUES(maxCount), expiresAt = VALUES(expiresAt)`,
      [subscriptionId, benefitId, usedCount, maxCount, expiresAt]
    );
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

export const updatePassword = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { currentPassword, newPassword } = updatePasswordSchema.parse(req.body);

    // Get user's current password
    const [rows] = await db.query<UserRow[] & { length: number }>(
      "SELECT password FROM User WHERE id = ?",
      [req.user!.id]
    );

    const user = rows[0];
    if (!user || !user.password) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: "Incorrect current password" });
      return;
    }

    // Hash and update new password
    const hashed = await bcrypt.hash(newPassword, 10);
    await db.query(
      "UPDATE User SET password = ? WHERE id = ?",
      [hashed, req.user!.id]
    );

    res.json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    next(err);
  }
};
