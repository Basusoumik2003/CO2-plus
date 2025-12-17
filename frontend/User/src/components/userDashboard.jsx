import React, { useState, useEffect } from "react";
import { FaLeaf, FaCar, FaSun } from "react-icons/fa";
import { GiRank3 } from "react-icons/gi";
import { MdOutlineAttachMoney } from "react-icons/md";
import { Eye } from "lucide-react";
import Navbar from "./userNavbar";
// import Card from "./Card";
// import Panel from "./Panel";
// import InfoBlock from "./InfoBlock";
import ActivityItem from "./ActivityItem";
// import VehicleItem from "./VehicleItem";
// import RecentItem from "./RecentItem";
import Footer from  "./Footer";
import '../styles/userDashboard.css';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Wallet from "../pages/wallet";

import Cardsection from "./cardsection";

const UserDashboard = () => {
  const navigate = useNavigate();
  const [evList, setEvList] = useState([]);
  const [solarList, setSolarList] = useState([]);
  const [treeList, setTreeList] = useState([]);
  const [percentChange, setPercentChange] = useState(0);
  const [backendCredits, setBackendCredits] = useState(0);
  const [totalCredits, setTotalCredits] = useState(0);

  const [credit, setCredit] = useState(0);
  const userId = localStorage.getItem("userId");


  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const userId = localStorage.getItem("userId");
        console.log("Fetched userId:", userId);

        // Fetch EVs
        const evRes = await axios.get(`https://add-asset-service.onrender.com/api/evmasterdata/${userId}`);
        console.log("EV API response:", evRes.data);
        setEvList(evRes.data.data);

        // Fetch Solar
        const solarRes = await axios.get(`https://add-asset-service.onrender.com/api/solarpanel/${userId}`);
        console.log("Solar API response:", solarRes.data);
        setSolarList(solarRes.data.data);

        // ✅ Fetch Trees
        const treeRes = await axios.get(`https://add-asset-service.onrender.com/api/tree/${userId}`);
        console.log("Tree API response:", treeRes.data);
        setTreeList(treeRes.data.data);

      } catch (error) {
        console.error("Error fetching assets:", error);
      }
    };

    fetchAssets();
  }, []);





  useEffect(() => {
    history.pushState(null, null, window.location.href);
    window.onpopstate = function () {
      history.go(1);
    };
    return () => {
      window.onpopstate = null;
    };
  }, []);

  const handleQuickAdd = () => {
    navigate("/upload");
    updatePrevCredits(); // ✅ Yahan update karo jab user manually add kare
  };


  const handleViewAssets = () => {
    navigate("/view-assets");
  };

  const [openIndex, setOpenIndex] = useState(null);
  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Recent Activity logic
  const [activityList, setActivityList] = useState([]);
  const [loadingActivity, setLoadingActivity] = useState(true);

  useEffect(() => {
    const fetchRecentActivity = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        const userId = storedUser?.u_id;

        if (!userId) {
          console.error("User ID not found in localStorage");
          setLoadingActivity(false);
          return;
        }

        // Fetch EV data
        const evRes = await fetch(`https://add-asset-service.onrender.com/api/evmasterdata/${userId}`);
        const evData = await evRes.json();
        const evActivities = (evData.status === "success" && evData.data.length > 0)
          ? evData.data.map(item => ({
            type: "EV",
            detail: item.manufacturers,
            year: item.purchase_year || "N/A",
            range: item.range ? `${item.range} km` : "N/A",
            topSpeed: item.top_speed ? `${item.top_speed} km/h` : "N/A",
            time: "Just now",
            credits: "+50",
          }))
          : [];

        // Fetch Solar data
        const solarRes = await fetch(`https://add-asset-service.onrender.com/api/solarpanel/${userId}`);
        const solarData = await solarRes.json();
        const solarActivities = (solarData.status === "success" && solarData.data.length > 0)
          ? solarData.data.map(item => ({
            type: "Solar",
            detail: item.inverter_type || "Unknown Inverter",
            year: item.installation_date ? item.installation_date.slice(0, 10) : "N/A",
            generation: item.energy_generation_value ? `${item.energy_generation_value} kWh` : "N/A",
            time: "Just now",
            credits: "+50",
          }))
          : [];

        // ✅ Fetch Tree data
        const treeRes = await fetch(`https://add-asset-service.onrender.com/api/tree/${userId}`);
        const treeData = await treeRes.json();
        const treeActivities = (treeData.status === "success" && treeData.data.length > 0)
          ? treeData.data.map(item => ({
            type: "Tree",
            treename: item.treename || "Unknown Tree",
            plantingdate: item.plantingdate ? new Date(item.plantingdate).toLocaleDateString() : "N/A",
            location: item.location || "N/A",
            height: item.height ? item.height : "N/A",
            dbh: item.dbh ? item.dbh : "N/A",
            time: "Just now",
            credits: "+50",
          }))
          : [];

        // Merge all activities
        const allActivities = [...evActivities, ...solarActivities, ...treeActivities];

        // ✅ Sort by time or add latest first if needed
        setActivityList(allActivities.reverse());

      } catch (error) {
        console.error("Failed to fetch recent activity:", error);
        setActivityList([]);
      } finally {
        setLoadingActivity(false);
      }
    };

    fetchRecentActivity();
  }, []);


  useEffect(() => {
    const sum = activityList.reduce((acc, item) => {
      const creditsValue = parseInt(item.credits.replace("+", ""), 10) || 0;
      return acc + creditsValue;
    }, 0);
    setTotalCredits(sum);
  }, [activityList]);


  useEffect(() => {
    if (!userId) return;

    const initCredit = async () => {
      await fetch("https://add-asset-service.onrender.com/api/credits/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: userId }),
      });
    };

    const fetchCredit = async () => {
      const res = await fetch(`https://add-asset-service.onrender.com/api/credits/${userId}`);
      const data = await res.json();
      setCredit(data.token_value || 0);
    };

    initCredit().then(fetchCredit);
  }, [userId]);


  useEffect(() => {
    if (backendCredits === 0) {
      setPercentChange(0);
    } else if (totalCredits !== backendCredits) {
      const change = ((totalCredits - backendCredits) / backendCredits) * 100;
      setPercentChange(change);
    } else {
      setPercentChange(0);
    }
  }, [totalCredits, backendCredits]);

  useEffect(() => {
    if (activityList.length > 0) {
      updateCreditsOnBackend();
    }
  }, [activityList]);

  const updateCreditsOnBackend = async () => {
    try {
      const uid = localStorage.getItem("userId"); // 👈 Replace this with actual UID

      const res = await fetch("https://add-asset-service.onrender.com/api/credits/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, token_value: totalCredits }),
      });

      const data = await res.json();
      console.log("Credits updated on backend:", data);

      // Backend se latest value fetch karo wapas
      const res2 = await fetch(`https://add-asset-service.onrender.com/api/credits/${uid}`);
      const newData = await res2.json();
      setBackendCredits(newData.token_value || 0);
    } catch (error) {
      console.error("Error updating backend credits:", error);
    }
  };
  const getPercentChangeText = () => {
    if (percentChange === 0) {
      return "No change in credits 🤝";
    } else if (percentChange > 0) {
      return `You gained +${percentChange.toFixed(1)}% credits 🎉`;
    } else {
      return `You spent ${percentChange.toFixed(1)}% credits 💸`;
    }
  };


  const treeCO2 = treeList.length * 21; // in kg
  const evCO2 = evList.reduce((total, ev) => {
    const km = parseFloat(ev.range) || 0;
    return total + km * 0.12; // 0.12 kg per km
  }, 0);

  const solarCO2 = solarList.reduce((total, solar) => {
    const kwh = parseFloat(solar.energy_generation_value) || 0;
    return total + kwh * 0.7; // 0.7 kg per kWh
  }, 0);
  const totalCO2 = treeCO2 + evCO2 + solarCO2; // in kg
  const totalCO2Tons = (totalCO2 / 1000).toFixed(1); // convert to tons

  const [prevCO2, setPrevCO2] = useState(0);
  const [percentCO2Change, setPercentCO2Change] = useState(0);

  useEffect(() => {
    if (prevCO2 === 0) {
      // First time
      setPrevCO2(totalCO2);
      setPercentCO2Change(0);
    } else if (totalCO2 !== prevCO2) {
      const change = ((totalCO2 - prevCO2) / prevCO2) * 100;
      setPercentCO2Change(change);
      setPrevCO2(totalCO2);
    }
  }, [totalCO2]);


  const co2ChangeText = percentCO2Change >= 0
    ? `+${percentCO2Change.toFixed(1)}% 🌿 Higher offset!`
    : `${percentCO2Change.toFixed(1)}% 🌎 Lower offset`;

  const co2FromEVs = evList.length * 1;          // tons
  const co2FromSolar = solarList.length * 0.5;   // tons
  const co2FromTrees = treeList.length * 0.02;   // tons

  const totalCO2Offset = co2FromEVs + co2FromSolar + co2FromTrees;
  const valueFromCO2 = totalCO2Offset * 3000; // ₹ per ton CO₂ offset
  const valueFromSolar = solarList.length * 5000; // ₹ bill savings
  const valueFromTrees = treeList.length * 2500; // ₹ environment benefits

  const totalValue = valueFromCO2 + valueFromSolar + valueFromTrees;
  const [prevValue, setPrevValue] = useState(0);
  const [percentValueChange, setPercentValueChange] = useState(0);

  useEffect(() => {
    if (prevValue === 0) {
      setPrevValue(totalValue);
      setPercentValueChange(0);
    } else if (totalValue !== prevValue) {
      const change = ((totalValue - prevValue) / prevValue) * 100;
      setPercentValueChange(change);
      setPrevValue(totalValue);
    }
  }, [totalValue]);

  const valueChangeText = percentValueChange >= 0
    ? `+${percentValueChange.toFixed(1)}% 🌿 Impact`
    : `${percentValueChange.toFixed(1)}% 🌿 Impact`;
  const totalUsers = 10000; // assume total global users
  const maxPossibleCredits = 5000; // max credits anyone can have (example)

  const userRankPercent = 100 - ((totalCredits / maxPossibleCredits) * 100);
  const displayRankPercent = userRankPercent < 1 ? 1 : userRankPercent.toFixed(1); // avoid going below top 1%

  const rankNumber = Math.floor((userRankPercent / 100) * totalUsers);
  const rankText = `Top ${displayRankPercent}% globally`;
  const rankValue = `#${rankNumber}`;



  const totalDistance = evList.reduce((sum, ev) => sum + (ev.distance || 0), 0);
  const co2Saved = totalDistance * 0.228;
  const evCredits = Math.floor(totalDistance / 10); // e.g., 1 credit per 10 km
  const firstEV = evList[0];
  const firstDistance = firstEV?.distance || 0;

  const totalTreesPlanted = treeList.length;
  const co2Absorbed = totalTreesPlanted * 21; // average kg/year per tree
  const treeCredits = totalTreesPlanted * 5;
  const recentTree = treeList[treeList.length - 1];


  const totalEnergyGenerated = solarList.reduce(
    (sum, item) => sum + (item.energy_generation_value || 0),
    0
  );
  const billSaved = totalEnergyGenerated * 6;
  const solarCredits = Math.round(totalEnergyGenerated * 0.2);


  const faqData = [
    {
      question: "How to earn credits?",
      answer: "You can earn credits by logging EV trips, planting trees, and generating solar energy. Each action contributes specific credit points to your account."
    },
    {
      question: "How to redeem credits?",
      answer: "Credits can be redeemed through our partner stores, or used to offset your carbon footprint. Visit the Redeem page to see all options."
    },
    {
      question: "What are green credits?",
      answer: "Green credits are points awarded for eco-friendly actions. They help you track your positive environmental impact and can be exchanged for rewards."
    },
    {
      question: "How do I track my solar energy?",
      answer: "Your solar panel data is updated automatically. You can also manually upload meter readings on the Upload page for more accurate tracking."
    }
  ];

  return (
    <div className="dashboard-wrapper">
      <Navbar />
      <div className="dashboard">
        <div className="top-bar-button">
          <h1></h1>
          <div className="actions">
            <div className="flex items-center gap-4">
              <button
                className="view-asset flex items-center gap-2"
                onClick={handleViewAssets}
              >
                
                View Assets
              </button>

              <button className="quick-add" onClick={handleQuickAdd}>
                + Quick Add
              </button>
            </div>
          </div>
        </div>

        {/* Overview Cards */}
       
        {/* Main Panels */}
        <Cardsection/>

        {/* Recent Activity */}
        <div className="recent-section">
          <h2>Recent Activity</h2>
          <div className="activity-list">
            {loadingActivity ? (
              <div>Loading recent activity...</div>
            ) : activityList.length > 0 ? (
              activityList.map((item, idx) => {
                let detailText = "";
                let titleText = "";

                if (item.type === "EV") {
                  detailText = `🏭 ${item.detail} | 📅 ${item.year} | ⚡ ${item.range} | 🏎️ ${item.topSpeed}`;
                  titleText = "🚗 New vehicle added!";
                } else if (item.type === "Solar") {
                  detailText = `⚡ ${item.detail} | 📅 ${item.year} | 🌞 ${item.generation}`;
                  titleText = "☀️ New solar asset added!";
                } else if (item.type === "Tree") {
                  detailText = `🌳 ${item.treename} | 🗓️ ${item.plantingdate} | 📍 ${item.location} | 📏 ${item.height}m`;
                  titleText = "🌳 New tree planted!";
                }

                return (
                  <ActivityItem
                    key={idx}
                    title={titleText}
                    detail={detailText}
                    time={item.time}

                  />
                );
              })
            ) : (
              <div>No recent activity</div>
            )}
          </div>
        </div>


        {/* FAQ Section */}
        <div className="faq-section">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-list">
            {faqData.map((item, index) => (
              <div
                key={index}
                className={`faq-item ${openIndex === index ? "open" : ""}`}
                onClick={() => toggleFAQ(index)}
              >
                <div className="faq-question">{item.question}</div>
                <div
                  className="faq-answer"
                  style={{
                    maxHeight: openIndex === index ? "200px" : "0",
                    opacity: openIndex === index ? 1 : 0,
                  }}
                >
                  <p>{item.answer}</p>
                </div>
              </div>
            ))}
          </div>
          <Footer />
        </div>

        {/* <Footer /> */}
      </div>
      
    </div>
  );
};

export default UserDashboard;
