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

  //  Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, prodRes] = await Promise.all([
        axios.get(`${API_BASE}/dashboard-stats`),
        axios.get(`${API_BASE}/products`),
      ]);

      setStats(statsRes.data);
      const latest = [...prodRes.data].reverse().slice(0, 6);
      setRecentProducts(latest);
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
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
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-80">
        <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 space-y-10">
      {/*  Header */}
      <div className="text-center sm:text-left">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
          Dashboard Overview
        </h2>
        <p className="text-gray-500 text-sm sm:text-base mt-1">
          Quick summary of categories, subcategories & products
        </p>
      </div>

      {/*  Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <StatCard
          label="Total Categories"
          value={stats.categories}
          Icon={Layers}
          color="text-blue-600"
        />
        <StatCard
          label="Total Subcategories"
          value={stats.subCategories}
          Icon={FolderTree}
          color="text-green-600"
        />
        <StatCard
          label="Total Products"
          value={stats.products}
          Icon={Package}
          color="text-purple-600"
        />
      </div>

      {/*  Recent Products */}
      <div>
        <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2 justify-center sm:justify-start">
          <Package className="text-blue-600" size={20} />
          Recent Products
        </h3>

        {recentProducts.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-6 text-center text-gray-500 shadow-sm">
            No products available yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {recentProducts.map((p) => (
              <ProductCard key={p._id} product={p} onDelete={() => handleDelete(p._id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/*  StatCard Component */
function StatCard({ label, value, Icon, color }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 sm:p-6 flex items-center justify-between hover:shadow-md transition-all">
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mt-1">{value}</h2>
      </div>
      <Icon size={36} className={`${color} opacity-80`} />
    </div>
  );
}

/*  ProductCard Component */
function ProductCard({ product: p, onDelete }) {
  const imageUrl = p.image?.startsWith("http")
    ? p.image
    : `${UPLOAD_BASE}${p.image || ""}`;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all relative overflow-hidden">
      <button
        onClick={onDelete}
        className="absolute top-2 right-2 bg-red-100 hover:bg-red-200 p-1.5 rounded-full transition"
        title="Delete product"
      >
        <Trash2 className="text-red-600 w-4 h-4" />
      </button>

      <div className="h-40 sm:h-44 bg-gray-100">
        {p.image ? (
          <img
            src={imageUrl}
            alt={p.name}
            className="w-full h-full object-cover"
            onError={(e) => (e.target.src = "/no-image.png")}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            No Image
          </div>
        )}
      </div>

      <div className="p-3 sm:p-4 space-y-1">
        <h3 className="font-semibold text-gray-800 text-sm sm:text-base truncate">{p.name}</h3>
        <p className="text-xs text-gray-500 truncate">
          {p.categoryId?.name || "No Category"} / {p.subCategoryId?.name || "No Subcategory"}
        </p>
        <div className="flex justify-between items-center mt-2">
          <span className="text-blue-600 font-bold text-sm sm:text-base">₹{p.mrp}</span>
          <span className="text-gray-600 text-xs sm:text-sm">Qty: {p.quantity}</span>
        </div>
      </div>
    </div>
  );
}