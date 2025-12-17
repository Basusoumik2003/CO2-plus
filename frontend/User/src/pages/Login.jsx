import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";
import { RxCross1 } from "react-icons/rx";

const Login = ({ onLogin, onClose, onSwitchToSignup }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ✅ Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // ✅ Validate form before submit
  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      const response = await fetch("https://tn-backend-95q7.onrender.com/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log("🟢 Login API Response:", data);

      // ❌ If request failed
      if (!response.ok) {
        setErrors({ general: data.message || data.error || "Invalid email or password" });
        return;
      }

      // ✅ Ensure backend sends user + token
      if (!data.user || !data.token) {
        setErrors({ general: "Login failed. Missing token or user data." });
        return;
      }

      // ✅ Check if user is verified (updated for 'verified' column)
      if (!data.user.verified) {
        setErrors({ general: "Please verify your email first." });
        return;
      }

      // ✅ Save data to localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("userId", data.user.u_id);

      if (onLogin) onLogin(data.user);
      if (onClose) onClose();

      // ✅ Role-based redirect
      const role = data.user.role_name?.toUpperCase();

      if (role === "USER") {
        navigate("/userDashboard");
      } else if (role === "ORGANIZATION") {
        navigate("/orgDashboard");
      } else if (role === "ADMIN") {
        navigate("/adminDashboard");
      } else {
        navigate("/"); // fallback
      }
    } catch (err) {
      console.error("❌ Login Error:", err);
      setErrors({ general: "Server error. Please try again later." });
    } finally {
      setLoading(false);
    }
  };

  // ✅ Render UI
  return (
    <div className="modal-overlay">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Welcome Back</h2>
          <p>Sign in to your account</p>
          {onClose && (
            <button className="close-btn" onClick={onClose}>
              <RxCross1 size={24} />
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Email */}
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? "error" : ""}
              placeholder="Enter your email"
            />
            {errors.email && (
              <span className="error-message">{errors.email}</span>
            )}
          </div>

          {/* Password */}
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? "error" : ""}
              placeholder="Enter your password"
            />
            {errors.password && (
              <span className="error-message">{errors.password}</span>
            )}
          </div>

          {/* General error */}
          {errors.general && (
            <p className="error-message center">{errors.general}</p>
          )}

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
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
