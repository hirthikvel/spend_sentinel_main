"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SerratedStripes } from "@/components/SerratedStripes";
import { Eye, EyeOff, Lock, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { signInWithSupabase, signUpWithSupabase, supabase } from "@/lib/supabase";
import { OrganizationType, ORGANIZATION_TYPES } from "@/lib/types";
import { motion } from "motion/react";

export default function SignInPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"signin" | "create_org">("signin");

  // Sign In Form State
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [showSignInPassword, setShowSignInPassword] = useState(false);

  // Create Organization Form State
  const [fullName, setFullName] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [orgName, setOrgName] = useState("");
  const [orgType, setOrgType] = useState<OrganizationType>("b2b_saas");
  const [setPassword, setSetPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCreatePassword, setShowCreatePassword] = useState(false);

  // Submission & Feedback State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmationSentTo, setConfirmationSentTo] = useState<string | null>(null);

  // 1. Auto-listen to Supabase Auth State changes so user is redirected immediately without reload!
  useEffect(() => {
    if (!supabase) return;

    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("signedOut") === "true") {
        return;
      }
    }

    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        router.push("/dashboard");
      }
    });

    // Listen for auth state transitions (such as clicking email confirmation link)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          router.push("/dashboard");
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  // 2. Poll session every 3 seconds if waiting for email confirmation to avoid forcing manual reload
  useEffect(() => {
    const client = supabase;
    if (!confirmationSentTo || !client) return;

    const interval = setInterval(async () => {
      const { data: { session } } = await client.auth.getSession();
      if (session?.user) {
        router.push("/dashboard");
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [confirmationSentTo, router]);

  // Handle Sign In submission
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const { data, error } = await signInWithSupabase(signInEmail, signInPassword);

    if (error) {
      setIsSubmitting(false);
      setErrorMessage(error.message || "Failed to sign in. Please verify your email and password.");
      return;
    }

    if (data?.user) {
      router.push("/dashboard");
    } else {
      setIsSubmitting(false);
      setErrorMessage("No active account found. Please check your credentials.");
    }
  };

  // Handle Create Organization submission
  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    if (setPassword !== confirmPassword) {
      setIsSubmitting(false);
      setErrorMessage("Passwords do not match. Please re-enter.");
      return;
    }

    if (setPassword.length < 6) {
      setIsSubmitting(false);
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    const { data, error, emailSent } = await signUpWithSupabase({
      name: fullName,
      email: createEmail,
      orgName: orgName,
      password: setPassword,
      orgType: orgType,
    });

    setIsSubmitting(false);

    if (error) {
      setErrorMessage(error.message || "Account creation failed. Please try again.");
      return;
    }

    if (emailSent) {
      setConfirmationSentTo(createEmail);
    } else if ((data as any)?.session) {
      router.push("/dashboard");
    } else {
      setConfirmationSentTo(createEmail);
    }
  };

  return (
    <main
      className="fixed inset-0 w-screen h-screen bg-[#1f5ea5] overflow-hidden flex flex-col justify-between select-none font-sans p-6 2xl:p-10 relative"
      style={{ backgroundColor: "#1f5ea5" }}
    >
      {/* Background Graphic Elements: Diagonal Serrated White Stripes */}
      <SerratedStripes />

      {/* Decorative 4-Point Sparkle Star at Bottom Right (as in reference image) */}
      <div className="absolute bottom-8 right-12 z-0 pointer-events-none opacity-40">
        <svg viewBox="0 0 24 24" className="w-14 h-14 text-white fill-current">
          <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5z" />
        </svg>
      </div>

      {/* ==================================================================== */}
      {/* TOP HEADER: Brand Logo & Title (Top-Left)                            */}
      {/* ==================================================================== */}
      <div className="relative z-10 flex items-center space-x-2.5">
        <div className="w-8 h-8 rounded-sm bg-white text-[#1f5ea5] flex items-center justify-center shadow-xs">
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
            <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm1 14h-2v-4H7v-2h4V6h2v4h4v2h-4v4z" />
          </svg>
        </div>
        <span className="text-xl 2xl:text-2xl font-black text-white uppercase tracking-wider font-sans">
          SPENDSENTINEL
        </span>
      </div>

      {/* ==================================================================== */}
      {/* MAIN CONTENT: Left Floating Graph Card + Right Floating Form Card     */}
      {/* ==================================================================== */}
      <div className="relative z-10 w-full flex-1 flex items-center justify-between gap-8 2xl:gap-14 my-auto max-w-[1720px] mx-auto">
        
        {/* ------------------------------------------------------------------ */}
        {/* LEFT COLUMN: Floating Telemetry Card + Bottom Punchy Typography    */}
        {/* ------------------------------------------------------------------ */}
        <div className="w-[58%] 2xl:w-[60%] flex flex-col justify-between space-y-6">
          
          {/* FLOATING WHITE CARD: DAILY TELEMETRY SPEND */}
          <div
            className="w-full bg-white rounded-2xl p-5 2xl:p-6 shadow-2xl border border-white/60 relative"
            style={{
              boxShadow: "0 25px 50px -12px rgba(12, 45, 84, 0.5), 0 10px 25px -5px rgba(12, 45, 84, 0.3)",
            }}
          >
            {/* Card Header: Title + Anomaly Badge */}
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm 2xl:text-base font-black tracking-wider text-black uppercase font-sans">
                DAILY TELEMETRY SPEND
              </h3>
              <div className="bg-[#fff3e8] border border-[#fcd34d] text-[#b45309] text-[10px] 2xl:text-xs font-black uppercase px-2.5 py-1 rounded-full flex items-center space-x-1 font-sans">
                <span className="text-amber-600">▲</span>
                <span>ANOMALY INCIDENT DETECTED</span>
              </div>
            </div>

            {/* Dark Blue Telemetry Graph Canvas */}
            <div className="relative w-full h-[220px] 2xl:h-[250px] bg-[#164a82] rounded-xl p-3 overflow-hidden">
              <svg viewBox="0 0 920 220" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                <defs>
                  {/* Cyan Glowing Fill Gradient */}
                  <linearGradient id="telemetryFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.45" />
                    <stop offset="70%" stopColor="#3b82f6" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.0" />
                  </linearGradient>

                  {/* Vertical Beam for the Anomaly Spike */}
                  <linearGradient id="anomalyBeam" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fef08a" stopOpacity="0.4" />
                    <stop offset="50%" stopColor="#ffffff" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Y-Axis Label Values inside the box */}
                <g fill="#93c5fd" opacity="0.65" fontSize="10" fontFamily="monospace" fontWeight="bold">
                  <text x="12" y="24">340</text>
                  <text x="12" y="54">310</text>
                  <text x="12" y="86">225</text>
                  <text x="12" y="118">175</text>
                  <text x="12" y="150">110</text>
                  <text x="12" y="180">60</text>
                  <text x="12" y="210">10</text>
                </g>

                {/* Faint Horizontal Grid Lines */}
                <line x1="45" y1="20" x2="910" y2="20" stroke="#2563eb" strokeOpacity="0.3" strokeWidth="1" />
                <line x1="45" y1="52" x2="910" y2="52" stroke="#2563eb" strokeOpacity="0.3" strokeWidth="1" />
                <line x1="45" y1="84" x2="910" y2="84" stroke="#2563eb" strokeOpacity="0.3" strokeWidth="1" />
                <line x1="45" y1="116" x2="910" y2="116" stroke="#2563eb" strokeOpacity="0.3" strokeWidth="1" />
                <line x1="45" y1="148" x2="910" y2="148" stroke="#2563eb" strokeOpacity="0.3" strokeWidth="1" />
                <line x1="45" y1="180" x2="910" y2="180" stroke="#2563eb" strokeOpacity="0.3" strokeWidth="1" />
                <line x1="45" y1="210" x2="910" y2="210" stroke="#2563eb" strokeOpacity="0.3" strokeWidth="1" />

                {/* Vertical Anomaly Glow Column behind the spike */}
                <polygon points="585,210 615,210 605,35 595,35" fill="url(#anomalyBeam)" />

                {/* Area Gradient under curve */}
                <path
                  d="M 45 180 
                     C 90 180, 105 130, 125 140 
                     C 150 152, 160 175, 185 178 
                     C 210 180, 235 155, 260 140 
                     C 285 125, 305 175, 335 175 
                     C 370 175, 395 180, 425 178 
                     C 460 176, 490 170, 520 172 
                     C 550 174, 575 160, 585 130 
                     C 592 100, 597 40, 600 35 
                     C 603 40, 608 100, 615 130 
                     C 625 160, 645 175, 675 172 
                     C 705 169, 735 155, 765 160 
                     C 795 165, 825 178, 855 174 
                     C 880 170, 895 172, 910 172 
                     L 910 215 L 45 215 Z"
                  fill="url(#telemetryFill)"
                />

                {/* Main Glowing White Spline Line */}
                <path
                  d="M 45 180 
                     C 90 180, 105 130, 125 140 
                     C 150 152, 160 175, 185 178 
                     C 210 180, 235 155, 260 140 
                     C 285 125, 305 175, 335 175 
                     C 370 175, 395 180, 425 178 
                     C 460 176, 490 170, 520 172 
                     C 550 174, 575 160, 585 130 
                     C 592 100, 597 40, 600 35 
                     C 603 40, 608 100, 615 130 
                     C 625 160, 645 175, 675 172 
                     C 705 169, 735 155, 765 160 
                     C 795 165, 825 178, 855 174 
                     C 880 170, 895 172, 910 172"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Anomaly Dot at Peak */}
                <circle cx="600" cy="35" r="5" fill="#fef08a" stroke="#ffffff" strokeWidth="2.5" />
              </svg>

              {/* Floating Tooltip Card above Peak */}
              <div
                className="absolute bg-white text-black px-3 py-1.5 rounded-lg shadow-xl border border-neutral-200 pointer-events-none"
                style={{
                  left: "65%",
                  top: "14px",
                  transform: "translateX(-50%)",
                }}
              >
                <p className="text-[11px] 2xl:text-xs font-black uppercase text-black font-sans leading-none">
                  EC2 US-WEST-2
                </p>
                <p className="text-[11px] 2xl:text-xs font-black font-mono text-black leading-none mt-1">
                  +$285
                </p>
              </div>
            </div>

            {/* X-Axis Dates beneath dark graph */}
            <div className="flex items-center justify-between mt-2.5 px-3 text-[9px] 2xl:text-[10px] text-neutral-400 font-mono font-bold tracking-tight">
              <span>Sep 17</span>
              <span>Sep 19</span>
              <span>Sep 21</span>
              <span>Sep 23</span>
              <span>Sep 25</span>
              <span>Sep 27</span>
              <span>Sep 29</span>
              <span>Oct 01</span>
              <span>Oct 03</span>
              <span>Oct 05</span>
              <span>Oct 07</span>
              <span>Oct 09</span>
              <span>Oct 11</span>
              <span>Oct 13</span>
              <span>Oct 15</span>
            </div>
          </div>

          {/* Bottom Left Punchy Brand Slogan */}
          <div className="space-y-1">
            <h1 className="text-3xl 2xl:text-4xl font-black text-white uppercase tracking-tight font-sans leading-tight">
              EVERY COST JUMP, EXPLAINED AND PROVEN.
            </h1>
            <p className="text-xs 2xl:text-sm font-bold uppercase tracking-wider text-blue-200 font-sans">
              UPLOAD YOUR CLOUD BILL. SEE WHY IT GREW WITH MATHEMATICAL ATTRIBUTION.
            </p>
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* RIGHT COLUMN: Floating White Authentication Card                   */}
        {/* ------------------------------------------------------------------ */}
        <div className="w-[38%] 2xl:w-[36%] max-w-[460px] 2xl:max-w-[490px]">
          <div
            className="w-full bg-white rounded-2xl p-7 2xl:p-9 shadow-2xl relative font-sans border border-white/60"
            style={{
              boxShadow: "0 25px 50px -12px rgba(12, 45, 84, 0.5), 0 10px 25px -5px rgba(12, 45, 84, 0.3)",
            }}
          >
            {/* Title */}
            <h2 className="text-2xl 2xl:text-3xl font-black text-black uppercase tracking-tight leading-none mb-4 font-sans">
              {activeTab === "signin" ? "WELCOME BACK" : "CREATE ORGANIZATION"}
            </h2>

            {/* Navigation Tabs: SIGN IN | CREATE ORGANIZATION */}
            <div className="flex border-b border-neutral-200 mb-5">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("signin");
                  setErrorMessage(null);
                  setConfirmationSentTo(null);
                }}
                className={`pb-2.5 px-2 mr-6 text-sm 2xl:text-base font-black uppercase tracking-wider transition-colors relative font-sans cursor-pointer ${
                  activeTab === "signin"
                    ? "text-black border-b-[3px] border-black -mb-[2px]"
                    : "text-neutral-400 hover:text-black"
                }`}
              >
                SIGN IN
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("create_org");
                  setErrorMessage(null);
                  setConfirmationSentTo(null);
                }}
                className={`pb-2.5 px-2 text-sm 2xl:text-base font-black uppercase tracking-wider transition-colors relative font-sans cursor-pointer ${
                  activeTab === "create_org"
                    ? "text-black border-b-[3px] border-black -mb-[2px]"
                    : "text-neutral-400 hover:text-black"
                }`}
              >
                CREATE ORGANIZATION
              </button>
            </div>

            {/* Error Message Notice */}
            {errorMessage && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-xs font-bold flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Confirmation Email Sent Screen */}
            {confirmationSentTo ? (
              <div className="space-y-4 py-2">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded text-emerald-900 space-y-2">
                  <div className="flex items-center space-x-2 text-emerald-700 font-black text-sm uppercase">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Confirmation Email Sent</span>
                  </div>
                  <p className="text-xs leading-relaxed text-emerald-800 font-sans">
                    Verification link dispatched to <strong className="font-mono">{confirmationSentTo}</strong>.
                    Please confirm your email. Our system is auto-detecting verification.
                  </p>
                  <div className="flex items-center space-x-2 text-[11px] font-mono text-emerald-600 pt-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span>Listening for verification link click...</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSignInEmail(confirmationSentTo);
                    setActiveTab("signin");
                    setConfirmationSentTo(null);
                  }}
                  className="w-full py-2.5 bg-[#f87171] hover:bg-[#ef4444] text-black font-black text-xs 2xl:text-sm uppercase tracking-wider rounded transition-all shadow-xs cursor-pointer font-sans"
                >
                  Return to Sign In
                </button>
              </div>
            ) : activeTab === "signin" ? (
              /* ==================== SIGN IN FORM ==================== */
              <form onSubmit={handleSignIn} className="space-y-3.5">
                {/* Email */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-black mb-1 font-sans">
                    EMAIL
                  </label>
                  <input
                    type="email"
                    required
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-md text-sm font-bold text-black placeholder-neutral-400 font-sans focus:outline-none focus:border-[#1f5ea5] transition-colors"
                  />
                </div>

                {/* Password with Eye toggle */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-black mb-1 font-sans">
                    PASSWORD
                  </label>
                  <div className="relative">
                    <input
                      type={showSignInPassword ? "text" : "password"}
                      required
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-md text-sm font-bold text-black placeholder-neutral-400 font-sans focus:outline-none focus:border-[#1f5ea5] pr-10 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignInPassword(!showSignInPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black transition-colors cursor-pointer"
                      title={showSignInPassword ? "Hide password" : "Show password"}
                    >
                      {showSignInPassword ? (
                        <EyeOff className="w-4 h-4 stroke-[1.5]" />
                      ) : (
                        <Eye className="w-4 h-4 stroke-[1.5]" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Sign In Button: Coral Pink matching screenshot */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-[#f87171] hover:bg-[#ef4444] active:bg-[#dc2626] text-black font-black text-sm 2xl:text-base uppercase tracking-wider rounded-md transition-all shadow-xs cursor-pointer flex items-center justify-center space-x-2 font-sans mt-2"
                >
                  <span>{isSubmitting ? "AUTHENTICATING..." : "SIGN IN →"}</span>
                </button>
              </form>
            ) : (
              /* ==================== CREATE ORGANIZATION FORM ==================== */
              <form onSubmit={handleCreateAccount} className="space-y-3">
                {/* 1. Name */}
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-black mb-1 font-sans">
                    NAME
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full px-3.5 py-2 border border-neutral-300 rounded-md text-sm font-bold text-black placeholder-neutral-400 font-sans focus:outline-none focus:border-[#1f5ea5] transition-colors"
                  />
                </div>

                {/* 2. Email */}
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-black mb-1 font-sans">
                    EMAIL
                  </label>
                  <input
                    type="email"
                    required
                    value={createEmail}
                    onChange={(e) => setCreateEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full px-3.5 py-2 border border-neutral-300 rounded-md text-sm font-bold text-black placeholder-neutral-400 font-sans focus:outline-none focus:border-[#1f5ea5] transition-colors"
                  />
                </div>

                {/* 3. Organisation name */}
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-black mb-1 font-sans">
                    ORGANISATION NAME
                  </label>
                  <input
                    type="text"
                    required
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="e.g. Northwind Labs"
                    className="w-full px-3.5 py-2 border border-neutral-300 rounded-md text-sm font-bold text-black placeholder-neutral-400 font-sans focus:outline-none focus:border-[#1f5ea5] transition-colors"
                  />
                </div>

                {/* Organisation Type */}
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-black mb-1 font-sans">
                    ORGANISATION TYPE
                  </label>
                  <select
                    value={orgType}
                    onChange={(e) => setOrgType(e.target.value as OrganizationType)}
                    className="w-full px-3.5 py-2 border border-neutral-300 rounded-md text-sm font-bold text-black font-sans bg-white focus:outline-none focus:border-[#1f5ea5] transition-colors"
                  >
                    {ORGANIZATION_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label} ({t.description.split("(")[1]?.replace(")", "") || t.value})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 4. Set password */}
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-black mb-1 font-sans">
                    SET PASSWORD
                  </label>
                  <div className="relative">
                    <input
                      type={showCreatePassword ? "text" : "password"}
                      required
                      value={setPassword}
                      onChange={(e) => setSetPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full px-3.5 py-2 border border-neutral-300 rounded-md text-sm font-bold text-black placeholder-neutral-400 font-sans focus:outline-none focus:border-[#1f5ea5] pr-10 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCreatePassword(!showCreatePassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black transition-colors cursor-pointer"
                    >
                      {showCreatePassword ? (
                        <EyeOff className="w-4 h-4 stroke-[1.5]" />
                      ) : (
                        <Eye className="w-4 h-4 stroke-[1.5]" />
                      )}
                    </button>
                  </div>
                </div>

                {/* 5. Confirm password */}
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-black mb-1 font-sans">
                    CONFIRM PASSWORD
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-3.5 py-2 border border-neutral-300 rounded-md text-sm font-bold text-black placeholder-neutral-400 font-sans focus:outline-none focus:border-[#1f5ea5] transition-colors"
                  />
                </div>

                {/* Password strength bar */}
                <div className="space-y-1 pt-0.5">
                  <div className="flex space-x-1.5 h-1.5 w-full">
                    <div className="w-1/4 h-full rounded-full bg-amber-400" />
                    <div className="w-1/4 h-full rounded-full bg-neutral-200" />
                    <div className="w-1/4 h-full rounded-full bg-neutral-200" />
                    <div className="w-1/4 h-full rounded-full bg-neutral-200" />
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500">
                    12 CHARACTERS OR MORE
                  </span>
                </div>

                {/* Create Org Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-[#f87171] hover:bg-[#ef4444] active:bg-[#dc2626] text-black font-black text-sm uppercase tracking-wider rounded-md transition-all shadow-xs cursor-pointer flex items-center justify-center space-x-2 font-sans mt-2"
                >
                  <span>{isSubmitting ? "CREATING..." : "CREATE ORGANIZATION →"}</span>
                </button>
              </form>
            )}

            {/* Bottom Footer: Row Level Security & Supabase Connected */}
            <div className="mt-5 pt-3 border-t border-neutral-100 flex items-center justify-center space-x-1.5 text-neutral-500 text-[10px] 2xl:text-[11px] font-mono font-bold uppercase tracking-wider">
              <Lock className="w-3.5 h-3.5 text-neutral-400 stroke-[2]" />
              <span>ROW LEVEL SECURITY & SUPABASE CONNECTED</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
