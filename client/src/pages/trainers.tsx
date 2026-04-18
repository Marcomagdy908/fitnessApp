import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserTie,
  faCheck,
  faCalendarCheck,
  faFire,
  faDumbbell,
  faHeartPulse,
  faPersonRunning,
  faLeaf,
  faMedal,
  faSearch,
  faSliders,
} from "@fortawesome/free-solid-svg-icons";
import "../css/trainers.css";

/* ─── Types ─────────────────────────────────────────────────── */
interface Trainer {
  id: string;
  name: string;
  title: string;
  specialty: string;
  specialtyIcon: any;
  specialtyColor: string;
  avatar: string;
  rating: number;
  reviews: number;
  experience: number;
  pricePerSession: number;
  sessionsCompleted: number;
  bio: string;
  certifications: string[];
  tags: string[];
  available: boolean;
}

/* ─── Trainer Data ───────────────────────────────────────────── */
const trainers: Trainer[] = [
  {
    id: "alex",
    name: "Alex Carter",
    title: "Head Strength Coach",
    specialty: "Powerlifting & Strength",
    specialtyIcon: faDumbbell,
    specialtyColor: "#ff6b6b",
    avatar: "🏋️",
    rating: 4.9,
    reviews: 214,
    experience: 8,
    pricePerSession: 65,
    sessionsCompleted: 1840,
    bio: "Former national-level powerlifter turned elite coach. Alex specialises in building raw strength through progressive overload and perfecting technique on the big three lifts. His clients average a 30% strength increase in 12 weeks.",
    certifications: ["NSCA-CSCS", "IPF Coaching Level 2", "Precision Nutrition L1"],
    tags: ["Strength", "Powerlifting", "Muscle Gain", "Technique"],
    available: true,
  },
  {
    id: "sofia",
    name: "Sofia Mendes",
    title: "Yoga & Mindful Movement",
    specialty: "Yoga & Flexibility",
    specialtyIcon: faLeaf,
    specialtyColor: "#a98dff",
    avatar: "🧘",
    rating: 4.8,
    reviews: 178,
    experience: 6,
    pricePerSession: 55,
    sessionsCompleted: 1320,
    bio: "Certified yoga instructor and corrective exercise specialist. Sofia blends Vinyasa flow with mobility work to fix movement patterns, reduce injury risk, and build the flexibility that translates directly to better gym performance.",
    certifications: ["RYT-500 (Yoga Alliance)", "FMS Level 2", "TRX Suspension Training"],
    tags: ["Yoga", "Flexibility", "Mindfulness", "Injury Prevention"],
    available: true,
  },
  {
    id: "radu",
    name: "Radu Ionescu",
    title: "Performance & HIIT Coach",
    specialty: "HIIT & Fat Loss",
    specialtyIcon: faFire,
    specialtyColor: "#ffc832",
    avatar: "🔥",
    rating: 4.9,
    reviews: 302,
    experience: 10,
    pricePerSession: 70,
    sessionsCompleted: 2650,
    bio: "High-intensity specialist with a background in competitive athletics. Radu designs metabolic conditioning programs that maximise calorie burn and athletic performance. His 8-week transformation programmes have an 96% completion rate.",
    certifications: ["ACSM-CPT", "CrossFit Level 2", "Kettlebell Athletics Coach"],
    tags: ["HIIT", "Fat Loss", "Conditioning", "Athletic Performance"],
    available: false,
  },
  {
    id: "elena",
    name: "Elena Vasile",
    title: "Pilates & Core Specialist",
    specialty: "Pilates & Core",
    specialtyIcon: faHeartPulse,
    specialtyColor: "#50e678",
    avatar: "🌿",
    rating: 4.7,
    reviews: 143,
    experience: 7,
    pricePerSession: 60,
    sessionsCompleted: 980,
    bio: "STOTT-certified Pilates instructor specialising in core rehabilitation and postnatal fitness. Elena's sessions focus on deep stabiliser muscles, helping clients eliminate back pain, improve posture, and build a bulletproof core.",
    certifications: ["STOTT Pilates Certified", "Pre/Post Natal Fitness", "ACSM-CPT"],
    tags: ["Pilates", "Core Strength", "Rehab", "Posture"],
    available: true,
  },
  {
    id: "dan",
    name: "Dan Petrescu",
    title: "Cardio & Endurance Coach",
    specialty: "Running & Endurance",
    specialtyIcon: faPersonRunning,
    specialtyColor: "#3dffff",
    avatar: "🏃",
    rating: 4.8,
    reviews: 167,
    experience: 9,
    pricePerSession: 58,
    sessionsCompleted: 1450,
    bio: "Former marathon runner (sub-3h PB) coaching recreational to competitive athletes. Dan builds aerobic engines with structured heart-rate training, VO₂ max development, and race-specific programming for 5K to full marathon.",
    certifications: ["USATF Level 2 Track & Field", "Heart Rate Training Cert.", "Precision Nutrition L1"],
    tags: ["Running", "Endurance", "Cardio", "Marathon Prep"],
    available: true,
  },
  {
    id: "mia",
    name: "Mia Florescu",
    title: "Body Transformation Coach",
    specialty: "Hypertrophy & Aesthetics",
    specialtyIcon: faMedal,
    specialtyColor: "#ff9f43",
    avatar: "💎",
    rating: 5.0,
    reviews: 89,
    experience: 5,
    pricePerSession: 75,
    sessionsCompleted: 730,
    bio: "Bikini competitor and body-recomposition expert. Mia's evidence-based approach to hypertrophy training, paired with tailored nutrition protocols, delivers visible body composition changes within 8 weeks — guaranteed.",
    certifications: ["NASM-CPT", "NASM Physique & Bodybuilding Spec.", "PN Level 2"],
    tags: ["Hypertrophy", "Aesthetics", "Body Recomposition", "Nutrition"],
    available: true,
  },
];

