"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Bot, User, Paperclip, PlusCircle, MessageSquare, CloudUpload, Loader2 } from "lucide-react";

export default function ChatPage() {
  const [messages, setMessages] = useState([
    { role: "ai", content: "Hello! I am your SecondBrain. Upload a PDF to get started." }
  ]);
  const [input, setInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  
  // Hidden file input click karne ke liye reference
  const fileInputRef = useRef(null);

  // 1. Handle Message Sending (Abhi sirf UI update karega)
  const handleSend = () => {
    if (!input.trim()) return;

    // Add User Message
    setMessages(prev => [...prev, { role: "user", content: input }]);
    setInput(""); // Clear input box

    // Simulate AI Reply (Backend connect hum next step mein karenge)
    setTimeout(() => {
      setMessages(prev => [...prev, { role: "ai", content: "Main abhi seekh raha hoon... Backend connect karna baaki hai!" }]);
    }, 1000);
  };

  // 2. Trigger File Selection
  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  // 3. Handle File Upload to Backend
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      // Backend API Call
      const response = await fetch("http://127.0.0.1:8000/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setMessages(prev => [...prev, { role: "ai", content: `✅ Success! Processed ${data.filename}. Now you can ask questions about it.` }]);
      } else {
        alert("Upload Failed: " + data.detail);
      }
    } catch (error) {
      console.error("Error uploading:", error);
      alert("Backend se connect nahi ho pa raha. Kya server chal raha hai?");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex h-screen bg-zinc-950 text-white overflow-hidden">
      
      {/* --- SIDEBAR --- */}
      <div className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col md:flex">
        <div className="p-4 border-b border-zinc-800 flex items-center gap-2">
          <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <h1 className="font-bold text-lg">SecondBrain</h1>
        </div>

        <div className="p-4">
          <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white justify-start gap-2">
            <PlusCircle className="h-4 w-4" />
            New Chat
          </Button>
        </div>

        <ScrollArea className="flex-1 px-4">
          <div className="space-y-2">
            <p className="text-xs text-zinc-500 font-semibold mb-2 uppercase tracking-wider">Recent Chats</p>
            {/* History abhi dummy hai */}
            <Button variant="ghost" className="w-full justify-start text-zinc-400 hover:text-white hover:bg-zinc-800 truncate">
              <MessageSquare className="h-4 w-4 mr-2" />
              Project Discussion
            </Button>
          </div>
        </ScrollArea>
      </div>

      {/* --- MAIN CHAT AREA --- */}
      <div className="flex-1 flex flex-col h-full relative">
        
        {/* Header */}
        <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-10">
          <h2 className="font-semibold text-lg">🤖 AI Assistant</h2>
          
          {/* Hidden File Input */}
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept=".pdf" 
            onChange={handleFileChange}
          />

          {/* Upload Button */}
          <Button 
            size="sm" 
            onClick={triggerUpload}
            disabled={isUploading}
            className="bg-white text-black hover:bg-zinc-200 font-medium transition-colors"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...
              </>
            ) : (
              <>
                <CloudUpload className="mr-2 h-4 w-4" /> Upload PDF
              </>
            )}
          </Button>
        </header>

        {/* Messages */}
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6 max-w-3xl mx-auto">
            {messages.map((msg, index) => (
              <div key={index} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-zinc-700' : 'bg-indigo-600'}`}>
                  {msg.role === 'user' ? <User className="h-6 w-6 text-white" /> : <Bot className="h-6 w-6 text-white" />}
                </div>
                <div className={`space-y-1 ${msg.role === 'user' ? 'text-right' : ''}`}>
                  <p className={`font-bold text-sm ${msg.role === 'user' ? 'text-zinc-400' : 'text-indigo-400'}`}>
                    {msg.role === 'user' ? 'You' : 'SecondBrain AI'}
                  </p>
                  <div className={`px-4 py-2 rounded-lg inline-block text-left ${msg.role === 'user' ? 'bg-zinc-800 text-white' : 'text-zinc-300'}`}>
                    {msg.content}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950">
          <div className="max-w-3xl mx-auto relative flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white hover:bg-zinc-800">
              <Paperclip className="h-5 w-5" />
            </Button>

            <Input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type your message..." 
              className="bg-zinc-900 border-zinc-700 text-white focus-visible:ring-indigo-500 py-6"
            />

            <Button size="icon" onClick={handleSend} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}