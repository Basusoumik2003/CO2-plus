import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  FaLeaf, FaBars, FaUsers, FaBlog, FaBriefcase,
  FaBookOpen, FaInfoCircle, FaEnvelope, FaUserPlus, FaUserTie
} from 'react-icons/fa';
import '../styles/Navbar.css';
import { toast } from 'react-toastify';

const Navbar = ({ openLoginPopup, openSignupPopup }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem("token");

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSidebarItemClick = (callback) => {
    if (callback) callback();
    setSidebarOpen(false); // close sidebar
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setSidebarOpen(false);
      }
    };

    if (sidebarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [sidebarOpen]);

  return (
    <>
      <nav className="home-navbar">
        <div className="navbar-left">
          <FaBars className="menu-icon" onClick={handleSidebarToggle} style={{ fontSize: '1.8rem' }} />
          <img src="/GoCarbonPositive_LOGO.svg" alt="Carbon Credit Logo" className="logo-icon" />
          <span className="logo-text">Carbon Positive</span>
        </div>

        <div className="navbar-right">
          <FaUserTie
            className="menu-icon"
            style={{ fontSize: '1.8rem', cursor: 'pointer', color: '#2e7d32' }}
            onClick={openLoginPopup}
          />
        </div>
      </nav>

      {sidebarOpen && (
        <div ref={sidebarRef} className="sidebar-dropdown">
          {isAuthenticated ? (
            <div
              className="sidebar-item"
              onClick={() => handleSidebarItemClick(() => navigate('/userDashboard'))}
            >
              <FaUserTie className="sidebar-icon" color="#2e7d32" />
              <span>Dashboard</span>
            </div>
          ) : (
            <div
              className="sidebar-item"
              onClick={() => handleSidebarItemClick(() => {
                toast.info("Please log in or sign up first");
                openLoginPopup();
              })}
            >
              <FaUserTie className="sidebar-icon" color="#2e7d32" />
              <span>Dashboard</span>
            </div>
          )}

          <NavLink
            to="/community"
            className="sidebar-item"
            onClick={() => handleSidebarItemClick()}
          >
            <FaUsers className="sidebar-icon" color="#28a745" />
            <span>Community</span>
          </NavLink>

          <NavLink
            to="/blog"
            className="sidebar-item"
            onClick={() => handleSidebarItemClick()}
          >
            <FaBlog className="sidebar-icon" color="#ff5722" />
            <span>Blog</span>
          </NavLink>

          <NavLink
            to="/case-studies"
            className="sidebar-item"
            onClick={() => handleSidebarItemClick()}
          >
            <FaBookOpen className="sidebar-icon" color="#17a2b8" />
            <span>Case Studies</span>
          </NavLink>

          <NavLink
            to="/careers"
            className="sidebar-item"
            onClick={() => handleSidebarItemClick()}
          >
            <FaBriefcase className="sidebar-icon" color="#6f42c1" />
            <span>Careers</span>
          </NavLink>

          <NavLink
            to="/about"
            className="sidebar-item"
            onClick={() => handleSidebarItemClick()}
          >
            <FaInfoCircle className="sidebar-icon" color="#fd7e14" />
            <span>About Us</span>
          </NavLink>

          <NavLink
            to="/contact"
            className="sidebar-item"
            onClick={() => handleSidebarItemClick()}
          >
            <FaEnvelope className="sidebar-icon" color="#20c997" />
            <span>Contact Us</span>
          </NavLink>

          <div
            className="sidebar-item"
            onClick={() => handleSidebarItemClick(openSignupPopup)}
          >
            <FaUserPlus className="sidebar-icon" color="#ffc107" />
            <span>Sign Up</span>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;