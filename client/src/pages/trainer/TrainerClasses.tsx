import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarCheck,
  faCalendarPlus,
  faUsers,
  faClock,
  faTrash,
  faCheck,
  faXmark,
  faPlus,
  faChair,
  faFire,
  faDumbbell,
  faInfoCircle,
  faMoneyBill,
  faUser,
  faBullseye,
  faPen,
  faSave,
  faPersonRunning,
  faCalendarDay,
  faClipboardList,
} from "@fortawesome/free-solid-svg-icons";
import { api } from "../../utils/api";
import "../../css/trainerClasses.css";

/* ─── Types ─────────────────────────────── */
interface GymClass {
  id: number;
  name: string;
  scheduledAt: string;
  durationMins: number;
  maxSpots: number;
  spotsBooked: number;
  actualBookings: number;
  color: string;
  description: string;
  requiredPlan: "basic" | "pro" | "elite";
}

interface TrainerBooking {
  id: number;
  clientName: string;
  clientEmail: string;
  scheduledAt: string;
  durationMins: number;
  status: "pending" | "confirmed" | "cancelled";
  notes: string | null;
  totalPrice: number;
}

type BookingFilter = "all" | "pending" | "confirmed" | "cancelled";

interface PTClient {
  id: number;
  clientName: string;
  clientEmail: string;
  goal: string;
  status: "active" | "paused" | "completed";
  startDate: string;
  endDate: string | null;
  sessionsPerWeek: number;
  progressNotes: string | null;
  nextCheckIn: string | null;
}