/* ─── Specialty filter options ───────────────────────────────── */
const filters = ["All", "Strength", "HIIT", "Fat Loss", "Yoga", "Pilates", "Running", "Hypertrophy"];

/* ─── Star renderer ──────────────────────────────────────────── */
function Stars({ rating }: { rating: number }) {
  return (
    <span className="trainer-stars">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} style={{ color: i <= Math.round(rating) ? "#ffc832" : "#2a2a2a" }}>★</span>
      ))}
    </span>
  );
}

/* ─── Component ──────────────────────────────────────────────── */
function Trainers() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = trainers.filter((t) => {
    const matchesFilter =
      activeFilter === "All" || t.tags.some((tag) => tag.toLowerCase().includes(activeFilter.toLowerCase()));
    const matchesSearch =
      search === "" ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.specialty.toLowerCase().includes(search.toLowerCase()) ||
      t.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const selectedTrainer = trainers.find((t) => t.id === selectedId);

  return (
    <div className="trainers-page">

      {/* ── Header ── */}
      <div className="trainers-header">
        <h1 className="trainers-title">
          <FontAwesomeIcon icon={faUserTie} className="me-2" />
          Personal Trainers
        </h1>
        <p className="trainers-subtitle">
          Choose your coach — every trainer is certified, results-driven, and ready to transform your journey
        </p>
      </div>

      {/* ── Selected Trainer Banner ── */}
      {selectedTrainer && (
        <div className="selected-banner">
          <div className="selected-banner-avatar">{selectedTrainer.avatar}</div>
          <div className="selected-banner-info">
            <div className="selected-banner-label">Your Current Trainer</div>
            <div className="selected-banner-name">{selectedTrainer.name}</div>
            <div className="selected-banner-spec">{selectedTrainer.specialty}</div>
          </div>
          <button className="selected-banner-change" onClick={() => setSelectedId(null)}>
            Change Trainer
          </button>
        </div>
      )}

      {/* ── Search + Filter Bar ── */}
      <div className="trainers-controls">
        <div className="trainers-search-wrap">
          <FontAwesomeIcon icon={faSearch} className="search-icon" />
          <input
            className="trainers-search"
            type="text"
            placeholder="Search by name or specialty…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="trainers-filters">
          <FontAwesomeIcon icon={faSliders} style={{ color: "#555", fontSize: "0.75rem", flexShrink: 0 }} />
          {filters.map((f) => (
            <button
              key={f}
              className={`filter-btn${activeFilter === f ? " active" : ""}`}
              onClick={() => setActiveFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* ── Trainer Cards Grid ── */}
      <div className="trainers-grid">
        {filtered.length === 0 && (
          <div className="trainers-empty">No trainers match your search. Try a different filter.</div>
        )}
        {filtered.map((trainer) => {
          const isSelected = selectedId === trainer.id;
          const isExpanded = expandedId === trainer.id;

          return (
            <div
              key={trainer.id}
              className={`trainer-card${isSelected ? " trainer-card--selected" : ""}${!trainer.available ? " trainer-card--unavailable" : ""}`}
              style={isSelected ? { borderColor: trainer.specialtyColor, boxShadow: `0 0 30px ${trainer.specialtyColor}22` } : {}}
            >
              {/* Availability pill */}
              <div className={`trainer-availability${trainer.available ? " available" : " busy"}`}>
                <span className="avail-dot" />
                {trainer.available ? "Available" : "Fully Booked"}
              </div>

              {/* Avatar + Core Info */}
              <div className="trainer-top">
                <div
                  className="trainer-avatar"
                  style={{ background: `${trainer.specialtyColor}18`, border: `2px solid ${trainer.specialtyColor}30` }}
                >
                  {trainer.avatar}
                </div>
                <div className="trainer-core">
                  <div className="trainer-name">{trainer.name}</div>
                  <div className="trainer-title-text">{trainer.title}</div>
                  <div className="trainer-specialty-pill" style={{ color: trainer.specialtyColor, background: `${trainer.specialtyColor}14`, borderColor: `${trainer.specialtyColor}30` }}>
                    <FontAwesomeIcon icon={trainer.specialtyIcon} style={{ marginRight: 4, fontSize: "0.6rem" }} />
                    {trainer.specialty}
                  </div>
                </div>
              </div>

              {/* Ratings Row */}
              <div className="trainer-rating-row">
                <Stars rating={trainer.rating} />
                <span className="trainer-rating-val">{trainer.rating.toFixed(1)}</span>
                <span className="trainer-reviews">({trainer.reviews} reviews)</span>
                <span className="trainer-exp">{trainer.experience} yrs exp.</span>
              </div>

              {/* Stats */}
              <div className="trainer-stats">
                <div className="trainer-stat">
                  <div className="trainer-stat-val">{trainer.sessionsCompleted.toLocaleString()}</div>
                  <div className="trainer-stat-label">Sessions</div>
                </div>
                <div className="trainer-stat">
                  <div className="trainer-stat-val">${trainer.pricePerSession}</div>
                  <div className="trainer-stat-label">Per Session</div>
                </div>
                <div className="trainer-stat">
                  <div className="trainer-stat-val">{trainer.experience}</div>
                  <div className="trainer-stat-label">Years Exp.</div>
                </div>
              </div>

              {/* Tags */}
              <div className="trainer-tags">
                {trainer.tags.map((tag) => (
                  <span key={tag} className="trainer-tag">{tag}</span>
                ))}
              </div>

              {/* Expandable Bio & Certs */}
              {isExpanded && (
                <div className="trainer-expanded">
                  <p className="trainer-bio">{trainer.bio}</p>
                  <div className="trainer-certs-label">
                    <FontAwesomeIcon icon={faMedal} style={{ color: "#ffc832", marginRight: 5 }} />
                    Certifications
                  </div>
                  <div className="trainer-certs">
                    {trainer.certifications.map((cert) => (
                      <div key={cert} className="trainer-cert">
                        <FontAwesomeIcon icon={faCheck} style={{ color: "#50e678", marginRight: 6, fontSize: "0.6rem" }} />
                        {cert}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Toggle bio */}
              <button className="trainer-bio-toggle" onClick={() => setExpandedId(isExpanded ? null : trainer.id)}>
                {isExpanded ? "Show less ▲" : "View profile ▼"}
              </button>

              {/* CTA */}
              <div className="trainer-actions">
                <button
                  className="trainer-select-btn"
                  disabled={!trainer.available && !isSelected}
                  style={
                    isSelected
                      ? { background: `${trainer.specialtyColor}20`, color: trainer.specialtyColor, borderColor: `${trainer.specialtyColor}50` }
                      : trainer.available
                      ? { background: trainer.specialtyColor === "#3dffff" ? "linear-gradient(135deg,#3dffff,#00cccc)" : `linear-gradient(135deg, ${trainer.specialtyColor}, ${trainer.specialtyColor}bb)`, color: "#000" }
                      : {}
                  }
                  onClick={() => trainer.available && setSelectedId(isSelected ? null : trainer.id)}
                >
                  {isSelected ? (
                    <>
                      <FontAwesomeIcon icon={faCheck} style={{ marginRight: 6 }} />
                      Your Trainer
                    </>
                  ) : trainer.available ? (
                    "Select Trainer"
                  ) : (
                    "Fully Booked"
                  )}
                </button>

                {trainer.available && (
                  <button className="trainer-book-btn">
                    <FontAwesomeIcon icon={faCalendarCheck} style={{ marginRight: 6 }} />
                    Book Session
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Trainers;
