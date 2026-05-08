import { Row, Col, Card } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFire,
  faDumbbell,
  faCalendarCheck,
  faClock,
  faTrophy,
  faChartLine,
  faLayerGroup,
  faCalendarWeek,
  faArrowTrendUp,
  faHandFist,
  faSpinner,
  faPlus,
  faXmark,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { useEffect, useState } from "react";
import { api } from "../utils/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
} from "recharts";
import "../css/progress.css";
import { useTheme } from "../context/ThemeContext";


/* ─── Reusable card shell ────────────────────────── */
function PCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: IconDefinition;
  children: React.ReactNode;
}) {
  return (
    <Card className="prog-card h-100">
      <Card.Body>
        <div className="prog-card-title">
          <span className="prog-icon-box">
            <FontAwesomeIcon icon={icon} />
          </span>
          {title}
        </div>
        {children}
      </Card.Body>
    </Card>
  );
}

/* ─── Component ─────────────────────────────────── */
function Progress() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    weight: "",
    bodyFat: "",
    notes: "",
    date: new Date().toISOString().slice(0, 16)
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/progress/stats");
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch progress stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        weight: parseFloat(form.weight) || undefined,
        bodyFat: parseFloat(form.bodyFat) || undefined,
        notes: form.notes || undefined,
        date: new Date(form.date).toISOString()
      };
      const res = await api.post("/api/progress", payload);
      if (res.data.success) {
        setShowModal(false);
        setForm({ weight: "", bodyFat: "", notes: "", date: new Date().toISOString().slice(0, 16) });
        fetchData();
      }
    } catch (err) {
      console.error("Failed to add progress entry:", err);
      alert("Failed to add entry. Please check your inputs.");
    }
  };

  if (loading) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: "60vh" }}>
        <FontAwesomeIcon icon={faSpinner} spin size="2x" className="mb-3" style={{ color: "var(--accent-cyan)" }} />
        <p className="text-muted">Analyzing your progress...</p>
      </div>
    );
  }

  if (!stats) return null;

  const { summary, weeklyData, monthlyVolume, muscleStats, records, heatmap } = stats;

  const chartConfig = {
    gridStroke: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
    text: isDark ? "#888" : "#666",
    tooltipBg: isDark ? "#0d0d0d" : "#ffffff",
    tooltipBorder: isDark ? "rgba(61,255,255,0.2)" : "rgba(8,145,178,0.2)",
    tooltipText: isDark ? "#ccc" : "#333",
    radialTrack: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
  };

  const COLORS = isDark
    ? ["#3dffff", "#a98dff", "#00bfff", "#ff6b6b", "#ffd166"]
    : ["#0891b2", "#7c3aed", "#0284c7", "#dc2626", "#d97706"];

  const ttStyle = {
    background: chartConfig.tooltipBg,
    border: `1px solid ${chartConfig.tooltipBorder}`,
    borderRadius: 10,
    fontSize: "0.72rem",
    color: chartConfig.tooltipText,
    boxShadow: isDark ? "none" : "0 4px 12px rgba(0,0,0,0.1)",
  };

  return (
    <div className="progress-page">
      <div className="prog-header-row mb-4">
        <div>
          <h1 className="prog-page-title mb-0">
            <FontAwesomeIcon
              icon={faChartLine}
              className="me-2"
              style={{ color: "var(--accent-cyan)" }}
            />
            Progress
          </h1>
          <p className="text-muted small mb-0">Track your fitness journey and personal bests</p>
        </div>
        <button className="prog-add-btn" onClick={() => setShowModal(true)}>
          <FontAwesomeIcon icon={faPlus} className="me-2" />
          Add Entry
        </button>
      </div>

      {/* ── Row 1: stat pills ── */}
      <Row className="g-3 mb-3">
        {[
          {
            icon: faFire,
            label: "Current Streak",
            value: `${summary.streak} days`,
            color: "#ff6b6b",
          },
          {
            icon: faCalendarCheck,
            label: "Sessions / Month",
            value: summary.sessionsMonth,
            color: "var(--accent-cyan)",
          },
          {
            icon: faLayerGroup,
            label: "Total Exercises",
            value: summary.totalExercises,
            color: "#a98dff",
          },
          {
            icon: faClock,
            label: "Avg. Duration",
            value: `${summary.avgDuration} min`,
            color: "#ffd166",
          },
        ].map((s, i) => (
          <Col xs={6} lg={3} key={i}>
            <Card className="prog-stat-card h-100">
              <Card.Body className="d-flex align-items-center gap-3">
                <div
                  className="prog-stat-icon"
                  style={{
                    color: s.color,
                    background: `${s.color}1a`,
                    border: `1px solid ${s.color}33`,
                  }}
                >
                  <FontAwesomeIcon icon={s.icon} />
                </div>
                <div>
                  <div className="prog-stat-value" style={{ color: s.color }}>
                    {s.value}
                  </div>
                  <div className="prog-stat-label">{s.label}</div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* ── Row 2: weekly bar + donut ── */}
      <Row className="g-3 mb-3">
        <Col xs={12} lg={8}>
          <PCard title="This Week — Exercises Done" icon={faFire}>
            <ResponsiveContainer width="100%" height={195}>
              <BarChart
                data={weeklyData}
                barSize={30}
                margin={{ top: 4, right: 4, left: -16, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3dffff" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#00bfff" stopOpacity={0.3} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  stroke={chartConfig.gridStroke}
                  vertical={false}
                />
                <XAxis
                  dataKey="day"
                  tick={{ fill: chartConfig.text, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: chartConfig.text, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={ttStyle}
                  formatter={(v) => [`${v} exercises`, ""]}
                  cursor={{ fill: chartConfig.gridStroke }}
                />
                <Bar
                  dataKey="sessions"
                  fill="url(#barGrad)"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </PCard>
        </Col>

        <Col xs={12} lg={4}>
          <PCard title="Muscle Groups" icon={faHandFist}>
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie
                  data={muscleStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={38}
                  outerRadius={60}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {muscleStats.map((_: any, i: number) => (
                    <Cell
                      key={i}
                      fill={COLORS[i % COLORS.length]}
                      stroke="transparent"
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={ttStyle}
                  formatter={(v) => [`${v}%`, ""]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="prog-legend">
              {muscleStats.map((m: any, i: number) => (
                <div className="prog-legend-item" key={m.name}>
                  <span
                    className="prog-legend-dot"
                    style={{ background: COLORS[i % COLORS.length] }}
                  />
                  <span>{m.name}</span>
                  <span style={{ color: COLORS[i % COLORS.length], marginLeft: "auto" }}>
                    {m.value}%
                  </span>
                </div>
              ))}
            </div>
          </PCard>
        </Col>
      </Row>

      {/* ── Row 3: monthly trend + radial ── */}
      <Row className="g-3 mb-3">
        <Col xs={12} lg={8}>
          <PCard title="Monthly Volume Trend" icon={faArrowTrendUp}>
            <ResponsiveContainer width="100%" height={170}>
              <AreaChart
                data={monthlyVolume}
                margin={{ top: 4, right: 4, left: -16, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS[1]} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={COLORS[1]} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  stroke={chartConfig.gridStroke}
                  vertical={false}
                />
                <XAxis
                  dataKey="week"
                  tick={{ fill: chartConfig.text, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: chartConfig.text, fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={ttStyle}
                  formatter={(v) => [`${v} exercises`, "Volume"]}
                />
                <Area
                  type="monotone"
                  dataKey="volume"
                  stroke={COLORS[1]}
                  strokeWidth={2.5}
                  fill="url(#areaGrad)"
                  dot={{ fill: COLORS[1], r: 4, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </PCard>
        </Col>

        <Col xs={12} lg={4}>
          <PCard title="Muscle Coverage" icon={faHandFist}>
            <ResponsiveContainer width="100%" height={150}>
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="20%"
                outerRadius="90%"
                data={muscleStats.slice(0, 4).map((m: any, i: number) => ({ ...m, fill: COLORS[i % COLORS.length] }))}
                startAngle={180}
                endAngle={-180}
              >
                <RadialBar
                  dataKey="value"
                  background={{ fill: chartConfig.radialTrack } as object}
                />
                <Tooltip
                  contentStyle={ttStyle}
                  formatter={(v) => [`${v}%`, ""]}
                />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="prog-legend">
              {muscleStats.slice(0, 4).map((m: any, i: number) => (
                <div className="prog-legend-item" key={m.name}>
                  <span
                    className="prog-legend-dot"
                    style={{ background: COLORS[i % COLORS.length] }}
                  />
                  <span>{m.name}</span>
                  <span style={{ color: COLORS[i % COLORS.length], marginLeft: "auto" }}>
                    {m.value}%
                  </span>
                </div>
              ))}
            </div>
          </PCard>
        </Col>
      </Row>

      {/* ── Row 4: records + heatmap + goals ── */}
      <Row className="g-3">
        <Col xs={12} lg={5}>
          <PCard title="Personal Records" icon={faTrophy}>
            <div className="prog-records">
              <div className="prog-records-head">
                <span>Exercise</span>
                <span>Best</span>
                <span>Date</span>
              </div>
              {records.map((r: { exercise: string; best: string; date: string }, i: number) => (
                <div className="prog-records-row" key={i}>
                  <span className="prog-records-name">{r.exercise}</span>
                  <span className="prog-records-best">{r.best}</span>
                  <span className="prog-records-date">{r.date}</span>
                </div>
              ))}
            </div>
          </PCard>
        </Col>

        <Col xs={12} lg={4}>
          <PCard title="This Week" icon={faCalendarWeek}>
            <div className="prog-heatmap">
              {heatmap.map((d: any) => (
                <div
                  key={d.day}
                  className={`prog-heat-day ${d.done ? "prog-heat-done" : "prog-heat-rest"} ${d.isToday ? "prog-heat-today" : ""}`}
                >
                  <div className="prog-heat-label">{d.day}</div>
                  <div className="prog-heat-dot">{d.done ? "✓" : "–"}</div>
                </div>
              ))}
            </div>
            <div className="prog-cstats">
              <div className="prog-cstat">
                <div className="prog-cstat-val">
                  {heatmap.filter((d: any) => d.done).length}/7
                </div>
                <div className="prog-cstat-label">Days Hit</div>
              </div>
              <div className="prog-cstat">
                <div className="prog-cstat-val">
                  {Math.round((heatmap.filter((d: any) => d.done).length / 7) * 100)}%
                </div>
                <div className="prog-cstat-label">Adherence</div>
              </div>
              <div className="prog-cstat">
                <div className="prog-cstat-val">🔥{summary.streak}</div>
                <div className="prog-cstat-label">Streak</div>
              </div>
            </div>
          </PCard>
        </Col>

        <Col xs={12} lg={3}>
          <PCard title="Monthly Goals" icon={faDumbbell}>
            <div className="d-flex flex-column gap-3">
              {[
                {
                  label: "Workouts",
                  current: summary.sessionsMonth,
                  target: 20,
                  pct: Math.min(Math.round((summary.sessionsMonth / 20) * 100), 100),
                  color: "#3dffff",
                },
                {
                  label: "Exercises",
                  current: summary.totalExercises,
                  target: 100,
                  pct: Math.min(Math.round((summary.totalExercises / 100) * 100), 100),
                  color: "#a98dff",
                },
                {
                  label: "Streak Days",
                  current: summary.streak,
                  target: 10,
                  pct: Math.min(Math.round((summary.streak / 10) * 100), 100),
                  color: "#ff6b6b",
                },
              ].map((g) => (
                <div key={g.label}>
                  <div className="d-flex justify-content-between mb-1">
                    <span className="prog-goal-label">{g.label}</span>
                    <span className="prog-goal-val" style={{ color: g.color }}>
                      {g.current}/{g.target}
                    </span>
                  </div>
                  <div className="prog-track">
                    <div
                      className="prog-fill"
                      style={{
                        width: `${g.pct}%`,
                        background: `linear-gradient(90deg, ${g.color}, ${g.color}88)`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </PCard>
        </Col>
      </Row>

      {/* ── Add Entry Modal ── */}
      {showModal && (
        <div className="prog-modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="prog-modal" onClick={(e) => e.stopPropagation()}>
            <div className="prog-modal-header">
              <h2 className="prog-modal-title">Log Progress</h2>
              <button className="prog-modal-close" onClick={() => setShowModal(false)}>
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="prog-modal-body">
              <div className="prog-form-row">
                <div className="prog-form-group">
                  <label>Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="75.5"
                    value={form.weight}
                    onChange={(e) => setForm({ ...form, weight: e.target.value })}
                  />
                </div>
                <div className="prog-form-group">
                  <label>Body Fat (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="15.0"
                    value={form.bodyFat}
                    onChange={(e) => setForm({ ...form, bodyFat: e.target.value })}
                  />
                </div>
              </div>
              <div className="prog-form-group">
                <label>Date & Time</label>
                <input
                  type="datetime-local"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>
              <div className="prog-form-group">
                <label>Notes (optional)</label>
                <textarea
                  placeholder="Feeling strong today..."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>
              <div className="prog-modal-footer">
                <button type="button" className="prog-btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="prog-btn-submit">
                  <FontAwesomeIcon icon={faCheck} className="me-2" />
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Progress;
