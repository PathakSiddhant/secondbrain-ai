"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User, PlusCircle, MessageSquare, CloudUpload, Loader2, Sparkles, Brain, FileText, CheckCircle2 } from "lucide-react"; 
import { motion, AnimatePresence } from "framer-motion"; 
import ReactMarkdown from "react-markdown"; 

// --- THINKING STEPS ANIMATION ---
const LoadingSteps = () => {
  const [step, setStep] = useState(0);
  const steps = [
    "🧠 Reading your document...",
    "🔍 Searching for context...",
    "✨ Generating smart answer..."
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1500); // Har 1.5 sec mein step change
    return () => clearInterval(timer);
  }, [steps.length]);

  return (
    <div className="flex items-center gap-3 text-sm font-medium text-indigo-400 animate-pulse">
       <Loader2 className="h-4 w-4 animate-spin" />
       <span>{steps[step]}</span>
    </div>
  );
};

export default function ChatPage() {
  const [messages, setMessages] = useState([]); 
  const [input, setInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

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
        setMessages(prev => [...prev, { role: "ai", content: "❌ Error: Could not fetch answer." }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: "ai", content: "⚠️ Error connecting to server." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerUpload = () => fileInputRef.current?.click();

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://127.0.0.1:8000/upload", { method: "POST", body: formData });
      const data = await response.json();
      if (response.ok) {
        setMessages(prev => [...prev, { role: "ai", content: `✅ **Success!** I have processed **${data.filename}**.\n\nI am ready to answer your questions based on this document.` }]);
      } else {
        alert("Upload Failed");
      }
    } catch (error) {
      alert("Error uploading file.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-white overflow-hidden font-sans selection:bg-indigo-500/30">
      
      {/* --- SIDEBAR --- */}
      <div className="w-72 bg-[#0F0F0F] border-r border-zinc-800/50 flex flex-col md:flex flex-none z-20">
        <div className="p-6 flex items-center gap-3">
          <div className="h-9 w-9 bg-indigo-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(79,70,229,0.4)]">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <h1 className="font-bold text-lg tracking-tight text-zinc-100">SecondBrain</h1>
        </div>
        <div className="px-4 pb-4">
          <Button onClick={() => setMessages([])} className="w-full bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800/50 justify-start gap-3 h-11 rounded-lg transition-all">
            <PlusCircle className="h-4 w-4 text-indigo-400" /> 
            <span className="font-medium text-sm">New Chat</span>
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 space-y-2 custom-scrollbar">
           <p className="text-[10px] text-zinc-500 font-bold mb-3 px-2 uppercase tracking-widest">History</p>
           {[1,2,3].map((_, i) => (
             <Button key={i} variant="ghost" className="w-full justify-start text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/40 h-9 rounded-lg text-sm font-normal truncate transition-all">
              <MessageSquare className="h-4 w-4 mr-3 opacity-40" />
              Document Analysis {i+1}
            </Button>
           ))}
        </div>
      </div>

      {/* --- MAIN CHAT AREA --- */}
      <div className="flex-1 flex flex-col h-full bg-[#0a0a0a] min-w-0 relative"> 
        
        {/* Subtle Background Glow (The Aurora Effect) */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
             <div className="absolute top-[-10%] right-[-5%] w-125 h-125 bg-indigo-600/10 rounded-full blur-[120px]" />
             <div className="absolute bottom-[-10%] left-[-10%] w-150 h-150 bg-purple-600/5 rounded-full blur-[120px]" />
        </div>

        {/* HEADER */}
        <header className="h-16 flex-none border-b border-zinc-800/50 flex items-center justify-between px-6 bg-[#0a0a0a]/80 backdrop-blur-xl z-20">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
            <h2 className="font-medium text-sm text-zinc-300">Brain Active</h2>
          </div>
          <input type="file" ref={fileInputRef} className="hidden" accept=".pdf" onChange={handleFileChange} />
          <Button size="sm" onClick={triggerUpload} disabled={isUploading} className="bg-white text-black hover:bg-zinc-200 border-0 rounded-full px-5 font-semibold text-xs tracking-wide shadow-[0_0_10px_rgba(255,255,255,0.1)] transition-all">
             {isUploading ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <CloudUpload className="mr-2 h-3 w-3" />}
             {isUploading ? "Processing..." : "Upload PDF"}
          </Button>
        </header>

        {/* MESSAGES SCROLL AREA */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar scroll-smooth z-10">
          <div className="max-w-3xl mx-auto pb-4">
            
            {/* EMPTY STATE */}
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center h-[65vh] animate-in fade-in zoom-in duration-700">
                <div className="relative w-32 h-32 mb-8 group">
                  <div className="absolute inset-0 bg-indigo-500/30 blur-2xl rounded-full group-hover:bg-indigo-500/50 transition-all duration-500" />
                  <div className="relative z-10 bg-zinc-900 border border-zinc-700/50 p-6 rounded-2xl shadow-2xl">
                     <FileText className="h-16 w-16 text-indigo-400" />
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-white to-zinc-400 mb-3">
                  Upload. Ask. Know.
                </h3>
                <p className="text-zinc-500 max-w-sm leading-relaxed">
                  Drop your PDF here. I&apos;ll read every word so you don&apos;t have to.
                </p>
              </div>
            ) : (
              // CHAT LIST
              <div className="space-y-10 pb-8">
                <AnimatePresence>
                  {messages.map((msg, index) => (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {/* AI AVATAR */}
                      {msg.role === 'ai' && (
                        <div className="h-8 w-8 rounded-lg bg-linear-to-br from-indigo-600 to-violet-600 flex items-center justify-center shrink-0 shadow-lg mt-1">
                          <Bot className="h-5 w-5 text-white" />
                        </div>
                      )}

                      {/* MESSAGE CONTENT */}
                      <div className={`max-w-[85%] sm:max-w-[80%]`}>
                         {msg.role === 'ai' && (
                             <div className="flex items-center gap-2 mb-2">
                                <span className="text-indigo-400 font-bold text-xs uppercase tracking-wider">SecondBrain</span>
                                <span className="text-zinc-600 text-[10px]">• AI Analysis</span>
                             </div>
                          )}
                        
                        <div className={`text-[15px] leading-relaxed ${
                            msg.role === 'user' 
                              ? 'bg-zinc-800 text-zinc-100 px-5 py-3 rounded-2xl rounded-tr-sm shadow-md border border-zinc-700/50' 
                              : 'text-zinc-300' 
                          }`}>
                          
                          {msg.role === 'ai' ? (
                            // --- PREMIUM MARKDOWN STYLING ---
                            <div className="prose prose-invert max-w-none">
                               <ReactMarkdown
                                  components={{
                                    // BOLD Text: Indigo Color
                                    strong: ({node, ...props}) => <span className="font-bold text-indigo-300" {...props} />,
                                    
                                    // HEADINGS: White & Big
                                    h1: ({node, ...props}) => <h1 className="text-xl font-bold text-white mt-6 mb-3 border-b border-zinc-800 pb-2" {...props} />,
                                    h2: ({node, ...props}) => <h2 className="text-lg font-bold text-zinc-100 mt-5 mb-2" {...props} />,
                                    h3: ({node, ...props}) => <h3 className="text-base font-semibold text-indigo-200 mt-4 mb-2" {...props} />,
                                    
                                    // LISTS: Proper spacing
                                    ul: ({node, ...props}) => <ul className="list-disc pl-5 space-y-2 my-3 text-zinc-300" {...props} />,
                                    ol: ({node, ...props}) => <ol className="list-decimal pl-5 space-y-2 my-3 text-zinc-300" {...props} />,
                                    li: ({node, ...props}) => <li className="pl-1" {...props} />,
                                    
                                    // BLOCKQUOTES: Nice styling
                                    blockquote: ({node, ...props}) => (
                                        <blockquote className="border-l-4 border-indigo-500 pl-4 py-1 my-4 bg-zinc-900/50 rounded-r italic text-zinc-400" {...props} />
                                    ),

                                    // LINKS
                                    a: ({node, ...props}) => <a className="text-indigo-400 hover:underline cursor-pointer" {...props} />,
                                  }}
                               >
                                {msg.content}
                               </ReactMarkdown>
                            </div>
                          ) : msg.content}
                        </div>
                      </div>

                      {/* USER AVATAR */}
                      {msg.role === 'user' && (
                         <div className="h-8 w-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0 mt-1">
                           <User className="h-4 w-4 text-zinc-400" />
                         </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* --- REALISTIC THINKING INDICATOR --- */}
                {isLoading && (
                   <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-5">
                    <div className="h-8 w-8 rounded-lg bg-zinc-900 border border-indigo-500/30 flex items-center justify-center shrink-0 mt-1">
                      <Sparkles className="h-4 w-4 text-indigo-400 animate-pulse" />
                    </div>
                    <div className="space-y-2 py-1">
                       <LoadingSteps /> 
                    </div>
                  </motion.div>
                )}
                
                {/* Scroll Anchor */}
                <div ref={messagesEndRef} className="h-4" />
              </div>
            )}
          </div>
        </div>

        {/* INPUT AREA */}
        <div className="flex-none p-4 bg-[#0a0a0a] border-t border-zinc-800/50 relative z-20">
             {/* Smooth Fade Top */}
             <div className="absolute -top-12 left-0 w-full h-12 bg-linear-to-t from-[#0a0a0a] to-transparent pointer-events-none" />
             
          <div className="max-w-3xl mx-auto relative flex items-center gap-3">
            <div className="relative flex-1 group">
              <Input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask follow-up questions..." 
                className="bg-zinc-900/50 border-zinc-800 text-zinc-100 py-6 pl-5 pr-12 rounded-xl transition-all focus:ring-1 focus:ring-indigo-500/50 focus:bg-zinc-900 shadow-inner"
                disabled={isLoading}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-md bg-zinc-800 text-xs text-zinc-500 border border-zinc-700 hidden sm:block">
                Enter
              </div>
            </div>
            <Button size="icon" onClick={handleSend} disabled={isLoading || !input.trim()} className="h-12 w-12 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)] transition-all active:scale-95">
              <Send className="h-5 w-5" />
            </Button>
          </div>
          <p className="text-center text-[10px] text-zinc-600 mt-3 font-medium">
            AI can make mistakes. Verify important info.
          </p>
        </div>

      </div>
    </div>
  );
}