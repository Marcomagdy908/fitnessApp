import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoon, faSun } from "@fortawesome/free-solid-svg-icons";
import "../css/landing.css";

/* ── Global scroll-reveal: watches every .lp-animate ──────── */
function useGlobalReveal() {
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    const els = document.querySelectorAll(".lp-animate");
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

/* ── Animated counter ─────────────────────────────────────── */
function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        obs.disconnect();
        const start = performance.now();
        const duration = 1800;
        const step = (ts: number) => {
          const p = Math.min((ts - start) / duration, 1);
          const ease = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(ease * target) + suffix;
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      },
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, suffix]);
  return <span ref={ref}>0{suffix}</span>;
}

/* ── Data ─────────────────────────────────────────────────── */
const features = [
  {
    icon: "🏋️",
    color: "rgba(61,255,255,0.12)",
    title: "Smart Workout Tracker",
    desc: "Log sets, reps, and weight effortlessly. Visualize your strength gains over time with beautiful progress charts.",
  },
  {
    icon: "🥗",
    color: "rgba(61,210,100,0.12)",
    title: "Meal & Macro Planner",
    desc: "Track calories and macros daily. Get AI-powered meal alternatives tailored to your body and fitness goals.",
  },
  {
    icon: "📊",
    color: "rgba(169,141,255,0.12)",
    title: "Progress Analytics",
    desc: "Comprehensive dashboards to monitor weight, PRs, and body metrics. Know exactly how far you've come.",
  },
  {
    icon: "⚡",
    color: "rgba(255,200,50,0.12)",
    title: "AI-Powered Plans",
    desc: "Get workout and nutrition plans generated specifically for your goals, schedule, and injury history.",
  },
  {
    icon: "🧠",
    color: "rgba(255,120,80,0.12)",
    title: "Injury-Aware Training",
    desc: "Our system flags exercises that may aggravate your injuries and suggests safer alternatives automatically.",
  },
  {
    icon: "🏆",
    color: "rgba(61,255,255,0.10)",
    title: "Gym Booking & Plans",
    desc: "Browse subscription plans and book gym sessions directly from the app. Everything in one dashboard.",
  },
];

const steps = [
  { num: "01", title: "Create your profile", desc: "Tell us your goals, fitness level, and any injury history so we can personalize everything." },
  { num: "02", title: "Pick a plan", desc: "Choose a free or premium plan and unlock AI-generated workouts and nutrition schedules." },
  { num: "03", title: "Train & track", desc: "Log every session, every meal, every rep. Watch your stats climb in real time." },
  { num: "04", title: "Analyze & adapt", desc: "Use our analytics dashboard to spot trends and let AI adjust your plan as you progress." },
];

const testimonials = [
  {
    initials: "AK",
    name: "Alex K.",
    role: "Competitive powerlifter",
    stars: 5,
    text: "\"FitForge completely changed how I train. The injury-aware system saved my knee — it flagged squats and suggested safer alternatives instantly.\"",
  },
  {
    initials: "SR",
    name: "Sofia R.",
    role: "Marathon runner",
    stars: 5,
    text: "\"The macro planner is insane. I finally understand how to fuel my runs without guessing. Down 8 lbs and PR'd my half-marathon last month.\"",
  },
  {
    initials: "JM",
    name: "James M.",
    role: "Personal trainer",
    stars: 5,
    text: "\"I recommend FitForge to every one of my clients. The progress analytics make it so easy to show them exactly what's working.\"",
  },
];

const plans = [
  {
    name: "Basic",
    price: "$29.99",
    priceSuffix: "/mo",
    desc: "Full access to our gym floor — cardio machines, free weights, and resistance equipment.",
    featured: false,
    features: [
      { label: "Gym floor access (6AM – 10PM)", ok: true },
      { label: "Free weights & machines", ok: true },
      { label: "Cardio zone", ok: true },
      { label: "Changing rooms & lockers", ok: true },
      { label: "Group fitness classes", ok: false },
      { label: "Swimming pool & jacuzzi", ok: false },
    ],
  },
  {
    name: "Pro",
    price: "$59.99",
    priceSuffix: "/mo",
    desc: "The complete gym experience — unlimited classes, pool, sauna, and transformation tools.",
    featured: true,
    badge: "Most Popular",
    features: [
      { label: "Gym floor access (24/7)", ok: true },
      { label: "Unlimited fitness classes", ok: true },
      { label: "Swimming pool & jacuzzi", ok: true },
      { label: "Sauna & steam room", ok: true },
      { label: "Personal trainer sessions", ok: false },
      { label: "Nutrition consultation", ok: false },
    ],
  },
  {
    name: "VIP Elite",
    price: "$99.99",
    priceSuffix: "/mo",
    desc: "The ultimate membership. Dedicated personal training, nutrition coaching, and VIP perks.",
    featured: false,
    features: [
      { label: "Everything in Pro", ok: true },
      { label: "4× personal trainer sessions / mo", ok: true },
      { label: "Monthly nutrition consultation", ok: true },
      { label: "Priority gym slots", ok: true },
      { label: "Guest passes (4/month)", ok: true },
      { label: "Exclusive VIP lounge", ok: true },
    ],
  },
];

