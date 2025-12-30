"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, CreditCard, Lock, ShieldCheck, ArrowLeft, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation"; // To read ?plan=pro

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false);
  
  // Mock Payment Function
  const handlePayment = () => {
    setLoading(true);
    setTimeout(() => {
        alert("Payment Gateway Integration Pending! (This is a Demo)");
        setLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white font-sans flex items-center justify-center p-6">
      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* LEFT: ORDER SUMMARY */}
        <div className="p-8">
            <Link href="/dashboard" className="text-zinc-500 hover:text-white flex items-center gap-2 text-sm mb-8 transition-colors">
                <ArrowLeft className="h-4 w-4" /> Back to Dashboard
            </Link>
            
            <h1 className="text-3xl font-bold mb-2">Upgrade to Pro Brain</h1>
            <p className="text-zinc-400 mb-8">Unlock the full potential of your second brain.</p>

            <div className="bg-[#18181b] border border-zinc-800 rounded-2xl p-6 mb-6">
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-zinc-800">
                    <div>
                        <h3 className="font-bold text-lg">Pro Plan Subscription</h3>
                        <p className="text-zinc-500 text-sm">Billed Monthly</p>
                    </div>
                    <span className="text-2xl font-bold">$19.00</span>
                </div>
                <ul className="space-y-3">
                    {["Unlimited Chats & Messages", "100k Context Window", "Priority Support", "Early Access to New Features"].map((item, i) => (
                        <li key={i} className="flex items-center gap-3 text-sm text-zinc-300">
                            <div className="h-5 w-5 rounded-full bg-indigo-500/20 flex items-center justify-center">
                                <Check className="h-3 w-3 text-indigo-400" />
                            </div>
                            {item}
                        </li>
                    ))}
                </ul>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-zinc-500">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                Secure 256-bit SSL Encrypted payment
            </div>
        </div>

        {/* RIGHT: PAYMENT FORM */}
        <div className="bg-[#18181b] border border-zinc-800 rounded-3xl p-8 shadow-2xl">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-indigo-500" /> Payment Details
            </h2>
            
            <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Email Address</label>
                    <input type="email" placeholder="you@example.com" className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors" />
                </div>
                
                <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Card Information</label>
                    <div className="space-y-3">
                        <input type="text" placeholder="0000 0000 0000 0000" className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors font-mono" />
                        <div className="grid grid-cols-2 gap-4">
                            <input type="text" placeholder="MM / YY" className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors text-center" />
                            <input type="text" placeholder="CVC" className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors text-center" />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Cardholder Name</label>
                    <input type="text" placeholder="Full Name on Card" className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors" />
                </div>

                <button 
                    onClick={handlePayment} 
                    disabled={loading}
                    className="w-full bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2"
                >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Lock className="h-4 w-4" /> Pay $19.00</>}
                </button>
            </form>
        </div>

      </div>
    </div>
  );
}