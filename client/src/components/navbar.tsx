import { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faMoon, faSun, faUser, faCog, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom";
import "../css/navbar.css";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useSearch } from "../context/SearchContext";

function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { searchQuery, setSearchQuery } = useSearch();
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
    <nav className="navbar-container">
      <div className="search-box">
        <FontAwesomeIcon icon={faSearch} className="search-icon" />
        <input 
          type="text" 
          placeholder="Search" 
          className="search-input" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="nav-actions">
        <button 
          onClick={toggleTheme} 
          className="nav-btn theme-toggle-btn" 
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          <FontAwesomeIcon icon={theme === 'dark' ? faSun : faMoon} />
        </button>
        <button onClick={goToSettings} className="nav-btn settings-btn" title="Settings">
          <FontAwesomeIcon icon={faCog} />
        </button>
        
        <div className="avatar-container" ref={dropdownRef}>
          <img 
            src={avatar} 
            alt="User" 
            className="user-icon rounded-circle" 
            style={{ width: "38px", height: "38px" }} 
            onClick={() => setDropdownOpen(!dropdownOpen)}
          />
          
          {dropdownOpen && (
            <div className="avatar-dropdown">
              <div className="dropdown-header">
                <span className="header-name">{user?.name || "User"}</span>
                <span className="header-email">{user?.email || ""}</span>
              </div>
              
              <Link to="/settings" className="avatar-dropdown-item" onClick={() => setDropdownOpen(false)}>
                <FontAwesomeIcon icon={faUser} />
                <span>Profile</span>
              </Link>
              
              <button className="avatar-dropdown-item" onClick={goToSettings}>
                <FontAwesomeIcon icon={faCog} />
                <span>Settings</span>
              </button>
              
              <div className="dropdown-divider"></div>
              
              <button className="avatar-dropdown-item logout" onClick={handleLogout}>
                <FontAwesomeIcon icon={faSignOutAlt} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
