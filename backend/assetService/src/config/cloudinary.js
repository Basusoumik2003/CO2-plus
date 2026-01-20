const cloudinary = require("cloudinary").v2;

/**
 * 🔥 Cloud Run rule:
 * Read DIRECTLY from process.env
 * Do NOT depend on env.js or dotenv here
 */
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

// Check if Cloudinary is configured
const isCloudinaryConfigured = !!(
  cloudName &&
  apiKey &&
  apiSecret
);

// Log configuration status (safe)
console.log("🔍 Cloudinary Configuration Check:");
console.log("   Cloud Name:", cloudName ? "✅ Set" : "❌ Missing");
console.log("   API Key:", apiKey ? "✅ Set" : "❌ Missing");
console.log("   API Secret:", apiSecret ? "✅ Set" : "❌ Missing");

// Configure Cloudinary
if (isCloudinaryConfigured) {
  try {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
    console.log("✅ Cloudinary configured successfully");
  } catch (error) {
    console.error("❌ Error configuring Cloudinary:", error.message);
    console.warn("   Image uploads will use mock data");
  }
} else {
  console.warn("⚠️ Cloudinary credentials not configured.");
  console.warn("   Using mock image upload mode.");
}

// Upload image
const uploadImage = async (fileBuffer, folder = "co2plus-assets") => {
  if (!fileBuffer || !Buffer.isBuffer(fileBuffer)) {
    throw new Error("Invalid file buffer provided");
  }

  if (!isCloudinaryConfigured) {
    return {
      public_id: `mock_${Date.now()}`,
      url: "https://via.placeholder.com/400x300?text=Image+Pending",
      width: 400,
      height: 300,
      format: "jpg",
    };
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        transformation: [
          { width: 1200, height: 1200, crop: "limit" },
          { quality: "auto:good" },
          { fetch_format: "auto" },
        ],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({
          public_id: result.public_id,
          url: result.secure_url,
          width: result.width,
          height: result.height,
          format: result.format,
        });
      }
    );

    uploadStream.end(fileBuffer);
  });
};

// Delete image
const deleteImage = async (publicId) => {
  if (!isCloudinaryConfigured || publicId.startsWith("mock_")) {
    return { result: "ok", mock: true };
  }

  return cloudinary.uploader.destroy(publicId);
};

// Get image URL
const getImageUrl = (publicId, transformations = {}) => {
  if (!isCloudinaryConfigured || publicId.startsWith("mock_")) {
    return "https://via.placeholder.com/400x300?text=Image";
  }

  return cloudinary.url(publicId, {
    secure: true,
    ...transformations,
  });
};

module.exports = {
  cloudinary,
  uploadImage,
  deleteImage,
  getImageUrl,
  isConfigured: isCloudinaryConfigured,
};
