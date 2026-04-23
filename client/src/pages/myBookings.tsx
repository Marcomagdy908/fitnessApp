import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarCheck,
  faChalkboardUser,
  faUserTie,
  faHistory,
  faClock,
  faUsers,
  faCrown,
} from "@fortawesome/free-solid-svg-icons";
import "../css/myBookings.css";

/* ─── Types ─────────────────────────────────────────────────── */
interface Trainer {
  id: number;
  name: string;
  specialty: string;
  rating: number;
  reviews: number;
  experience: string;
  avatar: string;
  price: number;
  available: boolean;
  bio: string;
  tags: string[];
}

interface GymClass {
  id: number;
  name: string;
  instructor: string;
  time: string;
  date: string;
  duration: string;
  location: string;
  spots: number;
  category: string;
  isPremium: boolean;
  isBooked?: boolean;
}

interface Booking {
  id: number;
  trainerName: string;
  trainerAvatar: string;
  specialty: string;
  date: string;
  time: string;
  duration: string;
  price: number;
  status: "confirmed" | "pending" | "cancelled";
  notes?: string;
}

/* ─── Mock Data ─────────────────────────────────────────────── */
const MOCK_TRAINERS: Trainer[] = [
  { id: 1, name: "Marcus 'The Engine' Thorne", specialty: "Bodybuilding", rating: 4.9, reviews: 124, experience: "12 yrs", avatar: "🧔", price: 45, available: true, bio: "Focus on hypertrophy and metabolic conditioning.", tags: ["Bulking", "Powerlifting"] },
  { id: 2, name: "Sarah 'Zen' Miller", specialty: "Yoga & Flexibility", rating: 5.0, reviews: 89, experience: "8 yrs", avatar: "🧘‍♀️", price: 35, available: true, bio: "Expert in Vinyasa and mobility recovery.", tags: ["Yoga", "Meditation"] },
];

const MOCK_CLASSES: GymClass[] = [
  { id: 1, name: "Morning HIIT", instructor: "Marcus Thorne", time: "07:00 AM", date: "Mon, Apr 26", duration: "45 min", location: "Studio A", spots: 12, category: "Cardio", isPremium: false },
  { id: 2, name: "Power Yoga", instructor: "Sarah Miller", time: "09:30 AM", date: "Mon, Apr 26", duration: "60 min", location: "Zen Room", spots: 8, category: "Flexibility", isPremium: true },
];

const MOCK_BOOKINGS: Booking[] = [
  { id: 101, trainerName: "Marcus Thorne", trainerAvatar: "🧔", specialty: "Bodybuilding", date: "Wed, Apr 21", time: "04:00 PM", duration: "60 min", price: 45, status: "confirmed", notes: "Focus on leg day form." },
];

