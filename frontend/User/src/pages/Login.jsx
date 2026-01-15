import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";
import { RxCross1 } from "react-icons/rx";

const Login = ({ onLogin, onClose, onSwitchToSignup }) => {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5002";

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ✅ Cookie helper
  const setCookie = (name, value, days = 7) => {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value}; expires=${date.toUTCString()}; path=/; SameSite=Lax`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name] || errors.general) {
      setErrors((prev) => ({ ...prev, [name]: null, general: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Invalid email format";

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email.toLowerCase().trim(),
          password: formData.password,
        }),
      });

      const data = await response.json();
      console.log("🟢 Login Response:", data);

      if (!response.ok) {
        setErrors({ general: data.message || "Login failed" });
        return;
      }

      if (!data.token || !data.user) {
        setErrors({ general: "Invalid server response" });
        return;
      }

      if (!data.user.verified) {
        setErrors({ general: "Please verify your email first." });
        return;
      }

      // ✅ Save auth
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("userId", data.user.u_id);
      localStorage.setItem("authToken", data.token);
      setCookie("authToken", data.token);

      // ✅ IMPORTANT FIX
      if (onLogin) onLogin(data.token, data.user);
      if (onClose) onClose();

      const status = data.user.status;
      const role = data.user.role_name?.toUpperCase();

      if (status === "pending") {
        navigate("/pending-approval");
        return;
      }

      if (status !== "active") {
        setErrors({ general: `Account status: ${status}` });
        localStorage.clear();
        return;
      }

      // ✅ Role-based redirect
      switch (role) {
        case "USER":
          navigate("/userDashboard");
          break;

        case "ORGANIZATION":
        case "ORGANIZATION":
          navigate("/orgDashboard");
          break;

        case "ADMIN":
          window.location.href = "http://localhost:3001/";
          break;

        default:
          navigate("/");
      }
    } catch (err) {
      console.error("❌ Login error:", err);
      setErrors({ general: "Server not reachable. Try again later." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Welcome Back</h2>
          <p>Sign in to your account</p>
          {onClose && (
            <button className="close-btn" onClick={onClose} type="button">
              <RxCross1 size={22} />
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
            />
            {errors.email && <span className="error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
            />
            {errors.password && <span className="error">{errors.password}</span>}
          </div>

          {errors.general && (
            <div className="error-banner">{errors.general}</div>
          )}

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don’t have an account?{" "}
            <button className="link-btn" onClick={onSwitchToSignup}>
              Sign Up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
