"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Send,
  Bot,
  User,
  Paperclip,
  PlusCircle,
  MessageSquare,
  CloudUpload,
} from "lucide-react";
export default function ChatPage() {
  return (
    <div className="flex h-screen bg-zinc-950 text-white overflow-hidden">
      {/* --- SIDEBAR (Left Panel) --- */}
      <div className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col md:flex">
        {/* Logo / Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center gap-2">
          <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <h1 className="font-bold text-lg">SecondBrain</h1>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white justify-start gap-2">
            <PlusCircle className="h-4 w-4" />
            New Chat
          </Button>
        </div>

        {/* Chat History (Scrollable) */}
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-2">
            <p className="text-xs text-zinc-500 font-semibold mb-2 uppercase tracking-wider">
              Recent Chats
            </p>
            {/* Mock History Items */}
            {[
              "React Project Ideas",
              "Resume Analysis",
              "FastAPI Setup Guide",
            ].map((chat, i) => (
              <Button
                key={i}
                variant="ghost"
                className="w-full justify-start text-zinc-400 hover:text-white hover:bg-zinc-800 truncate"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                {chat}
              </Button>
            ))}
          </div>
        </ScrollArea>

        {/* User Profile (Bottom) */}
        <div className="p-4 border-t border-zinc-800 flex items-center gap-3">
          <Avatar className="h-9 w-9 border border-zinc-700">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>ME</AvatarFallback>
          </Avatar>
          <div className="text-sm">
            <p className="font-medium">My Portfolio</p>
            <p className="text-xs text-zinc-500">Free Plan</p>
          </div>
        </div>
      </div>

      {/* --- MAIN CHAT AREA (Right Panel) --- */}
      <div className="flex-1 flex flex-col h-full relative">
        {/* Chat Header */}
        <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-10">
          <h2 className="font-semibold text-lg">🤖 AI Assistant</h2>

          {/* UPDATED UPLOAD BUTTON */}
          <Button
            size="sm"
            className="bg-white text-black hover:bg-zinc-200 font-medium transition-colors"
          >
            <CloudUpload className="mr-2 h-4 w-4" />
            Upload PDF
          </Button>
        </header>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6 max-w-3xl mx-auto">
            {/* AI Message Example */}
            <div className="flex gap-4">
              <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-sm text-indigo-400">
                  SecondBrain AI
                </p>
                <div className="text-zinc-300 leading-relaxed">
                  Hello! I am ready to help. Upload a document or ask me
                  anything.
                </div>
              </div>
            </div>

            {/* User Message Example */}
            <div className="flex gap-4 flex-row-reverse">
              <div className="h-10 w-10 rounded-full bg-zinc-700 flex items-center justify-center shrink-0">
                <User className="h-6 w-6 text-white" />
              </div>
              <div className="space-y-1 text-right">
                <p className="font-bold text-sm text-zinc-400">You</p>
                <div className="bg-zinc-800 px-4 py-2 rounded-lg text-white inline-block text-left">
                  How do I set up FastAPI?
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Input Area (Sticky Bottom) */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950">
          <div className="max-w-3xl mx-auto relative flex items-center gap-2">
            {/* Attachment Button */}
            <Button
              variant="ghost"
              size="icon"
              className="text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              <Paperclip className="h-5 w-5" />
            </Button>

            {/* Input Box */}
            <Input
              placeholder="Type your message..."
              className="bg-zinc-900 border-zinc-700 text-white focus-visible:ring-indigo-500 py-6"
            />

            {/* Send Button */}
            <Button
              size="icon"
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
          <p className="text-center text-xs text-zinc-600 mt-2">
            AI can make mistakes. Verify important information.
          </p>
        </div>
      </div>
    </div>
  );
}
