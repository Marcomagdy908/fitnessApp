import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUtensils,
  faPlus,
  faTrash,
  faFire,
  faDrumstickBite,
  faBreadSlice,
  faDroplet,
  faClock,
  faCheck,
  faTriangleExclamation,
  faLeaf,
  faLightbulb,
  faXmark,
  faChartPie,
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

/* ─── Alternative meals for injured users ────────────────────── */
const alternativeMeals: Record<string, { icon: string; name: string; benefit: string; calories: number; protein: number; carbs: number; fat: number }[]> = {
  "Lower Back": [
    { icon: "🐟", name: "Grilled Salmon + Quinoa", benefit: "Omega-3s reduce spinal inflammation", calories: 520, protein: 42, carbs: 40, fat: 18 },
    { icon: "🥑", name: "Avocado & Egg Toast", benefit: "Healthy fats support nerve recovery", calories: 380, protein: 18, carbs: 28, fat: 22 },
    { icon: "🍵", name: "Turmeric Chicken Soup", benefit: "Curcumin is a natural anti-inflammatory", calories: 310, protein: 36, carbs: 20, fat: 8 },
  ],
  "Knee": [
    { icon: "🦴", name: "Bone Broth + Vegetables", benefit: "Collagen rebuilds cartilage", calories: 180, protein: 14, carbs: 12, fat: 4 },
    { icon: "🍦", name: "Greek Yogurt & Berries", benefit: "Antioxidants reduce joint swelling", calories: 220, protein: 18, carbs: 24, fat: 4 },
    { icon: "🥦", name: "Broccoli & Chicken Stir-fry", benefit: "Sulforaphane protects joint tissue", calories: 440, protein: 48, carbs: 24, fat: 12 },
  ],
  "Shoulder": [
    { icon: "🥜", name: "Almond Butter Smoothie", benefit: "Vitamin E speeds tendon healing", calories: 380, protein: 20, carbs: 36, fat: 16 },
    { icon: "🍳", name: "Eggs & Spinach Omelette", benefit: "Collagen amino acids repair rotator cuff", calories: 290, protein: 28, carbs: 6, fat: 16 },
    { icon: "🍠", name: "Sweet Potato & Turkey Bowl", benefit: "Beta-carotene reduces inflammation", calories: 480, protein: 42, carbs: 48, fat: 8 },
  ],
  "Wrist": [
    { icon: "🍊", name: "Citrus Fruit Salad", benefit: "Vitamin C boosts collagen synthesis", calories: 140, protein: 2, carbs: 34, fat: 1 },
    { icon: "🐚", name: "Shrimp & Brown Rice", benefit: "Selenium supports tendon repair", calories: 380, protein: 38, carbs: 42, fat: 6 },
    { icon: "🥛", name: "Kefir & Banana Smoothie", benefit: "Probiotics reduce systemic inflammation", calories: 260, protein: 14, carbs: 44, fat: 4 },
  ],
};

/* ─── Calorie targets (matches settings defaults) ────────────── */
const DAILY_TARGET = { calories: 2400, protein: 180, carbs: 270, fat: 70 };

/* ─── Seed data ──────────────────────────────────────────────── */
const seedMeals: LoggedMeal[] = [
  { id: 1, time: "07:30", name: "Oatmeal + Protein Shake", calories: 480, protein: 42, carbs: 62, fat: 8, category: "breakfast" },
  { id: 2, time: "10:00", name: "Greek Yogurt & Berries", calories: 220, protein: 18, carbs: 24, fat: 4, category: "snack" },
  { id: 3, time: "13:00", name: "Chicken & Rice Bowl", calories: 660, protein: 52, carbs: 80, fat: 12, category: "lunch" },
];

/* ─── Category config ────────────────────────────────────────── */
const categoryConfig = {
  breakfast: { label: "Breakfast", color: "#ffc832", emoji: "🌅" },
  lunch:     { label: "Lunch",     color: "#3dffff", emoji: "☀️" },
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
        <span className="mp-value" style={{ color: over ? "#ff6b6b" : "#bbb" }}>
          {value}<span className="mp-target">/{target}{label === "Calories" ? " kcal" : "g"}</span>
        </span>
      </div>
      <div className="mp-track">
        <div className="mp-fill" style={{ width: `${pct}%`, background: over ? "#ff5050" : color }} />
      </div>
      <div className="mp-pct" style={{ color: over ? "#ff6b6b" : "#444" }}>{pct}%{over ? " — over target" : ""}</div>
    </div>
  );
}

