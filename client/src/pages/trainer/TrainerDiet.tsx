import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAppleWhole, faFire, faPlus, faTrash, faPen, faUtensils,
  faBullseye, faDroplet, faGlobe, faLock, faTimes, faCheck, faSpinner,
  faUser, faHeart,
} from "@fortawesome/free-solid-svg-icons";
import { api } from "../../utils/api";
import "../../css/trainerDiet.css";
import { DIET_PLAN_STYLES } from "../../utils/styleMappings";

/* ─── Types ───────────────────────────── */
interface MealEntry {
  id?: number;
  time: string;
  name: string;
  foods: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface DietPlan {
  id: number;
  userId: number | null;
  planId?: string;
  name: string;
  goal: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  meals: MealEntry[];
}

interface User { id: number; name: string; email: string; }

const GOAL_OPTIONS = ["Muscle Gain", "Weight Loss", "Maintenance", "Body Recomp", "Performance", "General"];

const emptyForm = () => ({
  name: "", goal: "General",
  description: "", calories: 2200, protein: 160, carbs: 220, fat: 70,
  meals: [] as MealEntry[], targetUserId: null as number | null, isPublic: false,
});

/* ─── Component ───────────────────────── */
export default function TrainerDiet() {
  const location = useLocation();
  const navigate = useNavigate();
  const [diets, setDiets] = useState<DietPlan[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState<"closed" | "create" | "edit">("closed");
  const [form, setForm] = useState(emptyForm());
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([
      api.get("/api/meals/plans"),
      api.get("/api/users"),
    ]).then(([dietsRes, usersRes]) => {
      if (dietsRes.data.success) setDiets(dietsRes.data.data);
      if (usersRes.data.success) setUsers(usersRes.data.users.filter((u: any) => u.role === "USER"));
    }).finally(() => setLoading(false));
  }, []);

  const getUserName = (userId: number | null) => {
    if (!userId) return null;
    return users.find(u => u.id === userId)?.name ?? `User #${userId}`;
  };

  const updateMeal = (i: number, field: string, value: any) => {
    const updated = [...form.meals];
    (updated[i] as any)[field] = value;
    setForm({ ...form, meals: updated });
  };

  const addMeal = () => setForm({
    ...form,
    meals: [...form.meals, { time: "", name: "", foods: [], calories: 0, protein: 0, carbs: 0, fat: 0 }]
  });

  const removeMeal = (i: number) => setForm({ ...form, meals: form.meals.filter((_, idx) => idx !== i) });

  const updateMealFoods = (i: number, val: string) => {
    const updated = [...form.meals];
    updated[i] = { ...updated[i], foods: val.split(",").map(s => s.trim()).filter(Boolean) };
    setForm({ ...form, meals: updated });
  };

  const openCreate = () => { setForm(emptyForm()); setEditingId(null); setModal("create"); };

