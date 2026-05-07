import { useState, useRef, useEffect } from "react";
import { Col, Row } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faBell, faMoon, faSun, faUser, faCog, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom";
import "../css/navbar.css";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const avatar = user?.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
  };

  const goToSettings = () => {
    setDropdownOpen(false);
    navigate("/settings");
  };

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
          <button 
            onClick={toggleTheme} 
            className="theme-toggle-btn me-3" 
            style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            <FontAwesomeIcon icon={theme === 'dark' ? faSun : faMoon} />
          </button>
          <FontAwesomeIcon icon={faBell} className="notification-icon me-4" />
          
          <div className="avatar-container" ref={dropdownRef}>
            <img 
              src={avatar} 
              alt="User" 
              className="user-icon rounded-circle" 
              style={{ width: "40px", height: "40px" }} 
              onClick={() => setDropdownOpen(!dropdownOpen)}
            />
            
            {dropdownOpen && (
              <div className="avatar-dropdown">
                <div className="dropdown-header">
                  <span className="header-name">{user?.name || "User"}</span>
                  <span className="header-email">{user?.email || ""}</span>
                </div>
                
                <Link to="/settings" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                  <FontAwesomeIcon icon={faUser} />
                  <span>Profile</span>
                </Link>
                
                <button className="dropdown-item" onClick={goToSettings}>
                  <FontAwesomeIcon icon={faCog} />
                  <span>Settings</span>
                </button>
                
                <div className="dropdown-divider"></div>
                
                <button className="dropdown-item logout" onClick={handleLogout}>
                  <FontAwesomeIcon icon={faSignOutAlt} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </Col>
      </Row>
    </>
  );
}

export default Navbar;
