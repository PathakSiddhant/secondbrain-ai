"use client";

import { motion } from "framer-motion";
import { 
  FileText, 
  Youtube, 
  Globe, 
  ArrowUpRight, 
  Clock 
} from "lucide-react";

export default function DashboardHome() {
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
      {/* Greeting Section (CLEANED) */}
      <div className="flex justify-between items-end">
        <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Welcome back, Human.</h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">Your Second Brain is ready. What do you want to learn today?</p>
        </div>
        {/* Storage removed. Ab clean hai. */}
      </div>

      {/* QUICK ACTIONS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {/* Upload PDF */}
         <motion.div variants={item} className="group p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500/50 cursor-pointer transition-all hover:shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity"><ArrowUpRight className="h-5 w-5 text-indigo-500"/></div>
            <div className="h-12 w-12 bg-red-100 dark:bg-red-500/20 rounded-2xl flex items-center justify-center mb-4 text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform">
                <FileText className="h-6 w-6"/>
            </div>
            <h3 className="font-bold text-lg mb-1 text-zinc-900 dark:text-white">Upload PDF</h3>
            <p className="text-sm text-zinc-500">Analyze research papers or contracts.</p>
         </motion.div>

         {/* YouTube */}
         <motion.div variants={item} className="group p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500/50 cursor-pointer transition-all hover:shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity"><ArrowUpRight className="h-5 w-5 text-indigo-500"/></div>
            <div className="h-12 w-12 bg-purple-100 dark:bg-purple-500/20 rounded-2xl flex items-center justify-center mb-4 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                <Youtube className="h-6 w-6"/>
            </div>
            <h3 className="font-bold text-lg mb-1 text-zinc-900 dark:text-white">Chat with Video</h3>
            <p className="text-sm text-zinc-500">Paste a YouTube link to summarize.</p>
         </motion.div>

         {/* Website */}
         <motion.div variants={item} className="group p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-500/50 cursor-pointer transition-all hover:shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity"><ArrowUpRight className="h-5 w-5 text-indigo-500"/></div>
            <div className="h-12 w-12 bg-emerald-100 dark:bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-4 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                <Globe className="h-6 w-6"/>
            </div>
            <h3 className="font-bold text-lg mb-1 text-zinc-900 dark:text-white">Add Website</h3>
            <p className="text-sm text-zinc-500">Scrape and chat with any URL.</p>
         </motion.div>
      </div>

      {/* KNOWLEDGE GRAPH & RECENT FILES */}
      <div className="grid md:grid-cols-3 gap-8">
          
          {/* Main Visual Area (Placeholder for Graph) */}
          <motion.div variants={item} className="md:col-span-2 h-80 rounded-3xl bg-zinc-900 dark:bg-black border border-zinc-200 dark:border-zinc-800 relative overflow-hidden flex items-center justify-center group">
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
              
              {/* Fake Graph Nodes Animation */}
              <div className="relative z-10 text-center">
                  <div className="flex justify-center gap-4 mb-4">
                      <div className="h-4 w-4 rounded-full bg-indigo-500 animate-bounce"></div>
                      <div className="h-4 w-4 rounded-full bg-purple-500 animate-bounce delay-100"></div>
                      <div className="h-4 w-4 rounded-full bg-emerald-500 animate-bounce delay-200"></div>
                  </div>
                  <p className="text-zinc-500 font-medium">Knowledge Graph Initializing...</p>
              </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div variants={item} className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-zinc-900 dark:text-white"><Clock className="h-4 w-4 text-zinc-400"/> Recent Activity</h3>
              <div className="space-y-4">
                  {[
                      { name: "Q3_Financial_Report.pdf", time: "2m ago", type: "PDF" },
                      { name: "Lex Fridman Podcast #342", time: "1h ago", type: "Video" },
                      { name: "React 19 Documentation", time: "5h ago", type: "Web" },
                  ].map((file, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl cursor-pointer transition-colors group">
                          <div className="h-10 w-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-500">
                              {file.type[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">{file.name}</p>
                              <p className="text-xs text-zinc-500">{file.time}</p>
                          </div>
                          <ArrowUpRight className="h-4 w-4 text-zinc-300 group-hover:text-indigo-500" />
                      </div>
                  ))}
              </div>
          </motion.div>
      </div>

    </motion.div>
  );
}