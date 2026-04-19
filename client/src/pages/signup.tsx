import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../css/auth.css";

type Strength = { label: string; color: string; width: string };

function getStrength(pw: string): Strength {
  if (!pw) return { label: "", color: "#222", width: "0%" };
  if (pw.length < 6) return { label: "Weak", color: "#ff4444", width: "25%" };
  if (pw.length < 10 || !/[^a-zA-Z0-9]/.test(pw))
    return { label: "Fair", color: "#ffc832", width: "55%" };
  if (pw.length >= 10 && /[^a-zA-Z0-9]/.test(pw) && /[0-9]/.test(pw))
    return { label: "Strong", color: "#3dffff", width: "100%" };
  return { label: "Good", color: "#50e678", width: "80%" };
}

export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState("https://cdn-icons-png.flaticon.com/512/149/149071.png");
  const [confirm, setConfirm] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const strength = getStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name || !email || !password || !confirm) {
      setError("Please fill in all fields.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (!agreed) {
      setError("Please accept the Terms of Service.");
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password, avatar }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      setSuccess(true);
      navigate("/"); // Automatically redirect to logged-in dashboard
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
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
            <div className="auth-brand-icon">⚡</div>
            <span className="auth-brand-name">
              Fit<span>Forge</span>
            </span>
          </div>

          <h1 className="auth-left-headline">
            Your Journey
            <em>Starts Today.</em>
          </h1>
          <p className="auth-left-sub">
            Join thousands of athletes tracking workouts, meals, and progress
            towards their best selves.
          </p>

          <div className="auth-stats">
            <div className="auth-stat-pill">
              <span className="auth-stat-pill-icon">🔥</span>
              <span>50k+ Members</span>
            </div>
            <div className="auth-stat-pill">
              <span className="auth-stat-pill-icon">🍎</span>
              <span>Meal Tracking</span>
            </div>
            <div className="auth-stat-pill">
              <span className="auth-stat-pill-icon">📈</span>
              <span>Progress Insights</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Panel (Form) ──────────────────────────── */}
      <div className="auth-right">
        <div className="auth-form-wrap">
          <h2 className="auth-form-title">Create account</h2>
          <p className="auth-form-subtitle">
            Free forever. No credit card required.
          </p>

          {error && (
            <div className="auth-msg auth-msg--error">
              <span>⚠</span> {error}
            </div>
          )}
          {success && (
            <div className="auth-msg auth-msg--success">
              <span>✓</span> Account created! You can now log in.
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Full Name */}
            <div className="auth-field">
              <label className="auth-label" htmlFor="signup-name">
                Full Name
              </label>
              <div className="auth-input-wrap">
                <input
                  id="signup-name"
                  className="auth-input"
                  type="text"
                  placeholder="Alex Johnson"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                />
                <span className="auth-input-icon">👤</span>
              </div>
            </div>

            {/* Email */}
            <div className="auth-field">
              <label className="auth-label" htmlFor="signup-email">
                Email
              </label>
              <div className="auth-input-wrap">
                <input
                  id="signup-email"
                  className="auth-input"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
                <span className="auth-input-icon">✉</span>
              </div>
            </div>

            {/* Password */}
            <div className="auth-field">
              <label className="auth-label" htmlFor="signup-password">
                Password
              </label>
              <div className="auth-input-wrap">
                <input
                  id="signup-password"
                  className="auth-input"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <span className="auth-input-icon">🔒</span>
                <button
                  type="button"
                  className="auth-pw-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "🙈" : "👁"}
                </button>
              </div>
              {/* Strength bar */}
              {password && (
                <>
                  <div className="auth-strength">
                    <div
                      className="auth-strength-bar"
                      style={{
                        width: strength.width,
                        background: strength.color,
                      }}
                    />
                  </div>
                  <div
                    className="auth-strength-label"
                    style={{ color: strength.color }}
                  >
                    {strength.label}
                  </div>
                </>
              )}
            </div>

            {/* Confirm Password */}
            <div className="auth-field">
              <label className="auth-label" htmlFor="signup-confirm">
                Confirm Password
              </label>
              <div className="auth-input-wrap">
                <input
                  id="signup-confirm"
                  className="auth-input"
                  type={showConfirm ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="new-password"
                  style={
                    confirm && confirm !== password
                      ? { borderColor: "rgba(255,80,80,0.5)" }
                      : confirm && confirm === password
                      ? { borderColor: "rgba(61,255,255,0.4)" }
                      : {}
                  }
                />
                <span className="auth-input-icon">🔒</span>
                <button
                  type="button"
                  className="auth-pw-toggle"
                  onClick={() => setShowConfirm((v) => !v)}
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            {/* Terms */}
            <div className="auth-checkbox-row">
              <input
                id="signup-terms"
                type="checkbox"
                className="auth-checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
              />
              <label htmlFor="signup-terms">
                I agree to the{" "}
                <a href="#" className="auth-link">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="auth-link">
                  Privacy Policy
                </a>
              </label>
            </div>

            <button id="signup-submit-btn" type="submit" className="auth-btn-primary">
              Create Account
            </button>
          </form>

          <p className="auth-switch">
            Already have an account?
            <Link to="/login">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
