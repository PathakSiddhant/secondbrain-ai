"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User, PlusCircle, CloudUpload, Loader2, Sparkles, Brain, Link as LinkIcon, Youtube, ArrowUpRight } from "lucide-react"; 
import { motion, AnimatePresence } from "framer-motion"; 
import ReactMarkdown from "react-markdown"; 

const getYouTubeID = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const LoadingSteps = () => {
  const [step, setStep] = useState(0);
  const steps = ["🧠 Analyzing context...", "🔍 Connecting dots...", "✨ Drafting response..."];
  useEffect(() => {
    const timer = setInterval(() => setStep((p) => (p < steps.length - 1 ? p + 1 : p)), 1500);
    return () => clearInterval(timer);
  }, [steps.length]);
  return (
    <div className="flex items-center gap-2 text-xs font-medium text-indigo-400 animate-pulse">
       <Loader2 className="h-3 w-3 animate-spin" /> {steps[step]}
    </div>
  );
};

export default function ChatPage() {
  const [messages, setMessages] = useState([]); 
  const [input, setInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessingLink, setIsProcessingLink] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [currentVideoId, setCurrentVideoId] = useState(null); 

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => scrollToBottom(), [messages, isLoading, isProcessingLink]);

  const handleNewChat = async () => {
    setMessages([]);
    setInput("");
    setLinkUrl("");
    setCurrentVideoId(null);
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
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("http://127.0.0.1:8000/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) setMessages(prev => [...prev, { role: "ai", content: `✅ **PDF Processed!**\nI've read **${data.filename}**.` }]);
    } catch (err) { alert("Upload Failed"); } 
    finally { setIsUploading(false); }
  };

  const handleLinkSubmit = async () => {
    if (!linkUrl.trim()) return;
    setIsProcessingLink(true); 
    setShowLinkInput(false);

    const ytId = getYouTubeID(linkUrl);
    const type = ytId ? "youtube" : "website";

    try {
      const res = await fetch("http://127.0.0.1:8000/process-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: linkUrl, type }),
      });
      const data = await res.json();
      if (res.ok) {
        if (ytId) setCurrentVideoId(ytId);
        setMessages(prev => [...prev, { role: "ai", content: `## 🔗 Analysis Ready\nI have processed the content from **${ytId ? 'YouTube' : 'Website'}**. \n\nYou can now ask specific questions.` }]);
        setLinkUrl("");
      } else {
        setMessages(prev => [...prev, { role: "ai", content: `❌ Error: ${data.detail}` }]);
      }
    } catch (err) { setMessages(prev => [...prev, { role: "ai", content: "⚠️ Connection Error." }]); } 
    finally { setIsProcessingLink(false); } 
  };

  return (
    <div className="flex h-screen bg-[#050505] text-white font-sans selection:bg-indigo-500/30 overflow-hidden">
      
      {/* SIDEBAR */}
      <div className="w-80 bg-[#0a0a0a] border-r border-white/5 flex-col hidden md:flex flex-none z-20 shadow-2xl">
        <div className="p-6 flex items-center gap-3 border-b border-white/5 bg-white/2">
          <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(79,70,229,0.5)]">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight text-white">SecondBrain</span>
        </div>

        {currentVideoId && (
            <div className="p-4 border-b border-white/5 bg-black/40 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="rounded-xl overflow-hidden border border-indigo-500/30 shadow-lg shadow-indigo-900/20 aspect-video relative group">
                    <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${currentVideoId}`} title="YouTube video player" allowFullScreen></iframe>
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs text-indigo-300 bg-indigo-500/10 p-2 rounded-lg border border-indigo-500/20">
                    <Youtube className="h-3 w-3" /> Playing from Source
                </div>
            </div>
        )}

        <div className="p-4 space-y-2">
          <Button onClick={handleNewChat} variant="outline" className="w-full justify-start gap-2 border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-white hover:bg-zinc-800 hover:border-zinc-700 transition-all">
            <PlusCircle className="h-4 w-4" /> New Chat
          </Button>
        </div>
      </div>

      {/* MAIN CHAT */}
      <div className="flex-1 flex flex-col relative bg-linear-to-b from-[#050505] to-[#0a0a0a]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
           <div className="absolute top-[-20%] left-[20%] w-150 h-150 bg-indigo-600/5 rounded-full blur-[150px]" />
        </div>

        {/* HEADER */}
        <header className="h-16 flex-none border-b border-white/5 flex items-center justify-between px-6 bg-[#050505]/80 backdrop-blur-md z-30">
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${isProcessingLink ? 'bg-yellow-400' : 'bg-emerald-400'} shadow-[0_0_10px_currentColor]`} />
            <span className="text-sm font-medium text-zinc-300">{isProcessingLink ? "Analyzing..." : "Brain Active"}</span>
          </div>
          
          <div className="flex gap-3 items-center">
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
                {isUploading ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <CloudUpload className="h-3 w-3 mr-2" />} Upload PDF
             </Button>
             <input type="file" ref={fileInputRef} className="hidden" accept=".pdf" onChange={handleFileChange} />
          </div>
        </header>

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar scroll-smooth">
          <div className="max-w-3xl mx-auto pb-6">
            {messages.length === 0 && !isProcessingLink ? (
              <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6 animate-in fade-in zoom-in duration-500">
                <div className="h-24 w-24 bg-zinc-900/50 rounded-3xl border border-white/5 flex items-center justify-center shadow-2xl relative group">
                   <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full group-hover:bg-indigo-500/30 transition-all" />
                   <Sparkles className="h-10 w-10 text-indigo-400 relative z-10" />
                </div>
                <div>
                   <h3 className="text-2xl font-bold text-white mb-2">SidMini AI 2.0</h3>
                   <p className="text-zinc-500">Ready to analyze PDFs & YouTube Videos.</p>
                </div>
              </div>
            ) : (
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
                          // --- 🔥 THE MAGIC STYLING PART ---
                          <div className="text-zinc-100 leading-7">
                             <ReactMarkdown
                                components={{
                                   // 1. HEADINGS (Bada Text + Underline)
                                   h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-white mt-8 mb-4 border-b border-indigo-500/30 pb-2" {...props} />,
                                   h2: ({node, ...props}) => <h2 className="text-xl font-semibold text-indigo-200 mt-6 mb-3 flex items-center gap-2" {...props} />,
                                   h3: ({node, ...props}) => <h3 className="text-lg font-medium text-indigo-300 mt-4 mb-2" {...props} />,
                                   
                                   // 2. LISTS (Bullet Points Sahi Jagah Par)
                                   ul: ({node, ...props}) => <ul className="list-disc pl-6 space-y-2 mb-4 text-zinc-300 marker:text-indigo-500" {...props} />,
                                   ol: ({node, ...props}) => <ol className="list-decimal pl-6 space-y-2 mb-4 text-zinc-300 marker:text-indigo-500" {...props} />,
                                   li: ({node, ...props}) => <li className="pl-1" {...props} />,
                                   
                                   // 3. PARAGRAPHS (Saans Lene Ki Jagah)
                                   p: ({node, ...props}) => <p className="mb-4 leading-relaxed text-zinc-200" {...props} />,
                                   
                                   // 4. HIGHLIGHTS (Bold Text)
                                   strong: ({node, ...props}) => <span className="font-bold text-indigo-400" {...props} />,
                                   
                                   // 5. LINKS
                                   a: ({node, ...props}) => <a className="text-indigo-400 underline hover:text-indigo-300 transition-colors" target="_blank" {...props} />,
                                   
                                   // 6. QUOTES
                                   blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-indigo-500 pl-4 py-2 my-4 bg-zinc-900/50 rounded-r text-zinc-400 italic" {...props} />
                                }}
                             >
                                {msg.content}
                             </ReactMarkdown>
                          </div>
                       ) : <p className="text-[15px] leading-relaxed">{msg.content}</p>}
                    </div>
                  </motion.div>
                ))}
                
                {isProcessingLink && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-12 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20">
                        <Loader2 className="h-8 w-8 text-indigo-500 animate-spin mb-4" />
                        <h3 className="text-white font-medium">Analyzing Source...</h3>
                        <p className="text-zinc-500 text-sm mt-1">Extracting knowledge nuggets for you</p>
                    </motion.div>
                )}

                {isLoading && (
                   <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
                      <div className="h-10 w-10 rounded-full bg-zinc-900 border border-indigo-500/30 flex items-center justify-center shrink-0">
                         <Loader2 className="h-5 w-5 text-indigo-400 animate-spin" />
                      </div>
                      <div className="mt-3"><LoadingSteps /></div>
                   </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* INPUT */}
        <div className="flex-none p-6 bg-[#050505] relative z-40">
           <div className="max-w-3xl mx-auto relative">
              <div className="absolute inset-0 bg-indigo-500/5 blur-2xl rounded-full" />
              <div className="relative flex gap-2 bg-[#0F0F0F] p-2 rounded-2xl border border-white/5 shadow-2xl focus-within:border-indigo-500/50 transition-colors">
                 <Input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()} placeholder="Ask a question..." className="bg-transparent border-0 text-white focus-visible:ring-0 px-4 py-6 text-base" disabled={isLoading} />
                 <Button onClick={handleSend} disabled={!input.trim() || isLoading} className="h-12 w-12 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20">
                    <Send className="h-5 w-5" />
                 </Button>
              </div>
              <p className="text-center text-[10px] text-zinc-600 mt-3">SidMini AI • Powered by Gemini 2.0</p>
           </div>
        </div>

      </div>
    </div>
  );
}