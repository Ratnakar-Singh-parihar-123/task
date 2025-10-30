import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { API_BASE } from "../API";
import { Loader2, Plus, Trash2 } from "lucide-react";

export default function SubCategoryPage() {
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const userId = localStorage.getItem("userId");

  //  Fetch all categories
  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_BASE}/categories`);
      setCategories(res.data.data || []);
    } catch (err) {
      toast.error("Failed to load categories");
    }
  };

  //  Fetch all subcategories
  const fetchSubCategories = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/subcategories`);
      const subs = res.data.data || [];
      const userSubs = userId
        ? subs.filter((s) => String(s.createdBy) === String(userId))
        : subs;
      setSubCategories(userSubs);
    } catch (err) {
      toast.error("Failed to load subcategories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchSubCategories();
  }, []);

  //  Add subcategory
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!selectedCategory || !name.trim()) {
      toast.warn("Select category & enter name");
      return;
    }

    setCreating(true);
    try {
      await axios.post(`${API_BASE}/subcategories`, {
        name,
        categoryId: selectedCategory,
        createdBy: userId,
      });
      toast.success("Subcategory added");
      setName("");
      setSelectedCategory("");
      fetchSubCategories();
    } catch (err) {
      toast.error("Error adding subcategory");
    } finally {
      setCreating(false);
    }
  };

  //  Delete subcategory
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this subcategory?")) return;
    try {
      await axios.delete(`${API_BASE}/subcategories/${id}`);
      toast.success("Deleted successfully");
      fetchSubCategories();
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800 flex items-center gap-2">
        <Plus className="text-blue-600" /> Manage Subcategories
      </h2>

      {/*  Add Form */}
      <form
        onSubmit={handleAdd}
        className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4"
      >
        <div className="space-y-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Subcategory name"
            className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={creating}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-60"
        >
          {creating ? <Loader2 className="animate-spin w-5 h-5" /> : <Plus />}
          {creating ? "Adding..." : "Add Subcategory"}
        </button>
      </form>

      {/*  List */}
      <div className="bg-white mt-8 p-5 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          Subcategory List
        </h3>

        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="animate-spin w-6 h-6 text-blue-600" />
          </div>
        ) : subCategories.length === 0 ? (
          <p className="text-gray-500 text-center py-6">
            No subcategories found
          </p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {subCategories.map((s) => (
              <li
                key={s._id}
                className="flex justify-between items-center py-3 px-2 hover:bg-gray-50 rounded-lg transition"
              >
                <div>
                  <p className="font-medium text-gray-800">{s.name}</p>
                  <p className="text-sm text-gray-500">
                    {s.categoryId?.name || "No category"}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(s._id)}
                  className="text-red-600 hover:text-red-800 transition"
                  title="Delete"
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