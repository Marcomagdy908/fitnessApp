import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLayerGroup,
  faDumbbell,
  faFire,
  faUser,
  faPen,
  faTrash,
  faPlus,
  faSearch,
  faArrowTrendUp,
} from "@fortawesome/free-solid-svg-icons";
import "../../css/trainerPlans.css";

/* ─── Types ───────────────────────────── */
interface Plan {
  id: string;
  name: string;
  description: string;
  level: string;
  days: number;
  clients: number;
}

/* ─── Initial Data ────────────────────── */
const initialPlans: Plan[] = [
  { id: "1", name: "Push Pull Legs", description: "Classic 6-day split for hypertrophy and strength.", level: "Intermediate", days: 6, clients: 12 },
  { id: "2", name: "Upper Lower Split", description: "Balanced 4-day program for strength and recovery.", level: "Beginner", days: 4, clients: 8 },
  { id: "3", name: "Full Body Program", description: "3-day full body routine for beginners.", level: "Beginner", days: 3, clients: 15 },
  { id: "4", name: "Cutting Phase", description: "High intensity fat loss program with calorie deficit focus.", level: "Advanced", days: 5, clients: 6 },
  { id: "5", name: "Strength Builder", description: "Heavy compound lifts focused on raw strength gain.", level: "Advanced", days: 4, clients: 5 },
  { id: "6", name: "Beginner Starter", description: "Simple full body introduction for new lifters.", level: "Beginner", days: 3, clients: 20 },
  { id: "7", name: "Athletic Performance", description: "Explosiveness, speed and functional training program.", level: "Intermediate", days: 5, clients: 7 },
];

const LEVEL_COLOR: Record<string, string> = {
  Beginner: "green",
  Intermediate: "cyan",
  Advanced: "purple",
};

/* ─── Component ────────────────────────── */
export default function TrainerPlans() {
  const [plans, setPlans] = useState<Plan[]>(initialPlans);
  const [editPlan, setEditPlan] = useState<Plan | null>(null);
  const [search, setSearch] = useState("");

  const deletePlan = (id: string) => setPlans(prev => prev.filter(p => p.id !== id));
  const openEdit = (plan: Plan) => setEditPlan({ ...plan });
  const saveEdit = () => {
    if (!editPlan) return;
    setPlans(prev => prev.map(p => (p.id === editPlan.id ? editPlan : p)));
    setEditPlan(null);
  };

  const filtered = plans.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.level.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="tr-plans-wrapper">
      {/* HEADER */}
      <div className="tr-plans-header">
        <div>
          <h1>Training Plans</h1>
          <p>Design and manage programs for your clients</p>
        </div>
        <div className="tr-plans-header-right">
          <div className="tr-plans-search-wrap">
            <FontAwesomeIcon icon={faSearch} className="tr-plans-search-icon" />
            <input
              className="tr-plans-search"
              placeholder="Search plans…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="tr-plans-count-badge">
            <FontAwesomeIcon icon={faLayerGroup} />
            <span>{plans.length} Plans</span>
          </div>
        </div>
      </div>

      {/* SUMMARY ROW */}
      <div className="tr-plans-summary-row">
        {[
          { label: "Total Plans", value: plans.length, icon: faLayerGroup, color: "purple" },
          { label: "Clients Using", value: plans.reduce((a, p) => a + p.clients, 0), icon: faUser, color: "cyan" },
          { label: "Advanced Plans", value: plans.filter(p => p.level === "Advanced").length, icon: faFire, color: "gold" },
          { label: "Avg. Days/Week", value: Math.round(plans.reduce((a, p) => a + p.days, 0) / plans.length), icon: faArrowTrendUp, color: "green" },
        ].map((s, i) => (
          <div className={`tr-plans-summary-card tr-plans-summary-${s.color}`} key={i} style={{ animationDelay: `${i * 0.08}s` }}>
            <div className="tr-plans-summary-icon"><FontAwesomeIcon icon={s.icon} /></div>
            <div className="tr-plans-summary-value">{s.value}</div>
            <div className="tr-plans-summary-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* GRID */}
      <div className="tr-plans-grid">
        {filtered.map((plan, idx) => {
          const col = LEVEL_COLOR[plan.level] ?? "purple";
          return (
            <div key={plan.id} className={`tr-admin-plan-card tr-plan-card-${col}`} style={{ animationDelay: `${0.2 + idx * 0.07}s` }}>
              <div className="tr-plan-card-header">
                <div className="tr-plan-card-icon-wrap">
                  <FontAwesomeIcon icon={faDumbbell} />
                </div>
                <span className={`tr-plan-badge tr-plan-badge-${col}`}>{plan.level}</span>
              </div>

              <h3 className="tr-plan-name">{plan.name}</h3>
              <p className="tr-plan-desc">{plan.description}</p>

              <div className="tr-plan-meta-row">
                <div className="tr-plan-meta-item">
                  <FontAwesomeIcon icon={faDumbbell} />
                  <span>{plan.days}×/week</span>
                </div>
                <div className="tr-plan-meta-item">
                  <FontAwesomeIcon icon={faUser} />
                  <span>{plan.clients} clients</span>
                </div>
              </div>

              <div className="tr-plan-actions">
                <button className="tr-edit-btn" onClick={() => openEdit(plan)}>
                  <FontAwesomeIcon icon={faPen} /> Edit
                </button>
                <button className="tr-delete-btn" onClick={() => deletePlan(plan.id)}>
                  <FontAwesomeIcon icon={faTrash} /> Delete
                </button>
              </div>
            </div>
          );
        })}

        {/* Add new card */}
        <div className="tr-admin-plan-card tr-plan-card-add" style={{ animationDelay: `${0.2 + filtered.length * 0.07}s` }}>
          <div className="tr-plan-add-inner">
            <div className="tr-plan-add-icon"><FontAwesomeIcon icon={faPlus} /></div>
            <p>Create a new plan</p>
          </div>
        </div>
      </div>

      {/* EDIT MODAL */}
      {editPlan && (
        <div className="tr-modal-overlay" onClick={() => setEditPlan(null)}>
          <div className="tr-modal-box" onClick={e => e.stopPropagation()}>
            <div className="tr-modal-header">
              <FontAwesomeIcon icon={faLayerGroup} className="tr-modal-header-icon" />
              <h2>Edit Plan</h2>
            </div>

            <div className="tr-modal-form">
              <label className="tr-modal-form-label">Plan Name</label>
              <input className="tr-modal-form-input" value={editPlan.name}
                onChange={e => setEditPlan({ ...editPlan, name: e.target.value })} />

              <label className="tr-modal-form-label">Description</label>
              <textarea className="tr-modal-form-input tr-modal-form-textarea" value={editPlan.description}
                onChange={e => setEditPlan({ ...editPlan, description: e.target.value })} />

              <div className="tr-modal-row-2">
                <div>
                  <label className="tr-modal-form-label">Level</label>
                  <input className="tr-modal-form-input" value={editPlan.level}
                    onChange={e => setEditPlan({ ...editPlan, level: e.target.value })} />
                </div>
                <div>
                  <label className="tr-modal-form-label">Days / Week</label>
                  <input className="tr-modal-form-input" type="number" value={editPlan.days}
                    onChange={e => setEditPlan({ ...editPlan, days: Number(e.target.value) })} />
                </div>
              </div>
            </div>

            <div className="tr-modal-actions">
              <button className="tr-modal-btn-cancel" onClick={() => setEditPlan(null)}>Cancel</button>
              <button className="tr-modal-btn-save" onClick={saveEdit}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
