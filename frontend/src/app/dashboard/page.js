"use client";

import { useUser, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Brain, ArrowRight } from "lucide-react";

export default function DashboardPage() {
    const { user } = useUser();

    return (
        <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans flex flex-col">
            {/* NAVBAR */}
            <nav className="h-16 border-b border-zinc-800 flex items-center justify-between px-6 bg-[#09090b]">
                <Link href="/" className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-zinc-100 rounded-lg flex items-center justify-center"><Brain className="h-5 w-5 text-black" /></div>
                    <span className="font-bold text-lg tracking-tight">SecondBrain</span>
                </Link>
                <UserButton afterSignOutUrl="/" />
            </nav>

            {/* EMPTY STATE */}
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                <h1 className="text-3xl font-bold text-white mb-2">Welcome, {user?.firstName}!</h1>
                <p className="text-zinc-500 mb-8">Your dashboard is currently under construction. Head to the Brain to start.</p>
                
                <Link href="/chat">
                    <button className="bg-white text-black px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-zinc-200 transition-all">
                        Open Chat Interface <ArrowRight className="h-4 w-4" />
                    </button>
                </Link>
            </div>
        </div>
    );
}