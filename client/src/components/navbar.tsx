import { Col, Row } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faBell, faUser } from "@fortawesome/free-solid-svg-icons";
import "../css/navbar.css";
function Navbar() {
  const user = {
    name: "John Doe",
    email: "[EMAIL_ADDRESS]",
    avatar: "https://i.pravatar.cc/150?img=12",
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
        <Col className="d-flex align-items-center justify-content-end" style={{paddingRight: "20px",color:"white",fontSize:"20px"}}>
        <FontAwesomeIcon icon={faBell} className="notification-icon" />
        <img src={user.avatar} alt="" className="user-icon ms-4 rounded-circle" style={{width: "40px", height: "40px"}} />
        </Col>
      </Row>
    </>
  );
}

export default Navbar;
