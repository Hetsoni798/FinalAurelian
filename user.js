//← Schema with bcrypt pre-save hook

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Never return password in queries by default
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Adds createdAt + updatedAt automatically
  }
);

// ─── Hash password before saving ─────────────────────────────────────────────
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // Only hash if password changed
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ─── Instance method: compare passwords ──────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// ─── Instance method: safe user object (no password) ─────────────────────────
userSchema.methods.toSafeObject = function () {
  const { password, __v, ...safe } = this.toObject();
  return safe;
};

module.exports = mongoose.model("User", userSchema);