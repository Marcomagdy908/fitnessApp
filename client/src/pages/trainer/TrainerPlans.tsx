import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLayerGroup, faDumbbell, faUser, faPen, faTrash, faPlus,
  faSearch, faArrowTrendUp, faGlobe, faLock, faTimes, faCheck, faSpinner,
  faCalendarDays, faClock, faBolt, faListUl
} from "@fortawesome/free-solid-svg-icons";
import { api } from "../../utils/api";
import "../../css/trainerPlans.css";

/* ─── Types ─────────────────────────────────────────── */
interface Exercise { id?: number; exerciseId: number; name?: string; sets: number; reps: number; restSecs?: number; day: number; orderIndex?: number; exercise?: { name: string; category: string; } }
interface Plan {
  id: number; userId: number | null; name: string; description: string | null; daysPerWeek: number; level: string; weeks: number; goal: string; label: string | null; isActive: boolean; exercises: Exercise[];
}
interface User { id: number; name: string; email: string; role: string; }
interface DbExercise { id: number; name: string; category: string; }

const emptyPlan = () => ({
  name: "", description: "", daysPerWeek: 4, level: "Intermediate", weeks: 12,
  goal: "Hypertrophy", label: "", targetUserId: null as number | null, isPublic: false,
});

/* ─── Component ─────────────────────────────────────── */
export default function TrainerPlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [dbExercises, setDbExercises] = useState<DbExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filterOwner, setFilterOwner] = useState<"all" | "public" | "private">("all");
  const [modal, setModal] = useState<"closed" | "create" | "edit">("closed");
  const [form, setForm] = useState(emptyPlan());
  const [planExercises, setPlanExercises] = useState<Exercise[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"info" | "schedule">("info");

  useEffect(() => {
    Promise.all([
      api.get("/api/plans"),
      api.get("/api/users"),
      api.get("/api/exercises?limit=1000")
    ]).then(([plansRes, usersRes, exRes]) => {
      if (plansRes.data.success) setPlans(plansRes.data.data);
      if (usersRes.data.success) setUsers(usersRes.data.users.filter((u: User) => u.role === "USER"));
      if (exRes.data.success) setDbExercises(exRes.data.data);
    }).finally(() => setLoading(false));
  }, []);

  const filtered = plans.filter(p => {
    if (!p.name.toLowerCase().includes(search.toLowerCase()) && !(p.level || "").toLowerCase().includes(search.toLowerCase())) return false;
    if (filterOwner === "public") return p.userId === null;
    if (filterOwner === "private") return p.userId !== null;
    return true;
  });

  const getUserName = (userId: number | null) => userId ? (users.find(u => u.id === userId)?.name ?? `User #${userId}`) : null;

  const openCreate = () => { setForm(emptyPlan()); setPlanExercises([]); setEditingId(null); setModal("create"); setActiveTab("info"); };
  const openEdit = (plan: Plan) => {
    setForm({
      name: plan.name, description: plan.description || "", daysPerWeek: plan.daysPerWeek,
      level: plan.level || "Intermediate", weeks: plan.weeks || 12, goal: plan.goal || "Hypertrophy",
      label: plan.label || "", targetUserId: plan.userId, isPublic: plan.userId === null,
    });
    setPlanExercises(plan.exercises ? plan.exercises.map(e => ({ ...e })) : []);
    setEditingId(plan.id); setModal("edit"); setActiveTab("info");
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const payload = { ...form, targetUserId: form.isPublic ? null : form.targetUserId };
      let savedPlanId = editingId;

      if (modal === "create") {
        const res = await api.post("/api/plans", payload);
        if (res.data.success) {
          savedPlanId = res.data.data.id;
          if (planExercises.length > 0) await api.put(`/api/plans/${savedPlanId}/exercises`, { exercises: planExercises });
          setPlans(prev => [{ ...res.data.data, exercises: planExercises }, ...prev]);
        }
      } else if (editingId !== null) {
        await api.put(`/api/plans/${editingId}`, payload);
        await api.put(`/api/plans/${editingId}/exercises`, { exercises: planExercises });
        setPlans(prev => prev.map(p => p.id === editingId ? { ...p, ...form, userId: form.isPublic ? null : form.targetUserId, exercises: planExercises } : p));
      }
      setModal("closed");
    } finally { setSaving(false); }
  };

  const addEx = (day: number) => {
    setPlanExercises(prev => [...prev, { exerciseId: dbExercises[0]?.id || 0, sets: 3, reps: 10, restSecs: 60, day, orderIndex: prev.filter(e => e.day === day).length }]);
  };
  const updateEx = (index: number, field: keyof Exercise, value: any) => {
    setPlanExercises(prev => prev.map((e, i) => i === index ? { ...e, [field]: value } : e));
  };
  const removeEx = (index: number) => setPlanExercises(prev => prev.filter((_, i) => i !== index));

  if (loading) return <div className="tr-plans-wrapper"><div style={{ display: "flex", justifyContent: "center", height: "40vh", alignItems: "center", gap: "1rem", color: "var(--text-dim)", fontSize: "1.1rem" }}><FontAwesomeIcon icon={faSpinner} spin /> Loading plans…</div></div>;

  return (
    <div className="tr-plans-wrapper">
      <div className="tr-plans-header">
        <div><h1>Training Plans</h1><p>Design and manage programs for your clients</p></div>
        <div className="tr-plans-header-right">
          <div style={{ display: "flex", gap: "0.4rem", background: "var(--bg-surface)", borderRadius: "12px", padding: "0.3rem", border: "1px solid var(--border-color)" }}>
            {(["all", "public", "private"] as const).map(f => (
              <button key={f} onClick={() => setFilterOwner(f)} style={{ padding: "0.35rem 0.8rem", borderRadius: "8px", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: "0.78rem", fontWeight: 700, background: filterOwner === f ? "var(--accent-cyan)" : "transparent", color: filterOwner === f ? "var(--text-inverse)" : "var(--text-dim)" }}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>
            ))}
          </div>
          <button onClick={openCreate} style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "var(--accent-cyan)", color: "var(--text-inverse)", border: "none", borderRadius: "12px", padding: "0.55rem 1.1rem", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 15px var(--accent-cyan-dim)" }}><FontAwesomeIcon icon={faPlus} /> New Plan</button>
        </div>
      </div>

      <div className="tr-plans-grid">
        {filtered.map(plan => (
          <div key={plan.id} className="tr-admin-plan-card">
            <div className="tr-plan-card-header">
              <div className="tr-plan-card-icon-wrap"><FontAwesomeIcon icon={faDumbbell} /></div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <span style={{ fontSize: "0.65rem", fontWeight: 800, padding: "0.15rem 0.5rem", borderRadius: "999px", background: plan.userId === null ? "var(--success-dim)" : "var(--accent-purple-dim)", color: plan.userId === null ? "var(--success)" : "var(--accent-purple)" }}><FontAwesomeIcon icon={plan.userId === null ? faGlobe : faLock} /> {plan.userId === null ? "Public" : "Private"}</span>
                <span className="tr-plan-badge">{plan.level}</span>
              </div>
            </div>
            {plan.label && <div style={{ fontSize: "0.68rem", fontWeight: 800, color: "var(--accent-cyan)", marginBottom: "0.3rem", textTransform: "uppercase" }}>{plan.label}</div>}
            <h3 className="tr-plan-name">{plan.name}</h3>
            <p className="tr-plan-desc">{plan.description || "No description"}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "1rem" }}>
              {[ { icon: faCalendarDays, text: `${plan.daysPerWeek} days/wk` }, { icon: faClock, text: `${plan.weeks} wks` }, { icon: faBolt, text: plan.goal } ].map((c, i) => (
                <span key={i} style={{ display: "flex", alignItems: "center", gap: "0.3rem", background: "var(--bg-surface)", border: "1px solid var(--border-color)", borderRadius: "8px", padding: "0.25rem 0.6rem", fontSize: "0.72rem", color: "var(--text-dim)", fontWeight: 600 }}><FontAwesomeIcon icon={c.icon} /> {c.text}</span>
              ))}
            </div>
            <div className="tr-plan-meta-row"><div className="tr-plan-meta-item"><FontAwesomeIcon icon={faUser} /> <span>{plan.userId === null ? "All Users" : (getUserName(plan.userId) || `User #${plan.userId}`)}</span></div></div>
            <div className="tr-plan-actions">
              <button className="tr-edit-btn" onClick={() => openEdit(plan)}><FontAwesomeIcon icon={faPen} /> Edit</button>
              <button className="tr-delete-btn" onClick={() => api.delete(`/api/plans/${plan.id}`).then(()=>setPlans(p=>p.filter(x=>x.id!==plan.id)))}><FontAwesomeIcon icon={faTrash} /> Delete</button>
            </div>
          </div>
        ))}
      </div>

      {modal !== "closed" && (
        <div className="tr-modal-overlay" onClick={() => setModal("closed")}>
          <div className="tr-modal-box" style={{ width: "650px", maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
            <div className="tr-modal-header" style={{ justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.7rem" }}>
                <FontAwesomeIcon icon={faLayerGroup} className="tr-modal-header-icon" />
                <h2>{modal === "create" ? "Create Plan" : "Edit Plan"}</h2>
              </div>
              <button onClick={() => setModal("closed")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-dim)", fontSize: "1.1rem" }}><FontAwesomeIcon icon={faTimes} /></button>
            </div>

            <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", borderBottom: "1px solid var(--border-color)" }}>
              <button onClick={() => setActiveTab("info")} style={{ background: "none", border: "none", padding: "0.5rem 1rem", cursor: "pointer", fontWeight: 700, color: activeTab === "info" ? "var(--accent-cyan)" : "var(--text-dim)", borderBottom: activeTab === "info" ? "2px solid var(--accent-cyan)" : "2px solid transparent" }}>Details</button>
              <button onClick={() => setActiveTab("schedule")} style={{ background: "none", border: "none", padding: "0.5rem 1rem", cursor: "pointer", fontWeight: 700, color: activeTab === "schedule" ? "var(--accent-cyan)" : "var(--text-dim)", borderBottom: activeTab === "schedule" ? "2px solid var(--accent-cyan)" : "2px solid transparent" }}>Schedule ({planExercises.length})</button>
            </div>

            {activeTab === "info" ? (
              <div className="tr-modal-form" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div><label className="tr-modal-form-label">Plan Name *</label><input className="tr-modal-form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                <div><label className="tr-modal-form-label">Description</label><textarea className="tr-modal-form-input tr-modal-form-textarea" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
                <div className="tr-modal-row-2">
                  <div><label className="tr-modal-form-label">Level</label><select className="tr-modal-form-input" value={form.level} onChange={e => setForm({ ...form, level: e.target.value })}><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></div>
                  <div><label className="tr-modal-form-label">Goal</label><select className="tr-modal-form-input" value={form.goal} onChange={e => setForm({ ...form, goal: e.target.value })}><option>Hypertrophy</option><option>Strength</option><option>Weight Loss</option></select></div>
                </div>
                <div className="tr-modal-row-2">
                  <div><label className="tr-modal-form-label">Days / Week</label><input className="tr-modal-form-input" type="number" min={1} max={7} value={form.daysPerWeek} onChange={e => setForm({ ...form, daysPerWeek: Number(e.target.value) })} /></div>
                  <div><label className="tr-modal-form-label">Duration (weeks)</label><input className="tr-modal-form-input" type="number" min={1} max={52} value={form.weeks} onChange={e => setForm({ ...form, weeks: Number(e.target.value) })} /></div>
                </div>
                <div><label className="tr-modal-form-label">Label</label><input className="tr-modal-form-input" value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} /></div>
                <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--bg-surface)", borderRadius: "12px", padding: "0.85rem 1rem", border: `1px solid ${form.isPublic ? "var(--success)" : "var(--border-color)"}`, marginBottom: "0.8rem", cursor: "pointer" }} onClick={() => setForm({ ...form, isPublic: !form.isPublic, targetUserId: null })}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.7rem" }}><FontAwesomeIcon icon={form.isPublic ? faGlobe : faLock} style={{ color: form.isPublic ? "var(--success)" : "var(--text-dim)" }} /><div><div style={{ fontWeight: 700, fontSize: "0.9rem" }}>{form.isPublic ? "Available to all users" : "Assign to specific user"}</div></div></div>
                  </div>
                  {!form.isPublic && (
                    <div><label className="tr-modal-form-label">Assign to User</label><select className="tr-modal-form-input" value={form.targetUserId ?? ""} onChange={e => setForm({ ...form, targetUserId: e.target.value ? Number(e.target.value) : null })}><option value="">— Assign to yourself —</option>{users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}</select></div>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {Array.from({ length: form.daysPerWeek }).map((_, dIdx) => {
                  const dayNum = dIdx + 1;
                  const dayEx = planExercises.map((e, i) => ({ ...e, index: i })).filter(e => e.day === dayNum).sort((a,b)=>(a.orderIndex||0)-(b.orderIndex||0));
                  return (
                    <div key={dayNum} style={{ background: "var(--bg-surface)", padding: "1rem", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                        <h3 style={{ margin: 0, fontSize: "1rem", color: "var(--text-primary)" }}>Day {dayNum}</h3>
                        <button onClick={() => addEx(dayNum)} style={{ background: "var(--accent-cyan-dim)", color: "var(--accent-cyan)", border: "none", padding: "0.4rem 0.8rem", borderRadius: "8px", cursor: "pointer", fontWeight: 700, fontSize: "0.8rem" }}><FontAwesomeIcon icon={faPlus} /> Add Exercise</button>
                      </div>
                      {dayEx.length === 0 ? <p style={{ color: "var(--text-dim)", fontSize: "0.85rem", fontStyle: "italic", margin: 0 }}>Rest day or no exercises added.</p> : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                          {dayEx.map((ex) => (
                            <div key={ex.index} style={{ display: "flex", gap: "0.5rem", alignItems: "center", background: "var(--bg-secondary)", padding: "0.5rem", borderRadius: "8px", border: "1px solid var(--border-light)" }}>
                              <select style={{ flex: 2, background: "var(--bg-secondary)", border: "1px solid var(--border-color)", padding: "0.4rem", borderRadius: "6px", color: "var(--text-primary)", fontSize: "0.85rem" }} value={ex.exerciseId} onChange={e => updateEx(ex.index, "exerciseId", Number(e.target.value))}>
                                <option value={0} disabled>Select Exercise...</option>
                                {dbExercises.map(dbe => <option key={dbe.id} value={dbe.id} style={{ background: "var(--bg-secondary)", color: "var(--text-primary)" }}>{dbe.name}</option>)}
                              </select>
                              <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                                <span style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>Sets</span>
                                <input type="number" min={1} style={{ width: "45px", background: "var(--bg-secondary)", border: "1px solid var(--border-color)", padding: "0.3rem", borderRadius: "6px", color: "var(--text-primary)", fontSize: "0.85rem", textAlign: "center" }} value={ex.sets} onChange={e => updateEx(ex.index, "sets", Number(e.target.value))} />
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                                <span style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>Reps</span>
                                <input type="number" min={1} style={{ width: "45px", background: "var(--bg-secondary)", border: "1px solid var(--border-color)", padding: "0.3rem", borderRadius: "6px", color: "var(--text-primary)", fontSize: "0.85rem", textAlign: "center" }} value={ex.reps} onChange={e => updateEx(ex.index, "reps", Number(e.target.value))} />
                              </div>
                              <button onClick={() => removeEx(ex.index)} style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", padding: "0.3rem" }}><FontAwesomeIcon icon={faTrash} /></button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="tr-modal-actions">
              <button className="tr-modal-btn-cancel" onClick={() => setModal("closed")}>Cancel</button>
              <button className="tr-modal-btn-save" onClick={handleSave} disabled={saving}>{saving ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faCheck} />} {saving ? "Saving…" : "Save Changes"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
