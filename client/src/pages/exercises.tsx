import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col, Card, Badge } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClock,
  faRotate,
  faDumbbell,
  faBullseye,
  faLayerGroup,
  faMagnifyingGlass,
  faFilter,
} from "@fortawesome/free-solid-svg-icons";
import "../css/exercises.css";
import { nameToId } from "./exerciseDetails";

/* ─── Types ──────────────────────────────────────────────────── */
interface Exercise {
  name: string;
  sets: number;
  reps: number | null;
  time: string | null;
  image: string;
  category: string;
  target: string;
  equipment: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  instructions: string;
}

/* ─── Full Exercise Library ──────────────────────────────────── */
const ALL_EXERCISES: Exercise[] = [
  /* ── CHEST ──────────────────────────────────────────────── */
  {
    name: "Barbell Bench Press",
    sets: 4,
    reps: 8,
    time: null,
    image:
      "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&fit=crop&q=80",
    category: "chest",
    target: "chest, front deltoids, triceps",
    equipment: "barbell",
    difficulty: "intermediate",
    instructions:
      "Lie flat on a bench. Grip the bar just outside shoulder-width. Lower to your chest, pause, then press back up explosively.",
  },
  {
    name: "Push-Ups",
    sets: 3,
    reps: 15,
    time: null,
    image:
      "https://images.unsplash.com/photo-1598971639058-fab3c3109a3d?w=600&fit=crop&q=80",
    category: "chest",
    target: "chest, shoulders, triceps",
    equipment: "bodyweight",
    difficulty: "beginner",
    instructions:
      "Start in a plank position with hands slightly wider than shoulder-width. Lower your chest to the floor, then push back up.",
  },
  {
    name: "Incline Dumbbell Press",
    sets: 3,
    reps: 10,
    time: null,
    image:
      "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&fit=crop&q=80",
    category: "chest",
    target: "upper chest, shoulders, triceps",
    equipment: "dumbbells",
    difficulty: "intermediate",
    instructions:
      "Set bench to 30–45°. Press dumbbells from chest level upward, squeezing at the top. Lower with control.",
  },
  {
    name: "Cable Fly",
    sets: 3,
    reps: 12,
    time: null,
    image:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&fit=crop&q=80",
    category: "chest",
    target: "chest, front deltoids",
    equipment: "cable machine",
    difficulty: "intermediate",
    instructions:
      "Set cables at shoulder height. Step forward, extend arms out, then bring hands together in a hugging arc. Squeeze at the peak.",
  },
  {
    name: "Dips (Chest-Focused)",
    sets: 4,
    reps: 10,
    time: null,
    image:
      "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=600&fit=crop&q=80",
    category: "chest",
    target: "lower chest, triceps, shoulders",
    equipment: "bodyweight",
    difficulty: "intermediate",
    instructions:
      "Lean forward on parallel bars. Lower until elbows reach 90°, then push back up. Keep torso tilted for chest emphasis.",
  },

  /* ── BACK ────────────────────────────────────────────────── */
  {
    name: "Deadlift",
    sets: 4,
    reps: 5,
    time: null,
    image:
      "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=600&fit=crop&q=80",
    category: "back",
    target: "lower back, hamstrings, glutes, traps",
    equipment: "barbell",
    difficulty: "intermediate",
    instructions:
      "Stand with feet hip-width, bar over mid-foot. Hinge at hips, grip bar, brace core. Drive through the floor to stand tall.",
  },
  {
    name: "Pull-Ups",
    sets: 4,
    reps: 8,
    time: null,
    image:
      "https://images.unsplash.com/photo-1598266663439-2056e6900339?w=600&fit=crop&q=80",
    category: "back",
    target: "lats, biceps, rear deltoids",
    equipment: "bodyweight",
    difficulty: "intermediate",
    instructions:
      "Hang from a bar with an overhand grip. Pull your chest toward the bar, squeezing the lats at the top. Lower with control.",
  },
  {
    name: "Barbell Row",
    sets: 4,
    reps: 8,
    time: null,
    image:
      "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=600&fit=crop&q=80",
    category: "back",
    target: "mid-back, lats, biceps",
    equipment: "barbell",
    difficulty: "intermediate",
    instructions:
      "Hinge forward to ~45°, bar in hands. Drive elbows back, rowing the bar to your lower chest. Squeeze shoulder blades together.",
  },
  {
    name: "Lat Pulldown",
    sets: 3,
    reps: 12,
    time: null,
    image:
      "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&fit=crop&q=80",
    category: "back",
    target: "lats, rear deltoids, biceps",
    equipment: "cable machine",
    difficulty: "beginner",
    instructions:
      "Sit at a cable machine, grip the bar wide. Pull the bar to your upper chest while leaning back slightly. Squeeze the lats at the bottom.",
  },
  {
    name: "Seated Cable Row",
    sets: 3,
    reps: 12,
    time: null,
    image:
      "https://images.unsplash.com/photo-1581009137042-c552e485697a?w=600&fit=crop&q=80",
    category: "back",
    target: "mid-back, lats, biceps, rear deltoids",
    equipment: "cable machine",
    difficulty: "beginner",
    instructions:
      "Sit upright with feet on the platform. Pull the handle to your abdomen, driving elbows back and squeezing your shoulder blades.",
  },
  {
    name: "Face Pulls",
    sets: 3,
    reps: 15,
    time: null,
    image:
      "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&fit=crop&q=80",
    category: "back",
    target: "rear deltoids, rotator cuff, traps",
    equipment: "cable machine",
    difficulty: "beginner",
    instructions:
      "Set cable at head height. Pull the rope to your face, flaring elbows out and externally rotating the shoulders at the end.",
  },
  {
    name: "Single-Arm Dumbbell Row",
    sets: 3,
    reps: 10,
    time: null,
    image:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&fit=crop&q=80",
    category: "back",
    target: "lats, mid-back, biceps",
    equipment: "dumbbells",
    difficulty: "beginner",
    instructions:
      "Place one knee and hand on a bench. Hold a dumbbell in the free hand, row it to your hip, elbow close to the torso.",
  },

  /* ── LEGS ────────────────────────────────────────────────── */
  {
    name: "Barbell Squat",
    sets: 4,
    reps: 8,
    time: null,
    image:
      "https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?w=600&fit=crop&q=80",
    category: "legs",
    target: "quadriceps, glutes, hamstrings",
    equipment: "barbell",
    difficulty: "intermediate",
    instructions:
      "Bar on upper traps, feet shoulder-width. Break at the hips and knees, descend until thighs are parallel, drive back up.",
  },
  {
    name: "Lunges",
    sets: 3,
    reps: 10,
    time: null,
    image:
      "https://images.unsplash.com/photo-1434608519344-49d77a699e1d?w=600&fit=crop&q=80",
    category: "legs",
    target: "quadriceps, glutes, hamstrings",
    equipment: "bodyweight",
    difficulty: "beginner",
    instructions:
      "Step forward with one leg and lower your hips until both knees are at 90°. Push back and repeat on the other side.",
  },
  {
    name: "Romanian Deadlift",
    sets: 3,
    reps: 10,
    time: null,
    image:
      "https://images.unsplash.com/photo-1616803689943-5601631c7fec?w=600&fit=crop&q=80",
    category: "legs",
    target: "hamstrings, glutes, lower back",
    equipment: "barbell",
    difficulty: "intermediate",
    instructions:
      "Hold a bar in front of thighs. Hinge at hips, pushing them back, lowering the bar along your legs until you feel a hamstring stretch.",
  },
  {
    name: "Leg Press",
    sets: 4,
    reps: 12,
    time: null,
    image:
      "https://images.unsplash.com/photo-1590239926044-4131a8e4e9d7?w=600&fit=crop&q=80",
    category: "legs",
    target: "quadriceps, glutes, hamstrings",
    equipment: "machine",
    difficulty: "beginner",
    instructions:
      "Sit in the leg press machine. Place feet shoulder-width on the platform. Lower the weight until knees reach 90°, then press back.",
  },
  {
    name: "Bulgarian Split Squat",
    sets: 3,
    reps: 10,
    time: null,
    image:
      "https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?w=600&fit=crop&q=80",
    category: "legs",
    target: "quadriceps, glutes, hip flexors",
    equipment: "dumbbells",
    difficulty: "intermediate",
    instructions:
      "Rear foot elevated on a bench. Lower your front knee toward the floor, keeping your torso upright. Drive back up through the heel.",
  },
  {
    name: "Hip Thrust",
    sets: 4,
    reps: 12,
    time: null,
    image:
      "https://images.unsplash.com/photo-1571019114074-0d5f30870e42?w=600&fit=crop&q=80",
    category: "legs",
    target: "glutes, hamstrings",
    equipment: "barbell",
    difficulty: "intermediate",
    instructions:
      "Shoulders on a bench, bar across hips. Drive your hips upward, squeezing glutes at the top. Lower slowly and repeat.",
  },
  {
    name: "Leg Curl",
    sets: 3,
    reps: 12,
    time: null,
    image:
      "https://images.unsplash.com/photo-1583454155184-870a1f63be24?w=600&fit=crop&q=80",
    category: "legs",
    target: "hamstrings",
    equipment: "machine",
    difficulty: "beginner",
    instructions:
      "Lie face down on the machine. Curl your legs up toward your glutes, squeezing the hamstrings fully. Lower with control.",
  },
  {
    name: "Leg Extension",
    sets: 3,
    reps: 12,
    time: null,
    image:
      "https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=600&fit=crop&q=80",
    category: "legs",
    target: "quadriceps",
    equipment: "machine",
    difficulty: "beginner",
    instructions:
      "Sit in the leg extension machine. Fully extend your legs upward, squeezing quads at the top. Lower with control.",
  },
  {
    name: "Calf Raise",
    sets: 5,
    reps: 15,
    time: null,
    image:
      "https://images.unsplash.com/photo-1571019613576-2b22c76fd955?w=600&fit=crop&q=80",
    category: "legs",
    target: "gastrocnemius, soleus",
    equipment: "bodyweight",
    difficulty: "beginner",
    instructions:
      "Stand on the edge of a step. Rise onto your toes, hold for a count, then lower your heels below the step for a full stretch.",
  },

  /* ── SHOULDERS ───────────────────────────────────────────── */
  {
    name: "Overhead Press",
    sets: 4,
    reps: 8,
    time: null,
    image:
      "https://images.unsplash.com/photo-1532384748853-8f54a8f476e2?w=600&fit=crop&q=80",
    category: "shoulders",
    target: "front deltoids, lateral deltoids, triceps",
    equipment: "barbell",
    difficulty: "intermediate",
    instructions:
      "Hold the bar at shoulder height. Press straight up overhead, locking out elbows at the top. Lower to shoulder height with control.",
  },
  {
    name: "Lateral Raises",
    sets: 4,
    reps: 15,
    time: null,
    image:
      "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=600&fit=crop&q=80",
    category: "shoulders",
    target: "lateral deltoids",
    equipment: "dumbbells",
    difficulty: "beginner",
    instructions:
      "Hold dumbbells at sides. Raise arms out to shoulder height with a slight elbow bend, leading with the pinky. Lower slowly.",
  },
  {
    name: "Dumbbell Shoulder Press",
    sets: 3,
    reps: 10,
    time: null,
    image:
      "https://images.unsplash.com/photo-1581009137042-c552e485697a?w=600&fit=crop&q=80",
    category: "shoulders",
    target: "front & lateral deltoids, triceps",
    equipment: "dumbbells",
    difficulty: "beginner",
    instructions:
      "Hold dumbbells at ear-level. Press overhead until arms are fully extended, then lower back to ear-level.",
  },
  {
    name: "Rear Delt Fly",
    sets: 3,
    reps: 15,
    time: null,
    image:
      "https://images.unsplash.com/photo-1597347316205-36f6c451902a?w=600&fit=crop&q=80",
    category: "shoulders",
    target: "rear deltoids, rhomboids",
    equipment: "dumbbells",
    difficulty: "beginner",
    instructions:
      "Bend forward at the hips. Raise dumbbells out to the sides with a slight bend in the elbow, pinching the shoulder blades.",
  },
  {
    name: "Upright Row",
    sets: 3,
    reps: 12,
    time: null,
    image:
      "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&fit=crop&q=80",
    category: "shoulders",
    target: "lateral deltoids, traps",
    equipment: "barbell",
    difficulty: "intermediate",
    instructions:
      "Hold bar with a narrow overhand grip. Pull it straight up to chin level, leading with the elbows. Lower with control.",
  },

  /* ── ARMS ────────────────────────────────────────────────── */
  {
    name: "Barbell Curl",
    sets: 4,
    reps: 10,
    time: null,
    image:
      "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&fit=crop&q=80",
    category: "arms",
    target: "biceps brachii, brachialis",
    equipment: "barbell",
    difficulty: "beginner",
    instructions:
      "Stand with an underhand grip, elbows at sides. Curl the bar to shoulder height while keeping upper arms fixed. Lower slowly.",
  },
  {
    name: "Hammer Curl",
    sets: 3,
    reps: 12,
    time: null,
    image:
      "https://images.unsplash.com/photo-1596357395217-80de13130e92?w=600&fit=crop&q=80",
    category: "arms",
    target: "brachialis, brachioradialis, biceps",
    equipment: "dumbbells",
    difficulty: "beginner",
    instructions:
      "Hold dumbbells with a neutral (hammer) grip. Curl toward shoulder while keeping the wrist neutral. Lower with control.",
  },
  {
    name: "Incline Dumbbell Curl",
    sets: 3,
    reps: 10,
    time: null,
    image:
      "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=600&fit=crop&q=80",
    category: "arms",
    target: "biceps (long head)",
    equipment: "dumbbells",
    difficulty: "intermediate",
    instructions:
      "Sit on an inclined bench (45°). Let arms hang behind the torso. Curl dumbbells to the shoulder, maximising the long-head stretch.",
  },
  {
    name: "Skull Crushers",
    sets: 3,
    reps: 10,
    time: null,
    image:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&fit=crop&q=80",
    category: "arms",
    target: "triceps (long head)",
    equipment: "barbell",
    difficulty: "intermediate",
    instructions:
      "Lie flat, hold a bar above your chest. Lower it toward your forehead by bending only at the elbow, then extend back up.",
  },
  {
    name: "Tricep Rope Pushdown",
    sets: 3,
    reps: 12,
    time: null,
    image:
      "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=600&fit=crop&q=80",
    category: "arms",
    target: "triceps (lateral & medial head)",
    equipment: "cable machine",
    difficulty: "beginner",
    instructions:
      "Attach a rope to a high pulley. Pull the rope down and split the ends at the bottom, fully extending elbows. Return slowly.",
  },
  {
    name: "Overhead Tricep Extension",
    sets: 3,
    reps: 12,
    time: null,
    image:
      "https://images.unsplash.com/photo-1583454155184-870a1f63be24?w=600&fit=crop&q=80",
    category: "arms",
    target: "triceps (long head)",
    equipment: "dumbbells",
    difficulty: "beginner",
    instructions:
      "Hold one dumbbell overhead with both hands. Lower it behind your head, bending at the elbow, then press back up.",
  },
  {
    name: "Concentration Curl",
    sets: 3,
    reps: 12,
    time: null,
    image:
      "https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?w=600&fit=crop&q=80",
    category: "arms",
    target: "biceps peak",
    equipment: "dumbbells",
    difficulty: "beginner",
    instructions:
      "Sit on a bench, elbow braced against your inner thigh. Curl the dumbbell to your shoulder, squeezing hard at the top.",
  },

  /* ── CORE ────────────────────────────────────────────────── */
  {
    name: "Plank",
    sets: 3,
    reps: null,
    time: "45 sec",
    image:
      "https://images.unsplash.com/photo-1566241440091-ec10de8db2e1?w=600&fit=crop&q=80",
    category: "core",
    target: "core, shoulders, lower back",
    equipment: "bodyweight",
    difficulty: "beginner",
    instructions:
      "Hold a forearm plank, body in a straight line from head to heels. Squeeze glutes and abs. Breathe steadily.",
  },
  {
    name: "Crunches",
    sets: 3,
    reps: 20,
    time: null,
    image:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&fit=crop&q=80",
    category: "core",
    target: "abdominals, obliques",
    equipment: "bodyweight",
    difficulty: "beginner",
    instructions:
      "Lie with knees bent. Curl shoulders toward knees, contracting the abs. Lower slowly without fully relaxing at the bottom.",
  },
  {
    name: "Hanging Leg Raise",
    sets: 3,
    reps: 12,
    time: null,
    image:
      "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&fit=crop&q=80",
    category: "core",
    target: "lower abdominals, hip flexors",
    equipment: "bodyweight",
    difficulty: "intermediate",
    instructions:
      "Hang from a pull-up bar. Raise your legs to 90° (or higher) while minimising swing. Lower with control.",
  },
  {
    name: "Ab Wheel Rollout",
    sets: 3,
    reps: 10,
    time: null,
    image:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&fit=crop&q=80",
    category: "core",
    target: "core, lats, shoulders",
    equipment: "ab wheel",
    difficulty: "advanced",
    instructions:
      "Kneel on the floor holding the wheel. Roll forward until your body is extended, then use your core to pull back to the start.",
  },
  {
    name: "Russian Twist",
    sets: 3,
    reps: 20,
    time: null,
    image:
      "https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=600&fit=crop&q=80",
    category: "core",
    target: "obliques, rectus abdominis",
    equipment: "bodyweight",
    difficulty: "beginner",
    instructions:
      "Sit with knees bent, lean back slightly. Rotate your torso side to side, touching the floor each time. Hold a plate to progress.",
  },
  {
    name: "Cable Crunch",
    sets: 3,
    reps: 15,
    time: null,
    image:
      "https://images.unsplash.com/photo-1590239926044-4131a8e4e9d7?w=600&fit=crop&q=80",
    category: "core",
    target: "rectus abdominis",
    equipment: "cable machine",
    difficulty: "intermediate",
    instructions:
      "Kneel facing a high cable with a rope. Contract your abs, pulling your elbows toward your knees. Slowly return to the top.",
  },

  /* ── CARDIO ──────────────────────────────────────────────── */
  {
    name: "Treadmill Run",
    sets: 1,
    reps: null,
    time: "20 min",
    image:
      "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=600&fit=crop&q=80",
    category: "cardio",
    target: "cardiovascular system, legs",
    equipment: "treadmill",
    difficulty: "beginner",
    instructions:
      "Set a comfortable pace. Keep a slight forward lean, arms at 90°. Breathe rhythmically and maintain consistent cadence.",
  },
  {
    name: "Jump Rope",
    sets: 5,
    reps: null,
    time: "60 sec",
    image:
      "https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=600&fit=crop&q=80",
    category: "cardio",
    target: "calves, coordination, cardiovascular",
    equipment: "jump rope",
    difficulty: "beginner",
    instructions:
      "Keep elbows close to body, turn rope with wrists. Land softly on the balls of your feet. Keep a steady rhythm.",
  },
  {
    name: "Burpees",
    sets: 4,
    reps: 10,
    time: null,
    image:
      "https://images.unsplash.com/photo-1597347316205-36f6c451902a?w=600&fit=crop&q=80",
    category: "cardio",
    target: "full body, cardiovascular",
    equipment: "bodyweight",
    difficulty: "intermediate",
    instructions:
      "From standing, drop into a squat and kick feet back to plank. Do a push-up, jump feet forward, then explode upward into a jump.",
  },
  {
    name: "Cycling",
    sets: 1,
    reps: null,
    time: "30 min",
    image:
      "https://images.unsplash.com/photo-1534787238916-9ba6764efd4f?w=600&fit=crop&q=80",
    category: "cardio",
    target: "cardiovascular system, quads, glutes",
    equipment: "bike / stationary bike",
    difficulty: "beginner",
    instructions:
      "Maintain a resistance that feels challenging but sustainable. Keep cadence at 70–90 RPM for optimal fat burning.",
  },
  {
    name: "Battle Ropes",
    sets: 5,
    reps: null,
    time: "30 sec",
    image:
      "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=600&fit=crop&q=80",
    category: "cardio",
    target: "shoulders, arms, core, cardiovascular",
    equipment: "battle ropes",
    difficulty: "intermediate",
    instructions:
      "Grip both ends of the rope. Alternate slamming each arm up and down rapidly. Keep a stable athletic base throughout.",
  },
];

