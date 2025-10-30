import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { API_BASE } from "../API";
import { Loader2, Trash2, PlusCircle } from "lucide-react";

export default function SubCategoryPage() {
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const userId = localStorage.getItem("userId");

  // Fetch Categories
  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_BASE}/categories`);
      const categoryData = Array.isArray(res.data.data)
        ? res.data.data
        : Array.isArray(res.data)
        ? res.data
        : [];
      setCategories(categoryData);
    } catch (err) {
      console.error("Error fetching categories:", err);
      toast.error("Failed to load categories");
    }
  };

  // Fetch Subcategories
  const fetchSubCategories = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/subcategories`);
      const subData = Array.isArray(res.data.data)
        ? res.data.data
        : Array.isArray(res.data)
        ? res.data
        : [];
      const mySubs = userId
        ? subData.filter((s) => String(s.createdBy) === String(userId))
        : subData;
      setSubCategories(mySubs);
    } catch (err) {
      console.error("Error fetching subcategories:", err);
      toast.error("Failed to load subcategories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchSubCategories();
  }, []);

  // Add Subcategory
  const addSubCategory = async (e) => {
    e.preventDefault();
    if (!selectedCategory || !name.trim()) {
      toast.warn("Please select a category and enter a subcategory name!");
      return;
    }
    setCreating(true);
    try {
      await axios.post(`${API_BASE}/subcategories`, {
        name: name.trim(),
        categoryId: selectedCategory,
        createdBy: userId,
      });
      toast.success("Subcategory added successfully!");
      setName("");
      setSelectedCategory("");
      fetchSubCategories();
    } catch (err) {
      console.error("Error adding subcategory:", err);
      toast.error("Failed to add subcategory!");
    } finally {
      setCreating(false);
    }
  };

  // Delete Subcategory
  const deleteSubCategory = async (id) => {
    if (!window.confirm("🗑️ Delete this subcategory?")) return;
    try {
      await axios.delete(`${API_BASE}/subcategories/${id}`);
      toast.success("Subcategory deleted!");
      fetchSubCategories();
    } catch (err) {
      console.error("Error deleting subcategory:", err);
      toast.error("Failed to delete subcategory!");
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
      <h2 className="text-2xl sm:text-3xl font-semibold mb-6 flex items-center gap-2 text-gray-800">
        <PlusCircle className="w-6 h-6 text-blue-600" />
        Manage Subcategories
      </h2>

      {/* Add Subcategory Form */}
      <form
        onSubmit={addSubCategory}
        className="bg-white p-4 sm:p-6 rounded-2xl shadow-md mb-8 border border-gray-100 space-y-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Category Dropdown */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Select Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-gray-300 p-2 w-full rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">-- Choose Category --</option>
              {categories.length > 0 ? (
                categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))
              ) : (
                <option disabled>No categories found</option>
              )}
            </select>
          </div>

          {/* Subcategory Input */}
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              Subcategory Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter subcategory name"
              className="border border-gray-300 p-2 w-full rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={creating}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-60"
        >
          {creating ? (
            <Loader2 className="animate-spin w-5 h-5" />
          ) : (
            <PlusCircle size={18} />
          )}
          {creating ? "Adding..." : "Add Subcategory"}
        </button>
      </form>

      {/* Subcategory List */}
      <div className="bg-white p-5 rounded-2xl shadow-md border border-gray-100">
        <h3 className="text-xl font-semibold mb-4">Subcategory List</h3>

        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="animate-spin w-6 h-6 text-blue-600" />
          </div>
        ) : subCategories.length === 0 ? (
          <p className="text-gray-600 text-center py-6">
            No subcategories found.
          </p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {subCategories.map((s) => (
              <li
                key={s._id}
                className="flex flex-col sm:flex-row justify-between sm:items-center py-3 px-2 hover:bg-gray-50 transition rounded-lg"
              >
                <div className="text-center sm:text-left">
                  <span className="font-medium text-gray-800">{s.name}</span>
                  <span className="text-sm text-gray-500 ml-1">
                    ({s.categoryId?.name || "No category"})
                  </span>
                </div>
                <button
                  onClick={() => deleteSubCategory(s._id)}
                  className="mt-2 sm:mt-0 text-red-600 hover:text-red-800 transition self-center"
                  title="Delete Subcategory"
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
