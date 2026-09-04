import Link from "next/link";
import { ShieldCheck, ArrowRight, LogIn } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-mono relative">
      
      {/* Top Nav */}
      <header className="w-full p-6 flex justify-end">
        <Link 
          href="/login" 
          className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition"
        >
          <LogIn className="w-4 h-4" /> Sign In
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center -mt-16">
        <ShieldCheck className="w-16 h-16 text-emerald-500 mb-8" />
        
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 max-w-4xl leading-tight">
          If you unexpectedly go offline, <br />
          <span className="text-emerald-500">who holds the keys to your business?</span>
        </h1>
        
        <p className="text-neutral-400 text-lg max-w-2xl mb-10 leading-relaxed">
          SoloSwitch is an encrypted zero-knowledge vault for solo founders. 
          Pass on your Stripe, AWS, and server credentials to your partner automatically if you go dark.
        </p>

        <Link 
          href="/login" 
          className="group flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-lg px-8 py-4 rounded transition"
        >
          Secure Your Vault ($59) <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
        
        <p className="text-neutral-600 text-sm mt-6">
          Pay once. Protected forever. Zero-knowledge encryption.
        </p>
      </main>

      {/* Footer (Right Aligned Legal Links) */}
      <footer className="w-full p-6 flex flex-col sm:flex-row justify-between items-center text-xs text-neutral-600 border-t border-neutral-900">
        <div className="mb-4 sm:mb-0">
          &copy; {new Date().getFullYear()} SoloSwitch. All rights reserved.
        </div>
        <div className="flex items-center gap-6">
          <Link href="/privacy" className="hover:text-neutral-400 transition">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-neutral-400 transition">
            Terms of Service
          </Link>
          <Link href="/refunds" className="hover:text-neutral-400 transition">
            Refund Policy
          </Link>
        </div>
      </footer>

    </div>
  );
}