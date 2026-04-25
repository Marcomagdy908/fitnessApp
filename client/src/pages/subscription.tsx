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
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { useSubscription } from "../context/SubscriptionContext";
import { api } from "../utils/api";
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
  icon: IconDefinition;
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
    accentColor: "var(--accent-cyan)",
    glowColor: "var(--accent-cyan-dim)",
    borderColor: "var(--accent-cyan-border)",
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
    id: "elite",
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

/* ─── Stats ──────────────────────────────────────────────────── */
const stats = [
  { icon: faUsers, value: "3,500+", label: "Active Members" },
  { icon: faUserTie, value: "15", label: "Certified Trainers" },
  { icon: faStar, value: "4.9★", label: "Member Rating" },
  { icon: faCalendarCheck, value: "40+", label: "Weekly Classes" },
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

/* ─── Component ──────────────────────────────────────────────── */
function Subscription() {
  const { subscription, refreshSubscription } = useSubscription();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const getPrice = (plan: MembershipPlan) =>
    billingCycle === "annual" ? plan.annualPrice : plan.price;

  const handleSubscribe = async (planId: string) => {
    setLoadingPlan(planId);
    try {
      await api.post("/api/subscriptions", {
        plan: planId,
        billingCycle
      });
      await refreshSubscription();
    } catch (err) {
      console.error("Subscription failed:", err);
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel your subscription? You will lose premium access at the end of your billing period.")) return;
    
    try {
      await api.patch("/api/subscriptions/cancel", {});
      await refreshSubscription();
    } catch (err) {
      console.error("Cancellation failed:", err);
    }
  };

  return (
    <div className="sub-page">
      {/* ── Active Membership Status ── */}
      {subscription && subscription.plan !== 'free' && (
        <div className="active-mem-container">
          <div className="active-mem-card">
            <div className="active-mem-header">
              <div className="active-mem-badge">
                <FontAwesomeIcon icon={faCrown} />
                Current Status: {subscription.status.toUpperCase()}
              </div>
              <div className="active-mem-plan">
                {subscription.plan.toUpperCase()} PLAN
              </div>
            </div>
            <div className="active-mem-body">
              <div className="active-mem-info">
                <span className="label">Next Billing:</span>
                <span className="value">
                  {subscription.expiresAt ? new Date(subscription.expiresAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="active-mem-info">
                <span className="label">Billing Cycle:</span>
                <span className="value">{subscription.billingCycle}</span>
              </div>
              <div className="active-mem-info">
                <span className="label">Auto Renew:</span>
                <span className="value">{subscription.autoRenew ? 'Enabled' : 'Disabled'}</span>
              </div>
              {subscription.autoRenew ? (
                <button className="active-mem-manage-btn cancel" onClick={handleCancel}>Cancel Subscription</button>
              ) : (
                <p className="cancel-note">Your subscription will end on {new Date(subscription.expiresAt!).toLocaleDateString()}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div className="sub-header">
        <h1 className="sub-title">
          <FontAwesomeIcon icon={faStar} className="me-2" style={{ color: "var(--accent-cyan)" }} />
          Upgrade Your Experience
        </h1>
        <p className="sub-subtitle">
          Unlock premium features, custom meal plans, and 24/7 personal training support.
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
            className={`sub-card${plan.popular ? " sub-card--popular" : ""}${subscription?.plan === plan.id ? " sub-card--active" : ""}`}
            style={{
              borderColor: subscription?.plan === plan.id ? "var(--accent-cyan)" : plan.borderColor,
            }}
          >
            {subscription?.plan === plan.id && (
              <div className="active-tag">Current Plan</div>
            )}
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
                <div className="sub-price" style={{ color: plan.popular ? "var(--text-primary)" : "var(--text-secondary)" }}>
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
                className={`sub-cta-btn${subscription?.plan === plan.id ? " sub-cta-btn--active" : ""}`}
                disabled={subscription?.plan === plan.id || loadingPlan === plan.id}
                onClick={() => handleSubscribe(plan.id)}
              >
                {loadingPlan === plan.id ? "Processing..." : subscription?.plan === plan.id ? "Current Plan" : plan.cta}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ── Facilities ── */}
      <div className="sub-section-heading" style={{ marginTop: "2.5rem", color: "#3dffff" }}>
        <FontAwesomeIcon icon={faDumbbell} />
        Our Facilities
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

      {/* ── Contact Strip ── */}
      <div className="sub-contact-strip">
        <FontAwesomeIcon icon={faPhoneVolume} style={{ color: "var(--accent-cyan)", marginRight: "0.5rem" }} />
        Have questions? Call us at <strong style={{ color: "var(--text-primary)" }}>+1 (800) 555-0199</strong>
      </div>

      <p className="sub-fine-print">
        All memberships auto-renew. Cancel anytime with 30 days notice. No joining fee for first month. Prices in USD.
      </p>
    </div>
  );
}

export default Subscription;
