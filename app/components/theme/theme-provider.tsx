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

  // Apply theme on initial mount and when theme changes
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

  // Apply theme immediately on mount to prevent flash
  useEffect(() => {
    const root = window.document.documentElement;
    const stored = localStorage.getItem(storageKey) as Theme;
    const initialTheme = stored || defaultTheme;
    
    root.classList.remove("light", "dark");
    if (initialTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, []);

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
