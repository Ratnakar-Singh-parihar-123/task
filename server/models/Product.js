import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    subCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory",
      required: true,
    },
    quantity: {
      type: Number,
      default: 0,
      min: [0, "Quantity cannot be negative"],
    },
    mrp: {
      type: Number,
      default: 0,
      min: [0, "MRP must be a positive number"],
    },
    image: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

productSchema.index({ name: 1, categoryId: 1 });

productSchema.virtual("imageUrl").get(function () {
  if (!this.image) return null;
  const base = process.env.BASE_URL || "http://localhost:5000";
  return `${base}${this.image.startsWith("/") ? this.image : `/${this.image}`}`;
});

productSchema.set("toJSON", { virtuals: true });
productSchema.set("toObject", { virtuals: true });

export default mongoose.model("Product", productSchema);
