import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUtensils, faPlus, faTrash, faFire, faDrumstickBite,
  faBreadSlice, faDroplet, faClock, faCheck, faTriangleExclamation,
  faLeaf, faLightbulb, faXmark, faChartPie,
} from "@fortawesome/free-solid-svg-icons";
import "../css/meals.css";

/* ─── Types ─────────────────────────────────────────────────── */
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

/* ─── Calorie targets ────────────────────────────────────────── */
const DAILY_TARGET = { calories: 2400, protein: 180, carbs: 270, fat: 70 };

/* ─── Category config ────────────────────────────────────────── */
const categoryConfig = {
  breakfast: { label: "Breakfast", color: "#ffc832", emoji: "🌅" },
  lunch:     { label: "Lunch",     color: "var(--accent-cyan)", emoji: "☀️" },
  dinner:    { label: "Dinner",    color: "#a98dff", emoji: "🌙" },
  snack:     { label: "Snack",     color: "#50e678", emoji: "🍎" },
};

/* ─── Macro progress bar ─────────────────────────────────────── */
function MacroProgress({ label, value, target, color, icon }: { label: string; value: number; target: number; color: string; icon: any }) {
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

/* ─── Component ──────────────────────────────────────────────── */
function MealsTracker() {
  const [meals, setMeals] = useState<LoggedMeal[]>([]);
  const [altMeals, setAltMeals] = useState<AltMeal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [activeInjury, setActiveInjury] = useState<string | null>(null);

  /* form state */
  const [form, setForm] = useState({
    time: "", name: "", calories: "", protein: "", carbs: "", fat: "",
    category: "snack" as LoggedMeal["category"],
  });

  /* ── Fetch today's meals ── */
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    fetch(`/api/meals?date=${today}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setMeals(
            data.data.map((m: any) => ({
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
  }, []);

  /* ── Fetch alternative meals (all injuries) ── */
  useEffect(() => {
    fetch("/api/meals/alternatives")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data.length > 0) {
          setAltMeals(data.data);
          setActiveInjury(data.data[0].injury);
        }
      });
  }, []);

  /* Unique injury list */
  const profileInjuries = [...new Set(altMeals.map((m) => m.injury))];

  const totals = meals.reduce(
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
    const res = await fetch("/api/meals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (data.success) {
      const m = data.data;
      setMeals((prev) => [...prev, {
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
    await fetch(`/api/meals/${id}`, { method: "DELETE" });
    setMeals((prev) => prev.filter((m) => m.id !== id));
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
    const res = await fetch("/api/meals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (data.success) {
      const meal = data.data;
      setMeals((prev) => [...prev, {
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

  const remaining = { calories: Math.max(0, DAILY_TARGET.calories - totals.calories) };
  const activeAltMeals = altMeals.filter((m) => m.injury === activeInjury);

  return (
    <div className="meals-page">

      {/* ── Header ── */}
      <div className="meals-header">
        <div>
          <h1 className="meals-title">
            <FontAwesomeIcon icon={faUtensils} className="me-2" />
            Meals Tracker
          </h1>
          <p className="meals-subtitle">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>
        <button className="meals-add-btn" onClick={() => setShowForm(true)}>
          <FontAwesomeIcon icon={faPlus} />
          Log Meal
        </button>
      </div>

      {/* ── Injury Alert Banner ── */}
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
                &nbsp;— see alternative meal suggestions below
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="meals-layout">
        {/* ── Left column: log ── */}
        <div className="meals-main">

          {/* ── Daily Summary ── */}
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
                    stroke={totals.calories > DAILY_TARGET.calories ? "var(--danger)" : "var(--accent-cyan)"}
                    strokeWidth="10"
                    strokeDasharray={`${Math.min(314, (totals.calories / DAILY_TARGET.calories) * 314)} 314`}
                    strokeLinecap="round"
                    transform="rotate(-90 60 60)"
                    style={{ transition: "stroke-dasharray 0.5s ease" }}
                  />
                </svg>
              </div>
              <div className="summary-stats">
                <div className="summary-stat-item">
                  <div className="summary-stat-val">{DAILY_TARGET.calories.toLocaleString()}</div>
                  <div className="summary-stat-label">Daily Target</div>
                </div>
                <div className="summary-stat-item">
                  <div className="summary-stat-val" style={{ color: "#50e678" }}>{remaining.calories.toLocaleString()}</div>
                  <div className="summary-stat-label">Remaining</div>
                </div>
                <div className="summary-stat-item">
                  <div className="summary-stat-val">{meals.length}</div>
                  <div className="summary-stat-label">Meals Logged</div>
                </div>
              </div>
            </div>

            {/* Macro bars */}
            <div className="macro-bars">
              <MacroProgress label="Calories" value={totals.calories} target={DAILY_TARGET.calories} color="#3dffff" icon={faFire} />
              <MacroProgress label="Protein"  value={totals.protein}  target={DAILY_TARGET.protein}  color="#ff6b6b" icon={faDrumstickBite} />
              <MacroProgress label="Carbs"    value={totals.carbs}    target={DAILY_TARGET.carbs}    color="#ffc832" icon={faBreadSlice} />
              <MacroProgress label="Fat"      value={totals.fat}      target={DAILY_TARGET.fat}      color="#50e678" icon={faDroplet} />
            </div>
          </div>

          {/* ── Meal Log ── */}
          <div className="meals-section-heading">
            <FontAwesomeIcon icon={faChartPie} />
            Today's Food Log
          </div>

          {meals.length === 0 && (
            <div className="meals-empty">
              <div className="meals-empty-icon">🍽️</div>
              <div>No meals logged yet. Click <strong>Log Meal</strong> to add your first entry.</div>
            </div>
          )}

          <div className="meal-log-list">
            {meals.map((meal) => {
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

        {/* ── Right column: sidebar ── */}
        <div className="meals-sidebar">

          {/* ── Injury-Aware Alternative Meals ── */}
          {profileInjuries.length > 0 && (
            <div className="alt-meals-card">
              <div className="alt-meals-header">
                <FontAwesomeIcon icon={faLeaf} className="alt-meals-icon" />
                <div>
                  <div className="alt-meals-title">Alternative Meals</div>
                  <div className="alt-meals-sub">Tailored to your injuries</div>
                </div>
              </div>

              {/* Injury selector tabs */}
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

              {/* Meals for selected injury */}
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
                Consult your nutritionist before making major dietary changes.
              </div>
            </div>
          )}

          {/* ── Quick Tip Card ── */}
          <div className="meals-tip-card">
            <div className="meals-tip-icon">💡</div>
            <div>
              <div className="meals-tip-title">Tip of the Day</div>
              <div className="meals-tip-body">
                Eating within 30 minutes post-workout dramatically improves muscle protein synthesis. Prioritise fast protein (whey or eggs) in your post-workout meal.
              </div>
            </div>
          </div>
        </div>
      </div>

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
              {/* Category selector */}
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

              {/* Time & Name */}
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

              {/* Macros */}
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
                        value={(form as any)[key]}
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

export default MealsTracker;
