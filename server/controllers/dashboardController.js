import Category from "../models/Category.js";
import SubCategory from "../models/SubCategory.js";
import Product from "../models/product.js";

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
