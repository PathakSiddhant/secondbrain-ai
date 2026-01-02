"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Send,
  Bot,
  Plus,
  CloudUpload,
  Sparkles,
  Brain,
  ArrowLeft,
  Link as LinkIcon,
  Youtube,
  FileText,
  Globe,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  X,
  Trash2,
  Edit2,
  AlignLeft,
  Sun,
  Moon,
  Type,
  ExternalLink,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { useUser } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

const getYouTubeID = (url) => {
  if (!url) return null;
  const match = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
  return match ? match[1] : null;
};

// Sidebar Item Component
const SidebarItem = ({
  item,
  isActive,
  onSelect,
  onMenuOpen,
  icon: Icon,
  colorClass,
}) => (
  <motion.div
    layout
    initial={{ opacity: 0, x: -5 }}
    animate={{ opacity: 1, x: 0 }}
    onClick={() => onSelect(item.id)}
    className={`group flex items-center justify-between py-3 px-3 mb-1.5 rounded-xl cursor-pointer transition-all duration-200 border relative overflow-hidden ${
      isActive
        ? "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 shadow-md"
        : "border-transparent text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-200"
    }`}
  >
    {isActive && (
      <div
        className={`absolute left-0 top-1 bottom-1 w-1 rounded-r-full ${colorClass.replace("text-", "bg-")}`}
      />
    )}
    <div className="flex items-center gap-3 overflow-hidden w-full pl-2">
      <Icon
        className={`h-4 w-4 shrink-0 transition-colors ${isActive ? colorClass : "text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300"}`}
      />
      <span
        className={`text-sm font-medium truncate ${isActive ? "text-zinc-900 dark:text-white" : ""}`}
      >
        {item.title || "Untitled Chat"}
      </span>
    </div>
    <button
      onClick={(e) => {
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();
        onMenuOpen({
          id: item.id,
          title: item.title,
          x: rect.right,
          y: rect.top,
        });
      }}
      className={`p-1.5 rounded-lg transition-all ${isActive ? "opacity-100 hover:bg-zinc-100 dark:hover:bg-zinc-700" : "opacity-0 group-hover:opacity-100 hover:bg-zinc-200 dark:hover:bg-zinc-700"}`}
    >
      <MoreHorizontal className="h-4 w-4" />
    </button>
  </motion.div>
);

