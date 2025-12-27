import "./Navbar.css";
import React, { useContext, useState } from "react";
import { Context } from "../../main";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { GiHamburgerMenu } from "react-icons/gi";
import { AiOutlineClose } from "react-icons/ai";

const Navbar = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const { isAuthorized, setIsAuthorized, user } = useContext(Context);
  const navigateTo = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await axios.get("http://localhost:4000/api/v1/user/logout", {
        withCredentials: true,
      });
      toast.success(response.data.message);
      setIsAuthorized(false);
      navigateTo("/login");
    } catch (error) {
      toast.error(error.response.data.message);
      setIsAuthorized(true);
    }
  };

  return (
    <nav className={isAuthorized ? "navbarShow" : "navbarHide"}>
      <div className="navbar-container">
        {/* Left: Logo */}
        <div className="logo">
          <img src="/careerconnect-white.png" alt="logo" />
        </div>

        {/* Center: Navigation Menu */}
        <ul className={!showMenu ? "menu" : "show-menu menu"}>
          <li><Link to="/" onClick={() => setShowMenu(false)}>HOME</Link></li>
          <li><Link to="/job/getall" onClick={() => setShowMenu(false)}>ALL JOBS</Link></li>
          <li>
            <Link to="/applications/me" onClick={() => setShowMenu(false)}>
              {user?.role === "Employer" ? "APPLICANT'S APPLICATIONS" : "MY APPLICATIONS"}
            </Link>
          </li>

          {user?.role === "Employer" && (
            <>
              <li><Link to="/job/post" onClick={() => setShowMenu(false)}>POST NEW JOB</Link></li>
              <li><Link to="/job/me" onClick={() => setShowMenu(false)}>VIEW YOUR JOBS</Link></li>
            </>
          )}

          {user?.role === "Job Seeker" && (
            <>
              <li><Link to="/resume-match" onClick={() => setShowMenu(false)}>MATCH MY RESUME</Link></li>
              <li><Link to="/saved-jobs" onClick={() => setShowMenu(false)}>SAVED JOBS</Link></li>
            </>
          )}
        </ul>

        {/* Right: Avatar and Hamburger */}
        <div className="right-side">
          <div className="profile-dropdown">
            <div className="avatar" onClick={() => setShowDropdown(!showDropdown)}>
              <img
                src={user?.avatar?.url || "/default-avatar.png"}
                alt="Profile"
                className="avatar-img"
              />
            </div>

            {showDropdown && (
              <div className="dropdown-menu">
                <Link to="/edit-profile">✏️ Edit Profile</Link>
                <button onClick={handleLogout}>🚪 Logout</button>
              </div>
            )}
          </div>

          <div className="hamburger" onClick={() => setShowMenu(!showMenu)}>
            {showMenu ? <AiOutlineClose /> : <GiHamburgerMenu />}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
