"use client";

import { UserButton } from "@clerk/nextjs";
import { Search, Bell, Sun, Moon } from "lucide-react"; // Icons import kiye
import { useTheme } from "next-themes"; // Theme hook
import { useState, useEffect } from "react";

export default function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Hydration fix ke liye
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  return (
    <header className="h-16 fixed top-0 right-0 left-0 md:left-64 border-b border-zinc-200 dark:border-white/10 bg-white/80 dark:bg-[#020202]/80 backdrop-blur-xl z-40 flex items-center justify-between px-6 transition-all duration-300">
      
      {/* Search Bar */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="relative w-full max-w-md hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input 
                type="text" 
                placeholder="Search your brain... (Cmd+K)" 
                className="w-full h-10 pl-10 pr-4 rounded-full bg-zinc-100 dark:bg-zinc-900 border-none focus:ring-2 focus:ring-indigo-500 text-sm text-zinc-800 dark:text-zinc-200 outline-none transition-all placeholder:text-zinc-500"
            />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3 md:gap-4">
        
        {/* Theme Toggle Button */}
        {mounted && (
            <button 
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700"
            >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
        )}

        {/* Notification Bell */}
        <button className="relative p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <Bell className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
            <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-red-500 rounded-full border-2 border-white dark:border-black"></span>
        </button>

        {/* Divider */}
        <div className="h-6 w-px bg-zinc-300 dark:bg-zinc-700 mx-1"></div>

        {/* User Profile */}
        <UserButton 
            afterSignOutUrl="/" 
            appearance={{ 
                elements: { 
                    avatarBox: "h-9 w-9 ring-2 ring-indigo-500/20 hover:ring-indigo-500 transition-all" 
                } 
            }}
        />
      </div>
    </header>
  );
}