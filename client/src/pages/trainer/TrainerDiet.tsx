import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAppleWhole,
  faFire,
  faPlus,
  faTrash,
  faPen,
  faUtensils,
  faBullseye,
  faDroplet,
} from "@fortawesome/free-solid-svg-icons";
import "../../css/trainerDiet.css";

/* ─── Types ───────────────────────────── */
interface Meal {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface DietPlan {
  id: string;
  name: string;
  goal: string;
  description: string;
  caloriesTarget: number;
  meals: Meal[];
}

/* ─── Data ───────────────────────────── */
const initialDiets: DietPlan[] = [
  {
    id: "1",
    name: "Fat Loss Diet",
    goal: "Cutting",
    description: "High protein low carb diet for fat loss.",
    caloriesTarget: 1800,
    meals: [
      { name: "Chicken & Rice", calories: 450, protein: 35, carbs: 40, fat: 10 },
      { name: "Oats", calories: 300, protein: 10, carbs: 50, fat: 5 },
    ],
  },
  {
    id: "2",
    name: "Muscle Gain Diet",
    goal: "Bulking",
    description: "Calorie surplus diet for muscle growth.",
    caloriesTarget: 2600,
    meals: [
      { name: "Steak & Potatoes", calories: 700, protein: 45, carbs: 60, fat: 20 },
      { name: "Protein Shake", calories: 250, protein: 30, carbs: 10, fat: 5 },
    ],
  },
];

const GOAL_COLORS: Record<string, string> = {
  Cutting: "cyan",
  Bulking: "purple",
  Maintenance: "green",
  Recomp: "gold",
};

/* ─── Component ───────────────────────── */
export default function TrainerDiet() {
  const [diets, setDiets] = useState<DietPlan[]>(initialDiets);
  const [editDiet, setEditDiet] = useState<DietPlan | null>(null);

  const deleteDiet = (id: string) => setDiets(prev => prev.filter(d => d.id !== id));
  const openEdit = (diet: DietPlan) => setEditDiet({ ...diet });
  const saveEdit = () => {
    if (!editDiet) return;
    setDiets(prev => prev.map(d => (d.id === editDiet.id ? editDiet : d)));
    setEditDiet(null);
  };

  const updateMeal = (index: number, field: string, value: any) => {
    if (!editDiet) return;
    const updatedMeals = [...editDiet.meals];
    updatedMeals[index] = { ...updatedMeals[index], [field]: value };
    setEditDiet({ ...editDiet, meals: updatedMeals });
  };

  const addMeal = () => {
    if (!editDiet) return;
    setEditDiet({ ...editDiet, meals: [...editDiet.meals, { name: "", calories: 0, protein: 0, carbs: 0, fat: 0 }] });
  };

  const deleteMeal = (index: number) => {
    if (!editDiet) return;
    setEditDiet({ ...editDiet, meals: editDiet.meals.filter((_, i) => i !== index) });
  };

  const totalMealCals = (meals: Meal[]) => meals.reduce((acc, m) => acc + m.calories, 0);

  return (
    <div className="tr-diet-wrapper">
      {/* HEADER */}
      <div className="tr-diet-header">
        <div>
          <h1>Trainer Diet Plans</h1>
          <p>Manage nutrition plans for your clients</p>
        </div>
        <div className="tr-diet-header-badge">
          <FontAwesomeIcon icon={faAppleWhole} />
          <span>{diets.length} Active Plans</span>
        </div>
      </div>

      {/* GRID */}
      <div className="tr-diet-grid">
        {diets.map((diet, idx) => {
          const goalColor = GOAL_COLORS[diet.goal] ?? "purple";
          const totalCals = totalMealCals(diet.meals);
          const pct = Math.min(100, Math.round((totalCals / diet.caloriesTarget) * 100));

          return (
            <div key={diet.id} className={`tr-diet-card tr-diet-card-${goalColor}`} style={{ animationDelay: `${idx * 0.1}s` }}>
              <div className="tr-diet-top">
                <h3>{diet.name}</h3>
                <span className={`tr-diet-badge tr-diet-badge-${goalColor}`}>{diet.goal}</span>
              </div>

              <p className="tr-diet-desc">{diet.description}</p>

              {/* Calorie progress */}
              <div className="tr-diet-cal-row">
                <FontAwesomeIcon icon={faFire} className="tr-diet-cal-icon" />
                <span className="tr-diet-cal-label">
                  {totalCals} / {diet.caloriesTarget} kcal
                </span>
                <span className="tr-diet-cal-pct">{pct}%</span>
              </div>
              <div className="tr-diet-cal-bar">
                <div className="tr-diet-cal-fill" style={{ width: `${pct}%` }} />
              </div>

              {/* Meals */}
              <div className="tr-meal-list">
                <div className="tr-meal-list-header">
                  <FontAwesomeIcon icon={faUtensils} />
                  <span>Meals ({diet.meals.length})</span>
                </div>
                {diet.meals.map((m, i) => (
                  <div key={i} className="tr-meal-row">
                    <span className="tr-meal-row-name">{m.name}</span>
                    <span className="tr-meal-row-cal">{m.calories} kcal</span>
                    <div className="tr-meal-macros">
                      <span className="tr-macro-tag tr-macro-p">P {m.protein}g</span>
                      <span className="tr-macro-tag tr-macro-c">C {m.carbs}g</span>
                      <span className="tr-macro-tag tr-macro-f">F {m.fat}g</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="tr-diet-actions">
                <button className="tr-diet-btn-edit" onClick={() => openEdit(diet)}>
                  <FontAwesomeIcon icon={faPen} /> Edit
                </button>
                <button className="tr-diet-btn-delete" onClick={() => deleteDiet(diet.id)}>
                  <FontAwesomeIcon icon={faTrash} /> Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── MODAL ─── */}
      {editDiet && (
        <div className="tr-modal-overlay" onClick={() => setEditDiet(null)}>
          <div className="tr-modal-box tr-diet-modal" onClick={e => e.stopPropagation()}>
            <div className="tr-modal-header">
              <FontAwesomeIcon icon={faAppleWhole} className="tr-modal-header-icon" />
              <h2>Edit Diet Plan</h2>
            </div>

            <div className="tr-modal-section">
              <label className="tr-modal-label">Plan Name</label>
              <input className="tr-modal-input" placeholder="Diet Name" value={editDiet.name}
                onChange={e => setEditDiet({ ...editDiet, name: e.target.value })} />

              <div className="tr-modal-row-2">
                <div>
                  <label className="tr-modal-label">Goal</label>
                  <input className="tr-modal-input" placeholder="Goal" value={editDiet.goal}
                    onChange={e => setEditDiet({ ...editDiet, goal: e.target.value })} />
                </div>
                <div>
                  <label className="tr-modal-label">
                    <FontAwesomeIcon icon={faBullseye} /> Calories Target
                  </label>
                  <input className="tr-modal-input" type="number" placeholder="Calories" value={editDiet.caloriesTarget}
                    onChange={e => setEditDiet({ ...editDiet, caloriesTarget: Number(e.target.value) })} />
                </div>
              </div>

              <label className="tr-modal-label">Description</label>
              <textarea className="tr-modal-input tr-modal-textarea" placeholder="Description" value={editDiet.description}
                onChange={e => setEditDiet({ ...editDiet, description: e.target.value })} />
            </div>

            <div className="tr-modal-section">
              <div className="tr-section-title">
                <span><FontAwesomeIcon icon={faUtensils} /> Meals</span>
                <button className="tr-add-meal" onClick={addMeal}>
                  <FontAwesomeIcon icon={faPlus} /> Add Meal
                </button>
              </div>

              {editDiet.meals.map((meal, i) => (
                <div key={i} className="tr-meal-edit-card">
                  <input className="tr-meal-edit-input tr-meal-name-input" placeholder="Meal name" value={meal.name}
                    onChange={e => updateMeal(i, "name", e.target.value)} />
                  <div className="tr-meal-edit-macros">
                    <div className="tr-meal-macro-field">
                      <span className="tr-meal-macro-label"><FontAwesomeIcon icon={faFire} /> kcal</span>
                      <input type="number" value={meal.calories} onChange={e => updateMeal(i, "calories", Number(e.target.value))} />
                    </div>
                    <div className="tr-meal-macro-field">
                      <span className="tr-meal-macro-label">Protein</span>
                      <input type="number" value={meal.protein} onChange={e => updateMeal(i, "protein", Number(e.target.value))} />
                    </div>
                    <div className="tr-meal-macro-field">
                      <span className="tr-meal-macro-label"><FontAwesomeIcon icon={faDroplet} /> Carbs</span>
                      <input type="number" value={meal.carbs} onChange={e => updateMeal(i, "carbs", Number(e.target.value))} />
                    </div>
                    <div className="tr-meal-macro-field">
                      <span className="tr-meal-macro-label">Fat</span>
                      <input type="number" value={meal.fat} onChange={e => updateMeal(i, "fat", Number(e.target.value))} />
                    </div>
                    <button className="tr-delete-meal" onClick={() => deleteMeal(i)}>
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="tr-modal-actions">
              <button className="tr-modal-btn-cancel" onClick={() => setEditDiet(null)}>Cancel</button>
              <button className="tr-modal-btn-save" onClick={saveEdit}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
