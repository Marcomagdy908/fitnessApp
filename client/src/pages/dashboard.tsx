import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import "../css/dashboard.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDumbbell, faBullseye, faFire, faChartLine,
  faClipboardList, faArrowTrendDown, faCalendarWeek,
  faStopwatch, faCrown, faCalendarCheck, faUserTie, faCalendarAlt,
  faPause, faPlay, faRotateRight, faCheck
} from "@fortawesome/free-solid-svg-icons";
import { api } from "../utils/api";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { useAuth } from "../context/AuthContext";

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
  subscription: {
    plan: string;
    status: string;
    expiresAt?: string;
  };
  nextBooking: {
    name?: string;
    trainerName?: string;
    scheduledAt: string;
    type: 'class' | 'trainer';
  } | null;
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
  subscription: { plan: 'free', status: 'active' },
  nextBooking: null
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
    <div className="ud-timer-wrap">
      <div className="ud-timer-label">
        <FontAwesomeIcon icon={faStopwatch} style={{ marginRight: "0.35rem" }} />
        Rest Timer
      </div>
      <div className="ud-timer-circle-wrap">
        <svg className="ud-timer-svg" viewBox="0 0 88 88">
          <circle className="ud-timer-track" cx="44" cy="44" r={RADIUS} />
          <circle
            className={`ud-timer-arc ${done ? "ud-timer-arc-done" : timer.running ? "ud-timer-arc-running" : ""}`}
            cx="44" cy="44" r={RADIUS}
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            transform="rotate(-90 44 44)"
          />
        </svg>
        <div className={`ud-timer-time ${done ? "ud-timer-time-done" : ""}`}>{timer.display}</div>
      </div>
      <div className="ud-timer-btns">
        <button className="ud-timer-btn" onClick={timer.toggle}>
          {timer.running ? (
            <>
              <FontAwesomeIcon icon={faPause} className="me-1" /> Pause
            </>
          ) : timer.seconds === 0 ? (
            <>
              <FontAwesomeIcon icon={faRotateRight} className="me-1" /> Again
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faPlay} className="me-1" /> Start
            </>
          )}
        </button>
        <button className="ud-timer-btn ud-timer-btn-ghost" onClick={timer.reset}>Reset</button>
      </div>
      {done && (
        <div className="ud-timer-done-msg">
          <FontAwesomeIcon icon={faCheck} className="me-1" /> Next set!
        </div>
      )}
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
  const { user } = useAuth();
  const avatar = user?.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  useEffect(() => {
    api.get("/api/dashboard")
      .then(res => { if (res.data.success) setDash(res.data.data); })
      .catch(() => {});
  }, []);

  const timer = useTimer(120); // Static for now
  const plan = dash.trainingPlan ?? DEFAULT_PLAN;
  const planProgress = plan.totalSessions > 0 ? (plan.completedSessions / plan.totalSessions) * 100 : 0;
  const weekProgress = plan.totalWeeks > 0 ? Math.max(0, ((plan.week - 1) / plan.totalWeeks) * 100) : 0;

  const today = new Date().getDay();
  const doneIndices = dash.weeklyActivity;

  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (wrapperRef.current && dash !== INITIAL) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          ".ud-dash-card",
          {
            opacity: 0,
            y: 40,
            scale: 0.95,
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            stagger: 0.05,
            ease: "back.out(1.2)",
            clearProps: "all",
          }
        );
      }, wrapperRef);
      return () => ctx.revert();
    }
  }, [dash]);

  return (
    <div className="ud-dashboard-wrapper" ref={wrapperRef}>
      <div className="ud-dash-grid">
        {/* ══ COLUMN 1 ══════════════════════════ */}
        <div className="ud-dash-col">
          {/* Gym Membership */}
          <div className="ud-dash-card ud-membership-card">
            <div className="ud-dash-card-title">
              <span className="ud-title-icon"><FontAwesomeIcon icon={faCrown} /></span>
              Membership
            </div>
            <div className={`ud-membership-status ${dash.subscription.plan || 'free'}`}>
              {(dash.subscription.plan || 'free').toUpperCase()} PLAN
            </div>
            <div className="ud-membership-info">
              {dash.subscription.plan === 'free' ? (
                <p>Enjoy basic tracking. Upgrade for gym access and classes!</p>
              ) : (
                <p>Status: <span className="ud-status-active">{dash.subscription.status}</span></p>
              )}
              <a href="/subscription" className="ud-membership-link">Manage Membership →</a>
            </div>
          </div>

          {/* Training Plan */}
          <div className="ud-dash-card ud-plan-card">
            <div className="ud-dash-card-title">
              <span className="ud-title-icon"><FontAwesomeIcon icon={faDumbbell} /></span>
              Training Plan
            </div>
            <div className="ud-plan-phase-badge">{plan.phase} Phase</div>
            <div className="ud-plan-name-lg">{plan.name}</div>
            <div className="ud-plan-week-row">
              <span className="ud-plan-week-label">Week</span>
              <span className="ud-plan-week-num">
                {plan.week}
                <span className="ud-plan-week-total">/ {plan.totalWeeks}</span>
              </span>
            </div>
            <div className="ud-plan-prog-label">
              <span>Plan Progress</span><span>{Math.round(weekProgress)}%</span>
            </div>
            <div className="ud-progress-track">
              <div className="ud-progress-fill gradient-purple" style={{ width: `${weekProgress}%` }} />
            </div>
            <div className="ud-plan-milestone">
              <span className="ud-milestone-dot" />
              Next: {plan.nextMilestone}
            </div>
          </div>

          {/* Weekly Calories Bar Chart */}
          <div className="ud-dash-card">
            <div className="ud-dash-card-title">
              <span className="ud-title-icon"><FontAwesomeIcon icon={faFire} /></span>
              Weekly Calories Burned
            </div>
            <ResponsiveContainer width="100%" height={185}>
              <BarChart data={dash.weeklyCalories} barSize={28} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent-cyan)" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="var(--accent-cyan-dim)" stopOpacity={0.35} />
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
        </div>

        {/* ══ COLUMN 2 — WIDE ═══════════════════ */}
        <div className="ud-dash-col">
          {/* Upcoming Session */}
          <div className="ud-dash-card ud-upcoming-card">
            <div className="ud-dash-card-title">
              <span className="ud-title-icon"><FontAwesomeIcon icon={faCalendarCheck} /></span>
              Upcoming Session
            </div>
            {dash.nextBooking ? (
              <div className="ud-upcoming-body">
                <div className="ud-upcoming-info">
                  <div className="ud-upcoming-type">
                    <FontAwesomeIcon icon={dash.nextBooking.type === 'class' ? faCalendarAlt : faUserTie} />
                    {dash.nextBooking.type === 'class' ? 'Group Class' : 'Trainer Session'}
                  </div>
                  <div className="ud-upcoming-name">{dash.nextBooking.name || dash.nextBooking.trainerName}</div>
                  <div className="ud-upcoming-time">
                    {new Date(dash.nextBooking.scheduledAt).toLocaleString([], { weekday: 'long', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <a href="/bookings" className="ud-upcoming-btn">View All</a>
              </div>
            ) : (
              <div className="ud-upcoming-empty">
                <p>No sessions booked yet.</p>
                <a href="/gym-classes" className="ud-book-link">Book a class →</a>
              </div>
            )}
          </div>

          {/* Weight Trend Area Chart */}
          <div className="ud-dash-card">
            <div className="ud-dash-card-title d-flex justify-content-between align-items-center">
              <div>
                <span className="ud-title-icon"><FontAwesomeIcon icon={faArrowTrendDown} /></span>
                Weight Trend
              </div>
              <a href="/progress" className="ud-card-link-btn" style={{ fontSize: "0.75rem", textDecoration: "none", color: "var(--accent-cyan)" }}>Track Weight →</a>
            </div>
            {dash.weightProgress.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
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

          {/* Rest Timer Widget */}
          <div className="ud-dash-card ud-timer-card">
            <TimerRing timer={timer} />
          </div>
        </div>

        {/* ══ COLUMN 3 ══════════════════════════ */}
        <div className="ud-dash-col">
          {/* Daily Progress */}
          <div className="ud-dash-card">
            <div className="ud-dash-card-title d-flex justify-content-between align-items-center">
              <div>
                <span className="ud-title-icon"><FontAwesomeIcon icon={faChartLine} /></span>
                Daily Progress
              </div>
              <a href="/progress" className="ud-card-link-btn" style={{ fontSize: "0.75rem", textDecoration: "none", color: "var(--accent-cyan)" }}>View Details →</a>
            </div>
            <div className="ud-avatar-wrap">
              <div className="ud-avatar-ring">
                <img src={avatar} alt="avatar" />
              </div>
              <div className="ud-avatar-info">
                <div className="ud-user-name">{user?.name}</div>
                <div className="ud-user-email">{user?.email}</div>
              </div>
            </div>
            <div className="ud-stat-row">
              <div className="ud-stat-box">
                <div className="ud-stat-label">Workouts</div>
                <div className="ud-stat-value">{plan.completedSessions}</div>
                <div className="ud-progress-track">
                  <div className="ud-progress-fill" style={{ width: `${planProgress}%` }} />
                </div>
              </div>
              <div className="ud-stat-box">
                <div className="ud-stat-label">Streak</div>
                <div className="ud-stat-value">
                  <FontAwesomeIcon icon={faFire} className="me-1" style={{ color: "#ffc832" }} />
                  {dash.streak}
                </div>
                <div className="ud-progress-track">
                  <div className="ud-progress-fill" style={{ width: `${Math.min(100, (dash.streak / 7) * 100)}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Today's Targets */}
          <div className="ud-dash-card">
            <div className="ud-dash-card-title">
              <span className="ud-title-icon"><FontAwesomeIcon icon={faBullseye} /></span>
              Today's Targets
            </div>
            <div className="ud-stat-row grid-stats">
              {[
                { label: "Weight", value: dash.todayWeight ? `${dash.todayWeight}` : "—", unit: "kg", pct: dash.todayWeight ? Math.min(100, (dash.todayWeight / 100) * 100) : 0 },
                { label: "Calories", value: `${dash.todayCaloriesLogged}`, unit: "kcal", pct: Math.min(100, (dash.todayCaloriesLogged / 2400) * 100) },
                { label: "Streak", value: `${dash.streak}`, unit: "days", pct: Math.min(100, (dash.streak / 7) * 100) },
              ].map((s) => (
                <div className="ud-stat-box" key={s.label}>
                  <div className="ud-stat-label">{s.label}</div>
                  <div className="ud-stat-value">{s.value}</div>
                  <div className="ud-stat-unit">{s.unit}</div>
                  <div className="ud-progress-track">
                    <div className="ud-progress-fill" style={{ width: `${s.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sets History */}
          <div className="ud-dash-card">
            <div className="ud-dash-card-title">
              <span className="ud-title-icon"><FontAwesomeIcon icon={faClipboardList} /></span>
              Sets History
            </div>
            <div className="ud-history-list">
              {dash.setsHistory.length === 0 ? (
                <div style={{ color: "#555", fontSize: "0.8rem" }}>No session history yet.</div>
              ) : (
                dash.setsHistory.map((set) => (
                  <div className="ud-history-row" key={set.id}>
                    <div className="ud-history-num">{set.id}</div>
                    <div className="ud-history-name">{set.name}</div>
                    <div className="ud-history-meta">{set.reps}</div>
                    <div className="ud-history-meta">{set.weight}</div>
                    <div className="ud-history-kcal">{set.kcal}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Week Heatmap */}
          <div className="ud-dash-card">
            <div className="ud-dash-card-title">
              <span className="ud-title-icon"><FontAwesomeIcon icon={faCalendarWeek} /></span>
              This Week
            </div>
            <div className="ud-week-heatmap">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => {
                const done = doneIndices.includes(i);
                const isToday = i === (today === 0 ? 6 : today - 1);
                return (
                  <div key={d} className={`ud-heat-day ${done ? "ud-heat-done" : "ud-heat-rest"} ${isToday ? "ud-heat-today" : ""}`}>
                    <div className="ud-heat-label">{d}</div>
                    <div className="ud-heat-dot">{done ? "✓" : "–"}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
