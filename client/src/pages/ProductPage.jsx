import React, { useEffect, useState } from "react";
import { API_BASE, UPLOAD_BASE } from "../API";

export default function ProductPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [form, setForm] = useState({
    name: "",
    categoryId: "",
    subCategoryId: "",
    mrp: "",
    quantity: "",
    image: null,
  });
  const [editing, setEditing] = useState(null);

  const fetchData = async () => {
    const [prodRes, catRes, subRes] = await Promise.all([
      fetch(`${API_BASE}/products`),
      fetch(`${API_BASE}/categories`),
      fetch(`${API_BASE}/subcategories`),
    ]);
    setProducts(await prodRes.json());
    setCategories(await catRes.json());
    setSubcategories(await subRes.json());
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((f) => ({ ...f, [name]: files ? files[0] : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));

    const url = editing
      ? `${API_BASE}/products/${editing._id}`
      : `${API_BASE}/products`;
    const method = editing ? "PUT" : "POST";

    await fetch(url, { method, body: fd });
    fetchData();
    setForm({
      name: "",
      categoryId: "",
      subCategoryId: "",
      mrp: "",
      quantity: "",
      image: null,
    });
    setEditing(null);
  };

  const handleEdit = (p) => {
    setEditing(p);
    setForm({
      name: p.name,
      categoryId: p.categoryId?._id || "",
      subCategoryId: p.subCategoryId?._id || "",
      mrp: p.mrp,
      quantity: p.quantity,
      image: null,
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    await fetch(`${API_BASE}/products/${id}`, { method: "DELETE" });
    fetchData();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center sm:text-left">
        🛍 Manage Products
      </h2>

      {/* Add / Edit Product */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-5 rounded-2xl shadow-md border border-gray-100 space-y-4 mb-10"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Product Name"
            required
            className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <input
            name="mrp"
            type="number"
            value={form.mrp}
            onChange={handleChange}
            placeholder="MRP"
            required
            className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <select
            name="categoryId"
            value={form.categoryId}
            onChange={handleChange}
            required
            className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            name="subCategoryId"
            value={form.subCategoryId}
            onChange={handleChange}
            required
            className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Subcategory</option>
            {subcategories
              .filter((s) => s.categoryId?._id === form.categoryId)
              .map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            name="quantity"
            type="number"
            value={form.quantity}
            onChange={handleChange}
            placeholder="Quantity"
            required
            className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <input
            name="image"
            type="file"
            accept="image/*"
            onChange={handleChange}
            className="border p-2 rounded-lg"
          />
        </div>

        <button className="w-full sm:w-auto bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition">
          {editing ? "✏️ Update Product" : "➕ Add Product"}
        </button>
      </form>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((p) => (
          <div
            key={p._id}
            className="bg-white rounded-2xl border border-gray-100 shadow-md hover:shadow-lg transition overflow-hidden"
          >
            <img
              src={
                p.image?.startsWith("http")
                  ? p.image
                  : `${UPLOAD_BASE}${p.image || ""}`
              }
              alt={p.name}
              className="h-44 w-full object-cover bg-gray-100"
              onError={(e) => (e.target.src = "https://via.placeholder.com/150")}
            />

            <div className="p-4 space-y-1">
              <h3 className="font-semibold text-gray-800 truncate">{p.name}</h3>
              <p className="text-sm text-gray-500 truncate">
                {p.categoryId?.name} / {p.subCategoryId?.name}
              </p>
              <div className="flex justify-between items-center mt-2">
                <span className="text-blue-600 font-bold">₹{p.mrp}</span>
                <span className="text-sm text-gray-600">Qty: {p.quantity}</span>
              </div>
            </div>

            <div className="flex justify-between border-t border-gray-100">
              <button
                onClick={() => handleEdit(p)}
                className="w-1/2 py-2 text-yellow-600 hover:bg-yellow-50"
              >
                ✏️ Edit
              </button>
              <button
                onClick={() => handleDelete(p._id)}
                className="w-1/2 py-2 text-red-600 hover:bg-red-50"
              >
                🗑 Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}