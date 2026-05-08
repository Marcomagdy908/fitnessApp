import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarCheck,
  faChalkboardUser,
  faUserTie,
  faHistory,
  faClock,
  faUsers,
  faCrown,
  faCreditCard,
  faXmark,
  faCheckCircle,
  faHourglassHalf,
  faBan,
  faStar,
  faLocationDot,
} from "@fortawesome/free-solid-svg-icons";
import "../css/myBookings.css";
import { api } from "../utils/api";
import { useNavigate } from "react-router-dom";
import PaymentModal, { type PaymentBooking } from "../components/PaymentModal";

/* ─── Types ─────────────────────────────────────────────────── */
interface TrainerBooking {
  id: number;
  trainerName: string;
  trainerAvatar: string;
  trainerSpecialty: string;
  trainerSpecialtyColor: string;
  trainerImageUrl?: string;
  scheduledAt: string;
  durationMins: number;
  totalPrice: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  paymentStatus: "unpaid" | "awaiting_payment" | "paid" | "refunded";
  notes?: string;
  paymentMethod?: string;
  paidAt?: string;
}

interface GymClass {
  id: number;
  name: string;
  scheduledAt: string;
  durationMins: number;
  maxSpots: number;
  spotsBooked: number;
  color: string;
  description: string;
  requiredPlan: string;
  trainerName?: string;
  trainerAvatar?: string;
  isBooked: boolean;
}

interface TrainerCard {
  id: number;
  name: string;
  title: string;
  specialty: string;
  specialtyColor: string;
  avatar: string;
  rating: number;
  reviews: number;
  experience: number;
  pricePerSession: number;
  bio: string;
  tags: string[];
  available: boolean;
}

/* ─── Helpers ─────────────────────────────────────────────── */
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { icon: any; className: string }> = {
    confirmed: { icon: faCheckCircle, className: "booking-status-badge confirmed" },
    pending: { icon: faHourglassHalf, className: "booking-status-badge pending" },
    cancelled: { icon: faBan, className: "booking-status-badge cancelled" },
    completed: { icon: faCheckCircle, className: "booking-status-badge completed" },
  };
  const s = map[status] || map.pending;
  return (
    <div className={s.className}>
      <FontAwesomeIcon icon={s.icon} /> {status}
    </div>
  );
}

function PaymentBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    unpaid: "var(--text-dim)",
    awaiting_payment: "var(--warning)",
    paid: "var(--success)",
    refunded: "var(--danger)",
  };
  return (
    <span style={{
      fontSize: "0.7rem", fontWeight: 800, textTransform: "uppercase",
      letterSpacing: "0.06em", color: colors[status] || "var(--text-dim)",
    }}>
      {status ? status.replace("_", " ") : "N/A"}
    </span>
  );
}

