import { Col, Row } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faBell, faMoon, faSun, faCrown } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import "../css/navbar.css";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

function Navbar() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const avatar = user?.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png";
  return (
    <>
      <Row className="navbar-container">
        <Col className="d-flex align-items-center">
          <div className="search-box">
            <FontAwesomeIcon icon={faSearch} className="search-icon" />
            <input type="text" placeholder="Search" className="search-input" />
          </div>
        </Col>
        <Col className="d-flex align-items-center justify-content-end" style={{ paddingRight: "20px", fontSize: "20px" }}>
          <Link to="/subscription" className="me-4 d-flex align-items-center" style={{ textDecoration: 'none', color: 'var(--accent-gold)', fontSize: '0.9rem', fontWeight: '800' }}>
            <FontAwesomeIcon icon={faCrown} className="me-2" />
            MEMBERSHIP
          </Link>
          <button 
            onClick={toggleTheme} 
            className="theme-toggle-btn me-3" 
            style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            <FontAwesomeIcon icon={theme === 'dark' ? faSun : faMoon} />
          </button>
          <FontAwesomeIcon icon={faBell} className="notification-icon" />
          <img src={avatar} alt="" className="user-icon ms-4 rounded-circle" style={{ width: "40px", height: "40px" }} />
        </Col>
      </Row>
    </>
  );
}

export default Navbar;
