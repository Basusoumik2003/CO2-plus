import React, { useEffect } from 'react';
import { Routes, Route, Link, useSearchParams } from 'react-router-dom';
import OrgDashboard from './pages/OrgDashboard';
import AddAsset from './components/AddAsset';
import FleetManagement from './components/FleetManagement';

function App() {
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    // Check for session data from User App redirect
    const userId = searchParams.get("userId");
    const token = searchParams.get("token");

    if (userId && token) {
      console.log('Received session from User App:', userId);
      localStorage.setItem("userId", userId);
      localStorage.setItem("token", token);
      
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [searchParams]);
  return (
    <Routes>
      <Route path="/" element={<OrgDashboard />} />
      <Route path="/add-asset" element={<AddAsset />} />
      <Route path="/view-fleet" element={<FleetManagement />} />
    </Routes>
  );
}
export default App;