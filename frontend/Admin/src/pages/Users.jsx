import React, { useState } from "react";
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

const Users = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const users = [
    {
      id: 1,
      name: "John Smith",
      email: "john.smith@email.com",
      role: "Individual",
      status: "Active",
      kyc: "Approved",
      credits: "1,250",
      projects: "3",
      joinDate: "2024-01-15",
      lastLogin: "2024-06-15 14:30",
    },
    {
      id: 2,
      name: "ABC Corporation",
      email: "admin@abccorp.com",
      role: "Organization",
      status: "Pending",
      kyc: "Under Review",
      credits: "0",
      projects: "0",
      joinDate: "2024-06-10",
      lastLogin: "Never",
    },
  ];

  const pendingApprovals = [
    {
      id: 1,
      name: "EcoFarm Ltd",
      email: "info@ecofarm.com",
    },
    {
      id: 2,
      name: "David Wilson",
      email: "d.wilson@email.com",
    },
  ];

  const openModal = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };
  const closeModal = () => setShowModal(false);

  return (
    <div className="users-page">
      {/* Header Section */}
      <div className="users-header">
        <div className="users-header-left">
          <h1>User Management</h1>
          <p>Manage all user accounts, roles, and permissions</p>
        </div>
        <div className="users-header-buttons">
          <button className="users-import"><FaUpload /> Import Users</button>
          <button className="users-export"><FaDownload /> Export Data</button>
          <button className="users-edit"><FaEdit /> Edit User</button>
          <button className="users-add"><FaUserPlus /> Add User</button>
        </div>
      </div>

      {/* Pending Approvals */}
      <div className="users-section">
        <h2>
          <IoWarningOutline /> Pending Approvals{" "}
          <span className="users-badge">{pendingApprovals.length}</span>
        </h2>

        <div className="users-approval-list">
          {pendingApprovals.map((user) => (
            <div key={user.id} className="users-approval-card">
              <div>
                <h3>{user.name}</h3>
                <p>{user.email}</p>
              </div>
              <div className="users-actions">
                <button className="users-review" onClick={() => openModal(user)}>
                  <FaEye /> Review
                </button>
                <button className="users-approve"><FaCheck /> Approve</button>
                <button className="users-reject"><FaTimes /> Reject</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter */}
      <div className="users-section users-filter">
        <h2>Filter Users</h2>
        <div className="users-filter-controls">
          <input type="text" placeholder="Search users..." />
          <select>
            <option>All Status</option>
            <option>Active</option>
            <option>Pending</option>
            <option>Suspended</option>
          </select>
          <select>
            <option>All Roles</option>
            <option>Individual</option>
            <option>Organization</option>
          </select>
          <button className="users-export-filter">
            <FaDownload /> Export Filtered
          </button>
        </div>
      </div>

      {/* All Users */}
      <div className="users-section users-table">
        <h2>All Users ({users.length})</h2>

        <h3 className="users-role-header">Individuals</h3>
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Status</th>
              <th>KYC</th>
              <th>Credits</th>
              <th>Projects</th>
              <th>Join Date</th>
              <th>Last Login</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users
              .filter((u) => u.role === "Individual")
              .map((u) => (
                <tr key={u.id}>
                  <td>
                    <strong>{u.name}</strong><br />
                    <span>{u.email}</span>
                  </td>
                  <td>{u.role}</td>
                  <td><span className={`users-status ${u.status.toLowerCase()}`}>{u.status}</span></td>
                  <td><span className={`users-kyc ${u.kyc.toLowerCase().replace(" ", "-")}`}>{u.kyc}</span></td>
                  <td>{u.credits}</td>
                  <td>{u.projects}</td>
                  <td>{u.joinDate}</td>
                  <td>{u.lastLogin}</td>
                  <td className="users-table-actions">
                    <FaEye className="users-eye" />
                    <FaCheck className="users-approve-icon" />
                  </td>
                </tr>
              ))}
          </tbody>
        </table>

        <h3 className="users-role-header">Organizations</h3>
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Status</th>
              <th>KYC</th>
              <th>Credits</th>
              <th>Projects</th>
              <th>Join Date</th>
              <th>Last Login</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users
              .filter((u) => u.role === "Organization")
              .map((u) => (
                <tr key={u.id}>
                  <td>
                    <strong>{u.name}</strong><br />
                    <span>{u.email}</span>
                  </td>
                  <td>{u.role}</td>
                  <td><span className={`users-status ${u.status.toLowerCase()}`}>{u.status}</span></td>
                  <td><span className={`users-kyc ${u.kyc.toLowerCase().replace(" ", "-")}`}>{u.kyc}</span></td>
                  <td>{u.credits}</td>
                  <td>{u.projects}</td>
                  <td>{u.joinDate}</td>
                  <td>{u.lastLogin}</td>
                  <td className="users-table-actions">
                    <FaEye className="users-eye" />
                    <FaTimes className="users-reject-icon" />
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="users-modal">
          <div className="users-modal-content">
            <h2>Review User</h2>
            <p><strong>{selectedUser.name}</strong></p>
            <p>{selectedUser.email}</p>
            <div className="users-modal-buttons">
              <button onClick={closeModal}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
