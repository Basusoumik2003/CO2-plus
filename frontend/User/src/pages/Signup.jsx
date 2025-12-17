import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Signup.css";
import { RxCross1 } from "react-icons/rx";


const Signup = ({ onClose, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({});
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState("");
  const [tempEmail, setTempEmail] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Step 1: Signup - send OTP
  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError({});

    try {
      const response = await fetch("https://tn-backend-95q7.onrender.com/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
if (!response.ok) {
  setError({ general: data.message || data.error || "Signup failed" });
  setLoading(false);
  return;
}

      setTempEmail(formData.email);
      setShowOTP(true);
    } catch (err) {
      setError({ general: "Server error. Try again later." });
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async () => {
    setLoading(true);
    setError({});

    try {

      const response = await fetch("https://tn-backend-95q7.onrender.com/api/auth/verify", {

  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: tempEmail, otp }),
});

      const data = await response.json();
      if (!response.ok) {
        setError({ general: data.message || "Invalid OTP" });
        return;
      }

      // Save token & user info
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.user.u_id);
      if (data.user.role === "organization") {
        localStorage.setItem("organization", JSON.stringify(data.user));
        navigate("/orgDashboard");
      } else {
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/userDashboard");
      }

      if (onClose) onClose();
    } catch (err) {
      setError({ general: "OTP verification failed." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal signup-modal">
        <div className="modal-header">
          <h2>Create Account</h2>
          <button className="close-btn" onClick={onClose}>
            <RxCross1 size={24} />
          </button>
        </div>

        {!showOTP ? (
          <form onSubmit={handleSignup} className="signup-form">
            <input 
              type="text" 
              name="username" 
              placeholder="Username" 
              value={formData.username} 
              onChange={handleChange} 
              className="input"
              required 
            />
            <br />
            <input 
              type="email" 
              name="email" 
              placeholder="Email" 
              value={formData.email} 
              onChange={handleChange} 
              className="input"
              required 
            />
            <br />
            <input 
              type="password" 
              name="password" 
              placeholder="Password" 
              value={formData.password} 
              onChange={handleChange} 
              className="input"
              required 
            />
            <br />
            <select 
              name="role" 
              value={formData.role} 
              onChange={handleChange} 
              className="input"
              required
            >
              <option value="" disabled hidden>Select role</option>
              <option value="user">Private</option>
              <option value="organization">Organization</option>
            </select>
            <br />
            <br />
            {error.general && <p className="error-text">{error.general}</p>}
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Sending OTP..." : "Sign Up"}
            </button>
          </form>
        ) : (
          <div className="otp-form">
            <h3>Verify your Email</h3>
            <p>Enter the OTP sent to <b>{tempEmail}</b></p>
            <input 
              type="text" 
              placeholder="OTP" 
              value={otp} 
              onChange={(e) => setOtp(e.target.value)} 
              className="input"
            />
            {error.general && <p className="error-text">{error.general}</p>}
            <button onClick={handleVerifyOtp} className="btn-primary" disabled={loading}>
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </div>
        )}

        {!showOTP && (
          <div className="modal-footer">
            <p>
              Already have an account?{" "}
              <button className="link-btn" onClick={onSwitchToLogin}>Log In</button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Signup;
