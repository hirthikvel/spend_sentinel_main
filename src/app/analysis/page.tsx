"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SerratedStripes } from "@/components/SerratedStripes";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { SearchPalette } from "@/components/SearchPalette";
import { Check, Lock } from "lucide-react";
import { motion } from "motion/react";

export default function AnalysisRunningPage() {
  const router = useRouter();
  const [currentMenu, setCurrentMenu] = useState("DASHBOARD");
  const [selectedRange, setSelectedRange] = useState("LAST 60 DAYS");
  const [searchOpen, setSearchOpen] = useState(false);
  const [progress, setProgress] = useState(68);
  const [currentStep, setCurrentStep] = useState(3);

  // Auto-progression for interactive simulation
  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress(100);
      setCurrentStep(4);
      const redirectTimer = setTimeout(() => {
        router.push("/anomalies");
      }, 1200);
      return () => clearTimeout(redirectTimer);
    }, 4000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <main
      className="fixed inset-0 w-screen h-screen bg-[#1f5ea5] overflow-hidden flex flex-col p-3 2xl:p-4 select-none font-sans"
      style={{ backgroundColor: "#1f5ea5" }}
    >
      {/* Background Graphic Elements: Diagonal Serrated Tape Stripes */}
      <SerratedStripes />

      {/* Main Full-Screen Layout */}
      <div className="relative z-10 w-full h-full flex gap-2.5 2xl:gap-3 overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1 h-full flex flex-col justify-between gap-2 2xl:gap-2.5 overflow-hidden"
        >
          {/* Top Bar */}
          <TopBar
            onOpenSearch={() => setSearchOpen(true)}
            selectedRange={selectedRange}
            onRangeChange={(range) => setSelectedRange(range)}
          />

          {/* Centred 760px Card with Faint Indigo Outline Glow on Top Edge Only */}
          <div className="flex-1 flex items-center justify-center p-3 overflow-y-auto">
            <div
              className="w-full max-w-[760px] panel-card bg-white p-6 2xl:p-8 select-none shadow-2xl relative font-sans"
              style={{
                boxShadow:
                  "0 25px 50px -12px rgba(12, 45, 84, 0.45), 0 -4px 16px -1px rgba(99, 102, 241, 0.4)",
              }}
            >
              {/* Faint Indigo Outline Glow on Top Edge Only */}
              <div
                className="absolute top-0 left-0 right-0 h-[2.5px] bg-indigo-500 rounded-t-lg shadow-[0_0_12px_rgba(99,102,241,0.6)]"
                aria-hidden="true"
              />

              {/* Title: Analysing your bill in bold Burbank font */}
              <h1 className="text-3xl 2xl:text-[38px] font-black uppercase text-black leading-tight mb-1 font-sans tracking-tight">
                Analysing your bill
              </h1>

              {/* Muted line: Step 3 of 4 */}
              <span className="text-xs 2xl:text-sm font-mono font-bold uppercase tracking-wider text-neutral-400 block mb-5">
                Step 3 of 4
              </span>

              {/* Wide Progress Bar: 68% full with rose fill, text '68%' at right end in mono */}
              <div className="flex items-center space-x-3.5 mb-7">
                <div className="flex-1 bg-neutral-100 rounded-sm h-3 2xl:h-3.5 relative overflow-hidden">
                  <div
                    className="h-full bg-[#cb7272] transition-all duration-700 rounded-sm"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="font-mono text-sm 2xl:text-base font-bold text-neutral-800 shrink-0">
                  {progress}%
                </span>
              </div>

              {/* Vertical List of Four Steps */}
              <div className="space-y-2.5 mb-8">
                {/* Step 1: sage check, "Cost anomalies", counter "3 found" */}
                <div className="flex items-center justify-between py-2.5 px-3.5 rounded-md hover:bg-neutral-50/60 transition-colors">
                  <div className="flex items-center space-x-3">
                    <span className="w-5 h-5 rounded-full bg-[#4ADE9A]/20 text-[#22c55e] flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    </span>
                    <span className="text-sm 2xl:text-base font-black uppercase text-black font-sans">
                      Cost anomalies
                    </span>
                  </div>
                  <span className="font-mono text-xs 2xl:text-sm font-bold text-neutral-700">
                    3 found
                  </span>
                </div>

                {/* Step 2: sage check, "Delta decomposition", counter "3 explained" */}
                <div className="flex items-center justify-between py-2.5 px-3.5 rounded-md hover:bg-neutral-50/60 transition-colors">
                  <div className="flex items-center space-x-3">
                    <span className="w-5 h-5 rounded-full bg-[#4ADE9A]/20 text-[#22c55e] flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    </span>
                    <span className="text-sm 2xl:text-base font-black uppercase text-black font-sans">
                      Delta decomposition
                    </span>
                  </div>
                  <span className="font-mono text-xs 2xl:text-sm font-bold text-neutral-700">
                    3 explained
                  </span>
                </div>

                {/* Step 3: rose pulsing dot, "Verdict classifier", counter "2 of 3". Faint rose background */}
                <div className="flex items-center justify-between py-2.5 px-3.5 rounded-md bg-[#fff5f5] border border-rose-100">
                  <div className="flex items-center space-x-3">
                    <span className="relative flex h-3 w-3 mx-1">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#cb7272] opacity-75" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-[#cb7272]" />
                    </span>
                    <span className="text-sm 2xl:text-base font-black uppercase text-black font-sans">
                      Verdict classifier
                    </span>
                  </div>
                  <span className="font-mono text-xs 2xl:text-sm font-bold text-[#cb7272]">
                    2 of 3
                  </span>
                </div>

                {/* Step 4: empty grey circle, "Idle resources", counter "Waiting" */}
                <div className="flex items-center justify-between py-2.5 px-3.5 rounded-md hover:bg-neutral-50/60 transition-colors">
                  <div className="flex items-center space-x-3">
                    {currentStep === 4 ? (
                      <span className="w-5 h-5 rounded-full bg-[#4ADE9A]/20 text-[#22c55e] flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      </span>
                    ) : (
                      <span className="w-4 h-4 rounded-full border-2 border-neutral-300 mx-0.5" />
                    )}
                    <span
                      className={`text-sm 2xl:text-base font-black uppercase font-sans ${
                        currentStep === 4 ? "text-black" : "text-neutral-400"
                      }`}
                    >
                      Idle resources
                    </span>
                  </div>
                  <span
                    className={`font-mono text-xs 2xl:text-sm font-bold ${
                      currentStep === 4 ? "text-neutral-700" : "text-neutral-400"
                    }`}
                  >
                    {currentStep === 4 ? "Completed" : "Waiting"}
                  </span>
                </div>
              </div>

              {/* Bottom Line: Small Lock Icon and Muted Line */}
              <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
                <div className="flex items-center text-xs 2xl:text-sm font-mono font-medium text-neutral-500">
                  <Lock className="w-3.5 h-3.5 text-neutral-400 mr-2 shrink-0 stroke-[1.5]" />
                  <span>Every number is written to the Evidence Ledger.</span>
                </div>

                {/* Interactive Direct Transition */}
                <button
                  type="button"
                  onClick={() => router.push("/anomalies")}
                  className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400 hover:text-[#1f5ea5] transition-colors cursor-pointer"
                >
                  Continue &rarr;
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Global Search Palette (Ctrl+K) */}
      <SearchPalette
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectResult={() => router.push("/dashboard")}
      />
    </main>
  );
}
