// ─── Payment Routes ────────────────────────────────────────────────────────────
//← Mock payment + history

const express = require("express");
const router = express.Router();
const { body, param } = require("express-validator");

const Payment = require("../models/Payment");
const { protect } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");

// ─── Mock payment processor ────────────────────────────────────────────────────
// In production replace this with Razorpay / Stripe SDK calls
const mockPaymentGateway = ({ amount, method }) => {
  return new Promise((resolve, reject) => {
    // Simulate network delay (200–600ms)
    setTimeout(() => {
      // Simulate occasional failure (10% chance) for realism
      if (Math.random() < 0.1) {
        reject(new Error("Payment gateway timeout. Please retry."));
        return;
      }
      resolve({
        gatewayRef: `GW-${Date.now()}`,
        status: "success",
        processedAt: new Date().toISOString(),
      });
    }, Math.random() * 400 + 200);
  });
};

// ─── POST /api/payment  – Initiate payment (protected) ───────────────────────
router.post(
  "/",
  protect,
  [
    body("amount")
      .isFloat({ min: 1 })
      .withMessage("Amount must be at least 1"),
    body("currency")
      .optional()
      .isIn(["INR", "USD", "EUR", "GBP"])
      .withMessage("Unsupported currency"),
    body("method")
      .optional()
      .isIn(["card", "upi", "netbanking", "wallet"])
      .withMessage("Invalid payment method"),
    body("description").optional().trim(),
  ],
  validate,
  async (req, res, next) => {
    try {
      const {
        amount,
        currency = "INR",
        method = "card",
        description = "Payment",
      } = req.body;

      // Create a pending payment record first
      const payment = await Payment.create({
        user: req.user._id,
        amount: parseFloat(amount),
        currency,
        method,
        description,
        status: "pending",
      });

      // Call mock gateway
      const gatewayResult = await mockPaymentGateway({ amount, method });

      // Update payment status to success
      payment.status = "success";
      await payment.save();

      res.status(200).json({
        success: true,
        message: "Payment processed successfully.",
        payment: {
          transactionId: payment.transactionId,
          amount: payment.amount,
          currency: payment.currency,
          method: payment.method,
          status: payment.status,
          description: payment.description,
          gatewayRef: gatewayResult.gatewayRef,
          processedAt: gatewayResult.processedAt,
        },
      });
    } catch (err) {
      // If gateway failed, mark payment as failed and still return proper error
      if (err.message.includes("gateway")) {
        return res.status(502).json({
          success: false,
          message: err.message,
          hint: "Please retry the payment.",
        });
      }
      next(err);
    }
  }
);

// ─── GET /api/payment/history  – User's payment history (protected) ──────────
router.get("/history", protect, async (req, res, next) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      success: true,
      count: payments.length,
      payments,
    });
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/payment/:id  – Single payment (protected) ──────────────────────
router.get(
  "/:id",
  protect,
  [param("id").isMongoId().withMessage("Invalid payment ID")],
  validate,
  async (req, res, next) => {
    try {
      const payment = await Payment.findOne({
        _id: req.params.id,
        user: req.user._id, // Users can only see their own payments
      });

      if (!payment) {
        return res.status(404).json({ success: false, message: "Payment not found." });
      }

      res.json({ success: true, payment });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;