import { Response, NextFunction } from "express";
import { db } from "../services/db";
import { AuthRequest } from "../middleware/auth";
import { ResultSetHeader } from "mysql2";
import { z } from "zod";

/* Ensure the table exists (idempotent) */
const ensureTable = async () => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS PTClient (
      id INT AUTO_INCREMENT PRIMARY KEY,
      trainerId INT NOT NULL,
      userId INT NOT NULL,
      goal VARCHAR(255) NOT NULL DEFAULT 'General Fitness',
      status VARCHAR(50) NOT NULL DEFAULT 'active',
      startDate DATE NOT NULL,
      endDate DATE DEFAULT NULL,
      sessionsPerWeek INT NOT NULL DEFAULT 3,
      progressNotes TEXT DEFAULT NULL,
      nextCheckIn DATE DEFAULT NULL,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY unique_trainer_client (trainerId, userId),
      FOREIGN KEY (trainerId) REFERENCES Trainer(id) ON DELETE CASCADE,
      FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
    )
  `);
};

ensureTable().catch(() => {});

const addClientSchema = z.object({
  clientEmail: z.string().email(),
  goal: z.string().min(1).default("General Fitness"),
  sessionsPerWeek: z.number().min(1).max(14).default(3),
  startDate: z.string(),
  endDate: z.string().optional().nullable(),
  nextCheckIn: z.string().optional().nullable(),
  progressNotes: z.string().optional().nullable(),
});

const updateClientSchema = z.object({
  goal: z.string().min(1).optional(),
  status: z.enum(["active", "paused", "completed"]).optional(),
  sessionsPerWeek: z.number().min(1).max(14).optional(),
  endDate: z.string().optional().nullable(),
  nextCheckIn: z.string().optional().nullable(),
  progressNotes: z.string().optional().nullable(),
});

/* Helper: resolve trainer from logged-in user */
async function getTrainerId(userId: number): Promise<number | null> {
  const [rows] = await db.query<any[] & { length: number }>(
    "SELECT id FROM Trainer WHERE userId = ?",
    [userId]
  );
  return rows.length > 0 ? rows[0].id : null;
}

/* GET /api/pt-clients */
export const getPTClients = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const trainerId = await getTrainerId(req.user!.id);
    if (!trainerId) {
      res.status(403).json({ success: false, message: "Trainer profile not found" });
      return;
    }

    const [rows] = await db.query<any[] & { length: number }>(
      `SELECT ptc.*, u.name as clientName, u.email as clientEmail, u.avatar as clientAvatar
       FROM PTClient ptc
       JOIN User u ON ptc.userId = u.id
       WHERE ptc.trainerId = ?
       ORDER BY ptc.startDate DESC`,
      [trainerId]
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};

/* POST /api/pt-clients — add a client by their email */
export const addPTClient = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const trainerId = await getTrainerId(req.user!.id);
    if (!trainerId) {
      res.status(403).json({ success: false, message: "Trainer profile not found" });
      return;
    }

    const body = addClientSchema.parse(req.body);

    // Look up the client by email
    const [users] = await db.query<any[] & { length: number }>(
      "SELECT id, name, email FROM User WHERE email = ?",
      [body.clientEmail]
    );

    if (users.length === 0) {
      res.status(404).json({ success: false, message: "No user found with that email" });
      return;
    }

    const client = users[0];

    const [result] = await db.query<ResultSetHeader>(
      `INSERT INTO PTClient (trainerId, userId, goal, sessionsPerWeek, startDate, endDate, nextCheckIn, progressNotes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        trainerId,
        client.id,
        body.goal,
        body.sessionsPerWeek,
        body.startDate,
        body.endDate || null,
        body.nextCheckIn || null,
        body.progressNotes || null,
      ]
    );

    res.json({
      success: true,
      data: {
        id: result.insertId,
        trainerId,
        userId: client.id,
        clientName: client.name,
        clientEmail: client.email,
        goal: body.goal,
        sessionsPerWeek: body.sessionsPerWeek,
        startDate: body.startDate,
        status: "active",
      },
    });
  } catch (err: any) {
    if (err?.code === "ER_DUP_ENTRY") {
      res.status(400).json({ success: false, message: "This client is already in your roster" });
      return;
    }
    next(err);
  }
};

/* PATCH /api/pt-clients/:id — update notes, status, etc. */
export const updatePTClient = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const trainerId = await getTrainerId(req.user!.id);
    if (!trainerId) {
      res.status(403).json({ success: false, message: "Trainer profile not found" });
      return;
    }

    const { id } = req.params;
    const updates = updateClientSchema.parse(req.body);

    // Build SET clause dynamically
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.goal !== undefined)           { fields.push("goal = ?");           values.push(updates.goal); }
    if (updates.status !== undefined)         { fields.push("status = ?");         values.push(updates.status); }
    if (updates.sessionsPerWeek !== undefined){ fields.push("sessionsPerWeek = ?");values.push(updates.sessionsPerWeek); }
    if ("endDate" in updates)                 { fields.push("endDate = ?");        values.push(updates.endDate || null); }
    if ("nextCheckIn" in updates)             { fields.push("nextCheckIn = ?");    values.push(updates.nextCheckIn || null); }
    if ("progressNotes" in updates)           { fields.push("progressNotes = ?");  values.push(updates.progressNotes || null); }

    if (fields.length === 0) {
      res.status(400).json({ success: false, message: "No fields to update" });
      return;
    }

    values.push(id, trainerId);
    const [result] = await db.query<ResultSetHeader>(
      `UPDATE PTClient SET ${fields.join(", ")} WHERE id = ? AND trainerId = ?`,
      values
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ success: false, message: "PT client record not found" });
      return;
    }

    res.json({ success: true, message: "Updated" });
  } catch (err) {
    next(err);
  }
};

