import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarDays,
  faClock,
  faFire,
  faLayerGroup,
  faRotate,
  faBolt,
  faChartLine,
} from "@fortawesome/free-solid-svg-icons";
import "../css/plans.css";

/* ─── Types ─────────────────────────────────────────────────── */
interface Exercise {
  name: string;
  sets: number;
  reps: string; // e.g. "8-10" or "60 sec"
}

interface Day {
  day: string;
  type: string;
  badge: "push" | "pull" | "legs" | "full" | "core" | "rest";
  exercises: Exercise[];
  totalSets: number;
  duration: number; // minutes
  kcal: number;
}

interface Plan {
  id: string;
  label: string;
  name: string;
  description: string;
  level: string;
  daysPerWeek: number;
  weeks: number;
  goal: string;
  days: Day[];
}

/* ─── Plan Data ──────────────────────────────────────────────── */
const plans: Plan[] = [
  /* ── Push / Pull / Legs (6-day) ─────────────────────────── */
  {
    id: "ppl",
    label: "Most Popular",
    name: "Push / Pull / Legs",
    description:
      "The classic 6-day PPL split is one of the most effective programs for building size and strength. Push days hit chest, shoulders and triceps; pull days target back and biceps; leg days cover quads, hamstrings and calves. Each muscle group gets trained twice per week.",
    level: "Intermediate",
    daysPerWeek: 6,
    weeks: 12,
    goal: "Muscle & Strength",
    days: [
      {
        day: "Monday",
        type: "Push A",
        badge: "push",
        exercises: [
          { name: "Barbell Bench Press", sets: 4, reps: "5-6" },
          { name: "Incline Dumbbell Press", sets: 3, reps: "8-10" },
          { name: "Cable Fly (Low-to-High)", sets: 3, reps: "12-15" },
          { name: "Overhead Press", sets: 3, reps: "8-10" },
          { name: "Lateral Raises", sets: 4, reps: "15-20" },
          { name: "Tricep Rope Pushdown", sets: 3, reps: "12-15" },
          { name: "Overhead Tricep Extension", sets: 3, reps: "10-12" },
        ],
        totalSets: 23,
        duration: 65,
        kcal: 420,
      },
      {
        day: "Tuesday",
        type: "Pull A",
        badge: "pull",
        exercises: [
          { name: "Deadlift", sets: 4, reps: "4-6" },
          { name: "Barbell Row", sets: 3, reps: "8-10" },
          { name: "Lat Pulldown", sets: 3, reps: "10-12" },
          { name: "Seated Cable Row", sets: 3, reps: "10-12" },
          { name: "Face Pulls", sets: 3, reps: "15-20" },
          { name: "Barbell Curl", sets: 3, reps: "8-10" },
          { name: "Hammer Curl", sets: 3, reps: "10-12" },
        ],
        totalSets: 22,
        duration: 65,
        kcal: 440,
      },
      {
        day: "Wednesday",
        type: "Legs A",
        badge: "legs",
        exercises: [
          { name: "Barbell Squat", sets: 4, reps: "5-6" },
          { name: "Romanian Deadlift", sets: 3, reps: "8-10" },
          { name: "Leg Press", sets: 3, reps: "10-12" },
          { name: "Lying Leg Curl", sets: 3, reps: "10-12" },
          { name: "Leg Extension", sets: 3, reps: "12-15" },
          { name: "Standing Calf Raise", sets: 5, reps: "12-15" },
        ],
        totalSets: 21,
        duration: 60,
        kcal: 480,
      },
      {
        day: "Thursday",
        type: "Push B",
        badge: "push",
        exercises: [
          { name: "Incline Barbell Press", sets: 4, reps: "5-6" },
          { name: "Flat Dumbbell Press", sets: 3, reps: "10-12" },
          { name: "Pec Deck Machine", sets: 3, reps: "12-15" },
          { name: "Dumbbell Shoulder Press", sets: 3, reps: "10-12" },
          { name: "Cable Lateral Raise", sets: 3, reps: "15-20" },
          { name: "Skull Crushers", sets: 3, reps: "10-12" },
          { name: "Tricep Dips", sets: 3, reps: "10-12" },
        ],
        totalSets: 22,
        duration: 65,
        kcal: 415,
      },
      {
        day: "Friday",
        type: "Pull B",
        badge: "pull",
        exercises: [
          { name: "Pull-Ups / Weighted", sets: 4, reps: "6-8" },
          { name: "Chest-Supported Row", sets: 3, reps: "10-12" },
          { name: "Single-Arm DB Row", sets: 3, reps: "10-12" },
          { name: "Cable Pullover", sets: 3, reps: "12-15" },
          { name: "Rear Delt Fly", sets: 3, reps: "15-20" },
          { name: "Incline Curl", sets: 3, reps: "10-12" },
          { name: "Concentration Curl", sets: 3, reps: "12-15" },
        ],
        totalSets: 22,
        duration: 60,
        kcal: 400,
      },
      {
        day: "Saturday",
        type: "Legs B",
        badge: "legs",
        exercises: [
          { name: "Front Squat / Hack Squat", sets: 4, reps: "8-10" },
          { name: "Bulgarian Split Squat", sets: 3, reps: "10-12" },
          { name: "Seated Leg Curl", sets: 3, reps: "10-12" },
          { name: "Hip Thrust", sets: 3, reps: "10-12" },
          { name: "Walking Lunges", sets: 3, reps: "12 each" },
          { name: "Seated Calf Raise", sets: 5, reps: "15-20" },
        ],
        totalSets: 21,
        duration: 60,
        kcal: 475,
      },
      {
        day: "Sunday",
        type: "Rest",
        badge: "rest",
        exercises: [],
        totalSets: 0,
        duration: 0,
        kcal: 0,
      },
    ],
  },

  /* ── Upper / Lower (4-day) ───────────────────────────────── */
  {
    id: "ul",
    label: "Beginner Friendly",
    name: "Upper / Lower Split",
    description:
      "A 4-day upper/lower split that trains each muscle group twice a week with built-in recovery. Upper days focus on chest, back, shoulders and arms; lower days work quads, hamstrings, glutes and calves. Perfect for going from beginner to intermediate.",
    level: "Beginner → Intermediate",
    daysPerWeek: 4,
    weeks: 8,
    goal: "Strength & Size",
    days: [
      {
        day: "Monday",
        type: "Upper A",
        badge: "push",
        exercises: [
          { name: "Barbell Bench Press", sets: 3, reps: "6-8" },
          { name: "Barbell Row", sets: 3, reps: "6-8" },
          { name: "Dumbbell Shoulder Press", sets: 3, reps: "10-12" },
          { name: "Pull-Ups", sets: 3, reps: "8-10" },
          { name: "Barbell Curl", sets: 2, reps: "10-12" },
          { name: "Skull Crushers", sets: 2, reps: "10-12" },
        ],
        totalSets: 16,
        duration: 60,
        kcal: 360,
      },
      {
        day: "Tuesday",
        type: "Lower A",
        badge: "legs",
        exercises: [
          { name: "Barbell Squat", sets: 4, reps: "6-8" },
          { name: "Romanian Deadlift", sets: 3, reps: "8-10" },
          { name: "Leg Press", sets: 3, reps: "10-12" },
          { name: "Leg Curl", sets: 3, reps: "10-12" },
          { name: "Calf Raise", sets: 4, reps: "15-20" },
        ],
        totalSets: 17,
        duration: 55,
        kcal: 450,
      },
      {
        day: "Wednesday",
        type: "Rest",
        badge: "rest",
        exercises: [],
        totalSets: 0,
        duration: 0,
        kcal: 0,
      },
      {
        day: "Thursday",
        type: "Upper B",
        badge: "full",
        exercises: [
          { name: "Incline Dumbbell Press", sets: 3, reps: "8-10" },
          { name: "Lat Pulldown", sets: 3, reps: "8-10" },
          { name: "Cable Lateral Raise", sets: 3, reps: "12-15" },
          { name: "Seated Cable Row", sets: 3, reps: "10-12" },
          { name: "Hammer Curl", sets: 2, reps: "12-15" },
          { name: "Tricep Pushdown", sets: 2, reps: "12-15" },
        ],
        totalSets: 16,
        duration: 55,
        kcal: 340,
      },
      {
        day: "Friday",
        type: "Lower B",
        badge: "legs",
        exercises: [
          { name: "Deadlift", sets: 4, reps: "5-6" },
          { name: "Bulgarian Split Squat", sets: 3, reps: "10-12" },
          { name: "Leg Extension", sets: 3, reps: "12-15" },
          { name: "Hip Thrust", sets: 3, reps: "10-12" },
          { name: "Seated Calf Raise", sets: 4, reps: "15-20" },
        ],
        totalSets: 17,
        duration: 55,
        kcal: 460,
      },
      {
        day: "Saturday",
        type: "Rest",
        badge: "rest",
        exercises: [],
        totalSets: 0,
        duration: 0,
        kcal: 0,
      },
      {
        day: "Sunday",
        type: "Rest",
        badge: "rest",
        exercises: [],
        totalSets: 0,
        duration: 0,
        kcal: 0,
      },
    ],
  },

  /* ── Full Body (3-day) ───────────────────────────────────── */
  {
    id: "fb",
    label: "Time-Efficient",
    name: "Full Body 3×/Week",
    description:
      "Three full-body workouts per week with 48-hour recovery between sessions. Each session hits every major muscle group with a different exercise rotation so you hit 9 muscle groups per week without redundancy. Great for busy schedules or beginners.",
    level: "Beginner",
    daysPerWeek: 3,
    weeks: 8,
    goal: "General Fitness",
    days: [
      {
        day: "Monday",
        type: "Full Body A",
        badge: "full",
        exercises: [
          { name: "Barbell Squat", sets: 3, reps: "8-10" },
          { name: "Bench Press", sets: 3, reps: "8-10" },
          { name: "Barbell Row", sets: 3, reps: "8-10" },
          { name: "Overhead Press", sets: 3, reps: "8-10" },
          { name: "Barbell Curl", sets: 2, reps: "12" },
          { name: "Plank", sets: 3, reps: "45 sec" },
        ],
        totalSets: 17,
        duration: 55,
        kcal: 380,
      },
      {
        day: "Tuesday",
        type: "Rest",
        badge: "rest",
        exercises: [],
        totalSets: 0,
        duration: 0,
        kcal: 0,
      },
      {
        day: "Wednesday",
        type: "Full Body B",
        badge: "full",
        exercises: [
          { name: "Deadlift", sets: 3, reps: "6-8" },
          { name: "Incline Dumbbell Press", sets: 3, reps: "10-12" },
          { name: "Lat Pulldown", sets: 3, reps: "10-12" },
          { name: "Dumbbell Shoulder Press", sets: 3, reps: "10-12" },
          { name: "Hammer Curl", sets: 2, reps: "12" },
          { name: "Calf Raise", sets: 3, reps: "15" },
        ],
        totalSets: 17,
        duration: 55,
        kcal: 370,
      },
      {
        day: "Thursday",
        type: "Rest",
        badge: "rest",
        exercises: [],
        totalSets: 0,
        duration: 0,
        kcal: 0,
      },
      {
        day: "Friday",
        type: "Full Body C",
        badge: "full",
        exercises: [
          { name: "Front Squat", sets: 3, reps: "8-10" },
          { name: "Dumbbell Fly", sets: 3, reps: "12-15" },
          { name: "Pull-Ups", sets: 3, reps: "Max" },
          { name: "Lateral Raises", sets: 3, reps: "15" },
          { name: "Romanian Deadlift", sets: 3, reps: "10-12" },
          { name: "Ab Wheel Rollout", sets: 3, reps: "10-12" },
        ],
        totalSets: 18,
        duration: 55,
        kcal: 360,
      },
      {
        day: "Saturday",
        type: "Rest",
        badge: "rest",
        exercises: [],
        totalSets: 0,
        duration: 0,
        kcal: 0,
      },
      {
        day: "Sunday",
        type: "Rest",
        badge: "rest",
        exercises: [],
        totalSets: 0,
        duration: 0,
        kcal: 0,
      },
    ],
  },

  /* ── Bro Split (5-day) ───────────────────────────────────── */
  {
    id: "bro",
    label: "Classic",
    name: "Bro Split 5-Day",
    description:
      "The traditional bodybuilder split dedicating each day to one muscle group. High volume per session, full week to recover. Great for advanced lifters focused on hypertrophy and willing to go heavy every day.",
    level: "Intermediate → Advanced",
    daysPerWeek: 5,
    weeks: 12,
    goal: "Hypertrophy",
    days: [
      {
        day: "Monday",
        type: "Chest",
        badge: "push",
        exercises: [
          { name: "Barbell Bench Press", sets: 4, reps: "6-8" },
          { name: "Incline Dumbbell Press", sets: 4, reps: "8-10" },
          { name: "Cable Fly", sets: 3, reps: "12-15" },
          { name: "Dip (Chest-Focused)", sets: 3, reps: "10-12" },
          { name: "Pec Deck", sets: 3, reps: "12-15" },
        ],
        totalSets: 17,
        duration: 55,
        kcal: 370,
      },
      {
        day: "Tuesday",
        type: "Back",
        badge: "pull",
        exercises: [
          { name: "Deadlift", sets: 4, reps: "4-5" },
          { name: "Barbell Row", sets: 4, reps: "6-8" },
          { name: "Pull-Ups", sets: 3, reps: "8-10" },
          { name: "Seated Cable Row", sets: 3, reps: "10-12" },
          { name: "Straight-Arm Pulldown", sets: 3, reps: "12-15" },
        ],
        totalSets: 17,
        duration: 60,
        kcal: 430,
      },
      {
        day: "Wednesday",
        type: "Legs",
        badge: "legs",
        exercises: [
          { name: "Barbell Squat", sets: 4, reps: "6-8" },
          { name: "Leg Press", sets: 4, reps: "10-12" },
          { name: "Romanian Deadlift", sets: 3, reps: "8-10" },
          { name: "Leg Extension", sets: 3, reps: "12-15" },
          { name: "Leg Curl", sets: 3, reps: "12-15" },
          { name: "Calf Raise", sets: 4, reps: "15-20" },
        ],
        totalSets: 21,
        duration: 65,
        kcal: 490,
      },
      {
        day: "Thursday",
        type: "Shoulders",
        badge: "push",
        exercises: [
          { name: "Barbell Overhead Press", sets: 4, reps: "6-8" },
          { name: "Dumbbell Lateral Raise", sets: 4, reps: "12-15" },
          { name: "Rear Delt Fly", sets: 3, reps: "15-20" },
          { name: "Face Pulls", sets: 3, reps: "15-20" },
          { name: "Upright Row", sets: 3, reps: "10-12" },
        ],
        totalSets: 17,
        duration: 50,
        kcal: 320,
      },
      {
        day: "Friday",
        type: "Arms",
        badge: "pull",
        exercises: [
          { name: "Barbell Curl", sets: 4, reps: "8-10" },
          { name: "Skull Crushers", sets: 4, reps: "8-10" },
          { name: "Incline Dumbbell Curl", sets: 3, reps: "10-12" },
          { name: "Cable Pushdown", sets: 3, reps: "12-15" },
          { name: "Concentration Curl", sets: 3, reps: "12-15" },
          { name: "Overhead Extension", sets: 3, reps: "12-15" },
        ],
        totalSets: 20,
        duration: 55,
        kcal: 310,
      },
      {
        day: "Saturday",
        type: "Rest",
        badge: "rest",
        exercises: [],
        totalSets: 0,
        duration: 0,
        kcal: 0,
      },
      {
        day: "Sunday",
        type: "Rest",
        badge: "rest",
        exercises: [],
        totalSets: 0,
        duration: 0,
        kcal: 0,
      },
    ],
  },
];

