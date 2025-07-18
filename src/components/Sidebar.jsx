import React from "react";
import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const { pathname } = useLocation();

  const links = [
    { path: "/", label: "Home" },
    { path: "/cart", label: "Cart" },
    { path: "/add-product", label: "Add Product" },
    { path: "/user-products", label: "My Products" },
  ];

  return (
    <aside className="min-w-[200px] bg-gray-100 dark:bg-gray-800 p-4 shadow-md rounded-xl h-full">
      <nav className="flex flex-col gap-3">
        {links.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`py-2 px-4 rounded-md font-medium ${
              pathname === link.path
                ? "bg-blue-500 text-white"
                : "text-gray-700 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-gray-700"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
