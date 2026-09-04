import Link from "next/link";
import { ShieldAlert, ArrowRight, LogIn } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-mono relative">
      
      {/* Top Header for returning users */}
      <header className="w-full flex justify-end p-6 absolute top-0 right-0">
        <Link
          href="/login"
          className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition"
        >
          <LogIn className="w-4 h-4" /> Sign In
        </Link>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 mt-12 md:mt-0">
        <div className="max-w-2xl text-center space-y-8">
          
          <div className="flex justify-center">
            <ShieldAlert className="w-16 h-16 text-emerald-500" />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            If you get hit by a bus tomorrow, <span className="text-emerald-500">does your business die with you?</span>
          </h1>
          
          <p className="text-lg text-neutral-400">
            SoloSwitch is an encrypted Deadman's Vault for solo founders. Pass on your Stripe, AWS, and server credentials to your partner automatically if you go dark.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            {/* Redirects to Login/Signup now */}
            <Link 
              href="/login" 
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded font-bold text-lg transition"
            >
              Get Lifetime Access ($59) <ArrowRight className="w-5 h-5" />
            </Link>
            <p className="text-sm text-neutral-500 sm:hidden">Pay once. Protected forever.</p>
          </div>
          
          <p className="hidden sm:block text-sm text-neutral-500 pt-2">
            Pay once. Protected forever. Zero-knowledge encryption.
          </p>
        </div>
      </div>
    </div>
  );
}