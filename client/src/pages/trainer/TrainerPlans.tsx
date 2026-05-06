import { useState } from "react";
import "../../css/trainerPlans.css";
/* ─── Types ───────────────────────────── */
interface Plan {
  id: string;
  name: string;
  description: string;
  level: string;
}

/* ─── Initial Data ────────────────────── */
const initialPlans: Plan[] = [
  {
    id: "1",
    name: "Push Pull Legs",
    description: "Classic 6-day split for hypertrophy and strength.",
    level: "Intermediate",
  },
  {
    id: "2",
    name: "Upper Lower Split",
    description: "Balanced 4-day program for strength and recovery.",
    level: "Beginner",
  },
  {
    id: "3",
    name: "Full Body Program",
    description: "3-day full body routine for beginners.",
    level: "Beginner",
  },
  {
    id: "4",
    name: "Cutting Phase",
    description: "High intensity fat loss program with calorie deficit focus.",
    level: "Advanced",
  },
  {
    id: "5",
    name: "Strength Builder",
    description: "Heavy compound lifts focused on raw strength gain.",
    level: "Advanced",
  },
  {
    id: "6",
    name: "Beginner Starter",
    description: "Simple full body introduction for new lifters.",
    level: "Beginner",
  },
  {
    id: "7",
    name: "Athletic Performance",
    description: "Explosiveness, speed and functional training program.",
    level: "Intermediate",
  },
];

export default function TrainerPlans() {
  const [plans, setPlans] = useState<Plan[]>(initialPlans);
  const [editPlan, setEditPlan] = useState<Plan | null>(null);

  /* ─── Delete ─── */
  const deletePlan = (id: string) => {
    setPlans((prev) => prev.filter((p) => p.id !== id));
  };

  /* ─── Open Edit ─── */
  const openEdit = (plan: Plan) => {
    setEditPlan(plan);
  };

  /* ─── Save Edit ─── */
  const saveEdit = () => {
    if (!editPlan) return;

    setPlans((prev) => prev.map((p) => (p.id === editPlan.id ? editPlan : p)));

    setEditPlan(null);
  };

  return (
    <div className="plans-wrapper">
      {/* HEADER */}
      <div className="plans-header">
        <h1>Trainer Plans</h1>
        <p>Manage your training programs</p>
      </div>

      {/* GRID */}
      <div className="plans-grid">
        {plans.map((plan) => (
          <div key={plan.id} className="admin-plan-card">
            <div className="plan-card-header">
              <h3>{plan.name}</h3>
              <span className="plan-badge">{plan.level}</span>
            </div>

            <p className="plan-desc">{plan.description}</p>

            <div className="plan-actions">
              <button className="edit-btn" onClick={() => openEdit(plan)}>
                Edit
              </button>

              <button
                className="delete-btn"
                onClick={() => deletePlan(plan.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ─── EDIT MODAL ─── */}
      {editPlan && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2>Edit Plan</h2>

            <div className="modal-form">
              <label>Name</label>
              <input
                value={editPlan.name}
                onChange={(e) =>
                  setEditPlan({ ...editPlan, name: e.target.value })
                }
              />

              <label>Description</label>
              <textarea
                value={editPlan.description}
                onChange={(e) =>
                  setEditPlan({ ...editPlan, description: e.target.value })
                }
              />

              <label>Level</label>
              <input
                value={editPlan.level}
                onChange={(e) =>
                  setEditPlan({ ...editPlan, level: e.target.value })
                }
              />
            </div>

            <div className="modal-actions">
              <button onClick={() => setEditPlan(null)}>Cancel</button>

              <button onClick={saveEdit}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
