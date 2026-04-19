// ← Transaction records

const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const paymentSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      default: () => `TXN-${uuidv4().split("-")[0].toUpperCase()}`,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [1, "Amount must be at least 1"],
    },
    currency: {
      type: String,
      default: "INR",
      uppercase: true,
    },
    method: {
      type: String,
      enum: ["card", "upi", "netbanking", "wallet"],
      default: "card",
    },
    status: {
      type: String,
      enum: ["pending", "success", "failed", "refunded"],
      default: "pending",
    },
    description: {
      type: String,
      default: "Payment",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Payment", paymentSchema);