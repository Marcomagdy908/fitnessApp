import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faBell,
  faPalette,
  faBullseye,
  faShield,
  faCamera,
  faChevronRight,
  faMoon,
  faSun,
  faDumbbell,
  faWeightScale,
  faRuler,
  faLanguage,
  faTrash,
  faDownload,
  faLock,
  faEnvelope,
  faTriangleExclamation,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import "../css/settings.css";

/* ─── Mock user state (swap with API calls later) ────────────── */
const MOCK_PROFILE = {
  name: "Marco Vitale",
  email: "marco@example.com",
  username: "@marcov",
  avatar: "https://i.pravatar.cc/150?img=11",
  joinDate: "February 2026",
};

const MOCK_GOALS = {
  weeklyWorkouts: 4,
  dailyCalories: 2400,
  weightGoal: 82, // kg
  currentWeight: 86, // kg
  height: 181, // cm
};

/* ─── Section nav items ──────────────────────────────────────── */
const NAV_ITEMS = [
  { id: "profile", label: "Profile", icon: faUser },
  { id: "preferences", label: "Preferences", icon: faPalette },
  { id: "notifications", label: "Notifications", icon: faBell },
  { id: "goals", label: "Goals", icon: faBullseye },
  { id: "privacy", label: "Privacy & Security", icon: faShield },
];

/* ─── Toggle component ───────────────────────────────────────── */
function Toggle({
  on,
  onChange,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={on}
      className={`settings-toggle ${on ? "on" : ""}`}
      onClick={() => onChange(!on)}
    />
  );
}

/* ─── Section wrapper ────────────────────────────────────────── */
function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: any;
  children: React.ReactNode;
}) {
  return (
    <div className="settings-section">
      <h2 className="settings-section-title">
        <FontAwesomeIcon icon={icon} className="settings-section-icon" />
        {title}
      </h2>
      {children}
    </div>
  );
}

/* ─── Input row ──────────────────────────────────────────────── */
function InputRow({
  label,
  value,
  type = "text",
  icon,
  onChange,
  unit,
  min,
  max,
}: {
  label: string;
  value: string | number;
  type?: string;
  icon?: any;
  onChange?: (v: string) => void;
  unit?: string;
  min?: number;
  max?: number;
}) {
  return (
    <div className="settings-input-row">
      <label className="settings-input-label">{label}</label>
      <div className="settings-input-wrap">
        {icon && (
          <FontAwesomeIcon icon={icon} className="settings-input-icon" />
        )}
        <input
          className="settings-input"
          type={type}
          value={value}
          min={min}
          max={max}
          onChange={(e) => onChange?.(e.target.value)}
          style={{ paddingLeft: icon ? "2.4rem" : "1rem" }}
        />
        {unit && <span className="settings-input-unit">{unit}</span>}
      </div>
    </div>
  );
}

