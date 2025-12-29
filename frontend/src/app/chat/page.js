"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, Plus, CloudUpload, Loader2, Sparkles, Brain, Link as LinkIcon, Youtube, FileText, Globe, ChevronDown, ChevronRight, Clock, LayoutGrid, X, Eye, Lock, Trash2, Edit2, MoreHorizontal, Check, Zap } from "lucide-react"; 
import { motion, AnimatePresence } from "framer-motion"; 
import ReactMarkdown from "react-markdown"; 
import { UserButton, useUser } from "@clerk/nextjs"; 
import Link from "next/link"; 
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const getYouTubeID = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

// --- ✨ SIDEBAR ITEM (Menu Trigger) ---
const SidebarItem = ({ item, isActive, onSelect, onMenuOpen }) => (
    <div 
        onClick={() => onSelect(item.id)}
        className={`group flex items-center justify-between py-2.5 px-3 rounded-lg cursor-pointer transition-all duration-200 mb-1 
        ${isActive 
            ? 'bg-zinc-800 text-white border-l-2 border-indigo-500 shadow-md' 
            : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 border-l-2 border-transparent'}`}
    >
        <div className="flex flex-col overflow-hidden w-full">
            <span className="text-[13px] font-medium truncate pr-2">{item.title}</span>
        </div>
        {/* THREE DOTS TRIGGER */}
        <button 
            onClick={(e) => { 
                e.stopPropagation(); 
                const rect = e.currentTarget.getBoundingClientRect();
                onMenuOpen({ id: item.id, title: item.title, x: rect.right + 10, y: rect.top });
            }}
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-zinc-700 rounded text-zinc-400 hover:text-white transition-all"
        >
            <MoreHorizontal className="h-4 w-4" />
        </button>
    </div>
);

// --- SECTION HEADER ---
const LibrarySection = ({ title, icon: Icon, items, isOpen, onToggle, onSelectChat, onMenuOpen, activeChatId, accentColor }) => (
  <div className="mb-4">
     <button onClick={onToggle} className="w-full flex items-center justify-between px-2 py-1.5 text-zinc-400 hover:text-zinc-200 transition-colors group mb-1">
        <div className="flex items-center gap-2.5">
           <Icon className={`h-4 w-4 ${activeChatId ? 'text-zinc-500' : accentColor}`} />
           <span className="text-xs font-bold uppercase tracking-widest opacity-80">{title}</span>
           <span className="bg-zinc-900 text-zinc-600 text-[9px] px-1.5 py-0.5 rounded-full min-w-[1.5rem] text-center">{items.length}</span>
        </div>
        {isOpen ? <ChevronDown className="h-3 w-3 opacity-50" /> : <ChevronRight className="h-3 w-3 opacity-50" />}
     </button>
     <AnimatePresence>
        {isOpen && (
           <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden pl-2">
                 {items.map((item) => (
                    <SidebarItem key={item.id} item={item} isActive={activeChatId === item.id} onSelect={onSelectChat} onMenuOpen={onMenuOpen} />
                 ))}
                 {items.length === 0 && <div className="py-2 pl-2 text-[11px] text-zinc-700 italic">No items</div>}
           </motion.div>
        )}
     </AnimatePresence>
  </div>
);