// Library Section Component
const LibrarySection = ({
  title,
  icon: Icon,
  items,
  isOpen,
  onToggle,
  onSelectChat,
  onMenuOpen,
  activeChatId,
  colorClass,
}) => (
  <div className="mb-6">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between px-3 py-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors mb-1 group"
    >
      <span
        className={`text-xs font-bold uppercase tracking-widest flex items-center gap-2.5 transition-opacity ${isOpen ? "opacity-100" : "opacity-70"}`}
      >
        <div
          className={`p-1.5 rounded-md ${isOpen ? colorClass.replace("text-", "bg-").replace("500", "500/10") : "bg-transparent"}`}
        >
          <Icon
            className={`h-3.5 w-3.5 ${isOpen ? colorClass : "text-zinc-500"}`}
          />
        </div>
        {title}
      </span>
      <div className="flex items-center gap-2">
        <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md text-zinc-500 font-mono">
          {items.length}
        </span>
        {isOpen ? (
          <ChevronDown className="h-3.5 w-3.5 opacity-50" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 opacity-50" />
        )}
      </div>
    </button>
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden space-y-0.5 pl-1"
        >
          {items.map((item) => (
            <SidebarItem
              key={item.id}
              item={item}
              isActive={activeChatId === item.id}
              onSelect={onSelectChat}
              onMenuOpen={onMenuOpen}
              icon={Icon}
              colorClass={colorClass}
            />
          ))}
          {items.length === 0 && (
            <div className="pl-10 py-3 text-xs text-zinc-400 italic">
              No items yet
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

// Document Viewer Component
const DocumentViewer = ({
  source,
  viewMode,
  onClose,
  onToggleMode,
  isFullscreen,
  onToggleFullscreen,
}) => {
  const getViewerContent = () => {
    if (viewMode === "text") {
      return (
        <div className="p-8 max-w-4xl mx-auto">
          <div className="prose prose-zinc dark:prose-invert max-w-none">
            <pre className="whitespace-pre-wrap text-sm leading-relaxed font-mono bg-zinc-50 dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800">
              {source.content || "No content available"}
            </pre>
          </div>
        </div>
      );
    }

    switch (source.type) {
      case "youtube":
        const videoId = getYouTubeID(source.url);
        return (
          <div className="w-full h-full flex flex-col">
            <div className="flex-1 bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`}
                className="w-full h-full"
                allowFullScreen
                title="YouTube Video"
              />
            </div>
            <div className="p-4 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800">
              <p className="text-xs text-zinc-500 mb-2">Transcript Preview</p>
              <div className="max-h-40 overflow-y-auto text-sm text-zinc-700 dark:text-zinc-300">
                {source.content?.substring(0, 500)}...
              </div>
            </div>
          </div>
        );
      case "pdf":
        return source.url ? (
          <iframe
            src={`${source.url}#toolbar=1&navpanes=1&scrollbar=1`}
            className="w-full h-full bg-white"
            title="PDF Viewer"
          />
        ) : (
          <div className="text-center p-10">Preview Unavailable</div>
        );
      case "word":
      case "excel":
        return source.url ? (
          <iframe
            src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(source.url)}`}
            className="w-full h-full bg-white"
            title="Office Viewer"
          />
        ) : (
          <div className="text-center p-10">Preview Unavailable</div>
        );
      case "web":
      case "website":
        return source.url && source.url.startsWith("http") ? (
          <iframe
            src={source.url}
            className="w-full h-full bg-white"
            sandbox="allow-scripts allow-same-origin allow-popups"
            title="Website Viewer"
          />
        ) : (
          <div className="p-8">
            <pre className="text-xs">{source.content}</pre>
          </div>
        );
      default:
        return (
          <div className="p-8 text-center">
            <p>Preview not available.</p>
            <p className="text-xs">Use Text Mode.</p>
          </div>
        );
    }
  };

  return (
    <div
      className={`flex flex-col h-full ${isFullscreen ? "fixed inset-0 z-60 bg-white dark:bg-[#0c0c0e]" : ""}`}
    >
      <div className="h-14 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-4 bg-zinc-50/80 dark:bg-[#121212]/80 backdrop-blur-sm shrink-0">
        <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
          {source.type === "youtube" && (
            <Youtube className="h-4 w-4 text-red-500" />
          )}
          {source.type === "pdf" && (
            <FileText className="h-4 w-4 text-red-500" />
          )}
          {source.type === "word" && (
            <FileText className="h-4 w-4 text-blue-500" />
          )}
          {source.type === "excel" && (
            <FileText className="h-4 w-4 text-emerald-500" />
          )}
          {(source.type === "web" || source.type === "website") && (
            <Globe className="h-4 w-4 text-indigo-500" />
          )}
          {source.name}
        </span>
        <div className="flex items-center gap-2">
          {source.url && (
            <Button
              onClick={() => window.open(source.url, "_blank")}
              size="sm"
              variant="ghost"
              className="h-7 text-[10px]"
            >
              <ExternalLink className="h-3 w-3 mr-1" /> Open
            </Button>
          )}
          <Button
            onClick={onToggleMode}
            size="sm"
            variant="ghost"
            className="h-7 text-[10px]"
          >
            <Type className="h-3 w-3 mr-1" />{" "}
            {viewMode === "native" ? "Text" : "View"}
          </Button>
          <Button
            onClick={onToggleFullscreen}
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded-full"
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
          {!isFullscreen && (
            <Button
              onClick={onClose}
              size="icon"
              variant="ghost"
              className="h-8 w-8 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-auto bg-zinc-50 dark:bg-[#0a0a0a]">
        {getViewerContent()}
      </div>
    </div>
  );
};

export default function ChatPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useUser();
  const { theme, setTheme } = useTheme();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [activeSource, setActiveSource] = useState(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [history, setHistory] = useState({ youtube: [], pdf: [], website: [] });
  const [openSections, setOpenSections] = useState({
    youtube: true,
    pdf: true,
    website: true,
  });
  const [activeMenu, setActiveMenu] = useState(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [viewerWidth, setViewerWidth] = useState(45);
  const [isDragging, setIsDragging] = useState(false);
  const [viewMode, setViewMode] = useState("native");
  const [isViewerFullscreen, setIsViewerFullscreen] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => scrollToBottom(), [messages, isLoading]);

  useEffect(() => {
    if (user?.id) fetchHistory();
  }, [user]);
  useEffect(() => {
    if (id && id !== "new") handleLoadChat(id);
    else if (id === "new") {
      setMessages([]);
      setActiveSource(null);
      setIsViewerOpen(false);
    }
  }, [id]);

  const handleMouseMove = useCallback(
    (e) => {
      if (!isDragging) return;
      const newWidth =
        ((window.innerWidth - e.clientX) / window.innerWidth) * 100;
      if (newWidth > 20 && newWidth < 80) setViewerWidth(newWidth);
    },
    [isDragging]
  );
  const handleMouseUp = useCallback(() => setIsDragging(false), []);
  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const fetchHistory = async () => {
    if (!user) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/history/${user.id}`);
      const data = await res.json();
      const newHistory = { youtube: [], pdf: [], website: [] };
      if (data.chats) {
        data.chats.forEach((chat) => {
          if (chat.source_type === "youtube") newHistory.youtube.push(chat);
          else if (
            ["pdf", "word", "excel", "code", "file", "csv", "text"].includes(
              chat.source_type
            )
          )
            newHistory.pdf.push(chat);
          else newHistory.website.push(chat);
        });
      }
      setHistory(newHistory);
    } catch (e) {
      console.error("History error:", e);
    }
  };

  const handleLoadChat = async (chatId) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/chat/${chatId}`);
      const data = await res.json();
      if (data && data.messages) setMessages(data.messages);
      else setMessages([]);
      if (data && data.metadata) {
        const meta = data.metadata;
        if (meta.source_type && meta.source_type !== "general") {
          setActiveSource({
            type: meta.source_type,
            url: meta.source_url,
            name: meta.title,
            content: meta.content,
          });
          setIsViewerOpen(true);
        } else {
          setActiveSource(null);
          setIsViewerOpen(false);
        }
      }
    } catch (e) {
      console.error("Load error:", e);
      setMessages([]);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);
    try {
      const payload = {
        query: userMessage,
        user_id: user?.id,
        chat_id: id === "new" ? null : id,
        source_type: activeSource?.type || "general",
        source_title: activeSource?.name || "New Chat",
        source_url: activeSource?.url,
      };
      const response = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (response.ok) {
        setMessages((prev) => [...prev, { role: "ai", content: data.answer }]);
        if (id === "new" && data.chat_id) {
          router.replace(`/chat/${data.chat_id}`);
          fetchHistory();
        }
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "ai",
            content: "❌ Error: " + (data.detail || "Unknown error"),
          },
        ]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: "⚠️ Network error" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteChat = async () => {
    if (!activeMenu || !confirm("Delete this chat?")) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/chat/${activeMenu.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        if (id === activeMenu.id) router.push("/chat/new");
        fetchHistory();
      }
      setActiveMenu(null);
    } catch (e) {
      alert("Delete failed");
    }
  };
  const handleRenameSubmit = async () => {
    if (!activeMenu || !renameValue.trim()) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/chat/${activeMenu.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ new_title: renameValue }),
      });
      if (res.ok) fetchHistory();
      setActiveMenu(null);
      setIsRenaming(false);
    } catch (e) {
      alert("Rename failed");
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("user_id", user.id);
    try {
      const res = await fetch("http://127.0.0.1:8000/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        router.push(`/chat/${data.chat_id}`);
        fetchHistory();
      } else {
        alert("Upload Failed: " + (data.detail || "Unknown"));
      }
    } catch (err) {
      alert("Error uploading file");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };
  const handleLinkSubmit = async () => {
    if (!linkUrl.trim()) return;
    setShowLinkInput(false);
    setIsUploading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/process-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: linkUrl,
          type: linkUrl.includes("youtu") ? "youtube" : "web",
          user_id: user.id,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push(`/chat/${data.chat_id}`);
        fetchHistory();
        setLinkUrl("");
      } else {
        alert("Error: " + data.detail);
      }
    } catch (err) {
      alert("Error processing link");
    } finally {
      setIsUploading(false);
    }
  };

  const showUploads = id === "new" && messages.length === 0 && !activeSource;

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 font-sans overflow-hidden transition-colors duration-300">
      <AnimatePresence>
        {isUploading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-100 bg-white/90 dark:bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center"
          >
            <div className="relative">
              <div className="h-40 w-40 border-4 border-indigo-500/20 rounded-full animate-[spin_4s_linear_infinite]"></div>
              <div className="absolute inset-0 h-40 w-40 border-4 border-t-indigo-500 rounded-full animate-[spin_2s_linear_infinite]"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="h-12 w-12 text-indigo-500 animate-pulse" />
              </div>
            </div>
            <h2 className="mt-8 text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-indigo-500 to-purple-600 animate-pulse">
              Scanning Neural Paths...
            </h2>
            <p className="text-zinc-500 mt-2 font-mono text-sm">
              Ingesting data into Second Brain
            </p>
          </motion.div>
        )}
      </AnimatePresence>
      {isDragging && (
        <div className="fixed inset-0 z-9999 cursor-col-resize bg-transparent select-none"></div>
      )}
      {/* Sidebar */}
      <div className="w-75 bg-white dark:bg-[#0c0c0e] border-r border-zinc-200 dark:border-zinc-800 flex flex-col z-20 shadow-sm flex-none transition-colors duration-300">
        <div className="p-5 flex items-center justify-between">
          <div
            className="flex items-center gap-3 font-bold tracking-tight text-xl cursor-pointer"
            onClick={() => router.push("/dashboard")}
          >
            <div className="h-9 w-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Brain className="h-5 w-5" />
            </div>
            <span>SecondBrain</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
        </div>
        <div className="px-5 pb-4">
          <Button
            onClick={() => router.push("/chat/new")}
            className="w-full bg-zinc-900 dark:bg-white text-white dark:text-black hover:opacity-90 shadow-md rounded-xl h-11 font-semibold transition-all"
          >
            <Plus className="h-5 w-5 mr-2" /> New Chat
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto px-3 custom-scrollbar">
          <LibrarySection
            title="Videos"
            icon={Youtube}
            items={history.youtube}
            isOpen={openSections.youtube}
            onToggle={() =>
              setOpenSections((p) => ({ ...p, youtube: !p.youtube }))
            }
            onSelectChat={(id) => router.push(`/chat/${id}`)}
            onMenuOpen={setActiveMenu}
            activeChatId={id}
            colorClass="text-red-500"
          />
          <LibrarySection
            title="Documents"
            icon={FileText}
            items={history.pdf}
            isOpen={openSections.pdf}
            onToggle={() => setOpenSections((p) => ({ ...p, pdf: !p.pdf }))}
            onSelectChat={(id) => router.push(`/chat/${id}`)}
            onMenuOpen={setActiveMenu}
            activeChatId={id}
            colorClass="text-blue-500"
          />
          <LibrarySection
            title="Web Links"
            icon={Globe}
            items={history.website}
            isOpen={openSections.website}
            onToggle={() =>
              setOpenSections((p) => ({ ...p, website: !p.website }))
            }
            onSelectChat={(id) => router.push(`/chat/${id}`)}
            onMenuOpen={setActiveMenu}
            activeChatId={id}
            colorClass="text-emerald-500"
          />
        </div>
        <div className="p-5 border-t border-zinc-200 dark:border-zinc-800">
          <Button
            variant="ghost"
            className="w-full justify-start text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            onClick={() => router.push("/dashboard")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
          </Button>
        </div>
      </div>
      {/* Main Chat */}
      <div className="flex-1 flex flex-col relative bg-zinc-50/50 dark:bg-[#09090b]">
        <header className="h-16 flex items-center justify-between px-8 bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-md sticky top-0 z-30 border-b border-zinc-200/50 dark:border-zinc-800/50 transition-colors">
          <div className="flex items-center gap-3">
            <div
              className={`h-2.5 w-2.5 rounded-full transition-all duration-500 ${activeSource ? "bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.5)]" : "bg-zinc-300 dark:bg-zinc-700"}`}
            />
            <div>
              <h2 className="font-bold text-sm text-zinc-800 dark:text-zinc-200 truncate max-w-md">
                {activeSource ? activeSource.name : "Deep Thought"}
              </h2>
              <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">
                {activeSource ? "Context Active" : "General Mode"}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {activeSource && !isViewerOpen && (
              <Button
                onClick={() => setIsViewerOpen(true)}
                size="sm"
                variant="outline"
                className="h-9 rounded-full bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-indigo-600 transition-all"
              >
                <AlignLeft className="h-3.5 w-3.5 mr-2" /> View Source
              </Button>
            )}
            {showUploads && (
              <div className="flex items-center bg-white dark:bg-zinc-900 p-1 rounded-full border border-zinc-200 dark:border-zinc-800 shadow-sm animate-in fade-in zoom-in duration-300">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 transition-colors"
                >
                  <CloudUpload className="h-4 w-4" />
                </Button>
                <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-800 mx-1"></div>
                <Button
                  onClick={() => setShowLinkInput(!showLinkInput)}
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 transition-colors"
                >
                  <LinkIcon className="h-4 w-4" />
                </Button>
              </div>
            )}
            {showLinkInput && (
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="absolute right-6 top-16 w-80 bg-white dark:bg-[#18181b] p-3 rounded-2xl border border-zinc-200 dark:border-zinc-700 shadow-2xl z-50 flex gap-2"
              >
                <Input
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLinkSubmit()}
                  placeholder="Paste URL..."
                  className="h-9 text-xs rounded-lg"
                  autoFocus
                />
                <Button
                  size="sm"
                  onClick={handleLinkSubmit}
                  className="h-9 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  Add
                </Button>
              </motion.div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".pdf,.docx,.txt,.md,.csv,.xlsx,.xls,.py,.js,.json"
              onChange={handleFileChange}
            />
          </div>
        </header>
        <div className="flex-1 overflow-y-auto px-4 py-6 custom-scrollbar scroll-smooth">
          <div className="max-w-3xl mx-auto space-y-10 pb-32">
            {messages.length === 0 && !activeSource && (
              <div className="text-center mt-32 animate-in fade-in zoom-in duration-700">
                <div className="w-24 h-24 bg-linear-to-tr from-white to-zinc-100 dark:from-zinc-800 dark:to-zinc-900 rounded-[2rem] mx-auto flex items-center justify-center mb-6 shadow-2xl border border-white/50 dark:border-white/5">
                  <Sparkles className="h-10 w-10 text-indigo-500" />
                </div>
                <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
                  Hello, {user?.firstName || "Friend"}.
                </h3>
                <p className="text-zinc-500 text-sm">
                  Upload a document or paste a link to start
                </p>
              </div>
            )}
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className={`group ${msg.role === "user" ? "flex justify-end" : "block"}`}
              >
                {msg.role === "user" ? (
                  <div className="bg-zinc-900 dark:bg-white text-white dark:text-black px-6 py-3 rounded-3xl rounded-tr-md max-w-[85%] text-[15px] shadow-xl leading-relaxed">
                    {msg.content}
                  </div>
                ) : (
                  <div className="w-full pl-0 md:pl-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-8 w-8 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center shadow-sm">
                        <Bot className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        SecondBrain
                      </span>
                    </div>
                    <div className="pl-11 text-zinc-800 dark:text-zinc-300 text-[16px] leading-8 markdown-content">
                      <ReactMarkdown
                        components={{
                          code({
                            node,
                            inline,
                            className,
                            children,
                            ...props
                          }) {
                            const match = /language-(\w+)/.exec(
                              className || ""
                            );
                            return !inline && match ? (
                              <div className="relative group/code my-6 rounded-2xl overflow-hidden shadow-lg border border-zinc-200 dark:border-zinc-800">
                                <SyntaxHighlighter
                                  style={vscDarkPlus}
                                  language={match[1]}
                                  PreTag="div"
                                  className="bg-white! dark:bg-[#1e1e1e]! p-4! m-0! text-sm"
                                  {...props}
                                >
                                  {String(children).replace(/\n$/, "")}
                                </SyntaxHighlighter>
                              </div>
                            ) : (
                              <code
                                className="bg-zinc-100 dark:bg-zinc-800/50 px-1.5 py-0.5 rounded text-sm font-mono text-pink-600 dark:text-pink-400 border border-zinc-200 dark:border-zinc-700/50"
                                {...props}
                              >
                                {children}
                              </code>
                            );
                          },
                          h1: ({ node, ...props }) => (
                            <h1
                              className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-8 mb-4 tracking-tight"
                              {...props}
                            />
                          ),
                          p: ({ node, ...props }) => (
                            <p
                              className="mb-4 text-zinc-700 dark:text-zinc-300"
                              {...props}
                            />
                          ),
                          ul: ({ node, ...props }) => (
                            <ul
                              className="list-disc pl-5 space-y-2 mb-6 marker:text-zinc-300 dark:marker:text-zinc-600"
                              {...props}
                            />
                          ),
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
            {isLoading && (
              <div className="pl-14 flex items-center gap-2 text-zinc-400 text-sm">
                <div className="h-2 w-2 bg-indigo-500 rounded-full animate-bounce" />
                <div
                  className="h-2 w-2 bg-indigo-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                />
                <div
                  className="h-2 w-2 bg-indigo-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                />
                <span className="ml-2">Thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
        <div className="absolute bottom-6 left-0 right-0 px-4 flex justify-center z-40 pointer-events-none">
          <div className="w-full max-w-3xl pointer-events-auto">
            <div className="relative bg-white dark:bg-[#18181b] rounded-3xl border border-zinc-200 dark:border-zinc-700 shadow-2xl p-2 flex items-center gap-2 ring-4 ring-zinc-100 dark:ring-black/20 focus-within:ring-indigo-50 dark:focus-within:ring-indigo-900/20 transition-all">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && !e.shiftKey && handleSend()
                }
                placeholder="Ask anything about your documents..."
                className="bg-transparent border-0 text-zinc-900 dark:text-white placeholder:text-zinc-400 h-11 px-4 text-base focus-visible:ring-0 shadow-none"
                disabled={isLoading}
              />
              <Button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                size="icon"
                className="h-10 w-10 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                <Send className="h-4 w-4 ml-0.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      {/* Viewer Logic */}
      <AnimatePresence>
        {isViewerOpen && activeSource && !isViewerFullscreen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: `${viewerWidth}%`, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="relative bg-white dark:bg-[#0c0c0e] border-l border-zinc-200 dark:border-zinc-800 flex flex-col z-40 shadow-2xl"
          >
            <div
              onMouseDown={() => setIsDragging(true)}
              className="absolute left-0 top-0 bottom-0 w-1.5 hover:w-2 cursor-col-resize bg-transparent hover:bg-indigo-500/20 transition-all z-50 flex items-center justify-center group"
            >
              <div className="h-8 w-1 rounded-full bg-zinc-300 dark:bg-zinc-700 group-hover:bg-indigo-500"></div>
            </div>
            <DocumentViewer
              source={activeSource}
              viewMode={viewMode}
              onClose={() => setIsViewerOpen(false)}
              onToggleMode={() =>
                setViewMode(viewMode === "native" ? "text" : "native")
              }
              isFullscreen={false}
              onToggleFullscreen={() => setIsViewerFullscreen(true)}
            />
          </motion.div>
        )}
      </AnimatePresence>
      {isViewerFullscreen && activeSource && (
        <DocumentViewer
          source={activeSource}
          viewMode={viewMode}
          onClose={() => {
            setIsViewerFullscreen(false);
            setIsViewerOpen(false);
          }}
          onToggleMode={() =>
            setViewMode(viewMode === "native" ? "text" : "native")
          }
          isFullscreen={true}
          onToggleFullscreen={() => setIsViewerFullscreen(false)}
        />
      )}
      {activeMenu && (
        <div
          className="fixed z-50 w-48 bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-2xl py-1.5 flex flex-col animate-in fade-in zoom-in-95 duration-100"
          style={{ top: activeMenu.y, left: activeMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          {isRenaming ? (
            <div className="px-2 py-1">
              <input
                className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs p-2 text-zinc-900 dark:text-white"
                autoFocus
                placeholder="New name..."
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleRenameSubmit()}
              />
              <button
                onClick={handleRenameSubmit}
                className="w-full mt-1 bg-indigo-600 text-white text-[10px] py-1 rounded-md hover:bg-indigo-700"
              >
                Save
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => {
                  setIsRenaming(true);
                  setRenameValue(activeMenu.title);
                }}
                className="px-3 py-2.5 text-left text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-2 transition-colors"
              >
                <Edit2 className="h-3.5 w-3.5" /> Rename
              </button>
              <button
                onClick={handleDeleteChat}
                className="px-3 py-2.5 text-left text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-2 transition-colors border-t border-zinc-100 dark:border-zinc-800"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
            </>
          )}
          <div
            className="fixed inset-0 -z-10"
            onClick={() => {
              setActiveMenu(null);
              setIsRenaming(false);
            }}
          />
        </div>
      )}
    </div>
  );
}
