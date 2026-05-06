import { useState } from "react";
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
      {
        name: "Chicken & Rice",
        calories: 450,
        protein: 35,
        carbs: 40,
        fat: 10,
      },
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
      {
        name: "Steak & Potatoes",
        calories: 700,
        protein: 45,
        carbs: 60,
        fat: 20,
      },
      { name: "Protein Shake", calories: 250, protein: 30, carbs: 10, fat: 5 },
    ],
  },
];

/* ─── Component ───────────────────────── */
export default function TrainerDiet() {
  const [diets, setDiets] = useState<DietPlan[]>(initialDiets);
  const [editDiet, setEditDiet] = useState<DietPlan | null>(null);

  /* ─── Delete Diet ─── */
  const deleteDiet = (id: string) => {
    setDiets((prev) => prev.filter((d) => d.id !== id));
  };

  /* ─── Open Edit ─── */
  const openEdit = (diet: DietPlan) => {
    setEditDiet(diet);
  };

  /* ─── Save Edit ─── */
  const saveEdit = () => {
    if (!editDiet) return;

    setDiets((prev) => prev.map((d) => (d.id === editDiet.id ? editDiet : d)));

    setEditDiet(null);
  };

  /* ─── Meal Handlers ─── */
  const updateMeal = (index: number, field: string, value: any) => {
    if (!editDiet) return;

    const updatedMeals = [...editDiet.meals];
    updatedMeals[index] = {
      ...updatedMeals[index],
      [field]: value,
    };

    setEditDiet({ ...editDiet, meals: updatedMeals });
  };

  const addMeal = () => {
    if (!editDiet) return;

    setEditDiet({
      ...editDiet,
      meals: [
        ...editDiet.meals,
        { name: "", calories: 0, protein: 0, carbs: 0, fat: 0 },
      ],
    });
  };

  const deleteMeal = (index: number) => {
    if (!editDiet) return;

    const updated = editDiet.meals.filter((_, i) => i !== index);
    setEditDiet({ ...editDiet, meals: updated });
  };

  /* ─── UI ─── */
  return (
    <div className="diet-wrapper">
      {/* HEADER */}
      <div className="diet-header">
        <h1>Trainer Diet Plans</h1>
        <p>Manage nutrition plans for your clients</p>
      </div>

      {/* GRID */}
      <div className="diet-grid">
        {diets.map((diet) => (
          <div key={diet.id} className="diet-card">
            <div className="diet-top">
              <h3>{diet.name}</h3>
              <span className="diet-badge">{diet.goal}</span>
            </div>

            <p className="diet-desc">{diet.description}</p>

            <div className="diet-meta">
              🍽 Calories Target: {diet.caloriesTarget}
            </div>

            {/* MEALS */}
            <div className="meal-list">
              {diet.meals.map((m, i) => (
                <div key={i} className="meal-row">
                  <span>{m.name}</span>
                  <span>{m.calories} kcal</span>
                  <span>
                    P:{m.protein} C:{m.carbs} F:{m.fat}
                  </span>
                </div>
              ))}
            </div>

            {/* ACTIONS */}
            <div className="diet-actions">
              <button onClick={() => openEdit(diet)}>✏ Edit</button>
              <button onClick={() => deleteDiet(diet.id)}>🗑 Delete</button>
            </div>
          </div>
        ))}
      </div>

      {/* ─── MODAL ─── */}
      {editDiet && (
        <div className="modal-overlay">
          <div className="modal-box diet-modal">
            <h2>🍽 Edit Diet Plan</h2>

            {/* BASIC INFO */}
            <div className="modal-section">
              <input
                placeholder="Diet Name"
                value={editDiet.name}
                onChange={(e) =>
                  setEditDiet({ ...editDiet, name: e.target.value })
                }
              />

              <input
                placeholder="Goal"
                value={editDiet.goal}
                onChange={(e) =>
                  setEditDiet({ ...editDiet, goal: e.target.value })
                }
              />

              <input
                type="number"
                placeholder="Calories Target"
                value={editDiet.caloriesTarget}
                onChange={(e) =>
                  setEditDiet({
                    ...editDiet,
                    caloriesTarget: Number(e.target.value),
                  })
                }
              />

              <textarea
                placeholder="Description"
                value={editDiet.description}
                onChange={(e) =>
                  setEditDiet({ ...editDiet, description: e.target.value })
                }
              />
            </div>

            {/* MEALS */}
            <div className="modal-section">
              <div className="section-title">
                Meals
                <button className="add-meal" onClick={addMeal}>
                  + Add Meal
                </button>
              </div>

              {editDiet.meals.map((meal, i) => (
                <div key={i} className="meal-edit-card">
                  <input
                    placeholder="Name"
                    value={meal.name}
                    onChange={(e) => updateMeal(i, "name", e.target.value)}
                  />

                  <input
                    type="number"
                    placeholder="Calories"
                    value={meal.calories}
                    onChange={(e) =>
                      updateMeal(i, "calories", Number(e.target.value))
                    }
                  />

                  <input
                    type="number"
                    placeholder="Protein"
                    value={meal.protein}
                    onChange={(e) =>
                      updateMeal(i, "protein", Number(e.target.value))
                    }
                  />

                  <input
                    type="number"
                    placeholder="Carbs"
                    value={meal.carbs}
                    onChange={(e) =>
                      updateMeal(i, "carbs", Number(e.target.value))
                    }
                  />

                  <input
                    type="number"
                    placeholder="Fat"
                    value={meal.fat}
                    onChange={(e) =>
                      updateMeal(i, "fat", Number(e.target.value))
                    }
                  />

                  <button className="delete-meal" onClick={() => deleteMeal(i)}>
                    🗑
                  </button>
                </div>
              ))}
            </div>

            {/* ACTIONS */}
            <div className="modal-actions">
              <button onClick={() => setEditDiet(null)}>Cancel</button>
              <button onClick={saveEdit}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
