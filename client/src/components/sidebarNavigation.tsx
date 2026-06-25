import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClipboardList,
  faCog,
  faDumbbell,
  faHome,
  faBars,
  faTimes,
  faUtensils,
  faCrown,
  faCalendarCheck,
  faCalendarPlus,
} from "@fortawesome/free-solid-svg-icons";
import { Container } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "../css/index.css";
import "../css/sidebarNavigation.css";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { faUserShield } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

function SidebarNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  const settingsPath =
    user?.role === "ADMIN"
      ? "/settings"
      : user?.role === "TRAINER"
        ? `/trainer/${user?.trainerId}`
        : "/settings";
  const userMenu = [
    { name: "Dashboard", icon: faHome, path: "/" },
    { name: "Exercises", icon: faDumbbell, path: "/exercises" },
    { name: "Diet", icon: faUtensils, path: "/diet" },
    { name: "Bookings", icon: faCalendarCheck, path: "/bookings" },
    { name: "Plans", icon: faClipboardList, path: "/plans" },
    { name: "Membership", icon: faCrown, path: "/subscription" },
  ];

  const trainerMenu = [
    { name: "Dashboard", icon: faHome, path: "/trainer" },
    { name: "Exercises", icon: faDumbbell, path: "/exercises" },
    { name: "Classes", icon: faCalendarPlus, path: "/trainer/classes" },
    { name: "Diet", icon: faUtensils, path: "/trainer/diet" },
    { name: "Plans", icon: faClipboardList, path: "/trainer/plans" },
    { name: "Profile", icon: faCog, path: settingsPath },
  ];

  const adminMenu = [
    { name: "Admin", icon: faUserShield, path: "/admin" },
  ];
  const navigationList =
    user?.role === "ADMIN"
      ? adminMenu
      : user?.role === "TRAINER"
        ? trainerMenu
        : userMenu;
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
      <Link to="/" className="lp-nav-brand">
        <div className="lp-nav-icon">
          <img src="/vite.svg" alt="logo" style={{ width: "24px", height: "24px" }} />
        </div>
        <span className="lp-nav-name">
          Fit<span>Forge</span>
        </span>
      </Link>
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
        <FontAwesomeIcon icon={item.icon} size="2xl" />
        <h6 className="logo nav-label">{item.name}</h6>
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
        <FontAwesomeIcon icon={item.icon} />
        <span className="bottom-nav-label">{item.name}</span>
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
      <nav className="bottom-nav">{BottomNav}</nav>
    </>
  );
}

export default SidebarNavigation;
