import React, { useMemo, useState } from "react";
import "../styles/Security.css";
import {
  FaUserShield,
  FaLock,
  FaKey,
  FaCheckCircle,
  FaUserPlus,
  FaBell,
  FaClipboardList,
  FaShieldAlt,
  FaSearch,
  FaFilter,
} from "react-icons/fa";

const Security = () => {
  const [showUpdatePopup, setShowUpdatePopup] = useState(false);
  const [showAddAdminPopup, setShowAddAdminPopup] = useState(false);

  const [policyForm, setPolicyForm] = useState({
    name: "",
    description: "",
    sensitivity: "High",
  });

  const [adminForm, setAdminForm] = useState({
    name: "",
    email: "",
    role: "Admin",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [eventFilter, setEventFilter] = useState("all");
  const [sensitivityFilter, setSensitivityFilter] = useState("all");

  const logs = useMemo(
    () => [
      {
        event: "Policy Updated",
        user: "Alex Morgan",
        timestamp: "2025-10-24 10:13",
        sensitivity: "High",
        status: "Success",
        type: "policy",
      },
      {
        event: "Failed login",
        user: "Chris Lee",
        timestamp: "2025-10-24 09:51",
        sensitivity: "Moderate",
        status: "Failed",
        type: "login",
      },
      {
        event: "Data Export Attempt",
        user: "Jordan Smith",
        timestamp: "2025-10-23 18:42",
        sensitivity: "High",
        status: "Unauthorized",
        type: "export",
      },
      {
        event: "2FA Enabled",
        user: "Priya Patel",
        timestamp: "2025-10-23 16:10",
        sensitivity: "Low",
        status: "Success",
        type: "policy",
      },
    ],
    []
  );

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const text =
        `${log.event} ${log.user} ${log.timestamp} ${log.sensitivity} ${log.status}`.toLowerCase();
      const matchSearch = text.includes(appliedSearch.toLowerCase());

      const matchEvent =
        eventFilter === "all" ? true : log.type === eventFilter;

      const matchSensitivity =
        sensitivityFilter === "all"
          ? true
          : log.sensitivity.toLowerCase() === sensitivityFilter;

      return matchSearch && matchEvent && matchSensitivity;
    });
  }, [logs, appliedSearch, eventFilter, sensitivityFilter]);

  const handleApplySearch = () => {
    setAppliedSearch(searchTerm.trim());
  };

  const handlePolicyChange = (e) => {
    const { name, value } = e.target;
    setPolicyForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdminChange = (e) => {
    const { name, value } = e.target;
    setAdminForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePolicySubmit = (e) => {
    e.preventDefault();
    alert(`Policy "${policyForm.name}" updated.`);
    setShowUpdatePopup(false);
  };

  const handleAdminSubmit = (e) => {
    e.preventDefault();
    alert(`Admin "${adminForm.name}" added.`);
    setShowAddAdminPopup(false);
  };

  const downloadTextFile = (filename, content, mime = "text/plain") => {
    const blob = new Blob([content], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const header = "Event,User,Timestamp,Sensitivity,Status\n";
    const rows = logs
      .map(
        (l) =>
          `${l.event},${l.user},${l.timestamp},${l.sensitivity},${l.status}`
      )
      .join("\n");
    const csv = header + rows;
    downloadTextFile("security-logs.csv", csv, "text/csv");
  };

  const handleExportPDF = () => {
    const text =
      "Security Logs Export\n\n" +
      logs
        .map(
          (l) =>
            `${l.timestamp} - ${l.event} - ${l.user} - ${l.sensitivity} - ${l.status}`
        )
        .join("\n");
    downloadTextFile("security-logs.txt", text, "text/plain");
  };

  const handleViewAllLogs = () => {
    alert("View All Logs clicked (wire to full logs page later).");
  };

  return (
    <div className="security-page-container">
      {/* Header */}
      <div className="security-header">
        <div className="security-title-section">
          <h2>Security & Access Control</h2>
          <p>
            Manage authentication, environmental data permissions, and system
            integrity.
          </p>
        </div>

        <div className="security-header-actions">
          <button
            className="update-btn"
            onClick={() => setShowUpdatePopup(true)}
          >
            <FaClipboardList /> Update Policies
          </button>
          <button
            className="add-btn"
            onClick={() => setShowAddAdminPopup(true)}
          >
            <FaUserPlus /> Add Admin
          </button>
        </div>
      </div>

      {/* Authentication Settings */}
      <div className="security-card">
        <div className="section-heading">
          <FaUserShield className="section-icon" />
          <h3>Authentication Settings</h3>
        </div>
        <div className="auth-grid">
          {[
            {
              icon: <FaLock />,
              title: "Two-Factor Authentication (2FA)",
              desc: "Enhance login security for carbon project admins.",
            },
            {
              icon: <FaBell />,
              title: "Login Alerts",
              desc: "Receive notifications for suspicious or failed logins.",
            },
            {
              icon: <FaKey />,
              title: "Session Timeout",
              desc: "Automatically log out inactive sessions for data protection.",
            },
            {
              icon: <FaShieldAlt />,
              title: "API Access Lock",
              desc: "Restrict unauthorized API requests to sensitive carbon datasets.",
            },
          ].map((item, i) => (
            <div className="auth-item" key={i}>
              <h4>
                {item.icon} {item.title}
              </h4>
              <p>{item.desc}</p>
              <label className="switch">
                <input type="checkbox" defaultChecked={i < 3} />
                <span className="slider"></span>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Data Access Policy */}
      <div className="security-card">
        <div className="section-heading">
          <FaKey className="section-icon" />
          <h3>Data Access & Protection Policy</h3>
        </div>
        <div className="policy-grid">
          {[
            "Require verified carbon project credentials",
            "Allow access only from whitelisted IPs",
            "Enable encrypted data transfer (SSL/TLS)",
            "Auto-expire API tokens after 24 hours",
            "Restrict bulk export of carbon offset records",
          ].map((rule, index) => (
            <div className="policy-item" key={index}>
              <FaCheckCircle className="policy-icon" /> {rule}
            </div>
          ))}
        </div>
        <p className="policy-note">
          These policies ensure the integrity and transparency of carbon
          accounting data.
        </p>
      </div>

      {/* Active Admins & Login Attempts */}
      <div className="security-dual-section">
        <div className="security-card">
          <div className="section-heading">
            <FaUserShield className="section-icon" />
            <h3>Active Admins</h3>
          </div>
          <p>Monitor admin and organization access activity in real-time.</p>
          <div className="admin-list">
            {[
              {
                initials: "AM",
                name: "Alex Morgan",
                role: "Carbon Analyst",
                status: "Active",
                color: "green",
              },
              {
                initials: "JS",
                name: "Jordan Smith",
                role: "Verifier",
                status: "Pending Verification",
                color: "yellow",
              },
              {
                initials: "CL",
                name: "Chris Lee",
                role: "Auditor",
                status: "Suspended",
                color: "red",
              },
            ].map((admin, index) => (
              <div className="admin-card" key={index}>
                <div className="admin-avatar">{admin.initials}</div>
                <div className="admin-info">
                  <h4>{admin.name}</h4>
                  <div className="admin-tags">
                    <span className="role-tag">{admin.role}</span>
                    <span className={`status-tag ${admin.color}`}>
                      {admin.status}
                    </span>
                    <span className="contact">✉ Contact</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="security-card">
          <div className="section-heading">
            <FaShieldAlt className="section-icon" />
            <h3>Recent Login Attempts</h3>
          </div>
          <p>Monitor recent admin and organization access activity.</p>
          <div className="login-list">
            {[
              {
                date: "2025-10-24 10:11",
                ip: "192.168.0.12",
                device: "Chrome · macOS",
                status: "Success",
              },
              {
                date: "2025-10-24 09:48",
                ip: "66.249.66.1",
                device: "Safari · iPhone",
                status: "Failed",
              },
              {
                date: "2025-10-23 18:40",
                ip: "10.0.0.5",
                device: "Edge · Windows",
                status: "Success",
              },
            ].map((log, index) => (
              <div className="login-card" key={index}>
                <p>
                  <strong>{log.date}</strong>
                </p>
                <p>
                  IP: {log.ip} · {log.device}
                </p>
                <span
                  className={`login-status ${
                    log.status === "Success" ? "green" : "red"
                  }`}
                >
                  {log.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Security Logs */}
      <div className="security-card">
        <div className="section-heading">
          <FaLock className="section-icon" />
          <h3>Security Logs</h3>
        </div>

        <div className="logs-controls">
          <div className="search-bar">
            <button
              type="button"
              className="search-button"
              onClick={handleApplySearch}
            >
              <FaSearch />
            </button>
            <input
              type="text"
              placeholder="Search events, users, or time..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleApplySearch();
                }
              }}
            />
          </div>

          <div className="logs-filter-group">
            <div className="filter-select">
              <FaFilter />
              <select
                value={eventFilter}
                onChange={(e) => setEventFilter(e.target.value)}
              >
                <option value="all">All Events</option>
                <option value="policy">Policy Changes</option>
                <option value="login">Logins</option>
                <option value="export">Exports</option>
              </select>
            </div>
            <div className="filter-select">
              <span>Sensitivity</span>
              <select
                value={sensitivityFilter}
                onChange={(e) => setSensitivityFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="high">High</option>
                <option value="moderate">Moderate</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <span className="failed-badge">1 recent failed</span>
        </div>

        <table className="logs-table">
          <thead>
            <tr>
              <th>Event</th>
              <th>User</th>
              <th>Timestamp</th>
              <th>Sensitivity</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log, idx) => (
              <tr key={idx}>
                <td>{log.event}</td>
                <td>{log.user}</td>
                <td>{log.timestamp}</td>
                <td>
                  <span
                    className={`badge ${
                      log.sensitivity.toLowerCase() === "high"
                        ? "high"
                        : log.sensitivity.toLowerCase() === "moderate"
                        ? "moderate"
                        : "low"
                    }`}
                  >
                    {log.sensitivity}
                  </span>
                </td>
                <td>
                  <span
                    className={`badge ${
                      log.status === "Success"
                        ? "success"
                        : log.status === "Failed"
                        ? "failed"
                        : "unauthorized"
                    }`}
                  >
                    {log.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="logs-actions">
          <button className="export-btn primary" onClick={handleExportCSV}>
            Export CSV
          </button>
          <button className="export-btn secondary" onClick={handleExportPDF}>
            Export PDF
          </button>
          <button className="view-all-btn" onClick={handleViewAllLogs}>
            View All Logs
          </button>
        </div>
      </div>

      {/* Update Policies Popup */}
      {showUpdatePopup && (
        <div
          className="popup-overlay"
          onClick={() => setShowUpdatePopup(false)}
        >
          <div className="popup-card" onClick={(e) => e.stopPropagation()}>
            <h3>
              <FaClipboardList /> Update Security Policies
            </h3>
            <p>Define or update rules for data access and protection.</p>
            <form onSubmit={handlePolicySubmit}>
              <input
                type="text"
                name="name"
                placeholder="Policy name (e.g. API token expiry)"
                value={policyForm.name}
                onChange={handlePolicyChange}
                required
              />
              <textarea
                name="description"
                placeholder="Describe what this policy enforces..."
                value={policyForm.description}
                onChange={handlePolicyChange}
                required
              />
              <select
                name="sensitivity"
                value={policyForm.sensitivity}
                onChange={handlePolicyChange}
              >
                <option value="High">High sensitivity</option>
                <option value="Moderate">Moderate sensitivity</option>
                <option value="Low">Low sensitivity</option>
              </select>
              <div className="popup-actions">
                <button
                  type="button"
                  onClick={() => setShowUpdatePopup(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="confirm">
                  Save Policy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Admin Popup */}
      {showAddAdminPopup && (
        <div
          className="popup-overlay"
          onClick={() => setShowAddAdminPopup(false)}
        >
          <div className="popup-card" onClick={(e) => e.stopPropagation()}>
            <h3>
              <FaUserPlus /> Add Admin User
            </h3>
            <p>Grant secure access to a new admin or verifier.</p>
            <form onSubmit={handleAdminSubmit}>
              <input
                type="text"
                name="name"
                placeholder="Full name"
                value={adminForm.name}
                onChange={handleAdminChange}
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email address"
                value={adminForm.email}
                onChange={handleAdminChange}
                required
              />
              <select
                name="role"
                value={adminForm.role}
                onChange={handleAdminChange}
              >
                <option value="Admin">Admin</option>
                <option value="Verifier">Verifier</option>
                <option value="Auditor">Auditor</option>
              </select>
              <div className="popup-actions">
                <button
                  type="button"
                  onClick={() => setShowAddAdminPopup(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="confirm">
                  Add Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Security;