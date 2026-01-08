import React, { useState } from "react";
import {
  FaCarSide,
  FaTree,
  FaSolarPanel,
  FaClock,
  FaCircleCheck,
  FaCircleXmark,
  FaDownload,
  FaClockRotateLeft,
} from "react-icons/fa6";

import "../styles/AssetManagement.css";

const AssetManagement = () => {
  const [activeSubmitterTab, setActiveSubmitterTab] = useState("individual");
  const [activeAssetFilter, setActiveAssetFilter] = useState("tree");
  const [activeWorkflowTab, setActiveWorkflowTab] = useState("pendingRequests");
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);

  const metrics = {
    totalEV: 2,
    totalTrees: 2,
    totalSolar: 2,
    pendingReview: 2,
    pendingApproval: 0,
    approved: 3,
    rejected: 1,
  };

  const workflowAssets = [
    {
      id: 1,
      type: "Electric Vehicle",
      status: "Pending Review",
      submittedBy: "John Doe",
      submittedOn: "08/01/2025",
      category: "Sedan",
      manufacturer: "Tesla",
      model: "Model 3",
      year: 2022,
      energyConsumed: 75,
      range: 300,
      topSpeed: 180,
      chargingTime: 8,
    },
    {
      id: 2,
      type: "Trees",
      status: "Pending Review",
      submittedBy: "Green Org",
      submittedOn: "07/01/2025",
      category: "Community Plantation",
      manufacturer: "",
      model: "",
      year: 2025,
      energyConsumed: "",
      range: "",
      topSpeed: "",
      chargingTime: "",
    },
  ];

  const approvedAssets = [
    {
      id: 101,
      type: "Trees",
      status: "Approved",
      submittedBy: "Sarah Smith",
      submittedOn: "04/01/2025",
    },
  ];

  /* ---------- CSV EXPORT HELPERS ---------- */

  const convertToCsv = (rows) => {
    if (!rows || rows.length === 0) return "";

    const headers = Object.keys(rows[0]);
    const escape = (value) => {
      if (value === null || value === undefined) return "";
      const str = String(value);
      // escape quotes
      const escaped = str.replace(/"/g, '""');
      // wrap if contains comma, quote, or newline
      return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped;
    };

    const csvLines = [
      headers.join(","), // header row
      ...rows.map((row) => headers.map((h) => escape(row[h])).join(",")),
    ];

    return csvLines.join("\n");
  };

  const downloadCsv = (rows, filename) => {
    const csv = convertToCsv(rows);
    if (!csv) return;

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.setAttribute("download", filename);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExport = () => {
    // combine data you want to export; here using workflow + approved assets
    const rows = [
      ...workflowAssets.map((a) => ({
        id: a.id,
        type: a.type,
        status: a.status,
        submittedBy: a.submittedBy,
        submittedOn: a.submittedOn,
        category: a.category,
        manufacturer: a.manufacturer,
        model: a.model,
        year: a.year,
        energyConsumed: a.energyConsumed,
        range: a.range,
        topSpeed: a.topSpeed,
        chargingTime: a.chargingTime,
      })),
      ...approvedAssets.map((a) => ({
        id: a.id,
        type: a.type,
        status: a.status,
        submittedBy: a.submittedBy,
        submittedOn: a.submittedOn,
      })),
    ];

    downloadCsv(rows, "asset-management-export.csv");
  };

  /* ---------- MODAL / WORKFLOW HANDLERS ---------- */

  const openReviewModal = (asset) => {
    setSelectedAsset(asset);
    setReviewModalOpen(true);
  };

  const closeReviewModal = () => {
    setReviewModalOpen(false);
    setSelectedAsset(null);
  };

  const handleAccept = (assetId) => {
    console.log("Accept asset", assetId);
    closeReviewModal();
  };

  const handleReject = (assetId) => {
    console.log("Reject asset", assetId);
    closeReviewModal();
  };

  return (
    <div className="am26-page">
      {/* Top heading + export */}
      <div className="am26-page-header">
        <div>
          <h1 className="am26-page-title">Asset Management</h1>
          <p className="am26-page-subtitle">
            Review and manage user-submitted assets
          </p>
        </div>
        <button className="am26-export-btn" onClick={handleExport}>
          <FaDownload className="am26-export-icon" />
          Export Data
        </button>
      </div>

      {/* Summary cards */}
      <div className="am26-summary-row">
        <div className="am26-summary-card am26-summary-blue">
          <div className="am26-summary-label">Total Electric Vehicles</div>
          <div className="am26-summary-bottom">
            <span className="am26-summary-value">{metrics.totalEV}</span>
            <FaCarSide className="am26-summary-icon am26-icon-ev" />
          </div>
        </div>
        <div className="am26-summary-card am26-summary-green">
          <div className="am26-summary-label">Total Trees Planted</div>
          <div className="am26-summary-bottom">
            <span className="am26-summary-value">{metrics.totalTrees}</span>
            <FaTree className="am26-summary-icon am26-icon-tree" />
          </div>
        </div>
        <div className="am26-summary-card am26-summary-orange">
          <div className="am26-summary-label">Total Solar Panels</div>
          <div className="am26-summary-bottom">
            <span className="am26-summary-value">{metrics.totalSolar}</span>
            <FaSolarPanel className="am26-summary-icon am26-icon-solar" />
          </div>
        </div>
      </div>

      {/* Status cards row */}
      <div className="am26-status-row">
        <div className="am26-status-card">
          <div className="am26-status-label">Pending Review</div>
          <div className="am26-status-bottom">
            <span className="am26-status-value">{metrics.pendingReview}</span>
            <FaClock className="am26-status-icon am26-icon-pending" />
          </div>
        </div>
        <div className="am26-status-card">
          <div className="am26-status-label">Pending Approval</div>
          <div className="am26-status-bottom">
            <span className="am26-status-value">
              {metrics.pendingApproval}
            </span>
            <FaClockRotateLeft className="am26-status-icon am26-icon-pending-approval" />
          </div>
        </div>
        <div className="am26-status-card">
          <div className="am26-status-label">Approved</div>
          <div className="am26-status-bottom">
            <span className="am26-status-value">{metrics.approved}</span>
            <FaCircleCheck className="am26-status-icon am26-icon-approved" />
          </div>
        </div>
        <div className="am26-status-card">
          <div className="am26-status-label">Rejected</div>
          <div className="am26-status-bottom">
            <span className="am26-status-value">{metrics.rejected}</span>
            <FaCircleXmark className="am26-status-icon am26-icon-rejected" />
          </div>
        </div>
      </div>

      {/* Asset Review Workflow */}
      <section className="am26-review-section">
        <div className="am26-review-header">
          <h2 className="am26-section-title">Asset Review Workflow</h2>
          <p className="am26-section-subtitle">
            Manage submissions through review and approval stages
          </p>
        </div>

        <div className="am26-tabs-row">
          <button
            className={
              activeWorkflowTab === "pendingRequests"
                ? "am26-tab am26-tab-active"
                : "am26-tab"
            }
            onClick={() => setActiveWorkflowTab("pendingRequests")}
          >
            Pending Requests ({workflowAssets.length})
          </button>
          <button
            className={
              activeWorkflowTab === "pendingApproval"
                ? "am26-tab am26-tab-active"
                : "am26-tab"
            }
            onClick={() => setActiveWorkflowTab("pendingApproval")}
          >
            Pending Approval
          </button>
          <button
            className={
              activeWorkflowTab === "rejected"
                ? "am26-tab am26-tab-active"
                : "am26-tab"
            }
            onClick={() => setActiveWorkflowTab("rejected")}
          >
            Rejected ({metrics.rejected})
          </button>
        </div>

        <div className="am26-search-row">
          <input
            className="am26-search-input"
            type="text"
            placeholder="Search assets by name or type..."
          />
        </div>

        <div className="am26-workflow-list">
          {workflowAssets.map((asset) => (
            <div key={asset.id} className="am26-workflow-item">
              <div className="am26-workflow-main">
                <div className="am26-workflow-icon-wrap">
                  {asset.type === "Electric Vehicle" && (
                    <FaCarSide className="am26-workflow-icon am26-icon-ev" />
                  )}
                  {asset.type === "Trees" && (
                    <FaTree className="am26-workflow-icon am26-icon-tree" />
                  )}
                  {asset.type === "Solar Panel" && (
                    <FaSolarPanel className="am26-workflow-icon am26-icon-solar" />
                  )}
                </div>
                <div>
                  <div className="am26-workflow-title">{asset.type}</div>
                  <div className="am26-workflow-meta">
                    <span>Submitted by {asset.submittedBy}</span>
                    <span className="am26-workflow-dot">•</span>
                    <span>{asset.submittedOn}</span>
                    <span className="am26-workflow-status am26-pill-pending">
                      {asset.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="am26-workflow-actions">
                <button
                  className="am26-button am26-btn-primary"
                  onClick={() => handleAccept(asset.id)}
                >
                  Accept
                </button>
                <button
                  className="am26-button am26-btn-outline"
                  onClick={() => openReviewModal(asset)}
                >
                  Review
                </button>
                <button
                  className="am26-button am26-btn-danger"
                  onClick={() => handleReject(asset.id)}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Asset Management list */}
      <section className="am26-asset-section">
        <div className="am26-asset-header-row">
          <h2 className="am26-section-title">Asset Management</h2>
          <p className="am26-section-subtitle">
            View and manage approved assets by submitter type
          </p>
        </div>

        <div className="am26-submitters-tabs">
          <button
            className={
              activeSubmitterTab === "individual"
                ? "am26-submitters-tab am26-submitters-tab-active"
                : "am26-submitters-tab"
            }
            onClick={() => setActiveSubmitterTab("individual")}
          >
            Individual Assets
          </button>
          <button
            className={
              activeSubmitterTab === "organisation"
                ? "am26-submitters-tab am26-submitters-tab-active"
                : "am26-submitters-tab"
            }
            onClick={() => setActiveSubmitterTab("organisation")}
          >
            Organisation Assets
          </button>
        </div>

        <div className="am26-filter-card">
          <div className="am26-filter-title">Filters</div>
          <div className="am26-filter-content">
            <input
              type="text"
              className="am26-filter-search"
              placeholder="Search by asset name or submitter..."
            />
            <select className="am26-filter-status">
              <option>All Status</option>
              <option>Approved</option>
              <option>Pending Review</option>
              <option>Rejected</option>
            </select>
          </div>

          <div className="am26-asset-type-tabs">
            <button
              className={
                activeAssetFilter === "ev"
                  ? "am26-asset-type-tab am26-asset-type-active"
                  : "am26-asset-type-tab"
              }
              onClick={() => setActiveAssetFilter("ev")}
            >
              <FaCarSide className="am26-asset-type-icon am26-icon-ev" />
              EV
            </button>
            <button
              className={
                activeAssetFilter === "solar"
                  ? "am26-asset-type-tab am26-asset-type-active"
                  : "am26-asset-type-tab"
              }
              onClick={() => setActiveAssetFilter("solar")}
            >
              <FaSolarPanel className="am26-asset-type-icon am26-icon-solar" />
              Solar Panel
            </button>
            <button
              className={
                activeAssetFilter === "tree"
                  ? "am26-asset-type-tab am26-asset-type-active"
                  : "am26-asset-type-tab"
              }
              onClick={() => setActiveAssetFilter("tree")}
            >
              <FaTree className="am26-asset-type-icon am26-icon-tree" />
              Tree
            </button>
          </div>
        </div>

        <div className="am26-approved-list">
          {approvedAssets.map((asset) => (
            <div key={asset.id} className="am26-approved-item">
              <div className="am26-approved-left">
                <div className="am26-approved-icon-wrap">
                  <FaTree className="am26-approved-icon am26-icon-tree" />
                </div>
                <div>
                  <div className="am26-approved-title">{asset.type}</div>
                  <div className="am26-approved-meta">
                    <span>Submitted by {asset.submittedBy}</span>
                    <span className="am26-workflow-dot">•</span>
                    <span>{asset.submittedOn}</span>
                  </div>
                </div>
              </div>
              <span className="am26-pill-approved">Approved</span>
            </div>
          ))}
        </div>
      </section>

      {/* Review Modal */}
      {reviewModalOpen && selectedAsset && (
        <div className="am26-modal-overlay" onClick={closeReviewModal}>
          <div
            className="am26-modal"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <div className="am26-modal-header">
              <div className="am26-modal-title-wrap">
                {selectedAsset.type === "Electric Vehicle" && (
                  <FaCarSide className="am26-modal-icon am26-icon-ev" />
                )}
                {selectedAsset.type === "Trees" && (
                  <FaTree className="am26-modal-icon am26-icon-tree" />
                )}
                {selectedAsset.type === "Solar Panel" && (
                  <FaSolarPanel className="am26-modal-icon am26-icon-solar" />
                )}
                <div>
                  <div className="am26-modal-title">
                    {selectedAsset.type} Details
                  </div>
                  <div className="am26-modal-submitted">
                    Submitted by {selectedAsset.submittedBy}
                  </div>
                </div>
              </div>
              <button className="am26-modal-close" onClick={closeReviewModal}>
                ✕
              </button>
            </div>

            <div className="am26-modal-meta-row">
              <div className="am26-modal-meta-item">
                <div className="am26-modal-meta-label">Asset Type</div>
                <div className="am26-modal-meta-value">
                  {selectedAsset.type}
                </div>
              </div>
              <div className="am26-modal-meta-item">
                <div className="am26-modal-meta-label">Status</div>
                <span className="am26-pill-pending">Pending Review</span>
              </div>
              <div className="am26-modal-meta-item">
                <div className="am26-modal-meta-label">Submitted By</div>
                <div className="am26-modal-meta-value">
                  {selectedAsset.submittedBy}
                </div>
              </div>
              <div className="am26-modal-meta-item">
                <div className="am26-modal-meta-label">Submitted On</div>
                <div className="am26-modal-meta-value">
                  {selectedAsset.submittedOn}
                </div>
              </div>
            </div>

            <div className="am26-modal-section-title">Asset Details</div>
            <div className="am26-modal-details-grid">
              <div className="am26-modal-detail">
                <div className="am26-modal-detail-label">Category</div>
                <div className="am26-modal-detail-value">
                  {selectedAsset.category || "-"}
                </div>
              </div>
              <div className="am26-modal-detail">
                <div className="am26-modal-detail-label">Manufacturer</div>
                <div className="am26-modal-detail-value">
                  {selectedAsset.manufacturer || "-"}
                </div>
              </div>
              <div className="am26-modal-detail">
                <div className="am26-modal-detail-label">Model</div>
                <div className="am26-modal-detail-value">
                  {selectedAsset.model || "-"}
                </div>
              </div>
              <div className="am26-modal-detail">
                <div className="am26-modal-detail-label">Year</div>
                <div className="am26-modal-detail-value">
                  {selectedAsset.year || "-"}
                </div>
              </div>
              <div className="am26-modal-detail">
                <div className="am26-modal-detail-label">Energy Consumed</div>
                <div className="am26-modal-detail-value">
                  {selectedAsset.energyConsumed || "-"}
                </div>
              </div>
              <div className="am26-modal-detail">
                <div className="am26-modal-detail-label">Range</div>
                <div className="am26-modal-detail-value">
                  {selectedAsset.range || "-"}
                </div>
              </div>
              <div className="am26-modal-detail">
                <div className="am26-modal-detail-label">Top Speed</div>
                <div className="am26-modal-detail-value">
                  {selectedAsset.topSpeed || "-"}
                </div>
              </div>
              <div className="am26-modal-detail">
                <div className="am26-modal-detail-label">Charging Time</div>
                <div className="am26-modal-detail-value">
                  {selectedAsset.chargingTime || "-"}
                </div>
              </div>
            </div>

            <div className="am26-modal-footer">
              <button
                className="am26-button am26-btn-danger"
                onClick={() => handleReject(selectedAsset.id)}
              >
                Reject
              </button>
              <button
                className="am26-button am26-btn-primary"
                onClick={() => handleAccept(selectedAsset.id)}
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetManagement;