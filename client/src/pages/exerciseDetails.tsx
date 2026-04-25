import { useParams, useNavigate } from "react-router-dom";
import { Badge } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDumbbell,
  faBullseye,
  faLayerGroup,
  faRotate,
  faClock,
  faArrowLeft,
  faFire,
  faChartLine,
  faStar,
  faCheckCircle,
  faLightbulb,
  faWeight,
} from "@fortawesome/free-solid-svg-icons";
import "../css/exerciseDetails.css";

/* ─── Types ──────────────────────────────────────────────────── */
interface ExerciseDetail {
  id: string;
  name: string;
  category: string;
  target: string;
  equipment: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  image: string;
  sets: number;
  reps: number | null;
  time: string | null;
  instructions: string;
  // Extra detail-page fields
  musclesWorked: { primary: string[]; secondary: string[] };
  tips: string[];
  commonMistakes: string[];
  variations: string[];
  calories: number; // kcal per 30 min
  rating: number; // out of 5
  totalRatings: number;
  restTime: string;
  tempo: string; // e.g. "3-1-2"
  history: { date: string; sets: number; reps: number; weight: number }[];
}

/* ─── Mock Data ──────────────────────────────────────────────── */
// Replace with API call: GET /api/exercises/:id
const MOCK_EXERCISES: Record<string, ExerciseDetail> = {
  "barbell-bench-press": {
    id: "barbell-bench-press",
    name: "Barbell Bench Press",
    category: "chest",
    target: "chest, front deltoids, triceps",
    equipment: "barbell",
    difficulty: "intermediate",
    image:
      "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=900&fit=crop&q=80",
    sets: 4,
    reps: 8,
    time: null,
    instructions:
      "Lie flat on a bench. Grip the bar just outside shoulder-width. Lower to your chest, pause, then press back up explosively.",
    musclesWorked: {
      primary: ["Pectoralis Major", "Front Deltoids", "Triceps Brachii"],
      secondary: ["Serratus Anterior", "Coracobrachialis"],
    },
    tips: [
      "Keep your shoulder blades retracted and depressed throughout the lift.",
      "Maintain a slight arch in your lower back with feet flat on the floor.",
      "Use leg drive — push your feet into the ground for more power.",
      "Control the descent; aim for a 2–3 second lowering phase.",
    ],
    commonMistakes: [
      "Bouncing the bar off your chest — always pause at the bottom.",
      "Flaring elbows out at 90° — keep them at ~75° to protect shoulders.",
      "Lifting your butt off the bench — this reduces range of motion.",
    ],
    variations: [
      "Incline Bench Press",
      "Decline Bench Press",
      "Close-Grip Bench Press",
      "Dumbbell Bench Press",
      "Floor Press",
    ],
    calories: 220,
    rating: 4.8,
    totalRatings: 2843,
    restTime: "90–120 sec",
    tempo: "3-1-2",
    history: [
      { date: "Feb 26", sets: 4, reps: 8, weight: 80 },
      { date: "Feb 22", sets: 4, reps: 7, weight: 80 },
      { date: "Feb 18", sets: 3, reps: 8, weight: 77.5 },
      { date: "Feb 14", sets: 3, reps: 8, weight: 75 },
      { date: "Feb 10", sets: 3, reps: 7, weight: 75 },
    ],
  },
  "push-ups": {
    id: "push-ups",
    name: "Push-Ups",
    category: "chest",
    target: "chest, shoulders, triceps",
    equipment: "bodyweight",
    difficulty: "beginner",
    image:
      "https://images.unsplash.com/photo-1598971639058-fab3c3109a3d?w=900&fit=crop&q=80",
    sets: 3,
    reps: 15,
    time: null,
    instructions:
      "Start in a plank position with hands slightly wider than shoulder-width. Lower your chest to the floor, then push back up.",
    musclesWorked: {
      primary: ["Pectoralis Major", "Triceps Brachii", "Anterior Deltoid"],
      secondary: ["Core", "Serratus Anterior"],
    },
    tips: [
      "Keep your body in a perfectly straight line from head to heels.",
      "Engage your core and glutes throughout the movement.",
      "Lower until your chest is just above the floor.",
    ],
    commonMistakes: [
      "Sagging hips — squeeze your glutes and core.",
      "Hands too wide — keep them slightly wider than shoulders.",
      "Partial reps — go through the full range of motion.",
    ],
    variations: [
      "Diamond Push-Ups",
      "Wide Push-Ups",
      "Decline Push-Ups",
      "Incline Push-Ups",
      "Archer Push-Ups",
    ],
    calories: 170,
    rating: 4.6,
    totalRatings: 5120,
    restTime: "60 sec",
    tempo: "2-0-1",
    history: [
      { date: "Feb 27", sets: 3, reps: 15, weight: 0 },
      { date: "Feb 23", sets: 3, reps: 12, weight: 0 },
      { date: "Feb 19", sets: 3, reps: 12, weight: 0 },
      { date: "Feb 15", sets: 3, reps: 10, weight: 0 },
    ],
  },
  deadlift: {
    id: "deadlift",
    name: "Deadlift",
    category: "back",
    target: "lower back, hamstrings, glutes, traps",
    equipment: "barbell",
    difficulty: "intermediate",
    image:
      "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=900&fit=crop&q=80",
    sets: 4,
    reps: 5,
    time: null,
    instructions:
      "Stand with feet hip-width, bar over mid-foot. Hinge at hips, grip bar, brace core. Drive through the floor to stand tall.",
    musclesWorked: {
      primary: ["Erector Spinae", "Hamstrings", "Glutes", "Trapezius"],
      secondary: ["Quadriceps", "Forearms", "Core", "Lats"],
    },
    tips: [
      "Keep the bar as close to your body as possible throughout the lift.",
      "Brace your core like you're about to be punched in the stomach.",
      "Push the floor away rather than pulling the bar up.",
      "Lock hips and knees out simultaneously at the top.",
    ],
    commonMistakes: [
      "Rounding the lower back — neutral spine is non-negotiable.",
      "Bar drifting away from the body — leads to back strain.",
      "Jerking the bar off the floor — take the slack out smoothly.",
    ],
    variations: [
      "Romanian Deadlift",
      "Sumo Deadlift",
      "Trap Bar Deadlift",
      "Stiff-Leg Deadlift",
      "Single-Leg Deadlift",
    ],
    calories: 300,
    rating: 4.9,
    totalRatings: 3974,
    restTime: "2–3 min",
    tempo: "2-0-1",
    history: [
      { date: "Feb 25", sets: 4, reps: 5, weight: 120 },
      { date: "Feb 21", sets: 4, reps: 5, weight: 117.5 },
      { date: "Feb 17", sets: 4, reps: 4, weight: 117.5 },
      { date: "Feb 13", sets: 3, reps: 5, weight: 115 },
      { date: "Feb 09", sets: 3, reps: 5, weight: 110 },
    ],
  },
  "barbell-squat": {
    id: "barbell-squat",
    name: "Barbell Squat",
    category: "legs",
    target: "quadriceps, glutes, hamstrings",
    equipment: "barbell",
    difficulty: "intermediate",
    image:
      "https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?w=900&fit=crop&q=80",
    sets: 4,
    reps: 8,
    time: null,
    instructions:
      "Bar on upper traps, feet shoulder-width. Break at the hips and knees, descend until thighs are parallel, drive back up.",
    musclesWorked: {
      primary: ["Quadriceps", "Glutes", "Hamstrings"],
      secondary: ["Adductors", "Core", "Erector Spinae", "Calves"],
    },
    tips: [
      "Keep your chest up and core tight throughout the movement.",
      "Drive your knees out in line with your toes.",
      "Aim for a full depth squat — thighs parallel to the floor or below.",
      "Take a big breath before descending and exhale at the top.",
    ],
    commonMistakes: [
      "Knee cave — push knees outward actively.",
      "Heel rise — work on ankle mobility or use a heel wedge.",
      "Good morning squat — keep the torso more upright.",
    ],
    variations: [
      "Front Squat",
      "Goblet Squat",
      "Bulgarian Split Squat",
      "Box Squat",
      "Hack Squat",
    ],
    calories: 280,
    rating: 4.9,
    totalRatings: 4512,
    restTime: "2–3 min",
    tempo: "3-1-2",
    history: [
      { date: "Feb 26", sets: 4, reps: 8, weight: 100 },
      { date: "Feb 22", sets: 4, reps: 7, weight: 100 },
      { date: "Feb 18", sets: 4, reps: 8, weight: 97.5 },
      { date: "Feb 14", sets: 4, reps: 7, weight: 95 },
      { date: "Feb 10", sets: 3, reps: 8, weight: 92.5 },
    ],
  },
  plank: {
    id: "plank",
    name: "Plank",
    category: "core",
    target: "core, shoulders, lower back",
    equipment: "bodyweight",
    difficulty: "beginner",
    image:
      "https://images.unsplash.com/photo-1566241440091-ec10de8db2e1?w=900&fit=crop&q=80",
    sets: 3,
    reps: null,
    time: "45 sec",
    instructions:
      "Hold a forearm plank, body in a straight line from head to heels. Squeeze glutes and abs. Breathe steadily.",
    musclesWorked: {
      primary: ["Rectus Abdominis", "Transversus Abdominis", "Obliques"],
      secondary: ["Shoulders", "Glutes", "Hip Flexors"],
    },
    tips: [
      "Squeeze your glutes and abs simultaneously for maximum tension.",
      "Look down at the floor to keep a neutral neck position.",
      "Focus on slow, diaphragmatic breathing.",
    ],
    commonMistakes: [
      "Hips too high — lower them to be in line with your body.",
      "Hips sagging — lift them up and squeeze the glutes.",
      "Holding breath — breathe steadily throughout.",
    ],
    variations: [
      "Side Plank",
      "RKC Plank",
      "Plank with Shoulder Taps",
      "Extended Plank",
      "Weighted Plank",
    ],
    calories: 120,
    rating: 4.5,
    totalRatings: 6210,
    restTime: "30–60 sec",
    tempo: "N/A",
    history: [
      { date: "Feb 27", sets: 3, reps: 0, weight: 0 },
      { date: "Feb 23", sets: 3, reps: 0, weight: 0 },
      { date: "Feb 19", sets: 3, reps: 0, weight: 0 },
    ],
  },
};

