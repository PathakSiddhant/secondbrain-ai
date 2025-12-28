"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, PlusCircle, CloudUpload, Loader2, Sparkles, Brain, Link as LinkIcon, Youtube, FileText, Globe, ChevronDown, ChevronRight, Clock, LayoutDashboard, X, Eye, Lock, FileCode, FileSpreadsheet, ExternalLink, FileType } from "lucide-react"; 
import { motion, AnimatePresence } from "framer-motion"; 
import ReactMarkdown from "react-markdown"; 
import { UserButton, useUser } from "@clerk/nextjs"; 
import Link from "next/link"; 
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const getYouTubeID = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

// --- FOLDER COMPONENT ---
const Folder = ({ title, icon: Icon, items, isOpen, onToggle }) => (
  <div className="mb-2">
     <button onClick={onToggle} className="w-full flex items-center justify-between p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-all group">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
           <Icon className={`h-4 w-4 ${isOpen ? 'text-indigo-400' : 'text-zinc-600 group-hover:text-zinc-400'}`} />
           {title}
        </div>
        {isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
     </button>
     <AnimatePresence>
        {isOpen && (
           <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden pl-2">
              <div className="pl-2 border-l border-zinc-800 space-y-1 py-1">
                 {items.map((item) => (
                    <button key={item.id} className="w-full text-left p-2 rounded-md hover:bg-zinc-900 group transition-all">
                       <p className="text-[13px] text-zinc-300 truncate group-hover:text-white">{item.title}</p>
                       <div className="flex items-center gap-1 text-[10px] text-zinc-600 mt-0.5">
                          <Clock className="h-2 w-2" /> {item.date}
                       </div>
                    </button>
                 ))}
                 {items.length === 0 && <p className="text-[10px] text-zinc-600 p-2 italic">No chats yet</p>}
              </div>
           </motion.div>
        )}
     </AnimatePresence>
  </div>
);

export default function ChatPage() {
  const { user } = useUser(); 
  const [messages, setMessages] = useState([]); 
  const [input, setInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessingLink, setIsProcessingLink] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  
  // --- ACTIVE SOURCE ---
  const [activeSource, setActiveSource] = useState(null); 
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [openFolders, setOpenFolders] = useState({ youtube: true, pdf: true, website: true });
  
  const history = { youtube: [], pdf: [], website: [] };

  const toggleFolder = (folder) => setOpenFolders(prev => ({ ...prev, [folder]: !prev[folder] }));
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => scrollToBottom(), [messages, isLoading, isProcessingLink, isUploading]);

  const handleNewChat = async () => {
    setMessages([]);
    setInput("");
    setLinkUrl("");
    setActiveSource(null);
    setIsViewerOpen(false);
    try { await fetch("http://127.0.0.1:8000/reset", { method: "DELETE" }); } 
    catch (e) { console.error(e); }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = input;
    setInput(""); 
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true); 

    try {
      const response = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userMessage }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessages(prev => [...prev, { role: "ai", content: data.answer }]);
      } else {
        setMessages(prev => [...prev, { role: "ai", content: "❌ Error generating answer." }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: "ai", content: "⚠️ Server Error." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true); // START LOADING ANIMATION
    const formData = new FormData();
    formData.append("file", file);
    
    try {
      const res = await fetch("http://127.0.0.1:8000/upload", { method: "POST", body: formData });
      const data = await res.json();
      
      if (res.ok) {
         setMessages(prev => [...prev, { role: "ai", content: `✅ **${data.type.toUpperCase()} Processed!**\nI've analyzed **${data.filename}**. Check the viewer.` }]);
         
         // Use backend returned text content for Word/Excel/Code
         const isPDF = data.type === 'pdf';
         const viewerUrl = isPDF ? URL.createObjectURL(file) : null;
         
         setActiveSource({ 
            type: data.type, // 'pdf', 'word', 'excel', 'csv', 'code'
            url: viewerUrl, 
            content: data.content, // Text content from backend
            name: data.filename 
         });
         setIsViewerOpen(true);
      }
    } catch (err) { alert("Upload Failed"); } 
    finally { setIsUploading(false); }
  };

  const handleLinkSubmit = async () => {
    if (!linkUrl.trim()) return;
    setIsProcessingLink(true); // START LOADING ANIMATION
    setShowLinkInput(false);

    const ytId = getYouTubeID(linkUrl);
    const type = ytId ? "youtube" : "web";

    try {
      const res = await fetch("http://127.0.0.1:8000/process-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: linkUrl, type }),
      });
      const data = await res.json();
      if (res.ok) {
        setActiveSource({ 
            type: type, 
            url: ytId ? ytId : linkUrl, 
            name: type === 'youtube' ? 'YouTube Video' : 'Website Source'
        });
        setIsViewerOpen(true);
        setMessages(prev => [...prev, { role: "ai", content: `## 🔗 Analysis Ready\nProcessed: **${type === 'youtube' ? 'YouTube' : 'Website'}**. Ask away.` }]);
        setLinkUrl("");
      } else {
        setMessages(prev => [...prev, { role: "ai", content: `❌ Error: ${data.detail}` }]);
      }
    } catch (err) { setMessages(prev => [...prev, { role: "ai", content: "⚠️ Connection Error." }]); } 
    finally { setIsProcessingLink(false); } 
  };

  return (
    <div className="flex h-screen bg-[#050505] text-white font-sans selection:bg-indigo-500/30 overflow-hidden">
      
      {/* --- SIDEBAR --- */}
      <div className="w-80 bg-[#0a0a0a] border-r border-white/5 flex flex-col md:flex flex-none z-20 shadow-2xl">
        <div className="p-5 flex items-center justify-between border-b border-white/5 bg-white/2">
          <div className="flex items-center gap-3">
             <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(79,70,229,0.5)]">
               <Brain className="h-5 w-5 text-white" />
             </div>
             <span className="font-bold text-lg tracking-tight text-white">SecondBrain</span>
          </div>
          <Link href="/dashboard">
             <Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-500 hover:text-white hover:bg-white/10" title="Go to Dashboard">
                <LayoutDashboard className="h-4 w-4" />
             </Button>
          </Link>
        </div>
        <div className="p-4 space-y-2">
          <Button onClick={handleNewChat} className="w-full justify-start gap-2 bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/20">
            <PlusCircle className="h-4 w-4" /> New Chat
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-2 custom-scrollbar">
           <Folder title="YouTube" icon={Youtube} items={history.youtube} isOpen={openFolders.youtube} onToggle={() => toggleFolder('youtube')} />
           <Folder title="Documents" icon={FileText} items={history.pdf} isOpen={openFolders.pdf} onToggle={() => toggleFolder('pdf')} />
           <Folder title="Websites" icon={Globe} items={history.website} isOpen={openFolders.website} onToggle={() => toggleFolder('website')} />
        </div>
        <div className="p-4 border-t border-white/5 bg-black/20">
           <div className="flex items-center gap-3">
              <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: "h-9 w-9 ring-2 ring-indigo-500/20" } }}/>
              <div className="flex flex-col">
                 <span className="text-sm font-medium text-white max-w-37.5 truncate">{user?.fullName || "User"}</span>
                 <span className="text-[10px] text-zinc-500">Free Plan</span>
              </div>
           </div>
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT: CHAT AREA */}
        <div className="flex-1 flex flex-col relative bg-linear-to-b from-[#050505] to-[#0a0a0a] min-w-0">
            
            {/* HEADER */}
            <header className="h-16 flex-none border-b border-white/5 flex items-center justify-between px-6 bg-[#050505]/80 backdrop-blur-md z-30">
                <div className="flex items-center gap-2">
                    {/* Status Indicator */}
                    <div className={`h-2 w-2 rounded-full ${isProcessingLink || isUploading ? 'bg-yellow-400' : 'bg-emerald-400'} shadow-[0_0_10px_currentColor]`} />
                    <span className="text-sm font-medium text-zinc-300">
                        {isProcessingLink || isUploading ? "Processing Source..." : "Brain Active"}
                    </span>
                </div>
                
                <div className="flex gap-3 items-center">
                    {activeSource && !isViewerOpen && (
                        <Button size="sm" onClick={() => setIsViewerOpen(true)} className="bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/20 rounded-full px-4 text-xs font-semibold animate-in fade-in">
                            <Eye className="h-3 w-3 mr-2" /> View Source
                        </Button>
                    )}

                    {activeSource || isUploading || isProcessingLink ? (
                        <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 rounded-full border border-zinc-800 text-xs text-zinc-400 animate-in fade-in">
                            {isUploading || isProcessingLink ? <Loader2 className="h-3 w-3 animate-spin" /> : <Lock className="h-3 w-3" />}
                            <span>{isUploading || isProcessingLink ? "Uploading..." : "Context Locked"}</span>
                        </div>
                    ) : (
                        <>
                            <div className="relative">
                                <AnimatePresence>
                                {showLinkInput && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 top-12 w-96 bg-[#111] border border-zinc-700 p-2 rounded-xl shadow-2xl z-50 flex gap-2">
                                        <Input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="Paste URL..." className="bg-black border-zinc-800 text-sm h-10" />
                                        <Button size="sm" onClick={handleLinkSubmit} disabled={!linkUrl} className="h-10 bg-indigo-600 hover:bg-indigo-500 text-white">Process</Button>
                                    </motion.div>
                                )}
                                </AnimatePresence>
                                <Button variant="ghost" size="sm" onClick={() => setShowLinkInput(!showLinkInput)} className="text-zinc-400 hover:text-white hover:bg-white/5 gap-2"><LinkIcon className="h-4 w-4" /> Add Link</Button>
                            </div>
                            
                            <Button size="sm" onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="bg-white text-black hover:bg-zinc-200 rounded-full px-4 text-xs font-semibold">
                                {isUploading ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <CloudUpload className="h-3 w-3 mr-2" />} Upload File
                            </Button>
                            <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.docx,.txt,.md,.py,.js,.jsx,.ts,.tsx,.cpp,.c,.java,.html,.css,.json,.csv,.xlsx,.xls" onChange={handleFileChange} />
                        </>
                    )}
                </div>
            </header>

            {/* MESSAGES */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar scroll-smooth">
                <div className="max-w-3xl mx-auto pb-6">
                    {/* 1. LOADING STATE (Center) */}
                    {(isProcessingLink || isUploading) && (
                        <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6 animate-in fade-in zoom-in duration-500">
                             <div className="h-24 w-24 bg-zinc-900/50 rounded-3xl border border-white/5 flex items-center justify-center shadow-2xl relative group">
                                <div className="absolute inset-0 bg-yellow-500/10 blur-xl rounded-full animate-pulse" />
                                <Loader2 className="h-10 w-10 text-yellow-400 animate-spin relative z-10" />
                             </div>
                             <div>
                                <h3 className="text-xl font-bold text-white mb-2">Processing Content...</h3>
                                <p className="text-zinc-500">Reading, Extracting, and Vectorizing.</p>
                             </div>
                        </div>
                    )}

                    {/* 2. EMPTY STATE (Only if not loading) */}
                    {messages.length === 0 && !isProcessingLink && !isUploading && (
                        <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6 animate-in fade-in zoom-in duration-500">
                            <div className="h-24 w-24 bg-zinc-900/50 rounded-3xl border border-white/5 flex items-center justify-center shadow-2xl relative group">
                            <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full group-hover:bg-indigo-500/30 transition-all" />
                            <Sparkles className="h-10 w-10 text-indigo-400 relative z-10" />
                            </div>
                            <div>
                            <h3 className="text-2xl font-bold text-white mb-2">SecondBrain AI</h3>
                            <p className="text-zinc-500">Supports: YouTube, PDF, Excel, Word & Code.</p>
                            </div>
                        </div>
                    )}
                    
                    {/* 3. MESSAGE LIST */}
                    {messages.length > 0 && (
                        <div className="space-y-12">
                            {messages.map((msg, index) => (
                            <motion.div key={index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-6 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {msg.role === 'ai' && (
                                    <div className="h-10 w-10 rounded-full bg-linear-to-t from-indigo-900 to-indigo-600 flex items-center justify-center shrink-0 mt-1 shadow-lg border border-white/10">
                                        <Bot className="h-5 w-5 text-white" />
                                    </div>
                                )}
                                <div className={`max-w-full sm:max-w-[85%] ${msg.role === 'user' ? 'bg-zinc-800 text-white px-6 py-4 rounded-3xl rounded-tr-md shadow-md' : ''}`}>
                                    {msg.role === 'ai' ? (
                                        <div className="text-zinc-100 leading-7">
                                            <ReactMarkdown components={{
                                                h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-white mt-8 mb-4 border-b border-indigo-500/30 pb-2" {...props} />,
                                                h2: ({node, ...props}) => <h2 className="text-xl font-semibold text-indigo-200 mt-6 mb-3 flex items-center gap-2" {...props} />,
                                                ul: ({node, ...props}) => <ul className="list-disc pl-6 space-y-2 mb-4 text-zinc-300 marker:text-indigo-500" {...props} />,
                                                li: ({node, ...props}) => <li className="pl-1" {...props} />,
                                                strong: ({node, ...props}) => <span className="font-bold text-indigo-400" {...props} />,
                                                blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-indigo-500 pl-4 py-2 my-4 bg-zinc-900/50 rounded-r text-zinc-400 italic" {...props} />
                                            }}>{msg.content}</ReactMarkdown>
                                        </div>
                                    ) : <p className="text-[15px] leading-relaxed">{msg.content}</p>}
                                </div>
                            </motion.div>
                            ))}
                            {/* Chat loading (small) */}
                            {isLoading && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
                                    <div className="h-10 w-10 rounded-full bg-zinc-900 border border-indigo-500/30 flex items-center justify-center shrink-0">
                                        <Loader2 className="h-5 w-5 text-indigo-400 animate-spin" />
                                    </div>
                                    <div className="mt-3 flex items-center gap-2 text-xs font-medium text-indigo-400 animate-pulse">
                                        <span>Thinking...</span>
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>
            </div>

            {/* INPUT */}
            <div className="flex-none p-6 bg-[#050505] relative z-30">
                <div className="max-w-3xl mx-auto relative">
                    <div className="relative flex gap-2 bg-[#0F0F0F] p-2 rounded-2xl border border-white/5 shadow-2xl focus-within:border-indigo-500/50 transition-colors">
                        <Input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()} placeholder="Ask a question..." className="bg-transparent border-0 text-white focus-visible:ring-0 px-4 py-6 text-base" disabled={isLoading} />
                        <Button onClick={handleSend} disabled={!input.trim() || isLoading} className="h-12 w-12 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20">
                            <Send className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>

        {/* --- RIGHT: PRO VIEWER PANEL --- */}
        <AnimatePresence>
            {activeSource && isViewerOpen && (
                <motion.div 
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: "500px", opacity: 1 }} 
                    exit={{ width: 0, opacity: 0 }}
                    className="border-l border-white/5 bg-[#0F0F0F] flex flex-col z-20 shadow-2xl"
                >
                    {/* Header */}
                    <div className="p-3 border-b border-white/5 flex items-center justify-between bg-zinc-900/80 backdrop-blur-sm">
                        <span className="text-xs font-bold text-zinc-400 flex items-center gap-2 uppercase tracking-wider">
                             {/* Dynamic Icon & Title based on type */}
                             {activeSource.type === 'youtube' && <><Youtube className="h-4 w-4 text-red-500" /> YouTube</>}
                             {activeSource.type === 'pdf' && <><FileText className="h-4 w-4 text-red-400" /> PDF Document</>}
                             {activeSource.type === 'word' && <><FileType className="h-4 w-4 text-blue-500" /> Word Document</>}
                             {activeSource.type === 'excel' && <><FileSpreadsheet className="h-4 w-4 text-green-500" /> Excel Sheet</>}
                             {activeSource.type === 'csv' && <><FileSpreadsheet className="h-4 w-4 text-green-400" /> CSV Data</>}
                             {activeSource.type === 'code' && <><FileCode className="h-4 w-4 text-yellow-500" /> Code File</>}
                             {activeSource.type === 'web' && <><Globe className="h-4 w-4 text-cyan-500" /> Web Source</>}
                             
                             <span className="text-zinc-600">|</span> 
                             <span className="truncate max-w-45" title={activeSource.name}>{activeSource.name}</span>
                        </span>
                        <Button size="icon" variant="ghost" className="h-6 w-6 hover:bg-white/10 rounded-md" onClick={() => setIsViewerOpen(false)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 bg-[#1e1e1e] overflow-auto relative custom-scrollbar">
                        {/* 1. YOUTUBE */}
                        {activeSource.type === 'youtube' && (
                            <div className="h-full flex flex-col">
                                <iframe className="w-full aspect-video" src={`https://www.youtube.com/embed/${activeSource.url}`} allowFullScreen></iframe>
                            </div>
                        )}
                        
                        {/* 2. PDF */}
                        {activeSource.type === 'pdf' && (
                            <iframe src={activeSource.url} className="w-full h-full bg-zinc-800" title="PDF"></iframe>
                        )}

                        {/* 3. CODE / WORD / EXCEL / CSV (Text Based) */}
                        {['code', 'word', 'excel', 'csv'].includes(activeSource.type) && (
                            <div className="text-sm font-mono">
                                <SyntaxHighlighter 
                                    language={activeSource.type === 'code' ? 'javascript' : 'text'} 
                                    style={vscDarkPlus}
                                    customStyle={{ margin: 0, padding: '1.5rem', background: 'transparent', fontSize: '13px' }}
                                    showLineNumbers={true}
                                    wrapLongLines={true}
                                >
                                    {activeSource.content}
                                </SyntaxHighlighter>
                            </div>
                        )}

                        {/* 4. WEBSITE (With Fallback) */}
                        {activeSource.type === 'web' && (
                             <div className="w-full h-full flex flex-col relative group">
                                <iframe src={activeSource.url} className="w-full h-full bg-white" sandbox="allow-scripts allow-same-origin"></iframe>
                                {/* Overlay button for blocked sites */}
                                <a href={activeSource.url} target="_blank" rel="noreferrer" className="absolute bottom-4 right-4 bg-zinc-900/90 text-white px-4 py-2 rounded-full text-xs font-bold border border-zinc-700 shadow-xl flex items-center gap-2 hover:bg-zinc-800 transition-all">
                                    <ExternalLink className="h-3 w-3" /> Open in New Tab
                                </a>
                             </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

      </div>
    </div>
  );
}