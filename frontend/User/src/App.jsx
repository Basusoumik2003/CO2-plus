import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation ,Navigate} from 'react-router-dom';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

import Home from './pages/Home';
import UserDashboard from './components/userDashboard';
import Upload from './components/upload';
import Blog from './pages/blog';
import BlogDetailPage from './pages/blog-detail';
import Engage from './pages/engage';
import Wallet from './pages/wallet';
import Profile from './pages/profile';
import Games from './pages/game';
import About from './pages/about';
import CommunityPage from './pages/community';
import UserNavbar from './components/userNavbar';
import ViewAssets from "./pages/ViewAssets";
import Contact from './pages/contact';
import Navbar from './components/Navbar';   
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
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");
      // Pass session data to Org App
      window.location.href = `https://org-carbonpositive2026.onrender.com/?userId=${userId}&token=${token}`;
    }, []);
    return <p>Redirecting to Organization Dashboard...</p>;
  };

  const RedirectToAdmin = () => {
  return <Navigate to="https://admin-carbonpositive2026.onrender.com" replace />;
};
    


  const Logout = () => {
    useEffect(() => {
      localStorage.clear();
      window.location.href = "/";
    }, []);
    return <p>Logging out...</p>;
  };

  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  // ✅ Load user from localStorage on refresh
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  // ✅ Listen to token change from other tabs
  useEffect(() => {
    const handleStorageChange = () => {
      setIsAuthenticated(!!localStorage.getItem("token"));
      const savedUser = localStorage.getItem("user");
      if (savedUser) setUser(JSON.parse(savedUser));
      else setUser(null);
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // ✅ Auth handler (FIXED)
  const handleAuthChange = (token, userData = null) => {
    if (token) {
      localStorage.setItem("token", token);
      setIsAuthenticated(true);
      if (userData) {
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
      }
    } else {
      localStorage.clear();
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  useEffect(() => {
    setIsAuthenticated(!!localStorage.getItem("token"));
  }, [location.pathname]);

  const shouldHideNavbar = () => {
    const hideNavbarRoutes = ['/userDashboard', '/orgDashboard', '/adminDashboard'];
    if (location.pathname.startsWith('/games')) return true; 
    return hideNavbarRoutes.includes(location.pathname);
  };

  return (
    <>
      <ToastContainer />

      {!shouldHideNavbar() && (
        isAuthenticated 
          ? <UserNavbar onAuthChange={handleAuthChange} user={user} />
          : <Navbar
              isAuthenticated={isAuthenticated}
              user={user}
              openLoginPopup={() => setShowLogin(true)}
              openSignupPopup={() => setShowSignup(true)}
            />
      )}

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
        <Route path="/logout" element={<Logout />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/blog" element={<Blog isAuthenticated={isAuthenticated} />} />
        <Route path="/blog/:id" element={<BlogDetailPage />} />

        <Route path="/engage" element={<Engage />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/view-assets" element={<ViewAssets />} />
        <Route path="/community" element={<CommunityPage />} />
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
