import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  LayoutDashboard,
  Layers,
  Package,
  FolderTree,
} from "lucide-react";

export default function Sidebar() {
  const loc = useLocation();
  const [open, setOpen] = useState(false);

  const linkClass = (path) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
      loc.pathname === path
        ? "bg-blue-600 text-white shadow-md"
        : "text-gray-300 hover:bg-gray-800 hover:text-white"
    }`;

  return (
    <>
      {/*  Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between bg-gray-900 text-white px-4 py-3 shadow">
        <h1 className="text-lg font-semibold">Task Panel</h1>
        <button onClick={() => setOpen(true)}>
          <Menu size={24} />
        </button>
      </div>

      {/*  Sidebar (Right-side Drawer) */}
      <aside
        className={`fixed md:static top-0 right-0 h-full bg-gray-900 text-white z-50 flex flex-col transition-transform duration-300
          ${open ? "translate-x-0" : "translate-x-full"} md:translate-x-0
          w-64`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
          <h1 className="font-bold text-lg">Task Panel</h1>
          <button
            onClick={() => setOpen(false)}
            className="text-gray-400 hover:text-white focus:outline-none md:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Link
            className={linkClass("/")}
            to="/"
            onClick={() => setOpen(false)}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>

          <Link
            className={linkClass("/categories")}
            to="/categories"
            onClick={() => setOpen(false)}
          >
            <Layers size={20} />
            <span>Category</span>
          </Link>

          <Link
            className={linkClass("/subcategories")}
            to="/subcategories"
            onClick={() => setOpen(false)}
          >
            <FolderTree size={20} />
            <span>Subcategory</span>
          </Link>

          <Link
            className={linkClass("/products")}
            to="/products"
            onClick={() => setOpen(false)}
          >
            <Package size={20} />
            <span>Products</span>
          </Link>
        </nav>

        {/* Footer */}
        <div className="p-4 text-center text-xs text-gray-500 border-t border-gray-800">
          © 2025 Task Panel
        </div>
      </aside>

      {/*  Overlay (for mobile) */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
        ></div>
      )}
    </>
  );
}