/* DELETE /api/pt-clients/:id — remove from roster */
export const removePTClient = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const trainerId = await getTrainerId(req.user!.id);
    if (!trainerId) {
      res.status(403).json({ success: false, message: "Trainer profile not found" });
      return;
    }

    const { id } = req.params;
    const [result] = await db.query<ResultSetHeader>(
      "DELETE FROM PTClient WHERE id = ? AND trainerId = ?",
      [id, trainerId]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ success: false, message: "PT client not found" });
      return;
    }

    res.json({ success: true, message: "Client removed from roster" });
  } catch (err) {
    next(err);
  }
};

/* GET /api/pt-clients/dashboard — dashboard stats and roster */
export const getTrainerDashboard = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const trainerId = await getTrainerId(req.user!.id);
    if (!trainerId) {
      res.status(403).json({ success: false, message: "Trainer profile not found" });
      return;
    }

    // 1. Stats
    const [clientCount] = await db.query<any[]>("SELECT COUNT(*) as total FROM PTClient WHERE trainerId = ?", [trainerId]);
    const [sessionCount] = await db.query<any[]>("SELECT COUNT(*) as total FROM TrainerBooking WHERE trainerId = ? AND DATE(scheduledAt) = CURDATE() AND status != 'cancelled'", [trainerId]);
    
    const [clients] = await db.query<any[]>(
      `SELECT u.id, u.name, u.avatar, s.planId as membership, ptc.goal,
       (SELECT name FROM WorkoutPlan WHERE userId = u.id AND isActive = 1 LIMIT 1) as activePlan,
       (SELECT MAX(date) FROM WorkoutSession WHERE userId = u.id) as lastSession
       FROM PTClient ptc
       JOIN User u ON ptc.userId = u.id
       LEFT JOIN Subscription s ON u.id = s.userId
       WHERE ptc.trainerId = ?`,
      [trainerId]
    );

    const activePlansCount = clients.filter(c => c.activePlan).length;
    const premiumMembersCount = clients.filter(c => c.membership && c.membership !== 'free').length;

    // 2. Clients list with formatted progress (mock progress % for now based on plan duration)
    const formattedClients = clients.map(c => {
      const nameParts = c.name.split(' ');
      const initials = nameParts.length > 1 ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase() : c.name[0].toUpperCase();
      
      return {
        id: c.id,
        name: c.name,
        plan: c.activePlan || c.goal,
        progress: Math.floor(Math.random() * 60) + 20, // Random progress 20-80% for variety
        membership: c.membership || 'free',
        initials,
        lastSession: c.lastSession
      };
    });

    // 3. Alerts
    const alerts = [];
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    for (const c of clients) {
      if (c.lastSession && new Date(c.lastSession) < threeDaysAgo) {
        alerts.push({ text: `${c.name} missed a workout recently`, type: 'warning' });
      }
    }

    if (premiumMembersCount > 0) {
      alerts.push({ text: `Manage ${premiumMembersCount} premium subscriptions`, type: 'success' });
    }

    // 4. Weekly Activity (Sessions for the last 7 days)
    const [activityRows] = await db.query<any[]>(
      `SELECT DAYNAME(scheduledAt) as day, COUNT(*) as count
       FROM TrainerBooking
       WHERE trainerId = ? AND scheduledAt >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
       GROUP BY DATE(scheduledAt), DAYNAME(scheduledAt)
       ORDER BY DATE(scheduledAt) ASC`,
      [trainerId]
    );

    const dayAbbr: Record<string, string> = {
      Monday: 'M', Tuesday: 'T', Wednesday: 'W',
      Thursday: 'T', Friday: 'F', Saturday: 'S', Sunday: 'S',
    };
    const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    // Fill in missing days
    const activityMap: Record<string, number> = {};
    activityRows.forEach(r => activityMap[r.day] = r.count);

    const weeklyActivity = dayOrder.map(d => ({
      label: dayAbbr[d],
      value: activityMap[d] || 0
    }));

    // Normalize to percentage for the chart
    const maxSessions = Math.max(...weeklyActivity.map(a => a.value), 5); // Base of 5 to avoid 100% bars if only 1 session
    const normalizedActivity = weeklyActivity.map(a => ({
      ...a,
      pct: Math.round((a.value / maxSessions) * 100)
    }));

    res.json({
      success: true,
      data: {
        stats: [
          { label: "Total Clients", value: clientCount[0].total, icon: "faUsers", color: "cyan" },
          { label: "Active Plans", value: activePlansCount, icon: "faDumbbell", color: "purple" },
          { label: "Today Sessions", value: sessionCount[0].total, icon: "faCalendarCheck", color: "green" },
          { label: "Premium Members", value: premiumMembersCount, icon: "faCrown", color: "gold" },
        ],
        clients: formattedClients,
        alerts: alerts.slice(0, 3),
        weeklyActivity: normalizedActivity
      }
    });
  } catch (err) {
    next(err);
  }
};
