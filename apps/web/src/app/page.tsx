"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Mail, Lock, Loader2, ArrowRight, Sparkles, AlertCircle } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setIsLoading(false);
    } else {
      router.push('/practice');
      router.refresh();
    }
  };

  return (
    <main className="min-h-screen w-full flex flex-col lg:flex-row">
      {/* ─── LEFT PANEL: Hero / Branding ─── */}
      <div className="relative w-full lg:w-1/2 min-h-[400px] lg:min-h-screen flex items-center justify-center p-8 md:p-16 overflow-hidden">
        {/* Deep navy gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#001a3d] via-[#003265] to-[#00488d]" />

        {/* Subtle radial light accent */}
        <div className="absolute top-[20%] right-[10%] w-[60%] h-[60%] rounded-full bg-[#1a5fad]/20 blur-[100px]" />
        <div className="absolute bottom-[10%] left-[20%] w-[40%] h-[40%] rounded-full bg-[#0066cc]/15 blur-[80px]" />

        {/* Hero Card */}
        <div className="relative z-10 max-w-md w-full">
          {/* Mentorship Active Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 mb-8">
            <Sparkles className="w-4 h-4 text-[#acf0dd]" />
            <span className="text-xs font-bold uppercase tracking-[0.1em] text-[#acf0dd]">
              Mentorship Active
            </span>
          </div>

          {/* Hero Headline */}
          <h1 className="font-manrope text-5xl md:text-6xl font-extrabold text-white leading-[1.05] tracking-tight mb-6">
            Step into<br />Character.
          </h1>

          {/* Subtext */}
          <p className="text-white/60 text-base md:text-lg leading-relaxed max-w-sm mb-10">
            Master your craft with the precision of AI-driven feedback. Refine every nuance, analyze every line, and deliver the performance of a lifetime.
          </p>

          {/* Avatars + Social Proof */}
          <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#a8c8ff] to-[#003265] ring-2 ring-[#001a3d] flex items-center justify-center text-xs font-bold text-white">
                A
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#acf0dd] to-[#005143] ring-2 ring-[#001a3d] flex items-center justify-center text-xs font-bold text-white">
                M
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ffb4ab] to-[#6c0005] ring-2 ring-[#001a3d] flex items-center justify-center text-xs font-bold text-white">
                K
              </div>
            </div>
            <span className="text-white/40 text-sm">
              Joined by many performers worldwide
            </span>
          </div>
        </div>
      </div>

      {/* ─── RIGHT PANEL: Login Form ─── */}
      <div className="w-full lg:w-1/2 min-h-screen flex items-center justify-center p-8 md:p-16 bg-surface-container-lowest">
        <div className="w-full max-w-sm">
          {/* Heading */}
          <div className="mb-10">
            <h2 className="font-manrope text-3xl font-bold tracking-tight text-on-surface mb-2">
              Welcome Back, Artist.
            </h2>
            <p className="text-on-surface-variant text-base">
              Your virtual stage is ready for rehearsal.
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-[#6c0005]/10 text-[#6c0005] text-sm font-medium p-4 rounded-xl flex items-center gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-[11px] font-bold uppercase tracking-[0.08em] text-on-surface-variant"
              >
                Email Address
              </label>
              <div className="relative group">
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@talent-agency.com"
                  required
                  className="w-full bg-surface-container-high/60 text-on-surface placeholder:text-on-surface-variant/40 rounded-2xl px-5 py-4 pr-12 text-[15px] transition-all duration-200 focus:bg-surface-container-lowest focus:shadow-[0_0_0_1.5px_rgba(0,50,101,0.15)] focus:outline-none"
                />
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-on-surface-variant/30 group-focus-within:text-primary transition-colors" />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-[11px] font-bold uppercase tracking-[0.08em] text-on-surface-variant"
              >
                Password
              </label>
              <div className="relative group">
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  className="w-full bg-surface-container-high/60 text-on-surface placeholder:text-on-surface-variant/40 rounded-2xl px-5 py-4 pr-12 text-[15px] transition-all duration-200 focus:bg-surface-container-lowest focus:shadow-[0_0_0_1.5px_rgba(0,50,101,0.15)] focus:outline-none"
                />
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-on-surface-variant/30 group-focus-within:text-primary transition-colors" />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 bg-on-surface text-surface-container-lowest rounded-full font-manrope font-bold text-[15px] tracking-wide shadow-lg shadow-on-surface/10 hover:shadow-xl hover:shadow-on-surface/15 hover:bg-[#2e3035] transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2.5"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>



        </div>
      </div>
    </main>
  );
}
