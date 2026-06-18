import { useEffect, useRef, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import * as THREE from "three";
import { useTheme } from "../context/ThemeContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoon, faSun, faDumbbell, faBolt, faHeartPulse } from "@fortawesome/free-solid-svg-icons";
import "../css/landing.css";

/* ── Global scroll-reveal helper ──────── */
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

const pricingPlans = [
  {
    name: "Premium",
    price: "$95",
    suffix: "/mo",
    desc: "Complete athletic programming, class booking, and recovery facilities.",
    features: [
      "Access to all FitForge locations",
      "Unlimited group fitness classes",
      "Injury-aware training system",
      "Full macro & nutrition tracking",
      "Locker & sauna access"
    ],
    accent: "purple"
  },
  {
    name: "Pro - Live Stronger",
    price: "$135",
    suffix: "/mo",
    desc: "The ultimate program. Custom coaching, advanced metrics, and elite facilities.",
    features: [
      "Everything in Premium",
      "2x Personal training sessions per month",
      "1x Custom nutrition consultation",
      "Exclusive access to VIP recovery zone",
      "AI-driven load & rest progression"
    ],
    featured: true,
    accent: "iridescent"
  },
  {
    name: "Basic / Yoga",
    price: "$40",
    suffix: "/mo",
    desc: "Access to standard strength and mobility zones.",
    features: [
      "Access to primary gym floor",
      "1x mobility assessment",
      "Locker access",
      "Basic workout logging tools"
    ],
    accent: "cyan"
  }
];

export default function Landing() {
  const { theme, toggleTheme } = useTheme();
  useGlobalReveal();

  const [activePlanIndex, setActivePlanIndex] = useState(1); // Default to Pro (featured)

  // Refs for scroll interpolation
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heroPlaceholderRef = useRef<HTMLDivElement>(null);
  const programsPlaceholderRef = useRef<HTMLDivElement>(null);
  const leftCardRef = useRef<HTMLDivElement>(null);
  const rightCardRef = useRef<HTMLDivElement>(null);

  // Generate ambient floating particles
  const particles = useMemo(() => {
    return Array.from({ length: 25 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 2 + 1.5,
      delay: Math.random() * 8,
      duration: Math.random() * 12 + 10,
    }));
  }, []);

  // 1. Setup Three.js scene once on mount
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;

    // Fixed resolution for the WebGL context - this is extremely performant
    // since we do not recreate WebGL buffers on resize/scroll.
    const width = 450;
    const height = 450;

    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.z = 4.8;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);

    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    // Hemisphere light to add non-black ambient environment gradient
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x333333, 1.25);
    scene.add(hemiLight);

    // Cyan Orbiting Light
    const cyanLight = new THREE.PointLight(0x05ffda, 9, 12);
    scene.add(cyanLight);

    // Purple Orbiting Light
    const purpleLight = new THREE.PointLight(0x7b2cbf, 9, 12);
    scene.add(purpleLight);

    // General Directional light for specular highlights
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.95);
    dirLight.position.set(2, 5, 3);
    scene.add(dirLight);

    // Create the Kettlebell group
    const kettlebellGroup = new THREE.Group();

    // High metalness chrome material
    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xf0f0f0,
      metalness: 0.38,
      roughness: 0.16,
    });

    // Body
    const bodyGeo = new THREE.SphereGeometry(1.0, 64, 64);
    const body = new THREE.Mesh(bodyGeo, chromeMat);
    kettlebellGroup.add(body);

    // Torus handle
    const handleGeo = new THREE.TorusGeometry(0.6, 0.16, 32, 64);
    const handle = new THREE.Mesh(handleGeo, chromeMat);
    handle.position.y = 0.75;
    kettlebellGroup.add(handle);

    // Connectors
    const connGeo = new THREE.SphereGeometry(0.17, 16, 16);
    const leftConn = new THREE.Mesh(connGeo, chromeMat);
    leftConn.position.set(-0.6, 0.75, 0);
    kettlebellGroup.add(leftConn);

    const rightConn = new THREE.Mesh(connGeo, chromeMat);
    rightConn.position.set(0.6, 0.75, 0);
    kettlebellGroup.add(rightConn);

    kettlebellGroup.position.y = -0.3;
    scene.add(kettlebellGroup);

    // Clock for timing animations
    const clock = new THREE.Clock();
    let animId: number;

    const tick = () => {
      const elapsed = clock.getElapsedTime();

      // Rotate the kettlebell slowly
      kettlebellGroup.rotation.y = elapsed * 0.45;
      kettlebellGroup.rotation.x = Math.sin(elapsed * 0.2) * 0.12;

      // Orbit cyan and purple lights to reflect dynamic colored chrome highlights
      cyanLight.position.x = Math.sin(elapsed) * 3;
      cyanLight.position.z = Math.cos(elapsed) * 3;
      cyanLight.position.y = Math.sin(elapsed * 0.5) * 1.5;

      purpleLight.position.x = Math.sin(elapsed + Math.PI) * 3;
      purpleLight.position.z = Math.cos(elapsed + Math.PI) * 3;
      purpleLight.position.y = Math.cos(elapsed * 0.5) * 1.5;

      renderer.render(scene, camera);
      animId = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(animId);
      renderer.dispose();
      bodyGeo.dispose();
      handleGeo.dispose();
      connGeo.dispose();
      chromeMat.dispose();
    };
  }, []);

  // 2. Setup Scroll-driven position and size interpolation
  useEffect(() => {
    const updatePosition = () => {
      if (!containerRef.current || !heroPlaceholderRef.current || !programsPlaceholderRef.current) return;

      const rectHero = heroPlaceholderRef.current.getBoundingClientRect();
      const rectPrograms = programsPlaceholderRef.current.getBoundingClientRect();

      const programsTopAbs = rectPrograms.top + window.scrollY;

      const currentScroll = window.scrollY;
      const startScroll = 0;
      const endScroll = programsTopAbs - window.innerHeight / 2.5;

      // Calculate interpolation ratio t between 0 and 1
      let t = 0;
      if (endScroll > 0) {
        t = Math.max(0, Math.min(1, (currentScroll - startScroll) / endScroll));
      }

      // Smooth ease-in-out easing
      const easeT = t * t * (3 - 2 * t);

      // Linear interpolate dimensions and screen positions
      const left = rectHero.left + (rectPrograms.left - rectHero.left) * easeT;
      const top = rectHero.top + (rectPrograms.top - rectHero.top) * easeT;
      const width = rectHero.width + (rectPrograms.width - rectHero.width) * easeT;
      const height = rectHero.height + (rectPrograms.height - rectHero.height) * easeT;

      // Update container styles directly (avoids react state/render overhead)
      containerRef.current.style.width = `${width}px`;
      containerRef.current.style.height = `${height}px`;
      containerRef.current.style.transform = `translate3d(${left}px, ${top}px, 0)`;

      // Handle fading out as it scrolls past the programs section
      let opacity = 1;
      const fadeStart = programsTopAbs + rectPrograms.height;
      if (currentScroll > fadeStart) {
        const fadeEnd = fadeStart + window.innerHeight * 0.5;
        opacity = 1 - Math.max(0, Math.min(1, (currentScroll - fadeStart) / (fadeEnd - fadeStart)));
      }
      containerRef.current.style.opacity = `${opacity}`;

      // Slide boxes from the sides based on scroll progress
      if (leftCardRef.current) {
        const leftX = -150 * (1 - easeT);
        leftCardRef.current.style.transform = `translate3d(${leftX}px, 0, 0)`;
        leftCardRef.current.style.opacity = `${easeT}`;
      }
      if (rightCardRef.current) {
        const rightX = 150 * (1 - easeT);
        rightCardRef.current.style.transform = `translate3d(${rightX}px, 0, 0)`;
        rightCardRef.current.style.opacity = `${easeT}`;
      }
    };

    window.addEventListener("scroll", updatePosition, { passive: true });
    window.addEventListener("resize", updatePosition);

    // Initial positioning
    updatePosition();

    // Small delay to make sure everything has rendered and layout settled
    const timeout = setTimeout(updatePosition, 100);

    return () => {
      window.removeEventListener("scroll", updatePosition);
      window.removeEventListener("resize", updatePosition);
      clearTimeout(timeout);
    };
  }, []);

  const nextPlan = () => {
    setActivePlanIndex((prev) => (prev + 1) % pricingPlans.length);
  };

  const prevPlan = () => {
    setActivePlanIndex((prev) => (prev - 1 + pricingPlans.length) % pricingPlans.length);
  };

  return (
    <div className="lp-root" data-theme={theme}>
      {/* ── Glowing perspective grid background ── */}
      <div className="lp-grid-wrapper">
        <div className="lp-grid-lines" />
      </div>

      {/* ── Ambient particle system ── */}
      <div className="lp-particles-container">
        {particles.map((p) => (
          <div
            key={p.id}
            className="lp-ambient-particle"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
            }}
          />
        ))}
      </div>

      {/* ── 3D Kettlebell fixed overlay wrapper ── */}
      <div ref={containerRef} className="kettlebell-canvas-container">
        <canvas ref={canvasRef} />
      </div>

      {/* ── Sticky Nav Bar ── */}
      <nav className="lp-nav">
        <Link to="/" className="lp-nav-brand">
          <div className="lp-nav-icon">
            <img src="/vite.svg" alt="logo" style={{ width: "24px", height: "24px" }} />
          </div>
          <span className="lp-nav-name">Fit<span>Forge</span></span>
        </Link>

        <div className="lp-nav-pill-container">
          <a href="#home" className="lp-nav-pill-link active">Home</a>
          <a href="#programs" className="lp-nav-pill-link">Programs</a>
          <a href="#pricing" className="lp-nav-pill-link">Pricing</a>
        </div>

        <div className="lp-nav-cta">
          <button onClick={toggleTheme} className="lp-btn-theme-toggle" title="Toggle theme">
            <FontAwesomeIcon icon={theme === 'dark' ? faSun : faMoon} />
          </button>
          <button className="lp-btn-search" title="Search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
          <Link to="/signup" className="lp-btn-glow">Sign Up Now</Link>
        </div>
      </nav>

      {/* ── Hero Section (First Fold) ── */}
      <section id="home" className="lp-hero">
        <div className="lp-hero-left">
          <span className="lp-kicker lp-animate">EVOLVE YOUR FITNESS</span>
          <h1 className="lp-hero-title lp-animate lp-animate-delay-1">
            EVOLVE<br />YOUR<br />FITNESS
          </h1>
          <p className="lp-hero-desc lp-animate lp-animate-delay-2">
            FitForge is a premium training system engineered for athletes. Formulate custom workout regimens, track macros, adjust for injuries, and forge your ultimate physique.
          </p>
          <div className="lp-hero-buttons lp-animate lp-animate-delay-3">
            <Link to="/signup" className="lp-btn-cyan-glow">Sign Up Now</Link>
            <Link to="/signup" className="lp-btn-outline-pill">Sign Up</Link>
          </div>
        </div>
        <div className="lp-hero-right lp-animate lp-animate-delay-1">
          {/* Box placeholder where the 3D kettlebell canvas renders */}
          <div ref={heroPlaceholderRef} className="kettlebell-placeholder-hero" />
        </div>
      </section>

      {/* ── Programs Section ── */}
      <section id="programs" className="lp-programs-section">
        <div className="lp-programs-header">
          <span className="lp-kicker lp-animate">OUR PROGRAMS</span>
          <h2 className="lp-section-title lp-animate lp-animate-delay-1">CHOOSE YOUR DISCIPLINE</h2>
        </div>

        {/* 3-card grid */}
        <div className="lp-programs-grid">
          {/* Left Card */}
          <div ref={leftCardRef} className="lp-program-card border-glow-cyan">
            <div className="lp-card-bg-image" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop)' }}></div>
            <div className="lp-card-overlay"></div>
            <div className="lp-card-content">
              <span className="lp-card-category font-cyan">ATHLETICISM</span>
              <h3 className="lp-card-title">Battle Ropes & HIIT</h3>
              <p className="lp-card-desc">High-intensity metabolic conditioning designed to shred body fat while preserving lean muscle mass.</p>
              <Link to="/signup" className="lp-card-btn font-cyan">Explore Program →</Link>
            </div>
          </div>

          {/* Middle Focus Card (Hosts 3D kettlebell on scroll) */}
          <div className="lp-program-card centerpiece-card lp-animate lp-animate-delay-1">
            <div ref={programsPlaceholderRef} className="kettlebell-placeholder-programs" />
            <div className="lp-card-content centerpiece-content">
              <span className="lp-card-category font-purple">CORE ACCENT</span>
              <h3 className="lp-card-title">Forge Strength</h3>
              <p className="lp-card-desc">Interactive 3D Kettlebell centerpiece. Toggled by scrolling, adapting in real time to your training depth.</p>
            </div>
          </div>

          {/* Right Card */}
          <div ref={rightCardRef} className="lp-program-card border-glow-purple">
            <div className="lp-card-bg-image" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&auto=format&fit=crop)' }}></div>
            <div className="lp-card-overlay"></div>
            <div className="lp-card-content">
              <span className="lp-card-category font-purple">STRENGTH</span>
              <h3 className="lp-card-title">Heavy Barbell Deadlift</h3>
              <p className="lp-card-desc">Structured powerlifting regimens targeting posterior chain development and explosive force production.</p>
              <Link to="/signup" className="lp-card-btn font-purple">Explore Program →</Link>
            </div>
          </div>
        </div>

        {/* Feature featurette cards */}
        <div className="lp-featurette-grid">
          {/* Weightlifting */}
          <div className="lp-glass-card hover-lift lp-animate">
            <div className="lp-glass-icon">
              <FontAwesomeIcon icon={faDumbbell} />
            </div>
            <h4>Weightlifting</h4>
            <p>Master the barbell with guided progression plans and personal record tracking.</p>
            <Link to="/signup" className="lp-link-more font-cyan">Learn More →</Link>
          </div>

          {/* Cardio */}
          <div className="lp-glass-card hover-lift highlighted-border lp-animate lp-animate-delay-1">
            <div className="lp-glass-icon">
              <FontAwesomeIcon icon={faBolt} />
            </div>
            <h4>Cardio</h4>
            <p>Build an unbreakable engine with target-driven HIIT and running programs.</p>
            <Link to="/signup" className="lp-btn-mini-glow">Sign Up Now</Link>
          </div>

          {/* Yoga */}
          <div className="lp-glass-card hover-lift lp-animate lp-animate-delay-2">
            <div className="lp-glass-icon">
              <FontAwesomeIcon icon={faHeartPulse} />
            </div>
            <h4>Yoga</h4>
            <p>Optimize mobility, accelerate recovery, and build resilient joints.</p>
            <Link to="/signup" className="lp-btn-mini-glow">Sign Up Now</Link>
          </div>
        </div>
      </section>

      {/* ── Pricing Plans Carousel ── */}
      <section id="pricing" className="lp-pricing-section">
        <div className="lp-programs-header">
          <span className="lp-kicker lp-animate">PRICING PLANS</span>
          <h2 className="lp-section-title lp-animate lp-animate-delay-1">CHOOSE YOUR INTENSITY</h2>
        </div>

        <div className="lp-pricing-carousel-container lp-animate">
          {/* Left Arrow */}
          <button onClick={prevPlan} className="lp-carousel-btn" aria-label="Previous Plan">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </button>

          {/* Pricing Slider */}
          <div className="lp-pricing-carousel">
            {/* Desktop: renders all three, highlighted by active plan. Mobile: displays active plan only */}
            {pricingPlans.map((plan, index) => {
              const isActive = index === activePlanIndex;

              // CSS custom positioning / display settings
              const cardClass = `lp-pricing-card ${plan.featured ? "featured-card" : ""} lp-accent-${plan.accent} ${isActive ? "active-plan" : "inactive-plan"}`;

              // In mobile layout, show only active index. In desktop, show all three
              const displayStyle = window.innerWidth <= 1024 && !isActive ? { display: 'none' } : {};

              return (
                <div key={plan.name} className={cardClass} style={displayStyle}>
                  {plan.featured && <span className="lp-plan-badge">Featured</span>}
                  <h3>{plan.name}</h3>
                  <p className="lp-plan-desc">{plan.desc}</p>

                  <div className="lp-price-wrapper">
                    <span className="lp-price">{plan.price}</span>
                    <span className="lp-price-suffix">{plan.suffix}</span>
                  </div>

                  <ul className="lp-plan-features-list">
                    {plan.features.map((feat) => (
                      <li key={feat}>{feat}</li>
                    ))}
                  </ul>

                  <Link to="/signup" className="lp-btn-pricing-cta">
                    Start {plan.name}
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Right Arrow */}
          <button onClick={nextPlan} className="lp-carousel-btn" aria-label="Next Plan">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
        </div>
      </section>

      {/* ── Evolve CTA fold ── */}
      <section className="lp-evolve-cta">
        <h2 className="lp-evolve-title lp-animate">READY TO EVOLVE?</h2>
        <p className="lp-evolve-desc lp-animate lp-animate-delay-1">
          Join the rank of athletes training at their absolute limits. Formulate your FitForge profile today and construct the blueprint of your future self.
        </p>
        <Link to="/signup" className="lp-btn-cyan-glow lp-animate lp-animate-delay-2">
          Create Free Account →
        </Link>
      </section>

      {/* ── Footer ── */}
      <footer className="lp-footer">
        <div className="lp-footer-left">
          © 2026 FitForge. Engineered for peak human performance.
        </div>
        <div className="lp-footer-right">
          <a href="#home">Privacy Policy</a>
          <a href="#home">Terms of Service</a>
          <a href="#home">Support</a>
        </div>
      </footer>
    </div>
  );
}
