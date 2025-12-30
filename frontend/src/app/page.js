"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useMotionTemplate,
  AnimatePresence,
} from "framer-motion";
import {
  FileText,
  PlayCircle,
  Youtube,
  Globe,
  Brain,
  Mail,
  User,
  Star,
  ArrowRight,
  Check,
  Crown,
  ChevronDown,
  Zap,
  Search,
  Layers,
  Cpu,
  Sun,
  Moon,
  Bot,
  Shield,
  Clock,
  Scan,
  MessageSquare,
  PenTool,
  GraduationCap,
  CheckCircle2,
  PauseCircle,
  Sparkles,
  Link as LinkIcon,
  Quote,
  ChevronLeft,
  ChevronRight,
  Twitter,
  Github,
  Linkedin,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// ==========================================
// 🎨 ANIMATION UTILS
// ==========================================

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const floatAnimation = {
  y: [0, -10, 0],
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: "easeInOut",
  },
};

// --- DATA ---
const STARTUPS = [
  {
    name: "Vercel",
    url: "https://assets.vercel.com/image/upload/v1588805858/repositories/vercel/logo.png",
  },
  {
    name: "Supabase",
    url: "https://seeklogo.com/images/S/supabase-logo-DCC676FFE2-seeklogo.com.png",
  },
  {
    name: "Linear",
    url: "https://upload.wikimedia.org/wikipedia/commons/9/97/Linear_logo.svg",
  },
  {
    name: "Raycast",
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Raycast_icon_and_wordmark.svg/2560px-Raycast_icon_and_wordmark.svg.png",
  },
  {
    name: "Notion",
    url: "https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png",
  },
  {
    name: "Loom",
    url: "https://upload.wikimedia.org/wikipedia/commons/3/3b/Loom_logo.svg",
  },
  {
    name: "OpenAI",
    url: "https://upload.wikimedia.org/wikipedia/commons/4/4d/OpenAI_Logo.svg",
  },
];

const TESTIMONIALS = [
  {
    name: "Sarah Chen",
    role: "PhD Researcher",
    text: "I used to drown in PDFs. SecondBrain lets me query 50+ papers at once. It found connections I missed completely.",
  },
  {
    name: "Mark Davis",
    role: "Content Creator",
    text: "I paste YouTube links of 3-hour podcasts, ask for viral hooks, and get them in seconds. This tool pays for itself.",
  },
  {
    name: "Alex T.",
    role: "Medical Student",
    text: "The ability to ask 'Explain this like I'm 5' for complex medical journals saved my finals. 11/10 recommended.",
  },
  {
    name: "Jessica Lee",
    role: "Product Manager",
    text: "Summarizing user feedback from CSVs used to take days. Now it takes minutes.",
  },
  {
    name: "David Kim",
    role: "Software Engineer",
    text: "I upload documentation and ask coding questions. It's like having a senior dev sitting next to me.",
  },
  {
    name: "Emily R.",
    role: "Journalist",
    text: "Researching articles has never been faster. The citation feature is a lifesaver for fact-checking.",
  },
];

const FAQS = [
  {
    q: "Can I upload handwritten PDFs?",
    a: "Yes! Our OCR engine can read handwritten notes, scanned documents, and standard digital PDFs with high accuracy.",
  },
  {
    q: "How does YouTube analysis work?",
    a: "Simply paste the link. We fetch the transcript and let you chat with it.",
  },
  {
    q: "Is my data secure?",
    a: "Absolutely. We use enterprise-grade encryption for all vector embeddings.",
  },
  {
    q: "What is the Context Window?",
    a: "The Pro plan supports up to 100k tokens, which is roughly equal to a 300-page book in a single conversation.",
  },
];

// ==========================================
// 🧩 SUB-COMPONENTS
// ==========================================

function TiltCard({ children, className = "" }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }) {
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const xPct = (clientX - left) / width - 0.5;
    const yPct = (clientY - top) / height - 0.5;
    x.set(xPct * 10);
    y.set(yPct * 10);
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      className={`group relative border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900/50 overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX: y, rotateY: x, transformStyle: "preserve-3d" }}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100 z-0"
        style={{
          background: useMotionTemplate`
              radial-gradient(
                650px circle at ${mouseX}px ${mouseY}px,
                rgba(99, 102, 241, 0.15),
                transparent 80%
              )
            `,
        }}
      />
      <div className="relative h-full z-10">{children}</div>
    </motion.div>
  );
}

const CheckItem = ({ text }) => (
  <motion.div
    variants={fadeInUp}
    className="flex items-center gap-3 mb-3 group"
  >
    <div className="h-5 w-5 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
      <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
    </div>
    <span className="text-zinc-700 dark:text-zinc-300 text-sm font-medium group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
      {text}
    </span>
  </motion.div>
);

const TabButton = ({ active, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all duration-300 border ${
      active
        ? "bg-zinc-900 dark:bg-white text-white dark:text-black border-zinc-900 dark:border-white shadow-lg scale-105"
        : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:scale-102"
    }`}
  >
    <Icon className="h-4 w-4" />
    {label}
  </button>
);