/* ─── Component ──────────────────────────────────────────────── */
function MyBookings() {
  const navigate = useNavigate();
  const [primaryTab, setPrimaryTab] = useState<"history" | "classes" | "trainers">("history");

  /* Data state */
  const [bookings, setBookings] = useState<TrainerBooking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [classes, setClasses] = useState<GymClass[]>([]);
  const [classesLoading, setClassesLoading] = useState(true);
  const [trainers, setTrainers] = useState<TrainerCard[]>([]);
  const [trainersLoading, setTrainersLoading] = useState(true);

  /* Payment modal */
  const [payingBooking, setPayingBooking] = useState<PaymentBooking | null>(null);

  /* ── Load real data ── */
  useEffect(() => {
    api.get("/api/trainer-bookings")
      .then(res => { if (res.data.success) setBookings(res.data.data); })
      .catch(() => {})
      .finally(() => setBookingsLoading(false));
  }, []);

  useEffect(() => {
    api.get("/api/gym-classes")
      .then(res => { if (res.data.success) setClasses(res.data.data.map((c: any) => ({ ...c, isBooked: !!c.isBooked }))); })
      .catch(() => {})
      .finally(() => setClassesLoading(false));
  }, []);

  useEffect(() => {
    api.get("/api/trainers")
      .then(res => { if (res.data.success) setTrainers(res.data.data); })
      .catch(() => {})
      .finally(() => setTrainersLoading(false));
  }, []);

  /* ── Actions ── */
  const cancelBooking = async (id: number) => {
    try {
      await api.patch(`/api/trainer-bookings/${id}/cancel`);
      setBookings(prev => prev.map(b => b.id === id
        ? { ...b, status: "cancelled", paymentStatus: "refunded" } : b));
    } catch {}
  };

  const toggleClass = async (cls: GymClass) => {
    try {
      if (cls.isBooked) {
        await api.delete(`/api/gym-classes/${cls.id}/book`);
        setClasses(prev => prev.map(c => c.id === cls.id
          ? { ...c, isBooked: false, spotsBooked: c.spotsBooked - 1 } : c));
      } else {
        await api.post(`/api/gym-classes/${cls.id}/book`);
        setClasses(prev => prev.map(c => c.id === cls.id
          ? { ...c, isBooked: true, spotsBooked: c.spotsBooked + 1 } : c));
      }
    } catch {}
  };

  const handlePaid = (bookingId: number) => {
    setBookings(prev => prev.map(b => b.id === bookingId
      ? { ...b, paymentStatus: "paid" } : b));
  };

  return (
    <div className="bookings-page">
      <div className="bookings-header">
        <h1 className="bookings-title">
          <FontAwesomeIcon icon={faCalendarCheck} className="me-2" />
          Gym & Bookings
        </h1>
        <p className="bookings-subtitle">Book classes, find trainers, and manage your schedule</p>
      </div>

      <div className="bookings-primary-tabs">
        <button className={`primary-tab-btn ${primaryTab === "history" ? "active" : ""}`}
          onClick={() => setPrimaryTab("history")}>
          My Schedule
          {bookings.filter(b => b.status !== "cancelled").length > 0 && (
            <span style={{ marginLeft: "0.4rem", background: "var(--accent-cyan)", color: "#000",
              fontSize: "0.65rem", fontWeight: 900, padding: "0.1rem 0.45rem", borderRadius: "999px" }}>
              {bookings.filter(b => b.status !== "cancelled").length}
            </span>
          )}
        </button>
        <button className={`primary-tab-btn ${primaryTab === "classes" ? "active" : ""}`}
          onClick={() => setPrimaryTab("classes")}>
          Gym Classes
        </button>
        <button className={`primary-tab-btn ${primaryTab === "trainers" ? "active" : ""}`}
          onClick={() => setPrimaryTab("trainers")}>
          Find Trainers
        </button>
      </div>

      {/* ════════ MY SCHEDULE ════════ */}
      {primaryTab === "history" && (
        <div className="history-view">
          <div className="section-title">
            <FontAwesomeIcon icon={faHistory} /> Your Sessions
          </div>

          {bookingsLoading ? (
            <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-dim)" }}>Loading…</div>
          ) : bookings.length === 0 ? (
            <div className="section-empty">
              You have no bookings yet. Browse our trainers to book your first session!
            </div>
          ) : (
            <div className="bookings-list">
              {bookings.map(b => (
                <div key={b.id} className={`booking-card ${b.status}`}>
                  <StatusBadge status={b.status} />
                  <div className="booking-card-main">
                    <div className="trainer-info">
                      <div className="trainer-avatar-mini">{b.trainerAvatar || "🏋️"}</div>
                      <div>
                        <div className="trainer-name">{b.trainerName}</div>
                        <div className="trainer-spec" style={{ color: b.trainerSpecialtyColor }}>
                          {b.trainerSpecialty}
                        </div>
                      </div>
                    </div>

                    <div className="booking-datetime">
                      <div className="dt-item">
                        <FontAwesomeIcon icon={faClock} /> {formatDate(b.scheduledAt)}
                      </div>
                      <div className="dt-item" style={{ fontSize: "0.78rem", color: "var(--text-dim)" }}>
                        {b.durationMins} min session
                        {b.notes && ` · ${b.notes}`}
                      </div>
                    </div>

                    <div className="booking-price">
                      <span className="label">Amount</span>
                      <span className="value">${(b.totalPrice || 0).toFixed(2)}</span>
                      <PaymentBadge status={b.paymentStatus} />
                    </div>

                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                      {/* Pay button — shown when confirmed and awaiting payment */}
                      {b.status === "confirmed" && b.paymentStatus === "awaiting_payment" && (
                        <button
                          className="cancel-btn"
                          style={{ background: "var(--accent-cyan)", color: "#000", border: "none" }}
                          onClick={() => setPayingBooking({
                            id: b.id,
                            trainerName: b.trainerName,
                            trainerAvatar: b.trainerAvatar,
                            trainerSpecialty: b.trainerSpecialty,
                            scheduledAt: b.scheduledAt,
                            durationMins: b.durationMins,
                            totalPrice: b.totalPrice,
                            paymentStatus: b.paymentStatus,
                            status: b.status,
                          })}
                        >
                          <FontAwesomeIcon icon={faCreditCard} /> Pay Now
                        </button>
                      )}

                      {/* Cancel button */}
                      {(b.status === "pending" || b.status === "confirmed") && (
                        <button className="cancel-btn" onClick={() => cancelBooking(b.id)}>
                          <FontAwesomeIcon icon={faXmark} /> Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ════════ GYM CLASSES ════════ */}
      {primaryTab === "classes" && (
        <div className="classes-view">
          <div className="section-title">
            <FontAwesomeIcon icon={faChalkboardUser} /> Available Classes
          </div>

          {classesLoading ? (
            <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-dim)" }}>Loading…</div>
          ) : classes.length === 0 ? (
            <div className="section-empty">No upcoming classes available.</div>
          ) : (
            <div className="classes-grid">
              {classes.map(c => (
                <div key={c.id} className="class-card" style={{ borderTopColor: c.color }}>
                  <div className="class-card-header">
                    <span className="class-time-badge">
                      {new Date(c.scheduledAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <span className="class-date-badge">
                      {new Date(c.scheduledAt).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                    </span>
                  </div>
                  <h3 className="class-name">{c.name}</h3>
                  {c.description && <p className="class-desc">{c.description}</p>}
                  {c.trainerName && (
                    <p className="class-desc" style={{ opacity: 0.7 }}>
                      Led by {c.trainerAvatar} {c.trainerName}
                    </p>
                  )}
                  <div className="class-meta">
                    <span className="meta-item"><FontAwesomeIcon icon={faClock} /> {c.durationMins} min</span>
                    <span className="meta-item">
                      <FontAwesomeIcon icon={faUsers} /> {c.maxSpots - c.spotsBooked} spots left
                    </span>
                    <span className="meta-item">
                      <FontAwesomeIcon icon={faCrown} /> {c.requiredPlan}
                    </span>
                  </div>
                  <button
                    className={`class-btn ${c.isBooked ? "booked" : ""}`}
                    onClick={() => toggleClass(c)}
                    disabled={!c.isBooked && c.spotsBooked >= c.maxSpots}
                  >
                    {c.isBooked ? "Unbook Class" : "Book Class"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ════════ FIND TRAINERS ════════ */}
      {primaryTab === "trainers" && (
        <div className="trainers-view">
          <div className="section-title">
            <FontAwesomeIcon icon={faUserTie} /> Personal Trainers
          </div>

          {trainersLoading ? (
            <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-dim)" }}>Loading…</div>
          ) : (
            <div className="trainers-grid">
              {trainers.map(t => (
                <div key={t.id} className="trainer-card" onClick={() => navigate(`/trainer/${t.id}`)}>
                  <div className={`trainer-availability ${t.available ? "available" : "unavailable"}`}>
                    <span className="avail-dot" /> {t.available ? "Available" : "Busy"}
                  </div>
                  <div className="trainer-top">
                    <div className="trainer-avatar">{t.avatar}</div>
                    <div className="trainer-core">
                      <div className="trainer-name">{t.name}</div>
                      <div className="trainer-title-text" style={{ color: t.specialtyColor }}>
                        {t.specialty}
                      </div>
                      <div className="trainer-rating-row">
                        <FontAwesomeIcon icon={faStar} style={{ color: "#ffc107", fontSize: "0.75rem" }} />
                        <span className="trainer-rating-val">{t.rating}</span>
                        <span className="trainer-reviews">({t.reviews} reviews)</span>
                      </div>
                    </div>
                  </div>
                  <p className="trainer-bio">{t.bio}</p>
                  <div className="trainer-tags">
                    {Array.isArray(t.tags) && t.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="trainer-tag">{tag}</span>
                    ))}
                  </div>
                  <div className="trainer-actions">
                    <button 
                      className="trainer-book-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/trainer/${t.id}`);
                      }}
                    >
                      Book · ${t.pricePerSession}/hr
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ════════ PAYMENT MODAL ════════ */}
      {payingBooking && (
        <PaymentModal
          booking={payingBooking}
          onClose={() => setPayingBooking(null)}
          onPaid={handlePaid}
        />
      )}
    </div>
  );
}

export default MyBookings;
