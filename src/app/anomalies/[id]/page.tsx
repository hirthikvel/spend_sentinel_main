"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SerratedStripes } from "@/components/SerratedStripes";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { SearchPalette } from "@/components/SearchPalette";
import { VerdictBadge } from "@/components/VerdictBadge";
import { EvidenceChip } from "@/components/EvidenceChip";
import { ChevronDown, ArrowLeft } from "lucide-react";

export default function AnomalyDetailPage() {
  const router = useRouter();
  const [currentMenu, setCurrentMenu] = useState("ANOMALIES");
  const [selectedRange, setSelectedRange] = useState("LAST 60 DAYS");
  const [activeTab, setActiveTab] = useState<"Resource" | "Usage type" | "Tag">("Resource");
  const [status, setStatus] = useState<"Open" | "Investigating" | "Resolved">("Open");
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedChip, setSelectedChip] = useState<string | null>(null);

  // Waterfall Chart data: Expected ($29) + gpu-01 (+$95) + gpu-02 (+$95) + gpu-03 (+$95) = Observed ($314)
  const maxVal = 340;
  const chartHeight = 160; // pixels

  // Helper to calculate pixel heights and bottoms
  const getY = (val: number) => (val / maxVal) * chartHeight;

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
        <Sidebar
          currentMenu={currentMenu}
          onSelectMenu={(menu) => {
            setCurrentMenu(menu);
            if (menu === "DASHBOARD") router.push("/dashboard");
            if (menu === "UPLOAD") router.push("/upload");
            if (menu === "ANOMALIES") router.push("/anomalies/oct-15");
          }}
        />

        {/* Main Content Area */}
        <div className="flex-1 h-full flex flex-col justify-between gap-2 2xl:gap-2.5 overflow-hidden">
          {/* Top Bar */}
          <TopBar
            onOpenSearch={() => setSearchOpen(true)}
            selectedRange={selectedRange}
            onRangeChange={(range) => setSelectedRange(range)}
          />

          {/* Scrollable / Adaptive Page Content Container with Max Width 1280px */}
          <div className="flex-1 overflow-y-auto pr-1">
            <div className="max-w-[1280px] w-full mx-auto flex flex-col gap-2.5 2xl:gap-3">
              {/* Header Panel: Breadcrumb, Title, Verdict Badge, Status Dropdown */}
              <div className="panel-card bg-white px-5 py-3 2xl:px-6 2xl:py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-lg">
                <div>
                  {/* Small Muted Breadcrumb: Anomalies / Oct 15 */}
                  <div className="flex items-center space-x-1.5 text-xs 2xl:text-sm font-mono font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    <Link
                      href="/anomalies"
                      className="hover:text-[#1f5ea5] transition-colors flex items-center"
                    >
                      <ArrowLeft className="w-3 h-3 mr-1" />
                      Anomalies
                    </Link>
                    <span>/</span>
                    <span className="text-neutral-600">Oct 15</span>
                  </div>

                  {/* Title: Amazon EC2, us-west-2 in bold Burbank font */}
                  <h1 className="text-2xl 2xl:text-3xl font-black uppercase text-black leading-tight tracking-tight font-sans">
                    Amazon EC2, us-west-2
                  </h1>
                </div>

                {/* Right Badges: Ochre Badge Forgotten Environment with ring 81% and Dropdown Open */}
                <div className="flex items-center space-x-3.5">
                  <VerdictBadge
                    verdict="FORGOTTEN ENVIRONMENT"
                    confidencePercent={81}
                    size="md"
                    className="py-1 px-3"
                  />

                  {/* Dropdown 'Open' */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                      className="px-3.5 py-1.5 border-2 border-neutral-300 rounded text-xs 2xl:text-sm font-black uppercase tracking-wider text-black font-sans hover:border-black flex items-center space-x-1.5 bg-white cursor-pointer transition-colors"
                    >
                      <span>{status}</span>
                      <ChevronDown className="w-3.5 h-3.5 stroke-[2]" />
                    </button>

                    {statusDropdownOpen && (
                      <div className="absolute right-0 mt-1.5 w-32 bg-white border border-neutral-300 rounded shadow-lg py-1 z-50 text-xs font-black uppercase tracking-wider font-sans">
                        {(["Open", "Investigating", "Resolved"] as const).map(
                          (st) => (
                            <button
                              key={st}
                              type="button"
                              onClick={() => {
                                setStatus(st);
                                setStatusDropdownOpen(false);
                              }}
                              className={`w-full text-left px-3 py-1.5 hover:bg-neutral-100 ${
                                status === st ? "text-[#1f5ea5]" : "text-black"
                              }`}
                            >
                              {st}
                            </button>
                          )
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Two Column Grid: Left Column (60%), Right Column (40%) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 2xl:gap-3.5 items-start">
                {/* LEFT COLUMN (60% -> 7 cols of 12) */}
                <div className="lg:col-span-7 flex flex-col gap-3 2xl:gap-3.5">
                  {/* Card 1: Hero Number +$285 in 64px Serif and Muted Caption */}
                  <div className="panel-card bg-white p-6 2xl:p-7 shadow-lg flex flex-col justify-center">
                    <span className="font-serif text-5xl 2xl:text-[64px] font-normal text-black leading-none tracking-tight">
                      +$285
                    </span>
                    <p className="text-xs 2xl:text-sm font-mono font-bold text-neutral-500 uppercase tracking-wider mt-2.5">
                      above the expected $29 on Oct 15
                    </p>
                  </div>

                  {/* Card 2: Title "What happened" with small indigo tag "Gemini, verified" */}
                  <div className="panel-card bg-white p-6 2xl:p-7 shadow-lg flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-neutral-100">
                      <h2 className="text-xl 2xl:text-2xl font-black uppercase text-black font-sans tracking-tight">
                        What happened
                      </h2>
                      {/* Small Tag: Gemini, verified in indigo */}
                      <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] 2xl:text-xs font-mono font-bold uppercase tracking-wider">
                        Gemini, verified
                      </span>
                    </div>

                    {/* Four Short Sentences with Evidence Chips */}
                    <div className="space-y-3.5 text-xs 2xl:text-sm font-sans leading-relaxed text-neutral-800">
                      {/* Sentence 1 */}
                      <div className="flex items-start flex-wrap gap-y-1">
                        <span className="font-sans font-bold text-black">
                          On Oct 15, EC2 in us-west-2 cost $314 against an expected $29.
                        </span>
                        <span className="inline-flex items-center space-x-1 ml-1.5">
                          <EvidenceChip
                            id="E1"
                            onClick={() => setSelectedChip("E1: CloudWatch hourly EC2 billing telemetry spike")}
                          />
                          <EvidenceChip
                            id="E2"
                            onClick={() => setSelectedChip("E2: Historical baseline 30-day moving average ($29)")}
                          />
                        </span>
                      </div>

                      {/* Sentence 2 */}
                      <div className="flex items-start flex-wrap gap-y-1">
                        <span className="font-sans font-bold text-black">
                          The largest contributor was i-stg-gpu-01, adding $95.
                        </span>
                        <span className="inline-flex items-center ml-1.5">
                          <EvidenceChip
                            id="E5"
                            onClick={() => setSelectedChip("E5: Instance i-stg-gpu-01 AWS CUR unblended cost line item")}
                          />
                        </span>
                      </div>

                      {/* Sentence 3 */}
                      <div className="flex items-start flex-wrap gap-y-1">
                        <span className="font-sans font-bold text-black">
                          The main contributor is tagged staging, not production.
                        </span>
                        <span className="inline-flex items-center ml-1.5">
                          <EvidenceChip
                            id="E10"
                            onClick={() => setSelectedChip("E10: AWS Resource Tag 'Environment=staging' verified")}
                          />
                        </span>
                      </div>

                      {/* Sentence 4 */}
                      <div className="flex items-start flex-wrap gap-y-1">
                        <span className="font-sans font-bold text-black">
                          The extra cost has continued for 8 days.
                        </span>
                        <span className="inline-flex items-center ml-1.5">
                          <EvidenceChip
                            id="E11"
                            onClick={() => setSelectedChip("E11: Continuous consecutive billing days above threshold")}
                          />
                        </span>
                      </div>
                    </div>

                    {/* Interactive Chip Detail Drawer */}
                    {selectedChip && (
                      <div className="mt-4 p-2.5 bg-blue-50/70 border border-[#1f5ea5]/30 rounded text-xs font-mono font-bold text-[#1f5ea5] flex items-center justify-between">
                        <span>{selectedChip}</span>
                        <button
                          type="button"
                          onClick={() => setSelectedChip(null)}
                          className="text-neutral-500 hover:text-black ml-2"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* RIGHT COLUMN (40% -> 5 cols of 12) */}
                <div className="lg:col-span-5 flex flex-col gap-3 2xl:gap-3.5">
                  {/* Card 3: Title "Spend Diff" with Tab Strip & Waterfall Chart */}
                  <div className="panel-card bg-white p-6 2xl:p-7 shadow-lg flex flex-col">
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-neutral-100">
                      <h2 className="text-xl 2xl:text-2xl font-black uppercase text-black font-sans tracking-tight">
                        Spend Diff
                      </h2>

                      {/* Tab Strip: Resource (selected), Usage type, Tag */}
                      <div className="inline-flex items-center space-x-3 text-xs 2xl:text-sm font-black uppercase font-sans">
                        <button
                          type="button"
                          onClick={() => setActiveTab("Resource")}
                          className={`relative pb-1 cursor-pointer transition-colors ${
                            activeTab === "Resource"
                              ? "text-black font-black"
                              : "text-neutral-400 hover:text-black"
                          }`}
                        >
                          <span>Resource</span>
                          {activeTab === "Resource" && (
                            <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#cb7272]" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => setActiveTab("Usage type")}
                          className={`relative pb-1 cursor-pointer transition-colors ${
                            activeTab === "Usage type"
                              ? "text-black font-black"
                              : "text-neutral-400 hover:text-black"
                          }`}
                        >
                          <span>Usage type</span>
                          {activeTab === "Usage type" && (
                            <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#cb7272]" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => setActiveTab("Tag")}
                          className={`relative pb-1 cursor-pointer transition-colors ${
                            activeTab === "Tag"
                              ? "text-black font-black"
                              : "text-neutral-400 hover:text-black"
                          }`}
                        >
                          <span>Tag</span>
                          {activeTab === "Tag" && (
                            <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#cb7272]" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Waterfall Chart with Five Vertical Bars */}
                    {/* Bar 1: grey, Expected, $29 */}
                    {/* Bars 2, 3, 4: float upwards in ochre (#FFB547), gpu-01, gpu-02, gpu-03 each +$95 */}
                    {/* Bar 5: cream, Observed, $314 */}
                    <div className="w-full pt-4 pb-2">
                      <div className="h-[180px] w-full relative flex items-end justify-between px-2">
                        {/* Background Grid Lines */}
                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                          <div className="border-b border-dashed border-neutral-400 w-full" />
                          <div className="border-b border-dashed border-neutral-400 w-full" />
                          <div className="border-b border-dashed border-neutral-400 w-full" />
                          <div className="border-b border-neutral-300 w-full" />
                        </div>

                        {/* Bar 1: Grey, Expected ($29) */}
                        <div className="relative z-10 flex flex-col items-center w-12">
                          <span className="text-[11px] font-mono font-bold text-neutral-600 mb-1">
                            $29
                          </span>
                          <div
                            className="w-10 bg-neutral-400 rounded-xs shadow-xs"
                            style={{ height: `${getY(29)}px` }}
                          />
                          <span className="text-[11px] font-black uppercase text-neutral-600 font-sans mt-2">
                            Expected
                          </span>
                        </div>

                        {/* Connector Line 1 to 2 */}
                        <div
                          className="absolute border-t border-dashed border-neutral-400 z-0 pointer-events-none"
                          style={{
                            left: "14%",
                            right: "68%",
                            bottom: `${getY(29) + 24}px`,
                          }}
                        />

                        {/* Bar 2: Ochre, gpu-01 (+$95 floating from 29 to 124) */}
                        <div
                          className="relative z-10 flex flex-col items-center w-12"
                          style={{ marginBottom: `${getY(29)}px` }}
                        >
                          <span className="text-[10px] font-mono font-bold text-[#b45309] mb-1">
                            +$95
                          </span>
                          <div
                            className="w-10 bg-[#FFB547] rounded-xs shadow-xs border border-amber-500/40"
                            style={{ height: `${getY(95)}px` }}
                          />
                          <span className="absolute -bottom-6 text-[10px] font-black uppercase text-neutral-600 font-sans whitespace-nowrap">
                            gpu-01
                          </span>
                        </div>

                        {/* Connector Line 2 to 3 */}
                        <div
                          className="absolute border-t border-dashed border-neutral-400 z-0 pointer-events-none"
                          style={{
                            left: "35%",
                            right: "48%",
                            bottom: `${getY(124) + 24}px`,
                          }}
                        />

                        {/* Bar 3: Ochre, gpu-02 (+$95 floating from 124 to 219) */}
                        <div
                          className="relative z-10 flex flex-col items-center w-12"
                          style={{ marginBottom: `${getY(124)}px` }}
                        >
                          <span className="text-[10px] font-mono font-bold text-[#b45309] mb-1">
                            +$95
                          </span>
                          <div
                            className="w-10 bg-[#FFB547] rounded-xs shadow-xs border border-amber-500/40"
                            style={{ height: `${getY(95)}px` }}
                          />
                          <span className="absolute -bottom-6 text-[10px] font-black uppercase text-neutral-600 font-sans whitespace-nowrap">
                            gpu-02
                          </span>
                        </div>

                        {/* Connector Line 3 to 4 */}
                        <div
                          className="absolute border-t border-dashed border-neutral-400 z-0 pointer-events-none"
                          style={{
                            left: "56%",
                            right: "27%",
                            bottom: `${getY(219) + 24}px`,
                          }}
                        />

                        {/* Bar 4: Ochre, gpu-03 (+$95 floating from 219 to 314) */}
                        <div
                          className="relative z-10 flex flex-col items-center w-12"
                          style={{ marginBottom: `${getY(219)}px` }}
                        >
                          <span className="text-[10px] font-mono font-bold text-[#b45309] mb-1">
                            +$95
                          </span>
                          <div
                            className="w-10 bg-[#FFB547] rounded-xs shadow-xs border border-amber-500/40"
                            style={{ height: `${getY(95)}px` }}
                          />
                          <span className="absolute -bottom-6 text-[10px] font-black uppercase text-neutral-600 font-sans whitespace-nowrap">
                            gpu-03
                          </span>
                        </div>

                        {/* Connector Line 4 to 5 */}
                        <div
                          className="absolute border-t border-dashed border-neutral-400 z-0 pointer-events-none"
                          style={{
                            left: "77%",
                            right: "9%",
                            bottom: `${getY(314) + 24}px`,
                          }}
                        />

                        {/* Bar 5: Cream, Observed ($314) */}
                        <div className="relative z-10 flex flex-col items-center w-12">
                          <span className="text-[11px] font-mono font-bold text-neutral-800 mb-1">
                            $314
                          </span>
                          <div
                            className="w-10 bg-[#fef3c7] border-2 border-[#f59e0b] rounded-xs shadow-xs"
                            style={{ height: `${getY(314)}px` }}
                          />
                          <span className="text-[11px] font-black uppercase text-neutral-800 font-sans mt-2">
                            Observed
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card 4: Title "Why this verdict" */}
                  <div className="panel-card bg-white p-6 2xl:p-7 shadow-lg flex flex-col">
                    <h2 className="text-xl 2xl:text-2xl font-black uppercase text-black font-sans tracking-tight mb-3.5 pb-2 border-b border-neutral-100">
                      Why this verdict
                    </h2>

                    {/* Two List Rows with an Ochre Dot and a Chip Each */}
                    <div className="space-y-3">
                      {/* Row 1 */}
                      <div className="flex items-center justify-between p-2 rounded hover:bg-neutral-50 transition-colors">
                        <div className="flex items-center space-x-2.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#FFB547] shrink-0" />
                          <span className="text-xs 2xl:text-sm font-bold text-black font-sans">
                            Top contributor is tagged staging.
                          </span>
                        </div>
                        <EvidenceChip
                          id="E10"
                          onClick={() => setSelectedChip("E10: Staging environment verified in tag taxonomy")}
                        />
                      </div>

                      {/* Row 2 */}
                      <div className="flex items-center justify-between p-2 rounded hover:bg-neutral-50 transition-colors">
                        <div className="flex items-center space-x-2.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#FFB547] shrink-0" />
                          <span className="text-xs 2xl:text-sm font-bold text-black font-sans">
                            Cost stayed high for 8 days.
                          </span>
                        </div>
                        <EvidenceChip
                          id="E11"
                          onClick={() => setSelectedChip("E11: 8 consecutive days of unutilized instance billing")}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Global Search Palette (Ctrl+K) */}
      <SearchPalette
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectResult={() => router.push("/anomalies")}
      />
    </main>
  );
}
