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

  //  Fetch all categories
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/categories`);
      setCategories(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err) {
      console.error("Error fetching categories:", err);
      toast.error("Failed to load categories!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  //  Add category
  const addCategory = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.warn("Please enter a category name!");
    setCreating(true);
    try {
      await axios.post(`${API_BASE}/categories`, { name });
      toast.success("Category added successfully!");
      setName("");
      fetchCategories();
    } catch (err) {
      console.error("Error adding category:", err);
      toast.error("Error adding category!");
    } finally {
      setCreating(false);
    }
  };

  //  Delete category
  const deleteCategory = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      await axios.delete(`${API_BASE}/categories/${id}`);
      toast.success("Category deleted!");
      fetchCategories();
    } catch (err) {
      console.error("Error deleting category:", err);
      toast.error("Failed to delete category!");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-semibold mb-5 flex items-center gap-2 text-gray-800">
        <PlusCircle className="w-5 h-5 text-blue-600" />
        Manage Categories
      </h2>

      {/*  Add Category Form */}
      <form
        onSubmit={addCategory}
        className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col sm:flex-row gap-3"
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none flex-1 text-sm sm:text-base"
          placeholder="Enter category name..."
        />
        <button
          type="submit"
          disabled={creating}
          className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm sm:text-base disabled:opacity-60"
        >
          {creating ? (
            <>
              <Loader2 className="animate-spin w-4 h-4" />
              <span>Adding...</span>
            </>
          ) : (
            <>
              <PlusCircle size={16} />
              <span>Add</span>
            </>
          )}
        </button>
      </form>

      {/*  Category List */}
      <div className="bg-white mt-6 p-4 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          Categories
        </h3>

        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="animate-spin w-6 h-6 text-blue-600" />
          </div>
        ) : categories.length === 0 ? (
          <p className="text-gray-500 text-center py-6 text-sm">
            No categories found.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {categories.map((c) => (
              <li
                key={c._id}
                className="flex justify-between items-center py-3 px-2 hover:bg-gray-50 rounded-md transition text-sm sm:text-base"
              >
                <span className="text-gray-800 font-medium break-words">
                  {c.name}
                </span>
                <button
                  onClick={() => deleteCategory(c._id)}
                  className="text-red-600 hover:text-red-800 transition flex items-center gap-1"
                  title="Delete Category"
                >
                  <Trash2 size={16} />
                  <span className="hidden sm:inline">Delete</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}