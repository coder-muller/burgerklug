"use client"

import { MoonIcon, SunIcon } from "lucide-react";
import { Button } from "./ui/button";
import { useTheme } from "next-themes";

interface ThemeToggleProps {
    className?: string;
    size?: "default" | "sm" | "lg" | "icon" | "icon-sm" | "icon-lg";
    variant?: "default" | "outline" | "ghost" | "link" | "secondary" | "destructive";
}

export function ThemeToggle({ className, size = "icon", variant = "ghost" }: ThemeToggleProps) {

    const { theme, setTheme } = useTheme();

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark");
    }

    return (
        <Button variant={variant} size={size} className={className} onClick={toggleTheme}>
            <SunIcon className="scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
            <MoonIcon className="absolute scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
        </Button>
    )
}