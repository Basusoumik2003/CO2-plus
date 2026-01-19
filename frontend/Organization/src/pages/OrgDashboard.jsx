import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Button,
  Badge,
} from "../components/basic-ui";
import {
  FiBell,
  FiCalendar,
  FiMoon,
  FiSun,
  FiActivity,
  FiFileText,
  FiTrendingUp,
  FiTruck,
  FiUsers,
  FiZap,
  FiShield,
  FiLogOut,
} from "react-icons/fi";

import Overview from "../components/Overview";
import AssetManagement from "../components/AssetManagement";
import CreditEarnings from "../components/CreditEarnings";
import ComplianceReports from "../components/ComplianceReports";
import TeamManagement from "../components/TeamManagement";
import QuickActions from "../components/QuickActions";
import "../styles/global1.css";
import "../styles/TeamManagement.css";

/* ---------------- ICONS ---------------- */

const BellIcon = () => <FiBell size={20} style={{ color: "#f59e0b" }} />;
const CalendarIcon = () => <FiCalendar size={20} style={{ color: "#3b82f6" }} />;
const MoonIcon = () => <FiMoon size={20} style={{ color: "#6366f1" }} />;
const SunIcon = () => <FiSun size={20} style={{ color: "#f59e0b" }} />;
const ActivityIcon = () => <FiActivity size={16} style={{ color: "#3b82f6" }} />;
const FileCheckIcon = () => <FiShield size={16} style={{ color: "#10b981" }} />;
const TrendingUpIcon = () => <FiTrendingUp size={16} style={{ color: "#f59e0b" }} />;
const FileTextIcon = () => <FiFileText size={16} style={{ color: "#ef4444" }} />;
const UsersIcon = () => <FiUsers size={16} style={{ color: "#6366f1" }} />;
const ZapIcon = () => <FiZap size={16} style={{ color: "#10b981" }} />;

/* ---------------- TABS ---------------- */

const DASHBOARD_TABS = [
  { id: "overview", label: "Overview", icon: ActivityIcon, component: Overview, color: "blue" },
  { id: "assets", label: "Assets", icon: FileCheckIcon, component: AssetManagement, color: "green" },
  { id: "earnings", label: "Earnings", icon: TrendingUpIcon, component: CreditEarnings, color: "orange" },
  { id: "compliance", label: "Compliance", icon: FileTextIcon, component: ComplianceReports, color: "red" },
  { id: "team", label: "Team", icon: UsersIcon, component: TeamManagement, color: "violet" },
  { id: "actions", label: "Quick Actions", icon: ZapIcon, component: QuickActions, color: "green" },
];

/* ---------------- MAIN ---------------- */

const OrgDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  /* ----------- ✅ FIXED LOGOUT ----------- */
  const handleLogout = () => {
    if (!window.confirm("Are you sure you want to log out?")) return;

    // Clear Org App storage
    localStorage.clear();
    sessionStorage.clear();

    // Redirect to User App logout (important)
    window.location.href =
      "https://user-carbonpositive2026.onrender.com/logout";
  };

  const handleTabChange = (tabId) => {
    setIsLoading(true);
    setActiveTab(tabId);
    setTimeout(() => setIsLoading(false), 300);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <motion.div
      className={`org-dashboard min-h-screen bg-gray-50 ${isDarkMode ? "dark" : ""}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* ---------- HEADER ---------- */}
      <motion.header
        className="header"
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center space-x-3">
          <img
            src="/GoCarbonPositive_LOGO.png"
            alt="Go Carbon Positive Logo"
            className="w-12 h-12 object-contain"
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-dark">
              Organization Dashboard
            </h1>
            <p className="text-sm text-gray-600">
              Manage your carbon initiatives
            </p>
          </div>
        </div>

        <Button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleLogout();
          }}
          className="button-ghost p-2 text-red-600 hover:bg-red-50 flex items-center"
        >
          <FiLogOut className="w-5 h-5" />
          <span className="ml-2 text-sm font-medium">Logout</span>
        </Button>
      </motion.header>

      {/* ---------- TABS ---------- */}
      <div className="p-6">
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="newtab-header">
            {DASHBOARD_TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className={`newtab-button ${activeTab === tab.id ? "active" : ""}`}
                >
                  <Icon className={`icon ${tab.color}`} />
                  <span>{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {DASHBOARD_TABS.map((tab) => {
            const TabComponent = tab.component;
            return (
              <TabsContent key={tab.id} value={tab.id}>
                {isLoading ? (
                  <div className="spinner">Loading...</div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <TabComponent />
                  </motion.div>
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    </motion.div>
  );
};

export default OrgDashboard;
