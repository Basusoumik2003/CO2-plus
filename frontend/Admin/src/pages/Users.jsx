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
import { approveUser, rejectUser, getUserByEmail } from "../services/userManagementApi";

const Users = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: 'all', role: 'all' });
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState(null); // Track which button is loading

  useEffect(() => {
    loadNotifications();
    
    const interval = setInterval(() => {
      loadNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      
      const unreadResponse = await fetchNotifications({ status: 'new', limit: 50 });
      const allResponse = await fetchNotifications({ limit: 100 });
      
      const pending = unreadResponse.data.map(notif => ({
        id: notif.id,
        name: notif.username || 'Unknown User',
        email: notif.email,
        userId: notif.user_id, // ✅ IMPORTANT: Get user_id from notification
        eventType: notif.event_type,
        ipAddress: notif.ip_address,
        createdAt: notif.created_at,
      }));
      
      const usersMap = new Map();
      allResponse.data.forEach(notif => {
        if (!usersMap.has(notif.email)) {
          usersMap.set(notif.email, {
            id: notif.id,
            userId: notif.user_id, // ✅ Store user_id
            name: notif.username || 'Unknown User',
            email: notif.email,
            role: notif.event_type === 'signup' ? 'Individual' : 'Unknown',
            status: notif.status === 'new' ? 'Pending' : 'Active',
            kyc: 'Under Review',
            credits: '0',
            projects: '0',
            joinDate: new Date(notif.created_at).toLocaleDateString(),
            lastLogin: new Date(notif.created_at).toLocaleString(),
          });
        }
      });
      
      setPendingApprovals(pending);
      setAllUsers(Array.from(usersMap.values()));
      
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ REAL APPROVE LOGIC
  const handleApprove = async (notificationId, email) => {
    try {
      setActionLoading(notificationId);
      
      // 1. Get user ID from email
      const userResponse = await getUserByEmail(email);
      const userId = userResponse.data.id;
      
      // 2. Approve user in auth service
      await approveUser(userId);
      
      // 3. Mark notification as read
      await markAsRead(notificationId);
      
      // 4. Reload notifications
      await loadNotifications();
      
      alert(`User ${email} approved successfully!`);
    } catch (error) {
      console.error('Error approving user:', error);
      alert('Failed to approve user. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  // ✅ REAL REJECT LOGIC
  const handleReject = async (notificationId, email) => {
    try {
      setActionLoading(notificationId);
      
      const reason = prompt('Enter rejection reason (optional):') || 'Administrative decision';
      
      // 1. Get user ID from email
      const userResponse = await getUserByEmail(email);
      const userId = userResponse.data.id;
      
      // 2. Reject user in auth service
      await rejectUser(userId, reason);
      
      // 3. Mark notification as read
      await markAsRead(notificationId);
      
      // 4. Reload notifications
      await loadNotifications();
      
      alert(`User ${email} rejected successfully!`);
    } catch (error) {
      console.error('Error rejecting user:', error);
      alert('Failed to reject user. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const openModal = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  const filteredUsers = allUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filter.status === 'all' || user.status.toLowerCase() === filter.status.toLowerCase();
    const matchesRole = filter.role === 'all' || user.role.toLowerCase() === filter.role.toLowerCase();
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  if (loading) {
    return (
      <div className="users-page">
        <div style={{ textAlign: 'center', padding: '50px', fontSize: '18px' }}>
          Loading notifications...
        </div>
      </div>
    );
  }

  return (
    <div className="users-page">
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

      <div className="users-section">
        <h2>
          <IoWarningOutline /> Pending Approvals{" "}
          <span className="users-badge">{pendingApprovals.length}</span>
        </h2>

        {pendingApprovals.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
            No pending approvals
          </div>
        ) : (
          <div className="users-approval-list">
            {pendingApprovals.map((user) => (
              <div key={user.id} className="users-approval-card">
                <div>
                  <h3>{user.name}</h3>
                  <p>{user.email}</p>
                  <small style={{ color: '#666' }}>
                    {user.eventType.toUpperCase()} • {user.ipAddress} • {new Date(user.createdAt).toLocaleString()}
                  </small>
                </div>
                <div className="users-actions">
                  <button className="users-review" onClick={() => openModal(user)}>
                    <FaEye /> Review
                  </button>
                  <button 
                    className="users-approve" 
                    onClick={() => handleApprove(user.id, user.email)}
                    disabled={actionLoading === user.id}
                  >
                    <FaCheck /> {actionLoading === user.id ? 'Processing...' : 'Approve'}
                  </button>
                  <button 
                    className="users-reject" 
                    onClick={() => handleReject(user.id, user.email)}
                    disabled={actionLoading === user.id}
                  >
                    <FaTimes /> {actionLoading === user.id ? 'Processing...' : 'Reject'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rest of your code remains the same... */}
      <div className="users-section users-filter">
        <h2>Filter Users</h2>
        <div className="users-filter-controls">
          <input 
            type="text" 
            placeholder="Search users..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select onChange={(e) => setFilter({ ...filter, status: e.target.value })}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </select>
          <select onChange={(e) => setFilter({ ...filter, role: e.target.value })}>
            <option value="all">All Roles</option>
            <option value="individual">Individual</option>
            <option value="organization">Organization</option>
          </select>
          <button className="users-export-filter">
            <FaDownload /> Export Filtered
          </button>
        </div>
      </div>

      {/* Tables and Modal code remains same... */}
      <div className="users-section users-table">
        <h2>All Users ({filteredUsers.length})</h2>
        {/* Your existing table code */}
      </div>

      {showModal && selectedUser && (
        <div className="users-modal" onClick={closeModal}>
          <div className="users-modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>User Details</h2>
            <div style={{ marginTop: '20px' }}>
              <p><strong>Name:</strong> {selectedUser.name}</p>
              <p><strong>Email:</strong> {selectedUser.email}</p>
              {selectedUser.ipAddress && (
                <p><strong>IP Address:</strong> {selectedUser.ipAddress}</p>
              )}
              {selectedUser.eventType && (
                <p><strong>Event Type:</strong> {selectedUser.eventType.toUpperCase()}</p>
              )}
              {selectedUser.createdAt && (
                <p><strong>Date:</strong> {new Date(selectedUser.createdAt).toLocaleString()}</p>
              )}
            </div>
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
