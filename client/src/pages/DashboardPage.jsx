import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE, UPLOAD_BASE } from "../API";
import { Package, Layers, FolderTree, Loader2, Trash2 } from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    categories: 0,
    subCategories: 0,
    products: 0,
  });
  const [recentProducts, setRecentProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const statsRes = await axios.get(`${API_BASE}/dashboard-stats`);
      const prodRes = await axios.get(`${API_BASE}/products`);
      setStats(statsRes.data);
      const sorted = [...prodRes.data].reverse().slice(0, 6);
      setRecentProducts(sorted);
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;
    try {
      await axios.delete(`${API_BASE}/products/${id}`);
      alert("Product deleted successfully!");
      fetchDashboardData();
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete product");
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const handleUpdate = () => fetchDashboardData();
    window.addEventListener("dataUpdated", handleUpdate);
    return () => window.removeEventListener("dataUpdated", handleUpdate);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-80">
        <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center sm:text-left">
        <h2 className="text-3xl sm:text-4xl font-bold mb-2 text-gray-800">
          📝 Task Dashboard
        </h2>
        <p className="text-gray-500 text-sm sm:text-base">
          Overview of your store’s live data
        </p>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <StatCard
          label="Total Categories"
          value={stats.categories}
          color="blue"
          Icon={Layers}
        />
        <StatCard
          label="Total Subcategories"
          value={stats.subCategories}
          color="green"
          Icon={FolderTree}
        />
        <StatCard
          label="Total Products"
          value={stats.products}
          color="purple"
          Icon={Package}
        />
      </div>

      {/* Recent Products */}
      <div>
        <h3 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-800 flex items-center gap-2 justify-center sm:justify-start">
          <Package className="text-blue-600" size={22} /> Recent Products
        </h3>

        {recentProducts.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 sm:p-10 text-center shadow-md text-gray-500 border border-gray-100">
            No products available yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {recentProducts.map((p) => (
              <ProductCard
                key={p._id}
                product={p}
                onDelete={() => handleDelete(p._id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color, Icon }) {
  const colors = {
    blue: "from-blue-50 to-blue-100 text-blue-700",
    green: "from-green-50 to-green-100 text-green-700",
    purple: "from-purple-50 to-purple-100 text-purple-700",
  };

  return (
    <div
      className={`bg-gradient-to-br ${colors[color]} rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-md flex items-center justify-between hover:shadow-lg transition-all`}
    >
      <div>
        <h3 className="text-xs sm:text-sm text-gray-600 font-medium">
          {label}
        </h3>
        <p className="text-2xl sm:text-4xl font-bold mt-1 sm:mt-2">{value}</p>
      </div>
      <Icon size={36} className="sm:size-42 opacity-80" />
    </div>
  );
}

function ProductCard({ product: p, onDelete }) {
  const imageUrl = p.image?.startsWith("http")
    ? p.image
    : `${UPLOAD_BASE}${p.image || ""}`;

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-md hover:shadow-xl transition-all border border-gray-100 overflow-hidden relative">
      <button
        onClick={onDelete}
        className="absolute top-2 right-2 bg-red-100 hover:bg-red-200 p-1.5 sm:p-2 rounded-full transition"
        title="Delete product"
      >
        <Trash2 className="text-red-600 w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      <div className="h-40 sm:h-48 bg-gray-100">
        {p.image ? (
          <img
            src={imageUrl}
            alt={p.name}
            className="w-full h-full object-cover"
            onError={(e) => (e.target.src = "/no-image.png")}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400 text-sm sm:text-base">
            No Image
          </div>
        )}
      </div>

      <div className="p-3 sm:p-4 space-y-1 sm:space-y-2">
        <h3 className="font-semibold text-gray-800 text-sm sm:text-base truncate">
          {p.name}
        </h3>
        <p className="text-xs sm:text-sm text-gray-500 truncate">
          {p.categoryId?.name || "No Category"} /{" "}
          {p.subCategoryId?.name || "No Subcategory"}
        </p>
        <div className="flex justify-between items-center mt-1 sm:mt-2">
          <span className="text-base sm:text-lg font-bold text-blue-600">
            ₹{p.mrp}
          </span>
          <span className="text-xs sm:text-sm text-gray-600">
            Qty: {p.quantity}
          </span>
        </div>
      </div>
    </div>
  );
}
