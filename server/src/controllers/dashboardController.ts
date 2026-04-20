import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { db } from '../services/db';

export const getDashboard = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const uid = req.user!.id;

    /* ── Training Plan ──────────────────────────────────────── */
    const [plans] = await db.query<any[]>(
      'SELECT * FROM WorkoutPlan WHERE userId = ? AND isActive = 1 LIMIT 1',
      [uid]
    );
    const plan = plans[0] ?? null;

    let trainingPlan = null;
    if (plan) {
      const totalWeeks = 8;
      // Calculate how many sessions have been completed under this plan
      const [[{ completedSessions }]] = await db.query<any[]>(
        'SELECT COUNT(*) as completedSessions FROM WorkoutSession WHERE userId = ? AND planId = ?',
        [uid, plan.id]
      );
      const totalSessions = plan.daysPerWeek * totalWeeks;
      const weeksSinceStart = Math.floor(
        (Date.now() - new Date(plan.createdAt).getTime()) / (7 * 24 * 3600 * 1000)
      );
      const currentWeek = Math.min(weeksSinceStart + 1, totalWeeks);

      trainingPlan = {
        id: plan.id,
        name: plan.name,
        week: currentWeek,
        totalWeeks,
        phase: 'Strength',
        nextMilestone: 'Deload Week',
        completedSessions: Number(completedSessions),
        totalSessions,
      };
    }

    /* ── Weekly Calories (last 7 days from MealLog) ─────────── */
    const [calRows] = await db.query<any[]>(
      `SELECT DAYNAME(date) as day, SUM(calories) as kcal
       FROM MealLog
       WHERE userId = ? AND date >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
       GROUP BY DATE(date), DAYNAME(date)
       ORDER BY DATE(date) ASC`,
      [uid]
    );

    const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const dayAbbr: Record<string, string> = {
      Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed',
      Thursday: 'Thu', Friday: 'Fri', Saturday: 'Sat', Sunday: 'Sun',
    };
    const calMap: Record<string, number> = {};
    for (const row of calRows) {
      calMap[row.day] = Number(row.kcal);
    }
    const weeklyCalories = dayOrder.map((d) => ({
      day: dayAbbr[d],
      kcal: calMap[d] ?? 0,
    }));

    /* ── Weight Progress (last 6 weeks from ProgressEntry) ──── */
    const [weightRows] = await db.query<any[]>(
      `SELECT DATE(date) as d, AVG(weight) as kg
       FROM ProgressEntry
       WHERE userId = ? AND date >= DATE_SUB(CURDATE(), INTERVAL 42 DAY)
       GROUP BY WEEK(date)
       ORDER BY d ASC
       LIMIT 6`,
      [uid]
    );
    const weekLabels = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6'];
    const weightProgress = weightRows.map((r, i) => ({
      week: weekLabels[i] ?? `W${i + 1}`,
      kg: parseFloat(Number(r.kg).toFixed(1)),
    }));

    /* ── Sets History (last session) ────────────────────────── */
    const [lastSession] = await db.query<any[]>(
      'SELECT id FROM WorkoutSession WHERE userId = ? ORDER BY date DESC LIMIT 1',
      [uid]
    );
    let setsHistory: any[] = [];
    if (lastSession[0]) {
      const [sets] = await db.query<any[]>(
        `SELECT wss.id, e.name, wss.reps, wss.setNumber, wss.weight,
                ROUND(wss.reps * wss.weight * 0.25) as kcal
         FROM WorkoutSessionSet wss
         JOIN Exercise e ON e.id = wss.exerciseId
         WHERE wss.sessionId = ?
         ORDER BY wss.id ASC`,
        [lastSession[0].id]
      );
      setsHistory = sets.map((s) => ({
        id: s.id,
        name: s.name,
        reps: `${s.reps}×${s.setNumber}`,
        weight: `${s.weight} kg`,
        kcal: Number(s.kcal),
      }));
    }

    /* ── Muscle Radial (coverage from last 30 days sessions) ── */
    const [muscleRows] = await db.query<any[]>(
      `SELECT e.category, COUNT(*) as hits
       FROM WorkoutSessionSet wss
       JOIN Exercise e ON e.id = wss.exerciseId
       JOIN WorkoutSession ws ON ws.id = wss.sessionId
       WHERE ws.userId = ? AND ws.date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       GROUP BY e.category`,
      [uid]
    );
    const muscleColorMap: Record<string, string> = {
      chest: '#3dffff',
      back: '#00bfff',
      legs: '#7b61ff',
      shoulders: '#ff6b6b',
      arms: '#ffc832',
      core: '#50e678',
      cardio: '#ff9f43',
    };
    const maxHits = Math.max(...muscleRows.map((r) => Number(r.hits)), 1);
    const muscleRadial = muscleRows.map((r) => ({
      name: r.category.charAt(0).toUpperCase() + r.category.slice(1),
      value: Math.round((Number(r.hits) / maxHits) * 100),
      fill: muscleColorMap[r.category] ?? '#888',
    }));

    /* ── Today's targets ─────────────────────────────────────── */
    const [[todayWeight]] = await db.query<any[]>(
      "SELECT weight FROM ProgressEntry WHERE userId = ? ORDER BY date DESC LIMIT 1",
      [uid]
    );
    const [[todayCalories]] = await db.query<any[]>(
      "SELECT SUM(calories) as total FROM MealLog WHERE userId = ? AND DATE(date) = CURDATE()",
      [uid]
    );

    /* ── Streak ───────────────────────────────────────────────  */
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

    /* ── Weekly Activity (for heatmap) ───────────────────────── */
    const [activityRows] = await db.query<any[]>(
      `SELECT DAYOFWEEK(date) as dayIdx
       FROM WorkoutSession
       WHERE userId = ? AND date >= DATE_SUB(CURDATE(), INTERVAL (DAYOFWEEK(CURDATE()) - 1) DAY)`,
      [uid]
    );
    // MySQL: 1=Sun, 2=Mon... 7=Sat
    // Convert to 0-indexed: 0=Mon, 1=Tue... 6=Sun
    const weeklyActivity = Array.from(new Set(activityRows.map(r => {
      const mysqlIdx = Number(r.dayIdx);
      return mysqlIdx === 1 ? 6 : mysqlIdx - 2;
    })));

    res.json({
      success: true,
      data: {
        trainingPlan,
        weeklyCalories,
        weightProgress,
        setsHistory,
        muscleRadial,
        todayWeight: todayWeight?.weight ?? null,
        todayCaloriesLogged: Number(todayCalories?.total ?? 0),
        streak,
        weeklyActivity,
      },
    });
  } catch (err) {
    next(err);
  }
};
