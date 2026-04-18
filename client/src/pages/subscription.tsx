import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCrown,
  faCheck,
  faXmark,
  faDumbbell,
  faPersonRunning,
  faSpa,
  faStar,
  faUsers,
  faUserTie,
  faCalendarCheck,
  faShieldHalved,
  faTrophy,
  faPhoneVolume,
  faDroplet,
} from "@fortawesome/free-solid-svg-icons";
import "../css/subscription.css";

/* ─── Types ─────────────────────────────────────────────────── */
interface PlanFeature {
  text: string;
  included: boolean;
}

interface MembershipPlan {
  id: string;
  name: string;
  price: string;
  annualPrice: string;
  period: string;
  badge?: string;
  description: string;
  icon: any;
  accentColor: string;
  glowColor: string;
  borderColor: string;
  bgGradient: string;
  features: PlanFeature[];
  cta: string;
  popular: boolean;
}

/* ─── Membership Plan Data ───────────────────────────────────── */
const plans: MembershipPlan[] = [
  {
    id: "basic",
    name: "Basic",
    price: "$29.99",
    annualPrice: "$23.99",
    period: "/ month",
    description:
      "Full access to our gym floor — cardio machines, free weights, and resistance equipment. Perfect for solo training.",
    icon: faShieldHalved,
    accentColor: "#888",
    glowColor: "rgba(136,136,136,0.15)",
    borderColor: "rgba(136,136,136,0.15)",
    bgGradient: "linear-gradient(135deg, #0d0d0d 0%, #111 100%)",
    popular: false,
    cta: "Join Basic",
    features: [
      { text: "Gym floor access (6AM – 10PM)", included: true },
      { text: "Free weights & machines", included: true },
      { text: "Cardio zone (treadmills, bikes)", included: true },
      { text: "Changing rooms & lockers", included: true },
      { text: "Group fitness classes", included: false },
      { text: "Swimming pool & jacuzzi", included: false },
      { text: "Sauna & steam room", included: false },
      { text: "Personal trainer sessions", included: false },
      { text: "Nutrition consultation", included: false },
      { text: "Guest passes (2/month)", included: false },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$59.99",
    annualPrice: "$47.99",
    period: "/ month",
    badge: "Most Popular",
    description:
      "The complete gym experience — unlimited classes, pool, sauna, and everything you need to transform your body.",
    icon: faDumbbell,
    accentColor: "#3dffff",
    glowColor: "rgba(61,255,255,0.15)",
    borderColor: "rgba(61,255,255,0.45)",
    bgGradient: "linear-gradient(135deg, #080f0f 0%, #0a1515 100%)",
    popular: true,
    cta: "Join Pro — First Week Free",
    features: [
      { text: "Gym floor access (24/7)", included: true },
      { text: "Free weights & machines", included: true },
      { text: "Cardio zone (treadmills, bikes)", included: true },
      { text: "Changing rooms & lockers", included: true },
      { text: "Unlimited group fitness classes", included: true },
      { text: "Swimming pool & jacuzzi", included: true },
      { text: "Sauna & steam room", included: true },
      { text: "Personal trainer sessions", included: false },
      { text: "Nutrition consultation", included: false },
      { text: "Guest passes (2/month)", included: false },
    ],
  },
  {
    id: "vip",
    name: "VIP Elite",
    price: "$99.99",
    annualPrice: "$79.99",
    period: "/ month",
    description:
      "The ultimate membership. Everything in Pro plus dedicated personal training, nutrition coaching, and exclusive VIP perks.",
    icon: faTrophy,
    accentColor: "#ffc832",
    glowColor: "rgba(255,200,50,0.15)",
    borderColor: "rgba(255,200,50,0.35)",
    bgGradient: "linear-gradient(135deg, #111009 0%, #181400 100%)",
    popular: false,
    cta: "Go VIP Elite",
    features: [
      { text: "Gym floor access (24/7)", included: true },
      { text: "Free weights & machines", included: true },
      { text: "Cardio zone (treadmills, bikes)", included: true },
      { text: "Changing rooms & premium lockers", included: true },
      { text: "Unlimited group fitness classes", included: true },
      { text: "Swimming pool & jacuzzi", included: true },
      { text: "Sauna & steam room", included: true },
      { text: "4× personal trainer sessions / mo", included: true },
      { text: "Monthly nutrition consultation", included: true },
      { text: "Guest passes (4/month)", included: true },
    ],
  },
];

/* ─── Class Schedule Preview ─────────────────────────────────── */
const classes = [
  { time: "7:00 AM", name: "HIIT Blast", trainer: "Coach Alex", spots: 3, color: "#ff6b6b" },
  { time: "9:00 AM", name: "Yoga Flow", trainer: "Sofia M.", spots: 8, color: "#a98dff" },
  { time: "12:00 PM", name: "Spin Cycle", trainer: "Coach Dan", spots: 1, color: "#3dffff" },
  { time: "6:00 PM", name: "Strength & Power", trainer: "Coach Radu", spots: 5, color: "#ffc832" },
  { time: "7:30 PM", name: "Pilates Core", trainer: "Elena V.", spots: 6, color: "#50e678" },
];

/* ─── Facilities ─────────────────────────────────────────────── */
const facilities = [
  { icon: faDumbbell, label: "Weight Gym", desc: "300+ machines & free weights" },
  { icon: faPersonRunning, label: "Cardio Zone", desc: "50+ treadmills & bikes" },
  { icon: faSpa, label: "Sauna & Spa", desc: "Finnish sauna + steam room" },
  { icon: faDroplet, label: "Pool & Jacuzzi", desc: "25m heated indoor pool" },
  { icon: faUserTie, label: "Personal Training", desc: "15 certified coaches" },
  { icon: faCalendarCheck, label: "Group Classes", desc: "40+ classes per week" },
];

/* ─── Stats ──────────────────────────────────────────────────── */
const stats = [
  { icon: faUsers, value: "3,500+", label: "Active Members" },
  { icon: faUserTie, value: "15", label: "Certified Trainers" },
  { icon: faStar, value: "4.9★", label: "Member Rating" },
  { icon: faCalendarCheck, value: "40+", label: "Weekly Classes" },
];

/* ─── Testimonials ───────────────────────────────────────────── */
const testimonials = [
  {
    name: "Alex P.",
    role: "Pro Member · 8 months",
    avatar: "💪",
    text: "The pool and sauna after a heavy leg session is unreal. Pro membership is 100% worth every penny.",
    stars: 5,
  },
  {
    name: "Maria S.",
    role: "VIP Elite · 1 year",
    avatar: "🏆",
    text: "My personal trainer redesigned my entire programme. Down 14 kg in 6 months and never felt stronger.",
    stars: 5,
  },
  {
    name: "David K.",
    role: "Pro Member · 5 months",
    avatar: "🔥",
    text: "Spin classes at noon, sauna at 1pm. This gym has completely changed my daily routine.",
    stars: 5,
  },
];

/* ─── Component ──────────────────────────────────────────────── */
function Subscription() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");

  const getPrice = (plan: MembershipPlan) =>
    billingCycle === "annual" ? plan.annualPrice : plan.price;

  return (
    <div className="sub-page">
      {/* ── Header ── */}
      <div className="sub-header">
        <h1 className="sub-title">
          <FontAwesomeIcon icon={faCrown} className="me-2" />
          Membership Plans
        </h1>
        <p className="sub-subtitle">
          Join ApexTrack Gym — world-class facilities, expert coaches, and a community that pushes you forward
        </p>

        {/* Billing Toggle */}
        <div className="billing-toggle">
          <button
            className={`billing-btn${billingCycle === "monthly" ? " active" : ""}`}
            onClick={() => setBillingCycle("monthly")}
          >
            Monthly
          </button>
          <button
            className={`billing-btn${billingCycle === "annual" ? " active" : ""}`}
            onClick={() => setBillingCycle("annual")}
          >
            Annual
            <span className="billing-discount-badge">Save 20%</span>
          </button>
        </div>
      </div>

      {/* ── Stats Strip ── */}
      <div className="sub-stats-row">
        {stats.map((s, i) => (
          <div key={i} className="sub-stat-box">
            <div className="sub-stat-icon">
              <FontAwesomeIcon icon={s.icon} />
            </div>
            <div className="sub-stat-val">{s.value}</div>
            <div className="sub-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Pricing Cards ── */}
      <div className="sub-cards-grid">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`sub-card${plan.popular ? " sub-card--popular" : ""}`}
            style={{
              background: plan.bgGradient,
              borderColor: plan.borderColor,
              boxShadow: plan.popular
                ? `0 0 40px ${plan.glowColor}, 0 0 0 1px ${plan.borderColor}`
                : undefined,
            }}
          >
            {plan.popular && (
              <div
                className="sub-card-glow"
                style={{ background: `radial-gradient(ellipse at top, ${plan.glowColor} 0%, transparent 65%)` }}
              />
            )}
            {plan.badge && (
              <div
                className="sub-popular-badge"
                style={{ color: plan.accentColor, borderColor: `${plan.accentColor}50`, background: `${plan.accentColor}15` }}
              >
                {plan.badge}
              </div>
            )}

            <div className="sub-card-inner">
              <div className="sub-plan-icon" style={{ color: plan.accentColor, background: `${plan.accentColor}14` }}>
                <FontAwesomeIcon icon={plan.icon} />
              </div>
              <div className="sub-plan-name" style={{ color: plan.accentColor }}>{plan.name}</div>
              <div className="sub-price-row">
                <div className="sub-price" style={{ color: plan.popular ? "#fff" : "#ccc" }}>
                  {getPrice(plan)}
                </div>
                <div className="sub-period">{plan.period}</div>
              </div>
              {billingCycle === "annual" && (
                <div className="sub-annual-note">billed annually · save 20%</div>
              )}
              <p className="sub-plan-desc">{plan.description}</p>

              <div className="sub-features">
                {plan.features.map((feat, j) => (
                  <div key={j} className={`sub-feature${feat.included ? "" : " sub-feature--excluded"}`}>
                    <span className="sub-feature-icon" style={{ color: feat.included ? plan.accentColor : "#2a2a2a" }}>
                      <FontAwesomeIcon icon={feat.included ? faCheck : faXmark} />
                    </span>
                    <span className="sub-feature-text">{feat.text}</span>
                  </div>
                ))}
              </div>

              <button
                className="sub-cta-btn"
                style={{
                  background: plan.popular
                    ? `linear-gradient(135deg, ${plan.accentColor}, #00cccc)`
                    : `${plan.accentColor}18`,
                  color: plan.popular ? "#000" : plan.accentColor,
                  border: plan.popular ? "none" : `1px solid ${plan.accentColor}40`,
                }}
              >
                {plan.cta}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ── Facilities ── */}
      <div className="sub-section-heading" style={{ marginTop: "2.5rem", color: "#3dffff" }}>
        <FontAwesomeIcon icon={faDumbbell} />
        Our Facilities
        <style>{`.sub-section-heading::after { background: rgba(61,255,255,0.12); }`}</style>
      </div>
      <div className="facilities-grid">
        {facilities.map((f, i) => (
          <div key={i} className="facility-card">
            <div className="facility-icon">
              <FontAwesomeIcon icon={f.icon} />
            </div>
            <div className="facility-label">{f.label}</div>
            <div className="facility-desc">{f.desc}</div>
          </div>
        ))}
      </div>

      {/* ── Today's Classes ── */}
      <div className="sub-section-heading" style={{ marginTop: "2rem", color: "#a98dff" }}>
        <FontAwesomeIcon icon={faCalendarCheck} />
        Today's Group Classes
      </div>
      <div className="classes-list">
        {classes.map((c, i) => (
          <div key={i} className="class-row">
            <div className="class-time">{c.time}</div>
            <div className="class-dot" style={{ background: c.color }} />
            <div className="class-info">
              <div className="class-name">{c.name}</div>
              <div className="class-trainer">
                <FontAwesomeIcon icon={faUserTie} style={{ marginRight: 4, opacity: 0.5 }} />
                {c.trainer}
              </div>
            </div>
            <div className="class-spots" style={{ color: c.spots <= 2 ? "#ff6b6b" : "#555" }}>
              {c.spots} spot{c.spots !== 1 ? "s" : ""} left
            </div>
            <button className="class-book-btn">Book</button>
          </div>
        ))}
      </div>

      {/* ── Testimonials ── */}
      <div className="sub-section-heading" style={{ marginTop: "2rem", color: "#ffc832" }}>
        <FontAwesomeIcon icon={faStar} />
        Member Stories
      </div>
      <div className="sub-testimonials">
        {testimonials.map((t, i) => (
          <div key={i} className="testimonial-card">
            <div className="testimonial-top">
              <div className="testimonial-avatar">{t.avatar}</div>
              <div>
                <div className="testimonial-name">{t.name}</div>
                <div className="testimonial-role">{t.role}</div>
              </div>
              <div className="testimonial-stars">{"★".repeat(t.stars)}</div>
            </div>
            <p className="testimonial-text">"{t.text}"</p>
          </div>
        ))}
      </div>

      {/* ── Contact Strip ── */}
      <div className="sub-contact-strip">
        <FontAwesomeIcon icon={faPhoneVolume} style={{ color: "#3dffff", marginRight: "0.5rem" }} />
        Have questions? Call us at <strong style={{ color: "#fff" }}>+1 (800) 555-0199</strong> or visit us at
        <strong style={{ color: "#fff" }}> 24 Apex Boulevard, Downtown</strong>
      </div>

      <p className="sub-fine-print">
        All memberships auto-renew. Cancel anytime with 30 days notice. No joining fee for first month. Prices in USD.
      </p>
    </div>
  );
}

export default Subscription;
