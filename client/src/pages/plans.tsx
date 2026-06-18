import { useState, useEffect } from "react";
import { usePageFadeIn } from "../hooks/usePageFadeIn";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { api } from "../utils/api";
import { useSearch } from "../context/SearchContext";
import {
  faCalendarDays,
  faClock,
  faFire,
  faLayerGroup,
  faRotate,
  faBolt,
  faChartLine,
  faMoon,
  faUtensils,
  faBed,
  faLightbulb
} from "@fortawesome/free-solid-svg-icons";
import "../css/plans.css";
import { DIET_PLAN_STYLES, NUTRITION_TIP_STYLES } from "../utils/styleMappings";

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

/* ─── Tips Data ──────────────────────────────────────────────── */
const trainingTipsRaw = [
  { title: "Stay Hydrated", desc: "Drink 0.5–1 L of water before training and sip throughout your session." },
  { title: "Sleep 7–9 hrs", desc: "Muscle is built during rest. Prioritise sleep over extra training volume.", customStyle: { icon: faMoon, color: "rgba(123,97,255,0.12)" } },
  { title: "Protein Intake", desc: "Target 1.6–2.2 g of protein per kg of bodyweight every day.", customStyle: { icon: faUtensils, color: "rgba(255,107,107,0.12)" } },
  { title: "Track Everything", desc: "Add weight or reps every 1–2 weeks to keep gaining strength." },
  { title: "Warm Up", desc: "Spend 5-10 minutes warming up to prevent injuries and improve performance." },
  { title: "Form Over Weight", desc: "Always prioritize perfect form over lifting heavier weights." },
  { title: "Consistent Schedule", desc: "Training at the same time daily helps build a sustainable habit." }
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
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [randomTips, setRandomTips] = useState<any[]>([]);

  const { searchQuery } = useSearch();

  const containerRef = usePageFadeIn<HTMLDivElement>(".day-card, .tip-card, .plan-hero", [activeId]);

  const categories = ["All", ...new Set(plans.map(p => p.goal))];
  const filteredPlans = plans.filter(p => {
    const matchesCategory = activeCategory === "All" || p.goal === activeCategory;
    const matchesSearch = searchQuery.trim() === "" ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.goal && p.goal.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  useEffect(() => {
    api.get("/api/plans")
      .then(res => {
        if (res.data.success) {
          const formattedPlans = res.data.data.map((p: any) => {
            const days: Day[] = [];
            // Group exercises by day
            const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
            
            dayNames.forEach((dName, i) => {
              const dayNum = i + 1;
              const dayExercises = p.exercises.filter((ex: any) => ex.day === dayNum);
              
              if (dayExercises.length === 0) {
                days.push({
                  day: dName,
                  type: "Rest",
                  badge: "rest",
                  exercises: [],
                  totalSets: 0,
                  duration: 0,
                  kcal: 0
                });
              } else {
                // Determine badge based on first exercise category
                let badge: Day["badge"] = "full";
                const cat = dayExercises[0].exercise.category.toLowerCase();
                if (cat === "chest" || cat === "shoulders") badge = "push";
                else if (cat === "back" || cat === "arms") badge = "pull";
                else if (cat === "legs") badge = "legs";
                else if (cat === "core") badge = "core";

                days.push({
                  day: dName,
                  type: badge.charAt(0).toUpperCase() + badge.slice(1) + " Day",
                  badge,
                  exercises: dayExercises.map((ex: any) => ({
                    name: ex.exercise.name,
                    sets: ex.sets,
                    reps: ex.reps.toString()
                  })),
                  totalSets: dayExercises.reduce((sum: number, ex: any) => sum + ex.sets, 0),
                  duration: dayExercises.length * 10 + 10, // heuristic
                  kcal: dayExercises.length * 50 + 50 // heuristic
                });
              }
            });

            return {
              id: p.id.toString(),
              label: p.label || "Program",
              name: p.name,
              description: p.description || "",
              level: p.level || "Intermediate",
              daysPerWeek: p.daysPerWeek,
              weeks: p.weeks || 12,
              goal: p.goal || "Fitness",
              days
            };
          });
          setPlans(formattedPlans);
          if (formattedPlans.length > 0) setActiveId(formattedPlans[0].id);
          
          // Randomize tips
          const shuffled = [...trainingTipsRaw].sort(() => 0.5 - Math.random());
          setRandomTips(shuffled.slice(0, 3));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="plans-page"><p className="text-muted text-center py-5">Loading training plans...</p></div>;
  if (plans.length === 0) return <div className="plans-page"><p className="text-muted text-center py-5">No plans found. Create one to get started!</p></div>;

  const plan = plans.find((p) => p.id === activeId) || plans[0];
  const planStyle = DIET_PLAN_STYLES[plan?.goal.toLowerCase()] || DIET_PLAN_STYLES.default;

  const activeDays = plan.days.filter((d) => d.badge !== "rest");
  const totalKcal = activeDays.reduce((s, d) => s + d.kcal, 0);
  const totalSets = activeDays.reduce((s, d) => s + d.totalSets, 0);

  return (
    <div className="plans-page" ref={containerRef}>
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

      {/* ── Category Filter ── */}
      <div className="plans-category-tabs">
        {categories.map(cat => (
          <button
            key={cat}
            className={`cat-tab-btn ${activeCategory === cat ? "active" : ""}`}
            onClick={() => {
              setActiveCategory(cat);
              const firstInCat = cat === "All" ? plans[0] : plans.find(p => p.goal === cat);
              if (firstInCat) setActiveId(firstInCat.id);
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ── Tabs (Filtered) ── */}
      <div className="plans-tabs">
        {filteredPlans.map((p) => (
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
      <div className="plan-hero" style={{ borderColor: `${planStyle.accentColor}33` }}>
        <div className="plan-hero-inner">
          <div className="plan-hero-left">
            <div className="plan-tag" style={{ color: planStyle.labelColor, borderColor: `${planStyle.labelColor}55`, background: `${planStyle.labelColor}18` }}>
              {planStyle.label}
            </div>
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
                <div className="rest-icon">
                  <FontAwesomeIcon icon={faBed} />
                </div>
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
        {randomTips.map((tip, i) => {
          const style = tip.customStyle || NUTRITION_TIP_STYLES[tip.title] || { icon: faLightbulb, color: "rgba(255,255,255,0.05)" };
          return (
            <div key={i} className="tip-card">
              <div className="tip-icon-wrap" style={{ background: style.color }}>
                {typeof style.icon === "string" ? style.icon : <FontAwesomeIcon icon={style.icon} />}
              </div>
              <div className="tip-text-wrap">
                <div className="tip-title">{tip.title}</div>
                <div className="tip-desc">{tip.desc}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Plans;
