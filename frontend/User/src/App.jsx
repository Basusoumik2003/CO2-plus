import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import Home from './pages/Home';
import UserDashboard from './components/userDashboard';
// import OrgDashboard from '../../OrgDashboard/src/pages/OrgDashboard'
// import AddAsset from './components/AddAsset';
import AdminDashboard from '../../Admin/src/pages/AdminDashboard';
import Upload from './components/upload';
import Blog from './pages/blog';
import Engage from './pages/engage';
import Wallet from './pages/wallet';
import Profile from './pages/profile';
import Games from './pages/game';
import About from './pages/about';
import Community from './pages/community';
import UserNavbar from './components/userNavbar';
import ViewAssets from "./pages/ViewAssets";
import Contact from './pages/contact';
import Navbar from './components/Navbar';   
// import AddAsset from '../../OrgDashboard/frontend/src/components/AddAsset';
import EcoVoyageGame from './game/EcoShooter/EcoVoyage/EcoVoyageGame';
import Ecoshooter from './game/EcoShooter/Bubble';
import Memorygame from './game/MemoryGame/Memory';
import Activities from './pages/activities';
import ActivityDetail from './pages/Careers';
import Careers from './pages/Careers';
import CaseStudy from './pages/CaseStudy';
import LoginPopup from './pages/Login';
import SignupPopup from './pages/Signup';

const App = () => {
  const location = useLocation();

  const RedirectToOrg = () => {
    useEffect(() => {
      window.location.href = "https://frontend-org.onrender.com";
    }, []);
    return <p>Redirecting to Organization Dashboard...</p>;
  };

  const RedirectToAdmin = () => {
    useEffect(() => {
      window.location.href = "http://localhost:5174";
    }, []);
    return <p>Redirecting to Admin Dashboard...</p>;
  };

  // Initial auth state based on token in localStorage
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  // Listen for storage events (e.g. login/logout in other tabs)
  useEffect(() => {
    const handleStorageChange = () => {
      setIsAuthenticated(!!localStorage.getItem("token"));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Update auth state immediately after login/signup
  const handleAuthChange = (token, userData = null) => {
    if (token) {
      localStorage.setItem("token", token);
      setIsAuthenticated(true);
      if (userData) setUser(userData);
    } else {
      localStorage.removeItem("token");
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  // Re-check auth on every route change
  useEffect(() => {
    setIsAuthenticated(!!localStorage.getItem("token"));
  }, [location.pathname]);

  // Decide when to hide Navbar
  const shouldHideNavbar = () => {
    const hideNavbarRoutes = ['/userDashboard', '/orgDashboard', '/admin'];
    if (location.pathname.startsWith('/games')) return true; 
    return hideNavbarRoutes.includes(location.pathname);
  };

  return (
    <>
      <ToastContainer />
      
      {/* Navbar logic */}
      {!shouldHideNavbar() && (
        isAuthenticated 
          ? <UserNavbar onAuthChange={handleAuthChange} />
          : <Navbar
              isAuthenticated={isAuthenticated}
              user={user}
              showAuth={showLogin || showSignup}
              openLoginPopup={() => setShowLogin(true)}
              openSignupPopup={() => setShowSignup(true)}
            />
      )}

      {/* ✅ Show login/signup popup when state is true */}
      {showLogin && (
        <LoginPopup 
          onClose={() => setShowLogin(false)} 
          onLogin={(token, userData) => handleAuthChange(token, userData)} 
          onSwitchToSignup={() => {
            setShowLogin(false);
            setShowSignup(true);
          }}
        />
      )}

      {showSignup && (
        <SignupPopup 
          onClose={() => setShowSignup(false)} 
          onSignup={(token, userData) => handleAuthChange(token, userData)} 
          onSwitchToLogin={() => {
            setShowSignup(false);
            setShowLogin(true);
          }}
        />
      )}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/game" element={<Games />} />
        <Route path="/userDashboard" element={<UserDashboard />} />
        <Route path="/orgDashboard" element={<RedirectToOrg />} />
        <Route path="/adminDashboard" element={<RedirectToAdmin />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/blog" element={<Blog isAuthenticated={isAuthenticated} />} />
        <Route path="/engage" element={<Engage />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/view-assets" element={<ViewAssets />} />
        {/* <Route path="/add-asset" element={<AddAsset />} /> */}
        <Route path="/community" element={<Community />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/case-studies" element={<CaseStudy />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
        <Route path="/games/eco-voyage" element={<EcoVoyageGame />} />
        <Route path="/games/eco-shooter" element={<Ecoshooter />} />
        <Route path="/games/memory" element={<Memorygame />} />
        <Route path="/activities" element={<Activities />} />
        <Route path="/activity/:activityKey" element={<ActivityDetail />} />
      </Routes>
    </>
  );
};

export default App;
