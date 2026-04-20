import { useState, useEffect, useRef } from "react";
import "../css/dashboard.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDumbbell, faBullseye, faFire, faChartLine, faBolt,
  faClipboardList, faArrowTrendDown, faCalendarWeek,
  faHandFist, faStopwatch,
} from "@fortawesome/free-solid-svg-icons";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, RadialBarChart, RadialBar,
} from "recharts";

/* ─── Types ────────────────────────────────────────────────── */
interface DashboardData {
  trainingPlan: {
    id: number;
    name: string;
    week: number;
    totalWeeks: number;
    phase: string;
    nextMilestone: string;
    completedSessions: number;
    totalSessions: number;
  } | null;
  weeklyCalories: { day: string; kcal: number }[];
  weightProgress: { week: string; kg: number }[];
  setsHistory: { id: number; name: string; reps: string; weight: string; kcal: number }[];
  muscleRadial: { name: string; value: number; fill: string }[];
  todayWeight: number | null;
  todayCaloriesLogged: number;
  streak: number;
  weeklyActivity: number[];
}

/* ─── Default / loading state ──────────────────────────────── */
const DEFAULT_PLAN = {
  id: 0, name: "No active plan", week: 0, totalWeeks: 8,
  phase: "—", nextMilestone: "—", completedSessions: 0, totalSessions: 24,
};
const INITIAL: DashboardData = {
  trainingPlan: DEFAULT_PLAN,
  weeklyCalories: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d => ({ day: d, kcal: 0 })),
  weightProgress: [],
  setsHistory: [],
  muscleRadial: [],
  todayWeight: null,
  todayCaloriesLogged: 0,
  streak: 0,
  weeklyActivity: [],
};

/* ─── Current Exercise (still static — would come from active plan) */
const currentExercise = {
  name: "Barbell Back Squat",
  sets: 4,
  reps: "6–8",
  rest: 120,
  weight: "100 kg",
  muscle: "Quads / Glutes",
};

/* ─── Timer hook ──────────────────────────────────────────── */
function useTimer(initial: number) {
  const [seconds, setSeconds] = useState(initial);
  const [running, setRunning] = useState(false);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      ref.current = setInterval(() => {
        setSeconds((s) => {
          if (s <= 1) { setRunning(false); return 0; }
          return s - 1;
        });
      }, 1000);
    } else {
      if (ref.current) clearInterval(ref.current);
    }
    return () => { if (ref.current) clearInterval(ref.current); };
  }, [running]);

  const toggle = () => {
    if (seconds === 0) { setSeconds(initial); setRunning(true); }
    else setRunning((r) => !r);
  };
  const reset = () => { setRunning(false); setSeconds(initial); };

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return { display: `${mm}:${ss}`, running, toggle, reset, seconds, initial };
}

/* ─── SVG Ring Timer ──────────────────────────────────────── */
const RADIUS = 38;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function TimerRing({ timer }: { timer: ReturnType<typeof useTimer> }) {
  const progress = timer.seconds / timer.initial;
  const offset = CIRCUMFERENCE * (1 - progress);
  const done = timer.seconds === 0;

  return (
    <div className="timer-wrap">
      <div className="timer-label">
        <FontAwesomeIcon icon={faStopwatch} style={{ marginRight: "0.35rem" }} />
        Rest Timer
      </div>
      <div className="timer-circle-wrap">
        <svg className="timer-svg" viewBox="0 0 88 88">
          <circle className="timer-track" cx="44" cy="44" r={RADIUS} />
          <circle
            className={`timer-arc ${done ? "timer-arc-done" : timer.running ? "timer-arc-running" : ""}`}
            cx="44" cy="44" r={RADIUS}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            transform="rotate(-90 44 44)"
          />
        </svg>
        <div className={`timer-time ${done ? "timer-time-done" : ""}`}>{timer.display}</div>
      </div>
      <div className="timer-btns">
        <button className="timer-btn" onClick={timer.toggle}>
          {timer.running ? "⏸ Pause" : timer.seconds === 0 ? "🔁 Again" : "▶ Start"}
        </button>
        <button className="timer-btn timer-btn-ghost" onClick={timer.reset}>Reset</button>
      </div>
      {done && <div className="timer-done-msg">✅ Next set!</div>}
    </div>
  );
}

/* ─── Tooltip style ──────────────────────────────────────── */
const ttStyle = {
  background: "#0d0d0d",
  border: "1px solid rgba(61,255,255,0.2)",
  borderRadius: 10,
  fontSize: "0.72rem",
  color: "#ccc",
};

