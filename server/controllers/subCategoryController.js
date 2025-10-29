import SubCategory from "../models/SubCategory.js";
import Category from "../models/Category.js";

//  CREATE SUBCATEGORY
export const createSubCategory = async (req, res) => {
  try {
    const { name, categoryId } = req.body;

    if (!name || !categoryId) {
      return res
        .status(400)
        .json({ message: "Name and Category are required" });
    }

    // Check if category exists
    const categoryExists = await Category.findById(categoryId);
    if (!categoryExists) {
      return res.status(404).json({ message: "Parent category not found" });
    }

    // Prevent duplicate subcategory in same category
    const existing = await SubCategory.findOne({ name, categoryId });
    if (existing) {
      return res
        .status(400)
        .json({ message: "Subcategory already exists in this category" });
    }

    const sub = await SubCategory.create({ name, categoryId });
    res.status(201).json(sub);
  } catch (err) {
    console.error("Create Subcategory Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

//  GET ALL
export const getSubCategories = async (req, res) => {
  try {
    const { categoryId } = req.query;
    const filter = categoryId ? { categoryId } : {};

    const subs = await SubCategory.find(filter)
      .populate("categoryId", "name")
      .sort({ createdAt: -1 });

    res.json(subs);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch subcategories", error: err.message });
  }
};

//  UPDATE SUBCATEGORY
export const updateSubCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, categoryId } = req.body;

    const sub = await SubCategory.findById(id);
    if (!sub) return res.status(404).json({ message: "Subcategory not found" });

    if (categoryId) {
      const categoryExists = await Category.findById(categoryId);
      if (!categoryExists)
        return res.status(404).json({ message: "Parent category not found" });
      sub.categoryId = categoryId;
    }

    if (name) sub.name = name;

    await sub.save();
    res.json(sub);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to update subcategory", error: err.message });
  }
};

//  DELETE SUBCATEGORY
export const deleteSubCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const sub = await SubCategory.findById(id);

    if (!sub) return res.status(404).json({ message: "Subcategory not found" });

    await sub.deleteOne();
    res.json({ message: "Subcategory deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to delete subcategory", error: err.message });
  }
};
