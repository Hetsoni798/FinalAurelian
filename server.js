// ─────────────────────────────────────────────────────────────────────────────
//  AURELIAN MERN Backend – server.js
// ─────────────────────────────────────────────────────────────────────────────
require("dotenv").config();

const express = require("express");
const cors    = require("cors");
const path    = require("path");

const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();

// ─── Connect Database ─────────────────────────────────────────────────────────
connectDB();

// ─── Core Middleware ──────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || "*",   // Restrict in production
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json({ limit: "10kb" }));           // Body size limit
app.use(express.urlencoded({ extended: true }));

// ─── Serve uploaded images (local mode) ──────────────────────────────────────
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🚀 MERN Auth API is running",
    version: "1.0.0",
    endpoints: {
      auth:     "/api/auth",
      products: "/api/products",
      payment:  "/api/payment",
    },
  });
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/auth",     require("./routes/authRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/payment",  require("./routes/paymentRoutes"));

// ─── Error Handling ───────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV || "development"}\n`);
});