import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

type Theme = "dark" | "light";

export function ThemeSwitcher() {
    const [theme, setTheme] = useState<Theme>(() => {
        const saved = localStorage.getItem("csv-insights:theme");
        return (saved as Theme) || "dark";
    });

    useEffect(() => {
        localStorage.setItem("csv-insights:theme", theme);
        document.documentElement.classList.toggle("light", theme === "light");
        document.documentElement.classList.toggle("dark", theme === "dark");
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === "dark" ? "light" : "dark"));
    };

    return (
        <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-8 h-8 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-indigo-500 hover:text-white transition-colors"
            aria-label="Toggle theme"
        >
            {theme === "dark" ? (
                <Sun className="w-4 h-4" />
            ) : (
                <Moon className="w-4 h-4" />
            )}
        </button>
    );
}