"use client";

import { Sun, Moon, Sparkles } from "lucide-react";
import { useTheme, type Theme } from "@/contexts/ThemeContext";

const themes: { value: Theme; label: string; icon: React.ReactNode }[] = [
  { value: "light", label: "Light", icon: <Sun className="w-3.5 h-3.5" /> },
  { value: "dark",  label: "Dark",  icon: <Moon className="w-3.5 h-3.5" /> },
  { value: "blush", label: "Blush", icon: <Sparkles className="w-3.5 h-3.5" /> },
];

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-0.5 bg-gray-100 rounded-full p-1">
      {themes.map(({ value, label, icon }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          title={label}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
            theme === value
              ? "bg-rose-500 text-white shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {icon}
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}
