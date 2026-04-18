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
} from "@fortawesome/free-solid-svg-icons";
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

/* ─── Mock data ─────────────────────────────────── */
const weeklyData = [
  { day: "Mon", sessions: 4 },
  { day: "Tue", sessions: 0 },
  { day: "Wed", sessions: 5 },
  { day: "Thu", sessions: 3 },
  { day: "Fri", sessions: 6 },
  { day: "Sat", sessions: 2 },
  { day: "Sun", sessions: 0 },
];

const monthlyVolume = [
  { week: "Wk 1", volume: 14 },
  { week: "Wk 2", volume: 18 },
  { week: "Wk 3", volume: 12 },
  { week: "Wk 4", volume: 20 },
];

const muscleDonut = [
  { name: "Legs", value: 35 },
  { name: "Core", value: 28 },
  { name: "Chest", value: 20 },
  { name: "Back", value: 12 },
  { name: "Arms", value: 5 },
];

const muscleRadial = [
  { name: "Legs", value: 90, fill: "#3dffff" },
  { name: "Core", value: 75, fill: "#00bfff" },
  { name: "Chest", value: 60, fill: "#7b61ff" },
  { name: "Back", value: 45, fill: "#ff6b6b" },
];

const COLORS = ["#3dffff", "#a98dff", "#00bfff", "#ff6b6b", "#ffd166"];

const records = [
  { exercise: "Squats", best: "4 × 15", date: "Feb 24" },
  { exercise: "Push-Ups", best: "3 × 12", date: "Feb 22" },
  { exercise: "Lunges", best: "3 × 10", date: "Feb 24" },
  { exercise: "Plank", best: "3 × 45s", date: "Feb 20" },
  { exercise: "Crunches", best: "3 × 20", date: "Feb 22" },
];

const ttStyle = {
  background: "#0d0d0d",
  border: "1px solid rgba(61,255,255,0.2)",
  borderRadius: 10,
  fontSize: "0.72rem",
  color: "#ccc",
};

/* ─── Reusable card shell ────────────────────────── */
function PCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: any;
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
  return (
    <div className="progress-page">
      {/* Page heading */}
      <h1 className="prog-page-title">
        <FontAwesomeIcon
          icon={faChartLine}
          className="me-2"
          style={{ color: "#3dffff" }}
        />
        Progress
      </h1>

      {/* ── Row 1: stat pills ── */}
      <Row className="g-3 mb-3">
        {[
          {
            icon: faFire,
            label: "Current Streak",
            value: "6 days",
            color: "#ff6b6b",
          },
          {
            icon: faCalendarCheck,
            label: "Sessions / Month",
            value: "18",
            color: "#3dffff",
          },
          {
            icon: faLayerGroup,
            label: "Total Exercises",
            value: "90",
            color: "#a98dff",
          },
          {
            icon: faClock,
            label: "Avg. Duration",
            value: "42 min",
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
                  stroke="rgba(255,255,255,0.05)"
                  vertical={false}
                />
                <XAxis
                  dataKey="day"
                  tick={{ fill: "#555", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#555", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={ttStyle}
                  formatter={(v) => [`${v} exercises`, ""]}
                  cursor={{ fill: "rgba(61,255,255,0.05)" }}
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
                  data={muscleDonut}
                  cx="50%"
                  cy="50%"
                  innerRadius={38}
                  outerRadius={60}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {muscleDonut.map((_, i) => (
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
              {muscleDonut.map((m, i) => (
                <div className="prog-legend-item" key={m.name}>
                  <span
                    className="prog-legend-dot"
                    style={{ background: COLORS[i] }}
                  />
                  <span>{m.name}</span>
                  <span style={{ color: COLORS[i], marginLeft: "auto" }}>
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
                    <stop offset="5%" stopColor="#a98dff" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#a98dff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  stroke="rgba(255,255,255,0.05)"
                  vertical={false}
                />
                <XAxis
                  dataKey="week"
                  tick={{ fill: "#555", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#555", fontSize: 11 }}
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
                  stroke="#a98dff"
                  strokeWidth={2.5}
                  fill="url(#areaGrad)"
                  dot={{ fill: "#a98dff", r: 4, strokeWidth: 0 }}
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
                data={muscleRadial}
                startAngle={180}
                endAngle={-180}
              >
                <RadialBar
                  dataKey="value"
                  background={{ fill: "rgba(255,255,255,0.04)" } as object}
                />
                <Tooltip
                  contentStyle={ttStyle}
                  formatter={(v) => [`${v}%`, ""]}
                />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="prog-legend">
              {muscleRadial.map((m) => (
                <div className="prog-legend-item" key={m.name}>
                  <span
                    className="prog-legend-dot"
                    style={{ background: m.fill }}
                  />
                  <span>{m.name}</span>
                  <span style={{ color: m.fill, marginLeft: "auto" }}>
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
              {records.map((r, i) => (
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
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => {
                const done = [0, 2, 3, 4, 5].includes(i);
                const today = i === 5;
                return (
                  <div
                    key={d}
                    className={`prog-heat-day ${done ? "prog-heat-done" : "prog-heat-rest"} ${today ? "prog-heat-today" : ""}`}
                  >
                    <div className="prog-heat-label">{d}</div>
                    <div className="prog-heat-dot">{done ? "✓" : "–"}</div>
                  </div>
                );
              })}
            </div>
            <div className="prog-cstats">
              <div className="prog-cstat">
                <div className="prog-cstat-val">5/7</div>
                <div className="prog-cstat-label">Days Hit</div>
              </div>
              <div className="prog-cstat">
                <div className="prog-cstat-val">71%</div>
                <div className="prog-cstat-label">Adherence</div>
              </div>
              <div className="prog-cstat">
                <div className="prog-cstat-val">🔥6</div>
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
                  current: 18,
                  target: 20,
                  pct: 90,
                  color: "#3dffff",
                },
                {
                  label: "Exercises",
                  current: 90,
                  target: 100,
                  pct: 90,
                  color: "#a98dff",
                },
                {
                  label: "Streak Days",
                  current: 6,
                  target: 10,
                  pct: 60,
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
    </div>
  );
}

export default Progress;