  useEffect(() => {
    if ((location.state as any)?.openCreate) {
      openCreate();
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  const openEdit = (diet: DietPlan) => {
    setForm({
      name: diet.name,
      goal: diet.goal, description: diet.description,
      calories: diet.calories, protein: diet.protein, carbs: diet.carbs, fat: diet.fat,
      meals: diet.meals.map(m => ({ ...m, foods: Array.isArray(m.foods) ? m.foods : [] })),
      targetUserId: diet.userId, isPublic: diet.userId === null,
    });
    setEditingId(diet.id);
    setModal("edit");
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        planId: form.name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now(),
        targetUserId: form.isPublic ? null : form.targetUserId,
      };
      if (modal === "create") {
        const res = await api.post("/api/meals/plans", payload);
        if (res.data.success) setDiets(prev => [res.data.data, ...prev]);
      } else if (editingId !== null) {
        await api.put(`/api/meals/plans/${editingId}`, payload);
        setDiets(prev => prev.map(d => d.id === editingId
          ? { ...d, ...form, userId: form.isPublic ? null : form.targetUserId,
              meals: form.meals.map(m => ({ ...m, foods: Array.isArray(m.foods) ? m.foods : [] })) }
          : d));
      }
      setModal("closed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this diet plan? This cannot be undone.")) return;
    await api.delete(`/api/meals/plans/${id}`);
    setDiets(prev => prev.filter(d => d.id !== id));
  };

  const totalMealCals = (meals: MealEntry[]) => meals.reduce((acc, m) => acc + (m.calories || 0), 0);

  if (loading) return (
    <div className="tr-diet-wrapper">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "40vh", gap: "1rem", color: "var(--text-dim)", fontSize: "1.1rem" }}>
        <FontAwesomeIcon icon={faSpinner} spin /> Loading diet plans…
      </div>
    </div>
  );

  return (
    <div className="tr-diet-wrapper">
      {/* HEADER */}
      <div className="tr-diet-header">
        <div>
          <h1>Trainer Diet Plans</h1>
          <p>Manage nutrition plans for your clients</p>
        </div>
        <div style={{ display: "flex", gap: "0.8rem", alignItems: "center" }}>
          <div className="tr-diet-header-badge">
            <FontAwesomeIcon icon={faAppleWhole} />
            <span>{diets.length} Plans</span>
          </div>
          <button onClick={openCreate} style={{
            display: "flex", alignItems: "center", gap: "0.5rem",
            background: "var(--accent-cyan)", color: "var(--text-inverse)",
            border: "none", borderRadius: "12px", padding: "0.55rem 1.1rem",
            fontWeight: 700, fontSize: "0.88rem", cursor: "pointer", fontFamily: "inherit",
            boxShadow: "0 4px 15px var(--accent-cyan-dim)", transition: "all 0.2s ease",
          }}>
            <FontAwesomeIcon icon={faPlus} /> New Diet Plan
          </button>
        </div>
      </div>

      {/* GRID */}
      <div className="tr-diet-grid">
        {diets.map((diet, idx) => {
          const planStyle = DIET_PLAN_STYLES[diet.goal.toLowerCase()] || DIET_PLAN_STYLES.default;
          const totalCals = totalMealCals(diet.meals);
          const pct = diet.calories > 0 ? Math.min(100, Math.round((totalCals / diet.calories) * 100)) : 0;
          const ownerName = getUserName(diet.userId);

          return (
            <div key={diet.id} className="tr-diet-card" style={{
              animationDelay: `${idx * 0.08}s`,
              borderTopColor: planStyle.accentColor,
            }}>
              <div className="tr-diet-top">
                <div>
                  <div style={{ fontSize: "0.65rem", fontWeight: 800, color: planStyle.accentColor, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.2rem" }}>
                    {planStyle.label}
                  </div>
                  <h3>{diet.name}</h3>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.4rem" }}>
                  <span style={{
                    display: "flex", alignItems: "center", gap: "0.3rem",
                    fontSize: "0.65rem", fontWeight: 800, padding: "0.15rem 0.5rem",
                    borderRadius: "999px", border: "1px solid",
                    background: diet.userId === null ? "var(--success-dim)" : "var(--accent-purple-dim)",
                    color: diet.userId === null ? "var(--success)" : "var(--accent-purple)",
                    borderColor: diet.userId === null ? "var(--success-dim)" : "var(--accent-purple-border)",
                  }}>
                    <FontAwesomeIcon icon={diet.userId === null ? faGlobe : faLock} />
                    {diet.userId === null ? "Public" : "Private"}
                  </span>
                  <span className="tr-diet-badge" style={{ background: `${planStyle.accentColor}22`, color: planStyle.accentColor, borderColor: `${planStyle.accentColor}44` }}>
                    {diet.goal}
                  </span>
                </div>
              </div>

              <p className="tr-diet-desc">{diet.description || <span style={{ fontStyle: "italic", opacity: 0.5 }}>No description</span>}</p>

              {/* Macro summary */}
              <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.8rem", flexWrap: "wrap" }}>
                {[
                  { label: "Kcal", value: diet.calories, color: "var(--warning)" },
                  { label: "Protein", value: `${diet.protein}g`, color: "var(--accent-cyan)" },
                  { label: "Carbs", value: `${diet.carbs}g`, color: "var(--accent-purple)" },
                  { label: "Fat", value: `${diet.fat}g`, color: "var(--accent-gold)" },
                ].map((m, mi) => (
                  <div key={mi} style={{
                    background: "var(--bg-surface)", border: "1px solid var(--border-color)",
                    borderRadius: "8px", padding: "0.3rem 0.6rem", textAlign: "center",
                  }}>
                    <div style={{ fontSize: "0.75rem", fontWeight: 800, color: m.color }}>{m.value}</div>
                    <div style={{ fontSize: "0.6rem", color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{m.label}</div>
                  </div>
                ))}
              </div>

              {/* Calorie progress */}
              <div className="tr-diet-cal-row">
                <FontAwesomeIcon icon={faFire} className="tr-diet-cal-icon" />
                <span className="tr-diet-cal-label">{totalCals} / {diet.calories} kcal from meals</span>
                <span className="tr-diet-cal-pct">{pct}%</span>
              </div>
              <div className="tr-diet-cal-bar">
                <div className="tr-diet-cal-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${planStyle.accentColor}, var(--accent-purple))` }} />
              </div>

              {/* Meals */}
              <div className="tr-meal-list">
                <div className="tr-meal-list-header">
                  <FontAwesomeIcon icon={faUtensils} />
                  <span>Meals ({diet.meals.length})</span>
                </div>
                {diet.meals.map((m, i) => (
                  <div key={i} className="tr-meal-row">
                    <div style={{ flex: 1 }}>
                      <div className="tr-meal-row-name">{m.name}</div>
                      {m.time && <div style={{ fontSize: "0.7rem", color: "var(--text-dim)" }}>{m.time}</div>}
                    </div>
                    <span className="tr-meal-row-cal">{m.calories} kcal</span>
                    <div className="tr-meal-macros">
                      <span className="tr-macro-tag tr-macro-p">P {m.protein}g</span>
                      <span className="tr-macro-tag tr-macro-c">C {m.carbs}g</span>
                      <span className="tr-macro-tag tr-macro-f">F {m.fat}g</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Assigned to */}
              <div style={{ marginTop: "0.8rem", display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.78rem", color: "var(--text-dim)" }}>
                <FontAwesomeIcon icon={faUser} />
                <span>{diet.userId === null ? "All Users" : (ownerName || `User #${diet.userId}`)}</span>
              </div>

              {/* Actions */}
              <div className="tr-diet-actions">
                <button className="tr-diet-btn-edit" onClick={() => openEdit(diet)}>
                  <FontAwesomeIcon icon={faPen} /> Edit
                </button>
                <button className="tr-diet-btn-delete" onClick={() => handleDelete(diet.id)}>
                  <FontAwesomeIcon icon={faTrash} /> Delete
                </button>
              </div>
            </div>
          );
        })}

        {/* Add card placeholder */}
        <div onClick={openCreate} style={{
          background: "var(--bg-card)", border: "2px dashed var(--border-color)",
          borderRadius: "20px", padding: "1.5rem", display: "flex", alignItems: "center",
          justifyContent: "center", cursor: "pointer", minHeight: "200px",
          transition: "all 0.3s ease", flexDirection: "column", gap: "0.5rem",
          color: "var(--text-dim)",
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "var(--accent-cyan)"; (e.currentTarget as HTMLDivElement).style.background = "var(--accent-cyan-dim)"; (e.currentTarget as HTMLDivElement).style.color = "var(--accent-cyan)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border-color)"; (e.currentTarget as HTMLDivElement).style.background = "var(--bg-card)"; (e.currentTarget as HTMLDivElement).style.color = "var(--text-dim)"; }}
        >
          <FontAwesomeIcon icon={faPlus} style={{ fontSize: "1.8rem" }} />
          <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>Create a new diet plan</span>
        </div>
      </div>

      {/* ─── MODAL ─── */}
      {modal !== "closed" && (
        <div className="tr-modal-overlay" onClick={() => setModal("closed")}>
          <div className="tr-modal-box tr-diet-modal" onClick={e => e.stopPropagation()} style={{ width: "620px" }}>
            <div className="tr-modal-header" style={{ justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.7rem" }}>
                <FontAwesomeIcon icon={faAppleWhole} className="tr-modal-header-icon" />
                <h2>{modal === "create" ? "Create Diet Plan" : "Edit Diet Plan"}</h2>
              </div>
              <button onClick={() => setModal("closed")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-dim)", fontSize: "1.1rem" }}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            {/* Plan Info */}
            <div className="tr-modal-section">
              <div style={{ fontSize: "0.7rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-dim)", marginBottom: "-0.3rem" }}>Plan Details</div>

              <div>
                <label className="tr-modal-label">Plan Name *</label>
                <input className="tr-modal-input" placeholder="e.g. Muscle Gain Diet" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>

              <div className="tr-modal-row-2">
                <div>
                  <label className="tr-modal-label">Goal</label>
                  <select className="tr-modal-input" value={form.goal} onChange={e => setForm({ ...form, goal: e.target.value })}>
                    {GOAL_OPTIONS.map(g => <option key={g}>{g}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="tr-modal-label">Description</label>
                <textarea className="tr-modal-input tr-modal-textarea" placeholder="Plan overview and key goals…" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
            </div>

            {/* Macros */}
            <div className="tr-modal-section">
              <div style={{ fontSize: "0.7rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-dim)", marginBottom: "-0.3rem" }}>Daily Targets</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.8rem" }}>
                {[
                  { label: "Calories", icon: faFire, field: "calories", color: "var(--warning)" },
                  { label: "Protein (g)", icon: faHeart, field: "protein", color: "var(--accent-cyan)" },
                  { label: "Carbs (g)", icon: faDroplet, field: "carbs", color: "var(--accent-purple)" },
                  { label: "Fat (g)", icon: faBullseye, field: "fat", color: "var(--accent-gold)" },
                ].map(({ label, icon, field, color }) => (
                  <div key={field}>
                    <label className="tr-modal-label" style={{ color }}><FontAwesomeIcon icon={icon} /> {label}</label>
                    <input className="tr-modal-input" type="number" min={0} value={(form as any)[field]}
                      onChange={e => setForm({ ...form, [field]: Number(e.target.value) })} />
                  </div>
                ))}
              </div>

            </div>

            {/* Meals */}
            <div className="tr-modal-section">
              <div className="tr-section-title">
                <div style={{ fontSize: "0.7rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-dim)" }}>
                  <FontAwesomeIcon icon={faUtensils} style={{ marginRight: "0.4rem" }} />
                  Meals ({form.meals.length})
                </div>
                <button className="tr-add-meal" onClick={addMeal}>
                  <FontAwesomeIcon icon={faPlus} /> Add Meal
                </button>
              </div>

              {form.meals.map((meal, i) => (
                <div key={i} className="tr-meal-edit-card">
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 120px", gap: "0.5rem" }}>
                    <input className="tr-meal-edit-input tr-meal-name-input" placeholder="Meal name (e.g. Breakfast: Oats & Eggs)" value={meal.name} onChange={e => updateMeal(i, "name", e.target.value)} />
                    <input className="tr-meal-edit-input" placeholder="Time (e.g. 8:00 AM)" value={meal.time} onChange={e => updateMeal(i, "time", e.target.value)} />
                  </div>
                  <input className="tr-meal-edit-input" placeholder="Foods (comma-separated, e.g. 200g Chicken, 150g Rice, Broccoli)" value={meal.foods.join(", ")} onChange={e => updateMealFoods(i, e.target.value)} />
                  <div className="tr-meal-edit-macros">
                    {[
                      { label: "kcal", icon: faFire, field: "calories" },
                      { label: "Protein", icon: null, field: "protein" },
                      { label: "Carbs", icon: faDroplet, field: "carbs" },
                      { label: "Fat", icon: null, field: "fat" },
                    ].map(({ label, icon, field }) => (
                      <div className="tr-meal-macro-field" key={field}>
                        <span className="tr-meal-macro-label">{icon && <FontAwesomeIcon icon={icon} />} {label}</span>
                        <input type="number" value={(meal as any)[field]} onChange={e => updateMeal(i, field, Number(e.target.value))} />
                      </div>
                    ))}
                    <button className="tr-delete-meal" onClick={() => removeMeal(i)}>
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Visibility */}
            <div className="tr-modal-section">
              <div style={{ fontSize: "0.7rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-dim)", marginBottom: "-0.3rem" }}>
                Visibility &amp; Assignment
              </div>

              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                background: "var(--bg-surface)", borderRadius: "12px", padding: "0.85rem 1rem",
                border: `1px solid ${form.isPublic ? "var(--success)" : "var(--border-color)"}`,
                cursor: "pointer", transition: "all 0.2s ease",
              }} onClick={() => setForm({ ...form, isPublic: !form.isPublic, targetUserId: null })}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.7rem" }}>
                  <FontAwesomeIcon icon={form.isPublic ? faGlobe : faLock} style={{ color: form.isPublic ? "var(--success)" : "var(--text-dim)" }} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text-primary)" }}>
                      {form.isPublic ? "Available to all users" : "Assign to specific user"}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>
                      {form.isPublic ? "Everyone can see this plan" : "Only visible to the selected user"}
                    </div>
                  </div>
                </div>
                <div style={{
                  width: "44px", height: "24px", borderRadius: "999px", position: "relative",
                  background: form.isPublic ? "var(--success)" : "var(--bg-secondary)",
                  border: "1px solid var(--border-color)", transition: "all 0.2s ease", flexShrink: 0,
                }}>
                  <div style={{
                    width: "18px", height: "18px", borderRadius: "50%", background: "white",
                    position: "absolute", top: "2px", transition: "left 0.2s ease",
                    left: form.isPublic ? "22px" : "2px", boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
                  }} />
                </div>
              </div>

              {!form.isPublic && (
                <div>
                  <label className="tr-modal-label"><FontAwesomeIcon icon={faUser} /> Assign to User</label>
                  <select className="tr-modal-input" value={form.targetUserId ?? ""} onChange={e => setForm({ ...form, targetUserId: e.target.value ? Number(e.target.value) : null })}>
                    <option value="">— Assign to yourself —</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
                  </select>
                </div>
              )}
            </div>

            <div className="tr-modal-actions">
              <button className="tr-modal-btn-cancel" onClick={() => setModal("closed")}>Cancel</button>
              <button className="tr-modal-btn-save" onClick={handleSave} disabled={saving}>
                {saving ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faCheck} />}
                {" "}{saving ? "Saving…" : modal === "create" ? "Create Plan" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
