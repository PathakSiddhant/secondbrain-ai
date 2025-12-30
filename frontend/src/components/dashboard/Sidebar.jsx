"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutGrid, 
  Files, 
  MessageSquare, 
  Settings, 
  Brain, 
  PlusCircle,
  Zap
} from "lucide-react";

const MENU_ITEMS = [
  { name: "Home", icon: LayoutGrid, path: "/dashboard" },
  { name: "My Brain", icon: Files, path: "/dashboard/library" },
  { name: "Chat", icon: MessageSquare, path: "/dashboard/brain" }, 
  { name: "Settings", icon: Settings, path: "/dashboard/settings" },
];

export default function Sidebar() {
  const pathname = usePathname();

  // Mock Data for Free Plan (Backend se aayega real mein)
  const isPro = false; // Agar true hoga toh niche wala card change ho jayega
  const dailyChatsUsed = 3;
  const dailyChatsLimit = 10;
  const progressPercentage = (dailyChatsUsed / dailyChatsLimit) * 100;

  return (
    <aside className="w-64 h-screen fixed left-0 top-0 border-r border-zinc-200 dark:border-white/10 bg-white/50 dark:bg-[#020202]/90 backdrop-blur-xl z-50 flex flex-col md:flex">
      {/* Logo Area */}
      <div className="h-16 flex items-center px-6 border-b border-zinc-200 dark:border-white/10">
        <Link href="/" className="flex items-center gap-2 group">
           <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
             <Brain className="h-5 w-5 text-white" />
           </div>
           <span className="font-bold text-lg tracking-tight text-zinc-900 dark:text-white">SecondBrain</span>
        </Link>
      </div>

      {/* Main Menu */}
      <div className="flex-1 py-6 px-4 space-y-2">
        <button className="w-full flex items-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-black font-bold py-3 px-4 rounded-xl shadow-lg hover:scale-[1.02] transition-transform mb-6">
            <PlusCircle className="h-5 w-5" /> New Upload
        </button>

        <p className="text-xs font-bold text-zinc-400 px-2 uppercase tracking-wider mb-2">Menu</p>
        
        {MENU_ITEMS.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link key={item.path} href={item.path}>
              <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive 
                  ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20" 
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white"
              }`}>
                <item.icon className={`h-5 w-5 ${isActive ? "text-indigo-600 dark:text-indigo-400" : ""}`} />
                {item.name}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Usage Limit Area (Corrected Logic) */}
      <div className="p-4 border-t border-zinc-200 dark:border-white/10">
        {!isPro ? (
            // FREE USER VIEW
            <div className="p-4 rounded-xl bg-linear-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800/50 dark:to-zinc-900/50 border border-zinc-200 dark:border-zinc-700">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300">Free Plan</span>
                    <span className="text-[10px] text-zinc-500">Resets daily</span>
                </div>
                
                {/* Progress Bar */}
                <div className="h-2 w-full bg-zinc-300 dark:bg-zinc-700 rounded-full overflow-hidden mb-2">
                    <div 
                        className={`h-full rounded-full transition-all duration-500 ${progressPercentage > 80 ? 'bg-red-500' : 'bg-indigo-500'}`} 
                        style={{ width: `${progressPercentage}%` }}
                    ></div>
                </div>
                
                <div className="flex justify-between items-center text-[11px]">
                    <span className="text-zinc-700 dark:text-zinc-300 font-medium">{dailyChatsUsed} / {dailyChatsLimit} Chats</span>
                    <Link href="/pricing" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">Upgrade</Link>
                </div>
            </div>
        ) : (
            // PRO USER VIEW (Unlimited Flex)
            <div className="p-4 rounded-xl bg-linear-to-r from-indigo-600 to-purple-600 text-white shadow-lg relative overflow-hidden group">
                 <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-white/20 blur-2xl rounded-full group-hover:scale-150 transition-transform"></div>
                 <div className="relative z-10 flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm"><Zap className="h-5 w-5 text-yellow-300 fill-current"/></div>
                    <div>
                        <p className="text-sm font-bold">Pro Plan</p>
                        <p className="text-[10px] opacity-80">Unlimited Power</p>
                    </div>
                 </div>
            </div>
        )}
      </div>
    </aside>
  );
}