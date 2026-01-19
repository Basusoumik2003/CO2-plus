import { useEffect, useState } from "react";

const USER_APP_URL =
  import.meta.env.VITE_USER_APP_URL || "http://localhost:5173";

const ProtectedRoute = ({ children }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    const token =
      localStorage.getItem("authToken") || getCookie("authToken");

    console.log("🔍 Checking token:", token ? "Found" : "Not found");

    if (!token) {
      console.log("❌ No token found. Redirecting to user app...");
      window.location.replace(USER_APP_URL);
      return;
    }

    console.log("✅ Token found. Rendering dashboard.");
    setHasToken(true);
    setIsChecking(false);
  }, []);

  if (isChecking) return null;

  return hasToken ? children : null;
};

// 🍪 Cookie helper
function getCookie(name) {
  const nameEQ = name + "=";
  const cookies = document.cookie.split(";");
  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.startsWith(nameEQ)) {
      return cookie.substring(nameEQ.length);
    }
  }
  return null;
}

export default ProtectedRoute;
