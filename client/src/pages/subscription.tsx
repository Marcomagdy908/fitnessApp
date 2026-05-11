import { useState, useEffect } from "react";
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
import PaymentModal, { type PaymentBooking } from "../components/PaymentModal";
import "../css/subscription.css";
import { SUBSCRIPTION_PLAN_STYLES } from "../utils/styleMappings";

/* ─── Types ─────────────────────────────────────────────────── */
interface PlanFeature {
  text: string;
  included: boolean;
}

interface MembershipPlan {
  id: string;
  name: string;
  price: number;
  annualPrice: number;
  period: string;
  badge?: string;
  description: string;
  features: PlanFeature[];
  popular: boolean;
}

// Plans will be fetched from DB

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
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [payingPlan, setPayingPlan] = useState<PaymentBooking | null>(null);

  useEffect(() => {
    api.get("/api/subscriptions/plans")
      .then(res => {
        if (res.data.success) {
          setPlans(res.data.data);
        }
      })
      .catch(err => console.error("Failed to load plans", err))
      .finally(() => setLoading(false));
  }, []);

  const getPrice = (plan: MembershipPlan) =>
    billingCycle === "annual" ? plan.annualPrice : plan.price;

  const handleOpenPayment = (plan: MembershipPlan) => {
    console.log("Opening payment modal for plan:", plan.id);
    const price = billingCycle === "annual" ? plan.annualPrice : plan.price;
    setPayingPlan({
      id: plan.id,
      type: 'subscription',
      planId: plan.id,
      planName: plan.name,
      totalPrice: price,
      billingCycle,
    });
  };

  const handlePaid = async () => {
    setPayingPlan(null);
    await refreshSubscription();
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
      {subscription && subscription.plan && subscription.plan !== 'free' && (
        <div className="active-mem-container">
          <div className="active-mem-card">
            <div className="active-mem-header">
              <div className="active-mem-badge">
                <FontAwesomeIcon icon={faCrown} />
                Current Status: {(subscription.status || 'active').toUpperCase()}
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
        {loading ? (
           <div className="w-100 text-center py-5">
              <div className="spinner-border text-cyan" role="status">
                <span className="visually-hidden">Loading plans...</span>
              </div>
           </div>
        ) : plans.map((plan) => {
          const style = SUBSCRIPTION_PLAN_STYLES[plan.id] || SUBSCRIPTION_PLAN_STYLES.basic;
          return (
            <div
              key={plan.id}
              className={`sub-card${plan.popular ? " sub-card--popular" : ""}${subscription?.plan === plan.id ? " sub-card--active" : ""}`}
              style={{
                borderColor: subscription?.plan === plan.id ? "var(--accent-cyan)" : style.borderColor,
              }}
            >
              {subscription?.plan === plan.id && (
                <div className="active-tag">Current Plan</div>
              )}
              {plan.popular && (
                <div
                  className="sub-card-glow"
                  style={{ background: `radial-gradient(ellipse at top, ${style.glowColor} 0%, transparent 65%)` }}
                />
              )}
              {style.badge && (
                <div
                  className="sub-popular-badge"
                  style={{ color: style.accentColor, borderColor: `${style.accentColor}50`, background: `${style.accentColor}15` }}
                >
                  {style.badge}
                </div>
              )}

              <div className="sub-card-inner">
                <div className="sub-plan-icon" style={{ color: style.accentColor, background: `${style.accentColor}14` }}>
                  <FontAwesomeIcon icon={style.icon} />
                </div>
                <div className="sub-plan-name" style={{ color: style.accentColor }}>{plan.name}</div>
                <div className="sub-price-row">
                  <div className="sub-price" style={{ color: plan.popular ? "var(--text-primary)" : "var(--text-secondary)" }}>
                    ${getPrice(plan)}
                  </div>
                  <div className="sub-period">{billingCycle === "annual" ? "/ year" : "/ month"}</div>
                </div>
                {billingCycle === "annual" && (
                  <div className="sub-annual-note">billed annually · save 20%</div>
                )}
                <p className="sub-plan-desc">{plan.description}</p>

                <div className="sub-features">
                  {plan.features.map((feat, j) => (
                    <div key={j} className={`sub-feature${feat.included ? "" : " sub-feature--excluded"}`}>
                      <span className="sub-feature-icon" style={{ color: feat.included ? style.accentColor : "#2a2a2a" }}>
                        <FontAwesomeIcon icon={feat.included ? faCheck : faXmark} />
                      </span>
                      <span className="sub-feature-text">{feat.text}</span>
                    </div>
                  ))}
                </div>

                <button
                  className={`sub-cta-btn${subscription?.plan === plan.id ? " sub-cta-btn--active" : ""}`}
                  onClick={() => handleOpenPayment(plan)}
                >
                  {subscription?.plan === plan.id ? "Current Plan" : style.cta}
                </button>
              </div>
            </div>
          );
        })}
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
      {/* ════════ PAYMENT MODAL ════════ */}
      {payingPlan && (
        <PaymentModal
          booking={payingPlan}
          onClose={() => setPayingPlan(null)}
          onPaid={handlePaid}
        />
      )}
    </div>
  );
}

export default Subscription;
