"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Send, Bot, User, Paperclip, 
  PanelRightClose, PanelRightOpen,
  FileText, Sparkles, Copy, ThumbsUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- FAKE CHAT DATA ---
const INITIAL_MESSAGES = [
  { id: 1, role: "ai", content: "Hello! I've analyzed **Q3 Financial Report.pdf**. It looks like revenue is up 40% year-over-year. What would you like to know?" },
  { id: 2, role: "user", content: "What were the main drivers for this growth?" },
  { id: 3, role: "ai", content: "The primary drivers were:\n1. **Enterprise AI adoption** increased by 200% [Page 4].\n2. New subscription tier launched in Europe [Page 12].", isStreaming: false }
];

export default function ChatPage() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  // Auto-scroll logic
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;
    
    // Add User Message
    const userMsg = { id: Date.now(), role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Fake AI Response
    setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, { 
            id: Date.now() + 1, 
            role: "ai", 
            content: "This is a simulated AI response. We will connect real Gemini AI in the next phase! 🚀",
            isStreaming: true 
        }]);
    }, 1500);
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col lg:flex-row gap-4 overflow-hidden">
      
      {/* --- LEFT SIDE: CHAT --- */}
      <div className={`flex-1 flex flex-col bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden transition-all duration-300 ${isRightPanelOpen ? 'lg:w-1/2' : 'w-full'}`}>
        
        {/* Chat Header */}
        <div className="h-16 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between px-6 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md">
            <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <Bot className="h-5 w-5" />
                </div>
                <div>
                    <h2 className="font-bold text-sm text-zinc-900 dark:text-white">Q3 Financial Report</h2>
                    <p className="text-xs text-green-500 flex items-center gap-1"><span className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse"></span> Online</p>
                </div>
            </div>
            <button onClick={() => setIsRightPanelOpen(!isRightPanelOpen)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-500 transition-colors">
                {isRightPanelOpen ? <PanelRightClose className="h-5 w-5"/> : <PanelRightOpen className="h-5 w-5"/>}
            </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth no-scrollbar">
            {messages.map((msg) => (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'ai' ? 'bg-indigo-600 text-white' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500'}`}>
                        {msg.role === 'ai' ? <Sparkles className="h-4 w-4" /> : <User className="h-4 w-4" />}
                    </div>
                    <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-zinc-900 dark:bg-white text-white dark:text-black rounded-tr-none' : 'bg-zinc-50 dark:bg-zinc-800/50 text-zinc-800 dark:text-zinc-200 border border-zinc-100 dark:border-zinc-700 rounded-tl-none'}`}>
                        <p className="whitespace-pre-line">{msg.content}</p>
                    </div>
                </motion.div>
            ))}
            {isTyping && (
                <div className="flex gap-4"><div className="h-8 w-8 bg-indigo-600 rounded-full flex items-center justify-center"><Sparkles className="h-4 w-4 text-white" /></div><div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl rounded-tl-none border border-zinc-100 dark:border-zinc-700 flex gap-1 items-center"><span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce"></span><span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce delay-75"></span><span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce delay-150"></span></div></div>
            )}
            <div ref={scrollRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800">
            <div className="relative flex items-center bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-2xl px-2 py-2 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all shadow-sm">
                <button className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-xl text-zinc-400 transition-colors"><Paperclip className="h-5 w-5" /></button>
                <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="Ask anything..." className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-zinc-900 dark:text-white px-3 outline-none"/>
                <button onClick={handleSend} disabled={!input.trim()} className="p-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl transition-all shadow-md"><Send className="h-4 w-4" /></button>
            </div>
        </div>
      </div>

      {/* --- RIGHT SIDE: PDF VIEWER --- */}
      <AnimatePresence>
        {isRightPanelOpen && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0, width: "50%" }} exit={{ opacity: 0, x: 50, width: 0 }} transition={{ duration: 0.3 }} className="hidden lg:flex flex-col bg-zinc-100 dark:bg-black rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-inner">
                <div className="h-14 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-4">
                    <div className="flex items-center gap-2"><div className="p-1.5 bg-red-100 dark:bg-red-900/30 rounded text-red-500"><FileText className="h-4 w-4"/></div><span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Q3_Report_Final.pdf</span></div>
                </div>
                <div className="flex-1 overflow-y-auto p-8 flex justify-center bg-zinc-50 dark:bg-[#0a0a0a]">
                    <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 shadow-2xl min-h-[800px] p-12 border border-zinc-200 dark:border-zinc-800 rounded-sm">
                        <div className="space-y-6 animate-pulse opacity-50"><div className="h-8 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded mb-8"></div><div className="h-2 w-full bg-zinc-200 dark:bg-zinc-800 rounded"></div><div className="h-2 w-full bg-zinc-200 dark:bg-zinc-800 rounded"></div><div className="h-48 w-full bg-zinc-100 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-center"><span className="text-xs text-zinc-400">PDF Viewer Placeholder</span></div></div>
                    </div>
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}