import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, LayoutDashboard, Layers, Package, FolderTree } from "lucide-react";

export default function Sidebar() {
  const loc = useLocation();
  const [open, setOpen] = useState(true);

  const linkClass = (path) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
      loc.pathname === path
        ? "bg-blue-600 text-white shadow-md"
        : "text-gray-300 hover:bg-gray-800 hover:text-white"
    }`;

  return (
    <aside
      className={`${
        open ? "w-64" : "w-20"
      } bg-gray-900 text-white min-h-screen flex flex-col transition-all duration-300`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <h1 className={`font-bold text-lg ${!open && "hidden"}`}>task Panel</h1>
        <button
          onClick={() => setOpen(!open)}
          className="text-gray-400 hover:text-white focus:outline-none"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        <Link className={linkClass("/")} to="/">
          <LayoutDashboard size={20} />
          {open && <span>Dashboard</span>}
        </Link>
        <Link className={linkClass("/categories")} to="/categories">
          <Layers size={20} />
          {open && <span>Category</span>}
        </Link>
        <Link className={linkClass("/subcategories")} to="/subcategories">
          <FolderTree size={20} />
          {open && <span>Subcategory</span>}
        </Link>
        <Link className={linkClass("/products")} to="/products">
          <Package size={20} />
          {open && <span>Products</span>}
        </Link>
      </nav>

      {/* Footer */}
      <div className="p-4 text-center text-xs text-gray-500 border-t border-gray-800">
        {open && "© 2025 task.."}
      </div>
    </aside>
  );
}