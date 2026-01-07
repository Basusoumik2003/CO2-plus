import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { NavLink, useNavigate } from "react-router-dom";
import "../styles/userNavbar.css";
import WalletPopup from "../pages/wallet";
import { GiWallet } from "react-icons/gi";
import { 
  FaUser, 
  FaCog, 
  FaSignOutAlt, 
  FaChevronDown,
  FaUserCircle,
  FaWallet,
  FaChartLine,
  FaBars,
  FaInfoCircle,
  FaEnvelope
} from 'react-icons/fa';
import {
  MdDashboard,
  MdUpload,
  MdEdit,
  MdHandshake,
  MdAccountBalanceWallet,
} from "react-icons/md";

const Navbar = ({ onAuthChange }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  const sidebarRef = useRef(null);
  const profileDropdownRef = useRef(null);
  const navigate = useNavigate();

  // ✅ Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // ✅ Logout handler
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      setIsProfileDropdownOpen(false);

      if (onAuthChange) onAuthChange(null);

      toast.success("Logged out successfully!", {
        autoClose: 2000,
        theme: "colored",
      });

      setTimeout(() => navigate("/Home"), 2200);
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed!", { autoClose: 2000, theme: "colored" });
    }
  };

  // ✅ Wallet modal controls
  const openWalletModal = () => {
    setIsWalletModalOpen(true);
    setSidebarOpen(false);
  };

  const closeWalletModal = () => {
    setIsWalletModalOpen(false);
  };

  // ✅ Get user initials for avatar
  const getInitials = (name) => {
    if (!name) return 'U';
    const names = name.trim().split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  // ✅ Get display name
  const getDisplayName = () => {
    if (user?.username) return user.username;
    if (user?.email) return user.email.split('@')[0];
    return 'User';
  };

  // ✅ Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setSidebarOpen(false);
      }
    };

    if (sidebarOpen)
      document.addEventListener("mousedown", handleClickOutside);
    else document.removeEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [sidebarOpen]);

  // ✅ Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };

    if (isProfileDropdownOpen)
      document.addEventListener("mousedown", handleClickOutside);
    else document.removeEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isProfileDropdownOpen]);

  return (
    <div className="user-navbar">
      {/* Left section: menu + logo + sidebar */}
      <div className="user-left-section">
        <FaBars
          className="user-menu-icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        />
        <div className="user-logo">
          <img
            src="/GoCarbonPositive_LOGO.svg"
            alt="CarbonCredit Logo"
            className="user-logo-icon"
          />
          <span className="user-logo-text">Carbon Positive</span>
        </div>

        {sidebarOpen && (
          <div className="sidebar-dropdown" ref={sidebarRef}>
            <NavLink
              to="/userDashboard"
              className={({ isActive }) =>
                `sidebar-item ${isActive ? "active-link" : ""}`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <MdDashboard className="sidebar-icon sidebar-blue"
                style={{ fontSize: "1.7rem" }}/>
              <span>Dashboard</span>
            </NavLink>

            <NavLink
              to="/upload"
              className={({ isActive }) =>
                `sidebar-item ${isActive ? "active-link" : ""}`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <MdUpload className="sidebar-icon sidebar-purple" 
                style={{ fontSize: "1.7rem" }}/>
              <span>Assets</span>
            </NavLink>

            <NavLink
              to="/blog"
              className={({ isActive }) =>
                `sidebar-item ${isActive ? "active-link" : ""}`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <MdEdit className="sidebar-icon sidebar-orange" 
                style={{ fontSize: "1.7rem" }}/>
              <span>Blog</span>
            </NavLink>

            <NavLink
              to="/engage"
              className={({ isActive }) =>
                `sidebar-item ${isActive ? "active-link" : ""}`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <MdHandshake className="sidebar-icon sidebar-teal" 
                style={{ fontSize: "1.7rem" }}/>
              <span>Engage</span>
            </NavLink>

            <div
              className="sidebar-item"
              onClick={() => {
                openWalletModal();
                setSidebarOpen(false);
              }}
            >
              <GiWallet
                className="sidebar-icon sidebar-gold"
                style={{ fontSize: "1.8rem" }}
              />
              <span>Wallet</span>
            </div>

            <NavLink
              to="/about"
              className={({ isActive }) =>
                `sidebar-item ${isActive ? "active-link" : ""}`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <FaInfoCircle className="sidebar-icon sidebar-purple" 
                style={{ fontSize: "1.7rem" }}/>
              <span>About</span>
            </NavLink>

            <NavLink
              to="/contact"
              className={({ isActive }) =>
                `sidebar-item ${isActive ? "active-link" : ""}`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <FaEnvelope className="sidebar-icon sidebar-yellow" 
                style={{ fontSize: "1.7rem" }}/>
              <span>Contact</span>
            </NavLink>

            <div
              className="sidebar-item sidebar-logout"
              onClick={() => {
                handleLogout();
                setSidebarOpen(false);
              }}
              style={{ cursor: "pointer" }}
            >
              <FaSignOutAlt className="sidebar-icon sidebar-red" 
                style={{ fontSize: "1.7rem" }}/>
              <span>Logout</span>
            </div>
          </div>
        )}
      </div>

      {/* Center section: wallet */}
      <div className="user-nav-links user-nav-links-center">
        <div className="user-nav-item wallet-nav-item" onClick={openWalletModal}>
          <GiWallet className="wallet-icon"
            style={{ color: '#f59e0b', fontSize: "2rem"}} />
          <span className="wallet-text">Wallet</span>
        </div>
      </div>

      {/* ✅ Right section: Professional profile or login */}
      <div className="user-right-section">
        {user ? (
          <div className="user-profile-container" ref={profileDropdownRef}>
            <div 
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}
            >
              {/* Avatar with status badge */}
              <div style={{ position: 'relative' }}>
                <div className="user-profile-avatar">
                  {user.profilePic ? (
                    <img 
                      src={user.profilePic} 
                      alt={getDisplayName()} 
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        borderRadius: '50%', 
                        objectFit: 'cover' 
                      }}
                    />
                  ) : (
                    getInitials(user.username || user.email)
                  )}
                </div>
                {/* Status indicator - online */}
                <div className="user-status-badge"></div>
              </div>

              {/* User Info */}
              <div className="user-profile-info">
                <div className="user-profile-name">{getDisplayName()}</div>
              </div>

              {/* Dropdown Icon */}
              <FaChevronDown className="user-profile-dropdown-icon" />
            </div>

            {/* Dropdown Menu */}
            {isProfileDropdownOpen && (
              <div className="user-profile-dropdown">
                {/* Header Section */}
                <div className="user-profile-dropdown-header">
                  <div className="user-profile-dropdown-name">{getDisplayName()}</div>
                  <div className="user-profile-dropdown-email">{user.email || 'user@example.com'}</div>
                </div>

                {/* Menu Items */}
                <NavLink 
                  to="/profile" 
                  className="user-profile-dropdown-item"
                  onClick={() => setIsProfileDropdownOpen(false)}
                >
                  <FaUserCircle style={{ color: '#3b82f6' }} />
                  <span>My Profile</span>
                </NavLink>

                <NavLink 
                  to="/userDashboard" 
                  className="user-profile-dropdown-item"
                  onClick={() => setIsProfileDropdownOpen(false)}
                >
                  <FaChartLine style={{ color: '#10b981' }} />
                  <span>Dashboard</span>
                </NavLink>

                <div 
                  className="user-profile-dropdown-item"
                  onClick={() => {
                    setIsProfileDropdownOpen(false);
                    openWalletModal();
                  }}
                >
                  < GiWallet style={{ color: '#f59e0b', fontSize: "2rem"}}  />
                  <span>My Wallet</span>
                </div>

                <NavLink 
                  to="/settings" 
                  className="user-profile-dropdown-item"
                  onClick={() => setIsProfileDropdownOpen(false)}
                >
                  <FaCog style={{ color: '#64748b' }} />
                  <span>Settings</span>
                </NavLink>

                <div 
                  className="user-profile-dropdown-item logout" 
                  onClick={handleLogout}
                >
                  <FaSignOutAlt />
                  <span>Logout</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <NavLink
            to="/login"
            className="bg-green-700 text-white px-3 py-1 rounded hover:bg-green-800 transition-colors"
          >
            Login
          </NavLink>
        )}
      </div>

      {/* Wallet modal */}
      {isWalletModalOpen && (
        <div className="wallet-modal-overlay" onClick={closeWalletModal}>
          <div
            className="wallet-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <WalletPopup onClose={closeWalletModal} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