/* ─── Category config ────────────────────────────────────────── */
const CATEGORIES = [
  "all",
  "chest",
  "back",
  "legs",
  "shoulders",
  "arms",
  "core",
  "cardio",
];
const DIFFICULTIES = ["all", "beginner", "intermediate", "advanced"];

const categoryVariant: Record<string, string> = {
  chest: "info",
  back: "dark",
  legs: "primary",
  shoulders: "warning",
  arms: "danger",
  core: "secondary",
  cardio: "success",
};

const difficultyVariant: Record<string, string> = {
  beginner: "success",
  intermediate: "warning",
  advanced: "danger",
};

/* ─── Component ──────────────────────────────────────────────── */
function Exercises() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeDifficulty, setActiveDifficulty] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return ALL_EXERCISES.filter((ex) => {
      const matchCat =
        activeCategory === "all" || ex.category === activeCategory;
      const matchDiff =
        activeDifficulty === "all" || ex.difficulty === activeDifficulty;
      const matchSearch =
        ex.name.toLowerCase().includes(search.toLowerCase()) ||
        ex.target.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchDiff && matchSearch;
    });
  }, [activeCategory, activeDifficulty, search]);

  return (
    <div className="exercises-page">
      {/* ── Header ── */}
      <h1 className="exercises-title">
        <FontAwesomeIcon icon={faDumbbell} className="me-2" />
        Exercises
        <span className="exercises-count">{filtered.length} exercises</span>
      </h1>

      {/* ── Search ── */}
      <div className="exercises-search-wrap">
        <FontAwesomeIcon icon={faMagnifyingGlass} className="search-icon" />
        <input
          className="exercises-search"
          placeholder="Search by name or muscle…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
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
              {cat === "all"
                ? "All"
                : cat.charAt(0).toUpperCase() + cat.slice(1)}
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
              {d === "all"
                ? "Any Level"
                : d.charAt(0).toUpperCase() + d.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* ── Grid ── */}
      {filtered.length === 0 ? (
        <div className="exercises-empty">No exercises match your filters.</div>
      ) : (
        <Row xs={1} sm={2} lg={3} xl={4} className="g-4">
          {filtered.map((exercise, index) => (
            <Col key={index}>
              <Card
                className="exercise-card h-100"
                onClick={() =>
                  navigate(`/exercises/${nameToId(exercise.name)}`)
                }
                style={{ cursor: "pointer" }}
              >
                <Card.Img
                  variant="top"
                  src={exercise.image}
                  alt={exercise.name}
                  className="exercise-card-img"
                />
                <Card.Body className="d-flex flex-column">
                  <Card.Title className="exercise-card-title">
                    {exercise.name}
                  </Card.Title>

                  {/* Badges */}
                  <div className="mb-2 d-flex gap-2 flex-wrap">
                    <Badge
                      bg={categoryVariant[exercise.category] ?? "primary"}
                      className="exercise-badge"
                    >
                      {exercise.category}
                    </Badge>
                    <Badge
                      bg={difficultyVariant[exercise.difficulty] ?? "secondary"}
                      className="exercise-badge"
                    >
                      {exercise.difficulty}
                    </Badge>
                  </div>

                  {/* Target muscles */}
                  <Card.Text className="exercise-target">
                    <FontAwesomeIcon
                      icon={faBullseye}
                      className="me-1 text-danger"
                    />
                    {exercise.target}
                  </Card.Text>

                  {/* Instructions */}
                  <Card.Text className="exercise-instructions flex-grow-1">
                    {exercise.instructions}
                  </Card.Text>

                  {/* Meta row */}
                  <div className="exercise-meta mt-auto pt-3 border-top border-secondary d-flex gap-2 flex-wrap">
                    <span className="meta-pill">
                      <FontAwesomeIcon icon={faLayerGroup} className="me-1" />
                      {exercise.sets} sets
                    </span>
                    <span className="meta-pill">
                      {exercise.reps !== null ? (
                        <>
                          <FontAwesomeIcon icon={faRotate} className="me-1" />
                          {exercise.reps} reps
                        </>
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faClock} className="me-1" />
                          {exercise.time}
                        </>
                      )}
                    </span>
                    <span className="meta-pill">
                      <FontAwesomeIcon icon={faDumbbell} className="me-1" />
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
  );
}

export default Exercises;