/* ─── Helpers ────────────────────────────── */
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/* ─── Component ──────────────────────────── */
export default function TrainerClasses() {
  const [tab, setTab] = useState<"classes" | "bookings" | "pt">("classes");

  /* Classes state */
  const [classes, setClasses] = useState<GymClass[]>([]);
  const [classesLoading, setClassesLoading] = useState(true);

  /* Bookings state */
  const [bookings, setBookings] = useState<TrainerBooking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [bookingFilter, setBookingFilter] = useState<BookingFilter>("all");

  /* PT clients state */
  const [ptClients, setPTClients] = useState<PTClient[]>([]);
  const [ptLoading, setPTLoading] = useState(true);
  const [showAddPT, setShowAddPT] = useState(false);
  const [addingPT, setAddingPT] = useState(false);
  const [ptForm, setPTForm] = useState({ clientEmail: "", goal: "General Fitness", sessionsPerWeek: 3, startDate: new Date().toISOString().slice(0, 10) });
  const [editingPT, setEditingPT] = useState<number | null>(null);
  const [ptNotesDraft, setPTNotesDraft] = useState<Record<number, string>>({});

  /* Create class modal */
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    name: "",
    scheduledAt: "",
    durationMins: 60,
    maxSpots: 15,
    color: "#3dffff",
    description: "",
    requiredPlan: "basic" as "basic" | "pro" | "elite",
  });

  /* Load classes */
  useEffect(() => {
    api
      .get("/api/gym-classes/trainer-classes")
      .then((res) => {
        if (res.data.success) setClasses(res.data.data);
      })
      .catch(() => {})
      .finally(() => setClassesLoading(false));
  }, []);

  /* Load bookings */
  useEffect(() => {
    api
      .get("/api/trainer-bookings/incoming")
      .then((res) => {
        if (res.data.success) setBookings(res.data.data);
      })
      .catch(() => {})
      .finally(() => setBookingsLoading(false));
  }, []);

  /* Load PT clients */
  useEffect(() => {
    api
      .get("/api/pt-clients")
      .then((res) => {
        if (res.data.success) setPTClients(res.data.data);
      })
      .catch(() => {})
      .finally(() => setPTLoading(false));
  }, []);

  /* Add PT client */
  const handleAddPTClient = async () => {
    if (!ptForm.clientEmail) return;
    setAddingPT(true);
    try {
      const res = await api.post("/api/pt-clients", ptForm);
      if (res.data.success) {
        setPTClients((prev) => [...prev, res.data.data]);
        setShowAddPT(false);
        setPTForm({ clientEmail: "", goal: "General Fitness", sessionsPerWeek: 3, startDate: new Date().toISOString().slice(0, 10) });
      }
    } catch {}
    finally { setAddingPT(false); }
  };

  /* Save PT client notes/status */
  const handleSavePT = async (client: PTClient) => {
    const notes = ptNotesDraft[client.id] ?? client.progressNotes ?? "";
    try {
      await api.patch(`/api/pt-clients/${client.id}`, { progressNotes: notes });
      setPTClients((prev) => prev.map((c) => c.id === client.id ? { ...c, progressNotes: notes } : c));
      setEditingPT(null);
    } catch {}
  };

  /* Update PT client status */
  const handlePTStatus = async (id: number, status: PTClient["status"]) => {
    try {
      await api.patch(`/api/pt-clients/${id}`, { status });
      setPTClients((prev) => prev.map((c) => c.id === id ? { ...c, status } : c));
    } catch {}
  };

  /* Remove PT client */
  const handleRemovePT = async (id: number) => {
    try {
      await api.delete(`/api/pt-clients/${id}`);
      setPTClients((prev) => prev.filter((c) => c.id !== id));
    } catch {}
  };

  /* Create class */
  const handleCreate = async () => {
    if (!form.name || !form.scheduledAt) return;
    setCreating(true);
    try {
      const res = await api.post("/api/gym-classes/trainer-classes", {
        ...form,
        durationMins: Number(form.durationMins),
        maxSpots: Number(form.maxSpots),
      });
      if (res.data.success) {
        // reload
        const fresh = await api.get("/api/gym-classes/trainer-classes");
        if (fresh.data.success) setClasses(fresh.data.data);
        setShowCreate(false);
        setForm({
          name: "",
          scheduledAt: "",
          durationMins: 60,
          maxSpots: 15,
          color: "#3dffff",
          description: "",
          requiredPlan: "basic",
        });
      }
    } catch {
      // silently fail — could show a toast
    } finally {
      setCreating(false);
    }
  };

  /* Delete class */
  const handleDeleteClass = async (id: number) => {
    try {
      await api.delete(`/api/gym-classes/trainer-classes/${id}`);
      setClasses((prev) => prev.filter((c) => c.id !== id));
    } catch {}
  };

  /* Update booking status */
  const handleUpdateStatus = async (id: number, status: "confirmed" | "cancelled") => {
    try {
      await api.patch(`/api/trainer-bookings/${id}/status`, { status });
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status } : b))
      );
    } catch {}
  };

  /* Filtered bookings */
  const filteredBookings =
    bookingFilter === "all"
      ? bookings
      : bookings.filter((b) => b.status === bookingFilter);

  const pendingCount = bookings.filter((b) => b.status === "pending").length;

  return (
    <div className="tc-wrapper">
      {/* ── Header ── */}
      <div className="tc-header">
        <div>
          <h1>Classes & Bookings</h1>
          <p>Manage your group classes and personal training sessions</p>
        </div>
        <div className="tc-header-badge">
          <FontAwesomeIcon icon={faCalendarCheck} />
          <span>
            {classes.length} classes · {bookings.length} bookings
          </span>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="tc-tabs">
        <button
          id="tab-classes"
          className={`tc-tab-btn ${tab === "classes" ? "active" : ""}`}
          onClick={() => setTab("classes")}
        >
          <FontAwesomeIcon icon={faCalendarCheck} />
          My Classes
          {classes.length > 0 && (
            <span className="tc-tab-badge">{classes.length}</span>
          )}
        </button>
        <button
          id="tab-bookings"
          className={`tc-tab-btn ${tab === "bookings" ? "active" : ""}`}
          onClick={() => setTab("bookings")}
        >
          <FontAwesomeIcon icon={faUsers} />
          Session Bookings
          {pendingCount > 0 && (
            <span className="tc-tab-badge">{pendingCount}</span>
          )}
        </button>
        <button
          id="tab-pt"
          className={`tc-tab-btn ${tab === "pt" ? "active" : ""}`}
          onClick={() => setTab("pt")}
        >
          <FontAwesomeIcon icon={faPersonRunning} />
          Personal Training
          {ptClients.filter(c => c.status === "active").length > 0 && (
            <span className="tc-tab-badge">{ptClients.filter(c => c.status === "active").length}</span>
          )}
        </button>
      </div>

      {/* ══════════════════ MY CLASSES TAB ══════════════════ */}
      {tab === "classes" && (
        <>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1.5rem" }}>
            <button
              id="create-class-btn"
              className="tc-create-btn"
              onClick={() => setShowCreate(true)}
            >
              <FontAwesomeIcon icon={faPlus} /> Create Class
            </button>
          </div>

          {classesLoading ? (
            <div className="tc-spinner-wrap">
              <div className="tc-spinner" />
            </div>
          ) : classes.length === 0 ? (
            <div className="tc-empty">
              <div className="tc-empty-icon">
                <FontAwesomeIcon icon={faCalendarDay} />
              </div>
              <h3>No classes yet</h3>
              <p>Create your first group class to start accepting bookings from members.</p>
            </div>
          ) : (
            <div className="tc-classes-grid">
              {classes.map((cls, idx) => {
                const fillPct = Math.round(
                  ((cls.actualBookings || cls.spotsBooked) / cls.maxSpots) * 100
                );
                return (
                  <div
                    key={cls.id}
                    className="tc-class-card"
                    style={{
                      borderTopColor: cls.color,
                      color: cls.color,
                      animationDelay: `${idx * 0.07}s`,
                    }}
                  >
                    <div className="tc-class-card-top">
                      <h3 className="tc-class-name">{cls.name}</h3>
                      <span className={`tc-class-plan-badge tc-badge-${cls.requiredPlan}`}>
                        {cls.requiredPlan}
                      </span>
                    </div>

                    {cls.description && (
                      <p className="tc-class-desc">{cls.description}</p>
                    )}

                    <div className="tc-class-meta">
                      <span className="tc-meta-chip">
                        <FontAwesomeIcon icon={faClock} />
                        {formatDate(cls.scheduledAt)}
                      </span>
                      <span className="tc-meta-chip">
                        <FontAwesomeIcon icon={faFire} />
                        {cls.durationMins} min
                      </span>
                      <span className="tc-meta-chip">
                        <FontAwesomeIcon icon={faChair} />
                        {cls.maxSpots} spots
                      </span>
                    </div>

                    <div className="tc-spots-row">
                      <FontAwesomeIcon icon={faUsers} style={{ opacity: 0.6 }} />
                      <span>Booked</span>
                      <span className="tc-spots-count">
                        {cls.actualBookings ?? cls.spotsBooked} / {cls.maxSpots}
                      </span>
                    </div>
                    <div className="tc-spots-bar">
                      <div
                        className="tc-spots-fill"
                        style={{
                          width: `${fillPct}%`,
                          background: fillPct >= 90 ? "var(--danger)" : cls.color,
                        }}
                      />
                    </div>

                    <div className="tc-class-actions">
                      <button
                        className="tc-del-btn"
                        onClick={() => handleDeleteClass(cls.id)}
                      >
                        <FontAwesomeIcon icon={faTrash} /> Delete Class
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ══════════════════ SESSION BOOKINGS TAB ══════════════════ */}
      {tab === "bookings" && (
        <>
          {/* Filter toolbar */}
          <div className="tc-bookings-toolbar">
            {(["all", "pending", "confirmed", "cancelled"] as BookingFilter[]).map((f) => (
              <button
                key={f}
                className={`tc-filter-btn ${bookingFilter === f ? "active" : ""}`}
                onClick={() => setBookingFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
                {f === "pending" && pendingCount > 0 ? ` (${pendingCount})` : ""}
              </button>
            ))}
          </div>

          {bookingsLoading ? (
            <div className="tc-spinner-wrap">
              <div className="tc-spinner" />
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="tc-empty">
              <div className="tc-empty-icon">
                <FontAwesomeIcon icon={faClipboardList} />
              </div>
              <h3>No {bookingFilter !== "all" ? bookingFilter : ""} bookings</h3>
              <p>When clients book personal training sessions with you, they'll appear here.</p>
            </div>
          ) : (
            <div className="tc-bookings-list">
              {filteredBookings.map((b, idx) => (
                <div
                  key={b.id}
                  className="tc-booking-card"
                  style={{ animationDelay: `${idx * 0.06}s` }}
                >
                  {/* Avatar */}
                  <div className="tc-booking-avatar">
                    {getInitials(b.clientName)}
                  </div>

                  {/* Info */}
                  <div className="tc-booking-info">
                    <p className="tc-booking-client">{b.clientName}</p>
                    <div className="tc-booking-details">
                      <span className="tc-booking-detail-item">
                        <FontAwesomeIcon icon={faClock} />
                        {formatDate(b.scheduledAt)}
                      </span>
                      <span className="tc-booking-detail-item">
                        <FontAwesomeIcon icon={faDumbbell} />
                        {b.durationMins} min
                      </span>
                      <span className="tc-booking-detail-item">
                        <FontAwesomeIcon icon={faUser} />
                        {b.clientEmail}
                      </span>
                    </div>
                    {b.notes && (
                      <p className="tc-booking-notes">
                        <FontAwesomeIcon icon={faInfoCircle} style={{ marginRight: 4 }} />
                        {b.notes}
                      </p>
                    )}
                  </div>

                  {/* Price */}
                  <div className="tc-booking-price">
                    <FontAwesomeIcon icon={faMoneyBill} style={{ marginRight: 5, opacity: 0.6 }} />
                    ${b.totalPrice.toFixed(0)}
                  </div>

                  {/* Status + Actions */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "flex-end" }}>
                    <span className={`tc-status-badge tc-status-${b.status}`}>
                      {b.status}
                    </span>
                    {b.status === "pending" && (
                      <div className="tc-booking-btns">
                        <button
                          className="tc-confirm-btn"
                          onClick={() => handleUpdateStatus(b.id, "confirmed")}
                        >
                          <FontAwesomeIcon icon={faCheck} /> Confirm
                        </button>
                        <button
                          className="tc-cancel-btn"
                          onClick={() => handleUpdateStatus(b.id, "cancelled")}
                        >
                          <FontAwesomeIcon icon={faXmark} /> Decline
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ══════════════════ PERSONAL TRAINING TAB ══════════════════ */}
      {tab === "pt" && (
        <>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1.5rem" }}>
            <button className="tc-create-btn" onClick={() => setShowAddPT(true)}>
              <FontAwesomeIcon icon={faPlus} /> Add Client
            </button>
          </div>

          {ptLoading ? (
            <div className="tc-spinner-wrap"><div className="tc-spinner" /></div>
          ) : ptClients.length === 0 ? (
            <div className="tc-empty">
              <div className="tc-empty-icon">
                <FontAwesomeIcon icon={faDumbbell} />
              </div>
              <h3>No PT clients yet</h3>
              <p>Add clients by their account email to start tracking their long-term progress.</p>
            </div>
          ) : (
            <div className="tc-pt-grid">
              {ptClients.map((c, idx) => (
                <div key={c.id} className="tc-pt-card" style={{ animationDelay: `${idx * 0.07}s` }}>
                  {/* Top row */}
                  <div className="tc-pt-card-top">
                    <div className="tc-pt-avatar">{getInitials(c.clientName)}</div>
                    <div className="tc-pt-card-info">
                      <p className="tc-pt-name">{c.clientName}</p>
                      <p className="tc-pt-email">{c.clientEmail}</p>
                    </div>
                    <select
                      className="tc-pt-status-select"
                      value={c.status}
                      onChange={(e) => handlePTStatus(c.id, e.target.value as PTClient["status"])}
                    >
                      <option value="active">Active</option>
                      <option value="paused">Paused</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>

                  {/* Goal */}
                  <div className="tc-pt-goal">
                    <FontAwesomeIcon icon={faBullseye} />
                    {c.goal}
                  </div>

                  {/* Chips */}
                  <div className="tc-pt-chips">
                    <span className="tc-pt-chip">
                      <FontAwesomeIcon icon={faCalendarDay} />
                      Started {new Date(c.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                    <span className="tc-pt-chip">
                      <FontAwesomeIcon icon={faDumbbell} />
                      {c.sessionsPerWeek}×/week
                    </span>
                    {c.nextCheckIn && (
                      <span className="tc-pt-chip">
                        <FontAwesomeIcon icon={faClock} />
                        Check-in {new Date(c.nextCheckIn).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    )}
                  </div>

                  {/* Progress notes */}
                  <div className="tc-pt-notes-wrap">
                    <p className="tc-pt-notes-label">Progress Notes</p>
                    {editingPT === c.id ? (
                      <textarea
                        className="tc-pt-notes-input"
                        value={ptNotesDraft[c.id] ?? c.progressNotes ?? ""}
                        onChange={(e) => setPTNotesDraft(prev => ({ ...prev, [c.id]: e.target.value }))}
                        placeholder="Add notes about client progress…"
                      />
                    ) : (
                      <p className="tc-pt-notes-text">
                        {c.progressNotes || <span style={{ opacity: 0.4 }}>No notes yet — click Edit to add.</span>}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="tc-pt-card-actions">
                    {editingPT === c.id ? (
                      <>
                        <button className="tc-pt-action-btn save" onClick={() => handleSavePT(c)}>
                          <FontAwesomeIcon icon={faSave} /> Save
                        </button>
                        <button className="tc-pt-action-btn" onClick={() => setEditingPT(null)}>
                          <FontAwesomeIcon icon={faXmark} /> Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button className="tc-pt-action-btn" onClick={() => {
                          setPTNotesDraft(prev => ({ ...prev, [c.id]: c.progressNotes ?? "" }));
                          setEditingPT(c.id);
                        }}>
                          <FontAwesomeIcon icon={faPen} /> Edit Notes
                        </button>
                        <button className="tc-pt-action-btn danger" onClick={() => handleRemovePT(c.id)}>
                          <FontAwesomeIcon icon={faTrash} /> Remove
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add PT client modal */}
          {showAddPT && (
            <div className="tc-modal-overlay" onClick={() => setShowAddPT(false)}>
              <div className="tc-modal-box tc-pt-modal-box" onClick={(e) => e.stopPropagation()}>
                <div className="tc-modal-header">
                  <div className="tc-modal-icon"><FontAwesomeIcon icon={faUser} /></div>
                  <h2>Add PT Client</h2>
                  <button className="tc-modal-close" onClick={() => setShowAddPT(false)}><FontAwesomeIcon icon={faXmark} /></button>
                </div>
                <div className="tc-modal-form">
                  <div>
                    <label className="tc-form-label">Client Email *</label>
                    <input className="tc-form-input" type="email" placeholder="client@email.com"
                      value={ptForm.clientEmail} onChange={(e) => setPTForm(f => ({ ...f, clientEmail: e.target.value }))} />
                    <p style={{ fontSize: "0.75rem", color: "var(--text-dim)", marginTop: "0.3rem" }}>The client must already have an account in the app.</p>
                  </div>
                  <div>
                    <label className="tc-form-label">Training Goal</label>
                    <input className="tc-form-input" placeholder="e.g. Fat Loss, Muscle Gain, Marathon Prep"
                      value={ptForm.goal} onChange={(e) => setPTForm(f => ({ ...f, goal: e.target.value }))} />
                  </div>
                  <div className="tc-form-row-2">
                    <div>
                      <label className="tc-form-label">Sessions / Week</label>
                      <input className="tc-form-input" type="number" min={1} max={14}
                        value={ptForm.sessionsPerWeek} onChange={(e) => setPTForm(f => ({ ...f, sessionsPerWeek: Number(e.target.value) }))} />
                    </div>
                    <div>
                      <label className="tc-form-label">Start Date</label>
                      <input className="tc-form-input" type="date"
                        value={ptForm.startDate} onChange={(e) => setPTForm(f => ({ ...f, startDate: e.target.value }))} />
                    </div>
                  </div>
                </div>
                <div className="tc-modal-actions" style={{ marginTop: "1.5rem" }}>
                  <button className="tc-modal-cancel" onClick={() => setShowAddPT(false)}>Cancel</button>
                  <button className="tc-modal-submit" onClick={handleAddPTClient}
                    disabled={!ptForm.clientEmail || addingPT}>
                    {addingPT ? "Adding…" : "Add Client"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ══════════════════ CREATE CLASS MODAL ══════════════════ */}
      {showCreate && (
        <div className="tc-modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="tc-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="tc-modal-header">
              <div className="tc-modal-icon">
                <FontAwesomeIcon icon={faCalendarPlus} />
              </div>
              <h2>Create New Class</h2>
              <button className="tc-modal-close" onClick={() => setShowCreate(false)}>
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            <div className="tc-modal-form">
              <div>
                <label className="tc-form-label">Class Name *</label>
                <input
                  id="class-name-input"
                  className="tc-form-input"
                  placeholder="e.g. HIIT Blast, Yoga Flow…"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>

              <div>
                <label className="tc-form-label">Description</label>
                <textarea
                  className="tc-form-textarea"
                  placeholder="Briefly describe the class…"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>

              <div>
                <label className="tc-form-label">Date & Time *</label>
                <input
                  id="class-datetime-input"
                  className="tc-form-input"
                  type="datetime-local"
                  value={form.scheduledAt}
                  onChange={(e) => setForm((f) => ({ ...f, scheduledAt: e.target.value }))}
                />
              </div>

              <div className="tc-form-row-2">
                <div>
                  <label className="tc-form-label">Duration (min)</label>
                  <input
                    className="tc-form-input"
                    type="number"
                    min={15}
                    step={15}
                    value={form.durationMins}
                    onChange={(e) => setForm((f) => ({ ...f, durationMins: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <label className="tc-form-label">Max Spots</label>
                  <input
                    className="tc-form-input"
                    type="number"
                    min={1}
                    value={form.maxSpots}
                    onChange={(e) => setForm((f) => ({ ...f, maxSpots: Number(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="tc-form-row-2">
                <div>
                  <label className="tc-form-label">Required Plan</label>
                  <select
                    className="tc-form-select"
                    value={form.requiredPlan}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, requiredPlan: e.target.value as any }))
                    }
                  >
                    <option value="basic">Basic</option>
                    <option value="pro">Pro</option>
                    <option value="elite">Elite</option>
                  </select>
                </div>
                <div>
                  <label className="tc-form-label">Accent Color</label>
                  <input
                    className="tc-form-input"
                    type="color"
                    value={form.color}
                    onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                    style={{ height: "44px", padding: "0.3rem" }}
                  />
                </div>
              </div>
            </div>

            <div className="tc-modal-actions" style={{ marginTop: "1.5rem" }}>
              <button className="tc-modal-cancel" onClick={() => setShowCreate(false)}>
                Cancel
              </button>
              <button
                id="create-class-submit"
                className="tc-modal-submit"
                onClick={handleCreate}
                disabled={!form.name || !form.scheduledAt || creating}
              >
                {creating ? "Creating…" : "Create Class"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