/* ─── Tips Data ──────────────────────────────────────────────── */
const tips = [
  {
    icon: "💧",
    color: "rgba(61,255,255,0.12)",
    title: "Hydration",
    desc: "Drink 0.5–1 L of water before training and sip throughout your session.",
  },
  {
    icon: "😴",
    color: "rgba(123,97,255,0.12)",
    title: "Sleep 7–9 hrs",
    desc: "Muscle is built during rest. Prioritise sleep over extra training volume.",
  },
  {
    icon: "🥩",
    color: "rgba(255,107,107,0.12)",
    title: "Protein Intake",
    desc: "Target 1.6–2.2 g of protein per kg of bodyweight every day.",
  },
  {
    icon: "📈",
    color: "rgba(80,230,120,0.12)",
    title: "Progressive Overload",
    desc: "Add weight or reps every 1–2 weeks to keep gaining strength.",
  },
];

/* ─── Badge colour map ────────────────────────────────────────── */
const badgeClass: Record<string, string> = {
  push: "badge-push",
  pull: "badge-pull",
  legs: "badge-legs",
  full: "badge-full",
  core: "badge-core",
  rest: "badge-rest",
};

const bulletColor: Record<string, string> = {
  push: "#ff6b6b",
  pull: "var(--accent-cyan)",
  legs: "#a98dff",
  full: "#ffc832",
  core: "#50e678",
  rest: "#333",
};

