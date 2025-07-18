import React from "react";
import { useDarkMode } from "../context/DarkModeContext";
import { Moon, Sun } from "lucide-react";

const DarkToggle = () => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <button
      onClick={toggleDarkMode}
      className="p-2 rounded-full transition-colors bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
      aria-label="Toggle Dark Mode"
    >
      {isDarkMode ? (
        <Moon className="w-5 h-5 text-yellow-400" />
      ) : (
        <Sun className="w-5 h-5 text-yellow-600" />
      )}
    </button>
  );
};

export default DarkToggle;
