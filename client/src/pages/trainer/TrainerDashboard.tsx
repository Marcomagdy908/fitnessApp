import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faDumbbell,
  faCalendarCheck,
  faChartLine,
  faFire,
  faBullseye,
  faAppleWhole,
  faLayerGroup,
  faCrown,
  faBell,
  faCheckCircle,
  faExclamationTriangle,
  faArrowTrendUp,
} from "@fortawesome/free-solid-svg-icons";
import "../../css/trainer.css";

export default function TrainerDashboard() {
  type ModalState = {
    open: boolean;
    type: string;
    data: ActionItem | null;
  };
  type ActionItem = {
    label: string;
    description: string;
  };

  const [modal, setModal] = useState<ModalState>({
    open: false,
    type: "",
    data: null,
  });

  const stats = [
    { label: "Total Clients", value: 28, icon: faUsers, color: "cyan" },
    { label: "Active Plans", value: 16, icon: faDumbbell, color: "purple" },
    { label: "Today Sessions", value: 7, icon: faCalendarCheck, color: "green" },
    { label: "Premium Members", value: 12, icon: faCrown, color: "gold" },
  ];

  const clients = [
    { name: "Ahmed Ali", plan: "Fat Loss", progress: 70, membership: "pro", initials: "AA" },
    { name: "Sara Mohamed", plan: "Muscle Gain", progress: 45, membership: "basic", initials: "SM" },
    { name: "Omar Khaled", plan: "Maintenance", progress: 90, membership: "elite", initials: "OK" },
  ];

  const alerts = [
    { text: "Sara missed yesterday workout", type: "warning" },
    { text: "2 subscriptions expire soon", type: "danger" },
    { text: "Ahmed is close to goal", type: "success" },
  ];

  const actions = [
    { label: "Add Exercise", icon: faDumbbell, description: "Create a new workout exercise" },
    { label: "Create Plan", icon: faLayerGroup, description: "Build a full training plan" },
    { label: "Add Diet Plan", icon: faAppleWhole, description: "Add nutrition plan for client" },
  ];

  const openModal = (item: ActionItem) => {
    setModal({ open: true, type: item.label, data: item });
  };

  return (
    <div className="dashboard-wrapper">

      {/* ── Header ── */}
      <div className="dash-header">
        <div>
          <h1 className="dash-title">Trainer Dashboard</h1>
          <p className="dash-subtitle">Welcome back, Coach! Here's today's overview.</p>
        </div>
        <div className="dash-header-badge">
          <FontAwesomeIcon icon={faArrowTrendUp} />
          <span>Performance: Excellent</span>
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className="dash-stats-row">
        {stats.map((s, i) => (
          <div className={`dash-stat-card dash-stat-${s.color}`} key={i} style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="dash-stat-icon">
              <FontAwesomeIcon icon={s.icon} />
            </div>
            <div className="dash-stat-value">{s.value}</div>
            <div className="dash-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Main Grid ── */}
      <div className="dash-grid">

        {/* LEFT — Clients */}
        <div className="dash-col dash-col-wide">
          <div className="dash-card">
            <div className="dash-card-title">
              <FontAwesomeIcon icon={faUsers} /> Clients
            </div>
            <div className="clients-table">
              <div className="clients-table-header">
                <span>Client</span>
                <span>Plan</span>
                <span>Progress</span>
                <span>Tier</span>
              </div>
              {clients.map((c, i) => (
                <div className="client-row" key={i} style={{ animationDelay: `${0.2 + i * 0.1}s` }}>
                  <div className="client-row-name">
                    <div className="client-avatar">{c.initials}</div>
                    <span>{c.name}</span>
                  </div>
                  <span className="client-plan-label">{c.plan}</span>
                  <div className="client-progress-wrap">
                    <div className="client-progress-bar">
                      <div className="client-progress-fill" style={{ width: `${c.progress}%` }} />
                    </div>
                    <span className="client-progress-pct">{c.progress}%</span>
                  </div>
                  <span className={`client-tier client-tier-${c.membership}`}>{c.membership}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats card */}
          <div className="dash-card dash-chart-card">
            <div className="dash-card-title">
              <FontAwesomeIcon icon={faChartLine} /> Weekly Activity
            </div>
            <div className="mini-chart">
              {[40, 65, 50, 80, 70, 90, 55].map((h, i) => (
                <div className="mini-chart-bar-wrap" key={i}>
                  <div
                    className="mini-chart-bar"
                    style={{ height: `${h}%`, animationDelay: `${0.3 + i * 0.08}s` }}
                  />
                  <span className="mini-chart-label">
                    {["M", "T", "W", "T", "F", "S", "S"][i]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT — Alerts + Actions */}
        <div className="dash-col">

          {/* Alerts */}
          <div className="dash-card">
            <div className="dash-card-title">
              <FontAwesomeIcon icon={faBell} /> Alerts
            </div>
            <div className="alerts-list">
              {alerts.map((a, i) => (
                <div className={`alert-item alert-${a.type}`} key={i} style={{ animationDelay: `${0.2 + i * 0.1}s` }}>
                  <FontAwesomeIcon
                    icon={a.type === "success" ? faCheckCircle : faExclamationTriangle}
                    className="alert-icon"
                  />
                  <span>{a.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="dash-card">
            <div className="dash-card-title">
              <FontAwesomeIcon icon={faBullseye} /> Quick Actions
            </div>
            <div className="actions-list">
              {actions.map((a, i) => (
                <button
                  key={i}
                  className="action-btn"
                  style={{ animationDelay: `${0.3 + i * 0.1}s` }}
                  onClick={() => openModal(a)}
                >
                  <div className="action-btn-icon">
                    <FontAwesomeIcon icon={a.icon} />
                  </div>
                  <div className="action-btn-text">
                    <span className="action-btn-label">{a.label}</span>
                    <span className="action-btn-desc">{a.description}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ── Modal ── */}
      {modal.open && (
        <div className="modal-overlay" onClick={() => setModal({ open: false, type: "", data: null })}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2>{modal.type}</h2>
            <p style={{ fontSize: "0.85rem", opacity: 0.6, marginBottom: "1rem" }}>
              {modal.data?.description}
            </p>
            <div className="modal-form">
              <label>Name</label>
              <input type="text" placeholder="Enter name" />
              <label>Description</label>
              <textarea placeholder="Enter details" />
              <label>Category</label>
              <input type="text" placeholder="e.g Chest / Fat Loss" />
            </div>
            <div className="modal-actions">
              <button onClick={() => setModal({ open: false, type: "", data: null })}>Cancel</button>
              <button onClick={() => { console.log("Saved:", modal); setModal({ open: false, type: "", data: null }); }}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
