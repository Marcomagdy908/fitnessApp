import { Response, NextFunction } from "express";
import { z } from "zod";
import { db } from "../services/db";
import { AuthRequest } from "../middleware/auth";
import { ProgressEntryRow } from "../types/db";
import { ResultSetHeader } from "mysql2";

const createEntrySchema = z.object({
  weight: z.number().positive().optional(),
  bodyFat: z.number().min(0).max(100).optional(),
  notes: z.string().optional(),
  date: z.string().datetime().optional(),
});

export const getProgress = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const [entries] = await db.query<ProgressEntryRow[] & { length: number }>(
      "SELECT * FROM ProgressEntry WHERE userId = ? ORDER BY date DESC",
      [req.user!.id]
    );
    res.json({ success: true, data: entries });
  } catch (err) {
    next(err);
  }
};

export const addProgress = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const body = createEntrySchema.parse(req.body);
    const date = body.date ? new Date(body.date) : new Date();

    const [result] = await db.query<ResultSetHeader>(
      "INSERT INTO ProgressEntry (userId, weight, bodyFat, notes, date) VALUES (?, ?, ?, ?, ?)",
      [req.user!.id, body.weight ?? null, body.bodyFat ?? null, body.notes ?? null, date]
    );

    const [rows] = await db.query<ProgressEntryRow[] & { length: number }>(
      "SELECT * FROM ProgressEntry WHERE id = ?",
      [result.insertId]
    );

    res.status(201).json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
};

export const deleteProgress = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const [result] = await db.query<ResultSetHeader>(
      "DELETE FROM ProgressEntry WHERE id = ? AND userId = ?",
      [parseInt(req.params.id), req.user!.id]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ success: false, message: "Entry not found" });
      return;
    }
    
    res.json({ success: true, message: "Entry deleted" });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/progress/stats
 * Unified statistics for charts and records
 */
export const getProgressStats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const uid = req.user!.id;

    // 1. Streak & Sessions info
    const [sessions30] = await db.query<any[]>(
      `SELECT COUNT(*) as count, AVG(durationSecs) as avgDur
       FROM WorkoutSession
       WHERE userId = ? AND date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)`,
      [uid]
    );
    
    const [totalSets30] = await db.query<any[]>(
      `SELECT COUNT(*) as count
       FROM WorkoutSessionSet wss
       JOIN WorkoutSession ws ON wss.sessionId = ws.id
       WHERE ws.userId = ? AND ws.date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)`,
      [uid]
    );

    const [streakRows] = await db.query<any[]>(
      `SELECT DISTINCT DATE(date) as d
       FROM WorkoutSession WHERE userId = ?
       ORDER BY d DESC LIMIT 30`,
      [uid]
    );
    let streak = 0;
    let check = new Date();
    check.setHours(0, 0, 0, 0);
    for (const row of streakRows) {
      const d = new Date(row.d);
      d.setHours(0, 0, 0, 0);
      if (d.getTime() === check.getTime() || d.getTime() === check.getTime() - 86400000) {
        streak++;
        check = new Date(d.getTime() - 86400000);
      } else {
        break;
      }
    }

    // 2. Weekly Sessions (Last 7 days)
    const [weeklyRows] = await db.query<any[]>(
      `SELECT DAYNAME(date) as day, COUNT(*) as sessions
       FROM WorkoutSession
       WHERE userId = ? AND date >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
       GROUP BY DATE(date), DAYNAME(date)
       ORDER BY DATE(date) ASC`,
      [uid]
    );

    const dayAbbr: Record<string, string> = {
      Monday: "Mon", Tuesday: "Tue", Wednesday: "Wed",
      Thursday: "Thu", Friday: "Fri", Saturday: "Sat", Sunday: "Sun"
    };
    
    const weeklyData = [];
    const heatmap = []; // for Row 4 heatmap
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
      const row = weeklyRows.find(r => r.day === dayName);
      const count = row ? Number(row.sessions) : 0;
      weeklyData.push({
        day: dayAbbr[dayName],
        sessions: count
      });
      heatmap.push({
        day: dayAbbr[dayName],
        done: count > 0,
        isToday: i === 0
      });
    }

    // 3. Monthly Volume (Last 4 weeks)
    const [volumeRows] = await db.query<any[]>(
      `SELECT WEEK(date, 1) as wk, COUNT(*) as volume
       FROM WorkoutSessionSet wss
       JOIN WorkoutSession ws ON wss.sessionId = ws.id
       WHERE ws.userId = ? AND ws.date >= DATE_SUB(CURDATE(), INTERVAL 27 DAY)
       GROUP BY WEEK(date, 1)
       ORDER BY wk ASC`,
      [uid]
    );
    
    const monthlyVolume = volumeRows.map((r, i) => ({
      week: `Wk ${i + 1}`,
      volume: Number(r.volume)
    }));

    // 4. Muscle Distribution (Last 30 days)
    const [muscleRows] = await db.query<any[]>(
      `SELECT e.category as name, COUNT(*) as value
       FROM WorkoutSessionSet wss
       JOIN Exercise e ON wss.exerciseId = e.id
       JOIN WorkoutSession ws ON wss.sessionId = ws.id
       WHERE ws.userId = ? AND ws.date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
       GROUP BY e.category`,
      [uid]
    );
    
    const totalHits = muscleRows.reduce((s, r) => s + Number(r.value), 0) || 1;
    const muscleStats = muscleRows.map(r => ({
      name: r.name.charAt(0).toUpperCase() + r.name.slice(1),
      value: Math.round((Number(r.value) / totalHits) * 100)
    })).sort((a,b) => b.value - a.value);

    // 5. Personal Records (Best set per exercise)
    const [recordRows] = await db.query<any[]>(
      `SELECT e.name as exercise, 
              CONCAT(MAX(wss.reps), IF(MAX(wss.weight) > 0, CONCAT(' × ', MAX(wss.weight), ' kg'), '')) as best,
              DATE_FORMAT(MAX(ws.date), '%b %d') as date
       FROM WorkoutSessionSet wss
       JOIN Exercise e ON wss.exerciseId = e.id
       JOIN WorkoutSession ws ON wss.sessionId = ws.id
       WHERE ws.userId = ?
       GROUP BY e.id
       ORDER BY MAX(ws.date) DESC
       LIMIT 5`,
      [uid]
    );

    res.json({
      success: true,
      data: {
        summary: {
          streak,
          sessionsMonth: sessions30[0].count,
          totalExercises: totalSets30[0].count,
          avgDuration: Math.round(Number(sessions30[0].avgDur || 0) / 60)
        },
        weeklyData,
        monthlyVolume,
        muscleStats,
        records: recordRows,
        heatmap
      }
    });
  } catch (err) {
    next(err);
  }
};
