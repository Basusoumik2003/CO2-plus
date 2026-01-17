export const AUTH_SERVICE = import.meta.env.VITE_AUTH_SERVICE_URL;
export const NOTIFICATION_SERVICE = import.meta.env.VITE_NOTIFICATION_SERVICE_URL;
export const ASSET_SERVICE = import.meta.env.VITE_ASSET_SERVICE_URL;

if (!AUTH_SERVICE || !NOTIFICATION_SERVICE || !ASSET_SERVICE) {
  console.error("❌ Missing service URLs. Check your .env file.");
}

console.log("🔐 AUTH:", AUTH_SERVICE);
console.log("🔔 NOTIFY:", NOTIFICATION_SERVICE);
console.log("🌱 ASSET:", ASSET_SERVICE);
