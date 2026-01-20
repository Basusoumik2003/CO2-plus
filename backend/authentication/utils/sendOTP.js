const { Resend } = require("resend");

let resendClient = null;

// Lazy initialization (SAFE for Cloud Run)
function getResendClient() {
  if (!process.env.RESEND_API_KEY) {
    console.warn("⚠️ RESEND_API_KEY not set. OTP emails disabled.");
    return null;
  }

  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
    console.log("✅ Resend client initialized");
  }

  return resendClient;
}

const sendOTP = async (email, otp) => {
  const resend = getResendClient();

  if (!resend) {
    throw new Error("Email service not configured");
  }

  try {
    const htmlContent = `
      <div style="font-family:Arial, sans-serif; padding:20px;">
        <h2>Your OTP Code</h2>
        <p>Hello 👋,</p>
        <p>Your One-Time Password (OTP) is:</p>
        <h3 style="color:#2b6cb0;">${otp}</h3>
        <p>This code will expire in 10 minutes.</p>
        <br/>
        <p>— The Team</p>
      </div>
    `;

    const response = await resend.emails.send({
      from: "CO2 Plus <onboarding@resend.dev>", // testing OK
      to: email,                               // dynamic email
      subject: "Your OTP Code",
      html: htmlContent,
    });

    console.log("✅ OTP sent successfully:", response);
    return response;

  } catch (error) {
    console.error("❌ Failed to send OTP:", error);
    throw new Error("Email sending failed");
  }
};

module.exports = sendOTP;
