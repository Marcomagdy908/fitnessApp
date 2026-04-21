import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
} from "@fortawesome/free-solid-svg-icons";
import "../css/diet.css";

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

interface DietPlan {
  id: string;
  label: string;
  labelColor: string;
  name: string;
  goal: string;
  goalIcon: any;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  meals: Meal[];
  accentColor: string;
  gradientFrom: string;
  gradientTo: string;
}

/* ─── Diet Plan Data ─────────────────────────────────────────── */
const dietPlans: DietPlan[] = [
  /* ── Bulking ─────────────────────────────────────────────── */
  {
    id: "bulk",
    label: "Mass Gain",
    labelColor: "#ff6b6b",
    name: "Bulking Plan",
    goal: "Muscle & Mass",
    goalIcon: faArrowTrendUp,
    description:
      "A calorie-surplus plan engineered for maximum muscle growth. High protein to protect and build lean mass, generous carbohydrates to fuel heavy training sessions, and enough healthy fats for hormonal balance. Target: +300–500 kcal above TDEE.",
    calories: 3200,
    protein: 220,
    carbs: 380,
    fat: 80,
    accentColor: "#ff6b6b",
    gradientFrom: "rgba(255,107,107,0.10)",
    gradientTo: "rgba(255,107,107,0.02)",
    meals: [
      {
        time: "7:00 AM",
        name: "Breakfast",
        foods: ["5 whole eggs + 3 egg whites scrambled", "2 cups oatmeal with banana", "250 ml whole milk"],
        calories: 750,
        protein: 48,
        carbs: 85,
        fat: 22,
      },
      {
        time: "10:00 AM",
        name: "Mid-Morning Snack",
        foods: ["Greek yogurt (300 g)", "2 tbsp honey", "30 g mixed nuts"],
        calories: 420,
        protein: 28,
        carbs: 40,
        fat: 16,
      },
      {
        time: "1:00 PM",
        name: "Lunch",
        foods: ["200 g chicken breast", "300 g white rice", "Broccoli & olive oil"],
        calories: 680,
        protein: 55,
        carbs: 90,
        fat: 12,
      },
      {
        time: "4:00 PM",
        name: "Pre-Workout",
        foods: ["2 bananas", "Whey protein shake (40 g)", "Rice cakes (3)"],
        calories: 480,
        protein: 35,
        carbs: 75,
        fat: 4,
      },
      {
        time: "7:00 PM",
        name: "Post-Workout Dinner",
        foods: ["200 g lean beef mince", "300 g pasta", "Tomato & mixed veg sauce"],
        calories: 680,
        protein: 48,
        carbs: 75,
        fat: 18,
      },
      {
        time: "9:30 PM",
        name: "Night Snack",
        foods: ["Casein protein shake (40 g)", "1 tbsp peanut butter", "250 ml low-fat milk"],
        calories: 380,
        protein: 38,
        carbs: 22,
        fat: 14,
      },
    ],
  },

  /* ── Cutting ─────────────────────────────────────────────── */
  {
    id: "cut",
    label: "Fat Loss",
    labelColor: "var(--accent-cyan)",
    name: "Cutting Plan",
    goal: "Fat Loss & Definition",
    goalIcon: faArrowTrendDown,
    description:
      "A moderate calorie-deficit plan designed to preserve hard-earned muscle while shedding body fat. High protein to maintain lean mass, controlled carbs timed around training, and healthy fats for satiety. Target: −400–600 kcal below TDEE.",
    calories: 2000,
    protein: 200,
    carbs: 170,
    fat: 55,
    accentColor: "var(--accent-cyan)",
    gradientFrom: "rgba(61,255,255,0.10)",
    gradientTo: "rgba(61,255,255,0.02)",
    meals: [
      {
        time: "7:00 AM",
        name: "Breakfast",
        foods: ["4 egg whites + 1 whole egg omelette", "1 cup oatmeal with berries", "Black coffee"],
        calories: 380,
        protein: 42,
        carbs: 38,
        fat: 8,
      },
      {
        time: "10:00 AM",
        name: "Mid-Morning Snack",
        foods: ["Cottage cheese (250 g)", "Cucumber & celery sticks", "Green tea"],
        calories: 220,
        protein: 30,
        carbs: 12,
        fat: 5,
      },
      {
        time: "1:00 PM",
        name: "Lunch",
        foods: ["200 g grilled chicken breast", "Large mixed salad (spinach, peppers, tomato)", "1 tbsp olive oil & lemon"],
        calories: 380,
        protein: 50,
        carbs: 18,
        fat: 14,
      },
      {
        time: "4:00 PM",
        name: "Pre-Workout",
        foods: ["Whey protein shake (35 g)", "1 apple", "Espresso"],
        calories: 250,
        protein: 30,
        carbs: 28,
        fat: 3,
      },
      {
        time: "7:00 PM",
        name: "Post-Workout Dinner",
        foods: ["180 g salmon fillet", "300 g roasted sweet potato", "Asparagus & lemon"],
        calories: 520,
        protein: 44,
        carbs: 50,
        fat: 16,
      },
      {
        time: "9:00 PM",
        name: "Night Snack",
        foods: ["Casein protein shake (30 g)", "1 tbsp almond butter"],
        calories: 250,
        protein: 28,
        carbs: 10,
        fat: 12,
      },
    ],
  },

  /* ── Maintenance ─────────────────────────────────────────── */
  {
    id: "maintain",
    label: "Lifestyle",
    labelColor: "#a98dff",
    name: "Maintenance Plan",
    goal: "Health & Performance",
    goalIcon: faScaleBalanced,
    description:
      "Eating at TDEE (Total Daily Energy Expenditure) to maintain weight and body composition while supporting performance and overall health. Balanced macros, nutrient-dense whole foods, and flexible meal timing.",
    calories: 2600,
    protein: 180,
    carbs: 290,
    fat: 70,
    accentColor: "#a98dff",
    gradientFrom: "rgba(169,141,255,0.10)",
    gradientTo: "rgba(169,141,255,0.02)",
    meals: [
      {
        time: "7:30 AM",
        name: "Breakfast",
        foods: ["Greek yogurt parfait (300 g)", "Granola (40 g)", "Mixed berries", "Coffee with milk"],
        calories: 500,
        protein: 32,
        carbs: 68,
        fat: 12,
      },
      {
        time: "10:30 AM",
        name: "Snack",
        foods: ["Handful of almonds (30 g)", "1 banana", "Green tea"],
        calories: 280,
        protein: 8,
        carbs: 32,
        fat: 14,
      },
      {
        time: "1:00 PM",
        name: "Lunch",
        foods: ["Turkey & avocado wrap", "Side salad", "250 ml water"],
        calories: 580,
        protein: 42,
        carbs: 58,
        fat: 18,
      },
      {
        time: "3:30 PM",
        name: "Pre-Workout",
        foods: ["2 rice cakes with peanut butter", "Whey protein shake (25 g)"],
        calories: 340,
        protein: 28,
        carbs: 38,
        fat: 8,
      },
      {
        time: "7:00 PM",
        name: "Dinner",
        foods: ["150 g chicken breast", "200 g quinoa", "Roasted Mediterranean veg"],
        calories: 580,
        protein: 48,
        carbs: 68,
        fat: 12,
      },
      {
        time: "9:00 PM",
        name: "Evening Snack",
        foods: ["Cottage cheese (150 g)", "1 tbsp honey", "Chamomile tea"],
        calories: 200,
        protein: 22,
        carbs: 20,
        fat: 4,
      },
    ],
  },
];

