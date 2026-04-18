import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDumbbell,
  faPlus,
  faTrash,
  faCheck,
  faFire,
  faXmark,
  faTriangleExclamation,
  faCircleInfo,
  faRotate,
  faWeightHanging,
  faClock,
  faChevronDown,
  faChevronUp,
  faTrophy,
} from "@fortawesome/free-solid-svg-icons";
import "../css/exercise.css";

/* ─── Types ─────────────────────────────────────────────────── */
interface ExSet {
  id: number;
  weight: string;
  reps: string;
  done: boolean;
}

interface ExEntry {
  id: number;
  name: string;
  category: string;
  sets: ExSet[];
  notes: string;
  expanded: boolean;
}

/* ─── Injury restrictions map ────────────────────────────────── */
const injuryRestrictions: Record<string, { avoid: string[]; tip: string }> = {
  "Lower Back": {
    avoid: ["Deadlift", "Good Morning", "Romanian Deadlift", "Barbell Row", "Barbell Squat"],
    tip: "Brace your core on every compound lift. Avoid hyperextension and heavy spinal loading.",
  },
  "Knee": {
    avoid: ["Leg Press", "Deep Squat", "Lunges", "Jump Squat", "Box Jump"],
    tip: "Keep your knee tracking over your toes. Avoid full-depth knee flexion under load.",
  },
  "Shoulder": {
    avoid: ["Behind-Neck Press", "Upright Row", "Overhead Press", "Dips", "Wide-Grip Bench"],
    tip: "Limit shoulder abduction above 90°. Keep elbows slightly in front of your body.",
  },
  "Wrist": {
    avoid: ["Barbell Curl", "Push-up", "Front Squat", "Clean & Press", "Wrist Curl"],
    tip: "Use neutral-grip attachments where possible. Straps can reduce wrist torque on pulling exercises.",
  },
  "Ankle": {
    avoid: ["Running", "Box Jump", "Jump Rope", "Calf Raise", "Bulgarian Split Squat"],
    tip: "Focus on seated/upper-body work while the ankle heals. Low-impact cycling is safe.",
  },
  "Hip": {
    avoid: ["Hip Thrust", "Sumo Deadlift", "Deep Squat", "Leg Raise", "Hurdle Step"],
    tip: "Reduce ROM on hip-dominant movements. Avoid anterior hip impingement.",
  },
};

/* ─── Quick-add exercise presets ─────────────────────────────── */
const exercisePresets: Record<string, string[]> = {
  Chest:    ["Bench Press", "Incline DB Press", "Cable Fly", "Push-up", "Dips"],
  Back:     ["Pull-up", "Lat Pulldown", "Barbell Row", "Seated Row", "Deadlift"],
  Legs:     ["Barbell Squat", "Leg Press", "Romanian Deadlift", "Leg Curl", "Leg Extension"],
  Shoulders:["Overhead Press", "Lateral Raise", "Front Raise", "Rear Delt Fly", "Upright Row"],
  Arms:     ["Barbell Curl", "Hammer Curl", "Tricep Pushdown", "Skull Crusher", "Dips"],
  Core:     ["Plank", "Cable Crunch", "Dead Bug", "Hanging Leg Raise", "Ab Wheel"],
};

const categoryColors: Record<string, string> = {
  Chest: "#ff6b6b", Back: "#3dffff", Legs: "#a98dff",
  Shoulders: "#ffc832", Arms: "#ff9f43", Core: "#50e678",
};

/* ─── Seeded workout ─────────────────────────────────────────── */
const makeSet = (id: number, weight: string, reps: string, done = false): ExSet => ({ id, weight, reps, done });

const seedExercises: ExEntry[] = [
  {
    id: 1, name: "Bench Press", category: "Chest", notes: "", expanded: true,
    sets: [makeSet(1, "80", "8", true), makeSet(2, "80", "8", false), makeSet(3, "80", "6", false)],
  },
  {
    id: 2, name: "Pull-up", category: "Back", notes: "", expanded: false,
    sets: [makeSet(1, "BW", "8", false), makeSet(2, "BW", "8", false), makeSet(3, "BW", "6", false)],
  },
];

