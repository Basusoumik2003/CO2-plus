import React from "react";
import { FaLeaf, FaCar, FaSun } from "react-icons/fa";
import { GiRank3 } from "react-icons/gi";
import { MdOutlineAttachMoney } from "react-icons/md";
import "../styles/cardsection.css";

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      {/* Top Summary Cards */}
      <div className="summary-cards">
  <div className="card">
    <h4>
      Total Credits <FaLeaf className="icon green" />
    </h4>
    <p className="value">0.00</p>
    <span className="change red">No change in credits 🤝</span>
  </div>

  <div className="card">
    <h4>
      CO₂ Offset <FaLeaf className="icon green" />
    </h4>
    <p className="value green">0.0 tons</p>
    <span className="change green">+0.0% Higher offset!</span>
  </div>

  <div className="card">
    <h4>
      Value Created <MdOutlineAttachMoney className="icon orange" />
    </h4>
    <p className="value orange">₹0</p>
    <span className="change orange">+0.0% Impact</span>
  </div>

  <div className="card">
    <h4>
      Rank <GiRank3 className="icon blue" />
    </h4>
    <p className="value blue">#10000</p>
    <span className="change">Top 100.0% globally</span>
  </div>
</div>


      {/* Bottom Feature Cards */}
      <div className="feature-cards">
        <div className="feature-card">
          <h4>
            <FaCar className="icon blue" /> Electric Vehicles{" "}
            <span className="tag blue">Live EVs: 0</span>
          </h4>
          <p>Total Distance <span>0 km</span></p>
          <p>CO₂ Saved <span>0 kg</span></p>
          <p>Credits Earned <span>0</span></p>
        </div>

        <div className="feature-card">
          <h4>
            <FaLeaf className="icon green" /> Tree Plantations{" "}
            <span className="tag green">Growing: 0</span>
          </h4>
          <p>Trees Planted <span>0</span></p>
          <p>CO₂ Absorbed <span>0 kg</span></p>
          <p>Credits Earned <span>0</span></p>
        </div>

        <div className="feature-card">
          <h4>
            <FaSun className="icon orange" /> Solar Energy{" "}
            <span className="tag orange">Generating: 0</span>
          </h4>
          <p>Energy Generated <span>0 kWh</span></p>
          <p>Bill Saved <span>₹0</span></p>
          <p>Credits Earned <span>0</span></p>
          <div className="weather-box">
            <p>
              🌤 Today’s Weather: <span>Sunny, 28°C – Optimal for solar generation</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
