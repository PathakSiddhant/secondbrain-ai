"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; 
import { Textarea } from "@/components/ui/textarea"; 
import { FileText, PlayCircle, Youtube, Globe, Brain, Mail, User, Star, Link } from "lucide-react"; 
import Image from "next/image"; 
import { motion } from "framer-motion";

// Animations
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-indigo-500/30 overflow-x-hidden font-sans">
      
      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">SecondBrain</span>
          </div>
          <div className="hidden md:flex gap-8 text-sm font-medium text-zinc-400">
            <a href="#features" className="hover:text-white transition-colors">Capabilities</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
            <a href="#reviews" className="hover:text-white transition-colors">Reviews</a>
          </div>
          <div className="flex gap-4">
            {/* FIXED: Login Button Visibility */}
            <Button variant="ghost" className="text-zinc-400 hover:text-white hover:bg-zinc-800 hidden sm:flex">Log in</Button>
            <Button className="bg-white text-black hover:bg-zinc-200 rounded-full px-6 transition-transform hover:scale-105">Get Started</Button>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Background Glows */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-250 h-125 bg-indigo-600/20 rounded-full blur-[120px] -z-10" />

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial="hidden" 
            animate="visible" 
            variants={staggerContainer}
            className="space-y-8"
          >
            <motion.div variants={fadeIn} className="inline-flex items-center rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-sm font-medium text-indigo-400">
              <span className="flex h-2 w-2 rounded-full bg-indigo-500 mr-2 animate-pulse"></span>
              The Ultimate Knowledge Hub
            </motion.div>
            
            <motion.h1 variants={fadeIn} className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1]">
              Chat with PDFs, <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-red-500 via-indigo-400 to-cyan-400">
                YouTube & Web
              </span>
            </motion.h1>
            
            <motion.p variants={fadeIn} className="text-xl text-zinc-400 max-w-xl leading-relaxed">
              Don&apos;t just read documents. <b>Paste YouTube links</b>, <b>add Article URLs</b>, or upload PDFs. Let AI summarize, cite, and answer questions from all your sources in one place.
            </motion.p>
            
            <motion.div variants={fadeIn} className="flex flex-wrap gap-4">
              <Button size="lg" className="h-14 px-8 text-lg bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-lg shadow-indigo-500/25 transition-transform hover:scale-105">
                <FileText className="mr-2 h-5 w-5" /> 
                Start Chatting
              </Button>
              
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-zinc-700 bg-transparent text-zinc-300 hover:bg-white hover:text-black rounded-full transition-all duration-300">
                <PlayCircle className="mr-2 h-5 w-5" /> 
                Watch Demo
              </Button>
            </motion.div>

            <motion.div variants={fadeIn} className="flex items-center gap-4 text-sm text-zinc-500 pt-4">
              <div className="flex -space-x-3">
                 {[
                   "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
                   "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka",
                   "https://api.dicebear.com/7.x/avataaars/svg?seed=Mark",
                   "https://api.dicebear.com/7.x/avataaars/svg?seed=Sasha"
                 ].map((src, i) => (
                   <div key={i} className="h-10 w-10 rounded-full border-2 border-black bg-zinc-800 overflow-hidden relative">
                      {/* FIXED: Added 'unoptimized' to bypass config issues */}
                      <Image 
                        src={src} 
                        alt="User Avatar" 
                        fill 
                        className="object-cover"
                        unoptimized 
                      />
                   </div>
                 ))}
              </div>
              <p>Trusted by <span className="text-white font-bold">2,000+</span> learners</p>
            </motion.div>
          </motion.div>

          {/* Hero Image */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 0.8 }}
            className="relative"
          >
             {/* Using 'unoptimized' here too just to be safe */}
             <Image 
              src="/images/herobrain.png" 
              alt="SecondBrain Interface" 
              width={600} 
              height={600}
              className="relative z-10 drop-shadow-2xl animate-float"
              priority
              unoptimized
            />
          </motion.div>
        </div>
      </section>

      {/* --- FEATURES GRID --- */}
      <section id="features" className="py-24 bg-zinc-950/50 border-y border-white/5 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">All your sources, One Brain</h2>
            <p className="text-zinc-400 text-lg">We support multi-modal inputs. Stop switching tabs.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-zinc-900/50 border border-white/10 hover:border-indigo-500/50 transition-colors group">
              <div className="h-12 w-12 bg-indigo-500/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-indigo-500/20 transition">
                <FileText className="h-6 w-6 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Document Analysis</h3>
              <p className="text-zinc-400 leading-relaxed">
                Upload PDFs, DOCX, or TXT files. The AI cites the exact page number for every answer it gives.
              </p>
            </div>
            <div className="p-8 rounded-2xl bg-zinc-900/50 border border-white/10 hover:border-red-500/50 transition-colors group">
              <div className="h-12 w-12 bg-red-500/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-red-500/20 transition">
                <Youtube className="h-6 w-6 text-red-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">YouTube Intelligence</h3>
              <p className="text-zinc-400 leading-relaxed">
                Paste a video link. We fetch the transcript and let you chat with the video content instantly.
              </p>
            </div>
            <div className="p-8 rounded-2xl bg-zinc-900/50 border border-white/10 hover:border-cyan-500/50 transition-colors group">
              <div className="h-12 w-12 bg-cyan-500/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-cyan-500/20 transition">
                <Globe className="h-6 w-6 text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Web Parser</h3>
              <p className="text-zinc-400 leading-relaxed">
                Add any article or blog URL. Your SecondBrain reads it and stores it for your future queries.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- HOW IT WORKS --- */}
      <section id="how-it-works" className="py-24 px-6 max-w-7xl mx-auto">
         <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
               <h2 className="text-3xl md:text-5xl font-bold mb-6">How SecondBrain works</h2>
               <div className="space-y-8">
                  {[
                    { step: "01", title: "Connect Source", desc: "Upload a PDF, paste a YouTube link, or add a website URL." },
                    { step: "02", title: "Vector Embeddings", desc: "We convert text & transcripts into a format the AI understands." },
                    { step: "03", title: "Chat with Context", desc: "Ask questions. We search your data and generate cited answers." }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-6 group">
                       <span className="text-5xl font-bold text-zinc-700/50 group-hover:text-indigo-500/50 transition-colors">{item.step}</span>
                       <div>
                          <h4 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">{item.title}</h4>
                          <p className="text-zinc-400 leading-relaxed">{item.desc}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
            
            <div className="relative h-112.5 bg-zinc-950/80 rounded-2xl border border-zinc-800 flex items-center justify-center overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-linear-to-br from-indigo-900/20 to-purple-900/20" />
                <div className="w-80 space-y-4 absolute top-12">
                   <div className="bg-zinc-800/80 h-14 w-full rounded-xl border border-red-500/30 p-3 flex items-center gap-3 animate-pulse">
                      <Youtube className="h-5 w-5 text-red-500" />
                      <div className="h-2 w-3/4 bg-zinc-600 rounded-full" />
                   </div>
                   <div className="bg-zinc-800/80 h-14 w-full rounded-xl border border-indigo-500/30 p-3 flex items-center gap-3">
                      <FileText className="h-5 w-5 text-indigo-500" />
                      <div className="h-2 w-1/2 bg-zinc-600 rounded-full" />
                   </div>
                </div>
                <div className="absolute bottom-0 w-full p-6 bg-zinc-900/90 border-t border-zinc-800 backdrop-blur-md">
                   <div className="h-10 bg-black rounded-lg border border-zinc-700 flex items-center px-4 gap-3">
                      <Link className="h-4 w-4 text-zinc-500" />
                      <div className="h-2 w-32 bg-zinc-700 rounded-full animate-pulse" />
                   </div>
                </div>
            </div>
         </div>
      </section>

      {/* --- TESTIMONIALS --- */}
      <section id="reviews" className="py-24 bg-zinc-900/30 border-y border-white/5">
         <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12">Built for Learners & Creators</h2>
            <div className="grid md:grid-cols-3 gap-6">
               {[
                 { name: "Rahul Sharma", role: "Student", text: "I pasted a 2-hour lecture link from YouTube, and it summarized the key points in seconds." },
                 { name: "Sarah Jenkins", role: "Content Creator", text: "I use it to research blogs. I just drop the URLs and ask for a synthesis. Magic." },
                 { name: "Amit Verma", role: "Researcher", text: "Finally, a tool that handles both my PDFs and the videos I watch for research." }
               ].map((review, i) => (
                 <div key={i} className="p-6 bg-black border border-zinc-800 rounded-xl hover:border-indigo-500/50 transition-all">
                    <div className="flex gap-1 text-yellow-500 mb-4">
                       {[1,2,3,4,5].map(s => <Star key={s} className="h-4 w-4 fill-yellow-500" />)}
                    </div>
                    <p className="text-zinc-300 mb-6 italic">&quot;{review.text}&quot;</p>
                    <div className="flex items-center gap-3">
                       <div className="h-10 w-10 bg-indigo-600 rounded-full flex items-center justify-center font-bold">
                          {review.name[0]}
                       </div>
                       <div>
                          <p className="font-bold text-sm">{review.name}</p>
                          <p className="text-zinc-500 text-xs">{review.role}</p>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </section>

      {/* --- CONTACT FORM --- */}
      <section id="contact" className="py-24 px-6 max-w-3xl mx-auto">
         <div className="bg-zinc-900/50 p-8 md:p-12 rounded-3xl border border-zinc-800 backdrop-blur-sm">
            <div className="text-center mb-10">
               <h2 className="text-3xl font-bold mb-2">Get in Touch</h2>
               <p className="text-zinc-400">Have a feature request? Let us know.</p>
            </div>
            
            <form className="space-y-6">
               <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <label className="text-sm font-medium text-zinc-300">Name</label>
                     <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                        <Input placeholder="John Doe" className="pl-10 bg-black border-zinc-800 focus:ring-indigo-500" />
                     </div>
                  </div>
                  <div className="space-y-2">
                     <label className="text-sm font-medium text-zinc-300">Email</label>
                     <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                        <Input placeholder="john@example.com" className="pl-10 bg-black border-zinc-800 focus:ring-indigo-500" />
                     </div>
                  </div>
               </div>
               
               <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Message</label>
                  <Textarea placeholder="How can we help you?" className="bg-black border-zinc-800 focus:ring-indigo-500 min-h-30" />
               </div>

               <Button className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl text-lg">
                  Send Message
               </Button>
            </form>
         </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-8 text-center text-zinc-600 text-sm border-t border-zinc-900 bg-black">
         <p>© 2024 SecondBrain AI. Built with ❤️ for the future.</p>
      </footer>
    </div>
  );
}