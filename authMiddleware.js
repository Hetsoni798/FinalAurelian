// ← JWT protect + adminOnly

const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ─── Protect: require valid JWT ───────────────────────────────────────────────
const protect = async (req, res, next) => {
  try {
    // Accept token from "Authorization: Bearer <token>" header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch fresh user from DB (so deactivated accounts are caught)
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ success: false, message: "User no longer exists." });
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, message: "Account has been deactivated." });
    }

    req.user = user; // Attach user to request
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Token expired. Please log in again." });
    }
    return res.status(401).json({ success: false, message: "Invalid token." });
  }
};

// ─── Admin only ───────────────────────────────────────────────────────────────
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") return next();
  return res.status(403).json({ success: false, message: "Access denied. Admins only." });
};

module.exports = { protect, adminOnly };