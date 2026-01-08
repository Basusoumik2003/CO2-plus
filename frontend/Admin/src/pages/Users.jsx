import React, { useState, useEffect, useRef } from "react";
import "../styles/Users.css";
import {
  FaEye,
  FaCheck,
  FaTimes,
} from "react-icons/fa";
import { IoWarningOutline } from "react-icons/io5";

import { fetchNotifications } from "../services/notificationApi";
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

  const isMounted = useRef(true);

  const getCookie = (name) => {
    const nameEQ = name + "=";
    const cookies = document.cookie.split(";");
    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.indexOf(nameEQ) === 0) {
        return cookie.substring(nameEQ.length);
      }
    }
    return null;
  };

  useEffect(() => {
    isMounted.current = true;

    const token = localStorage.getItem("authToken") || getCookie("authToken");

    if (!token) {
      setError("No authentication token found");
      setLoading(false);
      return;
    }

    safeLoad();
    const interval = setInterval(safeLoad, 30000);

    return () => {
      isMounted.current = false;
      clearInterval(interval);
    };
  }, []);

  const safeLoad = async () => {
    if (!isMounted.current) return;
    await loadData();
  };

  const loadData = async () => {
    try {
      if (!isMounted.current) return;

      setLoading(true);
      setError(null);

      const [, usersRes] = await Promise.all([
        fetchNotifications({ status: "new", limit: 50 }).catch(() => ({ data: [] })),
        fetchAllUsers().catch(() => ({ data: [] })),
      ]);

      const users = Array.isArray(usersRes)
        ? usersRes
        : usersRes?.data || [];

      const pending = users
        .filter((u) => (u?.status || "").toLowerCase() === "pending")
        .map((u) => ({
          id: u.id || u.user_id,
          name: u.username || "Unknown",
          email: u.email,
          userId: u.id || u.user_id,
          ipAddress: u.ip_address || "N/A",
          role: u.user_role || "user",
          status: u.status,
          createdAt: u.created_at,
        }));

      if (!isMounted.current) return;

      setPendingApprovals(pending);
      setAllUsers(users);
      setLoading(false);
    } catch (err) {
      if (!isMounted.current) return;
      setError(err.message || "Failed to load data");
      setLoading(false);
    }
  };

  const handleApprove = async (userId, email) => {
    try {
      setActionLoading(userId);

      let resolvedUserId = userId;
      if (!resolvedUserId && email) {
        const userRes = await getUserByEmail(email);
        resolvedUserId = userRes?.id || userRes?._id;
      }

      if (!resolvedUserId) throw new Error("User ID not found");

      await approveUser(resolvedUserId);
      await loadData();
      alert("User approved successfully!");
    } catch (err) {
      alert("Failed to approve user: " + err.message);
    } finally {
      if (isMounted.current) setActionLoading(null);
    }
  };

  const handleReject = async (userId, email) => {
    try {
      setActionLoading(userId);
      const reason = prompt("Rejection reason:");
      if (!reason) return setActionLoading(null);

      let resolvedUserId = userId;
      if (!resolvedUserId && email) {
        const userRes = await getUserByEmail(email);
        resolvedUserId = userRes?.id || userRes?._id;
      }

      if (!resolvedUserId) throw new Error("User ID not found");

      await rejectUser(resolvedUserId, reason);
      await loadData();
      alert("User rejected successfully!");
    } catch (err) {
      alert("Failed to reject user: " + err.message);
    } finally {
      if (isMounted.current) setActionLoading(null);
    }
  };

  const filteredUsers = allUsers.filter((u = {}) => {
    const name = u.username || "";
    const email = u.email || "";

    const matchSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus =
      filter.status === "all" || u.status?.toLowerCase() === filter.status;

    const matchRole =
      filter.role === "all" || u.user_role?.toLowerCase() === filter.role;

    return matchSearch && matchStatus && matchRole;
  });

  if (loading) {
    return <div className="users-page"><p style={{ textAlign:"center" }}>⏳ Loading...</p></div>;
  }

  if (error) {
    return <div className="users-page"><p style={{ color:"red", textAlign:"center" }}>{error}</p></div>;
  }

  return (
    <div className="users-page">

      <div className="users-section">
        <h2><IoWarningOutline /> Pending Approvals <span className="users-badge">{pendingApprovals.length}</span></h2>

        {pendingApprovals.map((user) => (
          <div key={user.id} className="users-approval-card">
            <div>
              <h3>{user.name}</h3>
              <p>{user.email}</p>
              <small>IP: {user.ipAddress}</small>
            </div>

            <div className="users-actions">
              <button className="users-review" onClick={() => { setSelectedUser(user); setShowModal(true); }}>
                <FaEye /> View
              </button>

              <button className="users-approve" onClick={() => handleApprove(user.userId, user.email)}>
                <FaCheck /> Approve
              </button>

              <button className="users-reject" onClick={() => handleReject(user.userId, user.email)}>
                <FaTimes /> Reject
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="users-section users-table">
        <h2>All Users ({filteredUsers.length})</h2>

        <div className="users-controls">
          <input placeholder="Search..." value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} className="users-search"/>
          <select value={filter.status} onChange={(e)=>setFilter({...filter,status:e.target.value})} className="users-filter">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <table className="users-data-table">
          <thead>
            <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u.id}>
                <td>{u.username || "N/A"}</td>
                <td>{u.email}</td>
                <td>{u.user_role || "user"}</td>
                <td><span className={`status-badge status-${u.status}`}>{u.status}</span></td>
                <td><button className="action-btn" onClick={()=>{setSelectedUser(u);setShowModal(true);}}><FaEye/> View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && selectedUser && (
        <div className="users-modal" onClick={()=>setShowModal(false)}>
          <div className="users-modal-content" onClick={(e)=>e.stopPropagation()}>
            <h2>User Details</h2>
            <p><strong>Name:</strong> {selectedUser.username}</p>
            <p><strong>Email:</strong> {selectedUser.email}</p>
            <p><strong>Role:</strong> {selectedUser.user_role}</p>
            <p><strong>Status:</strong> {selectedUser.status}</p>
            <p><strong>IP:</strong> {selectedUser.ip_address || "N/A"}</p>

            <button 
              className="users-modal-close" 
              onClick={() => setShowModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