/* ─── Helpers ────────────────────────────────────────────────── */


function getFallbackExercise(id: string): ExerciseDetail {
  // Generic fallback so every exercise card opens a details page
  return {
    id,
    name: id.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    category: "general",
    target: "multiple muscle groups",
    equipment: "varies",
    difficulty: "intermediate",
    image:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=900&fit=crop&q=80",
    sets: 3,
    reps: 10,
    time: null,
    instructions:
      "Perform the exercise with proper form, focusing on the target muscles.",
    musclesWorked: {
      primary: ["Primary Muscle Group"],
      secondary: ["Secondary Muscle Group"],
    },
    tips: [
      "Maintain proper form throughout the movement.",
      "Breathe consistently — exhale on exertion.",
      "Start light and progress gradually.",
    ],
    commonMistakes: [
      "Using momentum instead of muscle.",
      "Incorrect range of motion.",
      "Neglecting warm-up sets.",
    ],
    variations: ["Variation 1", "Variation 2"],
    calories: 150,
    rating: 4.0,
    totalRatings: 100,
    restTime: "60–90 sec",
    tempo: "2-0-2",
    history: [
      { date: "Feb 27", sets: 3, reps: 10, weight: 0 },
      { date: "Feb 23", sets: 3, reps: 10, weight: 0 },
    ],
  };
}

