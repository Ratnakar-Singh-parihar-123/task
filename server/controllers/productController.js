import Product from "../models/Product.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname.replace(
      /\s+/g,
      "_"
    )}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.test(ext)) cb(null, true);
  else cb(new Error("Only image files (jpeg, jpg, png, webp) are allowed"));
};

const upload = multer({ storage, fileFilter });

// Helper: Base URL
const BASE_URL =
  process.env.BASE_URL?.replace(/\/$/, "") || "http://localhost:5000";

const createProduct = async (req, res) => {
  try {
    const { categoryId, subCategoryId, name, quantity, mrp } = req.body;

    if (!categoryId || !subCategoryId || !name) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }

    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    const product = await Product.create({
      categoryId,
      subCategoryId,
      name,
      quantity,
      mrp,
      image: imagePath,
    });

    res.status(201).json({
      ...product.toObject(),
      imageUrl: imagePath ? `${BASE_URL}${imagePath}` : null,
    });
  } catch (err) {
    console.error(" Error creating product:", err);
    res.status(500).json({ message: "Server error while creating product" });
  }
};

const getProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("categoryId", "name")
      .populate("subCategoryId", "name")
      .sort({ createdAt: -1 })
      .lean();

    const formatted = products.map((p) => ({
      ...p,
      imageUrl: p.image ? `${BASE_URL}${p.image}` : null,
    }));

    res.json(formatted);
  } catch (err) {
    console.error(" Error fetching products:", err);
    res.status(500).json({ message: "Server error while fetching products" });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, quantity, mrp, categoryId, subCategoryId } = req.body;

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Replace image if new one uploaded
    if (req.file) {
      if (product.image && fs.existsSync(`.${product.image}`)) {
        fs.unlinkSync(`.${product.image}`);
      }
      product.image = `/uploads/${req.file.filename}`;
    }

    if (name) product.name = name;
    if (quantity) product.quantity = quantity;
    if (mrp) product.mrp = mrp;
    if (categoryId) product.categoryId = categoryId;
    if (subCategoryId) product.subCategoryId = subCategoryId;

    await product.save();

    res.json({
      ...product.toObject(),
      imageUrl: product.image ? `${BASE_URL}${product.image}` : null,
    });
  } catch (err) {
    console.error(" Error updating product:", err);
    res.status(500).json({ message: "Server error while updating product" });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Delete image file
    if (product.image && fs.existsSync(`.${product.image}`)) {
      fs.unlinkSync(`.${product.image}`);
    }

    await product.deleteOne();
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error(" Error deleting product:", err);
    res.status(500).json({ message: "Server error while deleting product" });
  }
};

export { upload, createProduct, getProducts, updateProduct, deleteProduct };
