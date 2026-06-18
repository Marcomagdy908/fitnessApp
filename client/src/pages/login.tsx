import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFire,
  faDumbbell,
  faBolt,
  faEnvelope,
  faLock,
  faEye,
  faEyeSlash,
  faExclamationTriangle
} from "@fortawesome/free-solid-svg-icons";
import "../css/auth.css";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      const res = await api.post("/api/auth/login", { email, password });
      login(res.data.user);
      navigate("/");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="auth-root">
      {/* ── Left Panel ─────────────────────────────────── */}
      <div className="auth-left">
        <div className="auth-left-bg" />
        <div className="auth-left-grid" />
        <div className="auth-left-content">
          <div className="auth-brand">
            <div className="auth-brand-icon">
              <img src="/vite.svg" alt="logo" style={{ width: "24px", height: "24px" }} />
            </div>
            <span className="auth-brand-name">
              Fit<span>Forge</span>
            </span>
          </div>

          <h1 className="auth-left-headline">
            Train Smarter,
            <em>Live Stronger.</em>
          </h1>
          <p className="auth-left-sub">
            Track workouts, meals, and progress — all in one place built for
            serious athletes.
          </p>

          <div className="auth-stats">
            <div className="auth-stat-pill">
              <span className="auth-stat-pill-icon">
                <FontAwesomeIcon icon={faFire} />
              </span>
              <span>50k+ Members</span>
            </div>
            <div className="auth-stat-pill">
              <span className="auth-stat-pill-icon">
                <FontAwesomeIcon icon={faDumbbell} />
              </span>
              <span>300+ Exercises</span>
            </div>
            <div className="auth-stat-pill">
              <span className="auth-stat-pill-icon">
                <FontAwesomeIcon icon={faBolt} />
              </span>
              <span>AI-Powered Plans</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Panel (Form) ──────────────────────────── */}
      <div className="auth-right">
        <div className="auth-form-wrap">
          <h2 className="auth-form-title">Welcome back</h2>
          <p className="auth-form-subtitle">Log in to continue your journey.</p>

          {error && (
            <div className="auth-msg auth-msg--error">
              <span><FontAwesomeIcon icon={faExclamationTriangle} /></span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className="auth-field">
              <label className="auth-label" htmlFor="login-email">
                Email
              </label>
              <div className="auth-input-wrap">
                <input
                  id="login-email"
                  className="auth-input"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
                <span className="auth-input-icon">
                  <FontAwesomeIcon icon={faEnvelope} />
                </span>
              </div>
            </div>

            {/* Password */}
            <div className="auth-field">
              <label className="auth-label" htmlFor="login-password">
                Password
              </label>
              <div className="auth-input-wrap">
                <input
                  id="login-password"
                  className="auth-input"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <span className="auth-input-icon">
                  <FontAwesomeIcon icon={faLock} />
                </span>
                <button
                  type="button"
                  className="auth-pw-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </button>
              </div>
            </div>

            {/* Forgot password */}
            <div className="auth-row" style={{ marginBottom: "1.5rem" }}>
              <div />
              <Link to="/forgot-password" className="auth-link">
                Forgot password?
              </Link>
            </div>

            <button id="login-submit-btn" type="submit" className="auth-btn-primary">
              Log In
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account?
            <Link to="/signup">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