/* ─── Nutrition Tips ─────────────────────────────────────────── */
const nutritionTips = [
  {
    icon: "💧",
    color: "rgba(61,255,255,0.12)",
    title: "Stay Hydrated",
    desc: "Drink 35–40 ml of water per kg of bodyweight daily. Dehydration kills performance.",
  },
  {
    icon: "⏰",
    color: "rgba(255,200,50,0.12)",
    title: "Meal Timing",
    desc: "Eat a protein-rich meal within 2 hours post-workout to maximise muscle protein synthesis.",
  },
  {
    icon: "🥦",
    color: "rgba(80,230,120,0.12)",
    title: "Micronutrients",
    desc: "Fill at least half your plate with vegetables to hit your vitamin and mineral targets.",
  },
  {
    icon: "🏷️",
    color: "rgba(169,141,255,0.12)",
    title: "Track Everything",
    desc: "Use a calorie app for 2–4 weeks to build awareness of portion sizes and macro splits.",
  },
];

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
  const [activeId, setActiveId] = useState<string>("bulk");
  const plan = dietPlans.find((p) => p.id === activeId)!;

  const totalCaloriesFromMeals = plan.meals.reduce((s, m) => s + m.calories, 0);

  return (
    <div className="diet-page">
      {/* ── Header ── */}
      <div className="diet-header">
        <h1 className="diet-title">
          <FontAwesomeIcon icon={faUtensils} className="me-2" />
          Nutrition Programs
        </h1>
        <p className="diet-subtitle">Designed by our in-house nutritionists — pick a plan that matches your body goal</p>
      </div>

      {/* ── Tabs ── */}
      <div className="diet-tabs">
        {dietPlans.map((p) => (
          <button
            key={p.id}
            className={`diet-tab-btn${activeId === p.id ? " active" : ""}`}
            style={
              activeId === p.id
                ? { borderColor: p.accentColor, color: p.accentColor, background: `${p.gradientFrom}` }
                : {}
            }
            onClick={() => setActiveId(p.id)}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* ── Hero Banner ── */}
      <div
        className="diet-hero"
        style={{ background: `linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-primary) 100%)`, borderColor: `${plan.accentColor}33` }}
      >
        <div
          className="diet-hero-glow"
          style={{ background: `radial-gradient(ellipse at top right, ${plan.gradientFrom} 0%, transparent 60%)` }}
        />
        <div className="diet-hero-inner">
          <div className="diet-hero-left">
            <div className="diet-plan-tag" style={{ color: plan.labelColor, borderColor: `${plan.labelColor}55`, background: `${plan.labelColor}18` }}>
              {plan.label}
            </div>
            <div className="diet-hero-title">{plan.name}</div>
            <p className="diet-hero-desc">{plan.description}</p>
            <div className="diet-chips">
              <span className="diet-chip" style={{ color: plan.accentColor }}>
                <FontAwesomeIcon icon={faFire} />
                {plan.calories.toLocaleString()} kcal / day
              </span>
              <span className="diet-chip">
                <FontAwesomeIcon icon={plan.goalIcon} />
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
        <span className="diet-kcal-badge">{totalCaloriesFromMeals.toLocaleString()} kcal</span>
      </div>

      <div className="diet-meals-grid">
        {plan.meals.map((meal, i) => (
          <div key={i} className="meal-card" style={{ borderColor: `${plan.accentColor}18` }}>
            <div className="meal-card-top">
              <div className="meal-time-badge">
                <FontAwesomeIcon icon={faClock} style={{ marginRight: 4, opacity: 0.6 }} />
                {meal.time}
              </div>
              <div className="meal-kcal-pill" style={{ color: plan.accentColor, borderColor: `${plan.accentColor}30`, background: `${plan.accentColor}10` }}>
                {meal.calories} kcal
              </div>
            </div>
            <div className="meal-name">{meal.name}</div>
            <ul className="meal-foods">
              {meal.foods.map((food, j) => (
                <li key={j} className="meal-food-item">
                  <span className="meal-food-dot" style={{ background: plan.accentColor }} />
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
  );
}

export default Diet;
