"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ShieldCheck, LogIn } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  
  const router = useRouter();
  const supabase = createClient();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage("Success! Check your email for the confirmation link.");
    }
    setLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      router.push("/dashboard");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-6 font-mono">
      <div className="w-full max-w-md space-y-8 bg-neutral-900 p-8 rounded-lg border border-neutral-800 shadow-2xl">
        
        <div className="text-center space-y-2">
          <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto" />
          <h1 className="text-2xl font-bold tracking-tight">SoloSwitch Access</h1>
          <p className="text-sm text-neutral-400">Enter your credentials to manage your vault.</p>
        </div>

        <form className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs uppercase text-neutral-400 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded p-3 text-sm focus:border-emerald-500 focus:outline-none transition"
                placeholder="founder@startup.com"
                required
              />
            </div>
            <div>
              <label className="block text-xs uppercase text-neutral-400 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded p-3 text-sm focus:border-emerald-500 focus:outline-none transition"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {error && <p className="text-red-400 text-xs text-center">{error}</p>}
          {message && <p className="text-emerald-400 text-xs text-center">{message}</p>}

          <div className="flex gap-4 pt-2">
            <button
              onClick={handleSignIn}
              disabled={loading || !email || !password}
              className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-3 rounded text-sm transition disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" /> Sign In
            </button>
            <button
              onClick={handleSignUp}
              disabled={loading || !email || !password}
              className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white font-medium py-3 rounded text-sm transition disabled:opacity-50"
            >
              Sign Up
            </button>
          </div>
        </form>
        
      </div>
    </div>
  );
}