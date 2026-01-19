import { useEffect, useState } from "react";

const ProtectedRoute = ({ children }) => {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    // 1️⃣ URL se token lo
    const queryToken = new URLSearchParams(window.location.search).get("token");

    // 2️⃣ localStorage / cookie se bhi try karo
    const storedToken =
      localStorage.getItem("authToken") || getCookie("authToken");

    const token = queryToken || storedToken;

    if (!token) {
      // ❌ USER APP PE MAT BHEJO
      console.log("❌ Token missing, admin access denied");
      return;
    }

    // 3️⃣ Token save karo (first time)
    if (queryToken) {
      localStorage.setItem("authToken", queryToken);
    }

    console.log("✅ Admin token accepted");
    setAllowed(true);
  }, []);

  if (!allowed) return <h2>Unauthorized</h2>;

  return children;
};

function getCookie(name) {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : null;
}

export default ProtectedRoute;
