import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { fetchApi } from "../utils/api";
import "../css/trainer.css";
import Avatar from "react-avatar";

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

  const loadTrainer = async () => {
    setLoading(true);
    try {
      const res = await fetchApi(`/api/trainers/${id}`);
      const json = await res.json();
      setTrainer(json.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrainer();
  }, [id]);

  const handleBooking = async () => {
    if (!trainer) return;

    try {
      setBookingLoading(true);

      await fetchApi("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trainerId: trainer.id,
          userId: 1, // replace with logged user
          totalPrice: trainer.pricePerSession,
        }),
      });

      setShowModal(false);
      await loadTrainer(); // refresh bookings
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return <div className="dash-card">Loading...</div>;
  if (!trainer) return <div className="dash-card">No trainer found</div>;

  return (
    <div className="dashboard-wrapper">
      <div className="dash-grid">
        {/* ================= LEFT ================= */}
        <div className="dash-col">
          <div className="dash-card text-center">
            <Avatar
              name={trainer.name}
              src={trainer.imageUrl || ""}
              size="90"
              round
              color="var(--accent)"
              fgColor="var(--bg-card)"
            />
            <h3>{trainer.name}</h3>
            <p style={{ color: "#aaa" }}>{trainer.title}</p>
            <p style={{ color: "var(--accent)" }}>{trainer.specialty}</p>
          </div>

          <div className="dash-card">
            <div className="dash-card-title">About</div>
            <p style={{ color: "#bbb", lineHeight: 1.6 }}>{trainer.bio}</p>
          </div>

          <div className="dash-card">
            <div className="dash-card-title">Certifications</div>

            {(Array.isArray(trainer.certifications) 
              ? trainer.certifications 
              : trainer.certifications?.split(",") || []
            ).map((c, i) => (
              <div key={i} className="tag-item">
                🏅 {c.trim()}
              </div>
            ))}
          </div>
        </div>

        {/* ================= RIGHT ================= */}
        <div className="dash-col">
          <div className="dash-card">
            <div className="dash-card-title">Overview</div>

            <div className="stat-row">
              <div className="stat-box">
                <div className="stat-label">Experience</div>
                <div className="stat-value">{trainer.experience}</div>
              </div>

              <div className="stat-box">
                <div className="stat-label">Sessions</div>
                <div className="stat-value">{trainer.sessionsCompleted}</div>
              </div>

              <div className="stat-box">
                <div className="stat-label">Price</div>
                <div className="stat-value">{trainer.pricePerSession}$</div>
              </div>
            </div>
          </div>

          <div className="dash-card">
            <div className="dash-card-title">
              <FontAwesomeIcon icon={faStar} /> Rating
            </div>

            <h2 style={{ color: "var(--accent)" }}>{trainer.rating}</h2>
            <p style={{ color: "#aaa" }}>{trainer.reviews} reviews</p>
          </div>

          <div className="dash-card">
            <div className="dash-card-title">Tags</div>

            <div className="tags-wrap">
              {(Array.isArray(trainer.tags) 
                ? trainer.tags 
                : trainer.tags?.split(",") || []
              ).map((t, i) => (
                <span key={i} className="tag">
                  {t.trim()}
                </span>
              ))}
            </div>
          </div>

          {/* BOOKINGS */}
          <div className="dash-card">
            <div className="dash-card-title">Bookings</div>

            {trainer.bookings?.length ? (
              trainer.bookings.map((b) => (
                <div key={b.id} className="booking-card">
                  <div>👤 {b.userName}</div>
                  <div className="muted">
                    {new Date(b.scheduledAt).toLocaleString()}
                  </div>
                  <div className="price">{b.totalPrice}$</div>
                  <div className="muted">Status: {b.status}</div>
                </div>
              ))
            ) : (
              <p className="muted">No bookings yet</p>
            )}
          </div>

          <div className="dash-card center">
            <button
              className="btn btn-outline-cyan"
              onClick={() => setShowModal(true)}
            >
              Book Session ({trainer.pricePerSession}$)
            </button>
          </div>
        </div>
      </div>

      {/* ================= MODAL ================= */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2 className="modal-title">Confirm Booking</h2>

            <div className="modal-info">
              <div>
                Trainer: <span>{trainer.name}</span>
              </div>

              <div>
                Price per session: <span>{trainer.pricePerSession}$</span>
              </div>
            </div>

            <button
              className="btn btn-outline-cyan modal-btn"
              disabled={bookingLoading}
              onClick={handleBooking}
            >
              {bookingLoading ? "Booking..." : "Confirm Booking"}
            </button>

            <button
              className="modal-cancel"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