const categoryVariant: Record<string, string> = {
  chest: "info",
  back: "dark",
  legs: "primary",
  shoulders: "warning",
  arms: "danger",
  core: "secondary",
  cardio: "success",
  general: "secondary",
};

const difficultyColor: Record<string, string> = {
  beginner: "#3dd264",
  intermediate: "#ffb900",
  advanced: "#ff5050",
};

/* ─── Component ──────────────────────────────────────────────── */
function ExerciseDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const exercise = id
    ? (MOCK_EXERCISES[id] ?? getFallbackExercise(id))
    : getFallbackExercise("unknown");

  const maxWeight = Math.max(...exercise.history.map((h) => h.weight || 0), 1);

  return (
    <div className="ed-page">
      {/* ── Back button ── */}
      <button className="ed-back-btn" onClick={() => navigate(-1)}>
        <FontAwesomeIcon icon={faArrowLeft} />
        <span>Back to Exercises</span>
      </button>

      {/* ── Hero ── */}
      <div className="ed-hero">
        <div className="ed-hero-img-wrap">
          <img
            src={exercise.image}
            alt={exercise.name}
            className="ed-hero-img"
          />
          <div className="ed-hero-overlay" />
          <div className="ed-hero-content">
            <div className="ed-hero-badges">
              <Badge
                bg={categoryVariant[exercise.category] ?? "secondary"}
                className="ed-badge"
              >
                {exercise.category}
              </Badge>
              <Badge
                className="ed-badge"
                style={{
                  background: `rgba(${
                    exercise.difficulty === "beginner"
                      ? "61,210,100"
                      : exercise.difficulty === "intermediate"
                        ? "255,185,0"
                        : "255,80,80"
                  }, 0.2)`,
                  color: difficultyColor[exercise.difficulty],
                  border: `1px solid ${difficultyColor[exercise.difficulty]}40`,
                }}
              >
                {exercise.difficulty}
              </Badge>
            </div>
            <h1 className="ed-hero-title">{exercise.name}</h1>
            <div className="ed-hero-rating">
              {[1, 2, 3, 4, 5].map((s) => (
                <FontAwesomeIcon
                  key={s}
                  icon={faStar}
                  className={
                    s <= Math.round(exercise.rating)
                      ? "ed-star active"
                      : "ed-star"
                  }
                />
              ))}
              <span className="ed-rating-label">
                {exercise.rating.toFixed(1)} (
                {exercise.totalRatings.toLocaleString()} ratings)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="ed-body">
        {/* ── Quick stats row ── */}
        <div className="ed-stats-row">
          <div className="ed-stat-card">
            <FontAwesomeIcon icon={faLayerGroup} className="ed-stat-icon" />
            <span className="ed-stat-value">{exercise.sets}</span>
            <span className="ed-stat-label">Sets</span>
          </div>
          <div className="ed-stat-card">
            <FontAwesomeIcon
              icon={exercise.reps !== null ? faRotate : faClock}
              className="ed-stat-icon"
            />
            <span className="ed-stat-value">
              {exercise.reps !== null ? exercise.reps : exercise.time}
            </span>
            <span className="ed-stat-label">
              {exercise.reps !== null ? "Reps" : "Duration"}
            </span>
          </div>
          <div className="ed-stat-card">
            <FontAwesomeIcon icon={faClock} className="ed-stat-icon" />
            <span className="ed-stat-value">{exercise.restTime}</span>
            <span className="ed-stat-label">Rest</span>
          </div>
          <div className="ed-stat-card">
            <FontAwesomeIcon icon={faFire} className="ed-stat-icon" />
            <span className="ed-stat-value">{exercise.calories}</span>
            <span className="ed-stat-label">kcal/30 min</span>
          </div>
          <div className="ed-stat-card">
            <FontAwesomeIcon icon={faWeight} className="ed-stat-icon" />
            <span className="ed-stat-value">{exercise.tempo}</span>
            <span className="ed-stat-label">Tempo</span>
          </div>
        </div>

        {/* ── 3-column grid ── */}
        <div className="ed-grid">
          {/* ─ LEFT column ─ */}
          <div className="ed-col">
            {/* Instructions */}
            <div className="ed-card">
              <h3 className="ed-card-title">
                <FontAwesomeIcon icon={faDumbbell} className="ed-card-icon" />
                Instructions
              </h3>
              <p className="ed-paragraph">{exercise.instructions}</p>
            </div>

            {/* Muscles Worked */}
            <div className="ed-card">
              <h3 className="ed-card-title">
                <FontAwesomeIcon icon={faBullseye} className="ed-card-icon" />
                Muscles Worked
              </h3>
              <div className="ed-muscles-section">
                <p className="ed-muscles-label">Primary</p>
                <div className="ed-muscle-tags">
                  {exercise.musclesWorked.primary.map((m) => (
                    <span key={m} className="ed-muscle-tag primary">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
              <div className="ed-muscles-section">
                <p className="ed-muscles-label">Secondary</p>
                <div className="ed-muscle-tags">
                  {exercise.musclesWorked.secondary.map((m) => (
                    <span key={m} className="ed-muscle-tag secondary">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Equipment */}
            <div className="ed-card">
              <h3 className="ed-card-title">
                <FontAwesomeIcon icon={faDumbbell} className="ed-card-icon" />
                Equipment
              </h3>
              <p
                className="ed-paragraph"
                style={{ textTransform: "capitalize" }}
              >
                {exercise.equipment}
              </p>
            </div>
          </div>

          {/* ─ MIDDLE column ─ */}
          <div className="ed-col">
            {/* Tips */}
            <div className="ed-card">
              <h3 className="ed-card-title">
                <FontAwesomeIcon icon={faLightbulb} className="ed-card-icon" />
                Pro Tips
              </h3>
              <ul className="ed-list">
                {exercise.tips.map((tip, i) => (
                  <li key={i} className="ed-list-item tips">
                    <FontAwesomeIcon
                      icon={faCheckCircle}
                      className="ed-list-icon"
                    />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Common Mistakes */}
            <div className="ed-card">
              <h3 className="ed-card-title ed-mistakes-title">
                <span className="ed-mistakes-icon">⚠</span>
                Common Mistakes
              </h3>
              <ul className="ed-list">
                {exercise.commonMistakes.map((m, i) => (
                  <li key={i} className="ed-list-item mistakes">
                    <span className="ed-mistake-dot" />
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ─ RIGHT column ─ */}
          <div className="ed-col">
            {/* Progress History */}
            <div className="ed-card">
              <h3 className="ed-card-title">
                <FontAwesomeIcon icon={faChartLine} className="ed-card-icon" />
                Recent Progress
              </h3>
              {exercise.history.length > 0 ? (
                <>
                  {/* Mini bar chart */}
                  <div className="ed-chart">
                    {exercise.history.map((h, i) => {
                      const barH =
                        maxWeight > 0
                          ? Math.max(
                              8,
                              ((h.weight || h.reps) / maxWeight) * 100,
                            )
                          : 30;
                      return (
                        <div key={i} className="ed-chart-col">
                          <div className="ed-chart-bar-wrap">
                            <div
                              className="ed-chart-bar"
                              style={{ height: `${barH}%` }}
                            />
                          </div>
                          <span className="ed-chart-label">{h.date}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* History table */}
                  <div className="ed-history-table">
                    <div className="ed-history-row header">
                      <span>Date</span>
                      <span>Sets</span>
                      <span>Reps</span>
                      <span>Weight</span>
                    </div>
                    {exercise.history.map((h, i) => (
                      <div key={i} className="ed-history-row">
                        <span>{h.date}</span>
                        <span>{h.sets}</span>
                        <span>{h.reps || "—"}</span>
                        <span>{h.weight ? `${h.weight} kg` : "BW"}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="ed-empty">
                  No history yet. Complete a workout to track progress.
                </p>
              )}
            </div>

            {/* Variations */}
            <div className="ed-card">
              <h3 className="ed-card-title">Variations</h3>
              <div className="ed-variations">
                {exercise.variations.map((v) => (
                  <span key={v} className="ed-variation-tag">
                    {v}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExerciseDetails;
