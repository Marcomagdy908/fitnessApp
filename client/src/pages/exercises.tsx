import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col, Card } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClock,
  faRotate,
  faDumbbell,
  faBullseye,
  faLayerGroup,
  faMagnifyingGlass,
  faFilter,
  faPlus,
  faTrash,
  faCheck,
  faFire,
  faXmark,
  faTriangleExclamation,
  faCircleInfo,
  faWeightHanging,
  faChevronDown,
  faChevronUp,
  faTrophy,
} from "@fortawesome/free-solid-svg-icons";
import "../css/exercises.css";
import { api } from "../utils/api";
import { nameToId } from "../utils/exerciseUtils";

/* ─── Types ──────────────────────────────────────────────────── */
interface Exercise {
  id: number;
  name: string;
  defaultSets: number;
  defaultReps: number | null;
  defaultTimeSecs: number | null;
  imageUrl: string | null;
  category: string;
  muscleGroups: string;
  equipment: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  instructions: string;
}

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

/* ─── Category config ────────────────────────────────────────── */
const CATEGORIES = ["all","chest","back","legs","shoulders","arms","core","cardio"];
const DIFFICULTIES = ["all", "beginner", "intermediate", "advanced"];

const categoryVariant: Record<string, string> = {
  chest: "badge-chest", back: "badge-back", legs: "badge-legs",
  shoulders: "badge-shoulders", arms: "badge-arms", core: "badge-core", cardio: "badge-cardio",
};
const difficultyVariant: Record<string, string> = {
  beginner: "badge-beginner", intermediate: "badge-intermediate", advanced: "badge-advanced",
};

const categoryColors: Record<string, string> = {
  Chest: "#ff6b6b", Back: "#3dffff", Legs: "#a98dff",
  Shoulders: "#ffc832", Arms: "#ff9f43", Core: "#50e678",
  chest: "#ff6b6b", back: "#3dffff", legs: "#a98dff",
  shoulders: "#ffc832", arms: "#ff9f43", core: "#50e678",
};

/* ─── Injury restrictions map ────────────────────────────────── */
/* ─── Injury restrictions (loaded from API) ────────────────── */
// replaces injuryRestrictions constant

/* ─── Quick-add exercise presets ─────────────────────────────── */
/* ─── Quick-add exercise presets (derived from exercises) ───── */
// replaces exercisePresets constant

/* ─── Helpers ────────────────────────────────────────────────── */
const makeSet = (id: number, weight: string, reps: string, done = false): ExSet => ({ id, weight, reps, done });

/* ─── Profile injuries (loaded from API) ── */


