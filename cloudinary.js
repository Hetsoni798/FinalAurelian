//← Smart upload (local or Cloudinary)


const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ─── Configure Cloudinary ────────────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ─── Local disk storage (fallback / dev mode) ────────────────────────────────
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const localStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

// ─── File filter – images only ───────────────────────────────────────────────
const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, PNG and WEBP images are allowed"), false);
  }
};

// ─── Smart upload: Cloudinary if configured, else local ─────────────────────
let upload;

const useCloudinary =
  process.env.UPLOAD_MODE === "cloudinary" &&
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_CLOUD_NAME !== "your_cloud_name";

if (useCloudinary) {
  // Cloudinary storage via multer-storage-cloudinary
  const { CloudinaryStorage } = require("multer-storage-cloudinary");
  const cloudinaryStorage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "mern_practical/products",
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      transformation: [{ width: 800, height: 800, crop: "limit", quality: "auto" }],
    },
  });
  upload = multer({ storage: cloudinaryStorage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
  console.log("📷 Upload mode: Cloudinary");
} else {
  upload = multer({ storage: localStorage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
  console.log("📁 Upload mode: Local disk (set UPLOAD_MODE=cloudinary for production)");
}

module.exports = { upload, cloudinary };