const jwt = require("jsonwebtoken");

/**
 * Basic token verification middleware (no role check).
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;

  if (!token) {
    return res.status(401).json({ message: "Token missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Log once per request to inspect structure (can be reduced later)
    console.log("Decoded JWT:", decoded);
    req.user = {
      ...decoded,
      role: (decoded.role || decoded.role_name || "").toUpperCase(),
    };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

/**
 * Role-based authorization (case-insensitive).
 */
const authorize = (allowedRoles) => {
  return (req, res, next) => {
    verifyToken(req, res, (err) => {
      if (err) return; // verifyToken already handled response
      const role = req.user?.role || "";
      const allowedUpper = allowedRoles.map((r) => r.toUpperCase());
      if (!allowedUpper.includes(role)) {
        return res.status(403).json({ message: "Access denied: admin only" });
      }
      next();
    });
  };
};

module.exports = { authorize, verifyToken };