/* ─── Component ──────────────────────────────────────────────── */
function Plans() {
  const [activeId, setActiveId] = useState<string>("ppl");
  const plan = plans.find((p) => p.id === activeId)!;

  const activeDays = plan.days.filter((d) => d.badge !== "rest");
  const totalKcal = activeDays.reduce((s, d) => s + d.kcal, 0);
  const totalSets = activeDays.reduce((s, d) => s + d.totalSets, 0);

  return (
    <div className="plans-page">
      {/* ── Header ── */}
      <div className="plans-header">
        <h1 className="plans-title">
          <FontAwesomeIcon icon={faCalendarDays} className="me-2" />
          Training Plans
        </h1>
        <p className="plans-subtitle">
          Choose a program that matches your schedule and goals
        </p>
      </div>

      {/* ── Tabs ── */}
      <div className="plans-tabs">
        {plans.map((p) => (
          <button
            key={p.id}
            className={`plan-tab-btn${activeId === p.id ? " active" : ""}`}
            onClick={() => setActiveId(p.id)}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* ── Hero ── */}
      <div className="plan-hero">
        <div className="plan-hero-inner">
          <div className="plan-hero-left">
            <div className="plan-tag">{plan.label}</div>
            <div className="plan-hero-title">{plan.name}</div>
            <p className="plan-hero-desc">{plan.description}</p>
            <div className="plan-meta-chips">
              <span className="plan-chip">
                <FontAwesomeIcon icon={faFire} />
                {plan.level}
              </span>
              <span className="plan-chip">
                <FontAwesomeIcon icon={faCalendarDays} />
                {plan.daysPerWeek} days / week
              </span>
              <span className="plan-chip">
                <FontAwesomeIcon icon={faClock} />
                {plan.weeks} weeks
              </span>
              <span className="plan-chip">
                <FontAwesomeIcon icon={faBolt} />
                {plan.goal}
              </span>
            </div>
          </div>

          <div className="plan-hero-stats">
            <div className="hero-stat-box">
              <div className="hero-stat-val">
                {plan.daysPerWeek}
                <span>days</span>
              </div>
              <div className="hero-stat-label">Per Week</div>
            </div>
            <div className="hero-stat-box">
              <div className="hero-stat-val">
                {totalSets}
                <span>sets</span>
              </div>
              <div className="hero-stat-label">Weekly Volume</div>
            </div>
            <div className="hero-stat-box">
              <div className="hero-stat-val">
                {totalKcal.toLocaleString()}
                <span>cal</span>
              </div>
              <div className="hero-stat-label">Weekly Burn</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Weekly Schedule ── */}
      <div className="section-heading">
        <FontAwesomeIcon icon={faChartLine} />
        Weekly Schedule
      </div>

      <div className="plan-days-grid">
        {plan.days.map((day, i) =>
          day.badge === "rest" ? (
            <div key={i} className="day-card rest-day">
              <div className="day-card-header">
                <div>
                  <div className="day-label">{day.day}</div>
                  <div className="day-type">Rest Day</div>
                </div>
                <span className={`day-type-badge ${badgeClass[day.badge]}`}>
                  Rest
                </span>
              </div>
              <div className="rest-content">
                <div className="rest-icon">🛌</div>
                Recovery & light stretching
              </div>
            </div>
          ) : (
            <div key={i} className="day-card">
              <div className="day-card-header">
                <div>
                  <div className="day-label">{day.day}</div>
                  <div className="day-type">{day.type}</div>
                </div>
                <span className={`day-type-badge ${badgeClass[day.badge]}`}>
                  {day.badge.toUpperCase()}
                </span>
              </div>

              <div className="day-exercises">
                {day.exercises.map((ex, j) => (
                  <div key={j} className="ex-row">
                    <div
                      className="ex-bullet"
                      style={{ background: bulletColor[day.badge] }}
                    />
                    <span className="ex-name">{ex.name}</span>
                    <span className="ex-meta">
                      <FontAwesomeIcon
                        icon={faLayerGroup}
                        style={{ marginRight: 3, opacity: 0.5 }}
                      />
                      {ex.sets} ×{" "}
                      <FontAwesomeIcon
                        icon={faRotate}
                        style={{ marginRight: 3, opacity: 0.5 }}
                      />
                      {ex.reps}
                    </span>
                  </div>
                ))}
              </div>

              <div className="day-divider" />
              <div className="day-footer">
                <div className="day-stat">
                  <div className="day-stat-val">{day.totalSets}</div>
                  <div className="day-stat-label">Sets</div>
                </div>
                <div className="day-stat">
                  <div className="day-stat-val">{day.duration}m</div>
                  <div className="day-stat-label">Duration</div>
                </div>
                <div className="day-stat">
                  <div className="day-stat-val">{day.kcal}</div>
                  <div className="day-stat-label">Kcal</div>
                </div>
              </div>
            </div>
          ),
        )}
      </div>

      {/* ── Training Tips ── */}
      <div className="section-heading" style={{ marginTop: "2rem" }}>
        <FontAwesomeIcon icon={faBolt} />
        Training Tips
      </div>
      <div className="plan-tips">
        {tips.map((tip, i) => (
          <div key={i} className="tip-card">
            <div className="tip-icon-wrap" style={{ background: tip.color }}>
              {tip.icon}
            </div>
            <div className="tip-text-wrap">
              <div className="tip-title">{tip.title}</div>
              <div className="tip-desc">{tip.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Plans;
