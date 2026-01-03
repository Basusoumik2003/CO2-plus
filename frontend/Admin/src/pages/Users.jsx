import React, { useState, useEffect } from "react";
import "../styles/Users.css";
import {
  FaUpload,
  FaDownload,
  FaUserPlus,
  FaEdit,
  FaEye,
  FaCheck,
  FaTimes,
} from "react-icons/fa";
import { IoWarningOutline } from "react-icons/io5";

import { fetchNotifications, markAsRead } from "../services/notificationApi";
import {
  approveUser,
  rejectUser,
  getUserByEmail,
  fetchAllUsers,
} from "../services/userManagementApi";

const Users = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: "all", role: "all" });
  const [searchTerm, setSearchTerm] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState(null);

  // ✅ Load data on mount
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    console.log("🔐 Token found:", !!token);
    
    if (!token) {
      setError("No authentication token found");
      setLoading(false);
      return;
    }

    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  // ✅ Load both notifications and users
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("📥 Loading notifications and users...");
      const [notifRes, usersRes] = await Promise.all([
        fetchNotifications({ status: "new", limit: 50 }).catch(err => {
          console.error("❌ Notifications error:", err.message);
          return { data: [] };
        }),
        fetchAllUsers().catch(err => {
          console.error("❌ Users error:", err.message);
          return { data: [] };
        })
      ]);

      // Handle response format
      const notifications = Array.isArray(notifRes) ? notifRes : (notifRes?.data || []);
      const users = Array.isArray(usersRes) ? usersRes : (usersRes?.data || []);

      console.log("✅ Notifications:", notifications);
      console.log("✅ Users:", users);

      const pending = notifications.map((notif) => ({
        id: notif.id,
        name: notif.username || notif.name || "Unknown",
        email: notif.email,
        userId: notif.user_id || notif.userId,
        eventType: notif.event_type || "registration",
        ipAddress: notif.ip_address || "N/A",
        createdAt: notif.created_at,
      }));

      setPendingApprovals(pending);
      setAllUsers(users);
      setLoading(false);
    } catch (error) {
      console.error("❌ Load error:", error);
      setError(error.message || "Failed to load data");
      setLoading(false);
    }
  };

  // ✅ Approve user
  const handleApprove = async (notificationId, email) => {
    try {
      setActionLoading(notificationId);
      const userRes = await getUserByEmail(email);
      const userId = userRes?.id || userRes?._id;
      
      await approveUser(userId);
      await markAsRead(notificationId);
      await loadData();
      alert("User approved successfully!");
    } catch (error) {
      console.error("❌ Approve error:", error);
      alert("Failed to approve user: " + error.message);
    } finally {
      setActionLoading(null);
    }
  };

  // ✅ Reject user
  const handleReject = async (notificationId, email) => {
    try {
      setActionLoading(notificationId);
      const reason = prompt("Rejection reason:") || "Administrative decision";
      const userRes = await getUserByEmail(email);
      const userId = userRes?.id || userRes?._id;
      
      await rejectUser(userId, reason);
      await markAsRead(notificationId);
      await loadData();
      alert("User rejected successfully!");
    } catch (error) {
      console.error("❌ Reject error:", error);
      alert("Failed to reject user: " + error.message);
    } finally {
      setActionLoading(null);
    }
  };

  // ✅ Filter users
  const filteredUsers = allUsers.filter((user) => {
    const matchSearch =
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus =
      filter.status === "all" || user.status?.toLowerCase() === filter.status;
    const matchRole =
      filter.role === "all" || user.role?.toLowerCase() === filter.role;
    return matchSearch && matchStatus && matchRole;
  });

  // ✅ Loading state
  if (loading) {
    return (
      <div className="users-page">
        <div style={{ textAlign: "center", padding: "50px" }}>
          <p style={{ fontSize: "18px", color: "#666" }}>⏳ Loading data...</p>
        </div>
      </div>
    );
  }

  // ✅ Error state
  if (error) {
    return (
      <div className="users-page">
        <div style={{ textAlign: "center", padding: "50px", color: "red" }}>
          <p style={{ fontSize: "18px" }}>❌ {error}</p>
          <button
            onClick={loadData}
            style={{
              marginTop: "10px",
              padding: "10px 20px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ✅ Render UI
  return (
    <div className="users-page">
      {/* HEADER */}
      <div className="users-header">
        <div className="users-header-left">
          <h1>User Management</h1>
          <p>Manage all user accounts, roles, and permissions</p>
        </div>
        <div className="users-header-buttons">
          <button className="users-import"><FaUpload /> Import</button>
          <button className="users-export"><FaDownload /> Export</button>
          <button className="users-edit"><FaEdit /> Edit</button>
          <button className="users-add"><FaUserPlus /> Add</button>
        </div>
      </div>

      {/* PENDING APPROVALS */}
      <div className="users-section">
        <h2>
          <IoWarningOutline /> Pending Approvals
          <span className="users-badge">{pendingApprovals.length}</span>
        </h2>
        {pendingApprovals.length === 0 ? (
          <p style={{ padding: "20px", textAlign: "center", color: "#666" }}>
            ✅ No pending approvals
          </p>
        ) : (
          pendingApprovals.map((user) => (
            <div key={user.id} className="users-approval-card">
              <div>
                <h3>{user.name}</h3>
                <p>{user.email}</p>
                <small style={{ color: "#999" }}>IP: {user.ipAddress}</small>
              </div>
              <div className="users-actions">
                <button
                  className="users-approve"
                  onClick={() => handleApprove(user.id, user.email)}
                  disabled={actionLoading === user.id}
                >
                  <FaCheck /> {actionLoading === user.id ? "Processing..." : "Approve"}
                </button>
                <button
                  className="users-reject"
                  onClick={() => handleReject(user.id, user.email)}
                  disabled={actionLoading === user.id}
                >
                  <FaTimes /> {actionLoading === user.id ? "Processing..." : "Reject"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ALL USERS */}
      <div className="users-section users-table">
        <h2>All Users ({filteredUsers.length})</h2>
        <div className="users-controls">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="users-search"
          />
          <select
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            className="users-filter"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            value={filter.role}
            onChange={(e) => setFilter({ ...filter, role: e.target.value })}
            className="users-filter"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
            <option value="organization">Organization</option>
          </select>
        </div>
        {filteredUsers.length === 0 ? (
          <p style={{ padding: "20px", textAlign: "center", color: "#666" }}>
            No users found
          </p>
        ) : (
          <table className="users-data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.name || "N/A"}</td>
                  <td>{user.email}</td>
                  <td>{user.role || "user"}</td>
                  <td>
                    <span className={`status-badge status-${user.status?.toLowerCase()}`}>
                      {user.status || "pending"}
                    </span>
                  </td>
                  <td>
                    <button
                      className="action-btn view-btn"
                      onClick={() => {
                        setSelectedUser(user);
                        setShowModal(true);
                      }}
                    >
                      <FaEye /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL */}
      {showModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>User Details</h2>
            <div className="user-details">
              <p><strong>Name:</strong> {selectedUser.name || "N/A"}</p>
              <p><strong>Email:</strong> {selectedUser.email}</p>
              <p><strong>Role:</strong> {selectedUser.role || "user"}</p>
              <p><strong>Status:</strong> {selectedUser.status || "pending"}</p>
            </div>
            <button className="modal-close" onClick={() => setShowModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
