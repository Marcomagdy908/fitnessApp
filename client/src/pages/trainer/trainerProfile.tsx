import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStar,
  faDumbbell,
  faCalendarCheck,
  faMoneyBill,
  faMedal,
  faTag,
  faCircleCheck,
  faUser,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { fetchApi } from "../../utils/api";
import "../../css/trainer.css";
import Avatar from "react-avatar";
import { useAuth } from "../../context/AuthContext";

type Booking = {
  id: number;
  userName: string;
  scheduledAt: string;
  status: string;
  totalPrice: number;
};

type Trainer = {
  id: number;
  name: string;
  title: string;
  specialty: string;
  bio: string;
  certifications: string | string[];
  tags: string | string[];
  imageUrl: string | null;
  rating: number;
  reviews: number;
  experience: number;
  pricePerSession: number;
  sessionsCompleted: number;
  bookings?: Booking[];
};

export default function TrainerProfile() {
  const { id } = useParams<{ id: string }>();

  const [trainer, setTrainer] = useState<Trainer | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Trainer | null>(null);

  const loadTrainer = async () => {
    setLoading(true);
    try {
      const res = await fetchApi(`/api/trainers/${id}`);
      const json = await res.json();
      setTrainer(json.data);
      setEditData(json.data);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editData) return;
    try {
      setLoading(true);
      await fetchApi(`/api/trainers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });
      setTrainer(editData);
      setIsEditing(false);
    } finally {
      setLoading(false);
    }
  };

  const toggleEditing = () => {
    if (isEditing) {
      setEditData(trainer); // Reset changes
    }
    setIsEditing(!isEditing);
  };

  useEffect(() => { loadTrainer(); }, [id]);

  const handleBooking = async () => {
    if (!trainer) return;
    try {
      setBookingLoading(true);
      await fetchApi("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trainerId: trainer.id, userId: 1, totalPrice: trainer.pricePerSession }),
      });
      setShowModal(false);
      await loadTrainer();
    } finally {
      setBookingLoading(false);
    }
  };

  const getCerts = (v: string | string[]) =>
    Array.isArray(v) ? v : v?.split(",").map(s => s.trim()).filter(Boolean) ?? [];

  const renderStars = (rating: number) =>
    [1, 2, 3, 4, 5].map(n => (
      <FontAwesomeIcon
        key={n}
        icon={faStar}
        className={`tp-star ${n <= Math.round(rating) ? "tp-star-filled" : ""}`}
      />
    ));

  if (loading)
    return (
      <div className="tp-loading">
        <div className="tp-spinner" />
        <span>Loading profile…</span>
      </div>
    );

  if (!trainer)
    return <div className="tp-empty">Trainer not found.</div>;

  const certs = getCerts(trainer.certifications);
  const tags  = getCerts(trainer.tags);

  const { user } = useAuth();
  const isTrainer = user?.role === "TRAINER";

  return (
    <div className="tp-wrapper">

      {/* ── Header hero ── */}
      <div className="tp-hero">
        <div className="tp-hero-avatar">
          <Avatar
            name={trainer.name}
            src={trainer.imageUrl || ""}
            size="90"
            round
            color="var(--accent-cyan)"
            fgColor="var(--text-inverse)"
          />
        </div>
        <div className="tp-hero-info">
          {isEditing ? (
            <>
              <input
                className="tp-input-edit"
                value={editData?.name}
                onChange={(e) => setEditData({ ...editData!, name: e.target.value })}
              />
              <input
                className="tp-input-edit-small"
                value={editData?.title}
                onChange={(e) => setEditData({ ...editData!, title: e.target.value })}
              />
              <input
                className="tp-input-edit-badge"
                value={editData?.specialty}
                onChange={(e) => setEditData({ ...editData!, specialty: e.target.value })}
              />
            </>
          ) : (
            <>
              <h1 className="tp-hero-name">{trainer.name}</h1>
              <p className="tp-hero-title">{trainer.title}</p>
              <span className="tp-hero-specialty">{trainer.specialty}</span>
            </>
          )}
        </div>
        <div className="tp-hero-actions">
          {isEditing ? (
            <>
              <button className="tp-save-btn" onClick={handleSave}>Save</button>
              <button className="tp-cancel-btn" onClick={toggleEditing}>Cancel</button>
            </>
          ) : (
            <>
              {isTrainer && (
                <button className="tp-edit-btn" onClick={toggleEditing}>Edit Profile</button>
              )}
              {!isTrainer && (
                <button className="tp-book-btn" onClick={() => setShowModal(true)}>
                  Book Session — ${trainer.pricePerSession}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="tp-stats-row">
        {[
          { label: "Experience", value: isEditing ? (
              <input
                type="number"
                className="tp-stat-input"
                value={editData?.experience}
                onChange={(e) => setEditData({ ...editData!, experience: Number(e.target.value) })}
              />
            ) : `${trainer.experience} yrs`, icon: faDumbbell,      color: "cyan" },
          { label: "Sessions",   value: trainer.sessionsCompleted,   icon: faCalendarCheck, color: "purple" },
          { label: "Rating",     value: trainer.rating,              icon: faStar,           color: "gold" },
          { label: "Reviews",    value: trainer.reviews,             icon: faUser,           color: "green" },
          { label: "Price",      value: isEditing ? (
              <input
                type="number"
                className="tp-stat-input"
                value={editData?.pricePerSession}
                onChange={(e) => setEditData({ ...editData!, pricePerSession: Number(e.target.value) })}
              />
            ) : `$${trainer.pricePerSession}`, icon: faMoneyBill,    color: "cyan" },
        ].map((s, i) => (
          <div className={`tp-stat tp-stat-${s.color}`} key={i} style={{ animationDelay: `${i * 0.08}s` }}>
            <FontAwesomeIcon icon={s.icon} className="tp-stat-icon" />
            <span className="tp-stat-value">{s.value}</span>
            <span className="tp-stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── Main grid ── */}
      <div className="tp-profile-grid">

        {/* LEFT */}
        <div className="tp-col">

          {/* About */}
          <div className="tp-card">
            <div className="tp-card-title">
              <FontAwesomeIcon icon={faUser} /> About
            </div>
            {isEditing ? (
              <textarea
                className="tp-textarea-edit"
                value={editData?.bio}
                onChange={(e) => setEditData({ ...editData!, bio: e.target.value })}
              />
            ) : (
              <p className="tp-bio">{trainer.bio}</p>
            )}
          </div>

          {/* Certifications */}
          <div className="tp-card">
            <div className="tp-card-title">
              <FontAwesomeIcon icon={faMedal} /> Certifications
            </div>
            <div className="tp-certs-list">
              {isEditing ? (
                <input
                  className="tp-input-edit"
                  value={Array.isArray(editData?.certifications) ? editData?.certifications.join(", ") : editData?.certifications}
                  placeholder="Separated by comma"
                  onChange={(e) => setEditData({ ...editData!, certifications: e.target.value })}
                />
              ) : (
                certs.length > 0 ? certs.map((c, i) => (
                  <div className="tp-cert-item" key={i} style={{ animationDelay: `${0.2 + i * 0.08}s` }}>
                    <FontAwesomeIcon icon={faCircleCheck} className="tp-cert-icon" />
                    <span>{c}</span>
                  </div>
                )) : <p className="tp-muted">No certifications listed.</p>
              )}
            </div>
          </div>

          {/* Tags */}
          <div className="tp-card">
            <div className="tp-card-title">
              <FontAwesomeIcon icon={faTag} /> Specialties
            </div>
            <div className="tp-tags-wrap">
              {isEditing ? (
                <input
                  className="tp-input-edit"
                  value={Array.isArray(editData?.tags) ? editData?.tags.join(", ") : editData?.tags}
                  placeholder="Separated by comma"
                  onChange={(e) => setEditData({ ...editData!, tags: e.target.value })}
                />
              ) : (
                tags.length > 0 ? tags.map((t, i) => (
                  <span className="tp-tag" key={i}>{t}</span>
                )) : <p className="tp-muted">No specialties listed.</p>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="tp-col">

          {/* Rating card */}
          <div className="tp-card tp-rating-card">
            <div className="tp-card-title">
              <FontAwesomeIcon icon={faStar} /> Rating & Reviews
            </div>
            <div className="tp-rating-big">{trainer.rating}</div>
            <div className="tp-stars">{renderStars(trainer.rating)}</div>
            <p className="tp-muted">{trainer.reviews} client reviews</p>
          </div>

          {/* Bookings */}
          <div className="tp-card">
            <div className="tp-card-title">
              <FontAwesomeIcon icon={faCalendarCheck} /> Bookings
            </div>
            {trainer.bookings?.length ? (
              <div className="tp-bookings-list">
                {trainer.bookings.map(b => (
                  <div key={b.id} className="tp-booking-row">
                    <div className="tp-booking-user">
                      <FontAwesomeIcon icon={faUser} className="tp-booking-icon" />
                      {b.userName}
                    </div>
                    <div className="tp-booking-date">
                      {new Date(b.scheduledAt).toLocaleString()}
                    </div>
                    <div className="tp-booking-meta">
                      <span className={`tp-booking-status tp-status-${b.status.toLowerCase()}`}>
                        {b.status}
                      </span>
                      <span className="tp-booking-price">${b.totalPrice}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="tp-muted">No bookings yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Modal ── */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <FontAwesomeIcon icon={faCalendarCheck} className="modal-header-icon" />
              <h2>Confirm Booking</h2>
              <button className="tp-modal-close" onClick={() => setShowModal(false)}>
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            <div className="tp-modal-info">
              <div className="tp-modal-row">
                <span>Trainer</span>
                <strong>{trainer.name}</strong>
              </div>
              <div className="tp-modal-row">
                <span>Specialty</span>
                <strong>{trainer.specialty}</strong>
              </div>
              <div className="tp-modal-row">
                <span>Price per session</span>
                <strong className="tp-modal-price">${trainer.pricePerSession}</strong>
              </div>
            </div>

            <div className="modal-actions">
              <button className="modal-btn-cancel" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="modal-btn-save" disabled={bookingLoading} onClick={handleBooking}>
                {bookingLoading ? "Booking…" : "Confirm Booking"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