/* ─── Toggle row ─────────────────────────────────────────────── */
function ToggleRow({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="settings-toggle-row">
      <div className="settings-toggle-text">
        <span className="settings-toggle-label">{label}</span>
        <span className="settings-toggle-desc">{description}</span>
      </div>
      <Toggle on={value} onChange={onChange} />
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────── */
function Settings() {
  const [activeSection, setActiveSection] = useState("profile");

  /* Profile state */
  const [name, setName] = useState(MOCK_PROFILE.name);
  const [email, setEmail] = useState(MOCK_PROFILE.email);
  const [username, setUsername] = useState(MOCK_PROFILE.username);

  /* Preferences state */
  const [darkMode, setDarkMode] = useState(true);
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [language, setLanguage] = useState("English");
  const [soundEffects, setSoundEffects] = useState(true);

  /* Notifications state */
  const [notifToggles, setNotifToggles] = useState<Record<string, boolean>>({
    workoutReminders: true,
    progressUpdates: true,
    planChanges: false,
    weeklyReport: true,
    achievements: true,
  });

  /* Goals state */
  const [weeklyWorkouts, setWeeklyWorkouts] = useState(
    MOCK_GOALS.weeklyWorkouts,
  );
  const [dailyCalories, setDailyCalories] = useState(MOCK_GOALS.dailyCalories);
  const [weightGoal, setWeightGoal] = useState(MOCK_GOALS.weightGoal);
  const [currentWeight, setCurrentWeight] = useState(MOCK_GOALS.currentWeight);
  const [height, setHeight] = useState(MOCK_GOALS.height);

  /* Privacy state */
  const [privacyToggles, setPrivacyToggles] = useState<Record<string, boolean>>(
    {
      publicProfile: false,
      shareProgress: true,
      dataCollection: true,
    },
  );

  /* Injuries state */
  const INJURY_OPTIONS = ["Lower Back", "Knee", "Shoulder", "Wrist", "Ankle", "Hip", "Neck", "Elbow"];
  const [injuries, setInjuries] = useState<string[]>(["Lower Back", "Knee"]);
  const [injuryInput, setInjuryInput] = useState("");
  const addInjury = (inj: string) => {
    if (inj && !injuries.includes(inj)) setInjuries((prev) => [...prev, inj]);
    setInjuryInput("");
  };
  const removeInjury = (inj: string) => setInjuries((prev) => prev.filter((i) => i !== inj));

  /* Saved feedback */
  const [saved, setSaved] = useState(false);
  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleNotif = (key: string) =>
    setNotifToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  const togglePrivacy = (key: string) =>
    setPrivacyToggles((prev) => ({ ...prev, [key]: !prev[key] }));

  /* BMI calc */
  const bmi = (currentWeight / Math.pow(height / 100, 2)).toFixed(1);

  return (
    <div className="settings-page">
      {/* ── Header ── */}
      <div className="settings-header">
        <h1 className="settings-title">Settings</h1>
        <p className="settings-subtitle">Manage your account and preferences</p>
      </div>

      <div className="settings-layout">
        {/* ── Sidebar nav ── */}
        <nav className="settings-nav">
          {/* Avatar card */}
          <div className="settings-avatar-card">
            <div className="settings-avatar-ring">
              <img src={MOCK_PROFILE.avatar} alt="avatar" />
            </div>
            <div className="settings-avatar-info">
              <span className="settings-avatar-name">{MOCK_PROFILE.name}</span>
              <span className="settings-avatar-email">
                {MOCK_PROFILE.email}
              </span>
              <span className="settings-avatar-since">
                Member since {MOCK_PROFILE.joinDate}
              </span>
            </div>
          </div>

          {/* Nav links */}
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`settings-nav-item ${activeSection === item.id ? "active" : ""}`}
              onClick={() => setActiveSection(item.id)}
            >
              <FontAwesomeIcon icon={item.icon} className="settings-nav-icon" />
              <span>{item.label}</span>
              <FontAwesomeIcon
                icon={faChevronRight}
                className="settings-nav-chevron"
              />
            </button>
          ))}
        </nav>

        {/* ── Content panel ── */}
        <div className="settings-content">
          {/* ════ PROFILE ════ */}
          {activeSection === "profile" && (
            <Section title="Profile" icon={faUser}>
              {/* Avatar upload */}
              <div className="settings-avatar-upload">
                <div className="settings-avatar-upload-ring">
                  <img src={MOCK_PROFILE.avatar} alt="avatar" />
                  <div className="settings-avatar-upload-overlay">
                    <FontAwesomeIcon icon={faCamera} />
                  </div>
                </div>
                <div>
                  <p className="settings-upload-hint">
                    Click the avatar to upload a new photo
                  </p>
                  <p className="settings-upload-hint dim">
                    JPG, PNG · max 5 MB
                  </p>
                </div>
              </div>

              {/* Fields */}
              <div className="settings-card">
                <div className="settings-card-title">Personal Info</div>
                <div className="settings-fields">
                  <InputRow
                    label="Full Name"
                    value={name}
                    onChange={setName}
                    icon={faUser}
                  />
                  <InputRow
                    label="Email"
                    value={email}
                    onChange={setEmail}
                    icon={faEnvelope}
                    type="email"
                  />
                  <InputRow
                    label="Username"
                    value={username}
                    onChange={setUsername}
                  />
                </div>
              </div>

              {/* Danger zone */}
              <div className="settings-card danger-card">
                <div className="settings-card-title danger-title">
                  Danger Zone
                </div>
                <p className="settings-danger-desc">
                  These actions are irreversible. Please proceed with caution.
                </p>
                <div className="settings-danger-btns">
                  <button className="settings-btn-ghost">
                    <FontAwesomeIcon icon={faDownload} />
                    Export My Data
                  </button>
                  <button className="settings-btn-danger">
                    <FontAwesomeIcon icon={faTrash} />
                    Delete Account
                  </button>
                </div>
              </div>

              {/* Injuries card */}
              <div className="settings-card" style={{ borderColor: injuries.length > 0 ? "rgba(255,170,0,0.25)" : undefined }}>
                <div className="settings-card-title" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <FontAwesomeIcon icon={faTriangleExclamation} style={{ color: "#ffaa00" }} />
                  Injuries &amp; Health Conditions
                </div>
                <p style={{ fontSize: "0.72rem", color: "#555", marginBottom: "1rem", lineHeight: 1.5 }}>
                  Add any current injuries or conditions. The Meals Tracker will suggest anti-inflammatory alternative meals tailored to each injury.
                </p>

                {/* Active injuries */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "0.85rem" }}>
                  {injuries.length === 0 && (
                    <span style={{ fontSize: "0.72rem", color: "#333" }}>No injuries set.</span>
                  )}
                  {injuries.map((inj) => (
                    <span
                      key={inj}
                      style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", background: "rgba(255,170,0,0.1)", border: "1px solid rgba(255,170,0,0.3)", color: "#ffaa00", borderRadius: "999px", fontSize: "0.65rem", fontWeight: 700, padding: "0.2rem 0.65rem" }}
                    >
                      {inj}
                      <button
                        onClick={() => removeInjury(inj)}
                        style={{ background: "none", border: "none", color: "#ff6b6b", cursor: "pointer", fontSize: "0.6rem", padding: 0, lineHeight: 1 }}
                      >✕</button>
                    </span>
                  ))}
                </div>

                {/* Quick-add chips */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", marginBottom: "0.75rem" }}>
                  {INJURY_OPTIONS.filter((o) => !injuries.includes(o)).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => addInjury(opt)}
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#555", borderRadius: "999px", fontSize: "0.62rem", fontWeight: 700, padding: "0.2rem 0.65rem", cursor: "pointer", transition: "all 0.18s" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,170,0,0.3)"; (e.currentTarget as HTMLElement).style.color = "#ffaa00"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)"; (e.currentTarget as HTMLElement).style.color = "#555"; }}
                    >
                      <FontAwesomeIcon icon={faPlus} style={{ marginRight: 4, fontSize: "0.5rem" }} />
                      {opt}
                    </button>
                  ))}
                </div>

                {/* Free-text input */}
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <input
                    className="settings-input"
                    placeholder="Add custom injury…"
                    value={injuryInput}
                    onChange={(e) => setInjuryInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addInjury(injuryInput)}
                    style={{ flex: 1, paddingLeft: "1rem" }}
                  />
                  <button className="settings-btn-primary" onClick={() => addInjury(injuryInput)} style={{ padding: "0 1rem" }}>
                    Add
                  </button>
                </div>
              </div>
            </Section>
          )}

          {/* ════ PREFERENCES ════ */}
          {activeSection === "preferences" && (
            <Section title="Preferences" icon={faPalette}>
              <div className="settings-card">
                <div className="settings-card-title">Appearance</div>
                {/* Dark / Light toggle */}
                <div className="settings-theme-row">
                  <button
                    className={`settings-theme-btn ${darkMode ? "active" : ""}`}
                    onClick={() => setDarkMode(true)}
                  >
                    <FontAwesomeIcon icon={faMoon} />
                    Dark
                  </button>
                  <button
                    className={`settings-theme-btn ${!darkMode ? "active" : ""}`}
                    onClick={() => setDarkMode(false)}
                  >
                    <FontAwesomeIcon icon={faSun} />
                    Light
                  </button>
                </div>
              </div>

              <div className="settings-card">
                <div className="settings-card-title">Units</div>
                <div className="settings-theme-row">
                  <button
                    className={`settings-theme-btn ${unit === "metric" ? "active" : ""}`}
                    onClick={() => setUnit("metric")}
                  >
                    <FontAwesomeIcon icon={faRuler} />
                    Metric (kg, cm)
                  </button>
                  <button
                    className={`settings-theme-btn ${unit === "imperial" ? "active" : ""}`}
                    onClick={() => setUnit("imperial")}
                  >
                    <FontAwesomeIcon icon={faRuler} />
                    Imperial (lb, in)
                  </button>
                </div>
              </div>

              <div className="settings-card">
                <div className="settings-card-title">Sound & Language</div>
                <div className="settings-fields">
                  <ToggleRow
                    label="Sound Effects"
                    description="Play sounds during timers and achievements"
                    value={soundEffects}
                    onChange={setSoundEffects}
                  />
                  <div className="settings-input-row">
                    <label className="settings-input-label">Language</label>
                    <div className="settings-input-wrap">
                      <FontAwesomeIcon
                        icon={faLanguage}
                        className="settings-input-icon"
                      />
                      <select
                        className="settings-input settings-select"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        style={{ paddingLeft: "2.4rem" }}
                      >
                        {[
                          "English",
                          "Spanish",
                          "French",
                          "German",
                          "Italian",
                          "Portuguese",
                        ].map((l) => (
                          <option key={l}>{l}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </Section>
          )}

          {/* ════ NOTIFICATIONS ════ */}
          {activeSection === "notifications" && (
            <Section title="Notifications" icon={faBell}>
              <div className="settings-card">
                <div className="settings-card-title">Push Notifications</div>
                <div className="settings-fields">
                  <ToggleRow
                    label="Workout Reminders"
                    description="Daily reminders at your scheduled workout time"
                    value={notifToggles.workoutReminders}
                    onChange={() => toggleNotif("workoutReminders")}
                  />
                  <ToggleRow
                    label="Progress Updates"
                    description="Notifications when you hit a new personal record"
                    value={notifToggles.progressUpdates}
                    onChange={() => toggleNotif("progressUpdates")}
                  />
                  <ToggleRow
                    label="Plan Changes"
                    description="Alerts when your training plan is modified"
                    value={notifToggles.planChanges}
                    onChange={() => toggleNotif("planChanges")}
                  />
                  <ToggleRow
                    label="Weekly Report"
                    description="A summary of your week every Sunday"
                    value={notifToggles.weeklyReport}
                    onChange={() => toggleNotif("weeklyReport")}
                  />
                  <ToggleRow
                    label="Achievements"
                    description="Celebrate badge unlocks and milestones"
                    value={notifToggles.achievements}
                    onChange={() => toggleNotif("achievements")}
                  />
                </div>
              </div>

              <div className="settings-card">
                <div className="settings-card-title">Reminder Time</div>
                <InputRow label="Daily Reminder" value="07:30" type="time" />
              </div>
            </Section>
          )}

          {/* ════ GOALS ════ */}
          {activeSection === "goals" && (
            <Section title="Goals" icon={faBullseye}>
              {/* BMI card */}
              <div className="settings-bmi-card">
                <div className="settings-bmi-left">
                  <span className="settings-bmi-label">Current BMI</span>
                  <span className="settings-bmi-value">{bmi}</span>
                  <span className="settings-bmi-cat">
                    {Number(bmi) < 18.5
                      ? "Underweight"
                      : Number(bmi) < 25
                        ? "Normal weight"
                        : Number(bmi) < 30
                          ? "Overweight"
                          : "Obese"}
                  </span>
                </div>
                <div className="settings-bmi-bar-wrap">
                  {[
                    {
                      label: "Under",
                      range: "< 18.5",
                      color: "#3daaff",
                      end: 18.5,
                    },
                    {
                      label: "Normal",
                      range: "18.5–25",
                      color: "#3dffaa",
                      end: 25,
                    },
                    {
                      label: "Over",
                      range: "25–30",
                      color: "#ffb900",
                      end: 30,
                    },
                    {
                      label: "Obese",
                      range: "> 30",
                      color: "#ff5050",
                      end: 40,
                    },
                  ].map((seg) => (
                    <div key={seg.label} className="settings-bmi-seg">
                      <div
                        className="settings-bmi-seg-bar"
                        style={{ background: seg.color }}
                      />
                      <span
                        className="settings-bmi-seg-label"
                        style={{ color: seg.color }}
                      >
                        {seg.label}
                      </span>
                    </div>
                  ))}
                  <div
                    className="settings-bmi-needle"
                    style={{
                      left: `${Math.min(Math.max(((Number(bmi) - 15) / 25) * 100, 0), 100)}%`,
                    }}
                  />
                </div>
              </div>

              <div className="settings-card">
                <div className="settings-card-title">Body Metrics</div>
                <div className="settings-fields">
                  <InputRow
                    label="Current Weight"
                    value={currentWeight}
                    type="number"
                    icon={faWeightScale}
                    unit={unit === "metric" ? "kg" : "lb"}
                    onChange={(v) => setCurrentWeight(Number(v))}
                    min={30}
                    max={300}
                  />
                  <InputRow
                    label="Target Weight"
                    value={weightGoal}
                    type="number"
                    icon={faBullseye}
                    unit={unit === "metric" ? "kg" : "lb"}
                    onChange={(v) => setWeightGoal(Number(v))}
                    min={30}
                    max={300}
                  />
                  <InputRow
                    label="Height"
                    value={height}
                    type="number"
                    icon={faRuler}
                    unit={unit === "metric" ? "cm" : "in"}
                    onChange={(v) => setHeight(Number(v))}
                    min={100}
                    max={250}
                  />
                </div>
              </div>

              <div className="settings-card">
                <div className="settings-card-title">Training Goals</div>
                <div className="settings-fields">
                  <div className="settings-input-row">
                    <label className="settings-input-label">
                      Weekly Workouts
                    </label>
                    <div className="settings-stepper">
                      <button
                        className="settings-stepper-btn"
                        onClick={() =>
                          setWeeklyWorkouts((v) => Math.max(1, v - 1))
                        }
                      >
                        –
                      </button>
                      <span className="settings-stepper-val">
                        {weeklyWorkouts}×
                      </span>
                      <button
                        className="settings-stepper-btn"
                        onClick={() =>
                          setWeeklyWorkouts((v) => Math.min(7, v + 1))
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <InputRow
                    label="Daily Calorie Target"
                    value={dailyCalories}
                    type="number"
                    icon={faDumbbell}
                    unit="kcal"
                    onChange={(v) => setDailyCalories(Number(v))}
                    min={1000}
                    max={6000}
                  />
                </div>
              </div>
            </Section>
          )}

          {/* ════ PRIVACY ════ */}
          {activeSection === "privacy" && (
            <Section title="Privacy & Security" icon={faShield}>
              <div className="settings-card">
                <div className="settings-card-title">Account Visibility</div>
                <div className="settings-fields">
                  <ToggleRow
                    label="Public Profile"
                    description="Let other users find and view your profile"
                    value={privacyToggles.publicProfile}
                    onChange={() => togglePrivacy("publicProfile")}
                  />
                  <ToggleRow
                    label="Share Progress"
                    description="Allow friends to see your workout history"
                    value={privacyToggles.shareProgress}
                    onChange={() => togglePrivacy("shareProgress")}
                  />
                  <ToggleRow
                    label="Analytics Collection"
                    description="Help improve the app by sharing anonymous usage data"
                    value={privacyToggles.dataCollection}
                    onChange={() => togglePrivacy("dataCollection")}
                  />
                </div>
              </div>

              <div className="settings-card">
                <div className="settings-card-title">Password</div>
                <div className="settings-fields">
                  <InputRow
                    label="Current Password"
                    value=""
                    type="password"
                    icon={faLock}
                  />
                  <InputRow
                    label="New Password"
                    value=""
                    type="password"
                    icon={faLock}
                  />
                  <InputRow
                    label="Confirm Password"
                    value=""
                    type="password"
                    icon={faLock}
                  />
                </div>
                <button
                  className="settings-btn-primary"
                  style={{ marginTop: "1rem" }}
                >
                  Update Password
                </button>
              </div>

              <div className="settings-card">
                <div className="settings-card-title">Active Sessions</div>
                {[
                  {
                    device: "Chrome · Windows 11",
                    location: "Bucharest, RO",
                    current: true,
                  },
                  {
                    device: "Mobile Safari · iPhone 15",
                    location: "Bucharest, RO",
                    current: false,
                  },
                ].map((s, i) => (
                  <div key={i} className="settings-session-row">
                    <div className="settings-session-info">
                      <span className="settings-session-device">
                        {s.device}
                      </span>
                      <span className="settings-session-location">
                        {s.location}
                      </span>
                    </div>
                    {s.current ? (
                      <span className="settings-session-badge">Current</span>
                    ) : (
                      <button className="settings-btn-ghost settings-btn-sm">
                        Revoke
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* ── Save bar ── */}
          <div className="settings-save-bar">
            <button className="settings-btn-ghost">Discard Changes</button>
            <button
              className={`settings-btn-primary ${saved ? "saved" : ""}`}
              onClick={handleSave}
            >
              {saved ? "✓ Saved!" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
