const OTP = require("../models/otpLogModel");

exports.generateOTP = async (user, destination, purpose) => {
  const otp = Math.floor(100000 + Math.random() * 900000);

  await OTP.create({
    user_id: user.id,
    destination,
    otp,
    purpose,
    expires_at: new Date(Date.now() + 5 * 60000)
  });

  return otp;
};

exports.verifyOTP = async (destination, otp) => {
  const record = await OTP.findValid(destination, otp);
  if (!record) throw "Invalid OTP";

  await OTP.markVerified(record.id);
  return record;
};
