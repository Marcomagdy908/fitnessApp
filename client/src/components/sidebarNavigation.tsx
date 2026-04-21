import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBoltLightning,
  faChartLine,
  faClipboardList,
  faCog,
  faDumbbell,
  faHome,
  faBars,
  faTimes,
  faUtensils,
  faCrown,
  faUserTie,
  faBowlFood,
  faPersonRunning,
} from "@fortawesome/free-solid-svg-icons";
import { Container } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "../css/index.css";
import "../css/sidebarNavigation.css";
import { useNavigate, useLocation } from "react-router-dom";

function SidebarNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navigationList = [
    { name: "Dashboard", icon: faHome, path: "/" },
    { name: "Exercises", icon: faDumbbell, path: "/exercises" },
    { name: "Progress", icon: faChartLine, path: "/progress" },
    { name: "Plans", icon: faClipboardList, path: "/plans" },
    { name: "Diet", icon: faUtensils, path: "/diet" },
    { name: "Meals", icon: faBowlFood, path: "/meals" },
    { name: "Exercise", icon: faPersonRunning, path: "/exercise" },
    { name: "Trainers", icon: faUserTie, path: "/trainers" },
    { name: "Membership", icon: faCrown, path: "/subscription" },
    { name: "Settings", icon: faCog, path: "/settings" },
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsOpen(false); // close overlay on navigation
  };

  const logo = (
    <Container
      fluid
      className="logo-container d-flex justify-content-center align-items-center"
      style={{ top: "0", cursor: "pointer" }}
      onClick={() => handleNavigate("/")}
    >
      <FontAwesomeIcon icon={faBoltLightning} size="2xl" />
      <h2 className="logo">ApexTrack</h2>
    </Container>
  );

  const NavigationList = navigationList.map((item) => {
    const active = location.pathname === item.path;
    return (
      <Container
        key={item.name}
        fluid
        className={`navigation-container d-flex justify-content-start align-items-center gap-2 m-2${active ? " isActive" : ""}`}
        style={{ top: "0", cursor: "pointer" }}
        onClick={() => handleNavigate(item.path)}
      >
        <FontAwesomeIcon
          icon={item.icon}
          size="2xl"
        />
        <h6 className="logo nav-label">
          {item.name}
        </h6>
      </Container>
    );
  });

  /* ── Bottom nav (mobile ≤768px) ── */
  const BottomNav = navigationList.map((item) => {
    const active = location.pathname === item.path;
    return (
      <button
        key={item.name}
        className={`bottom-nav-item${active ? " isActive" : ""}`}
        onClick={() => handleNavigate(item.path)}
        aria-label={item.name}
      >
        <FontAwesomeIcon
          icon={item.icon}
        />
        <span className="bottom-nav-label">
          {item.name}
        </span>
      </button>
    );
  });

  return (
    <>
      {/* ── Hamburger toggle button (768-1200px) ── */}
      <button
        className="sidebar-toggle-btn"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Toggle navigation"
      >
        <FontAwesomeIcon icon={isOpen ? faTimes : faBars} />
      </button>

      {/* ── Backdrop (closes overlay on outside click) ── */}
      {isOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar (desktop always-on / overlay on medium screens) ── */}
      <div className={`sidebar-container${isOpen ? " sidebar-open" : ""}`}>
        {logo}
        <Container className="navigation-list-container d-flex flex-column">
          {NavigationList}
        </Container>
      </div>

      {/* ── Mobile bottom navigation (≤768px) ── */}
      <nav className="bottom-nav">
        {BottomNav}
      </nav>
    </>
  );
}

export default SidebarNavigation;
