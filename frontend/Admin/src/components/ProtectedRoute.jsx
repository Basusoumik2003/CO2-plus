import { useEffect, useState } from 'react';

const ProtectedRoute = ({ children }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    // Check for token in localStorage or cookie
    const token = localStorage.getItem('authToken') || getCookie('authToken');
    
    console.log("🔍 Checking token:", token ? "Found" : "Not found");
    
    if (!token) {
      // No token found → Redirect to User app login after a small delay
      console.log("❌ No token found. Redirecting to login...");
      setTimeout(() => {
        window.location.href = 'http://localhost:5173/login';
      }, 100);
    } else {
      console.log("✅ Token found. Rendering dashboard.");
      setHasToken(true);
      setIsChecking(false);
    }
  }, []);

  // While checking, show nothing
  if (isChecking) {
    return null;
  }

  // If token exists, render children
  if (hasToken) {
    return children;
  }

  // Fallback (should not reach here due to redirect)
  return null;
};

// ✅ Helper function to read cookies
function getCookie(name) {
  const nameEQ = name + '=';
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.indexOf(nameEQ) === 0) {
      return cookie.substring(nameEQ.length);
    }
  }
  return null;
}

export default ProtectedRoute;
