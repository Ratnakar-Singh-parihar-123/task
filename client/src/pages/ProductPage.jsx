import React, { useEffect, useState } from "react";
import { API_BASE, UPLOAD_BASE } from "../API";

function ProductPage() {
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
  const [editingProduct, setEditingProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const defaultCategories = [
    { name: "Clothing" },
    { name: "Footwear" },
    { name: "Accessories" },
    { name: "Electronics" },
  ];

  const defaultSubcategories = [
    { name: "T-Shirts", category: "Clothing" },
    { name: "Shirts", category: "Clothing" },
    { name: "Jeans", category: "Clothing" },
    { name: "Sneakers", category: "Footwear" },
    { name: "Formal Shoes", category: "Footwear" },
    { name: "Smart Watches", category: "Accessories" },
    { name: "Bags", category: "Accessories" },
    { name: "Headphones", category: "Electronics" },
    { name: "Mobiles", category: "Electronics" },
  ];

  const safeJson = async (res) => {
    try {
      const data = await res.json();
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.data)) return data.data;
      return [];
    } catch {
      return [];
    }
  };

  const fetchProducts = async () => {
    const res = await fetch(`${API_BASE}/products`);
    const data = await safeJson(res);
    setProducts(data);
  };

  const fetchCategories = async () => {
    const res = await fetch(`${API_BASE}/categories`);
    let data = await safeJson(res);
    if (data.length === 0) {
      for (let c of defaultCategories) {
        await fetch(`${API_BASE}/categories`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: c.name }),
        });
      }
      const reload = await fetch(`${API_BASE}/categories`);
      data = await safeJson(reload);
    }
    setCategories(data);
  };

  const fetchSubcategories = async () => {
    const res = await fetch(`${API_BASE}/subcategories`);
    let data = await safeJson(res);
    if (data.length === 0 && categories.length) {
      for (let s of defaultSubcategories) {
        const cat = categories.find((c) => c.name === s.category);
        if (cat) {
          await fetch(`${API_BASE}/subcategories`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: s.name, categoryId: cat._id }),
          });
        }
      }
      const reload = await fetch(`${API_BASE}/subcategories`);
      data = await safeJson(reload);
    }
    setSubcategories(data);
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (categories.length > 0) fetchSubcategories();
  }, [categories]);

  const addProduct = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    for (let key in form) fd.append(key, form[key]);
    await fetch(`${API_BASE}/products`, { method: "POST", body: fd });
    setForm({
      name: "",
      categoryId: "",
      subCategoryId: "",
      mrp: "",
      quantity: "",
      image: null,
    });
    fetchProducts();
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      categoryId: product.categoryId?._id || "",
      subCategoryId: product.subCategoryId?._id || "",
      mrp: product.mrp,
      quantity: product.quantity,
      image: null,
    });
    setShowModal(true);
  };

  const updateProduct = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    for (let key in form) fd.append(key, form[key]);
    await fetch(`${API_BASE}/products/${editingProduct._id}`, {
      method: "PUT",
      body: fd,
    });
    setShowModal(false);
    setEditingProduct(null);
    fetchProducts();
  };

  const del = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    await fetch(`${API_BASE}/products/${id}`, { method: "DELETE" });
    fetchProducts();
  };

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6">
      <h2 className="text-2xl sm:text-3xl font-semibold mb-4 text-gray-800">
        🛍️ Manage Products
      </h2>

      {/* Add Product Form */}
      <form
        onSubmit={addProduct}
        className="bg-white p-4 sm:p-6 rounded-2xl shadow mb-8 space-y-4 border border-gray-100"
      >
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Product Name"
          className="border border-gray-300 p-2 w-full rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <select
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            className="border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            required
          >
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={form.subCategoryId}
            onChange={(e) =>
              setForm({ ...form, subCategoryId: e.target.value })
            }
            className="border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            required
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
            value={form.mrp}
            onChange={(e) => setForm({ ...form, mrp: e.target.value })}
            placeholder="MRP"
            type="number"
            className="border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
          <input
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            placeholder="Quantity"
            type="number"
            className="border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
        </div>

        <input
          type="file"
          onChange={(e) => setForm({ ...form, image: e.target.files[0] })}
          className="border border-gray-300 p-2 rounded-lg w-full"
          accept="image/*"
        />

        <button className="w-full sm:w-auto bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition">
          ➕ Add Product
        </button>
      </form>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {products.map((p) => (
          <div
            key={p._id}
            className="bg-white rounded-2xl shadow-md hover:shadow-lg transition overflow-hidden relative group"
          >
            {p.image ? (
              <img
                src={
                  p.image.startsWith("http")
                    ? p.image
                    : `${UPLOAD_BASE}${p.image}`
                }
                alt={p.name}
                className="h-44 sm:h-48 w-full object-cover"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/150";
                }}
              />
            ) : (
              <div className="h-44 sm:h-48 bg-gray-200 flex items-center justify-center text-gray-500">
                No Image
              </div>
            )}
            <div className="p-4 space-y-1">
              <h3 className="font-semibold text-gray-800 truncate">{p.name}</h3>
              <p className="text-sm text-gray-600 truncate">
                {p.categoryId?.name} / {p.subCategoryId?.name}
              </p>
              <div className="flex justify-between items-center mt-2">
                <span className="font-bold text-blue-600">₹{p.mrp}</span>
                <span className="text-sm text-gray-600">Qty: {p.quantity}</span>
              </div>
            </div>

            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition">
              <button
                onClick={() => openEditModal(p)}
                className="bg-yellow-500 text-white px-3 py-1 rounded-md text-sm hover:bg-yellow-600"
              >
                ✏️ Edit
              </button>
              <button
                onClick={() => del(p._id)}
                className="bg-red-600 text-white px-3 py-1 rounded-md text-sm hover:bg-red-700"
              >
                🗑 Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 px-4">
          <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">✏️ Edit Product</h2>
            <form onSubmit={updateProduct} className="space-y-3">
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Product Name"
                className="border p-2 w-full rounded"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <select
                  value={form.categoryId}
                  onChange={(e) =>
                    setForm({ ...form, categoryId: e.target.value })
                  }
                  className="border p-2 rounded"
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>

                <select
                  value={form.subCategoryId}
                  onChange={(e) =>
                    setForm({ ...form, subCategoryId: e.target.value })
                  }
                  className="border p-2 rounded"
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

              <input
                value={form.mrp}
                onChange={(e) => setForm({ ...form, mrp: e.target.value })}
                placeholder="MRP"
                type="number"
                className="border p-2 w-full rounded"
              />

              <input
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                placeholder="Quantity"
                type="number"
                className="border p-2 w-full rounded"
              />

              <input
                type="file"
                onChange={(e) => setForm({ ...form, image: e.target.files[0] })}
                className="border p-2 w-full rounded"
              />

              <div className="flex flex-col sm:flex-row justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductPage;