/* ─── Component ──────────────────────────────────────────────── */
function MyBookings() {
  const [primaryTab, setPrimaryTab] = useState<"history" | "classes" | "trainers">("history");
  const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS);
  const [classes, setClasses] = useState<GymClass[]>(MOCK_CLASSES);
  const [trainers] = useState<Trainer[]>(MOCK_TRAINERS);
  const [hasSubscription] = useState(false); // Gate check

  const cancelBooking = (id: number) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: "cancelled" } : b));
  };

  const toggleClassBooking = (id: number) => {
    setClasses(prev => prev.map(c => c.id === id ? { ...c, isBooked: !c.isBooked, spots: c.isBooked ? c.spots + 1 : c.spots - 1 } : c));
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
        <button className={`primary-tab-btn ${primaryTab === "history" ? "active" : ""}`} onClick={() => setPrimaryTab("history")}>
          My Schedule
        </button>
        <button className={`primary-tab-btn ${primaryTab === "classes" ? "active" : ""}`} onClick={() => setPrimaryTab("classes")}>
          Gym Classes
        </button>
        <button className={`primary-tab-btn ${primaryTab === "trainers" ? "active" : ""}`} onClick={() => setPrimaryTab("trainers")}>
          Find Trainers
        </button>
      </div>

      {primaryTab === "history" && (
        <div className="history-view">
          <div className="section-title"><FontAwesomeIcon icon={faHistory} /> Your Upcoming Sessions</div>
          {bookings.length === 0 ? (
            <div className="section-empty">You have no upcoming bookings.</div>
          ) : (
            <div className="bookings-list">
              {bookings.map(b => (
                <div key={b.id} className={`booking-card ${b.status}`}>
                  <div className="booking-status-badge">{b.status}</div>
                  <div className="booking-card-main">
                    <div className="trainer-info">
                      <div className="trainer-avatar-mini">{b.trainerAvatar}</div>
                      <div>
                        <div className="trainer-name">{b.trainerName}</div>
                        <div className="trainer-spec">{b.specialty}</div>
                      </div>
                    </div>
                    <div className="booking-datetime">
                      <div className="dt-item"><FontAwesomeIcon icon={faClock} /> {b.date} at {b.time}</div>
                    </div>
                    <div className="booking-price">
                      <span className="label">Total Paid</span>
                      <span className="value">${b.price}</span>
                    </div>
                    {b.status !== "cancelled" && (
                      <button className="cancel-btn" onClick={() => cancelBooking(b.id)}>Cancel Session</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {primaryTab === "classes" && (
        <div className="classes-view">
          {!hasSubscription && (
            <div className="subscription-gate">
              <FontAwesomeIcon icon={faCrown} className="gate-icon" />
              <div className="gate-content">
                <h3>Gym Classes are for Members</h3>
                <p>Unlock access to all group classes, including Yoga, HIIT, and Spin, with a gym subscription.</p>
                <a href="/subscription" className="gate-cta">View Plans</a>
              </div>
            </div>
          )}
          <div className="section-title"><FontAwesomeIcon icon={faChalkboardUser} /> Available Classes</div>
          <div className="classes-grid">
            {classes.map(c => (
              <div key={c.id} className="class-card">
                <div className="class-card-header">
                  <span className="class-time-badge">{c.time}</span>
                  <span className="class-date-badge">{c.date}</span>
                </div>
                <h3 className="class-name">{c.name} {c.isPremium && <FontAwesomeIcon icon={faCrown} style={{color: "#ffc832", fontSize: "0.8rem"}} />}</h3>
                <p className="class-desc">Led by {c.instructor} in {c.location}.</p>
                <div className="class-meta">
                  <span className="meta-item"><FontAwesomeIcon icon={faClock} /> {c.duration}</span>
                  <span className="meta-item"><FontAwesomeIcon icon={faUsers} /> {c.spots} spots left</span>
                </div>
                <button 
                  className={`class-btn ${c.isBooked ? "booked" : ""}`}
                  onClick={() => toggleClassBooking(c.id)}
                  disabled={!hasSubscription && !c.isBooked}
                >
                  {c.isBooked ? "Unbook Class" : "Book Class"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {primaryTab === "trainers" && (
        <div className="trainers-view">
          <div className="section-title"><FontAwesomeIcon icon={faUserTie} /> Personal Trainers</div>
          <div className="trainers-grid">
            {trainers.map(t => (
              <div key={t.id} className="trainer-card">
                <div className="trainer-availability available"><span className="avail-dot"></span> Available</div>
                <div className="trainer-top">
                  <div className="trainer-avatar">{t.avatar}</div>
                  <div className="trainer-core">
                    <div className="trainer-name">{t.name}</div>
                    <div className="trainer-title-text">{t.specialty}</div>
                    <div className="trainer-rating-row">
                      <span className="trainer-stars">{"★".repeat(Math.floor(t.rating))}</span>
                      <span className="trainer-rating-val">{t.rating}</span>
                      <span className="trainer-reviews">({t.reviews} reviews)</span>
                    </div>
                  </div>
                </div>
                <p className="trainer-bio">{t.bio}</p>
                <div className="trainer-tags">
                  {t.tags.map(tag => <span key={tag} className="trainer-tag">{tag}</span>)}
                </div>
                <div className="trainer-actions">
                  <button className="trainer-book-btn">Book ${t.price}/hr</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default MyBookings;