const Typewriter = ({ words }) => {
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [reverse, setReverse] = useState(false);

  useEffect(() => {
    if (subIndex === words[index].length + 1 && !reverse) {
      setTimeout(() => setReverse(true), 1000);
      return;
    }
    if (subIndex === 0 && reverse) {
      setReverse(false);
      setIndex((prev) => (prev + 1) % words.length);
      return;
    }
    const timeout = setTimeout(
      () => setSubIndex((prev) => prev + (reverse ? -1 : 1)),
      reverse ? 75 : 150
    );
    return () => clearTimeout(timeout);
  }, [subIndex, index, reverse, words]);

  return (
    <span className="inline-block min-w-70 text-left">
      {words[index].substring(0, subIndex)}
      <span className="animate-blink">|</span>
    </span>
  );
};

// ==========================================
// 📄 MAIN PAGE COMPONENT
// ==========================================

export default function Home() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("researchers");
  const [openFaq, setOpenFaq] = useState(null);

  // --- CHAOS TO CLARITY STATE ---
  const [activeStep, setActiveStep] = useState(0);
  const [isHoveringStep, setIsHoveringStep] = useState(false); // New state to pause loop

  const [testimonialIndex, setTestimonialIndex] = useState(0);

  // Hero Scroll
  const heroRef = useRef(null);
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(heroScroll, [0, 1], ["0%", "50%"]);
  const heroOpacity = useTransform(heroScroll, [0, 0.5], [1, 0]);

  // 🔥 HYBRID AUTO-LOOP LOGIC
  useEffect(() => {
    if (isHoveringStep) return; // Don't loop if hovering

    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 3);
    }, 2000); // 2 Seconds Speed (Faster)

    return () => clearInterval(interval);
  }, [isHoveringStep]);

  useEffect(() => setMounted(true), []);

  const handleNextTestimonial = () => {
    setTestimonialIndex((prev) => (prev + 1) % (TESTIMONIALS.length - 2));
  };

  const handlePrevTestimonial = () => {
    setTestimonialIndex(
      (prev) =>
        (prev - 1 + (TESTIMONIALS.length - 2)) % (TESTIMONIALS.length - 2)
    );
  };

  // Use Case Data
  const USE_CASES = {
    researchers: {
      title: "Synthesize 100s of Papers",
      desc: "Upload your entire bibliography. Ask SecondBrain to find connections, contradictions, and summaries.",
      badge: "🚀 90% Faster Literature Review",
      badgeColor:
        "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300",
      checks: [
        "Connect Unlimited Sources",
        "Export to Notion",
        "Hallucination-Free Citations",
      ],
      icon: Layers,
      visual: (
        <motion.div className="relative w-full h-full bg-white dark:bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-xl p-6 flex flex-col gap-3 group hover:shadow-2xl transition-shadow duration-300">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              whileHover={{
                x: 10,
                scale: 1.02,
                backgroundColor: "rgba(99, 102, 241, 0.08)",
              }}
              initial={{ x: 0, scale: 1 }}
              className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-100 dark:border-zinc-800 transition-all duration-300 cursor-pointer"
            >
              <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900/30 rounded flex items-center justify-center text-blue-600 shrink-0">
                <FileText className="h-5 w-5" />
              </div>
              <div className="space-y-1 w-full">
                <div
                  className="h-2 w-3/4 bg-zinc-300 dark:bg-zinc-700 rounded animate-pulse"
                  style={{ animationDelay: `${i * 0.2}s` }}
                ></div>
                <div
                  className="h-2 w-1/2 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse"
                  style={{ animationDelay: `${i * 0.3}s` }}
                ></div>
              </div>
              <CheckCircle2 className="h-5 w-5 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 scale-0 group-hover:scale-100" />
            </motion.div>
          ))}
          <motion.div
            className="mt-auto bg-indigo-50 dark:bg-indigo-900/10 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800 group-hover:border-indigo-500/50 transition-colors relative overflow-hidden"
            whileHover={{ scale: 1.03 }}
          >
            <motion.div
              animate={floatAnimation}
              className="absolute top-2 right-2"
            >
              <Sparkles className="h-4 w-4 text-indigo-400 opacity-50" />
            </motion.div>
            <div className="flex gap-2 items-center mb-2">
              <Bot className="h-4 w-4 text-indigo-600" />
              <span className="text-xs font-bold text-indigo-600">
                AI Consensus
              </span>
            </div>
            <div className="space-y-1">
              <div className="h-2 w-full bg-indigo-200 dark:bg-indigo-800 rounded"></div>
              <div className="h-2 w-5/6 bg-indigo-200 dark:bg-indigo-800 rounded"></div>
            </div>
          </motion.div>
        </motion.div>
      ),
    },
    students: {
      title: "Ace Exams without Burnout",
      desc: "Paste YouTube lecture links. Get auto-generated quizzes, flashcards, and summaries. Chat with your textbooks.",
      badge: "🚀 20hrs/week Saved Studying",
      badgeColor:
        "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
      checks: ["Instant Flashcards", "Lecture Summaries", "Quiz Generation"],
      icon: GraduationCap,
      visual: (
        <div className="relative w-full h-full bg-white dark:bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-xl p-6 flex flex-col items-center justify-center group hover:shadow-2xl transition-shadow duration-300">
          <div className="w-full aspect-video bg-zinc-900 rounded-lg mb-4 relative overflow-hidden flex items-center justify-center cursor-pointer group/video">
            <div className="absolute inset-0 bg-[url('https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg')] bg-cover opacity-50 group-hover/video:opacity-70 transition-opacity"></div>
            <div className="relative z-10 group-hover/video:scale-110 transition-transform duration-300">
              <PlayCircle className="h-16 w-16 text-white group-hover/video:hidden drop-shadow-lg" />
              <PauseCircle className="h-16 w-16 text-white hidden group-hover/video:block drop-shadow-lg" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 w-full">
            <motion.div
              whileHover={{
                scale: 1.05,
                backgroundColor: "rgba(168, 85, 247, 0.15)",
              }}
              className="bg-purple-50 dark:bg-purple-900/10 p-3 rounded-lg border border-purple-100 dark:border-purple-800 text-center cursor-pointer transition-colors relative overflow-hidden"
            >
              <motion.div
                animate={floatAnimation}
                className="absolute top-1 right-1"
              >
                <Sparkles className="h-3 w-3 text-purple-400 opacity-50" />
              </motion.div>
              <Brain className="h-6 w-6 text-purple-500 mx-auto mb-1" />
              <span className="text-xs font-bold text-purple-700 dark:text-purple-300">
                Generate Quiz
              </span>
            </motion.div>
            <motion.div
              whileHover={{
                scale: 1.05,
                backgroundColor: "rgba(59, 130, 246, 0.15)",
              }}
              className="bg-blue-50 dark:bg-blue-900/10 p-3 rounded-lg border border-blue-100 dark:border-blue-800 text-center cursor-pointer transition-colors"
            >
              <FileText className="h-6 w-6 text-blue-500 mx-auto mb-1" />
              <span className="text-xs font-bold text-blue-700 dark:text-blue-300">
                Summarize
              </span>
            </motion.div>
          </div>
        </div>
      ),
    },
    creators: {
      title: "Content Repurposing Machine",
      desc: "Turn one video into 10 Twitter threads, 5 blog posts, and a LinkedIn article. Extract viral hooks automatically.",
      badge: "🚀 10x Content Output",
      badgeColor:
        "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",
      checks: ["Video to Thread", "Auto-Blog Post", "Viral Hook Extraction"],
      icon: PenTool,
      visual: (
        <div className="relative w-full h-full bg-white dark:bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-xl p-6 group hover:shadow-2xl transition-shadow duration-300">
          <div className="flex gap-3 mb-4">
            <div className="h-10 w-10 bg-zinc-200 dark:bg-zinc-800 rounded-full shrink-0 overflow-hidden relative">
              <Image
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=creator`}
                alt="User"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="space-y-2 w-full">
              <div className="h-2 w-1/3 bg-zinc-300 dark:bg-zinc-700 rounded animate-pulse"></div>
              <div className="h-24 bg-zinc-50 dark:bg-zinc-900 rounded border border-zinc-200 dark:border-zinc-800 p-3 relative overflow-hidden group-hover:border-emerald-500/30 transition-colors">
                <div className="space-y-2 opacity-50">
                  <div className="h-2 w-full bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                  <div className="h-2 w-5/6 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                  <div className="h-2 w-4/6 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                </div>
                {/* Generating Animation */}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <Loader2 className="h-6 w-6 text-emerald-500 animate-spin mb-2" />
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    Generating Thread...
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-900 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 group-hover:border-emerald-500/30 transition-colors">
            <span className="text-xs font-bold text-zinc-500">Export to:</span>
            <div className="flex gap-2">
              {["𝕏", "in", "B"].map((p, i) => (
                <motion.div
                  key={p}
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -3, scale: 1.1 }}
                  className={`h-8 w-8 rounded-md flex items-center justify-center text-white text-sm cursor-pointer shadow-sm ${
                    p === "𝕏"
                      ? "bg-black"
                      : p === "in"
                      ? "bg-blue-600"
                      : "bg-orange-500"
                  }`}
                >
                  {p}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      ),
    },
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#020202] text-zinc-900 dark:text-white transition-colors duration-500 font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      {/* GLOBAL STYLES */}
      <style jsx global>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll {
          animation: scroll 60s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .bg-grid {
          background-size: 40px 40px;
          background-image: linear-gradient(
              to right,
              rgba(128, 128, 128, 0.05) 1px,
              transparent 1px
            ),
            linear-gradient(
              to bottom,
              rgba(128, 128, 128, 0.05) 1px,
              transparent 1px
            );
        }
        @keyframes blink {
          50% {
            opacity: 0;
          }
        }
        .animate-blink {
          animation: blink 1s infinite;
        }
        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>

      {/* ================= NAVBAR ================= */}
      <nav className="fixed top-0 w-full z-50 bg-white/70 dark:bg-[#020202]/80 backdrop-blur-xl border-b border-zinc-200 dark:border-white/5 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="h-9 w-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-300">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight hidden sm:block">
              SecondBrain
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-600 dark:text-zinc-400">
            {["Features", "Use Cases", "Pricing", "FAQ"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(" ", "-")}`}
                className="hover:text-indigo-600 dark:hover:text-white transition-colors relative group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-600 transition-all group-hover:w-full"></span>
              </a>
            ))}
          </div>

          <div className="flex gap-4 items-center">
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-all border border-transparent hover:border-zinc-300 dark:hover:border-zinc-700"
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </button>
            )}
            <SignedIn>
              <Link href="/dashboard">
                <button className="hidden sm:block px-5 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-full shadow-lg shadow-indigo-500/20 transition-all hover:-translate-y-0.5">
                  Dashboard
                </button>
              </Link>
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox:
                      "h-9 w-9 ring-2 ring-indigo-500/20 hover:ring-indigo-500 transition-all",
                  },
                }}
              />
            </SignedIn>
            <SignedOut>
              <Link href="/sign-in">
                <button className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white px-4 py-2 transition-colors">
                  Log in
                </button>
              </Link>
              <Link href="/sign-up">
                <button className="h-9 px-5 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-black font-bold text-sm hover:opacity-90 transition-all shadow-lg hover:-translate-y-0.5">
                  Get Started
                </button>
              </Link>
            </SignedOut>
          </div>
        </div>
      </nav>

      {/* ================= HERO SECTION ================= */}
      <section
        ref={heroRef}
        className="pt-32 pb-20 px-6 relative overflow-hidden bg-grid min-h-[90vh] flex items-center"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-250 h-150 bg-indigo-600/10 rounded-full blur-[120px] -z-10 animate-pulse-slow" />
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            style={{ y: heroY, opacity: heroOpacity }}
            className="space-y-8 relative z-10"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-indigo-200 dark:border-indigo-500/30 bg-white dark:bg-indigo-500/10 px-4 py-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider shadow-sm backdrop-blur-sm"
            >
              <Zap className="h-3 w-3 fill-current" /> Powering 10,000+ Minds
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] text-zinc-900 dark:text-white"
            >
              Chat with your <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 animate-gradient-x h-[1.2em] inline-block">
                <Typewriter
                  words={[
                    "Documents.",
                    "YouTube Videos.",
                    "Web Articles.",
                    "Second Brain.",
                  ]}
                />
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-zinc-600 dark:text-zinc-400 max-w-xl leading-relaxed"
            >
              The AI workspace that unifies your <b>Documents</b>, <b>Videos</b>
              , and <b>Web Links</b>. Stop searching, start knowing.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-4"
            >
              <Link href="/sign-up">
                <button className="h-14 px-8 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-lg shadow-xl shadow-indigo-600/30 transition-all hover:scale-105 flex items-center gap-2">
                  Start for Free <ArrowRight className="h-5 w-5" />
                </button>
              </Link>
              <button className="h-14 px-8 rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-white/5 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/10 font-medium text-lg transition-all flex items-center gap-2 backdrop-blur-md">
                <PlayCircle className="h-5 w-5" /> Live Demo
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-500 pt-6"
            >
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-10 w-10 rounded-full border-2 border-white dark:border-black bg-zinc-200 overflow-hidden relative"
                  >
                    <div className="absolute inset-0 bg-indigo-200"></div>
                    <Image
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${
                        i * 99
                      }`}
                      alt="User"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ))}
              </div>
              <div>
                <div className="flex gap-1 text-yellow-500">
                  <Star className="h-3 w-3 fill-current" />
                  <Star className="h-3 w-3 fill-current" />
                  <Star className="h-3 w-3 fill-current" />
                  <Star className="h-3 w-3 fill-current" />
                  <Star className="h-3 w-3 fill-current" />
                </div>
                <p className="font-medium">Loved by 5000+ users</p>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 hidden lg:block"
          >
            <div className="relative animate-float">
              <div className="absolute -inset-4 bg-linear-to-r from-indigo-500 to-purple-600 rounded-2xl blur-3xl opacity-30 animate-pulse-slow"></div>
              <Image
                src="/images/herobrain.png"
                alt="App Dark"
                width={900}
                height={900}
                className="hidden dark:block object-contain drop-shadow-2xl hover:scale-[1.02] transition-transform duration-700"
                unoptimized
              />
              <Image
                src="/images/herobrain_.png"
                alt="App Light"
                width={900}
                height={900}
                className="block dark:hidden object-contain drop-shadow-2xl hover:scale-[1.02] transition-transform duration-700"
                unoptimized
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ================= 🔥 STATS SECTION (BY THE NUMBERS) ================= */}
      <section className="py-24 border-y border-zinc-200 dark:border-white/5 bg-white dark:bg-zinc-950">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-zinc-900 dark:text-white">
              By the Numbers
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              Trusted by knowledge workers worldwide.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            {[
              {
                val: "10k+",
                label: "HOURS SAVED",
                icon: Clock,
                color: "text-indigo-500",
                bg: "bg-indigo-100 dark:bg-indigo-900/20",
              },
              {
                val: "5M+",
                label: "DOCUMENTS PARSED",
                icon: FileText,
                color: "text-emerald-500",
                bg: "bg-emerald-100 dark:bg-emerald-900/20",
              },
              {
                val: "99.9%",
                label: "UPTIME SECURITY",
                icon: Shield,
                color: "text-purple-500",
                bg: "bg-purple-100 dark:bg-purple-900/20",
              },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="flex flex-col items-center"
              >
                <div
                  className={`h-20 w-20 rounded-full flex items-center justify-center mb-6 ${s.bg}`}
                >
                  <s.icon className={`h-10 w-10 ${s.color}`} />
                </div>
                <h3 className="text-5xl font-extrabold text-zinc-900 dark:text-white mb-2">
                  {s.val}
                </h3>
                <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">
                  {s.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= LOGO MARQUEE ================= */}
      <section className="py-16 border-b border-zinc-200 dark:border-white/5 bg-white dark:bg-zinc-900 overflow-hidden">
        <div className="text-center mb-10">
          <p className="text-sm font-bold text-zinc-500 uppercase tracking-[0.2em]">
            TRUSTED BY MODERN TEAMS
          </p>
        </div>
        <div className="relative w-full">
          <div className="absolute left-0 top-0 bottom-0 w-40 bg-linear-to-r from-white dark:from-zinc-900 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-40 bg-linear-to-l from-white dark:from-zinc-900 to-transparent z-10 pointer-events-none" />
          <div className="flex w-max animate-scroll gap-24 px-10">
            {[...STARTUPS, ...STARTUPS, ...STARTUPS, ...STARTUPS].map(
              (logo, index) => (
                <div
                  key={index}
                  className="relative h-14 w-40 opacity-70 hover:opacity-100 transition-all duration-300"
                >
                  <Image
                    src={logo.url}
                    alt={logo.name}
                    fill
                    className="object-contain dark:invert"
                    unoptimized
                  />
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* ================= FEATURES GRID ================= */}
      <section
        id="features"
        className="py-32 relative bg-zinc-50 dark:bg-[#020202]"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-zinc-900 dark:text-white">
              Superpowers for your Brain.
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 text-lg">
              Replace your scattered bookmarks and files.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="md:col-span-2"
            >
              <TiltCard className="rounded-3xl p-10 h-full flex flex-col md:flex-row gap-10 items-center">
                <div className="flex-1 relative z-10">
                  <div className="h-12 w-12 bg-indigo-100 dark:bg-indigo-500/20 rounded-xl flex items-center justify-center mb-6 text-indigo-600 dark:text-indigo-400">
                    <Scan className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-zinc-900 dark:text-white">
                    Smart OCR & Analysis
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-400">
                    Upload dense PDFs or blurry scans. Our engine extracts text,
                    understands layout, and cites exact page numbers.
                  </p>
                </div>
                <div className="w-full md:w-64 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-lg relative overflow-hidden">
                  <div className="space-y-3 opacity-50 blur-[0.5px]">
                    <div className="h-2 w-full bg-zinc-300 dark:bg-zinc-700 rounded"></div>
                    <div className="h-2 w-5/6 bg-zinc-300 dark:bg-zinc-700 rounded"></div>
                    <div className="h-2 w-full bg-zinc-300 dark:bg-zinc-700 rounded"></div>
                    <div className="h-2 w-4/6 bg-zinc-300 dark:bg-zinc-700 rounded"></div>
                  </div>
                  <motion.div
                    animate={{ top: ["0%", "100%", "0%"] }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute left-0 w-full h-8 bg-linear-to-b from-transparent via-indigo-500/20 to-transparent border-b border-indigo-500/50 z-10"
                  />
                </div>
              </TiltCard>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <TiltCard className="rounded-3xl p-10 h-full flex flex-col">
                <div className="h-12 w-12 bg-emerald-100 dark:bg-emerald-500/20 rounded-xl flex items-center justify-center mb-6 text-emerald-600 dark:text-emerald-400">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-zinc-900 dark:text-white">
                  Contextual Chat
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-6">
                  Ask questions across multiple sources simultaneously.
                </p>
                <div className="mt-auto space-y-3">
                  <div className="bg-zinc-100 dark:bg-zinc-800 p-2.5 rounded-2xl rounded-tl-none text-[11px] text-zinc-600 dark:text-zinc-300 w-3/4 shadow-sm border border-zinc-200 dark:border-zinc-700">
                    Summarize the Q3 report.
                  </div>
                  <div className="bg-emerald-100 dark:bg-emerald-500/20 p-2.5 rounded-2xl rounded-tr-none text-[11px] text-emerald-800 dark:text-emerald-200 ml-auto w-3/4 shadow-sm border border-emerald-200 dark:border-emerald-500/20">
                    Revenue up <span className="font-bold">40%</span>.
                  </div>
                </div>
              </TiltCard>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <TiltCard className="rounded-3xl p-10 h-full flex flex-col">
                <div className="h-12 w-12 bg-red-100 dark:bg-red-500/20 rounded-xl flex items-center justify-center mb-6 text-red-600 dark:text-red-400">
                  <Youtube className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-zinc-900 dark:text-white">
                  Video Intelligence
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-6">
                  Skip the 2-hour podcast. Get the gold nuggets instantly.
                </p>
                <div className="mt-auto h-24 w-full bg-zinc-900 rounded-xl flex items-center justify-center relative overflow-hidden group hover:scale-105 transition-transform border border-zinc-200 dark:border-zinc-800">
                  <div className="absolute inset-0 bg-[url('https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg')] bg-cover opacity-40 grayscale group-hover:grayscale-0 transition-all"></div>
                  <div className="h-10 w-10 bg-red-600 rounded-full flex items-center justify-center shadow-lg z-10">
                    <PlayCircle className="h-5 w-5 text-white fill-current" />
                  </div>
                </div>
              </TiltCard>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="md:col-span-2"
            >
              <TiltCard className="rounded-3xl p-10 h-full flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-1">
                  <div className="h-12 w-12 bg-purple-100 dark:bg-purple-500/20 rounded-xl flex items-center justify-center mb-6 text-purple-600 dark:text-purple-400">
                    <Search className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-zinc-900 dark:text-white">
                    Global Neural Search
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-400">
                    Don&apos;t remember where you read it? Search across all your
                    PDFs, Videos, and Links simultaneously.
                  </p>
                </div>
                <div className="flex-1 w-full bg-zinc-50 dark:bg-black p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-md">
                  <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-3">
                    <Search className="h-4 w-4 text-purple-500" />
                    <span className="text-xs text-zinc-400">
                      &quot;Marketing Strategy 2024&quot;
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="h-8 w-full bg-white dark:bg-zinc-900 rounded border border-zinc-100 dark:border-zinc-800 flex items-center px-2">
                      <div className="h-2 w-2 rounded-full bg-red-500 mr-2"></div>
                      <span className="text-[8px] text-zinc-500">
                        Video Transcript
                      </span>
                    </div>
                    <div className="h-8 w-full bg-white dark:bg-zinc-900 rounded border border-zinc-100 dark:border-zinc-800 flex items-center px-2">
                      <div className="h-2 w-2 rounded-full bg-indigo-500 mr-2"></div>
                      <span className="text-[8px] text-zinc-500">
                        Q3 Report.pdf
                      </span>
                    </div>
                  </div>
                </div>
              </TiltCard>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ================= USE CASES (FIXED WITH ANIMATIONS) ================= */}
      <section
        id="use-cases"
        className="py-32 px-6 bg-white dark:bg-[#050505] border-y border-zinc-200 dark:border-white/5 my-16"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-zinc-900 dark:text-white">
              Built for High Performers
            </h2>
            <div className="flex flex-wrap justify-center gap-4">
              {Object.keys(USE_CASES).map((key) => (
                <TabButton
                  key={key}
                  active={activeTab === key}
                  onClick={() => setActiveTab(key)}
                  icon={USE_CASES[key].icon}
                  label={key.charAt(0).toUpperCase() + key.slice(1)}
                />
              ))}
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-8"
            >
              <h3 className="text-3xl font-bold text-zinc-900 dark:text-white">
                {USE_CASES[activeTab].title}
              </h3>
              <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {USE_CASES[activeTab].desc}
              </p>
              <div
                className={`inline-block px-4 py-2 rounded-lg font-bold text-sm ${USE_CASES[activeTab].badgeColor}`}
              >
                {USE_CASES[activeTab].badge}
              </div>
              <div className="pt-4 flex flex-col gap-3">
                {USE_CASES[activeTab].checks.map((check, i) => (
                  <CheckItem key={i} text={check} />
                ))}
              </div>
            </motion.div>
            <motion.div
              key={activeTab + "visual"}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="h-112.5 w-full"
            >
              {USE_CASES[activeTab].visual}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ================= 🔥 HOW IT WORKS (STATIC LAYOUT - AUTO LOOP ANIMATION WITH FLOATING STACK) ================= */}
      <section
        id="how-it-works"
        className="py-32 px-6 bg-zinc-50 dark:bg-[#050505] my-16"
      >
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-24 items-center">
          {/* Left: Text (Auto + Hover) */}
          <div className="space-y-12">
            <h2 className="text-4xl md:text-6xl font-extrabold mb-12 text-zinc-900 dark:text-white leading-tight">
              From Chaos to <br />
              <span className="text-indigo-600 dark:text-indigo-400">
                Absolute Clarity.
              </span>
            </h2>
            {[
              {
                title: "Connect Sources",
                desc: "Drop your PDFs, YouTube links, or web articles.",
                icon: LinkIcon,
              },
              {
                title: "Neural Processing",
                desc: "Engine vectorizes content into searchable memory.",
                icon: Cpu,
              },
              {
                title: "Instant Answers",
                desc: "Chat with your data. Get cited responses instantly.",
                icon: Bot,
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                // 🔥 HYBRID INTERACTION: Auto-highlights OR Highlights on Hover
                onMouseEnter={() => {
                  setActiveStep(i);
                  setIsHoveringStep(true);
                }}
                onMouseLeave={() => setIsHoveringStep(false)}
                animate={{
                  opacity: activeStep === i ? 1 : 0.4,
                  x: activeStep === i ? 10 : 0,
                }}
                transition={{ duration: 0.3 }}
                className="flex gap-8 relative z-20 group cursor-pointer"
              >
                <div
                  className={`h-16 w-16 rounded-2xl border flex items-center justify-center shrink-0 shadow-lg transition-colors ${
                    activeStep === i
                      ? "bg-indigo-600 border-indigo-600 text-white"
                      : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-400"
                  }`}
                >
                  <item.icon className="h-8 w-8" />
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
                    {item.title}
                  </h4>
                  <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Right: Floating Cards Stack (THE "FINAL STATE") */}
          <div className="relative h-125 w-full flex items-center justify-center perspective-1000">
            <div className="absolute inset-0 bg-linear-to-tr from-indigo-500/10 to-purple-500/10 blur-[120px] rounded-full"></div>

            {/* 1. PDF Card (Back) */}
            <motion.div
              animate={{
                y: activeStep === 0 ? 0 : -40,
                scale: activeStep === 0 ? 1 : 0.9,
                opacity: 1,
                zIndex: activeStep === 0 ? 30 : 10,
                rotateX: activeStep === 0 ? 0 : 5,
              }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="absolute bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 w-80"
            >
              <div className="flex items-center gap-3 mb-3">
                <FileText className="h-6 w-6 text-red-500" />
                <span className="font-bold text-zinc-900 dark:text-white">
                  Research.pdf
                </span>
              </div>
              <div className="space-y-2">
                <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded"></div>
                <div className="h-2 w-3/4 bg-zinc-100 dark:bg-zinc-800 rounded"></div>
              </div>
            </motion.div>

            {/* 2. Processing Card (Middle) */}
            <motion.div
              animate={{
                y: activeStep === 1 ? 0 : activeStep > 1 ? -40 : 40,
                scale: activeStep === 1 ? 1 : 0.9,
                opacity: activeStep >= 1 ? 1 : 0,
                zIndex: activeStep === 1 ? 30 : 20,
                rotateX: activeStep === 1 ? 0 : 5,
              }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="absolute bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 w-80"
            >
              <div className="flex justify-between mb-4">
                <span className="text-xs font-bold text-indigo-600 uppercase">
                  Processing
                </span>
                <Zap className="h-4 w-4 text-yellow-500 animate-pulse" />
              </div>
              <div className="flex gap-2 mb-4">
                <div className="h-10 w-10 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg"></div>
                <div className="h-10 w-10 bg-purple-100 dark:bg-purple-900/50 rounded-lg"></div>
                <div className="h-10 w-10 bg-pink-100 dark:bg-pink-900/50 rounded-lg"></div>
              </div>
              <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: activeStep >= 1 ? "100%" : "0%" }}
                  transition={{ duration: 1.5 }}
                  className="h-full bg-indigo-500"
                />
              </div>
            </motion.div>

            {/* 3. Answer Card (Front & Floating) */}
            <motion.div
              animate={{
                y: activeStep === 2 ? 0 : 40,
                scale: activeStep === 2 ? 1 : 0.9,
                opacity: activeStep === 2 ? 1 : 0,
                zIndex: activeStep === 2 ? 30 : 10,
                rotateX: activeStep === 2 ? 0 : -5,
              }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="absolute bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 w-80"
            >
              <motion.div
                animate={floatAnimation}
                className="absolute -top-3 -right-3 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg z-50"
              >
                READY
              </motion.div>
              <div className="flex gap-4">
                <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md">
                  <Brain className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">
                    SecondBrain Answer
                  </p>
                  <p className="text-sm font-medium text-zinc-900 dark:text-white leading-relaxed">
                    Revenue grew by{" "}
                    <span className="text-emerald-500 font-bold">240%</span> in
                    Q3.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ================= TESTIMONIALS CAROUSEL ================= */}
      <section className="py-24 border-y border-zinc-200 dark:border-white/5 bg-white dark:bg-zinc-900 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-2 text-zinc-900 dark:text-white">
                Loved by Thousands
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400">
                See what others are building.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handlePrevTestimonial}
                className="p-3 rounded-full border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={handleNextTestimonial}
                className="p-3 rounded-full border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <AnimatePresence mode="wait">
              {TESTIMONIALS.slice(testimonialIndex, testimonialIndex + 3).map(
                (t, i) => (
                  <motion.div
                    key={t.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-8 rounded-3xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 h-full flex flex-col justify-between hover:border-indigo-500/30 transition-colors"
                  >
                    <div>
                      <Quote className="h-8 w-8 text-indigo-200 dark:text-indigo-900/50 mb-4" />
                      <p className="text-zinc-700 dark:text-zinc-300 mb-6 leading-relaxed text-sm">
                        &quot;{t.text}&quot;
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center font-bold text-indigo-700 dark:text-indigo-300">
                        {t.name[0]}
                      </div>
                      <div>
                        <p className="font-bold text-zinc-900 dark:text-white text-sm">
                          {t.name}
                        </p>
                        <p className="text-xs text-zinc-500">{t.role}</p>
                      </div>
                    </div>
                  </motion.div>
                )
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ================= PRICING ================= */}
      <section
        id="pricing"
        className="py-24 px-6 relative bg-white dark:bg-[#020202] border-t border-zinc-200 dark:border-white/5"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-zinc-900 dark:text-white">
              Simple Pricing
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 items-center">
            {/* FREE */}
            <div className="p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/20 backdrop-blur-sm hover:border-zinc-400 transition-all">
              <h3 className="font-bold text-zinc-900 dark:text-white text-xl mb-2">
                Starter
              </h3>
              <div className="text-4xl font-bold my-4 text-zinc-900 dark:text-white">
                $0
              </div>
              <ul className="space-y-4 text-sm text-zinc-600 dark:text-zinc-400 mb-8">
                {[
                  "10 Chats / Day",
                  "Standard Gemini Model",
                  "7-Day Memory Retention",
                ].map((f) => (
                  <li key={f} className="flex gap-3">
                    <Check className="h-4 w-4 text-zinc-400" /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/sign-up">
                <button className="w-full py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all">
                  Start Free
                </button>
              </Link>
            </div>
            {/* PRO */}
            <div className="p-8 rounded-3xl border border-indigo-500 bg-linear-to-b from-indigo-50 to-transparent dark:from-indigo-900/20 backdrop-blur-md relative scale-105 shadow-2xl">
              <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl">
                POPULAR
              </div>
              <h3 className="font-bold text-zinc-900 dark:text-white text-xl mb-2 flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-500 fill-current" /> Pro
              </h3>
              <div className="text-4xl font-bold my-4 text-zinc-900 dark:text-white">
                $19
                <span className="text-lg font-normal text-zinc-500">/mo</span>
              </div>
              <ul className="space-y-4 text-sm text-zinc-700 dark:text-zinc-200 mb-8">
                {[
                  "Unlimited Chats",
                  "Gemini 1.5 Pro",
                  "Permanent Memory",
                  "100k Context",
                ].map((f) => (
                  <li key={f} className="flex gap-3">
                    <Check className="h-4 w-4 text-indigo-500" /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/sign-up">
                <button className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg transition-all">
                  Get Pro
                </button>
              </Link>
            </div>
            {/* ENTERPRISE */}
            <div className="p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/20 backdrop-blur-sm hover:border-zinc-400 transition-all">
              <h3 className="font-bold text-zinc-900 dark:text-white text-xl mb-2">
                Enterprise
              </h3>
              <div className="text-4xl font-bold my-4 text-zinc-900 dark:text-white">
                Custom
              </div>
              <ul className="space-y-4 text-sm text-zinc-600 dark:text-zinc-400 mb-8">
                {[
                  "Dedicated Vector DB",
                  "SSO (Okta/Auth0)",
                  "Custom API Integration",
                ].map((f) => (
                  <li key={f} className="flex gap-3">
                    <Check className="h-4 w-4 text-zinc-400" /> {f}
                  </li>
                ))}
              </ul>
              <a href="mailto:sales@secondbrain.ai">
                <button className="w-full py-3 rounded-xl border border-zinc-300 dark:border-zinc-700 font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all">
                  Contact Sales
                </button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FAQ & CONTACT ================= */}
      <section id="faq" className="py-24 px-6 max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-zinc-900 dark:text-white">
            FAQ
          </h2>
        </div>
        <div className="space-y-4">
          {FAQS.map((item, i) => (
            <div
              key={i}
              className="border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900/30 overflow-hidden hover:border-zinc-400 dark:hover:border-zinc-700 transition-colors shadow-sm"
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="flex items-center justify-between w-full p-6 text-left font-medium text-lg text-zinc-900 dark:text-zinc-200"
              >
                {item.q}
                <ChevronDown
                  className={`h-5 w-5 text-zinc-500 transition-transform ${
                    openFaq === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              <AnimatePresence>
                {openFaq === i && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-6 pt-0 text-zinc-600 dark:text-zinc-400 text-base leading-relaxed border-t border-zinc-200 dark:border-white/5">
                      {item.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* ================= FINAL CTA & CONTACT ================= */}
      <section className="py-24 px-6 bg-white dark:bg-[#020202] border-t border-zinc-200 dark:border-white/5">
        <div className="max-w-5xl mx-auto bg-linear-to-r from-indigo-600 to-purple-600 rounded-3xl p-16 text-center relative overflow-hidden shadow-2xl mb-24">
          <h2 className="text-4xl md:text-6xl font-extrabold mb-6 relative z-10 text-white">
            Ready to upgrade your mind?
          </h2>
          <Link href="/sign-up">
            <button className="h-16 px-12 rounded-full bg-white text-indigo-600 font-bold text-xl hover:scale-105 transition-transform shadow-xl relative z-10">
              Get Started
            </button>
          </Link>
        </div>
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 bg-zinc-50 dark:bg-zinc-900/50 p-10 rounded-3xl border border-zinc-200 dark:border-zinc-800">
          <div>
            <h3 className="text-2xl font-bold mb-4 text-zinc-900 dark:text-white">
              Get in Touch
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6">
              Found a bug or need enterprise features? We respond within 2
              hours.
            </p>
            <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-200">
              <Mail className="h-5 w-5" /> support@secondbrain.ai
            </div>
          </div>
          <form className="space-y-4">
            <Input placeholder="Your Name" className="bg-white dark:bg-black" />
            <Input
              placeholder="Your Email"
              className="bg-white dark:bg-black"
            />
            <Textarea
              placeholder="Message..."
              className="bg-white dark:bg-black"
            />
            <Button className="w-full bg-indigo-600 hover:bg-indigo-500">
              Send Message
            </Button>
          </form>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="py-16 border-t border-zinc-200 dark:border-white/10 bg-white dark:bg-[#020202]">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-8 mb-8 text-sm text-zinc-500">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="h-6 w-6 text-indigo-600" />
              <span className="font-bold text-xl text-zinc-900 dark:text-white">
                SecondBrain
              </span>
            </div>
            <p className="mb-4">
              Your AI external memory. Remember everything, forget nothing.
            </p>
            <div className="flex gap-4">
              <Twitter className="h-5 w-5 hover:text-indigo-500 cursor-pointer" />
              <Github className="h-5 w-5 hover:text-indigo-500 cursor-pointer" />
              <Linkedin className="h-5 w-5 hover:text-indigo-500 cursor-pointer" />
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-zinc-900 dark:text-white">
              Product
            </h4>
            <ul className="space-y-2">
              <li>Features</li>
              <li>Pricing</li>
              <li>Testimonials</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-zinc-900 dark:text-white">
              Legal
            </h4>
            <ul className="space-y-2">
              <li>Privacy</li>
              <li>Terms</li>
              <li>Security</li>
            </ul>
          </div>
        </div>
        <div className="text-center text-xs text-zinc-400 py-8 border-t border-zinc-200 dark:border-white/10">
          © 2025 SecondBrain AI. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
