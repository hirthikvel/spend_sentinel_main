"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { SerratedStripes } from "@/components/SerratedStripes";
import { Database, Upload, ArrowRight } from "lucide-react";
import { createOrganizationInSupabase } from "@/lib/supabase";

export default function CreateOrganizationPage() {
  const router = useRouter();
  const [teamName, setTeamName] = useState("Northwind Labs");
  const [selectedOption, setSelectedOption] = useState<"demo" | "upload">("demo");
  const [isContinuing, setIsContinuing] = useState(false);

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsContinuing(true);
    try {
      await createOrganizationInSupabase(teamName);
    } catch (err) {
      console.warn("Supabase organization create notice:", err);
    }
    setTimeout(() => {
      if (selectedOption === "upload") {
        router.push("/upload");
      } else {
        router.push("/dashboard");
      }
    }, 200);
  };

  return (
    <main
      className="fixed inset-0 w-screen h-screen bg-[#1f5ea5] overflow-hidden flex flex-col justify-between p-4 2xl:p-6 select-none font-sans"
      style={{ backgroundColor: "#1f5ea5" }}
    >
      {/* Background Graphic Elements: Diagonal Serrated Tape Stripes */}
      <SerratedStripes />

      {/* Top Bar: Show ONLY the top bar with the logo (No sidebar) */}
      <header className="relative z-10 w-full max-w-[1760px] mx-auto h-14 2xl:h-16 panel-card bg-white px-6 2xl:px-8 flex items-center justify-between shadow-lg">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 2xl:w-9 2xl:h-9 bg-[#1f5ea5] rounded-xs flex items-center justify-center shadow-xs">
            <svg viewBox="0 0 24 24" className="w-4 h-4 2xl:w-5 2xl:h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2L3 7v6c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V7l-9-5z" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 9v6m-3-3h6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <span className="text-xl 2xl:text-2xl font-black text-black tracking-tight uppercase font-sans leading-none block">
              SPENDSENTINEL
            </span>
            <span className="text-[9px] 2xl:text-[10px] font-black tracking-widest text-neutral-500 uppercase font-sans block">
              NORTHWIND LABS
            </span>
          </div>
        </div>

        {/* Back Link to Sign In */}
        <button
          type="button"
          onClick={() => router.push("/signin")}
          className="text-xs 2xl:text-sm font-black uppercase tracking-wider text-neutral-600 hover:text-[#1f5ea5] transition-colors"
        >
          BACK TO SIGN IN
        </button>
      </header>

      {/* Centred Main Card: Exactly 720 pixels wide */}
      <div className="relative z-10 flex-1 flex items-center justify-center py-2">
        <div
          className="w-full max-w-[720px] panel-card bg-white p-6 2xl:p-8 select-none shadow-2xl relative font-sans"
          style={{
            boxShadow: "0 25px 50px -12px rgba(12, 45, 84, 0.45), 0 8px 24px -4px rgba(12, 45, 84, 0.3)",
          }}
        >
          {/* Step 1 of 2 */}
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400 block mb-0.5">
            Step 1 of 2
          </span>

          {/* Title: Name your team in bold Burbank font */}
          <h1 className="text-3xl 2xl:text-[38px] font-black uppercase text-black leading-none mb-4 font-sans tracking-tight">
            Name your team
          </h1>

          <form onSubmit={handleContinue}>
            {/* Input: Team Name */}
            <div className="mb-4">
              <label className="block text-sm font-black uppercase tracking-wider text-black mb-1.5 font-sans">
                Team name
              </label>
              <input
                type="text"
                required
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Team name"
                className="w-full px-4 py-2.5 2xl:py-3 border-2 border-neutral-300 rounded text-base font-bold text-black font-sans focus:outline-none focus:border-[#1f5ea5] transition-colors"
              />
            </div>

            {/* Muted line: Choose how to start */}
            <p className="text-sm font-black uppercase tracking-wider text-neutral-500 mb-2.5 font-sans">
              Choose how to start.
            </p>

            {/* Two large option cards side by side, each 320 pixels wide */}
            <div className="grid grid-cols-2 gap-3.5 mb-6">
              {/* Left Card: Load demo data (320px wide) */}
              <div
                onClick={() => setSelectedOption("demo")}
                className={`w-full max-w-[320px] p-4 2xl:p-5 rounded-lg border-2 cursor-pointer transition-all flex flex-col justify-between relative ${
                  selectedOption === "demo"
                    ? "border-[#cb7272] bg-[#fffaf9] shadow-xs"
                    : "border-neutral-300 hover:border-neutral-400 bg-white"
                }`}
              >
                {/* Small rose tag: Recommended */}
                <div className="flex items-center justify-between mb-2.5">
                  <Database
                    className={`w-6 h-6 stroke-[1.5] ${
                      selectedOption === "demo" ? "text-[#cb7272]" : "text-neutral-700"
                    }`}
                  />
                  <span className="px-2.5 py-0.5 rounded-full bg-[#f8b4b4] text-black text-[10px] font-black uppercase tracking-wider font-sans">
                    Recommended
                  </span>
                </div>

                <div>
                  <h3 className="text-base 2xl:text-lg font-black uppercase tracking-wide text-black font-sans leading-snug">
                    Load demo data
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1 font-sans leading-relaxed">
                    60 days of sample AWS billing. Ready in 10 seconds.
                  </p>
                </div>
              </div>

              {/* Right Card: Upload my bill (320px wide) */}
              <div
                onClick={() => {
                  setSelectedOption("upload");
                  // Instant navigation or selection
                  router.push("/upload");
                }}
                className={`w-full max-w-[320px] p-4 2xl:p-5 rounded-lg border-2 cursor-pointer transition-all flex flex-col justify-between relative ${
                  selectedOption === "upload"
                    ? "border-[#cb7272] bg-[#fffaf9] shadow-xs"
                    : "border-neutral-300 hover:border-neutral-400 bg-white"
                }`}
              >
                <div className="flex items-center justify-between mb-2.5">
                  <Upload
                    className={`w-6 h-6 stroke-[1.5] ${
                      selectedOption === "upload" ? "text-[#cb7272]" : "text-neutral-700"
                    }`}
                  />
                </div>

                <div>
                  <h3 className="text-base 2xl:text-lg font-black uppercase tracking-wide text-black font-sans leading-snug">
                    Upload my bill
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1 font-sans leading-relaxed">
                    CSV from AWS, or any provider.
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Right: One rose button "Continue" */}
            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={isContinuing}
                className="px-8 py-2.5 2xl:py-3 bg-[#f8b4b4] hover:bg-[#fca5a5] active:bg-[#f29898] text-black font-black text-sm 2xl:text-base uppercase tracking-wider rounded transition-all shadow-xs cursor-pointer flex items-center space-x-2 font-sans"
              >
                <span>{isContinuing ? "PREPARING..." : "Continue"}</span>
                <ArrowRight className="w-4 h-4 stroke-[2]" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Subtle Bottom Footer */}
      <footer className="relative z-10 text-center text-[11px] font-mono font-bold text-white/40 uppercase">
        SPENDSENTINEL ORGANISATION SETUP • STEP 1 OF 2
      </footer>
    </main>
  );
}
