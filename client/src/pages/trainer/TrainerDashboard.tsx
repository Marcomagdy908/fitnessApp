import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faDumbbell,
  faCalendarCheck,
  faChartLine,

  faBullseye,
  faAppleWhole,
  faLayerGroup,
  faCrown,
  faBell,
  faCheckCircle,
  faExclamationTriangle,
  faArrowTrendUp,
} from "@fortawesome/free-solid-svg-icons";
import { api } from "../../utils/api";
import "../../css/trainer.css";

const iconMap: any = {
  faUsers,
  faDumbbell,
  faCalendarCheck,
  faCrown,
};

export default function TrainerDashboard() {
  const navigate = useNavigate();


  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [weeklyActivity, setWeeklyActivity] = useState<any[]>([]);

  useEffect(() => {
    api.get("/api/pt-clients/dashboard")
      .then(res => {
        if (res.data.success) {
          setStats(res.data.data.stats);
          setClients(res.data.data.clients);
          setAlerts(res.data.data.alerts);
          setWeeklyActivity(res.data.data.weeklyActivity);
        }
      })
      .catch(err => console.error("Failed to fetch trainer dashboard data:", err))
      .finally(() => setLoading(false));
  }, []);

  const actions = [
    { label: "Add Exercise", icon: faDumbbell, description: "Create a new workout exercise", path: "/exercises" },
    { label: "Create Plan", icon: faLayerGroup, description: "Build a full training plan", path: "/trainer/plans" },
    { label: "Add Diet Plan", icon: faAppleWhole, description: "Add nutrition plan for client", path: "/trainer/diet" },
  ];

  const handleAction = (item: any) => {
    navigate(item.path, { state: { openCreate: true } });
  };

  return (
    <div className="tr-dashboard-wrapper">

      {/* ── Header ── */}
      <div className="tr-dash-header">
        <div>
          <h1 className="tr-dash-title">Trainer Dashboard</h1>
          <p className="tr-dash-subtitle">Welcome back, Coach! Here's today's overview.</p>
        </div>
        <div className="tr-dash-header-badge">
          <FontAwesomeIcon icon={faArrowTrendUp} />
          <span>Performance: Excellent</span>
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className="tr-dash-stats-row">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div className="tr-dash-stat-card tr-dash-stat-skeleton" key={i} />
          ))
        ) : (
          stats.map((s, i) => (
            <div className={`tr-dash-stat-card tr-dash-stat-${s.color}`} key={i} style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="tr-dash-stat-icon">
                <FontAwesomeIcon icon={iconMap[s.icon] || faDumbbell} />
              </div>
              <div className="tr-dash-stat-value">{s.value}</div>
              <div className="tr-dash-stat-label">{s.label}</div>
            </div>
          ))
        )}
      </div>

      {/* ── Main Grid ── */}
      <div className="tr-dash-grid">

        {/* LEFT — Clients */}
        <div className="tr-dash-col tr-dash-col-wide">
          <div className="tr-dash-card">
            <div className="tr-dash-card-title">
              <FontAwesomeIcon icon={faUsers} /> Clients
            </div>
            <div className="tr-clients-table">
              <div className="tr-clients-table-header">
                <span>Client</span>
                <span>Plan</span>
                <span>Progress</span>
                <span>Tier</span>
              </div>
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <div className="tr-client-row-skeleton" key={i} />
                ))
              ) : (
                clients.map((c, i) => (
                  <div className="tr-client-row" key={i} style={{ animationDelay: `${0.2 + i * 0.1}s` }}>
                    <div className="tr-client-row-name">
                      <div className="tr-client-avatar">{c.initials}</div>
                      <span>{c.name}</span>
                    </div>
                    <span className="tr-client-plan-label">{c.plan}</span>
                    <div className="tr-client-progress-wrap">
                      <div className="tr-client-progress-bar">
                        <div className="tr-client-progress-fill" style={{ width: `${c.progress}%` }} />
                      </div>
                      <span className="tr-client-progress-pct">{c.progress}%</span>
                    </div>
                    <span className={`tr-client-tier tr-client-tier-${c.membership}`}>{c.membership}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Stats card */}
          <div className="tr-dash-card tr-dash-chart-card">
            <div className="tr-dash-card-title">
              <FontAwesomeIcon icon={faChartLine} /> Weekly Activity
            </div>
            <div className="tr-mini-chart">
              {loading ? (
                [...Array(7)].map((_, i) => (
                  <div className="tr-mini-chart-bar-skeleton" key={i} />
                ))
              ) : (
                weeklyActivity.map((a, i) => (
                  <div className="tr-mini-chart-bar-wrap" key={i}>
                    <div
                      className="tr-mini-chart-bar"
                      style={{ height: `${a.pct}%`, animationDelay: `${0.3 + i * 0.08}s` }}
                    />
                    <span className="tr-mini-chart-label">{a.label}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT — Alerts + Actions */}
        <div className="tr-dash-col">

          {/* Alerts */}
          <div className="tr-dash-card">
            <div className="tr-dash-card-title">
              <FontAwesomeIcon icon={faBell} /> Alerts
            </div>
            <div className="tr-alerts-list">
              {loading ? (
                [...Array(2)].map((_, i) => (
                  <div className="tr-alert-skeleton" key={i} />
                ))
              ) : (
                alerts.map((a, i) => (
                  <div className={`tr-alert-item tr-alert-${a.type}`} key={i} style={{ animationDelay: `${0.2 + i * 0.1}s` }}>
                    <FontAwesomeIcon
                      icon={a.type === "success" ? faCheckCircle : faExclamationTriangle}
                      className="tr-alert-icon"
                    />
                    <span>{a.text}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="tr-dash-card">
            <div className="tr-dash-card-title">
              <FontAwesomeIcon icon={faBullseye} /> Quick Actions
            </div>
            <div className="tr-actions-list">
              {actions.map((a, i) => (
                <button
                  key={i}
                  className="tr-action-btn"
                  style={{ animationDelay: `${0.3 + i * 0.1}s` }}
                  onClick={() => handleAction(a)}
                >
                  <div className="tr-action-btn-icon">
                    <FontAwesomeIcon icon={a.icon} />
                  </div>
                  <div className="tr-action-btn-text">
                    <span className="tr-action-btn-label">{a.label}</span>
                    <span className="tr-action-btn-desc">{a.description}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>


    </div>
  );
}
