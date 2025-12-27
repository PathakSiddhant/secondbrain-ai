import { Button } from "@/components/ui/button";
import { FileText, PlayCircle } from "lucide-react"; // Icons bhi daal diye!

export default function Home() {
return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 text-white gap-8 p-4">
      {/* Background Gradient Effect */}
      <div className="absolute top-0 z-[-2] h-screen w-screen bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />

      <div className="text-center space-y-4 max-w-3xl">
        <h1 className="text-6xl font-extrabold tracking-tight lg:text-8xl text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-cyan-400 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          SecondBrain AI
        </h1>
        <p className="text-xl text-zinc-400 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
          Supercharge your productivity. Chat with your PDFs, Videos, and Notes instantly using advanced RAG technology.
        </p>
      </div>
      
<div className="flex gap-4 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
        {/* Get Started Button (Indigo) */}
        <Button size="lg" className="text-lg px-8 bg-indigo-600 hover:bg-indigo-700 transition-all">
          <FileText className="mr-2 h-5 w-5" /> 
          Get Started
        </Button>
        
        {/* Watch Demo Button (White & Black - High Contrast) */}
        <Button 
          size="lg" 
          className="text-lg px-8 bg-white text-black hover:bg-zinc-200 transition-all"
        >
          <PlayCircle className="mr-2 h-5 w-5 text-black" /> 
          Watch Demo
        </Button>
      </div>
    </div>
  );
}