/* ── Component ────────────────────────────────────────────── */
export default function Landing() {
  const { theme, toggleTheme } = useTheme();
  useGlobalReveal();

  return (
    <div className="lp-root">
      {/* ── Navbar ── */}
      <nav className="lp-nav">
        <Link to="/" className="lp-nav-brand">
          <div className="lp-nav-icon">⚡</div>
          <span className="lp-nav-name">Fit<span>Forge</span></span>
        </Link>

        <ul className="lp-nav-links">
          <li><a href="#features">Features</a></li>
          <li><a href="#how">How it works</a></li>
          <li><a href="#pricing">Pricing</a></li>
          <li><a href="#testimonials">Reviews</a></li>
        </ul>

        <div className="lp-nav-cta">
          <button 
            onClick={toggleTheme} 
            className="lp-btn-ghost me-2" 
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            style={{ padding: '0.55rem 0.8rem' }}
          >
            <FontAwesomeIcon icon={theme === 'dark' ? faSun : faMoon} />
          </button>
          <Link to="/login" className="lp-btn-ghost">Log in</Link>
          <Link to="/signup" className="lp-btn-primary">Get started →</Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="lp-hero">
        <div className="lp-hero-bg" />
        <div className="lp-hero-grid" />
        <div className="lp-hero-orb lp-hero-orb-1" />
        <div className="lp-hero-orb lp-hero-orb-2" />

        <div className="lp-hero-content">
          <div className="lp-hero-badge">
            <div className="lp-hero-badge-dot" />
            Now with AI-Powered Plans
          </div>

          <h1 className="lp-hero-h1">
            Train Smarter.
            <br />
            <span className="grad">Live Stronger.</span>
          </h1>

          <p className="lp-hero-sub">
            FitForge is the all-in-one fitness platform for serious athletes.
            Track workouts, plan meals, monitor progress, and get personalized AI coaching — all in one place.
          </p>

          <div className="lp-hero-actions">
            <Link to="/signup" className="lp-btn-primary-lg">
              Start for free →
            </Link>
            <a href="#features" className="lp-btn-outline-lg">
              ▶ &nbsp;See features
            </a>
          </div>
        </div>

        <div className="lp-hero-scroll">
          <div className="lp-scroll-mouse" />
          <span>Scroll to explore</span>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <div className="lp-stats">
        <div className="lp-stat-item lp-animate" style={{ transitionDelay: "0s" }}>
          <span className="lp-stat-num"><Counter target={50} suffix="k+" /></span>
          <div className="lp-stat-label">Active members</div>
        </div>
        <div className="lp-stat-item lp-animate" style={{ transitionDelay: "0.1s" }}>
          <span className="lp-stat-num"><Counter target={300} suffix="+" /></span>
          <div className="lp-stat-label">Exercises in library</div>
        </div>
        <div className="lp-stat-item lp-animate" style={{ transitionDelay: "0.2s" }}>
          <span className="lp-stat-num"><Counter target={2} suffix="M+" /></span>
          <div className="lp-stat-label">Workouts logged</div>
        </div>
        <div className="lp-stat-item lp-animate" style={{ transitionDelay: "0.3s" }}>
          <span className="lp-stat-num"><Counter target={98} suffix="%" /></span>
          <div className="lp-stat-label">Satisfaction rate</div>
        </div>
      </div>

      {/* ── Features ── */}
      <section id="features" className="lp-section">
        <div>
          <div className="lp-animate lp-section-tag">Features</div>
          <h2 className="lp-animate lp-animate-delay-1 lp-section-h2">
            Everything you need to<br />reach your peak.
          </h2>
          <p className="lp-animate lp-animate-delay-2 lp-section-sub">
            Whether you're bulking, cutting, or training for performance — FitForge has every tool covered.
          </p>

          <div className="lp-features-grid">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="lp-feature-card lp-animate"
                style={{ transitionDelay: `${i * 0.08}s` }}
              >
                <div className="lp-feature-card-accent" />
                <div className="lp-feature-icon" style={{ background: f.color }}>
                  {f.icon}
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how" style={{ background: "rgba(255,255,255,0.015)", borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="lp-section">
          <div>
            <div className="lp-animate lp-section-tag">Process</div>
            <h2 className="lp-animate lp-animate-delay-1 lp-section-h2">
              Up and running<br />in 4 simple steps.
            </h2>
            <div className="lp-steps-wrap">
              {steps.map((s, i) => (
                <div
                  key={s.num}
                  className="lp-step lp-animate"
                  style={{ transitionDelay: `${i * 0.12}s` }}
                >
                  <div className="lp-step-num">{s.num}</div>
                  <h4>{s.title}</h4>
                  <p>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section id="testimonials" className="lp-testimonials-section">
        <div className="lp-testimonials-inner">
          <div className="lp-animate lp-section-tag">Testimonials</div>
          <h2 className="lp-animate lp-animate-delay-1 lp-section-h2">
            Real athletes. Real results.
          </h2>
          <div className="lp-testimonials-track">
            {testimonials.map((t, i) => (
              <div
                key={t.name}
                className="lp-tcard lp-animate"
                style={{ transitionDelay: `${i * 0.15}s` }}
              >
                <div className="lp-tcard-stars">{"★".repeat(t.stars)}</div>
                <p className="lp-tcard-text">{t.text}</p>
                <div className="lp-tcard-author">
                  <div className="lp-tcard-avatar">{t.initials}</div>
                  <div>
                    <div className="lp-tcard-name">{t.name}</div>
                    <div className="lp-tcard-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="lp-section">
        <div>
          <div className="lp-animate lp-section-tag">Pricing</div>
          <h2 className="lp-animate lp-animate-delay-1 lp-section-h2">
            Simple, transparent pricing.
          </h2>
          <p className="lp-animate lp-animate-delay-2 lp-section-sub">
            Start free, upgrade when you're ready. No hidden fees.
          </p>
          <div className="lp-pricing-grid">
            {plans.map((plan, i) => (
              <div
                key={plan.name}
                className={`lp-plan-card lp-animate ${plan.featured ? "featured" : ""}`}
                style={{ transitionDelay: `${i * 0.12}s` }}
              >
                {plan.badge && <span className="lp-plan-badge">{plan.badge}</span>}
                <div className="lp-plan-name">{plan.name}</div>
                <div className="lp-plan-price">
                  {plan.price}<span>{plan.priceSuffix}</span>
                </div>
                <p className="lp-plan-desc">{plan.desc}</p>
                <div className="lp-plan-divider" />
                <ul className="lp-plan-features">
                  {plan.features.map((f) => (
                    <li key={f.label}>
                      <span className={f.ok ? "check" : "cross"}>{f.ok ? "✓" : "✗"}</span>
                      {f.label}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/signup"
                  className={`lp-plan-btn ${plan.featured ? "filled" : "outline"}`}
                >
                  {plan.price === "Free" ? "Get started free" : `Start ${plan.name}`}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="lp-cta-section">
        <div>
          <div className="lp-animate lp-section-tag" style={{ justifyContent: "center" }}>Ready?</div>
          <h2 className="lp-animate lp-animate-delay-1 lp-section-h2">
            Your strongest self<br />starts today.
          </h2>
          <p className="lp-animate lp-animate-delay-2 lp-section-sub" style={{ margin: "0 auto" }}>
            Join 50,000+ athletes already using FitForge. Free to start, no credit card required.
          </p>
          <div className="lp-cta-actions lp-animate lp-animate-delay-3">
            <Link to="/signup" className="lp-btn-primary-lg">Create free account →</Link>
            <Link to="/login" className="lp-btn-outline-lg">Log in</Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="lp-footer">
        <div className="lp-footer-copy">© 2025 FitForge. Built for athletes.</div>
        <div className="lp-footer-links">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Support</a>
        </div>
      </footer>
    </div>
  );
}
