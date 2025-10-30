import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { API_BASE } from "../API";
import { Loader2, Trash2, PlusCircle } from "lucide-react";

export default function CategoryPage() {
  const [name, setName] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  // 🔹 Fetch all categories
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/categories`);
      const allCategories = Array.isArray(res.data.data)
        ? res.data.data
        : Array.isArray(res.data)
        ? res.data
        : [];
      setCategories(allCategories);
    } catch (err) {
      console.error("Error fetching categories:", err);
      toast.error("❌ Failed to load categories!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // 🔹 Add category
  const addCategory = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.warn(" Please enter a category name!");
      return;
    }
    setCreating(true);
    try {
      await axios.post(`${API_BASE}/categories`, { name: name.trim() });
      toast.success(" Category added successfully!");
      setName("");
      fetchCategories();
    } catch (err) {
      console.error("Error adding category:", err);
      toast.error("❌ Error adding category!");
    } finally {
      setCreating(false);
    }
  };

  // 🔹 Delete category
  const deleteCategory = async (id) => {
    if (!window.confirm("🗑️ Are you sure you want to delete this category?")) return;
    try {
      await axios.delete(`${API_BASE}/categories/${id}`);
      toast.success("🗑️ Category deleted!");
      fetchCategories();
    } catch (err) {
      console.error("Error deleting category:", err);
      toast.error("❌ Failed to delete category!");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Header */}
      <h2 className="text-3xl font-semibold mb-6 flex items-center gap-2 text-gray-800">
        <PlusCircle className="w-7 h-7 text-blue-600" />
        Manage Categories
      </h2>

      {/*  Add Category Form */}
      <form
        onSubmit={addCategory}
        className="bg-white p-6 rounded-2xl shadow-md mb-8 border border-gray-100 flex flex-col sm:flex-row gap-3"
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border border-gray-300 p-2 flex-1 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="Enter category name"
        />
        <button
          type="submit"
          disabled={creating}
          className="flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-60"
        >
          {creating ? (
            <>
              <Loader2 className="animate-spin w-5 h-5" /> Adding...
            </>
          ) : (
            <>
              <PlusCircle size={18} /> Add Category
            </>
          )}
        </button>
      </form>

      {/*  Category List */}
      <div className="bg-white p-5 rounded-2xl shadow-md border border-gray-100">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">Category List</h3>

        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="animate-spin w-6 h-6 text-blue-600" />
          </div>
        ) : categories.length === 0 ? (
          <p className="text-gray-600 text-center py-6">No categories found.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {categories.map((c) => (
              <li
                key={c._id}
                className="flex justify-between items-center py-3 px-2 hover:bg-gray-50 transition rounded-lg"
              >
                <span className="font-medium text-gray-800">{c.name}</span>
                <button
                  onClick={() => deleteCategory(c._id)}
                  className="text-red-600 hover:text-red-800 transition"
                  title="Delete Category"
                >
                  <Trash2 size={18} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}