/* ─── Component ──────────────────────────────────────────────── */
function Exercises() {
  const navigate = useNavigate();
  const [primaryTab, setPrimaryTab] = useState<"library" | "tracker">("library");

  /* Library State */
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeDifficulty, setActiveDifficulty] = useState("all");
  const [search, setSearch] = useState("");

  /* Tracker State */
  const [trackedExercises, setTrackedExercises] = useState<ExEntry[]>([]);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customCat] = useState("Chest");
  const [showSummary, setShowSummary] = useState(false);
  const [sessionStartTime] = useState(new Date());
  const [dismissedInjuries, setDismissedInjuries] = useState<string[]>([]);
  const [profileInjuries, setProfileInjuries] = useState<string[]>([]);
  const [injuryRestrictions, setInjuryRestrictions] = useState<Record<string, { avoid: string[]; tip: string }>>({});

  useEffect(() => {
    api.get("/api/injuries")
      .then(res => {
        if (res.data.success) {
          setProfileInjuries(res.data.data.filter((i: any) => i.status === "active").map((i: any) => i.type));
        }
      });
    
    api.get("/api/injury-restrictions")
      .then(res => {
        if (res.data.success) {
          const map: any = {};
          res.data.data.forEach((r: any) => {
            map[r.injuryType] = { avoid: r.avoidExercises, tip: r.tip };
          });
          setInjuryRestrictions(map);
        }
      });
  }, []);

  useEffect(() => {
    const params = new URLSearchParams({ limit: "100" });
    api.get(`/api/exercises?${params}`)
      .then(res => {
        if (res.data.success) setExercises(res.data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return exercises.filter((ex) => {
      const matchCat = activeCategory === "all" || ex.category === activeCategory;
      const matchDiff = activeDifficulty === "all" || ex.difficulty === activeDifficulty;
      const matchSearch =
        ex.name.toLowerCase().includes(search.toLowerCase()) ||
        ex.muscleGroups.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchDiff && matchSearch;
    });
  }, [exercises, activeCategory, activeDifficulty, search]);

  /* ── Tracker mutations ── */
  const addTrackedExercise = (name: string, category: string) => {
    const newEx: ExEntry = {
      // eslint-disable-next-line react-hooks/purity
      id: Date.now(), name, category, notes: "", expanded: true,
      // eslint-disable-next-line react-hooks/purity
      sets: [makeSet(Date.now(), "", "8", false)],
    };
    setTrackedExercises((prev) => [...prev, newEx]);
    setShowQuickAdd(false);
    setShowForm(false);
    setCustomName("");
  };

  const removeTrackedExercise = (id: number) =>
    setTrackedExercises((prev) => prev.filter((e) => e.id !== id));

  const toggleExpand = (id: number) =>
    setTrackedExercises((prev) => prev.map((e) => e.id === id ? { ...e, expanded: !e.expanded } : e));

  const addSet = (exId: number) =>
    setTrackedExercises((prev) => prev.map((e) => {
      if (e.id !== exId) return e;
      const last = e.sets[e.sets.length - 1];
      return { ...e, sets: [...e.sets, makeSet(Date.now(), last?.weight ?? "", last?.reps ?? "8")] };
    }));

  const removeSet = (exId: number, setId: number) =>
    setTrackedExercises((prev) => prev.map((e) =>
      e.id !== exId ? e : { ...e, sets: e.sets.filter((s) => s.id !== setId) }
    ));

  const updateSet = (exId: number, setId: number, field: "weight" | "reps", value: string) =>
    setTrackedExercises((prev) => prev.map((e) =>
      e.id !== exId ? e : { ...e, sets: e.sets.map((s) => s.id === setId ? { ...s, [field]: value } : s) }
    ));

  const toggleSetDone = (exId: number, setId: number) =>
    setTrackedExercises((prev) => prev.map((e) =>
      e.id !== exId ? e : { ...e, sets: e.sets.map((s) => s.id === setId ? { ...s, done: !s.done } : s) }
    ));

  /* Tracker Stats */
  const activeInjuries = profileInjuries.filter((i) => !dismissedInjuries.includes(i));
  
  // Derived presets from library
  const exercisePresets: Record<string, string[]> = {};
  exercises.forEach(ex => {
    const cat = ex.category.charAt(0).toUpperCase() + ex.category.slice(1);
    if (!exercisePresets[cat]) exercisePresets[cat] = [];
    if (exercisePresets[cat].length < 5) exercisePresets[cat].push(ex.name);
  });
  const totalSets = trackedExercises.reduce((a, e) => a + e.sets.length, 0);
  const doneSets  = trackedExercises.reduce((a, e) => a + e.sets.filter((s) => s.done).length, 0);
  const totalVol  = trackedExercises.reduce((a, e) =>
    a + e.sets.filter((s) => s.done && !isNaN(Number(s.weight))).reduce((b, s) => b + Number(s.weight) * Number(s.reps || 0), 0), 0
  );
  
  const finishWorkout = async () => {
    if (doneSets === 0) {
      alert("Please complete at least one set before finishing!");
      return;
    }

    try {
      const workoutData = {
        name: `Workout - ${new Date().toLocaleDateString()}`,
        durationSecs: Math.floor((new Date().getTime() - sessionStartTime.getTime()) / 1000),
        caloriesBurned: Math.round(totalVol * 0.05), // Rough estimate
        sets: trackedExercises.flatMap(ex => {
          const exercise = exercises.find(e => e.name === ex.name);
          return ex.sets.map(s => ({
            exerciseId: exercise?.id || 0,
            setNumber: ex.sets.indexOf(s) + 1,
            reps: parseInt(s.reps) || 0,
            weight: parseFloat(s.weight) || 0,
            isCompleted: s.done
          }));
        }).filter(s => s.exerciseId > 0)
      };

      const res = await api.post("/api/workouts", workoutData);
      if (res.data.success) {
        setShowSummary(true);
      }
    } catch (err) {
      console.error("Failed to save workout:", err);
      alert("Failed to save workout. Please try again.");
    }
  };

  const exerciseNames = trackedExercises.map((e) => e.name);

  return (
    <div className="exercises-page">
      {/* ── Header ── */}
      <h1 className="exercises-title">
        <FontAwesomeIcon icon={faDumbbell} className="me-2" style={{ color: "var(--accent-cyan)" }} />
        Exercises & Tracker
      </h1>

      {/* ── Primary Navigation Tabs ── */}
      <div className="exercises-primary-tabs">
        <button 
          className={`primary-tab-btn ${primaryTab === "library" ? "active" : ""}`}
          onClick={() => setPrimaryTab("library")}
        >
          Exercise Library
        </button>
        <button 
          className={`primary-tab-btn ${primaryTab === "tracker" ? "active" : ""}`}
          onClick={() => setPrimaryTab("tracker")}
        >
          Workout Tracker
        </button>
      </div>

      {primaryTab === "library" ? (
        <div className="library-view">
          <div className="d-flex align-items-center mb-4 gap-3 flex-wrap">
            <div className="exercises-search-wrap mb-0">
              <FontAwesomeIcon icon={faMagnifyingGlass} className="search-icon" />
              <input
                className="exercises-search"
                placeholder="Search by name or muscle…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <span className="exercises-count">
              {loading ? "…" : `${filtered.length} exercises`}
            </span>
          </div>

          {/* ── Filters ── */}
          <div className="exercises-filters">
            <div className="filter-group">
              <FontAwesomeIcon icon={faFilter} className="filter-label-icon" />
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  className={`filter-btn${activeCategory === cat ? " active" : ""}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat === "all" ? "All" : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
            <div className="filter-group">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d}
                  className={`filter-btn filter-btn-diff filter-btn-${d}${activeDifficulty === d ? " active" : ""}`}
                  onClick={() => setActiveDifficulty(d)}
                >
                  {d === "all" ? "Any Level" : d.charAt(0).toUpperCase() + d.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* ── Grid ── */}
          {loading ? (
            <div className="exercises-empty">Loading exercises…</div>
          ) : filtered.length === 0 ? (
            <div className="exercises-empty">No exercises match your filters.</div>
          ) : (
            <Row xs={1} sm={2} lg={3} xl={4} className="g-4">
              {filtered.map((exercise) => (
                <Col key={exercise.id}>
                  <Card
                    className="exercise-card h-100"
                    onClick={() => navigate(`/exercises/${nameToId(exercise.name)}`)}
                    style={{ cursor: "pointer" }}
                  >
                    <Card.Img
                      variant="top"
                      src={exercise.imageUrl ?? "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&fit=crop&q=80"}
                      alt={exercise.name}
                      className="exercise-card-img"
                    />
                    <Card.Body className="d-flex flex-column">
                      <Card.Title className="exercise-card-title">
                        {exercise.name}
                      </Card.Title>

                      {/* Badges */}
                      <div className="mb-2 d-flex gap-2 flex-wrap">
                        <span
                          className={`exercise-badge ${categoryVariant[exercise.category] ?? "badge-default"}`}
                        >
                          {exercise.category}
                        </span>
                        <span
                          className={`exercise-badge ${difficultyVariant[exercise.difficulty] ?? "badge-default"}`}
                        >
                          {exercise.difficulty}
                        </span>
                      </div>

                      {/* Target muscles */}
                      <Card.Text className="exercise-target">
                        <FontAwesomeIcon icon={faBullseye} className="me-1" style={{ color: "var(--danger)" }} />
                        {exercise.muscleGroups}
                      </Card.Text>

                      {/* Instructions */}
                      <Card.Text className="exercise-instructions flex-grow-1">
                        {exercise.instructions}
                      </Card.Text>

                      {/* Meta row */}
                      <div 
                        className="exercise-meta mt-auto pt-3 d-flex gap-2 flex-wrap"
                        style={{ borderTop: "1px solid var(--border-color)" }}
                      >
                        <span className="meta-pill">
                          <FontAwesomeIcon icon={faLayerGroup} className="me-1" />
                          {exercise.defaultSets} sets
                        </span>
                        <span className="meta-pill">
                          {exercise.defaultReps !== null ? (
                            <>
                              <FontAwesomeIcon icon={faRotate} className="me-1" />
                              {exercise.defaultReps} reps
                            </>
                          ) : (
                            <>
                              <FontAwesomeIcon icon={faClock} className="me-1" />
                              {exercise.defaultTimeSecs}s
                            </>
                          )}
                        </span>
                        <span className="meta-pill">
                          <FontAwesomeIcon icon={faDumbbell} className="me-1" style={{ color: "var(--accent-cyan)" }} />
                          {exercise.equipment}
                        </span>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </div>
      ) : (
        <div className="tracker-view">
          {/* ── Tracker Header ── */}
          <div className="ex-header">
            <div>
              <h2 className="ex-title">
                <FontAwesomeIcon icon={faDumbbell} />
                Live Workout
              </h2>
              <p className="ex-subtitle">
                {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </p>
            </div>
            <button className="ex-add-btn" onClick={() => setShowQuickAdd(true)}>
              <FontAwesomeIcon icon={faPlus} />
              Add Exercise
            </button>
          </div>

          {/* ── Injury Reminder ── */}
          {activeInjuries.length > 0 && (
            <div className="ex-injury-section">
              <div className="ex-injury-heading">
                <FontAwesomeIcon icon={faTriangleExclamation} style={{ color: "#ffaa00" }} />
                Injury Reminders
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
                        <div className="ex-injury-card-name">{inj} Injury</div>
                        <button className="ex-injury-dismiss" onClick={() => setDismissedInjuries((p) => [...p, inj])}>
                          <FontAwesomeIcon icon={faXmark} />
                        </button>
                      </div>
                      {hasFlagged && (
                        <div className="ex-injury-alert-msg">
                          Aggravating exercises detected in workout.
                        </div>
                      )}
                      {data && (
                        <div className="ex-injury-tip">
                          <FontAwesomeIcon icon={faCircleInfo} style={{ color: "#3dffff", marginRight: 5 }} />
                          {data.tip}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Stats ── */}
          <div className="ex-stats-row">
            <div className="ex-stat">
              <FontAwesomeIcon icon={faDumbbell} className="ex-stat-icon" style={{ color: "#3dffff" }} />
              <div className="ex-stat-val">{trackedExercises.length}</div>
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
              <div className="ex-stat-label">Volume</div>
            </div>
          </div>

          {/* Progress */}
          {totalSets > 0 && (
            <div className="ex-progress-wrap">
              <div className="ex-progress-label">Progress {Math.round((doneSets / totalSets) * 100)}%</div>
              <div className="ex-progress-track">
                <div className="ex-progress-fill" style={{ width: `${(doneSets / totalSets) * 100}%` }} />
              </div>
            </div>
          )}

          {/* ── Exercise List ── */}
          <div className="ex-list">
            {trackedExercises.length === 0 && (
              <div className="ex-empty">
                <div className="ex-empty-icon">💪</div>
                <div>No exercises in this session.</div>
              </div>
            )}

            {trackedExercises.map((ex) => {
              const catColor = categoryColors[ex.category] ?? "#888";
              const allDone = ex.sets.length > 0 && ex.sets.every((s) => s.done);
              return (
                <div key={ex.id} className={`ex-card${allDone ? " ex-card--done" : ""}`}>
                  <div className="ex-card-header" onClick={() => toggleExpand(ex.id)}>
                    <div className="ex-card-left">
                      <div className="ex-card-dot" style={{ background: catColor }} />
                      <div>
                        <div className="ex-card-name">{ex.name}</div>
                        <div className="ex-card-meta">
                          <span style={{ color: catColor }}>{ex.category}</span>
                          <span>·</span>
                          <span>{ex.sets.filter((s) => s.done).length}/{ex.sets.length} sets</span>
                        </div>
                      </div>
                    </div>
                    <div className="ex-card-right">
                      <button className="ex-remove-btn" onClick={(e) => { e.stopPropagation(); removeTrackedExercise(ex.id); }}>
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                      <FontAwesomeIcon icon={ex.expanded ? faChevronUp : faChevronDown} style={{ fontSize: "0.7rem" }} />
                    </div>
                  </div>

                  {ex.expanded && (
                    <div className="ex-card-body">
                      <div className="ex-set-header-row">
                        <span className="ex-set-col-label">SET</span>
                        <span className="ex-set-col-label">KG</span>
                        <span className="ex-set-col-label">REPS</span>
                        <span className="ex-set-col-label">✓</span>
                        <span className="ex-set-col-label" />
                      </div>
                      {ex.sets.map((set, idx) => (
                        <div key={set.id} className={`ex-set-row${set.done ? " ex-set-row--done" : ""}`}>
                          <span className="ex-set-num">{idx + 1}</span>
                          <input className="ex-set-input" value={set.weight} onChange={(e) => updateSet(ex.id, set.id, "weight", e.target.value)} />
                          <input className="ex-set-input" type="number" value={set.reps} onChange={(e) => updateSet(ex.id, set.id, "reps", e.target.value)} />
                          <button className={`ex-set-check${set.done ? " checked" : ""}`} onClick={() => toggleSetDone(ex.id, set.id)}>
                            {set.done && <FontAwesomeIcon icon={faCheck} />}
                          </button>
                          <button className="ex-set-del" onClick={() => removeSet(ex.id, set.id)}><FontAwesomeIcon icon={faXmark} /></button>
                        </div>
                      ))}
                      <button className="ex-add-set-btn" onClick={() => addSet(ex.id)}>+ Add Set</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {trackedExercises.length > 0 && (
            <button className="ex-finish-btn" onClick={finishWorkout}>
              <FontAwesomeIcon icon={faFire} style={{ marginRight: 8 }} />
              Finish Workout
            </button>
          )}
        </div>
      )}

      {/* ── Summary Modal ── */}
      {showSummary && (
        <div className="ex-modal-backdrop" onClick={() => setShowSummary(false)}>
          <div className="ex-modal summary-modal" onClick={(e) => e.stopPropagation()}>
            <FontAwesomeIcon icon={faTrophy} className="summary-trophy" />
            <h2>Workout Complete!</h2>
            <div className="summary-stats-grid">
              <div className="summary-stat-item"><span className="label">Volume</span><span className="value">{totalVol}kg</span></div>
              <div className="summary-stat-item"><span className="label">Sets</span><span className="value">{doneSets}</span></div>
              <div className="summary-stat-item"><span className="label">Duration</span><span className="value">{Math.floor((new Date().getTime() - sessionStartTime.getTime()) / 60000)}m</span></div>
            </div>
            <button className="summary-close-btn" onClick={() => (window.location.href = "/dashboard")}>Done</button>
          </div>
        </div>
      )}

      {/* ── Quick Add ── */}
      {showQuickAdd && (
        <div className="ex-modal-backdrop" onClick={() => setShowQuickAdd(false)}>
          <div className="ex-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ex-modal-header">
              <div className="ex-modal-title">Add Exercise</div>
              <button className="ex-modal-close" onClick={() => setShowQuickAdd(false)}><FontAwesomeIcon icon={faXmark} /></button>
            </div>
            <div className="ex-modal-body">
              {!showForm ? (
                <>
                  {Object.entries(exercisePresets).map(([cat, exList]) => (
                    <div key={cat} className="ex-preset-group">
                      <div className="ex-preset-cat">{cat}</div>
                      <div className="ex-preset-list">
                        {exList.map((name) => (
                          <button key={name} className="ex-preset-btn" onClick={() => addTrackedExercise(name, cat)}>{name}</button>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button className="ex-custom-btn" onClick={() => setShowForm(true)}>+ Custom Exercise</button>
                </>
              ) : (
                <div className="ex-custom-form">
                  <input className="ex-form-input" placeholder="Name" value={customName} onChange={(e) => setCustomName(e.target.value)} />
                  <div className="ex-form-actions mt-3">
                    <button className="ex-form-cancel" onClick={() => setShowForm(false)}>Back</button>
                    <button className="ex-form-submit" onClick={() => addTrackedExercise(customName, customCat)}>Add</button>
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

export default Exercises;
