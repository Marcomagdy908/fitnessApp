import { useState, useMemo, useEffect } from "react";
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

/* ─── Category config ────────────────────────────────────────── */
const CATEGORIES = ["all","chest","back","legs","shoulders","arms","core","cardio"];
const DIFFICULTIES = ["all", "beginner", "intermediate", "advanced"];

const categoryVariant: Record<string, string> = {
  chest: "info", back: "dark", legs: "primary",
  shoulders: "warning", arms: "danger", core: "secondary", cardio: "success",
};
const difficultyVariant: Record<string, string> = {
  beginner: "success", intermediate: "warning", advanced: "danger",
};

/* ─── Component ──────────────────────────────────────────────── */
function Exercises() {
  const navigate = useNavigate();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeDifficulty, setActiveDifficulty] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const params = new URLSearchParams({ limit: "100" });
    fetch(`/api/exercises?${params}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setExercises(data.data);
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

  return (
    <div className="exercises-page">
      {/* ── Header ── */}
      <h1 className="exercises-title">
        <FontAwesomeIcon icon={faDumbbell} className="me-2 fa-dumbbell" />
        Exercises
        <span className="exercises-count">
          {loading ? "…" : `${filtered.length} exercises`}
        </span>
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
                    <FontAwesomeIcon icon={faBullseye} className="me-1 text-danger" />
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
