"use client";

import { useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { useTheme } from "./theme-provider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  const handleThemeChange = (newTheme: "light" | "dark") => {
    setTheme(newTheme);
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative h-9 w-9 rounded-lg border-border/60 hover:border-primary/50 hover:bg-gradient-to-br hover:from-primary/10 hover:to-primary/5 transition-all duration-300"
          aria-label="Toggle theme"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px] !z-[9999]" style={{ pointerEvents: 'auto' }}>
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleThemeChange("light");
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleThemeChange("light");
          }}
          className="flex items-center gap-2 cursor-pointer"
          style={{ pointerEvents: 'auto' }}
        >
          <Sun className="h-4 w-4" />
          <span>Light</span>
          {theme === "light" && (
            <span className="ml-auto text-primary">✓</span>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleThemeChange("dark");
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleThemeChange("dark");
          }}
          className="flex items-center gap-2 cursor-pointer"
          style={{ pointerEvents: 'auto' }}
        >
          <Moon className="h-4 w-4" />
          <span>Dark</span>
          {theme === "dark" && (
            <span className="ml-auto text-primary">✓</span>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
