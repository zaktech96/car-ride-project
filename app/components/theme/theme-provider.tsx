"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "dark" | "light";
};

const initialState: ThemeProviderState = {
  theme: "light",
  setTheme: () => null,
  resolvedTheme: "light",
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "light",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return defaultTheme;
    return (localStorage.getItem(storageKey) as Theme) || defaultTheme;
  });
  const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">(() => {
    if (typeof window === "undefined") return "light";
    const stored = localStorage.getItem(storageKey) as Theme;
    return stored === "dark" ? "dark" : "light";
  });

  // Apply theme immediately on mount to prevent flash (runs first)
  useEffect(() => {
    const root = window.document.documentElement;
    const stored = localStorage.getItem(storageKey) as Theme;
    // Default to light mode if no stored value
    const initialTheme = stored || defaultTheme;

    root.classList.remove("light", "dark");
    if (initialTheme === "dark") {
      root.classList.add("dark");
    } else {
      // Ensure light mode - remove dark class
      root.classList.remove("dark");
    }
  }, [storageKey, defaultTheme]);

  // Apply theme when theme state changes
  useEffect(() => {
    const root = window.document.documentElement;

    // Always remove both classes first
    root.classList.remove("light", "dark");

    // Apply theme: dark mode adds class, light mode uses default :root styles
    if (theme === "dark") {
      root.classList.add("dark");
      setResolvedTheme("dark");
    } else {
      // Light mode - ensure dark class is removed, uses :root styles
      root.classList.remove("dark");
      setResolvedTheme("light");
    }
  }, [theme]);

  const updateTheme = (newTheme: Theme) => {
    localStorage.setItem(storageKey, newTheme);
    setTheme(newTheme);
  };

  const value = {
    theme,
    setTheme: updateTheme,
    resolvedTheme,
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
