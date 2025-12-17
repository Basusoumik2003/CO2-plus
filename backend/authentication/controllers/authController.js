const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const generateUID = require("../utils/generateUID");
const sendOTP = require("../utils/sendOTP");

// ✅ REGISTER USER + SEND OTP
exports.register = async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    // Check if user already exists
    const userCheck = await pool.query("SELECT * FROM usertable WHERE email=$1", [email]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    // Find role
    let roleRes = await pool.query(
      "SELECT id, role_name FROM roles WHERE UPPER(role_name) = $1",
      [role?.toString().toUpperCase()]
    );
    let roleId = roleRes.rows[0]?.id ?? null;

    // Fallback to USER role if not found
    if (!roleId) {
      console.warn("⚠️ Role not found, defaulting to USER");
      const fallback = await pool.query(
        "SELECT id FROM roles WHERE UPPER(role_name)='USER' LIMIT 1"
      );
      if (fallback.rows[0]) roleId = fallback.rows[0].id;
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Insert user
    const userRes = await pool.query(
      `INSERT INTO usertable (username, email, password, role_id, otp_code, otp_expires_at, verified)
       VALUES ($1, $2, $3, $4, $5, $6, false)
       RETURNING id, username, email`,
      [username, email, hashed, roleId, otp, expiresAt]
    );

    const userId = userRes.rows[0].id;
    const u_id = generateUID("USR", userId);
    await pool.query("UPDATE usertable SET u_id=$1 WHERE id=$2", [u_id, userId]);

    // Send OTP
    try {
      await sendOTP(email, otp);
    } catch (mailErr) {
      await pool.query("DELETE FROM usertable WHERE id=$1", [userId]);
      return res.status(500).json({
        message: "Failed to send OTP. Check email configuration.",
        error: mailErr.message,
      });
    }

    res.status(201).json({ message: "OTP sent. Verify your email.", email });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ VERIFY OTP
exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const result = await pool.query(
      `SELECT u.*, r.role_name 
       FROM usertable u 
       LEFT JOIN roles r ON u.role_id = r.id 
       WHERE u.email=$1`,
      [email]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: "User not found" });

    const user = result.rows[0];
    const now = new Date();
    const expiresAt = user.otp_expires_at ? new Date(user.otp_expires_at) : null;

    if (!user.otp_code || user.otp_code !== otp || !expiresAt || now > expiresAt) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Mark user as verified
    await pool.query(
      "UPDATE usertable SET verified=true, otp_code=NULL, otp_expires_at=NULL WHERE email=$1",
      [email]
    );

    const token = jwt.sign(
      { id: user.id, role: user.role_name },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Store token
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

    res.json({ message: "Email verified successfully!", token, user: safeUser });
  } catch (err) {
    console.error("verifyOTP Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// ✅ LOGIN USER
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const userRes = await pool.query(
      `SELECT u.*, r.role_name 
       FROM usertable u 
       LEFT JOIN roles r ON u.role_id = r.id 
       WHERE u.email = $1`,
      [email]
    );

    if (userRes.rows.length === 0) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const user = userRes.rows[0];

    // ✅ Check if verified (this fixes your issue)
    if (!user.verified) {
      return res.status(400).json({ message: "Please verify your email first." });
    }

    // ✅ Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // ✅ Generate JWT
    const token = jwt.sign(
      { id: user.id, role: user.role_name },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Optional: store token in tokens table
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
    res.status(500).json({ error: err.message });
  }
};





