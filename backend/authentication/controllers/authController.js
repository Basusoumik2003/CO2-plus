const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const generateUID = require("../utils/generateUID");
const sendOTP = require("../utils/sendOTP");

// ✅ Validation helpers
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const MAX_ATTEMPTS = 5;
const LOCK_TIME_MS = 30 * 60 * 1000; // 30 min

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(pw) {
  return PASSWORD_REGEX.test(pw);
}

function validateUsername(name) {
  return typeof name === "string" && name.trim().length >= 2 && name.trim().length <= 50;
}

// ✅ REGISTER USER + SEND OTP
exports.register = async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    // Basic validation
    if (!validateUsername(username)) {
      return res.status(400).json({ message: "Username must be 2–50 characters." });
    }
    if (!validateEmail(email)) {
      return res.status(400).json({ message: "Invalid email format." });
    }
    if (!validatePassword(password)) {
      return res.status(400).json({
        message:
          "Password must be 8+ chars and include uppercase, lowercase, number, and special character.",
      });
    }

    // ✅ CHANGED: usertable → users
    const userCheck = await pool.query(
      "SELECT id FROM users WHERE email=$1",
      [email.toLowerCase()]
    );
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 12);

    // Find role
    let roleRes = await pool.query(
      "SELECT id, role_name FROM roles WHERE UPPER(role_name) = $1",
      [role?.toString().toUpperCase()]
    );
    let roleId = roleRes.rows[0]?.id ?? null;

    // Fallback to USER role
    if (!roleId) {
      const fallback = await pool.query(
        "SELECT id FROM roles WHERE UPPER(role_name)='USER' LIMIT 1"
      );
      if (!fallback.rows[0]) {
        return res
          .status(500)
          .json({ message: "USER role not configured in roles table" });
      }
      roleId = fallback.rows[0].id;
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // ✅ CHANGED: usertable → users
    const userRes = await pool.query(
      `INSERT INTO users (username, email, password, role_id, otp_code, otp_expires_at, verified, login_attempts, lock_until)
       VALUES ($1, $2, $3, $4, $5, $6, false, 0, NULL)
       RETURNING id, username, email`,
      [username.trim(), email.toLowerCase(), hashed, roleId, otp, expiresAt]
    );

    const userId = userRes.rows[0].id;
    const u_id = generateUID("USR", userId);
    
    // ✅ CHANGED: usertable → users
    await pool.query("UPDATE users SET u_id=$1 WHERE id=$2", [u_id, userId]);

    // Send OTP
    try {
      await sendOTP(email, otp);
    } catch (mailErr) {
      // ✅ CHANGED: usertable → users
      await pool.query("DELETE FROM users WHERE id=$1", [userId]);
      return res.status(500).json({
        message: "Failed to send OTP. Check email configuration.",
      });
    }

    res.status(201).json({ message: "OTP sent. Verify your email.", email });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ message: "Registration failed" });
  }
};

// ✅ VERIFY OTP
exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    // Validation
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      return res.status(400).json({ message: "OTP must be 6 digits" });
    }

    // ✅ CHANGED: usertable → users
    const result = await pool.query(
      `SELECT u.*, r.role_name 
       FROM users u 
       LEFT JOIN roles r ON u.role_id = r.id 
       WHERE u.email=$1`,
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = result.rows[0];

    // Check if already verified
    if (user.verified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    // Check OTP
    const now = new Date();
    const expiresAt = user.otp_expires_at ? new Date(user.otp_expires_at) : null;

    if (!user.otp_code) {
      return res.status(400).json({ message: "No OTP found. Please register again." });
    }

    if (user.otp_code !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (!expiresAt || now > expiresAt) {
      return res.status(400).json({ message: "OTP expired. Please register again." });
    }

    // ✅ CHANGED: usertable → users
    await pool.query(
      "UPDATE users SET verified=true, otp_code=NULL, otp_expires_at=NULL WHERE email=$1",
      [email.toLowerCase()]
    );

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role_name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
    );

    // Store token in database
    await pool.query(
      "INSERT INTO tokens (user_id, token, token_type, expires_at) VALUES ($1, $2, $3, NOW() + INTERVAL '1 day')",
      [user.id, token, "ACCESS"]
    );

    const safeUser = {
      id: user.id,
      u_id: user.u_id,
      username: user.username,
      email: user.email,
      role_name: user.role_name,
      verified: true,
    };

    res.status(200).json({ 
      message: "Email verified successfully!", 
      token, 
      user: safeUser 
    });
  } catch (err) {
    console.error("verifyOTP Error:", err);
    res.status(500).json({ message: "OTP verification failed" });
  }
};

// ✅ LOGIN USER
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // ✅ CHANGED: usertable → users
    const userRes = await pool.query(
      `SELECT u.*, r.role_name 
       FROM users u 
       LEFT JOIN roles r ON u.role_id = r.id 
       WHERE u.email = $1`,
      [email.toLowerCase()]
    );

    if (userRes.rows.length === 0) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const user = userRes.rows[0];

    // Check if account is locked
    if (user.lock_until && new Date(user.lock_until) > new Date()) {
      return res.status(429).json({
        message: "Account locked due to multiple failed attempts. Try again later.",
      });
    }

    // Check if email is verified
    if (!user.verified) {
      return res.status(400).json({ message: "Please verify your email first." });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // Increment failed login attempts
      const attempts = (user.login_attempts || 0) + 1;
      let lockUntil = null;
      
      if (attempts >= MAX_ATTEMPTS) {
        lockUntil = new Date(Date.now() + LOCK_TIME_MS);
      }
      
      // ✅ CHANGED: usertable → users
      await pool.query(
        "UPDATE users SET login_attempts=$1, lock_until=$2 WHERE id=$3",
        [attempts, lockUntil, user.id]
      );
      
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Reset attempts on successful login
    // ✅ CHANGED: usertable → users
    await pool.query(
      "UPDATE users SET login_attempts=0, lock_until=NULL WHERE id=$1",
      [user.id]
    );

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role_name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
    );

    // Store token in database
    await pool.query(
      "INSERT INTO tokens (user_id, token, token_type, expires_at) VALUES ($1, $2, $3, NOW() + INTERVAL '1 day')",
      [user.id, token, "ACCESS"]
    );

    const safeUser = {
      id: user.id,
      u_id: user.u_id,
      username: user.username,
      email: user.email,
      role_name: user.role_name,
      verified: user.verified,
    };

    res.status(200).json({
      message: "Login successful!",
      token,
      user: safeUser,
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Login failed" });
  }
};