/* ─── Profile injuries (placeholder — future: from shared state/context) ── */
const PROFILE_INJURIES = ["Lower Back", "Knee"];

/* ─── Component ──────────────────────────────────────────────── */
function ExerciseTracker() {
  const [exercises, setExercises] = useState<ExEntry[]>(seedExercises);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customCat, setCustomCat] = useState("Chest");
  const [dismissedInjuries, setDismissedInjuries] = useState<string[]>([]);

  const activeInjuries = PROFILE_INJURIES.filter((i) => !dismissedInjuries.includes(i));

  /* ── Exercise mutations ── */
  const addExercise = (name: string, category: string) => {
    const newEx: ExEntry = {
      id: Date.now(), name, category, notes: "", expanded: true,
      sets: [makeSet(Date.now(), "", "8", false)],
    };
    setExercises((prev) => [...prev, newEx]);
    setShowQuickAdd(false);
    setShowForm(false);
    setCustomName("");
  };

  const removeExercise = (id: number) =>
    setExercises((prev) => prev.filter((e) => e.id !== id));

  const toggleExpand = (id: number) =>
    setExercises((prev) => prev.map((e) => e.id === id ? { ...e, expanded: !e.expanded } : e));

  const updateNote = (id: number, notes: string) =>
    setExercises((prev) => prev.map((e) => e.id === id ? { ...e, notes } : e));

  const addSet = (exId: number) =>
    setExercises((prev) => prev.map((e) => {
      if (e.id !== exId) return e;
      const last = e.sets[e.sets.length - 1];
      return { ...e, sets: [...e.sets, makeSet(Date.now(), last?.weight ?? "", last?.reps ?? "8")] };
    }));

  const removeSet = (exId: number, setId: number) =>
    setExercises((prev) => prev.map((e) =>
      e.id !== exId ? e : { ...e, sets: e.sets.filter((s) => s.id !== setId) }
    ));

  const updateSet = (exId: number, setId: number, field: "weight" | "reps", value: string) =>
    setExercises((prev) => prev.map((e) =>
      e.id !== exId ? e : { ...e, sets: e.sets.map((s) => s.id === setId ? { ...s, [field]: value } : s) }
    ));

  const toggleSetDone = (exId: number, setId: number) =>
    setExercises((prev) => prev.map((e) =>
      e.id !== exId ? e : { ...e, sets: e.sets.map((s) => s.id === setId ? { ...s, done: !s.done } : s) }
    ));

  /* ── Derived stats ── */
  const totalSets = exercises.reduce((a, e) => a + e.sets.length, 0);
  const doneSets  = exercises.reduce((a, e) => a + e.sets.filter((s) => s.done).length, 0);
  const totalVol  = exercises.reduce((a, e) =>
    a + e.sets.filter((s) => s.done && !isNaN(Number(s.weight))).reduce((b, s) => b + Number(s.weight) * Number(s.reps || 0), 0), 0
  );

  /* ── Injury relevant to current exercises ── */
  const exerciseNames = exercises.map((e) => e.name);
  const flaggedInjuries = activeInjuries.filter((inj) =>
    injuryRestrictions[inj]?.avoid.some((a) => exerciseNames.some((n) => n.toLowerCase().includes(a.toLowerCase())))
  );

  return (
    <div className="ex-page">

      {/* ── Header ── */}
      <div className="ex-header">
        <div>
          <h1 className="ex-title">
            <FontAwesomeIcon icon={faDumbbell} />
            Exercise Tracker
          </h1>
          <p className="ex-subtitle">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>
        <button className="ex-add-btn" onClick={() => setShowQuickAdd(true)}>
          <FontAwesomeIcon icon={faPlus} />
          Add Exercise
        </button>
      </div>

      {/* ── Injury Reminder Banner ── */}
      {activeInjuries.length > 0 && (
        <div className="ex-injury-section">
          <div className="ex-injury-heading">
            <FontAwesomeIcon icon={faTriangleExclamation} style={{ color: "#ffaa00" }} />
            Injury Reminders
            <span className="ex-injury-from-profile">
              <FontAwesomeIcon icon={faCircleInfo} style={{ marginRight: 3 }} />
              Set in Settings → Profile
            </span>
          </div>
          <div className="ex-injury-cards">
            {activeInjuries.map((inj) => {
              const data = injuryRestrictions[inj];
              const hasFlagged = data?.avoid.some((a) =>
                exerciseNames.some((n) => n.toLowerCase().includes(a.toLowerCase()))
              );
              return (
                <div key={inj} className={`ex-injury-card${hasFlagged ? " ex-injury-card--alert" : ""}`}>
                  <div className="ex-injury-card-top">
                    <div className="ex-injury-card-name">
                      {hasFlagged && <span className="ex-injury-dot" />}
                      {inj} Injury
                    </div>
                    <button className="ex-injury-dismiss" onClick={() => setDismissedInjuries((p) => [...p, inj])}>
                      <FontAwesomeIcon icon={faXmark} />
                    </button>
                  </div>
                  {hasFlagged && (
                    <div className="ex-injury-alert-msg">
                      <FontAwesomeIcon icon={faTriangleExclamation} style={{ color: "#ff6b6b", marginRight: 5 }} />
                      Your current workout contains exercises that may aggravate this injury.
                    </div>
                  )}
                  {data && (
                    <>
                      <div className="ex-injury-avoid-label">Avoid:</div>
                      <div className="ex-injury-avoid-list">
                        {data.avoid.map((ex) => {
                          const active = exerciseNames.some((n) => n.toLowerCase().includes(ex.toLowerCase()));
                          return (
                            <span key={ex} className={`ex-avoid-chip${active ? " active" : ""}`}>{ex}</span>
                          );
                        })}
                      </div>
                      <div className="ex-injury-tip">
                        <FontAwesomeIcon icon={faCircleInfo} style={{ color: "#3dffff", marginRight: 5, flexShrink: 0 }} />
                        {data.tip}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Session Stats ── */}
      <div className="ex-stats-row">
        <div className="ex-stat">
          <FontAwesomeIcon icon={faDumbbell} className="ex-stat-icon" style={{ color: "#3dffff" }} />
          <div className="ex-stat-val">{exercises.length}</div>
          <div className="ex-stat-label">Exercises</div>
        </div>
        <div className="ex-stat">
          <FontAwesomeIcon icon={faRotate} className="ex-stat-icon" style={{ color: "#a98dff" }} />
          <div className="ex-stat-val">{doneSets}/{totalSets}</div>
          <div className="ex-stat-label">Sets Done</div>
        </div>
        <div className="ex-stat">
          <FontAwesomeIcon icon={faWeightHanging} className="ex-stat-icon" style={{ color: "#ffc832" }} />
          <div className="ex-stat-val">{totalVol.toLocaleString()} kg</div>
          <div className="ex-stat-label">Total Volume</div>
        </div>
        <div className="ex-stat">
          <FontAwesomeIcon icon={faClock} className="ex-stat-icon" style={{ color: "#50e678" }} />
          <div className="ex-stat-val">~{Math.max(15, exercises.length * 12)} min</div>
          <div className="ex-stat-label">Est. Duration</div>
        </div>
      </div>

      {/* Progress bar */}
      {totalSets > 0 && (
        <div className="ex-progress-wrap">
          <div className="ex-progress-label">
            Session Progress <span style={{ color: "#3dffff" }}>{Math.round((doneSets / totalSets) * 100)}%</span>
          </div>
          <div className="ex-progress-track">
            <div className="ex-progress-fill" style={{ width: `${(doneSets / totalSets) * 100}%` }} />
          </div>
        </div>
      )}

      {/* ── Exercise Cards ── */}
      <div className="ex-list">
        {exercises.length === 0 && (
          <div className="ex-empty">
            <div className="ex-empty-icon">💪</div>
            <div>No exercises yet. Click <strong>Add Exercise</strong> to start logging.</div>
          </div>
        )}

        {exercises.map((ex) => {
          const catColor = categoryColors[ex.category] ?? "#888";
          const allDone = ex.sets.length > 0 && ex.sets.every((s) => s.done);
          const isFlagged = flaggedInjuries.length > 0 &&
            injuryRestrictions[flaggedInjuries[0]]?.avoid.some((a) =>
              ex.name.toLowerCase().includes(a.toLowerCase())
            );

          return (
            <div
              key={ex.id}
              className={`ex-card${allDone ? " ex-card--done" : ""}${isFlagged ? " ex-card--flagged" : ""}`}
              style={isFlagged ? { borderColor: "rgba(255,107,107,0.4)" } : {}}
            >
              {/* Card Header */}
              <div className="ex-card-header" onClick={() => toggleExpand(ex.id)}>
                <div className="ex-card-left">
                  <div className="ex-card-dot" style={{ background: catColor }} />
                  <div>
                    <div className="ex-card-name">
                      {ex.name}
                      {allDone && <FontAwesomeIcon icon={faTrophy} style={{ color: "#ffc832", marginLeft: 8, fontSize: "0.8rem" }} />}
                      {isFlagged && (
                        <span className="ex-flagged-badge">
                          <FontAwesomeIcon icon={faTriangleExclamation} style={{ marginRight: 3 }} />
                          Injury Risk
                        </span>
                      )}
                    </div>
                    <div className="ex-card-meta">
                      <span style={{ color: catColor }}>{ex.category}</span>
                      <span>·</span>
                      <span>{ex.sets.filter((s) => s.done).length}/{ex.sets.length} sets</span>
                    </div>
                  </div>
                </div>
                <div className="ex-card-right">
                  <button className="ex-remove-btn" onClick={(e) => { e.stopPropagation(); removeExercise(ex.id); }}>
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                  <FontAwesomeIcon icon={ex.expanded ? faChevronUp : faChevronDown} style={{ color: "#333", fontSize: "0.7rem" }} />
                </div>
              </div>

              {/* Expanded content */}
              {ex.expanded && (
                <div className="ex-card-body">
                  {/* Set headers */}
                  <div className="ex-set-header-row">
                    <span className="ex-set-col-label set-num">SET</span>
                    <span className="ex-set-col-label set-weight">WEIGHT</span>
                    <span className="ex-set-col-label set-reps">REPS</span>
                    <span className="ex-set-col-label set-done">✓</span>
                    <span className="ex-set-col-label set-del" />
                  </div>

                  {ex.sets.map((set, idx) => (
                    <div key={set.id} className={`ex-set-row${set.done ? " ex-set-row--done" : ""}`}>
                      <span className="ex-set-num">{idx + 1}</span>
                      <input
                        className="ex-set-input"
                        placeholder="kg / BW"
                        value={set.weight}
                        onChange={(e) => updateSet(ex.id, set.id, "weight", e.target.value)}
                      />
                      <input
                        className="ex-set-input"
                        placeholder="reps"
                        type="number"
                        min={1}
                        value={set.reps}
                        onChange={(e) => updateSet(ex.id, set.id, "reps", e.target.value)}
                      />
                      <button
                        className={`ex-set-check${set.done ? " checked" : ""}`}
                        onClick={() => toggleSetDone(ex.id, set.id)}
                      >
                        {set.done && <FontAwesomeIcon icon={faCheck} />}
                      </button>
                      <button className="ex-set-del" onClick={() => removeSet(ex.id, set.id)}>
                        <FontAwesomeIcon icon={faXmark} />
                      </button>
                    </div>
                  ))}

                  <button className="ex-add-set-btn" onClick={() => addSet(ex.id)}>
                    <FontAwesomeIcon icon={faPlus} style={{ marginRight: 5 }} />
                    Add Set
                  </button>

                  <input
                    className="ex-notes-input"
                    placeholder="Add notes (e.g. felt strong, grip was off)…"
                    value={ex.notes}
                    onChange={(e) => updateNote(ex.id, e.target.value)}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Finish Button ── */}
      {exercises.length > 0 && (
        <button className="ex-finish-btn" onClick={() => alert("Workout saved! 🎉 (hook up to API)")}>
          <FontAwesomeIcon icon={faFire} style={{ marginRight: 8 }} />
          Finish Workout
        </button>
      )}

      {/* ── Quick Add Drawer ── */}
      {showQuickAdd && (
        <div className="ex-modal-backdrop" onClick={() => { setShowQuickAdd(false); setShowForm(false); }}>
          <div className="ex-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ex-modal-header">
              <div className="ex-modal-title">
                <FontAwesomeIcon icon={faPlus} style={{ color: "#3dffff", marginRight: 8 }} />
                Add Exercise
              </div>
              <button className="ex-modal-close" onClick={() => { setShowQuickAdd(false); setShowForm(false); }}>
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            <div className="ex-modal-body">
              {!showForm ? (
                <>
                  {Object.entries(exercisePresets).map(([cat, exList]) => (
                    <div key={cat} className="ex-preset-group">
                      <div className="ex-preset-cat" style={{ color: categoryColors[cat] }}>
                        <div className="ex-preset-cat-dot" style={{ background: categoryColors[cat] }} />
                        {cat}
                      </div>
                      <div className="ex-preset-list">
                        {exList.map((name) => {
                          const isInWorkout = exercises.some((e) => e.name === name);
                          const isRisky = activeInjuries.some((inj) =>
                            injuryRestrictions[inj]?.avoid.some((a) => name.toLowerCase().includes(a.toLowerCase()))
                          );
                          return (
                            <button
                              key={name}
                              className={`ex-preset-btn${isInWorkout ? " in-workout" : ""}${isRisky ? " risky" : ""}`}
                              onClick={() => addExercise(name, cat)}
                              title={isRisky ? "⚠️ This exercise may aggravate one of your injuries" : undefined}
                            >
                              {name}
                              {isRisky && <FontAwesomeIcon icon={faTriangleExclamation} style={{ color: "#ffaa00", marginLeft: 5, fontSize: "0.6rem" }} />}
                              {isInWorkout && <FontAwesomeIcon icon={faCheck} style={{ color: "#50e678", marginLeft: 5, fontSize: "0.6rem" }} />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  <button className="ex-custom-btn" onClick={() => setShowForm(true)}>
                    <FontAwesomeIcon icon={faPlus} style={{ marginRight: 6 }} />
                    Add Custom Exercise
                  </button>
                </>
              ) : (
                <div className="ex-custom-form">
                  <label className="ex-form-label">Exercise Name</label>
                  <input
                    className="ex-form-input"
                    placeholder="e.g. Cable Lateral Raise"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && customName && addExercise(customName, customCat)}
                    autoFocus
                  />
                  <label className="ex-form-label" style={{ marginTop: "0.75rem" }}>Category</label>
                  <div className="ex-cat-grid">
                    {Object.keys(exercisePresets).map((cat) => (
                      <button
                        key={cat}
                        className={`ex-cat-btn${customCat === cat ? " active" : ""}`}
                        style={customCat === cat ? { borderColor: categoryColors[cat], color: categoryColors[cat], background: `${categoryColors[cat]}14` } : {}}
                        onClick={() => setCustomCat(cat)}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                  <div className="ex-form-actions">
                    <button className="ex-form-cancel" onClick={() => setShowForm(false)}>Back</button>
                    <button className="ex-form-submit" disabled={!customName} onClick={() => customName && addExercise(customName, customCat)}>
                      <FontAwesomeIcon icon={faCheck} style={{ marginRight: 6 }} /> Add
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExerciseTracker;