export default function ChatPage() {
  const { user } = useUser(); 
  const [messages, setMessages] = useState([]); 
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessingLink, setIsProcessingLink] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  
  const [activeSource, setActiveSource] = useState(null); 
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [currentChatId, setCurrentChatId] = useState(null); 

  const [history, setHistory] = useState({ youtube: [], pdf: [], website: [] });
  const [openSections, setOpenSections] = useState({ youtube: true, pdf: true, website: true });

  // 🔥 MENU STATE (FLOATING)
  const [activeMenu, setActiveMenu] = useState(null); 
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState("");

  const toggleSection = (sec) => setOpenSections(prev => ({ ...prev, [sec]: !prev[sec] }));
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => scrollToBottom(), [messages, isLoading, isProcessingLink, isUploading]);
  useEffect(() => { if (user?.id) fetchHistory(); }, [user]);

  const fetchHistory = async () => {
    if (!user) return;
    try {
        const res = await fetch(`http://127.0.0.1:8000/history/${user.id}`);
        const data = await res.json();
        const newHistory = { youtube: [], pdf: [], website: [] };
        data.chats.forEach(chat => {
            if (chat.source_type === 'youtube') newHistory.youtube.push(chat);
            else if (['pdf', 'word', 'excel', 'code', 'file'].includes(chat.source_type)) newHistory.pdf.push(chat);
            else newHistory.website.push(chat);
        });
        setHistory(newHistory);
    } catch (e) { console.error(e); }
  };

  const handleLoadChat = async (chatId) => {
      setIsLoading(true);
      setCurrentChatId(chatId);
      try {
          const res = await fetch(`http://127.0.0.1:8000/chat/${chatId}`);
          if(!res.ok) throw new Error("Chat not found");
          const data = await res.json();
          setMessages(data.messages);
          const meta = data.metadata;
          if (meta.source_type && meta.source_type !== 'general') {
              setActiveSource({ type: meta.source_type, url: meta.source_url, name: meta.title });
              setIsViewerOpen(true);
          } else { setActiveSource(null); }
      } catch (e) { console.error(e); } finally { setIsLoading(false); }
  };

  const handleDeleteChat = async () => {
      if(!activeMenu) return;
      if(!confirm("Permanently delete this?")) return;
      try {
          await fetch(`http://127.0.0.1:8000/chat/${activeMenu.id}`, { method: "DELETE" });
          if (currentChatId === activeMenu.id) handleNewChat();
          fetchHistory();
          setActiveMenu(null);
      } catch (e) { alert("Delete failed"); }
  };

  const handleRenameSubmit = async () => {
      if(!activeMenu || !renameValue.trim()) return;
      try {
          await fetch(`http://127.0.0.1:8000/chat/${activeMenu.id}`, { 
              method: "PATCH", 
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ new_title: renameValue })
          });
          fetchHistory();
          setActiveMenu(null);
          setIsRenaming(false);
      } catch (e) { alert("Rename failed"); }
  };

  const handleNewChat = () => {
    setMessages([]); setInput(""); setLinkUrl(""); setActiveSource(null); setIsViewerOpen(false); setCurrentChatId(null);
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = input;
    setInput(""); 
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true); 
    try {
      const payload = {
          query: userMessage, user_id: user?.id || "guest", chat_id: currentChatId, 
          source_type: activeSource?.type || "general", source_title: activeSource?.name || "New Chat", source_url: activeSource?.url || null
      };
      const response = await fetch("http://127.0.0.1:8000/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (response.ok) {
        setMessages(prev => [...prev, { role: "ai", content: data.answer }]);
        if (data.chat_id) { setCurrentChatId(data.chat_id); if (!currentChatId) fetchHistory(); }
      } else {
        const errorMsg = typeof data.detail === 'object' ? JSON.stringify(data.detail) : data.detail;
        setMessages(prev => [...prev, { role: "ai", content: "❌ Error: " + errorMsg }]);
      }
    } catch (error) { setMessages(prev => [...prev, { role: "ai", content: "⚠️ Connection Error" }]); } finally { setIsLoading(false); }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    let fileType = file.name.endsWith('.pdf') ? 'pdf' : (file.name.endsWith('.docx') ? 'word' : (file.name.endsWith('.xlsx') ? 'excel' : (file.name.endsWith('.csv') ? 'csv' : 'code')));
    setIsUploading(true);
    const formData = new FormData(); formData.append("file", file);
    try {
      const res = await fetch("http://127.0.0.1:8000/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) {
         setMessages(prev => [...prev, { role: "ai", content: `**Analysis Ready**\nProcessed **${data.filename}**.` }]);
         setActiveSource({ type: data.type, url: (fileType === 'pdf' ? objectUrl : null), content: data.content, name: data.filename });
         setIsViewerOpen(true);
      } else alert("Error: " + data.detail);
    } catch (err) { alert("Upload Failed"); } finally { setIsUploading(false); fileInputRef.current.value = ""; } 
  };

  const handleLinkSubmit = async () => {
    if (!linkUrl.trim()) return;
    setIsProcessingLink(true); setShowLinkInput(false);
    const ytId = getYouTubeID(linkUrl);
    const type = ytId ? "youtube" : "web";
    try {
      const res = await fetch("http://127.0.0.1:8000/process-link", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: linkUrl, type }) });
      const data = await res.json();
      if (res.ok) {
        const title = data.detail.title || (type === 'youtube' ? 'YouTube Video' : 'Website Source');
        setActiveSource({ type: type, url: ytId ? ytId : linkUrl, name: title });
        setIsViewerOpen(true);
        setMessages(prev => [...prev, { role: "ai", content: `**Connected: ${title}**\nI've analyzed the content.` }]);
        setLinkUrl("");
      } else setMessages(prev => [...prev, { role: "ai", content: `❌ Error: ${data.detail}` }]);
    } catch (err) { setMessages(prev => [...prev, { role: "ai", content: "⚠️ Error" }]); } finally { setIsProcessingLink(false); } 
  };

  return (
    <div className="flex h-screen bg-[#121212] text-zinc-100 font-sans overflow-hidden selection:bg-indigo-500/30">
      
      {/* --- SIDEBAR --- */}
      <div className="w-72 bg-[#0f0f0f] border-r border-zinc-800 flex flex-col md:flex flex-none z-20">
        <div className="p-5 flex items-center justify-between border-b border-zinc-900/50">
          <div className="flex items-center gap-2.5">
             <div className="h-8 w-8 bg-zinc-100 rounded-lg flex items-center justify-center">
               <Brain className="h-5 w-5 text-black" />
             </div>
             <span className="font-bold text-base tracking-tight text-zinc-100">SecondBrain</span>
          </div>
          <Link href="/dashboard"><Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-500 hover:text-white"><LayoutGrid className="h-4 w-4" /></Button></Link>
        </div>
        
        <div className="p-4">
            <Button onClick={handleNewChat} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm h-9 rounded-lg shadow-sm transition-all"><Plus className="h-4 w-4 mr-2" /> New Thread</Button>
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 custom-scrollbar">
           <LibrarySection title="Video" icon={Youtube} items={history.youtube} isOpen={openSections.youtube} onToggle={() => toggleSection('youtube')} onSelectChat={handleLoadChat} onMenuOpen={setActiveMenu} activeChatId={currentChatId} accentColor="text-red-500" />
           <LibrarySection title="Library" icon={FileText} items={history.pdf} isOpen={openSections.pdf} onToggle={() => toggleSection('pdf')} onSelectChat={handleLoadChat} onMenuOpen={setActiveMenu} activeChatId={currentChatId} accentColor="text-blue-500" />
           <LibrarySection title="Web Links" icon={Globe} items={history.website} isOpen={openSections.website} onToggle={() => toggleSection('website')} onSelectChat={handleLoadChat} onMenuOpen={setActiveMenu} activeChatId={currentChatId} accentColor="text-emerald-500" />
        </div>
        
        <div className="p-4 border-t border-zinc-900 bg-zinc-900/30">
           <div className="flex items-center gap-3">
              <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: "h-8 w-8 ring-1 ring-zinc-700" } }}/>
              <div className="flex flex-col"><span className="text-sm font-medium text-zinc-200 truncate max-w-30">{user?.fullName || "User"}</span><span className="text-[10px] text-zinc-500 uppercase tracking-wider">Pro Plan</span></div>
           </div>
        </div>
      </div>

      {/* --- MAIN AREA --- */}
      <div className="flex-1 flex flex-col relative bg-[#18181b]">
        
        {/* 🔥 OP LOADING OVERLAY */}
        <AnimatePresence>
            {(isUploading || isProcessingLink) && (
                <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 z-50 bg-[#09090b]/90 backdrop-blur-md flex flex-col items-center justify-center">
                    <div className="relative">
                        <div className="h-32 w-32 rounded-full border-2 border-indigo-500/20 animate-spin-slow"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Sparkles className="h-10 w-10 text-indigo-500 animate-pulse" />
                        </div>
                        <div className="absolute -inset-8 bg-indigo-500/20 blur-3xl rounded-full animate-pulse"></div>
                    </div>
                    <h2 className="mt-8 text-2xl font-bold text-white tracking-widest uppercase animate-pulse">Neural Processing...</h2>
                    <p className="text-zinc-500 mt-2 font-mono text-sm">Vectorizing data & building context</p>
                </motion.div>
            )}
        </AnimatePresence>

        {/* TOP BAR */}
        <header className="h-14 border-b border-zinc-800 flex items-center justify-between px-6 bg-[#18181b]/95 backdrop-blur-md z-30 sticky top-0">
            <div className="flex items-center gap-3">
                <div className={`h-2 w-2 rounded-full ${activeSource ? 'bg-indigo-500 shadow-[0_0_8px_#6366f1]' : 'bg-zinc-600'}`} />
                <span className="text-sm font-medium text-zinc-200 truncate max-w-md">{activeSource ? activeSource.name : "Ready"}</span>
            </div>
            <div className="flex gap-2 items-center">
                {activeSource && !isViewerOpen && <Button size="sm" onClick={() => setIsViewerOpen(true)} className="h-8 bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700 hover:text-white rounded-md text-xs"><Eye className="h-3.5 w-3.5 mr-2" /> Source</Button>}
                {!activeSource && (<><div className="relative"><AnimatePresence>{showLinkInput && (<motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:10}} className="absolute right-0 top-10 w-80 bg-[#1c1c1f] border border-zinc-700 p-3 rounded-xl shadow-2xl z-50 flex gap-2"><Input value={linkUrl} onChange={(e)=>setLinkUrl(e.target.value)} placeholder="Paste URL..." className="bg-zinc-900 border-zinc-700 text-xs h-8 text-white"/><Button size="sm" onClick={handleLinkSubmit} className="h-8 bg-indigo-600 hover:bg-indigo-500 text-white">Add</Button></motion.div>)}</AnimatePresence><Button variant="ghost" size="sm" onClick={() => setShowLinkInput(!showLinkInput)} className="h-8 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"><LinkIcon className="h-4 w-4 mr-2" /> Link</Button></div><Button size="sm" onClick={() => fileInputRef.current?.click()} className="h-8 bg-white text-black hover:bg-zinc-200 rounded-md text-xs font-medium px-3"><CloudUpload className="h-3.5 w-3.5 mr-2" /> Upload</Button><input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.docx,.txt,.md,.py,.js,.jsx,.ts,.tsx,.cpp,.c,.java,.html,.css,.json,.csv,.xlsx,.xls" onChange={handleFileChange} /></>)}
            </div>
        </header>

        {/* CHAT STREAM */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar scroll-smooth">
            <div className="max-w-3xl mx-auto space-y-8 pb-10">
                {messages.length === 0 && !activeSource && <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6 opacity-60"><div className="h-20 w-20 bg-zinc-900/50 rounded-2xl flex items-center justify-center border border-zinc-800"><Zap className="h-10 w-10 text-zinc-600" /></div><div><h3 className="text-xl font-medium text-zinc-300 mb-1">SecondBrain</h3><p className="text-zinc-600 text-sm">Add a source to begin.</p></div></div>}
                {messages.map((msg, index) => (
                    <motion.div key={index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        {msg.role === 'user' ? <div className="bg-zinc-800 text-zinc-200 px-4 py-2 rounded-2xl rounded-tr-sm max-w-[80%] text-sm shadow-sm">{msg.content}</div> : <div className="w-full text-zinc-300 leading-7 text-[15px] pt-2 pb-6 border-b border-zinc-800/50"><div className="flex items-center gap-2 mb-3"><div className="h-5 w-5 rounded bg-indigo-500/20 flex items-center justify-center"><Bot className="h-3 w-3 text-indigo-400" /></div><span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Answer</span></div><ReactMarkdown components={{h1: ({node,...props}) => <h1 className="text-xl font-bold text-zinc-100 mt-6 mb-3" {...props} />, h2: ({node,...props}) => <h2 className="text-lg font-semibold text-zinc-100 mt-5 mb-2" {...props} />, p: ({node,...props}) => <p className="mb-4 text-zinc-300" {...props} />, ul: ({node,...props}) => <ul className="list-disc pl-5 space-y-1 mb-4 text-zinc-300" {...props} />, strong: ({node,...props}) => <span className="font-bold text-indigo-300" {...props} />}}>{msg.content}</ReactMarkdown></div>}
                    </motion.div>
                ))}
                {isLoading && <div className="flex items-center gap-3 text-zinc-500 text-sm animate-pulse"><div className="h-2 w-2 bg-indigo-500 rounded-full animate-bounce"></div> Generating...</div>}
                <div ref={messagesEndRef} />
            </div>
        </div>

        {/* INPUT */}
        <div className="p-6 relative z-30"><div className="max-w-3xl mx-auto relative group"><div className="relative bg-[#1c1c1f] p-2.5 rounded-2xl border border-zinc-700 shadow-xl flex items-center gap-3 pl-5 focus-within:border-zinc-500 transition-all"><Input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()} placeholder="Ask a follow-up..." className="bg-transparent border-0 text-white focus-visible:ring-0 text-base h-10 placeholder:text-zinc-500" disabled={isLoading} /><Button onClick={handleSend} disabled={!input.trim() || isLoading} className="h-10 w-10 rounded-xl bg-white hover:bg-zinc-200 text-black shadow-md"><Send className="h-5 w-5" /></Button></div></div></div>
      </div>

      {/* VIEWER */}
      <AnimatePresence>
        {isViewerOpen && activeSource && (
            <motion.div initial={{width:0,opacity:0}} animate={{width:"45%",opacity:1}} exit={{width:0,opacity:0}} className="border-l border-zinc-800 bg-[#121212] flex flex-col z-20 shadow-2xl">
                <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-[#18181b]"><span className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2"><Eye className="h-4 w-4 text-indigo-500" /> Source Viewer</span><Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-zinc-800 rounded-lg" onClick={() => setIsViewerOpen(false)}><X className="h-5 w-5" /></Button></div>
                <div className="flex-1 overflow-auto bg-[#18181b] relative custom-scrollbar p-6">
                    {activeSource.type === 'youtube' && <iframe className="w-full aspect-video rounded-lg shadow-lg" src={`https://www.youtube.com/embed/${activeSource.url}`} allowFullScreen></iframe>}
                    {activeSource.type === 'web' && <iframe src={activeSource.url} className="w-full h-full bg-white rounded-lg" sandbox="allow-scripts allow-same-origin"></iframe>}
                    {activeSource.type === 'pdf' && activeSource.url && <iframe src={activeSource.url} className="w-full h-full rounded-lg border border-zinc-700" title="PDF"></iframe>}
                    {(['excel', 'csv', 'code', 'word'].includes(activeSource.type)) && <div className="text-sm font-mono bg-[#0d0d0d] p-4 rounded-lg border border-zinc-800 overflow-auto whitespace-pre">{activeSource.content}</div>}
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* 🔥 FLOATING CONTEXT MENU (FIXED POSITION) */}
      {activeMenu && (
          <div 
            className="fixed z-50 w-40 bg-[#18181b] border border-zinc-700 rounded-lg shadow-2xl py-1 flex flex-col animate-in fade-in zoom-in-95 duration-100"
            style={{ top: activeMenu.y, left: activeMenu.x }}
            onClick={(e) => e.stopPropagation()}
          >
              <div className="px-3 py-2 text-[10px] text-zinc-500 font-bold uppercase tracking-wider border-b border-zinc-800 mb-1">Options</div>
              
              {isRenaming ? (
                  <div className="px-2 pb-2">
                      <input 
                        className="w-full bg-zinc-900 border border-zinc-700 rounded text-xs p-1 text-white focus:outline-none focus:border-indigo-500" 
                        autoFocus 
                        placeholder="New Name"
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleRenameSubmit()}
                      />
                      <button onClick={handleRenameSubmit} className="mt-1 w-full bg-indigo-600 text-white text-[10px] py-1 rounded">Save</button>
                  </div>
              ) : (
                  <>
                    <button onClick={() => { setIsRenaming(true); setRenameValue(activeMenu.title); }} className="px-3 py-2 text-left text-xs text-zinc-300 hover:bg-zinc-800 flex items-center gap-2">
                        <Edit2 className="h-3.5 w-3.5" /> Rename
                    </button>
                    <button onClick={handleDeleteChat} className="px-3 py-2 text-left text-xs text-red-400 hover:bg-red-500/10 flex items-center gap-2">
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  </>
              )}
              
              {/* Close Overlay */}
              <div className="fixed inset-0 -z-10" onClick={() => { setActiveMenu(null); setIsRenaming(false); }} />
          </div>
      )}
    </div>
  );
}