"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { SerratedStripes } from "@/components/SerratedStripes";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { SearchPalette } from "@/components/SearchPalette";
import { VerdictBadge } from "@/components/VerdictBadge";
import { EvidenceChip } from "@/components/EvidenceChip";
import { EvidenceAuditModal } from "@/components/EvidenceAuditModal";
import { ChevronDown, ArrowLeft, Sparkles, RefreshCw } from "lucide-react";
import { updateAnomalyStatusInSupabase, fetchAnomaliesFromSupabase } from "@/lib/supabase";
import { useAuthGuard } from "@/lib/useAuthGuard";
import { motion } from "motion/react";

function AnomalyDetailContent() {
  const { isLoading: authLoading } = useAuthGuard();
  const router = useRouter();
  const params = useParams();
  const anomalyId = (params?.id as string) || "anom-ec2-2";
  const [currentMenu, setCurrentMenu] = useState("ANOMALIES");
  const [selectedRange, setSelectedRange] = useState("LAST 60 DAYS");
  const [activeTab, setActiveTab] = useState<"Resource" | "Usage type" | "Tag">("Resource");
  const [status, setStatus] = useState<"Open" | "Investigating" | "Resolved">("Open");
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeEvidenceRef, setActiveEvidenceRef] = useState<string | null>(null);
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [isExplaining, setIsExplaining] = useState(false);
  const [aiData, setAiData] = useState<{
    root_cause?: string;
    claims?: Array<{ text: string; refs: string[] }>;
    remediation_steps?: string[];
    urgency?: string;
    model?: string;
  } | null>(null);

  // Dynamic anomaly state in INR
  const [anomalyData, setAnomalyData] = useState<{
    id?: string;
    serviceTitle: string;
    date: string;
    delta: string;
    expected: string;
    observed: string;
    verdict: any;
    confidence: number;
    description: string;
  }>({
    serviceTitle: "Amazon RDS, ap-south-1",
    date: "Aug 15",
    delta: "+₹17,888",
    expected: "₹7,399",
    observed: "₹25,288",
    verdict: "MISCONFIGURATION",
    confidence: 88,
    description: "RDS-Primary heavy read query load surge with unindexed replica causing compute spike",
  });

  const fetchAiExplanation = React.useCallback(async (targetId: string) => {
    try {
      setIsExplaining(true);
      const res = await fetch("/api/explain-anomaly", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ anomalyId: targetId }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.explanation) {
          setAiData(json.explanation);
        }
      }
    } catch (e) {
      console.warn("Failed to fetch Gemini explanation:", e);
    } finally {
      setIsExplaining(false);
    }
  }, []);

  const handleChipClick = (ref: string) => {
    setActiveEvidenceRef(ref);
    setAuditModalOpen(true);
  };

  React.useEffect(() => {
    fetchAnomaliesFromSupabase().then((items) => {
      if (items && items.length > 0) {
        const found = items.find((x) => x.id === anomalyId) || items[0];
        if (found) {
          setAnomalyData({
            id: found.id,
            serviceTitle: `${found.service}, ${found.region.toLowerCase()}`,
            date: found.date || "Aug 15",
            delta: found.delta,
            expected: found.expectedCost || "₹7,399",
            observed: found.observedCost || "₹25,288",
            verdict: found.verdict,
            confidence: found.confidence,
            description: found.description,
          });
          if (found.status) {
            setStatus(found.status as any);
          }
          fetchAiExplanation(found.id);
        }
      }
    });
  }, [anomalyId, fetchAiExplanation]);

  if (authLoading) {
    return (
      <main
        className="fixed inset-0 w-screen h-screen bg-[#1f5ea5] overflow-hidden flex items-center justify-center font-sans"
        style={{ backgroundColor: "#1f5ea5" }}
      >
        <SerratedStripes />
        <div className="relative z-10 panel-card bg-white p-8 flex flex-col items-center space-y-4 shadow-2xl">
          <div className="w-10 h-10 border-4 border-[#1f5ea5] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-black uppercase tracking-wider text-black font-sans">
            AUTHENTICATING ACCESS...
          </p>
        </div>
      </main>
    );
  }

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

          {/* Scrollable / Adaptive Page Content Container with Max Width 1280px */}
          <div className="flex-1 overflow-y-auto pr-1">
            <div className="max-w-[1280px] w-full mx-auto flex flex-col gap-2.5 2xl:gap-3">
              {/* Header Panel: Breadcrumb, Title, Verdict Badge, Status Dropdown */}
              <div className="panel-card bg-white px-5 py-3 2xl:px-6 2xl:py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-lg">
                <div>
                  {/* Small Muted Breadcrumb: Anomalies / Date */}
                  <div className="flex items-center space-x-1.5 text-xs 2xl:text-sm font-mono font-bold uppercase tracking-wider text-neutral-400 mb-1">
                    <Link
                      href="/anomalies"
                      className="hover:text-[#1f5ea5] transition-colors flex items-center"
                    >
                      <ArrowLeft className="w-3 h-3 mr-1" />
                      Anomalies
                    </Link>
                    <span>/</span>
                    <span className="text-neutral-600">{anomalyData.date}</span>
                  </div>

                  {/* Title in bold Burbank font */}
                  <h1 className="text-2xl 2xl:text-3xl font-black uppercase text-black leading-tight tracking-tight font-sans">
                    {anomalyData.serviceTitle}
                  </h1>
                </div>

                {/* Right Badges: Verdict Badge and Dropdown Open */}
                <div className="flex items-center space-x-3.5">
                  <VerdictBadge
                    verdict={anomalyData.verdict}
                    confidencePercent={anomalyData.confidence}
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
                                updateAnomalyStatusInSupabase(anomalyId, st);
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
                  {/* Card 1: Hero Number in PP Neue Montreal template font */}
                  <div className="panel-card bg-white p-6 2xl:p-7 shadow-lg flex flex-col justify-center">
                    <span className="font-sans text-5xl 2xl:text-[64px] font-black text-black leading-none tracking-tight">
                      {anomalyData.delta}
                    </span>
                    <p className="text-xs 2xl:text-sm font-mono font-bold text-neutral-500 uppercase tracking-wider mt-2.5">
                      above the expected {anomalyData.expected} on {anomalyData.date}
                    </p>
                  </div>

                  {/* Card 2: Title "What happened" with small indigo tag "Gemini, verified" */}
                  <div className="panel-card bg-white p-6 2xl:p-7 shadow-lg flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-neutral-100">
                      <h2 className="text-xl 2xl:text-2xl font-black uppercase text-black font-sans tracking-tight">
                        What happened
                      </h2>
                      <div className="flex items-center space-x-2">
                        {/* Gemini Badge */}
                        <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] 2xl:text-xs font-mono font-bold uppercase tracking-wider flex items-center space-x-1">
                          <Sparkles className="w-3 h-3 text-indigo-600" />
                          <span>{aiData?.model || "Gemini 1.5 Flash, verified"}</span>
                        </span>
                        {/* Re-analyze button */}
                        <button
                          type="button"
                          onClick={() => anomalyData.id && fetchAiExplanation(anomalyData.id)}
                          disabled={isExplaining}
                          className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-300 transition-colors flex items-center space-x-1 cursor-pointer"
                          title="Re-run Gemini AI Analysis"
                        >
                          <RefreshCw className={`w-3 h-3 ${isExplaining ? "animate-spin text-indigo-600" : ""}`} />
                          <span className="hidden sm:inline">{isExplaining ? "Analyzing..." : "Re-Analyze"}</span>
                        </button>
                      </div>
                    </div>

                    {/* Sentences tethered to Evidence Chips */}
                    <div className="space-y-3.5 text-xs 2xl:text-sm font-sans leading-relaxed text-neutral-800">
                      {aiData?.claims && aiData.claims.length > 0 ? (
                        aiData.claims.map((claim, idx) => (
                          <div key={idx} className="flex items-start flex-wrap gap-y-1">
                            <span className="font-sans font-bold text-black">
                              {claim.text}
                            </span>
                            <span className="inline-flex items-center space-x-1 ml-1.5">
                              {claim.refs.map((r) => (
                                <EvidenceChip
                                  key={r}
                                  id={r}
                                  onClick={() => handleChipClick(r)}
                                />
                              ))}
                            </span>
                          </div>
                        ))
                      ) : (
                        <>
                          <div className="flex items-start flex-wrap gap-y-1">
                            <span className="font-sans font-bold text-black">
                              On {anomalyData.date}, {anomalyData.serviceTitle} cost {anomalyData.observed} against an expected baseline of {anomalyData.expected}.
                            </span>
                            <span className="inline-flex items-center space-x-1 ml-1.5">
                              <EvidenceChip
                                id="E1"
                                onClick={() => handleChipClick("E1")}
                              />
                              <EvidenceChip
                                id="E2"
                                onClick={() => handleChipClick("E2")}
                              />
                            </span>
                          </div>

                          <div className="flex items-start flex-wrap gap-y-1">
                            <span className="font-sans font-bold text-black">
                              {anomalyData.description}.
                            </span>
                            <span className="inline-flex items-center ml-1.5">
                              <EvidenceChip
                                id="E5"
                                onClick={() => handleChipClick("E5")}
                              />
                            </span>
                          </div>

                          <div className="flex items-start flex-wrap gap-y-1">
                            <span className="font-sans font-bold text-black">
                              Excess cloud expenditure detected across billing line items: {anomalyData.delta}.
                            </span>
                            <span className="inline-flex items-center ml-1.5">
                              <EvidenceChip
                                id="E3"
                                onClick={() => handleChipClick("E3")}
                              />
                            </span>
                          </div>

                          <div className="flex items-start flex-wrap gap-y-1">
                            <span className="font-sans font-bold text-black">
                              Verdict: {anomalyData.verdict} with {anomalyData.confidence}% statistical model confidence.
                            </span>
                            <span className="inline-flex items-center ml-1.5">
                              <EvidenceChip
                                id="E14"
                                onClick={() => handleChipClick("E14")}
                              />
                            </span>
                          </div>
                        </>
                      )}
                    </div>
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

                    {/* Waterfall Chart in INR Rupees (₹) */}
                    <div className="w-full pt-4 pb-4">
                      <div className="h-[180px] w-full relative flex items-end justify-around px-4">
                        {/* Background Grid Lines */}
                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                          <div className="border-b border-dashed border-neutral-400 w-full" />
                          <div className="border-b border-dashed border-neutral-400 w-full" />
                          <div className="border-b border-dashed border-neutral-400 w-full" />
                          <div className="border-b border-neutral-300 w-full" />
                        </div>

                        {/* Bar 1: Grey, Expected */}
                        <div className="relative z-10 flex flex-col items-center w-20">
                          <span className="text-xs font-mono font-bold text-neutral-600 mb-1">
                            {anomalyData.expected}
                          </span>
                          <div
                            className="w-16 bg-neutral-400 rounded-xs shadow-xs"
                            style={{ height: "55px" }}
                          />
                          <span className="text-[11px] font-black uppercase text-neutral-600 font-sans mt-2 whitespace-nowrap">
                            Expected
                          </span>
                        </div>

                        {/* Connector Line 1 to 2 */}
                        <div
                          className="absolute border-t-2 border-dashed border-neutral-400 z-0 pointer-events-none"
                          style={{
                            left: "26%",
                            right: "55%",
                            bottom: "80px",
                          }}
                        />

                        {/* Bar 2: Rose / Amber, Unbudgeted Delta */}
                        <div
                          className="relative z-10 flex flex-col items-center w-20"
                          style={{ marginBottom: "55px" }}
                        >
                          <span className="text-xs font-mono font-black text-rose-600 mb-1">
                            {anomalyData.delta}
                          </span>
                          <div
                            className="w-16 bg-[#FF6B6B] rounded-xs shadow-xs border border-rose-600/40"
                            style={{ height: "95px" }}
                          />
                          <span className="absolute -bottom-6 text-[11px] font-black uppercase text-rose-600 font-sans whitespace-nowrap">
                            Delta Surge
                          </span>
                        </div>

                        {/* Connector Line 2 to 3 */}
                        <div
                          className="absolute border-t-2 border-dashed border-neutral-400 z-0 pointer-events-none"
                          style={{
                            left: "55%",
                            right: "26%",
                            bottom: "175px",
                          }}
                        />

                        {/* Bar 3: Cream / Gold, Observed */}
                        <div className="relative z-10 flex flex-col items-center w-20">
                          <span className="text-xs font-mono font-black text-neutral-900 mb-1">
                            {anomalyData.observed}
                          </span>
                          <div
                            className="w-16 bg-[#fef3c7] border-2 border-[#f59e0b] rounded-xs shadow-xs"
                            style={{ height: "150px" }}
                          />
                          <span className="text-[11px] font-black uppercase text-neutral-900 font-sans mt-2 whitespace-nowrap">
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
                          <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B6B] shrink-0" />
                          <span className="text-xs 2xl:text-sm font-bold text-black font-sans">
                            {aiData?.root_cause || anomalyData.description}
                          </span>
                        </div>
                        <EvidenceChip
                          id="E5"
                          onClick={() => handleChipClick("E5")}
                        />
                      </div>

                      {/* Row 2 */}
                      <div className="flex items-center justify-between p-2 rounded hover:bg-neutral-50 transition-colors">
                        <div className="flex items-center space-x-2.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#FFB547] shrink-0" />
                          <span className="text-xs 2xl:text-sm font-bold text-black font-sans">
                            Single day jump points to a configuration fault rather than an organic trend.
                          </span>
                        </div>
                        <EvidenceChip
                          id="E12"
                          onClick={() => handleChipClick("E12")}
                        />
                      </div>

                      {/* Row 3: Remediation step from Gemini */}
                      {aiData?.remediation_steps && aiData.remediation_steps.length > 0 && (
                        <div className="p-2 rounded bg-neutral-50 border border-neutral-200 mt-2">
                          <span className="text-[10px] font-black uppercase text-neutral-500 font-mono block mb-0.5">
                            AI Remediation Playbook:
                          </span>
                          <p className="text-xs text-neutral-800 font-bold font-sans">
                            {aiData.remediation_steps[0]}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Interactive Evidence Audit Modal (Clicking chip pulls exact rows from underlying FOCUS database) */}
      <EvidenceAuditModal
        isOpen={auditModalOpen}
        onClose={() => setAuditModalOpen(false)}
        evidenceRef={activeEvidenceRef}
        anomalyId={anomalyId}
      />

      {/* Global Search Palette (Ctrl+K) */}
      <SearchPalette
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectResult={() => router.push("/anomalies")}
      />
    </main>
  );
}

export default function AnomalyDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 bg-[#1f5ea5] flex items-center justify-center text-white font-mono font-bold text-sm">
          LOADING TELEMETRY...
        </div>
      }
    >
      <AnomalyDetailContent />
    </Suspense>
  );
}

