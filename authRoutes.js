// ← Register, Login, Me, Update profile

const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { body } = require("express-validator");

const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");

// ─── Helper: sign JWT ─────────────────────────────────────────────────────────
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

// ─── POST /api/auth/register ──────────────────────────────────────────────────
router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required")
      .isLength({ min: 2 }).withMessage("Name must be at least 2 characters"),
    body("email").isEmail().withMessage("Please enter a valid email").normalizeEmail(),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { name, email, password } = req.body;

      // Check duplicate email
      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(409).json({ success: false, message: "Email already registered." });
      }

      // Create user (password hashed by pre-save hook in model)
      const user = await User.create({ name, email, password });

      const token = signToken(user._id);

      res.status(201).json({
        success: true,
        message: "User registered successfully.",
        token,
        user: user.toSafeObject(),
      });
    } catch (err) {
      next(err);
    }
  }
);

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email required").normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { email, password } = req.body;

      // Fetch user with password (select: false in schema)
      const user = await User.findOne({ email }).select("+password");
      if (!user) {
        return res.status(401).json({ success: false, message: "Invalid email or password." });
      }

      if (!user.isActive) {
        return res.status(401).json({ success: false, message: "Account has been deactivated." });
      }

      // Compare password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: "Invalid email or password." });
      }

      const token = signToken(user._id);

      res.json({
        success: true,
        message: "Logged in successfully.",
        token,
        user: user.toSafeObject(),
      });
    } catch (err) {
      next(err);
    }
  }
);

// ─── GET /api/auth/me  (protected) ───────────────────────────────────────────
router.get("/me", protect, async (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
});

// ─── PATCH /api/auth/me  (update own profile) ─────────────────────────────────
router.patch(
  "/me",
  protect,
  [
    body("name").optional().trim().isLength({ min: 2 }).withMessage("Name too short"),
    body("email").optional().isEmail().withMessage("Invalid email").normalizeEmail(),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { name, email } = req.body;
      const updates = {};
      if (name) updates.name = name;
      if (email) updates.email = email;

      const user = await User.findByIdAndUpdate(req.user._id, updates, {
        new: true,
        runValidators: true,
      });

      res.json({ success: true, message: "Profile updated.", user });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;