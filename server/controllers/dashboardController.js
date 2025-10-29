import Category from "../models/category.js";
import SubCategory from "../models/subCategory.js";
import Product from "../models/Product.js";

export const getDashboardStats = async (req, res) => {
  try {
    const [categories, subCategories, products] = await Promise.all([
      Category.countDocuments(),
      SubCategory.countDocuments(),
      Product.countDocuments(),
    ]);

    res.status(200).json({
      categories,
      subCategories,
      products,
    });
  } catch (err) {
    console.error(" Dashboard Stats Error:", err.message);
    res.status(500).json({
      message: "Failed to fetch dashboard stats",
      error: err.message,
    });
  }
};
