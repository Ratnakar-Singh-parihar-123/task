import express from "express";
import {
  createSubCategory,
  getSubCategories,
  updateSubCategory,
  deleteSubCategory,
} from "../controllers/subCategoryController.js";

const router = express.Router();
router.post("/", createSubCategory);
router.get("/", getSubCategories);
router.put("/:id", updateSubCategory);
router.delete("/:id", deleteSubCategory);

export default router;
