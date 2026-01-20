const crypto = require("crypto");
const bcrypt = require("bcrypt");
const Reset = require("../models/passwordResetModel");
const User = require("../models/userModel");

exports.forgotPassword = async (type, value) => {
  const user = await User.findByEmailOrPhone(value);
  if (!user) return;

  const token = crypto.randomBytes(32).toString("hex");
  const otp = Math.floor(100000 + Math.random() * 900000);

  await Reset.create({
    user_id: user.id,
    token,
    otp,
    type,
    expires_at: new Date(Date.now() + 15 * 60000)
  });

  if (type === "email") {
    // send email here
  } else {
    // send SMS here
  }
};

exports.resetPassword = async (token, newPassword) => {
  const record = await Reset.findValidToken(token);
  if (!record) throw "Invalid or expired token";

  const hashed = await bcrypt.hash(newPassword, 10);
  await User.updatePassword(record.user_id, hashed);
  await Reset.markUsed(record.id);
};