/* ─── Dashboard ──────────────────────────────────────────── */
export default function Dashboard() {
  const [dash, setDash] = useState<DashboardData>(INITIAL);
  const [user, setUser] = useState({ name: "", email: ""});
  const [avatar, setAvatar] = useState("https://cdn-icons-png.flaticon.com/512/149/149071.png");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => { if (d.user) setUser(d.user); if(d.user.avatar) setAvatar(d.user.avatar); });

    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((d) => { if (d.success) setDash(d.data); });
  }, []);

  const timer = useTimer(currentExercise.rest);
  const plan = dash.trainingPlan ?? DEFAULT_PLAN;
  const planProgress = plan.totalSessions > 0 ? (plan.completedSessions / plan.totalSessions) * 100 : 0;
  const weekProgress = plan.totalWeeks > 0 ? ((plan.week - 1) / plan.totalWeeks) * 100 : 0;

  /* week heatmap — which days had a session this week */
  const today = new Date().getDay(); // 0=Sun,1=Mon…
  const doneIndices = dash.weeklyActivity;

  return (
    <div className="dashboard-wrapper">
      <div className="dash-grid">
        {/* ══ COLUMN 1 ══════════════════════════ */}
        <div className="dash-col">
          {/* Training Plan */}
          <div className="dash-card plan-card">
            <div className="dash-card-title">
              <span className="title-icon"><FontAwesomeIcon icon={faDumbbell} /></span>
              Training Plan
            </div>
            <div className="plan-phase-badge">{plan.phase} Phase</div>
            <div className="plan-name-lg">{plan.name}</div>
            <div className="plan-week-row">
              <span className="plan-week-label">Week</span>
              <span className="plan-week-num">
                {plan.week}
                <span className="plan-week-total">/ {plan.totalWeeks}</span>
              </span>
            </div>
            <div className="plan-prog-label">
              <span>Plan Progress</span><span>{Math.round(weekProgress)}%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill gradient-purple" style={{ width: `${weekProgress}%` }} />
            </div>
            <div className="plan-prog-label" style={{ marginTop: "0.75rem" }}>
              <span>Sessions</span>
              <span>{plan.completedSessions}/{plan.totalSessions}</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${planProgress}%` }} />
            </div>
            <div className="plan-milestone">
              <span className="milestone-dot" />
              Next: {plan.nextMilestone}
            </div>
          </div>

          {/* Today's Targets */}
          <div className="dash-card">
            <div className="dash-card-title">
              <span className="title-icon"><FontAwesomeIcon icon={faBullseye} /></span>
              Today's Targets
            </div>
            <div className="stat-row">
              {[
                { label: "Weight", value: dash.todayWeight ? `${dash.todayWeight}` : "—", unit: "kg", pct: dash.todayWeight ? Math.min(100, (dash.todayWeight / 100) * 100) : 0 },
                { label: "Calories", value: `${dash.todayCaloriesLogged}`, unit: "kcal", pct: Math.min(100, (dash.todayCaloriesLogged / 2400) * 100) },
                { label: "Streak", value: `🔥${dash.streak}`, unit: "days", pct: Math.min(100, (dash.streak / 7) * 100) },
              ].map((s) => (
                <div className="stat-box" key={s.label}>
                  <div className="stat-label">{s.label}</div>
                  <div className="stat-value">{s.value}</div>
                  <div className="stat-unit">{s.unit}</div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${s.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Muscle Coverage */}
          <div className="dash-card">
            <div className="dash-card-title">
              <span className="title-icon"><FontAwesomeIcon icon={faHandFist} /></span>
              Muscle Coverage
            </div>
            {dash.muscleRadial.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={150}>
                  <RadialBarChart cx="50%" cy="50%" innerRadius="25%" outerRadius="90%" data={dash.muscleRadial} startAngle={180} endAngle={-180}>
                    <RadialBar dataKey="value" background={{ fill: "rgba(255,255,255,0.04)" } as object} />
                    <Tooltip contentStyle={ttStyle} formatter={(v) => [`${v}%`, ""]} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="radial-legend">
                  {dash.muscleRadial.map((m) => (
                    <div className="radial-legend-item" key={m.name}>
                      <span className="radial-dot" style={{ background: m.fill }} />
                      <span>{m.name}</span>
                      <span style={{ color: m.fill, marginLeft: "auto" }}>{m.value}%</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ color: "#555", fontSize: "0.8rem", padding: "1rem 0" }}>No workout sessions yet this month.</div>
            )}
          </div>
        </div>

        {/* ══ COLUMN 2 — WIDE ═══════════════════ */}
        <div className="dash-col">
          {/* Current Exercise + Timer */}
          <div className="dash-card exercise-hero-card">
            <div className="dash-card-title">
              <span className="title-icon"><FontAwesomeIcon icon={faBolt} /></span>
              Current Exercise
            </div>
            <div className="ex-hero-body">
              <div className="ex-hero-left">
                <div className="ex-name">{currentExercise.name}</div>
                <div className="ex-muscle-tag">{currentExercise.muscle}</div>
                <div className="ex-meta-grid">
                  {[
                    { label: "Sets", value: currentExercise.sets },
                    { label: "Reps", value: currentExercise.reps },
                    { label: "Weight", value: currentExercise.weight },
                    { label: "Rest", value: `${currentExercise.rest}s` },
                  ].map((m) => (
                    <div className="ex-meta-box" key={m.label}>
                      <div className="ei-label">{m.label}</div>
                      <div className="ei-value">{m.value}</div>
                    </div>
                  ))}
                </div>
              </div>
              <TimerRing timer={timer} />
            </div>
          </div>

          {/* Weekly Calories Bar Chart */}
          <div className="dash-card">
            <div className="dash-card-title">
              <span className="title-icon"><FontAwesomeIcon icon={faFire} /></span>
              Weekly Calories Burned
            </div>
            <ResponsiveContainer width="100%" height={185}>
              <BarChart data={dash.weeklyCalories} barSize={28} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3dffff" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#00bfff" stopOpacity={0.35} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: "#555", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#555", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={ttStyle} formatter={(v) => [`${v} kcal`, "Burned"]} cursor={{ fill: "rgba(61,255,255,0.05)" }} />
                <Bar dataKey="kcal" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Weight Trend Area Chart */}
          <div className="dash-card">
            <div className="dash-card-title">
              <span className="title-icon"><FontAwesomeIcon icon={faArrowTrendDown} /></span>
              Weight Trend
            </div>
            {dash.weightProgress.length > 0 ? (
              <ResponsiveContainer width="100%" height={165}>
                <AreaChart data={dash.weightProgress} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7b61ff" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#7b61ff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="week" tick={{ fill: "#555", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#555", fontSize: 11 }} axisLine={false} tickLine={false} domain={["dataMin - 1", "dataMax + 1"]} />
                  <Tooltip contentStyle={ttStyle} formatter={(v) => [`${v} kg`, "Weight"]} />
                  <Area type="monotone" dataKey="kg" stroke="#7b61ff" strokeWidth={2.5} fill="url(#areaGrad)" dot={{ fill: "#7b61ff", r: 4, strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ color: "#555", fontSize: "0.8rem", padding: "1rem 0" }}>No weight data logged yet.</div>
            )}
          </div>
        </div>

        {/* ══ COLUMN 3 ══════════════════════════ */}
        <div className="dash-col">
          {/* User / Daily Progress */}
          <div className="dash-card">
            <div className="dash-card-title">
              <span className="title-icon"><FontAwesomeIcon icon={faChartLine} /></span>
              Daily Progress
            </div>
            <div className="avatar-wrap">
              <div className="avatar-ring">
                <img src={avatar} alt="avatar" />
              </div>
              <div className="avatar-info">
                <div className="user-name">{user.name}</div>
                <div className="user-email">{user.email}</div>
              </div>
            </div>
            <div className="stat-row">
              <div className="stat-box">
                <div className="stat-label">Workouts</div>
                <div className="stat-value">{plan.completedSessions}</div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${planProgress}%` }} />
                </div>
              </div>
              <div className="stat-box">
                <div className="stat-label">Streak</div>
                <div className="stat-value">🔥 {dash.streak}</div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${Math.min(100, (dash.streak / 7) * 100)}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Sets History */}
          <div className="dash-card">
            <div className="dash-card-title">
              <span className="title-icon"><FontAwesomeIcon icon={faClipboardList} /></span>
              Sets History
            </div>
            <div className="history-list">
              {dash.setsHistory.length === 0 ? (
                <div style={{ color: "#555", fontSize: "0.8rem" }}>No session history yet.</div>
              ) : (
                dash.setsHistory.map((set) => (
                  <div className="history-row" key={set.id}>
                    <div className="history-num">{set.id}</div>
                    <div className="history-name">{set.name}</div>
                    <div className="history-meta">{set.reps}</div>
                    <div className="history-meta">{set.weight}</div>
                    <div className="history-kcal">{set.kcal}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Week Heatmap */}
          <div className="dash-card">
            <div className="dash-card-title">
              <span className="title-icon"><FontAwesomeIcon icon={faCalendarWeek} /></span>
              This Week
            </div>
            <div className="week-heatmap">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => {
                const done = doneIndices.includes(i);
                const isToday = i === (today === 0 ? 6 : today - 1);
                return (
                  <div key={d} className={`heat-day ${done ? "heat-done" : "heat-rest"} ${isToday ? "heat-today" : ""}`}>
                    <div className="heat-label">{d}</div>
                    <div className="heat-dot">{done ? "✓" : "–"}</div>
                  </div>
                );
              })}
            </div>
            <div className="consistency-stats">
              <div className="cstat">
                <div className="cstat-val">{doneIndices.length}/7</div>
                <div className="cstat-label">Days Hit</div>
              </div>
              <div className="cstat">
                <div className="cstat-val">{Math.round((doneIndices.length / 7) * 100)}%</div>
                <div className="cstat-label">Adherence</div>
              </div>
              <div className="cstat">
                <div className="cstat-val">🔥{dash.streak}</div>
                <div className="cstat-label">Streak</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
