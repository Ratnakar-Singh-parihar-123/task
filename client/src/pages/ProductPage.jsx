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

  //  Fetch Products
  const fetchProducts = async () => {
    const res = await fetch(`${API_BASE}/products`);
    const data = await safeJson(res);
    setProducts(data);
  };

 
  const fetchCategories = async () => {
    const res = await fetch(`${API_BASE}/categories`);
    let data = await safeJson(res);

    if (data.length === 0) {
      // Add default ones
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

  //  Initial Load
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);


  useEffect(() => {
    if (categories.length > 0) fetchSubcategories();
  }, [categories]);

  //  Add Product
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

  //  Delete Product
  const del = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    await fetch(`${API_BASE}/products/${id}`, { method: "DELETE" });
    fetchProducts();
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">🛍️ Manage Products</h2>

      {/* Add Product Form */}
      <form
        onSubmit={addProduct}
        className="bg-white p-6 rounded shadow mb-6 space-y-3"
      >
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Product Name"
          className="border p-2 w-full rounded"
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <select
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            className="border p-2 rounded"
            required
          >
            <option value="">Select Category</option>
            {Array.isArray(categories) &&
              categories.map((c) => (
                <option key={c._id || c.name} value={c._id}>
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
            required
          >
            <option value="">Select Subcategory</option>
            {Array.isArray(subcategories) &&
              subcategories
                .filter((s) => s.categoryId?._id === form.categoryId)
                .map((s) => (
                  <option key={s._id || s.name} value={s._id}>
                    {s.name}
                  </option>
                ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <input
            value={form.mrp}
            onChange={(e) => setForm({ ...form, mrp: e.target.value })}
            placeholder="MRP"
            type="number"
            className="border p-2 rounded"
            required
          />
          <input
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            placeholder="Quantity"
            type="number"
            className="border p-2 rounded"
            required
          />
        </div>

        <input
          type="file"
          onChange={(e) => setForm({ ...form, image: e.target.files[0] })}
          className="border p-2 rounded w-full"
          accept="image/*"
        />

        <button className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700">
          ➕ Add Product
        </button>
      </form>

      {/* Product List */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        {Array.isArray(products) &&
          products.map((p) => (
            <div
              key={p._id}
              className="bg-white rounded shadow overflow-hidden relative group"
            >
              {p.image ? (
                <img
                  src={`${UPLOAD_BASE}${p.image}`}
                  alt={p.name}
                  className="h-40 w-full object-cover"
                />
              ) : (
                <div className="h-40 bg-gray-200 flex items-center justify-center text-gray-500">
                  No Image
                </div>
              )}

              <div className="p-3">
                <h3 className="font-semibold">{p.name}</h3>
                <p className="text-sm text-gray-600">
                  {p.categoryId?.name} / {p.subCategoryId?.name}
                </p>
                <div className="flex justify-between items-center mt-2">
                  <span className="font-bold text-blue-600">₹{p.mrp}</span>
                  <span className="text-sm text-gray-600">
                    Qty: {p.quantity}
                  </span>
                </div>
              </div>

              <button
                onClick={() => del(p._id)}
                className="absolute top-2 right-2 text-red-600 bg-white rounded-full p-1 shadow hidden group-hover:block"
                title="Delete"
              >
                🗑
              </button>
            </div>
          ))}
      </div>
    </div>
  );
}

export default ProductPage;
