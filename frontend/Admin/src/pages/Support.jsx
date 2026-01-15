import React, { useState } from "react";
import "../styles/Support.css";
import {
  FaHeadphones,
  FaFilter,
  FaEye,
  FaCommentDots,
} from "react-icons/fa";
import { PiFolderOpen } from "react-icons/pi";
import { GiProgression, GiBackwardTime } from "react-icons/gi";
import { MdDone, MdArchive } from "react-icons/md";
import { TiStarOutline } from "react-icons/ti";
import { IoMdAddCircle } from "react-icons/io";

const Support = () => {
  const [tickets, setTickets] = useState([
    {
      id: "TICK-2024-001",
      customer: "John Smith",
      email: "john.smith@email.com",
      subject: "EV credit verification delay",
      description:
        "Submitted Tesla Model 3 verification document but it's still pending.",
      priority: "HIGH",
      status: "Open",
      category: "Verification",
      assignedTo: "Sarah Admin",
      lastUpdate: "2024-06-15 14:30",
    },
    {
      id: "TICK-2024-002",
      customer: "ABC Corporation",
      email: "admin@abccorp.com",
      subject: "Transaction failed",
      description:
        "Payment processed but carbon credits not reflected in dashboard.",
      priority: "MEDIUM",
      status: "In Progress",
      category: "Marketplace",
      assignedTo: "Mike Admin",
      lastUpdate: "2024-06-15 09:15",
    },
    {
      id: "TICK-2024-003",
      customer: "Sarah Johnson",
      email: "sarah.j@email.com",
      subject: "Login issues",
      description: "Unable to login after password reset request.",
      priority: "LOW",
      status: "Resolved",
      category: "Account",
      assignedTo: "Admin Team",
      lastUpdate: "2024-06-14 11:45",
    },
    {
      id: "TICK-2024-004",
      customer: "GreenTech Solutions",
      email: "dev@greentech.com",
      subject: "API documentation request",
      description:
        "Need detailed API docs for carbon credit transactions.",
      priority: "MEDIUM",
      status: "Open",
      category: "Technical",
      assignedTo: "Tech Team",
      lastUpdate: "2024-06-15 16:20",
    },
  ]);

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [newTicket, setNewTicket] = useState({
    customer: "",
    email: "",
    subject: "",
    description: "",
    priority: "MEDIUM",
    status: "Open",
    category: "General",
    assignedTo: "",
  });

  const handleArchiveResolved = () => {
    setTickets((prev) =>
      prev.filter((t) => t.status.toLowerCase() !== "resolved")
    );
  };

  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleCreateTicketChange = (e) => {
    const { name, value } = e.target;
    setNewTicket((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateTicketSubmit = (e) => {
    e.preventDefault();
    const id = `TICK-${new Date().getTime()}`;
    const lastUpdate = new Date().toISOString().slice(0, 16).replace("T", " ");
    setTickets((prev) => [
      {
        id,
        ...newTicket,
        lastUpdate,
      },
      ...prev,
    ]);
    setNewTicket({
      customer: "",
      email: "",
      subject: "",
      description: "",
      priority: "MEDIUM",
      status: "Open",
      category: "General",
      assignedTo: "",
    });
    setIsCreateModalOpen(false);
  };

  const handleViewTicket = (ticket) => {
    setSelectedTicket(ticket);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedTicket(null);
  };

  const handleChat = (ticket) => {
    alert(`Open conversation for ${ticket.id}`);
  };

  return (
    <div className="support-page">
      {/* Header Section */}
      <div className="support-header">
        <div className="support-header-left">
          <div className="support-header-title">
            <FaHeadphones className="support-header-icon" color="#2563eb" />
            <div>
              <h1>Support Management</h1>
              <p>Manage customer support tickets and inquiries</p>
            </div>
          </div>
        </div>
        <div className="support-header-buttons">
          <button className="archive-btn" onClick={handleArchiveResolved}>
            <MdArchive color="#64748b" /> Archive Resolved
          </button>
          <button className="create-btn" onClick={handleOpenCreateModal}>
            <IoMdAddCircle color="#ffffff" /> Create Ticket
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="support-stats">
        <div className="support-card red">
          <h2>Open Tickets</h2>
          <PiFolderOpen className="card-icon" color="#ef4444" />
          <h3>7</h3>
          <p className="red-text">+2 from yesterday</p>
        </div>
        <div className="support-card yellow">
          <h2>In Progress</h2>
          <GiProgression className="card-icon" color="#eab308" />
          <h3>12</h3>
          <p className="yellow-text">-3 from yesterday</p>
        </div>
        <div className="support-card green">
          <h2>Resolved Today</h2>
          <MdDone className="card-icon" color="#16a34a" />
          <h3>8</h3>
          <p className="green-text">+5 from yesterday</p>
        </div>
        <div className="support-card blue">
          <h2>Avg Response Time</h2>
          <GiBackwardTime className="card-icon" color="#3b82f6" />
          <h3>2.5h</h3>
          <p className="blue-text">-0.5h from yesterday</p>
        </div>
      </div>

      {/* Filter Section */}
      <div className="support-filter">
        <h2>
          <FaFilter color="#0f172a" /> Filter Tickets
        </h2>
        <div className="support-filter-controls">
          <input type="text" placeholder="Search tickets..." />
          <select>
            <option>All Status</option>
            <option>Open</option>
            <option>In Progress</option>
            <option>Resolved</option>
          </select>
          <select>
            <option>All Priorities</option>
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
          <button className="starred-btn">
            <TiStarOutline color="#facc15" /> Starred Only
          </button>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="support-tickets">
        <h2>Support Tickets ({tickets.length})</h2>
        <table>
          <thead>
            <tr>
              <th>Ticket ID</th>
              <th>Customer</th>
              <th>Subject</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Category</th>
              <th>Assigned To</th>
              <th>Last Update</th>
              <th className="actions-header">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((t) => (
              <tr key={t.id}>
                <td>{t.id}</td>
                <td>
                  <div className="customer-info">
                    <div className="avatar">
                      {t.customer
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <strong>{t.customer}</strong>
                      <p>{t.email}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <strong>{t.subject}</strong>
                  <p>{t.description.slice(0, 60)}...</p>
                </td>
                <td>
                  <span
                    className={`priority ${t.priority.toLowerCase()}`}
                  >
                    {t.priority}
                  </span>
                </td>
                <td>
                  <span
                    className={`status ${t.status
                      .toLowerCase()
                      .replace(" ", "-")}`}
                  >
                    {t.status}
                  </span>
                </td>
                <td>
                  <span className="category">{t.category}</span>
                </td>
                <td>{t.assignedTo}</td>
                <td>{t.lastUpdate}</td>
                <td className="actions-cell">
                  <div className="actions">
                    <button
                      className="view-btn"
                      onClick={() => handleViewTicket(t)}
                      title="View details"
                    >
                      <FaEye color="#0f172a" />
                    </button>
                    <button
                      className="chat-btn"
                      onClick={() => handleChat(t)}
                      title="Open chat"
                    >
                      <FaCommentDots color="#ffffff" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* View Ticket Modal */}
      {isViewModalOpen && selectedTicket && (
        <div className="support-modal-overlay" onClick={handleCloseViewModal}>
          <div
            className="support-modal support-modal-compact"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="support-modal-header">
              <h3>
                <FaEye color="#0f172a" /> Ticket Details
              </h3>
              <button
                className="support-modal-close"
                onClick={handleCloseViewModal}
              >
                ✕
              </button>
            </div>
            <div className="support-modal-body support-modal-body-grid">
              <div>
                <span className="detail-label">Ticket ID</span>
                <span className="detail-value">{selectedTicket.id}</span>
              </div>
              <div>
                <span className="detail-label">Customer</span>
                <span className="detail-value">
                  {selectedTicket.customer} ({selectedTicket.email})
                </span>
              </div>
              <div>
                <span className="detail-label">Subject</span>
                <span className="detail-value">
                  {selectedTicket.subject}
                </span>
              </div>
              <div>
                <span className="detail-label">Priority</span>
                <span className="detail-value">
                  {selectedTicket.priority}
                </span>
              </div>
              <div>
                <span className="detail-label">Status</span>
                <span className="detail-value">
                  {selectedTicket.status}
                </span>
              </div>
              <div>
                <span className="detail-label">Category</span>
                <span className="detail-value">
                  {selectedTicket.category}
                </span>
              </div>
              <div>
                <span className="detail-label">Assigned To</span>
                <span className="detail-value">
                  {selectedTicket.assignedTo}
                </span>
              </div>
              <div>
                <span className="detail-label">Last Update</span>
                <span className="detail-value">
                  {selectedTicket.lastUpdate}
                </span>
              </div>
              <div className="detail-full">
                <span className="detail-label">Description</span>
                <span className="detail-value">
                  {selectedTicket.description}
                </span>
              </div>
            </div>
            <div className="support-modal-footer">
              <button
                className="support-modal-btn secondary"
                onClick={handleCloseViewModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Ticket Modal */}
      {isCreateModalOpen && (
        <div
          className="support-modal-overlay"
          onClick={handleCloseCreateModal}
        >
          <div
            className="support-modal support-modal-wide"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="support-modal-header">
              <h3>
                <IoMdAddCircle color="#16a34a" /> Create Ticket
              </h3>
              <button
                className="support-modal-close"
                onClick={handleCloseCreateModal}
              >
                ✕
              </button>
            </div>
            <div className="support-modal-body support-modal-body-form">
              <form
                className="support-modal-form"
                onSubmit={handleCreateTicketSubmit}
              >
                <div className="form-row">
                  <label>Customer Name</label>
                  <input
                    type="text"
                    name="customer"
                    value={newTicket.customer}
                    onChange={handleCreateTicketChange}
                    required
                  />
                </div>
                <div className="form-row">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={newTicket.email}
                    onChange={handleCreateTicketChange}
                    required
                  />
                </div>
                <div className="form-row">
                  <label>Subject</label>
                  <input
                    type="text"
                    name="subject"
                    value={newTicket.subject}
                    onChange={handleCreateTicketChange}
                    required
                  />
                </div>
                <div className="form-row">
                  <label>Description</label>
                  <textarea
                    name="description"
                    rows={3}
                    value={newTicket.description}
                    onChange={handleCreateTicketChange}
                    required
                  />
                </div>
                <div className="form-row form-row-grid">
                  <div>
                    <label>Priority</label>
                    <select
                      name="priority"
                      value={newTicket.priority}
                      onChange={handleCreateTicketChange}
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                  </div>
                  <div>
                    <label>Status</label>
                    <select
                      name="status"
                      value={newTicket.status}
                      onChange={handleCreateTicketChange}
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>
                  <div>
                    <label>Category</label>
                    <select
                      name="category"
                      value={newTicket.category}
                      onChange={handleCreateTicketChange}
                    >
                      <option value="General">General</option>
                      <option value="Verification">Verification</option>
                      <option value="Marketplace">Marketplace</option>
                      <option value="Account">Account</option>
                      <option value="Technical">Technical</option>
                    </select>
                  </div>
                  <div>
                    <label>Assigned To</label>
                    <input
                      type="text"
                      name="assignedTo"
                      value={newTicket.assignedTo}
                      onChange={handleCreateTicketChange}
                    />
                  </div>
                </div>
                <div className="support-modal-footer footer-spaced">
                  <button
                    type="button"
                    className="support-modal-btn secondary"
                    onClick={handleCloseCreateModal}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="support-modal-btn primary">
                    Create Ticket
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Support;