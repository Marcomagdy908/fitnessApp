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
} from "@fortawesome/free-solid-svg-icons";
import "../../css/trainerDashboard.css";

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
    { label: "Total Clients", value: 28, icon: faUsers },
    { label: "Active Plans", value: 16, icon: faDumbbell },
    { label: "Today Sessions", value: 7, icon: faCalendarCheck },
    { label: "Membership Users", value: 12, icon: faCrown },
  ];

  const clients = [
    { name: "Ahmed Ali", plan: "Fat Loss", progress: 70, membership: "pro" },
    {
      name: "Sara Mohamed",
      plan: "Muscle Gain",
      progress: 45,
      membership: "basic",
    },
    {
      name: "Omar Khaled",
      plan: "Maintenance",
      progress: 90,
      membership: "elite",
    },
  ];

  const alerts = [
    "Sara missed yesterday workout",
    "2 subscriptions expire soon",
    "Ahmed close to goal",
  ];

  const actions = [
    {
      label: "Add Exercise",
      icon: faDumbbell,
      description: "Create a new workout exercise",
    },
    {
      label: "Create Plan",
      icon: faLayerGroup,
      description: "Build a full training plan",
    },
    {
      label: "Add Diet Plan",
      icon: faAppleWhole,
      description: "Add nutrition plan for client",
    },
  ];

  const openModal = (item: ActionItem) => {
    setModal({
      open: true,
      type: item.label,
      data: item,
    });
  };
  return (
    <div className="dashboard-wrapper">
      <div className="dash-grid">
        {/* LEFT */}
        <div className="dash-col">
          <div className="dash-card">
            <div className="dash-card-title">
              <FontAwesomeIcon icon={faChartLine} /> Overview
            </div>

            <div className="stat-row">
              {stats.map((s, i) => (
                <div className="stat-box" key={i}>
                  <div className="stat-label">{s.label}</div>
                  <div className="stat-value">{s.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="dash-card">
            <div className="dash-card-title">
              <FontAwesomeIcon icon={faBullseye} /> Quick Actions
            </div>

            {actions.map((a, i) => (
              <button
                key={i}
                className="timer-btn"
                style={{ width: "100%", marginBottom: "0.6rem" }}
                onClick={() => openModal(a)}
              >
                <FontAwesomeIcon icon={a.icon} /> {a.label}
              </button>
            ))}
          </div>
        </div>

        {/* CENTER */}
        <div className="dash-col">
          <div className="dash-card">
            <div className="dash-card-title">
              <FontAwesomeIcon icon={faUsers} /> Clients
            </div>

            {clients.map((c, i) => (
              <div className="history-row" key={i}>
                <div className="history-name">{c.name}</div>
                <div className="history-meta">{c.plan}</div>
                <div className="history-meta">{c.progress}%</div>
                <div className="history-meta">{c.membership}</div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT */}
        <div className="dash-col">
          <div className="dash-card">
            <div className="dash-card-title">
              <FontAwesomeIcon icon={faFire} /> Alerts
            </div>

            {alerts.map((a, i) => (
              <div className="history-row" key={i}>
                <div className="history-name">{a}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ================= MODAL ================= */}
      {modal.open && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2>{modal.type}</h2>

            <p style={{ fontSize: "0.85rem", opacity: 0.7 }}>
              {modal.data?.description}
            </p>

            {/* FORM */}
            <div className="modal-form">
              <label>Name</label>
              <input type="text" placeholder="Enter name" />

              <label>Description</label>
              <textarea placeholder="Enter details" />

              <label>Category</label>
              <input type="text" placeholder="e.g Chest / Fat Loss" />
            </div>
            {/* ACTIONS */}
            <div className="modal-actions">
              <button
                onClick={() => setModal({ open: false, type: "", data: null })}
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  console.log("Saved:", modal);
                  setModal({ open: false, type: "", data: null });
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
