import Product from "../models/Product.js";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

//  Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

//  Multer Storage (Cloudinary)
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "localkart_products", 
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

const upload = multer({ storage });

//  Base URL
const BASE_URL =
  process.env.BASE_URL?.replace(/\/$/, "") || "http://localhost:5000";


//  CREATE Product
const createProduct = async (req, res) => {
  try {
    const { categoryId, subCategoryId, name, quantity, mrp } = req.body;
    if (!categoryId || !subCategoryId || !name) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }

    const imageUrl = req.file ? req.file.path : null;

    const product = await Product.create({
      categoryId,
      subCategoryId,
      name,
      quantity,
      mrp,
      image: imageUrl,
    });

    res.status(201).json({
      ...product.toObject(),
      imageUrl,
    });
  } catch (err) {
    console.error(" Error creating product:", err);
    res.status(500).json({ message: "Server error while creating product" });
  }
};

//  GET Products
const getProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("categoryId", "name")
      .populate("subCategoryId", "name")
      .sort({ createdAt: -1 })
      .lean();

    res.json(products);
  } catch (err) {
    console.error(" Error fetching products:", err);
    res.status(500).json({ message: "Server error while fetching products" });
  }
};

//  UPDATE Product
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, quantity, mrp, categoryId, subCategoryId } = req.body;
    const product = await Product.findById(id);

    if (!product) return res.status(404).json({ message: "Product not found" });

    // 🖼 If new image uploaded, delete old from Cloudinary
    if (req.file) {
      if (product.image) {
        const publicId = product.image
          .split("/")
          .slice(-2)
          .join("/")
          .split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      }
      product.image = req.file.path;
    }

    if (name) product.name = name;
    if (quantity) product.quantity = quantity;
    if (mrp) product.mrp = mrp;
    if (categoryId) product.categoryId = categoryId;
    if (subCategoryId) product.subCategoryId = subCategoryId;

    await product.save();

    res.json({
      ...product.toObject(),
      imageUrl: product.image,
    });
  } catch (err) {
    console.error(" Error updating product:", err);
    res.status(500).json({ message: "Server error while updating product" });
  }
};

//  DELETE Product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // 🗑 Delete image from Cloudinary
    if (product.image) {
      const publicId = product.image
        .split("/")
        .slice(-2)
        .join("/")
        .split(".")[0];
      await cloudinary.uploader.destroy(publicId);
    }

    await product.deleteOne();
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({ message: "Server error while deleting product" });
  }
};

export { upload, createProduct, getProducts, updateProduct, deleteProduct };