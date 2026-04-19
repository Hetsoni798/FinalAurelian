// ← CRUD + Multer image upload

const express = require("express");
const router = express.Router();
const { body, param, query } = require("express-validator");

const Product = require("../models/Product");
const { protect } = require("../middleware/authMiddleware");
const { upload, cloudinary } = require("../config/cloudinary");
const validate = require("../middleware/validate");

// ─── POST /api/products  – Create product (protected, with image) ─────────────
router.post(
  "/",
  protect,
  upload.single("image"),  // field name in form-data must be "image"
  [
    body("name").trim().notEmpty().withMessage("Product name is required"),
    body("price").isFloat({ min: 0 }).withMessage("Price must be a positive number"),
    body("stock").optional().isInt({ min: 0 }).withMessage("Stock must be a non-negative integer"),
    body("category").optional().trim(),
    body("description").optional().trim(),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { name, description, price, category, stock } = req.body;

      // Build image fields depending on upload mode
      let imageUrl = null;
      let imagePublicId = null;

      if (req.file) {
        // Cloudinary: req.file.path = secure URL, req.file.filename = public_id
        // Local disk: req.file.path = file system path
        imageUrl = req.file.path || `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
        imagePublicId = req.file.filename || null;
      }

      const product = await Product.create({
        name,
        description,
        price: parseFloat(price),
        category: category || "General",
        stock: parseInt(stock) || 0,
        image: imageUrl,
        imagePublicId,
        createdBy: req.user._id,
      });

      const populated = await product.populate("createdBy", "name email");

      res.status(201).json({
        success: true,
        message: "Product created successfully.",
        product: populated,
      });
    } catch (err) {
      next(err);
    }
  }
);

// ─── GET /api/products  – List all products (public) ─────────────────────────
router.get(
  "/",
  [
    query("page").optional().isInt({ min: 1 }).withMessage("Page must be >= 1"),
    query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit 1-100"),
    query("category").optional().trim(),
    query("search").optional().trim(),
  ],
  validate,
  async (req, res, next) => {
    try {
      const page     = parseInt(req.query.page)  || 1;
      const limit    = parseInt(req.query.limit) || 10;
      const skip     = (page - 1) * limit;

      // Build filter
      const filter = {};
      if (req.query.category) filter.category = new RegExp(req.query.category, "i");
      if (req.query.search)   filter.name      = new RegExp(req.query.search, "i");

      const [products, total] = await Promise.all([
        Product.find(filter)
          .populate("createdBy", "name email")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Product.countDocuments(filter),
      ]);

      res.json({
        success: true,
        count: products.length,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        products,
      });
    } catch (err) {
      next(err);
    }
  }
);

// ─── GET /api/products/:id  – Single product (public) ────────────────────────
router.get(
  "/:id",
  [param("id").isMongoId().withMessage("Invalid product ID")],
  validate,
  async (req, res, next) => {
    try {
      const product = await Product.findById(req.params.id).populate("createdBy", "name email");
      if (!product) {
        return res.status(404).json({ success: false, message: "Product not found." });
      }
      res.json({ success: true, product });
    } catch (err) {
      next(err);
    }
  }
);

// ─── PUT /api/products/:id  – Update product (protected, owner only) ──────────
router.put(
  "/:id",
  protect,
  upload.single("image"),
  [
    param("id").isMongoId().withMessage("Invalid product ID"),
    body("price").optional().isFloat({ min: 0 }).withMessage("Price must be positive"),
    body("stock").optional().isInt({ min: 0 }).withMessage("Stock must be non-negative"),
  ],
  validate,
  async (req, res, next) => {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).json({ success: false, message: "Product not found." });
      }

      // Only the creator can update
      if (product.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: "Not authorized to update this product." });
      }

      // If new image uploaded, delete old Cloudinary image
      if (req.file && product.imagePublicId && process.env.UPLOAD_MODE === "cloudinary") {
        await cloudinary.uploader.destroy(product.imagePublicId).catch(() => {});
      }

      const updates = { ...req.body };
      if (req.file) {
        updates.image = req.file.path || `/uploads/${req.file.filename}`;
        updates.imagePublicId = req.file.filename;
      }

      const updated = await Product.findByIdAndUpdate(req.params.id, updates, {
        new: true,
        runValidators: true,
      }).populate("createdBy", "name email");

      res.json({ success: true, message: "Product updated.", product: updated });
    } catch (err) {
      next(err);
    }
  }
);

// ─── DELETE /api/products/:id  (protected, owner only) ───────────────────────
router.delete(
  "/:id",
  protect,
  [param("id").isMongoId().withMessage("Invalid product ID")],
  validate,
  async (req, res, next) => {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).json({ success: false, message: "Product not found." });
      }

      if (product.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: "Not authorized to delete this product." });
      }

      // Delete image from Cloudinary if applicable
      if (product.imagePublicId && process.env.UPLOAD_MODE === "cloudinary") {
        await cloudinary.uploader.destroy(product.imagePublicId).catch(() => {});
      }

      await product.deleteOne();

      res.json({ success: true, message: "Product deleted successfully." });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;