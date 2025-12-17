
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import "../styles/ViewAssets.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SustainableAssets = () => {
  const [evList, setEvList] = useState([]);
  const [solarList, setSolarList] = useState([]);
  const [treeList, setTreeList] = useState([]);
  const [modalContent, setModalContent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [initialFormData, setInitialFormData] = useState({});
  const [evTransactionList, setEvTransactionList] = useState([]);
  const [assetStatuses, setAssetStatuses] = useState({});

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const userId = storedUser?.u_id;

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "green";
      case "rejected":
        return "red";
      case "pending":
      default:
        return "yellow";
    }
  };

  useEffect(() => {
    const fetchAssetStatuses = async () => {
      try {
        const res = await fetch(`https://add-asset-service.onrender.com/api/assets/user/${userId}/status`);
        const data = await res.json();
        setAssetStatuses(data);
      } catch (error) {
        console.error("Failed to fetch asset statuses:", error);
      }
    };

    if (userId) fetchAssetStatuses();
  }, [userId]);

  const fetchData = async () => {
    try {
      const evRes = await axios.get(`https://add-asset-service.onrender.com/api/evmasterdata/${userId}`);
      setEvList(evRes.data.data);

      const solarRes = await axios.get(`https://add-asset-service.onrender.com/api/solarpanel/${userId}`);
      setSolarList(solarRes.data.data);

      const treeRes = await axios.get(`https://add-asset-service.onrender.com/api/tree/${userId}`);
      setTreeList(treeRes.data.data);
    } catch (error) {
      console.error("Error fetching assets:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getStatus = (id) => assetStatuses[id] || "Pending";

  const renderStatus = (id) => (
    <div className="asset-card-status">
      <span className={`asset-dot ${getStatusColor(getStatus(id))}`}></span>
      {getStatus(id).charAt(0).toUpperCase() + getStatus(id).slice(1)}
    </div>
  );

  const openModal = async (type, asset, assetType) => {
    setFormData(asset);
    setInitialFormData(asset);
    setIsEditing(false);
    if (assetType === "EV" && type === "View Details") {
      await handleViewDetails(asset.ev_id);
    }
    setModalContent({ type, asset, assetType });
  };

  const closeModal = () => {
    setModalContent(null);
    setIsEditing(false);
    setEvTransactionList([]);
  };

  const handleViewDetails = async (evId) => {
    try {
     const res = await axios.get(`https://add-asset-service.onrender.com/api/by-ev/${evId}`);
      console.log("Fetched transactions:", res.data); 
      const transactions = Array.isArray(res.data.data) ? res.data.data : [res.data.data];
      setEvTransactionList(res.data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setEvTransactionList([]);
    }
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
const handleSaveSolar = async () => {
  try {
    const originalData = initialFormData;
    const newData = formData;

    const keyMap = {
      installed_capacity: 'Installed_Capacity',
      installation_date: 'Installation_Date',
      energy_generation_value: 'Energy_Generation_Value',
      inverter_type: 'Inverter_Type'
    };

    const updatedFields = {};
    Object.keys(newData).forEach((key) => {
      const mappedKey = keyMap[key];
      if (mappedKey && newData[key] !== originalData[key]) {
        updatedFields[mappedKey] = newData[key];
      }
    });

    if (Object.keys(updatedFields).length === 0) {
      alert("No changes to update!");
      return;
    }

    await axios.put(
      `https://add-asset-service.onrender.com/api/solarpanel/${formData.suid}`,
      updatedFields
    );

    toast.success("Solar panel updated successfully!");

    const newFormData = {
      ...formData,
      ...Object.fromEntries(
        Object.entries(updatedFields).map(([backendKey, value]) => {
          const frontendKey = Object.keys(keyMap).find((k) => keyMap[k] === backendKey);
          return [frontendKey, value];
        })
      )
    };

    setFormData(newFormData);
    setInitialFormData(newFormData);

    setSolarList((prevList) =>
      prevList.map((item) =>
        item.suid === formData.suid ? { ...item, ...newFormData } : item
      )
    );

    setIsEditing(false);
  } catch (error) {
    console.error("Error updating Solar Panel:", error);
    alert("Failed to update Solar Panel!");
  }
};

  const handleSave = async () => {
    try {
      const originalData = initialFormData;
      const newData = formData;

      const keyMap = {
        vuid: 'VUID',
        u_id: 'U_ID',
        category: 'Category',
        manufacturers: 'Manufacturers',
        model: 'Model',
        purchase_year: 'Purchase_Year',
        energy_consumed: 'Energy_Consumed',
        primary_charging_type: 'Primary_Charging_Type',
        range: 'Range',
        grid_emission_factor: 'Grid_Emission_Factor',
        top_speed: 'Top_Speed',
        charging_time: 'Charging_Time',
        motor_power: 'Motor_Power'
      };

      const updatedFields = {};

      Object.keys(newData).forEach((key) => {
        const mappedKey = keyMap[key];
        if (mappedKey && newData[key] !== originalData[key]) {
          updatedFields[mappedKey] = newData[key];
        }
      });

      if (Object.keys(updatedFields).length === 0) {
        alert("No changes to update!");
        return;
      }

      await axios.put(
        `https://add-asset-service.onrender.com/api/evmasterdata/${formData.ev_id}`,
        updatedFields
      );

      toast.success("EV updated successfully!");

      const newFormData = {
        ...formData,
        ...Object.fromEntries(
          Object.entries(updatedFields).map(([backendKey, value]) => {
            const frontendKey = Object.keys(keyMap).find(
              (k) => keyMap[k] === backendKey
            );
            return [frontendKey, value];
          })
        )
      };

      setFormData(newFormData);
      setInitialFormData(newFormData);

      setEvList((prevList) =>
        prevList.map((item) =>
          item.ev_id === formData.ev_id ? { ...item, ...newFormData } : item
        )
      );

      setIsEditing(false);
    } catch (error) {
      console.error("Error updating EV:", error);
      alert("Failed to update EV!");
    }
  };

  const renderModalContent = () => {
    if (!modalContent) return null;

    const { type, assetType } = modalContent;

    const formatKey = (key) => {
      return key
        .replace(/_/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());
    };

    return (
      <motion.div
        className="asset-modal-content"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close-cross" onClick={closeModal}>
          &times;
        </button>

        <h2>View Details</h2>
        {type === "View Details" ? (
          <>
            {assetType === "EV" ? (
              <div className="asset-details-all">
                {Object.entries(formData)
                  .filter(([key]) =>
                    !["vuid", "u id", "u_id", "v_uid", "ev_id"].includes(key.toLowerCase())
                  )
                  .map(([key, value]) => (
                    <p key={key}>
                      <strong>{formatKey(key)}:</strong>{" "}
                      {isEditing ? (
                        <input
                          type="text"
                          name={key}
                          value={value || ""}
                          onChange={handleInputChange}
                        />
                      ) : (
                        value === null || value === "" ? "N/A" : value.toString()
                      )}
                    </p>
                  ))}

            
<h3>Transactions</h3>
{Array.isArray(evTransactionList) && evTransactionList.filter(Boolean).length > 0 ? (
  <table>
    <thead>
      <tr>
        <th>Transaction ID</th>
        <th>Active Distance</th>
        <th>Date</th>
      </tr>
    </thead>
    <tbody>
      {evTransactionList
        .filter(Boolean)
        .map((item) => (
          <tr key={item.ev_tran_id}>
            <td>{item.ev_tran_id}</td>
            <td>{item.active_distance}</td>
            <td>{new Date(item.created_date).toLocaleDateString()}</td>
          </tr>
        ))}
    </tbody>
  </table>
) : (
  <p>No transactions yet.</p>
)}




                <button
                  onClick={() => {
                    if (isEditing) {
                      handleSave();
                    } else {
                      setIsEditing(true);
                    }
                  }}
                  className="asset-update-button"
                >
                  {isEditing ? "Save" : "Update"}
                </button>
              </div>
            ) : assetType === "Solar" ? (
              <>
                <p><strong>Capacity:</strong> {modalContent.asset.installed_capacity || "N/A"} kW</p>
                <p><strong>Installation Date:</strong> {modalContent.asset.installation_date || "N/A"}</p>
                <p><strong>Generation:</strong> {modalContent.asset.energy_generation_value ? `${modalContent.asset.energy_generation_value} kWh` : "N/A"}</p>
                <p><strong>Inverter Type:</strong> {modalContent.asset.inverter_type || "N/A"}</p>
                <button className="asset-update-button">Update</button>
              </>
            ) : (
              <>
                <p><strong>Tree Name:</strong> {modalContent.asset.treename || "N/A"}</p>
                <p><strong>Botanical Name:</strong> {modalContent.asset.botanicalname || "N/A"}</p>
                <p><strong>Planting Date:</strong> {modalContent.asset.plantingdate ? new Date(modalContent.asset.plantingdate).toLocaleDateString() : "N/A"}</p>
                <p><strong>DBH:</strong> {modalContent.asset.dbh ? `${modalContent.asset.dbh} cm` : "N/A"}</p>
                <p><strong>Height:</strong> {modalContent.asset.height ? `${modalContent.asset.height} m` : "N/A"}</p>
                <p><strong>Location:</strong> {modalContent.asset.location || "N/A"}</p>
                <p><strong>Photo:</strong></p>
                <div className="tree-photo-gallery">
                  {modalContent.asset.imageurl ? (
                    <img src={modalContent.asset.imageurl} alt="Tree" className="tree-photo-thumbnail" />
                  ) : (
                    <p>No photos available.</p>
                  )}
                </div>
                <button className="asset-update-button">Update</button>
              </>
            )}
          </>
        ) : type === "Add Details" && assetType === "EV" ? (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                const payload = {
                  ev_id: modalContent.asset.ev_id,
                  active_distance: formData.active_distance,
                };
                await axios.post("https://add-asset-service.onrender.com/api/evtransaction", payload);
                alert("Transaction added successfully!");
                closeModal();
              } catch (error) {
                console.error("Error adding transaction:", error);
                alert("Failed to add transaction");
              }
            }}
          >
            <p>
              <strong>Active Distance (km):</strong>
              <input
                type="number"
                name="active_distance"
                value={formData.active_distance || ""}
                onChange={handleInputChange}
                required
              />
            </p>
            <button type="submit" className="asset-update-button">Submit</button>
            <button onClick={closeModal} type="button" className="asset-close-button">Close</button>
          </form>
        ) : null}
      </motion.div>
    );
  };

  return (
    <div className="sustainable-assets">
      <ToastContainer />
      <h1 className="main-heading">My Sustainable Assets</h1>
      <p className="main-subheading">Building a greener future, one asset at a time</p>

      {/* EV Section */}
      <h2 className="section-heading">EVs</h2>
      {evList.length === 0 ? (
        <p>No EV assets listed yet.</p>
      ) : (
        <div className="asset-cards-container">
          {evList.map((ev, idx) => (
            <div key={`ev-${idx}`} className="asset-card">
              <div className="asset-card-top">
                <div className="asset-card-status">
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      color: "#000" // optional text color
                    }}
                  >
                    <span
                      style={{
                        display: "inline-block",
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        backgroundColor:
                          (assetStatuses[ev.ev_id] || "pending").toLowerCase() === "approved"
                            ? "#28a745" // Green
                            : (assetStatuses[ev.ev_id] || "pending").toLowerCase() === "rejected"
                              ? "#dc3545" // Red
                              : "#ffc107" // Yellow (for pending or default)
                      }}
                    ></span>
                    {(assetStatuses[ev.ev_id] || "Pending")
                      .charAt(0)
                      .toUpperCase() +
                      (assetStatuses[ev.ev_id] || "Pending").slice(1).toLowerCase()}
                  </span>

                </div>

                <span className="asset-badge">EV</span>
              </div>
              <div className="asset-card-inner">
                <h2>{ev.model || "Unnamed EV"}</h2>
                <p className="asset-subtitle">{ev.manufacturers || "Unknown Manufacturer"}</p>
                <div className="asset-info-box">
                  <p><strong>Year:</strong> {ev.purchase_year || "N/A"}</p>
                  <p><strong>Range:</strong> {ev.range ? `${ev.range} km` : "N/A"}</p>
                  <p><strong>Top Speed:</strong> {ev.top_speed ? `${ev.top_speed} km/h` : "N/A"}</p>
                </div>
                <div className="asset-card-buttons">
                  <button
                    onClick={() => openModal("View Details", ev, "EV")}
                    className="asset-view-button"
                  >
                    View
                  </button>
                  <button
                    onClick={() => openModal("Add Details", ev, "EV")}
                    className="asset-add-button"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Solar Section */}
      <h2 className="section-heading">Solar Panels</h2>
      {solarList.length === 0 ? (
        <p>No Solar Panel assets listed yet.</p>
      ) : (
        <div className="asset-cards-container">
          {solarList.map((solar, idx) => (
            <div key={`solar-${idx}`} className="asset-card">
              <div className="asset-card-top">
                <div className="asset-card-status">
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      color: "#000" // optional text color
                    }}
                  >
                    <span
                      style={{
                        display: "inline-block",
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        backgroundColor:
                          (assetStatuses[solar.suid] || "pending").toLowerCase() === "approved"
                            ? "#28a745" // Green
                            : (assetStatuses[solar.suid] || "pending").toLowerCase() === "rejected"
                              ? "#dc3545" // Red
                              : "#ffc107" // Yellow
                      }}
                    ></span>
                    {(assetStatuses[solar.suid] || "Pending")
                      .charAt(0)
                      .toUpperCase() +
                      (assetStatuses[solar.suid] || "Pending").slice(1).toLowerCase()}
                  </span>

                </div>

                <span className="asset-badge">Solar</span>
              </div>
              <div className="asset-card-inner">
                <h2 className="asset-subtitle">{solar.inverter_type || "Unknown Inverter"}</h2>
                <div className="asset-info-box">
                  <p><strong>Capacity:</strong> {solar.installed_capacity ? `${solar.installed_capacity} kW` : "N/A"}</p>
                  <p><strong>Generation:</strong> {solar.energy_generation_value ? `${solar.energy_generation_value} kWh` : "N/A"}</p>
                </div>
                <div className="asset-card-buttons">
                  <button
                    onClick={() => openModal("View Details", solar, "Solar")}
                    className="asset-view-button"
                  >
                    View
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Trees Section */}
      <h2 className="section-heading">Trees</h2>
      {treeList.length === 0 ? (
        <p>No Tree assets listed yet.</p>
      ) : (
        <div className="asset-cards-container">
          {treeList.map((tree, idx) => (
            <div key={`tree-${idx}`} className="asset-card">
              <div className="asset-card-top">
                <div className="asset-card-status">
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      color: "#000" // optional: adjust if needed
                    }}
                  >
                    <span
                      style={{
                        display: "inline-block",
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        backgroundColor:
                          (assetStatuses[tree.tid] || "pending").toLowerCase() === "approved"
                            ? "#28a745" // Green
                            : (assetStatuses[tree.tid] || "pending").toLowerCase() === "rejected"
                              ? "#dc3545" // Red
                              : "#ffc107" // Yellow
                      }}
                    ></span>
                    {(assetStatuses[tree.tid] || "Pending")
                      .charAt(0)
                      .toUpperCase() +
                      (assetStatuses[tree.tid] || "Pending").slice(1).toLowerCase()}
                  </span>

                </div>

                <span className="asset-badge">Tree</span>
              </div>
              <div className="asset-card-inner">
                <h2>{tree.treename || "Unnamed Tree"}</h2>
                <p className="asset-subtitle">{tree.botanicalname || "Unknown Botanical Name"}</p>
                <div className="asset-info-box">
                  <p><strong>Height:</strong> {tree.height ? `${tree.height} m` : "N/A"}</p>
                  <p><strong>Location:</strong> {tree.location || "N/A"}</p>
                </div>
                <div className="asset-card-buttons">
                  <button
                    onClick={() => openModal("View Details", tree, "Tree")}
                    className="asset-view-button"
                  >
                    View
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {modalContent && (
          <motion.div
            className="asset-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            {renderModalContent()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SustainableAssets;