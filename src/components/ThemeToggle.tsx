"use client";

import { useTheme } from "@/lib/theme";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        className="relative inline-flex h-6 w-11 items-center rounded-full bg-neutral-600 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-neutral-900"
        role="switch"
        aria-checked={theme === "dark"}
        aria-label="Toggle theme"
      >
        <span
          className={`${
            theme === "dark" ? "translate-x-6" : "translate-x-1"
          } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
        />
      </button>
      <span className="text-sm text-neutral-300">
        {theme === "light" ? "Light" : "Dark"}
      </span>
    </div>
  );
}
