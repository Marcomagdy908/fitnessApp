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
    <div className="diet-wrapper">
      {/* HEADER */}
      <div className="diet-header">
        <div>
          <h1>Trainer Diet Plans</h1>
          <p>Manage nutrition plans for your clients</p>
        </div>
        <div className="diet-header-badge">
          <FontAwesomeIcon icon={faAppleWhole} />
          <span>{diets.length} Active Plans</span>
        </div>
      </div>

      {/* GRID */}
      <div className="diet-grid">
        {diets.map((diet, idx) => {
          const goalColor = GOAL_COLORS[diet.goal] ?? "purple";
          const totalCals = totalMealCals(diet.meals);
          const pct = Math.min(100, Math.round((totalCals / diet.caloriesTarget) * 100));

          return (
            <div key={diet.id} className={`diet-card diet-card-${goalColor}`} style={{ animationDelay: `${idx * 0.1}s` }}>
              <div className="diet-top">
                <h3>{diet.name}</h3>
                <span className={`diet-badge diet-badge-${goalColor}`}>{diet.goal}</span>
              </div>

              <p className="diet-desc">{diet.description}</p>

              {/* Calorie progress */}
              <div className="diet-cal-row">
                <FontAwesomeIcon icon={faFire} className="diet-cal-icon" />
                <span className="diet-cal-label">
                  {totalCals} / {diet.caloriesTarget} kcal
                </span>
                <span className="diet-cal-pct">{pct}%</span>
              </div>
              <div className="diet-cal-bar">
                <div className="diet-cal-fill" style={{ width: `${pct}%` }} />
              </div>

              {/* Meals */}
              <div className="meal-list">
                <div className="meal-list-header">
                  <FontAwesomeIcon icon={faUtensils} />
                  <span>Meals ({diet.meals.length})</span>
                </div>
                {diet.meals.map((m, i) => (
                  <div key={i} className="meal-row">
                    <span className="meal-row-name">{m.name}</span>
                    <span className="meal-row-cal">{m.calories} kcal</span>
                    <div className="meal-macros">
                      <span className="macro-tag macro-p">P {m.protein}g</span>
                      <span className="macro-tag macro-c">C {m.carbs}g</span>
                      <span className="macro-tag macro-f">F {m.fat}g</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="diet-actions">
                <button className="diet-btn-edit" onClick={() => openEdit(diet)}>
                  <FontAwesomeIcon icon={faPen} /> Edit
                </button>
                <button className="diet-btn-delete" onClick={() => deleteDiet(diet.id)}>
                  <FontAwesomeIcon icon={faTrash} /> Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── MODAL ─── */}
      {editDiet && (
        <div className="modal-overlay" onClick={() => setEditDiet(null)}>
          <div className="modal-box diet-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <FontAwesomeIcon icon={faAppleWhole} className="modal-header-icon" />
              <h2>Edit Diet Plan</h2>
            </div>

            <div className="modal-section">
              <label className="modal-label">Plan Name</label>
              <input className="modal-input" placeholder="Diet Name" value={editDiet.name}
                onChange={e => setEditDiet({ ...editDiet, name: e.target.value })} />

              <div className="modal-row-2">
                <div>
                  <label className="modal-label">Goal</label>
                  <input className="modal-input" placeholder="Goal" value={editDiet.goal}
                    onChange={e => setEditDiet({ ...editDiet, goal: e.target.value })} />
                </div>
                <div>
                  <label className="modal-label">
                    <FontAwesomeIcon icon={faBullseye} /> Calories Target
                  </label>
                  <input className="modal-input" type="number" placeholder="Calories" value={editDiet.caloriesTarget}
                    onChange={e => setEditDiet({ ...editDiet, caloriesTarget: Number(e.target.value) })} />
                </div>
              </div>

              <label className="modal-label">Description</label>
              <textarea className="modal-input modal-textarea" placeholder="Description" value={editDiet.description}
                onChange={e => setEditDiet({ ...editDiet, description: e.target.value })} />
            </div>

            <div className="modal-section">
              <div className="section-title">
                <span><FontAwesomeIcon icon={faUtensils} /> Meals</span>
                <button className="add-meal" onClick={addMeal}>
                  <FontAwesomeIcon icon={faPlus} /> Add Meal
                </button>
              </div>

              {editDiet.meals.map((meal, i) => (
                <div key={i} className="meal-edit-card">
                  <input className="meal-edit-input meal-name-input" placeholder="Meal name" value={meal.name}
                    onChange={e => updateMeal(i, "name", e.target.value)} />
                  <div className="meal-edit-macros">
                    <div className="meal-macro-field">
                      <span className="meal-macro-label"><FontAwesomeIcon icon={faFire} /> kcal</span>
                      <input type="number" value={meal.calories} onChange={e => updateMeal(i, "calories", Number(e.target.value))} />
                    </div>
                    <div className="meal-macro-field">
                      <span className="meal-macro-label">Protein</span>
                      <input type="number" value={meal.protein} onChange={e => updateMeal(i, "protein", Number(e.target.value))} />
                    </div>
                    <div className="meal-macro-field">
                      <span className="meal-macro-label"><FontAwesomeIcon icon={faDroplet} /> Carbs</span>
                      <input type="number" value={meal.carbs} onChange={e => updateMeal(i, "carbs", Number(e.target.value))} />
                    </div>
                    <div className="meal-macro-field">
                      <span className="meal-macro-label">Fat</span>
                      <input type="number" value={meal.fat} onChange={e => updateMeal(i, "fat", Number(e.target.value))} />
                    </div>
                    <button className="delete-meal" onClick={() => deleteMeal(i)}>
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="modal-actions">
              <button className="modal-btn-cancel" onClick={() => setEditDiet(null)}>Cancel</button>
              <button className="modal-btn-save" onClick={saveEdit}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
