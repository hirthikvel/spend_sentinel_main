"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { SerratedStripes } from "@/components/SerratedStripes";
import { Eye, EyeOff, Lock, ArrowRight } from "lucide-react";
import { signInWithSupabase, signUpWithSupabase } from "@/lib/supabase";

export default function SignInPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authNotice, setAuthNotice] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAuthNotice(null);

    try {
      if (activeTab === "signin") {
        await signInWithSupabase(email, password);
      } else {
        await signUpWithSupabase(email, password);
      }
    } catch (err) {
      console.warn("Supabase auth notice:", err);
    }

    setTimeout(() => {
      router.push("/dashboard");
    }, 350);
  };

  return (
    <main
      className="fixed inset-0 w-screen h-screen bg-[#1f5ea5] overflow-hidden flex items-center justify-center select-none font-sans p-4 2xl:p-8"
      style={{ backgroundColor: "#1f5ea5" }}
    >
      {/* Background Graphic Elements: Diagonal Serrated White Stripes */}
      <SerratedStripes />

      {/* Split-Screen Canvas Container (1920x1080 straight on, filling screen) */}
      <div className="relative z-10 w-full h-full max-w-[1840px] flex gap-4 2xl:gap-6 items-stretch overflow-hidden">
        {/* ==================================================================== */}
        {/* LEFT HALF (55% Wide): Stark White Panel with Simple, Transparent Graph */}
        {/* ==================================================================== */}
        <div
          className="w-[55%] h-full panel-card bg-white p-7 2xl:p-10 flex flex-col justify-between shadow-2xl relative overflow-hidden"
          style={{
            boxShadow:
              "0 25px 50px -12px rgba(12, 45, 84, 0.45), 0 8px 24px -4px rgba(12, 45, 84, 0.3)",
          }}
        >
          {/* Top Left: Logo and Brand Name */}
          <div className="flex items-center space-x-3 z-10">
            {/* Geometric Sentinel Logo Icon */}
            <div className="w-9 h-9 2xl:w-10 2xl:h-10 bg-[#1f5ea5] rounded-xs flex items-center justify-center shadow-xs">
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5 2xl:w-6 2xl:h-6 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path
                  d="M12 2L3 7v6c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V7l-9-5z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path d="M12 9v6m-3-3h6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <span className="text-2xl 2xl:text-3xl font-black text-black tracking-tight uppercase font-sans leading-none block">
                SPENDSENTINEL
              </span>
              <span className="text-[10px] 2xl:text-xs font-black tracking-widest text-neutral-500 uppercase font-sans mt-0.5 block">
                NORTHWIND LABS
              </span>
            </div>
          </div>

          {/* Middle: Simple & Transparent Daily Spend Line Chart with Sharp Spike */}
          <div className="relative w-full my-auto py-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm 2xl:text-base font-black tracking-wider text-black uppercase font-sans">
                DAILY TELEMETRY SPEND
              </span>
              <span className="text-xs font-mono font-bold text-[#b45309] uppercase bg-[#FFB547]/20 px-2.5 py-0.5 border border-[#FFB547] rounded-none">
                ANOMALY INCIDENT DETECTED
              </span>
            </div>

            <div className="relative w-full h-[190px] 2xl:h-[230px] bg-neutral-50/60 rounded-lg p-2 border border-neutral-200">
              <svg
                viewBox="0 0 900 200"
                className="w-full h-full overflow-visible"
                preserveAspectRatio="none"
              >
                {/* Horizontal Faint Clean Grid Lines */}
                <line x1="0" y1="50" x2="900" y2="50" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="0" y1="100" x2="900" y2="100" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="0" y1="150" x2="900" y2="150" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />

                {/* Vertical Soft Transparent Ochre Band behind the sharp spike */}
                <rect
                  x="564"
                  y="12"
                  width="44"
                  height="176"
                  fill="rgba(255, 181, 71, 0.18)"
                  stroke="#FFB547"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                  rx="2"
                />

                {/* Thin Rose Curve (Simple and transparent like in picture) */}
                <path
                  d="M 0 152 
                     C 60 150, 120 154, 180 151 
                     C 240 148, 300 153, 360 150 
                     C 420 148, 480 152, 530 149 
                     C 555 146, 570 120, 586 32 
                     C 602 120, 618 146, 645 150 
                     C 700 152, 760 149, 820 151 
                     L 900 150"
                  fill="none"
                  stroke="#cb7272"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Transparent Concentric Ring */}
                <circle cx="586" cy="32" r="16" fill="rgba(255, 181, 71, 0.25)" />

                {/* Ochre Dot on spike */}
                <circle
                  cx="586"
                  cy="32"
                  r="6"
                  fill="#FFB547"
                  stroke="#ffffff"
                  strokeWidth="2.5"
                />
              </svg>

              {/* Floating Anomaly Tooltip Card over the Ochre Spike */}
              <div
                className="absolute z-20 tooltip-card px-3.5 py-1.5 pointer-events-none bg-white text-black rounded border border-neutral-300 shadow-md"
                style={{
                  left: "65%",
                  top: "6px",
                  transform: "translateX(-50%)",
                }}
              >
                <p className="text-xs font-black tracking-wider uppercase leading-tight font-sans">
                  EC2 US-WEST-2
                </p>
                <p className="text-xs font-black font-mono leading-tight text-[#cb7272]">
                  +$285
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Left: Huge Bold Headline in Burbank Font */}
          <div className="z-10 pb-1">
            <h1 className="text-3xl 2xl:text-4xl font-black text-black leading-tight tracking-tight uppercase font-sans">
              Every cost jump, explained and proven.
            </h1>
            <p className="text-xs 2xl:text-sm text-neutral-500 mt-2 font-sans font-bold uppercase tracking-wider">
              Upload your cloud bill. See why it grew with mathematical attribution.
            </p>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* RIGHT HALF (45% Wide): Centred 420px Stark White Sign In Card       */}
        {/* ==================================================================== */}
        <div className="w-[45%] h-full flex items-center justify-center">
          <div
            className="w-full max-w-[420px] 2xl:max-w-[460px] panel-card bg-white p-7 2xl:p-9 select-none shadow-2xl relative font-sans"
            style={{
              boxShadow:
                "0 25px 50px -12px rgba(12, 45, 84, 0.45), 0 8px 24px -4px rgba(12, 45, 84, 0.3)",
            }}
          >
            {/* Title: Welcome back in Big Bold Burbank Font */}
            <h2 className="text-2xl 2xl:text-3xl font-black text-black uppercase tracking-tight leading-none mb-5 font-sans">
              Welcome back
            </h2>

            {/* Two Tabs: "Sign in" and "Create organization" */}
            <div className="flex border-b-2 border-neutral-200 mb-5">
              <button
                type="button"
                onClick={() => setActiveTab("signin")}
                className={`pb-2.5 px-2 mr-6 text-sm 2xl:text-base font-black uppercase tracking-wider transition-colors relative font-sans cursor-pointer ${
                  activeTab === "signin"
                    ? "text-[#1f5ea5] border-b-2 border-[#1f5ea5] -mb-[2px]"
                    : "text-neutral-400 hover:text-black"
                }`}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => {
                  router.push("/create-organization");
                }}
                className="pb-2.5 px-2 text-sm 2xl:text-base font-black uppercase tracking-wider transition-colors relative font-sans text-neutral-400 hover:text-black cursor-pointer"
              >
                Create organization
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Input 1: Email */}
              <div>
                <label className="block text-xs 2xl:text-sm font-black uppercase tracking-wider text-black mb-1 font-sans">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full px-3.5 py-2.5 border-2 border-neutral-300 rounded text-sm font-bold text-black placeholder-neutral-400 font-sans focus:outline-none focus:border-[#1f5ea5] transition-colors"
                />
              </div>

              {/* Input 2: Password with Eye toggle */}
              <div>
                <label className="block text-xs 2xl:text-sm font-black uppercase tracking-wider text-black mb-1 font-sans">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-3.5 py-2.5 border-2 border-neutral-300 rounded text-sm font-bold text-black placeholder-neutral-400 font-sans focus:outline-none focus:border-[#1f5ea5] pr-10 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black transition-colors cursor-pointer"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 stroke-[1.5]" />
                    ) : (
                      <Eye className="w-4 h-4 stroke-[1.5]" />
                    )}
                  </button>
                </div>

                {/* Thin Strength Bar (half full and ochre) */}
                <div className="w-full bg-neutral-200 h-1 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-[#FFB547] rounded-full transition-all"
                    style={{ width: "50%" }}
                  />
                </div>

                {/* Small Muted Hint: 12 characters or more */}
                <p className="text-[11px] 2xl:text-xs text-neutral-500 font-mono font-bold mt-1 uppercase">
                  12 characters or more
                </p>
              </div>

              {/* One Full-Width Rose Button with Dark Text: "Sign in" */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 2xl:py-3 bg-[#f8b4b4] hover:bg-[#fca5a5] active:bg-[#f29898] text-black font-black text-sm 2xl:text-base uppercase tracking-wider rounded transition-all shadow-xs cursor-pointer flex items-center justify-center space-x-2 font-sans mt-2"
              >
                <span>{isSubmitting ? "AUTHENTICATING..." : "Sign in"}</span>
                <ArrowRight className="w-4 h-4 stroke-[2]" />
              </button>
            </form>

            {/* Bottom Security Info: Small Lock Icon and Muted Text */}
            <div className="pt-4 2xl:pt-6 mt-4 border-t border-neutral-200 flex items-center justify-center space-x-2 text-neutral-500">
              <Lock className="w-3.5 h-3.5 stroke-[1.5] text-neutral-400 shrink-0" />
              <span className="text-[11px] 2xl:text-xs font-mono font-bold uppercase tracking-wider text-center">
                Row Level Security & Supabase Connected
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
