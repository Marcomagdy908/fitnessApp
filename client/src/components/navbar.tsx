import { Col, Row } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faBell, faUser } from "@fortawesome/free-solid-svg-icons";
import "../css/navbar.css";
import { useEffect, useState } from "react";
function Navbar() {
  const [user, setUser] = useState({
    name: "",
    email: "",
  });
  const [avatar, setAvatar] = useState("https://cdn-icons-png.flaticon.com/512/149/149071.png");
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        setUser(data.user);
        if(data.user.avatar) setAvatar(data.user.avatar);
      });
  }, []);
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
        <img src={avatar} alt="" className="user-icon ms-4 rounded-circle" style={{width: "40px", height: "40px"}} />
        </Col>
      </Row>
    </>
  );
}

export default Navbar;
