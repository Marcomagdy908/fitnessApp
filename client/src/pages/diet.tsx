import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { api } from "../utils/api";
import {
  faUtensils,
  faFire,
  faDrumstickBite,
  faBreadSlice,
  faDroplet,
  faLeaf,
  faClock,
  faArrowTrendUp,
  faArrowTrendDown,
  faScaleBalanced,
  faPlus,
  faTrash,
  faCheck,
  faTriangleExclamation,
  faLightbulb,
  faXmark,
  faChartPie,
} from "@fortawesome/free-solid-svg-icons";
import "../css/diet.css";
import { DIET_PLAN_STYLES, NUTRITION_TIP_STYLES } from "../utils/styleMappings";

/* ─── Types ─────────────────────────────────────────────────── */
interface Meal {
  time: string;
  name: string;
  foods: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface LoggedMeal {
  id: number;
  time: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  category: "breakfast" | "lunch" | "dinner" | "snack";
}

interface AltMeal {
  id: number;
  injury: string;
  icon: string;
  name: string;
  benefit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface DietPlan {
  id: number;
  planId: string;
  name: string;
  description: string;
  goal: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  meals: Meal[];
}



/* ─── Category config for Tracker ────────────────────────────────────────── */

/* ─── Category config for Tracker ────────────────────────────────────────── */
const categoryConfig = {
  breakfast: { label: "Breakfast", color: "#ffc832", emoji: "🌅" },
  lunch:     { label: "Lunch",     color: "var(--accent-cyan)", emoji: "☀️" },
  dinner:    { label: "Dinner",    color: "#a98dff", emoji: "🌙" },
  snack:     { label: "Snack",     color: "#50e678", emoji: "🍎" },
};

/* ─── Macro progress bar ─────────────────────────────────────── */
function MacroProgress({ label, value, target, color, icon }: { label: string; value: number; target: number; color: string; icon: import("@fortawesome/fontawesome-svg-core").IconDefinition }) {
  const pct = Math.min(100, Math.round((value / target) * 100));
  const over = value > target;
  return (
    <div className="mp-row">
      <div className="mp-label-row">
        <span className="mp-icon" style={{ color }}><FontAwesomeIcon icon={icon} /></span>
        <span className="mp-label">{label}</span>
        <span className="mp-value" style={{ color: over ? "var(--danger)" : "var(--text-secondary)" }}>
          {value}<span className="mp-target">/{target}{label === "Calories" ? " kcal" : "g"}</span>
        </span>
      </div>
      <div className="mp-track">
        <div className="mp-fill" style={{ width: `${pct}%`, background: over ? "var(--danger)" : color }} />
      </div>
      <div className="mp-pct" style={{ color: over ? "var(--danger)" : "var(--text-dim)" }}>{pct}%{over ? " — over target" : ""}</div>
    </div>
  );
}

/* ─── Helper: macro bar ──────────────────────────────────────── */
function MacroBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="macro-bar-track">
      <div className="macro-bar-fill" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

/* ─── Component ──────────────────────────────────────────────── */
function Diet() {
  const { user } = useAuth();
  
  const dailyTarget = {
    calories: user?.targetCalories || 2400,
    protein: user?.targetProtein || 180,
    carbs: user?.targetCarbs || 270,
    fat: user?.targetFat || 70
  };

  const [dietPlans, setDietPlans] = useState<DietPlan[]>([]);
  const [nutritionTips, setNutritionTips] = useState<any[]>([]);
  const [primaryTab, setPrimaryTab] = useState<"programs" | "tracker">("programs");
  /* Fetch diet plans */
  useEffect(() => {
    api.get("/api/meals/plans").then((res) => {
      if (res.data.success) {
        setDietPlans(res.data.data);
        if (res.data.data.length > 0) {
          setActivePlanId(res.data.data[0].planId);
        }
      }
    });

    api.get("/api/meals/tips").then((res) => {
      if (res.data.success) {
        setNutritionTips(res.data.data.map((t: any) => {
          const style = NUTRITION_TIP_STYLES[t.title] || { icon: t.icon, color: t.color };
          return {
            icon: style.icon,
            color: style.color,
            title: t.title,
            desc: t.description
          };
        }));
      }
    });

    api.get("/api/injuries").then((res) => {
      if (res.data.success) {
        setUserInjuries(res.data.data.map((i: any) => i.type));
      }
    });
  }, []);
  const [activePlanId, setActivePlanId] = useState<string>("bulk");


  /* Tracker State */
  const [loggedMeals, setLoggedMeals] = useState<LoggedMeal[]>([]);
  const [altMeals, setAltMeals] = useState<AltMeal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [activeInjury, setActiveInjury] = useState<string | null>(null);
  const [userInjuries, setUserInjuries] = useState<string[]>([]);
  const [form, setForm] = useState({
    time: "", name: "", calories: "", protein: "", carbs: "", fat: "",
    category: "snack" as LoggedMeal["category"],
  });

  /* Fetch today's meals */
  useEffect(() => {
    if (primaryTab === "tracker") {
      const today = new Date().toISOString().slice(0, 10);
      api.get(`/api/meals?date=${today}`)
        .then((res) => {
          if (res.data.success) {
            setLoggedMeals(
              res.data.data.map((m: { id: number; date: string; name: string; calories: number; protein: number; carbs: number; fat: number; mealType: string }) => ({
                id: m.id,
                time: new Date(m.date).toTimeString().slice(0, 5),
                name: m.name,
                calories: m.calories,
                protein: m.protein,
                carbs: m.carbs,
                fat: m.fat,
                category: m.mealType as LoggedMeal["category"],
              }))
            );
          }
        });
    }
  }, [primaryTab]);

  /* Fetch alternative meals */
  useEffect(() => {
    if (primaryTab === "tracker") {
      api.get("/api/meals/alternatives")
        .then((res) => {
          if (res.data.success && res.data.data.length > 0) {
            setAltMeals(res.data.data);
            
            const filteredInjuries = [...new Set(res.data.data.map((m: any) => m.injury))]
              .filter(inj => userInjuries.includes(inj as string));
            
            if (filteredInjuries.length > 0) {
              if (!activeInjury || !filteredInjuries.includes(activeInjury)) {
                setActiveInjury(filteredInjuries[0] as string);
              }
            } else {
              setActiveInjury(null);
            }
          }
        });
    }
  }, [primaryTab, userInjuries]);

  if (dietPlans.length === 0) return <div className="diet-page" style={{ color: "var(--text-secondary)", padding: "2rem" }}>Loading Nutrition Programs...</div>;

  const plan = dietPlans.find((p) => p.planId === activePlanId) || dietPlans[0];
  const planStyle = DIET_PLAN_STYLES[plan?.planId] || DIET_PLAN_STYLES.default;

  const totals = loggedMeals.reduce(
    (acc, m) => ({ calories: acc.calories + m.calories, protein: acc.protein + m.protein, carbs: acc.carbs + m.carbs, fat: acc.fat + m.fat }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );


  const addMeal = async () => {
    if (!form.name || !form.calories) return;
    const body = {
      name: form.name,
      mealType: form.category,
      calories: Number(form.calories),
      protein: Number(form.protein) || 0,
      carbs: Number(form.carbs) || 0,
      fat: Number(form.fat) || 0,
    };
    const res = await api.post("/api/meals", body);
    if (res.data.success) {
      const m = res.data.data;
      setLoggedMeals((prev) => [...prev, {
        id: m.id,
        time: form.time || new Date().toTimeString().slice(0, 5),
        name: m.name,
        calories: m.calories,
        protein: m.protein,
        carbs: m.carbs,
        fat: m.fat,
        category: m.mealType,
      }].sort((a, b) => a.time.localeCompare(b.time)));
    }
    setForm({ time: "", name: "", calories: "", protein: "", carbs: "", fat: "", category: "snack" });
    setShowForm(false);
  };

  const removeMeal = async (id: number) => {
    await api.delete(`/api/meals/${id}`);
    setLoggedMeals((prev) => prev.filter((m) => m.id !== id));
  };

  const logAltMeal = async (m: AltMeal) => {
    const body = {
      name: m.name,
      mealType: "snack",
      calories: m.calories,
      protein: m.protein,
      carbs: m.carbs,
      fat: m.fat,
    };
    const res = await api.post("/api/meals", body);
    const data = res.data;
    if (data.success) {
      const meal = data.data;
      setLoggedMeals((prev) => [...prev, {
        id: meal.id,
        time: new Date().toTimeString().slice(0, 5),
        name: meal.name,
        calories: meal.calories,
        protein: meal.protein,
        carbs: meal.carbs,
        fat: meal.fat,
        category: "snack",
      }]);
    }
  };

  const remaining = { calories: Math.max(0, dailyTarget.calories - totals.calories) };
  const activeAltMeals = altMeals.filter((m) => m.injury === activeInjury);
  
  // Only show injuries that the user actually has
  const profileInjuries = [...new Set(altMeals.map((m) => m.injury))].filter(inj => userInjuries.includes(inj));

  return (
    <div className="diet-page">
      {/* ── Header ── */}
      <div className="diet-header">
        <h1 className="diet-title">
          <FontAwesomeIcon icon={faUtensils} className="me-2" />
          Nutrition & Diet
        </h1>
        <p className="diet-subtitle">Manage your programs and track your daily intake in one place</p>
      </div>

      {/* ── Primary Navigation Tabs ── */}
      <div className="diet-primary-tabs">
        <button 
          className={`primary-tab-btn ${primaryTab === "programs" ? "active" : ""}`}
          onClick={() => setPrimaryTab("programs")}
        >
          Nutrition Programs
        </button>
        <button 
          className={`primary-tab-btn ${primaryTab === "tracker" ? "active" : ""}`}
          onClick={() => setPrimaryTab("tracker")}
        >
          Daily Tracker
        </button>
      </div>

      {primaryTab === "programs" ? (
        <div className="programs-view">
          {/* ── Tabs ── */}
          <div className="diet-tabs">
            {dietPlans.map((p: any) => {
              const style = DIET_PLAN_STYLES[p.planId] || DIET_PLAN_STYLES.default;
              return (
                <button
                  key={p.planId}
                  className={`diet-tab-btn${activePlanId === p.planId ? " active" : ""}`}
                  style={
                    activePlanId === p.planId
                      ? { borderColor: style.accentColor, color: style.accentColor, background: `${style.gradientFrom}` }
                      : {}
                  }
                  onClick={() => setActivePlanId(p.planId)}
                >
                  {p.name}
                </button>
              );
            })}
          </div>

          {/* ── Hero Banner ── */}
          <div
            className="diet-hero"
            style={{ background: `linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-primary) 100%)`, borderColor: `${planStyle.accentColor}33` }}
          >
            <div
              className="diet-hero-glow"
              style={{ background: `radial-gradient(ellipse at top right, ${planStyle.gradientFrom} 0%, transparent 60%)` }}
            />
            <div className="diet-hero-inner">
              <div className="diet-hero-left">
                <div className="diet-plan-tag" style={{ color: planStyle.labelColor, borderColor: `${planStyle.labelColor}55`, background: `${planStyle.labelColor}18` }}>
                  {planStyle.label}
                </div>
                <div className="diet-hero-title">{plan.name}</div>
                <p className="diet-hero-desc">{plan.description}</p>
                <div className="diet-chips">
                  <span className="diet-chip" style={{ color: planStyle.accentColor }}>
                    <FontAwesomeIcon icon={faFire} />
                    {plan.calories.toLocaleString()} kcal / day
                  </span>
                  <span className="diet-chip">
                    <FontAwesomeIcon icon={planStyle.goalIcon || faFire} />
                    {plan.goal}
                  </span>
                </div>
              </div>

              {/* ── Macro Ring Summary ── */}
              <div className="diet-macro-summary">
                <div className="macro-box">
                  <div className="macro-icon" style={{ background: "rgba(255,107,107,0.12)", color: "#ff6b6b" }}>
                    <FontAwesomeIcon icon={faDrumstickBite} />
                  </div>
                  <div className="macro-val">{plan.protein}g</div>
                  <div className="macro-label">Protein</div>
                  <MacroBar value={plan.protein} max={300} color="#ff6b6b" />
                </div>
                <div className="macro-box">
                  <div className="macro-icon" style={{ background: "rgba(255,200,50,0.12)", color: "#ffc832" }}>
                    <FontAwesomeIcon icon={faBreadSlice} />
                  </div>
                  <div className="macro-val">{plan.carbs}g</div>
                  <div className="macro-label">Carbs</div>
                  <MacroBar value={plan.carbs} max={450} color="#ffc832" />
                </div>
                <div className="macro-box">
                  <div className="macro-icon" style={{ background: "rgba(80,230,120,0.12)", color: "#50e678" }}>
                    <FontAwesomeIcon icon={faDroplet} />
                  </div>
                  <div className="macro-val">{plan.fat}g</div>
                  <div className="macro-label">Fats</div>
                  <MacroBar value={plan.fat} max={120} color="#50e678" />
                </div>
              </div>
            </div>
          </div>

          {/* ── Daily Meal Schedule ── */}
          <div className="diet-section-heading">
            <FontAwesomeIcon icon={faClock} />
            Daily Meal Schedule
            <span className="diet-kcal-badge">{plan.meals.reduce((s, m) => s + m.calories, 0).toLocaleString()} kcal</span>
          </div>

          <div className="diet-meals-grid">
            {plan.meals.map((meal, i) => (
              <div key={i} className="meal-card" style={{ borderColor: `${planStyle.accentColor}18` }}>
                <div className="meal-card-top">
                  <div className="meal-time-badge">
                    <FontAwesomeIcon icon={faClock} style={{ marginRight: 4, opacity: 0.6 }} />
                    {meal.time}
                  </div>
                  <div className="meal-kcal-pill" style={{ color: planStyle.accentColor, borderColor: `${planStyle.accentColor}30`, background: `${planStyle.accentColor}10` }}>
                    {meal.calories} kcal
                  </div>
                </div>
                <div className="meal-name">{meal.name}</div>
                <ul className="meal-foods">
                  {meal.foods.map((food, j) => (
                    <li key={j} className="meal-food-item">
                      <span className="meal-food-dot" style={{ background: planStyle.accentColor }} />
                      {food}
                    </li>
                  ))}
                </ul>
                <div className="meal-macros">
                  <div className="meal-macro-chip">
                    <span style={{ color: "#ff6b6b" }}>P</span> {meal.protein}g
                  </div>
                  <div className="meal-macro-chip">
                    <span style={{ color: "#ffc832" }}>C</span> {meal.carbs}g
                  </div>
                  <div className="meal-macro-chip">
                    <span style={{ color: "#50e678" }}>F</span> {meal.fat}g
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Nutrition Tips ── */}
          <div className="diet-section-heading" style={{ marginTop: "2rem" }}>
            <FontAwesomeIcon icon={faLeaf} />
            Nutrition Tips
          </div>
          <div className="diet-tips-grid">
            {nutritionTips.map((tip, i) => (
              <div key={i} className="diet-tip-card">
                <div className="diet-tip-icon" style={{ background: tip.color }}>
                  {tip.icon}
                </div>
                <div>
                  <div className="diet-tip-title">{tip.title}</div>
                  <div className="diet-tip-desc">{tip.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="tracker-view">
          <div className="meals-header">
            <div>
              <h2 className="meals-title">
                Daily Food Tracker
              </h2>
              <p className="meals-subtitle">
                {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </p>
            </div>
            <button className="meals-add-btn" onClick={() => setShowForm(true)}>
              <FontAwesomeIcon icon={faPlus} />
              Log Meal
            </button>
          </div>

          {profileInjuries.length > 0 && (
            <div className="injury-banner">
              <div className="injury-banner-left">
                <FontAwesomeIcon icon={faTriangleExclamation} className="injury-banner-icon" />
                <div>
                  <div className="injury-banner-title">Injury Mode Active</div>
                  <div className="injury-banner-sub">
                    Active injur{profileInjuries.length > 1 ? "ies" : "y"}:&nbsp;
                    {profileInjuries.map((inj) => (
                      <span key={inj} className="injury-badge">{inj}</span>
                    ))}
                    &nbsp;— see alternative meal suggestions
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="meals-layout">
            <div className="meals-main">
              <div className="meals-summary-card">
                <div className="summary-top">
                  <div className="summary-cal-ring">
                    <div className="cal-ring-inner">
                      <div className="cal-ring-val">{totals.calories.toLocaleString()}</div>
                      <div className="cal-ring-label">kcal eaten</div>
                    </div>
                    <svg viewBox="0 0 120 120" className="cal-ring-svg">
                      <circle cx="60" cy="60" r="50" fill="none" stroke="var(--bg-surface)" strokeWidth="10" />
                      <circle
                        cx="60" cy="60" r="50" fill="none"
                        stroke={totals.calories > dailyTarget.calories ? "var(--danger)" : "var(--accent-cyan)"}
                        strokeWidth="10"
                        strokeDasharray={`${Math.min(314, (totals.calories / dailyTarget.calories) * 314)} 314`}
                        strokeLinecap="round"
                        transform="rotate(-90 60 60)"
                        style={{ transition: "stroke-dasharray 0.5s ease" }}
                      />
                    </svg>
                  </div>
                  <div className="summary-stats">
                    <div className="summary-stat-item">
                      <div className="summary-stat-val">{dailyTarget.calories.toLocaleString()}</div>
                      <div className="summary-stat-label">Daily Target</div>
                    </div>
                    <div className="summary-stat-item">
                      <div className="summary-stat-val" style={{ color: "#50e678" }}>{remaining.calories.toLocaleString()}</div>
                      <div className="summary-stat-label">Remaining</div>
                    </div>
                    <div className="summary-stat-item">
                      <div className="summary-stat-val">{loggedMeals.length}</div>
                      <div className="summary-stat-label">Meals Logged</div>
                    </div>
                  </div>
                </div>

                <div className="macro-bars">
                  <MacroProgress label="Calories" value={totals.calories} target={dailyTarget.calories} color="#3dffff" icon={faFire} />
                  <div className="macro-progress-grid">
                    <MacroProgress label="Protein" value={totals.protein} target={dailyTarget.protein} color="#ff6b6b" icon={faDrumstickBite} />
                    <MacroProgress label="Carbs" value={totals.carbs} target={dailyTarget.carbs} color="#ffc832" icon={faBreadSlice} />
                    <MacroProgress label="Fats" value={totals.fat} target={dailyTarget.fat} color="#50e678" icon={faDroplet} />
                  </div>
                </div>
              </div>

              <div className="meals-section-heading">
                <FontAwesomeIcon icon={faChartPie} />
                Today's Food Log
              </div>

              {loggedMeals.length === 0 && (
                <div className="meals-empty">
                  <div className="meals-empty-icon">🍽️</div>
                  <div>No meals logged yet. Click <strong>Log Meal</strong> to add your first entry.</div>
                </div>
              )}

              <div className="meal-log-list">
                {loggedMeals.map((meal) => {
                  const cfg = categoryConfig[meal.category] ?? categoryConfig.snack;
                  return (
                    <div key={meal.id} className="meal-log-row">
                      <div className="meal-log-emoji">{cfg.emoji}</div>
                      <div className="meal-log-info">
                        <div className="meal-log-name">{meal.name}</div>
                        <div className="meal-log-meta">
                          <span className="meal-log-cat" style={{ color: cfg.color, borderColor: `${cfg.color}30`, background: `${cfg.color}10` }}>
                            {cfg.label}
                          </span>
                          <FontAwesomeIcon icon={faClock} style={{ color: "var(--text-dim)", fontSize: "0.6rem" }} />
                          <span className="meal-log-time">{meal.time}</span>
                        </div>
                      </div>
                      <div className="meal-log-macros">
                        <span className="mlm-chip cal">{meal.calories} kcal</span>
                        <span className="mlm-chip pro">P {meal.protein}g</span>
                        <span className="mlm-chip carb">C {meal.carbs}g</span>
                        <span className="mlm-chip fat">F {meal.fat}g</span>
                      </div>
                      <button className="meal-log-delete" onClick={() => removeMeal(meal.id)}>
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  );
                })}
              </div>

              {!showForm && (
                <button className="meals-add-row-btn" onClick={() => setShowForm(true)}>
                  <FontAwesomeIcon icon={faPlus} style={{ marginRight: 6 }} />
                  Add another meal
                </button>
              )}
            </div>

            <div className="meals-sidebar">
              {profileInjuries.length > 0 && (
                <div className="alt-meals-card">
                  <div className="alt-meals-header">
                    <FontAwesomeIcon icon={faLeaf} className="alt-meals-icon" />
                    <div>
                      <div className="alt-meals-title">Alternative Meals</div>
                      <div className="alt-meals-sub">Tailored to your injuries</div>
                    </div>
                  </div>

                  <div className="alt-injury-tabs">
                    {profileInjuries.map((inj) => (
                      <button
                        key={inj}
                        className={`alt-injury-tab${activeInjury === inj ? " active" : ""}`}
                        onClick={() => setActiveInjury(inj)}
                      >
                        {inj}
                      </button>
                    ))}
                  </div>

                  {activeAltMeals.length > 0 ? (
                    <div className="alt-meals-list">
                      {activeAltMeals.map((m) => (
                        <div key={m.id} className="alt-meal-item">
                          <div className="alt-meal-emoji">{m.icon}</div>
                          <div className="alt-meal-info">
                            <div className="alt-meal-name">{m.name}</div>
                            <div className="alt-meal-benefit">
                              <FontAwesomeIcon icon={faLightbulb} style={{ color: "#ffc832", marginRight: 4, fontSize: "0.55rem" }} />
                              {m.benefit}
                            </div>
                            <div className="alt-meal-macros">
                              <span>{m.calories} kcal</span>
                              <span>P {m.protein}g</span>
                              <span>C {m.carbs}g</span>
                              <span>F {m.fat}g</span>
                            </div>
                          </div>
                          <button className="alt-meal-add-btn" title="Log this meal" onClick={() => logAltMeal(m)}>
                            <FontAwesomeIcon icon={faPlus} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="alt-no-data">
                      <FontAwesomeIcon icon={faLightbulb} style={{ color: "var(--text-dim)", marginBottom: "0.5rem", fontSize: "1.2rem" }} />
                      <div>No alternative meals defined for this injury yet.</div>
                    </div>
                  )}

                  <div className="alt-disclaimer">
                    <FontAwesomeIcon icon={faTriangleExclamation} style={{ marginRight: 5, color: "#ffc832" }} />
                    Consult your nutritionist before making changes.
                  </div>
                </div>
              )}

              <div className="meals-tip-card">
                <div className="meals-tip-icon">💡</div>
                <div>
                  <div className="meals-tip-title">Tip of the Day</div>
                  <div className="meals-tip-body">
                    Eating within 30 minutes post-workout dramatically improves muscle protein synthesis. Prioritise fast protein.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Meal Modal ── */}
      {showForm && (
        <div className="meal-modal-backdrop" onClick={() => setShowForm(false)}>
          <div className="meal-modal" onClick={(e) => e.stopPropagation()}>
            <div className="meal-modal-header">
              <div className="meal-modal-title">
                <FontAwesomeIcon icon={faPlus} style={{ color: "var(--accent-cyan)", marginRight: 8 }} />
                Log a Meal
              </div>
              <button className="meal-modal-close" onClick={() => setShowForm(false)}>
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            <div className="meal-modal-body">
              <label className="meal-form-label">Category</label>
              <div className="meal-cat-grid">
                {(Object.keys(categoryConfig) as Array<keyof typeof categoryConfig>).map((cat) => (
                  <button
                    key={cat}
                    className={`meal-cat-btn${form.category === cat ? " active" : ""}`}
                    style={form.category === cat ? { borderColor: categoryConfig[cat].color, color: categoryConfig[cat].color, background: `${categoryConfig[cat].color}14` } : {}}
                    onClick={() => setForm((f) => ({ ...f, category: cat }))}
                  >
                    {categoryConfig[cat].emoji} {categoryConfig[cat].label}
                  </button>
                ))}
              </div>

              <div className="meal-form-row">
                <div className="meal-form-group">
                  <label className="meal-form-label">Time</label>
                  <input className="meal-form-input" type="time" value={form.time} onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))} />
                </div>
                <div className="meal-form-group" style={{ flex: 2 }}>
                  <label className="meal-form-label">Meal Name *</label>
                  <input className="meal-form-input" placeholder="e.g. Chicken & Rice Bowl" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                </div>
              </div>

              <div className="meal-form-row">
                {[
                  { key: "calories", label: "Calories *", unit: "kcal", color: "#3dffff" },
                  { key: "protein",  label: "Protein",    unit: "g",    color: "#ff6b6b" },
                  { key: "carbs",    label: "Carbs",      unit: "g",    color: "#ffc832" },
                  { key: "fat",      label: "Fat",        unit: "g",    color: "#50e678" },
                ].map(({ key, label, unit, color }) => (
                  <div key={key} className="meal-form-group">
                    <label className="meal-form-label" style={{ color }}>{label}</label>
                    <div className="meal-form-input-wrap">
                      <input
                        className="meal-form-input"
                        type="number"
                        min={0}
                        placeholder="0"
                        value={form[key as keyof typeof form]}
                        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                      />
                      <span className="meal-form-unit">{unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="meal-modal-footer">
              <button className="meal-modal-cancel" onClick={() => setShowForm(false)}>Cancel</button>
              <button
                className="meal-modal-submit"
                onClick={addMeal}
                disabled={!form.name || !form.calories}
              >
                <FontAwesomeIcon icon={faCheck} style={{ marginRight: 6 }} />
                Log Meal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Diet;
