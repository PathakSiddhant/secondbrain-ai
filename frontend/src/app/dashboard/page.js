"use client";

import { motion } from "framer-motion";
import { FileText, Youtube, Globe, ArrowUpRight, Clock, Plus } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import KnowledgeGraph from "@/components/dashboard/KnowledgeGraph"; // 👈 Import kiya

export default function DashboardHome() {
  const { user } = useUser(); // User ID chahiye graph ke liye

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-8"
    >
      {/* Greeting Section */}
      <div className="flex justify-between items-end">
        <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
              Welcome back, {user?.firstName || "Human"}.
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">
              Your Second Brain is active.
            </p>
        </div>
<Link href="/chat/new"> {/* 👈 Update this path */}
    <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all">
        <Plus className="h-4 w-4" /> New Entry
    </button>
</Link>
      </div>

      {/* 🔥 THE REAL KNOWLEDGE GRAPH */}
      <div className="grid md:grid-cols-3 gap-8">
          <motion.div variants={item} className="md:col-span-2 relative group">
              {/* Pass User ID to fetch real data */}
              {user && <KnowledgeGraph userId={user.id} />} 
          </motion.div>

          {/* Quick Stats / Recent Activity */}
          <motion.div variants={item} className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-zinc-900 dark:text-white">
                    <Clock className="h-4 w-4 text-zinc-400"/> Recent Nodes
                </h3>
                {/* Note: In future, fetch real recent activity here too */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl cursor-pointer transition-colors">
                        <div className="h-8 w-8 bg-red-500/10 text-red-500 rounded-lg flex items-center justify-center">
                            <Youtube className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">AI Future Trends</p>
                            <p className="text-[10px] text-zinc-500">Video • 2h ago</p>
                        </div>
                    </div>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-zinc-50 dark:bg-black/50 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                  <p className="text-xs text-zinc-500 mb-1">Total Memories</p>
                  <p className="text-2xl font-bold text-zinc-900 dark:text-white">1,024 <span className="text-xs font-normal text-emerald-500">+12%</span></p>
              </div>
          </motion.div>
      </div>

      {/* QUICK ACTIONS */}
      <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Ingest Data</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {/* Upload PDF */}
         <Link href="/dashboard/library">
            <motion.div variants={item} className="group p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500/50 cursor-pointer transition-all hover:shadow-xl relative overflow-hidden h-full">
                <div className="h-12 w-12 bg-indigo-100 dark:bg-indigo-500/20 rounded-2xl flex items-center justify-center mb-4 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                    <FileText className="h-6 w-6"/>
                </div>
                <h3 className="font-bold text-lg mb-1 text-zinc-900 dark:text-white">Document</h3>
                <p className="text-sm text-zinc-500">Upload PDF, DOCX, TXT.</p>
            </motion.div>
         </Link>

         {/* YouTube */}
         <Link href="/dashboard/library">
            <motion.div variants={item} className="group p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500/50 cursor-pointer transition-all hover:shadow-xl relative overflow-hidden h-full">
                <div className="h-12 w-12 bg-red-100 dark:bg-red-500/20 rounded-2xl flex items-center justify-center mb-4 text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform">
                    <Youtube className="h-6 w-6"/>
                </div>
                <h3 className="font-bold text-lg mb-1 text-zinc-900 dark:text-white">YouTube</h3>
                <p className="text-sm text-zinc-500">Import video transcripts.</p>
            </motion.div>
         </Link>

         {/* Website */}
         <Link href="/dashboard/library">
            <motion.div variants={item} className="group p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500/50 cursor-pointer transition-all hover:shadow-xl relative overflow-hidden h-full">
                <div className="h-12 w-12 bg-emerald-100 dark:bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-4 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                    <Globe className="h-6 w-6"/>
                </div>
                <h3 className="font-bold text-lg mb-1 text-zinc-900 dark:text-white">Web Link</h3>
                <p className="text-sm text-zinc-500">Scrape articles & blogs.</p>
            </motion.div>
         </Link>
      </div>
    </motion.div>
  );
}