/* ─── Component ──────────────────────────────────────────────── */
function MealsTracker() {
  const [meals, setMeals] = useState<LoggedMeal[]>(seedMeals);
  const [showForm, setShowForm] = useState(false);
  const [activeInjury, setActiveInjury] = useState<string | null>("Lower Back"); // from profile

  /* injuries from profile (placeholder state – swappable from Settings) */
  const profileInjuries = ["Lower Back", "Knee"]; // placeholder

  /* form state */
  const [form, setForm] = useState({ time: "", name: "", calories: "", protein: "", carbs: "", fat: "", category: "snack" as LoggedMeal["category"] });

  const totals = meals.reduce(
    (acc, m) => ({ calories: acc.calories + m.calories, protein: acc.protein + m.protein, carbs: acc.carbs + m.carbs, fat: acc.fat + m.fat }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const addMeal = () => {
    if (!form.name || !form.calories) return;
    const newMeal: LoggedMeal = {
      id: Date.now(),
      time: form.time || new Date().toTimeString().slice(0, 5),
      name: form.name,
      calories: Number(form.calories),
      protein: Number(form.protein) || 0,
      carbs: Number(form.carbs) || 0,
      fat: Number(form.fat) || 0,
      category: form.category,
    };
    setMeals((prev) => [...prev, newMeal].sort((a, b) => a.time.localeCompare(b.time)));
    setForm({ time: "", name: "", calories: "", protein: "", carbs: "", fat: "", category: "snack" });
    setShowForm(false);
  };

  const removeMeal = (id: number) => setMeals((prev) => prev.filter((m) => m.id !== id));

  const remaining = {
    calories: Math.max(0, DAILY_TARGET.calories - totals.calories),
  };

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
                Your profile has {profileInjuries.length} active injur{profileInjuries.length > 1 ? "ies" : "y"}:&nbsp;
                {profileInjuries.map((inj, i) => (
                  <span key={inj} className="injury-badge">
                    {inj}{i < profileInjuries.length - 1 ? "" : ""}
                  </span>
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
                  <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                  <circle
                    cx="60" cy="60" r="50" fill="none"
                    stroke={totals.calories > DAILY_TARGET.calories ? "#ff5050" : "#3dffff"}
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
              const cfg = categoryConfig[meal.category];
              return (
                <div key={meal.id} className="meal-log-row">
                  <div className="meal-log-emoji">{cfg.emoji}</div>
                  <div className="meal-log-info">
                    <div className="meal-log-name">{meal.name}</div>
                    <div className="meal-log-meta">
                      <span className="meal-log-cat" style={{ color: cfg.color, borderColor: `${cfg.color}30`, background: `${cfg.color}10` }}>
                        {cfg.label}
                      </span>
                      <FontAwesomeIcon icon={faClock} style={{ color: "#333", fontSize: "0.6rem" }} />
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

          {/* ── Add Meal Button (also in header) ── */}
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
              {activeInjury && alternativeMeals[activeInjury] ? (
                <div className="alt-meals-list">
                  {alternativeMeals[activeInjury].map((m, i) => (
                    <div key={i} className="alt-meal-item">
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
                      <button
                        className="alt-meal-add-btn"
                        title="Log this meal"
                        onClick={() => {
                          const time = new Date().toTimeString().slice(0, 5);
                          setMeals((prev) => [...prev, { id: Date.now(), time, name: m.name, calories: m.calories, protein: m.protein, carbs: m.carbs, fat: m.fat, category: "snack" }]);
                        }}
                      >
                        <FontAwesomeIcon icon={faPlus} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="alt-no-data">
                  <FontAwesomeIcon icon={faLightbulb} style={{ color: "#333", marginBottom: "0.5rem", fontSize: "1.2rem" }} />
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
                <FontAwesomeIcon icon={faPlus} style={{ color: "#3dffff", marginRight: 8 }} />
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
