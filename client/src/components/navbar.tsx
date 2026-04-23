import { Col, Row } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faBell } from "@fortawesome/free-solid-svg-icons";
import "../css/navbar.css";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user } = useAuth();
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
        <Col className="d-flex align-items-center justify-content-end" style={{paddingRight: "20px",fontSize:"20px"}}>
        <FontAwesomeIcon icon={faBell} className="notification-icon" />
        <img src={avatar} alt="" className="user-icon ms-4 rounded-circle" style={{width: "40px", height: "40px"}} />
        </Col>
      </Row>
    </>
  );
}

export default Navbar;
