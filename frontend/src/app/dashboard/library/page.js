"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CloudUpload, Youtube, Globe, FileText, 
  CheckCircle, Loader2, Trash2, Search, Filter 
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LibraryPage() {
  const { user } = useUser();
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState("file"); // file | youtube | website
  const [urlInput, setUrlInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [library, setLibrary] = useState([]);
  const [loadingLib, setLoadingLib] = useState(true);

  // Fetch Library on Load
  useEffect(() => {
    if(user) fetchLibrary();
  }, [user]);

  const fetchLibrary = async () => {
    try {
        const res = await fetch(`http://127.0.0.1:8000/history/${user.id}`);
        const data = await res.json();
        setLibrary(data.chats);
        setLoadingLib(false);
    } catch(e) { console.error(e); setLoadingLib(false); }
  };

  // 1. Handle File Upload
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    setIsProcessing(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("user_id", user.id); // 👈 Backend needs this now

    try {
        const res = await fetch("http://127.0.0.1:8000/upload", { method: "POST", body: formData });
        if(res.ok) {
            await fetchLibrary(); // Refresh list
            alert("File added to Brain!");
        } else {
            alert("Upload Failed");
        }
    } catch (err) { alert("Error uploading"); }
    finally { setIsProcessing(false); fileInputRef.current.value = ""; }
  };

  // 2. Handle Link Submit
  const handleLinkSubmit = async () => {
    if (!urlInput.trim() || !user) return;
    setIsProcessing(true);

    try {
        const res = await fetch("http://127.0.0.1:8000/process-link", { 
            method: "POST", 
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: urlInput, type: activeTab, user_id: user.id })
        });
        if(res.ok) {
            await fetchLibrary();
            setUrlInput("");
            alert("Link processed!");
        } else {
            alert("Link Failed");
        }
    } catch(err) { alert("Connection Error"); }
    finally { setIsProcessing(false); }
  };

  // Delete Item
  const handleDelete = async (chatId) => {
      if(!confirm("Delete this memory?")) return;
      await fetch(`http://127.0.0.1:8000/chat/${chatId}`, { method: "DELETE" });
      fetchLibrary();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Knowledge Library</h1>
        <p className="text-zinc-500 mt-2">Feed your Second Brain with documents, videos, and links.</p>
      </div>

      {/* 📥 INGESTION ENGINE (Input Area) */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm relative overflow-hidden">
        {isProcessing && (
            <div className="absolute inset-0 bg-white/80 dark:bg-black/80 z-10 flex items-center justify-center flex-col backdrop-blur-sm">
                <Loader2 className="h-10 w-10 text-indigo-500 animate-spin mb-4"/>
                <p className="text-zinc-900 dark:text-white font-medium animate-pulse">Vectorizing Content...</p>
            </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-zinc-200 dark:border-zinc-800 pb-2">
            {['file', 'youtube', 'website'].map((tab) => (
                <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-2 text-sm font-medium transition-colors relative ${activeTab === tab ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'}`}
                >
                    <span className="capitalize">{tab === 'website' ? 'Web Link' : tab}</span>
                    {activeTab === tab && <motion.div layoutId="underline" className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 dark:bg-indigo-400" />}
                </button>
            ))}
        </div>

        {/* Input Zones */}
        <div className="min-h-37.5 flex items-center justify-center">
            
            {/* FILE UPLOAD */}
            {activeTab === 'file' && (
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-32 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all group"
                >
                    <CloudUpload className="h-8 w-8 text-zinc-400 group-hover:text-indigo-500 mb-2 transition-colors"/>
                    <p className="text-sm text-zinc-500">Click to upload <span className="font-bold text-zinc-700 dark:text-zinc-300">PDF, DOCX, TXT</span></p>
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".pdf,.docx,.txt,.md,.csv" />
                </div>
            )}

            {/* YOUTUBE INPUT */}
            {activeTab === 'youtube' && (
                <div className="w-full flex gap-2">
                    <div className="relative flex-1">
                        <Youtube className="absolute left-3 top-3 h-5 w-5 text-red-500"/>
                        <input 
                            value={urlInput} 
                            onChange={(e)=>setUrlInput(e.target.value)}
                            placeholder="Paste YouTube Video URL..." 
                            className="w-full bg-zinc-50 dark:bg-black border border-zinc-300 dark:border-zinc-700 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-red-500/20"
                        />
                    </div>
                    <button onClick={handleLinkSubmit} className="bg-red-600 hover:bg-red-700 text-white px-6 rounded-xl font-medium transition-colors">Process</button>
                </div>
            )}

            {/* WEB INPUT */}
            {activeTab === 'website' && (
                <div className="w-full flex gap-2">
                    <div className="relative flex-1">
                        <Globe className="absolute left-3 top-3 h-5 w-5 text-emerald-500"/>
                        <input 
                            value={urlInput} 
                            onChange={(e)=>setUrlInput(e.target.value)}
                            placeholder="Paste Website Article URL..." 
                            className="w-full bg-zinc-50 dark:bg-black border border-zinc-300 dark:border-zinc-700 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500/20"
                        />
                    </div>
                    <button onClick={handleLinkSubmit} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 rounded-xl font-medium transition-colors">Scrape</button>
                </div>
            )}
        </div>
      </div>

      {/* 📚 THE LIBRARY GRID */}
      <div>
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Your Brain Data</h2>
            <div className="flex gap-2">
                <button className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-500"><Search className="h-4 w-4"/></button>
                <button className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-500"><Filter className="h-4 w-4"/></button>
            </div>
        </div>

        {loadingLib ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-zinc-400"/></div>
        ) : library.length === 0 ? (
            <div className="text-center py-20 text-zinc-500 bg-zinc-50 dark:bg-zinc-900/30 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800">
                <p>No data yet. Upload something above!</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {library.map((item) => (
                    <motion.div 
                        key={item.id} 
                        initial={{opacity:0, scale:0.95}} 
                        animate={{opacity:1, scale:1}}
                        className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl hover:shadow-lg transition-all flex flex-col justify-between"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className={`p-2.5 rounded-xl ${
                                item.source_type === 'youtube' ? 'bg-red-100 text-red-600 dark:bg-red-500/10' :
                                item.source_type === 'web' || item.source_type === 'website' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10' :
                                'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10'
                            }`}>
                                {item.source_type === 'youtube' ? <Youtube className="h-5 w-5"/> : 
                                 (item.source_type === 'web' || item.source_type === 'website') ? <Globe className="h-5 w-5"/> : 
                                 <FileText className="h-5 w-5"/>}
                            </div>
                            <button onClick={() => handleDelete(item.id)} className="text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Trash2 className="h-4 w-4"/>
                            </button>
                        </div>
                        
                        <div>
                            <h3 className="font-bold text-zinc-800 dark:text-zinc-100 line-clamp-1 mb-1">{item.title || "Untitled"}</h3>
                            <p className="text-xs text-zinc-500 uppercase tracking-wider">{item.source_type}</p>
                        </div>

<Link href={`/chat/${item.id}`} className="mt-4">  {/* 👈 CHANGE THIS LINE */}
    <button className="w-full py-2 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:border-indigo-500 hover:text-indigo-500 transition-colors">
        Chat with this
    </button>
</Link>
                    </motion.div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
}