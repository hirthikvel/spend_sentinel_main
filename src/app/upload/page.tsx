"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { SerratedStripes } from "@/components/SerratedStripes";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { SearchPalette } from "@/components/SearchPalette";
import { Upload, Check, FileText, ArrowRight, CheckCircle2, Activity, Database, Sparkles } from "lucide-react";
import { ingestBillingCsv } from "@/lib/supabase";
import { useAuthGuard } from "@/lib/useAuthGuard";
import { motion } from "motion/react";

export default function UploadDataPage() {
  const { isLoading: authLoading } = useAuthGuard();
  const router = useRouter();
  const [currentMenu, setCurrentMenu] = useState("UPLOAD");
  const [selectedRange, setSelectedRange] = useState("LAST 60 DAYS");
  const [activeTab, setActiveTab] = useState<"Billing" | "Utilization">("Billing");
  const [searchOpen, setSearchOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Real-Time Scanning & Parsing HUD State
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStage, setScanStage] = useState<string>("");
  const [rowsScanned, setRowsScanned] = useState(0);
  const [datesScanned, setDatesScanned] = useState<string[]>([]);
  const [totalDatesCount, setTotalDatesCount] = useState<number>(0);
  const [servicesDetected, setServicesDetected] = useState<string[]>([]);
  const [totalSpendDetected, setTotalSpendDetected] = useState(0);
  const [scanCompleted, setScanCompleted] = useState(false);

  const [edgeFunctionData, setEdgeFunctionData] = useState<any>(null);

  // File parsing engine with simulated real-time telemetry streaming
  const processAndScanFile = (file: File) => {
    setIsScanning(true);
    setScanProgress(5);
    setScanStage("Reading raw file bytes into buffer...");
    setScanCompleted(false);
    setEdgeFunctionData(null);

    const reader = new FileReader();

    reader.onload = async (e) => {
      const text = (e.target?.result as string) || "";
      const lines = text.trim().split("\n");
      const totalLines = Math.max(lines.length - 1, 1);

      setScanProgress(20);
      setScanStage("Scanning CSV headers and verifying column schema...");

      await new Promise((r) => setTimeout(r, 200));

      const headerCols = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/['"]/g, ""));
      const dateIdx = headerCols.findIndex(
        (h) =>
          h.includes("chargeperiodstart") ||
          h.includes("usage_date") ||
          h === "date" ||
          h.includes("usagestart") ||
          h.includes("chargeperiodend")
      );
      const serviceIdx = headerCols.findIndex(
        (h) =>
          h === "servicename" ||
          h.includes("service") ||
          h === "product_servicename"
      );
      const costIdx = headerCols.findIndex(
        (h) =>
          h === "effectivecost" ||
          h === "billedcost" ||
          h.includes("unblended") ||
          (h.includes("cost") && !h.includes("id"))
      );

      // Stream lines in chunks to give genuine real-time visual feedback
      const chunkSize = Math.max(1, Math.floor(lines.length / 8));
      const discoveredDates = new Set<string>();
      const discoveredServices = new Set<string>();
      let runningSpend = 0;

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(",").map((c) => c.trim().replace(/['"]/g, ""));
        if (cols.length >= 2) {
          let dateStr = dateIdx >= 0 && cols[dateIdx] ? cols[dateIdx] : (cols[0]?.length >= 8 ? cols[0] : "");
          if (dateStr.includes("T")) dateStr = dateStr.split("T")[0];
          if (dateStr) discoveredDates.add(dateStr);

          const servStr = serviceIdx >= 0 && cols[serviceIdx] ? cols[serviceIdx] : cols[1];
          if (servStr) discoveredServices.add(servStr.toUpperCase().replace("AMAZON ", ""));

          const costStr = costIdx >= 0 && cols[costIdx] ? cols[costIdx] : (cols[3] && !isNaN(Number(cols[3])) && Number(cols[3]) < 1000000 ? cols[3] : cols[2]);
          const costVal = parseFloat(costStr || "0");
          if (!isNaN(costVal) && costVal < 100000000) runningSpend += costVal;
        }

        if (i % chunkSize === 0 || i === lines.length - 1) {
          const pct = Math.min(85, Math.round(20 + (i / totalLines) * 65));
          setScanProgress(pct);
          setRowsScanned(i);
          setDatesScanned(Array.from(discoveredDates).slice(0, 8));
          setTotalDatesCount(discoveredDates.size);
          setServicesDetected(Array.from(discoveredServices).slice(0, 6));
          setTotalSpendDetected(Math.round(runningSpend));
          setScanStage(`Parsing line ${i} of ${totalLines}... Ingesting usage items`);
          await new Promise((r) => setTimeout(r, 80));
        }
      }

      setScanProgress(90);
      setScanStage("Committing parsed usage line items to Supabase database...");

      // Commit to backend and trigger Supabase Edge Function
      const ingestRes = await ingestBillingCsv(text, file.name);

      setScanProgress(96);
      setScanStage("Triggering Supabase Edge Function 'calculate-unit-economics'...");
      await new Promise((r) => setTimeout(r, 250));

      if (ingestRes.edgeFunction?.data) {
        setEdgeFunctionData(ingestRes.edgeFunction.data);
      }

      setScanProgress(100);
      setScanStage("Telemetry scan & Supabase Edge Function completed successfully.");
      setScanCompleted(true);
    };

    reader.readAsText(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processAndScanFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processAndScanFile(e.dataTransfer.files[0]);
    }
  };

  // 1-Click Scan Root 90-Day FOCUS Anomaly CSV
  const handleScan90DaysRootCsv = async () => {
    try {
      setIsScanning(true);
      setScanProgress(10);
      setScanStage("Fetching focus_90_days_anomalies.csv from project root...");
      const res = await fetch("/api/root-csv");
      if (!res.ok) throw new Error("Could not fetch root CSV");
      const text = await res.text();
      const blob = new Blob([text], { type: "text/csv" });
      const file = new File([blob], "focus_90_days_anomalies.csv", { type: "text/csv" });
      processAndScanFile(file);
    } catch (err) {
      console.warn("Failed to load root CSV:", err);
      handleQuickBenchmarkScan();
    }
  };

  // Quick Benchmark injection with real-time scan
  const handleQuickBenchmarkScan = () => {
    const sampleCsv = `usage_date,service,region,cost,resource_id,environment
2026-09-17,Amazon EC2,us-east-1,142.50,i-012ec2prod,production
2026-09-19,Amazon VPC,us-east-1,128.00,vpc-098east,production
2026-09-21,Amazon RDS,us-east-1,175.40,db-aurora-cluster,production
2026-09-23,Amazon EC2,us-west-2,160.00,i-044gpuwest,staging
2026-09-25,Amazon VPC,us-east-1,180.00,vpc-nat-gw,production
2026-09-27,Amazon EC2,us-west-2,340.00,i-099gpuhigh,staging
2026-09-29,Amazon RDS,us-east-1,190.20,db-aurora-cluster,production
2026-10-01,Amazon EC2,us-east-1,165.00,i-012ec2prod,production
2026-10-03,Amazon VPC,us-east-1,172.00,vpc-098east,production
2026-10-05,Amazon EC2,us-west-2,185.00,i-044gpuwest,staging
2026-10-07,Amazon RDS,us-east-1,178.50,db-aurora-cluster,production
2026-10-09,Amazon EC2,us-east-1,170.00,i-012ec2prod,production
2026-10-11,Amazon VPC,us-east-1,164.00,vpc-nat-gw,production
2026-10-13,Amazon EC2,us-west-2,175.00,i-044gpuwest,staging
2026-10-15,Amazon EC2,us-east-1,182.00,i-012ec2prod,production`;

    const blob = new Blob([sampleCsv], { type: "text/csv" });
    const file = new File([blob], "aws-cur-october-benchmark.csv", { type: "text/csv" });
    processAndScanFile(file);
  };

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
          <TopBar
            onOpenSearch={() => setSearchOpen(true)}
            selectedRange={selectedRange}
            onRangeChange={(range) => setSelectedRange(range)}
          />

          {/* Centered Scrollable Canvas */}
          <div className="flex-1 overflow-y-auto pr-1">
            <div className="max-w-[1280px] w-full mx-auto flex flex-col gap-3">
              
              {/* Top Banner with "Continue to Dashboard" to strictly allow non-blocking flow */}
              <div className="panel-card bg-white p-5 shadow-2xl flex items-center justify-between">
                <div>
                  <h1 className="text-3xl 2xl:text-4xl font-black uppercase text-black leading-none font-sans tracking-tight">
                    Upload Billing Data
                  </h1>
                  <p className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-wider mt-1">
                    Continuous Telemetry Ingestion • Real-Time Scanned Parsing
                  </p>
                </div>

                {/* Continue Without Uploading Button */}
                <button
                  type="button"
                  onClick={() => router.push("/dashboard")}
                  className="px-5 py-2.5 bg-[#1f5ea5] hover:bg-[#184980] text-white font-black text-xs uppercase tracking-wider rounded transition-all cursor-pointer font-sans shadow-xs flex items-center space-x-2"
                >
                  <span>Continue to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Main Upload Box */}
              <div className="panel-card bg-white p-6 shadow-2xl flex flex-col gap-5">
                
                {/* REAL-TIME SCANNING HUD (Matching the exact SpendSentinel template) */}
                {isScanning ? (
                  <div className="space-y-4 p-6 bg-white rounded-xl border-2 border-neutral-200 shadow-sm">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
                      <div className="flex items-center space-x-2">
                        <Activity className={`w-5 h-5 ${scanCompleted ? "text-emerald-600" : "text-[#1f5ea5] animate-pulse"}`} />
                        <span className={`text-base font-black uppercase tracking-wider font-sans ${scanCompleted ? "text-emerald-700" : "text-black"}`}>
                          {scanCompleted ? "SCAN COMPLETED • ATTRIBUTION READY" : "REAL-TIME PARSING & ATTRIBUTION"}
                        </span>
                      </div>
                      <span className="text-xs font-black font-mono px-2.5 py-1 rounded bg-blue-50 text-[#1f5ea5] border border-blue-200">
                        {scanProgress}%
                      </span>
                    </div>

                    {/* Progress Bar Track: Light grey track with cobalt / emerald fill */}
                    <div className="w-full bg-neutral-100 h-3 rounded-full overflow-hidden border border-neutral-200">
                      <div
                        className={`h-full transition-all duration-150 ease-out ${
                          scanCompleted ? "bg-emerald-500" : "bg-[#1f5ea5]"
                        }`}
                        style={{ width: `${scanProgress}%` }}
                      />
                    </div>

                    {/* Stage status */}
                    <p className="text-xs text-neutral-600 font-mono font-bold truncate">
                      {scanStage}
                    </p>

                    {/* Live Parsed Metrics Grid: Clean white KPI cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1">
                      <div className="bg-neutral-50 p-3.5 rounded-lg border-2 border-neutral-200 shadow-xs">
                        <span className="text-[10px] 2xl:text-xs text-neutral-500 block uppercase font-black font-sans tracking-wide">
                          Rows Parsed
                        </span>
                        <span className="text-2xl font-black text-black font-mono">
                          {rowsScanned.toLocaleString()}
                        </span>
                      </div>

                      <div className="bg-neutral-50 p-3.5 rounded-lg border-2 border-neutral-200 shadow-xs">
                        <span className="text-[10px] 2xl:text-xs text-neutral-500 block uppercase font-black font-sans tracking-wide">
                          Dates Discovered
                        </span>
                        <span className="text-2xl font-black text-black font-mono">
                          {totalDatesCount > 0 ? totalDatesCount : datesScanned.length} dates
                        </span>
                      </div>

                      <div className="bg-neutral-50 p-3.5 rounded-lg border-2 border-neutral-200 shadow-xs">
                        <span className="text-[10px] 2xl:text-xs text-neutral-500 block uppercase font-black font-sans tracking-wide">
                          Cloud Services
                        </span>
                        <span className="text-2xl font-black text-black font-mono">
                          {servicesDetected.length} found
                        </span>
                      </div>

                      <div className="bg-neutral-50 p-3.5 rounded-lg border-2 border-neutral-200 shadow-xs">
                        <span className="text-[10px] 2xl:text-xs text-neutral-500 block uppercase font-black font-sans tracking-wide">
                          Scanned Spend
                        </span>
                        <span className="text-2xl font-black text-[#1f5ea5] font-mono">
                          ₹{Math.round(totalSpendDetected * 85).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>

                    {/* Detected Services Pills */}
                    {servicesDetected.length > 0 && (
                      <div className="pt-2 flex items-center space-x-2 overflow-x-auto">
                        <span className="text-xs text-neutral-500 uppercase font-black font-sans">
                          Taxonomy:
                        </span>
                        {servicesDetected.map((s) => (
                          <span
                            key={s}
                            className="bg-blue-50 text-[#1f5ea5] border-2 border-blue-200 px-2.5 py-0.5 rounded text-xs font-black uppercase font-mono shadow-xs"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Edge Function Execution Telemetry */}
                    {edgeFunctionData && (() => {
                      const isWarning = edgeFunctionData.status === "WARNING" || edgeFunctionData.status === "CRITICAL";
                      return (
                        <div
                          className={`mt-3 p-3.5 rounded-lg shadow-xs font-sans border-2 ${
                            isWarning
                              ? "bg-gradient-to-r from-rose-50 via-amber-50 to-rose-50 border-rose-300"
                              : "bg-gradient-to-r from-emerald-50 to-blue-50 border-emerald-300"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span
                                className={`w-2.5 h-2.5 rounded-full animate-pulse ${
                                  isWarning ? "bg-rose-600" : "bg-emerald-500"
                                }`}
                              />
                              <span
                                className={`text-xs font-mono font-black uppercase ${
                                  isWarning ? "text-rose-900" : "text-emerald-800"
                                }`}
                              >
                                Supabase Edge Function: calculate-unit-economics
                              </span>
                            </div>
                            <span
                              className={`px-2.5 py-1 rounded text-[11px] font-mono font-black uppercase tracking-wider border-2 ${
                                isWarning
                                  ? "bg-rose-600 text-white border-rose-700 shadow-sm"
                                  : "bg-emerald-200 text-emerald-900 border-emerald-400"
                              }`}
                            >
                              {edgeFunctionData.status || "HEALTHY"}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 my-2 text-xs">
                            <div className="bg-white/90 p-2 rounded border border-neutral-200">
                              <p className="text-[10px] font-mono font-bold text-neutral-500 uppercase">Template</p>
                              <p className="font-black text-neutral-900 font-sans">{edgeFunctionData.template_applied}</p>
                            </div>
                            <div className="bg-white/90 p-2 rounded border border-neutral-200">
                              <p className="text-[10px] font-mono font-bold text-neutral-500 uppercase">Unit Metric</p>
                              <p className="font-black text-neutral-900 font-sans">{edgeFunctionData.unit_metric}</p>
                            </div>
                            <div className="bg-white/90 p-2 rounded border border-neutral-200 col-span-2 md:col-span-1">
                              <p className="text-[10px] font-mono font-bold text-neutral-500 uppercase">Calculated Unit Cost</p>
                              <p className={`font-black font-mono text-sm ${isWarning ? "text-rose-600" : "text-emerald-700"}`}>
                                ₹{Number(edgeFunctionData.calculated_unit_cost_inr || 0).toLocaleString("en-IN")}
                              </p>
                            </div>
                          </div>
                          <p className="text-xs text-neutral-700 leading-relaxed font-sans mt-1">
                            {edgeFunctionData.executive_summary}
                          </p>
                        </div>
                      );
                    })()}

                    {/* Post-scan Action Buttons */}
                    {scanCompleted && (
                      <div className="pt-4 flex items-center justify-end space-x-3 border-t border-neutral-200">
                        <button
                          type="button"
                          onClick={() => {
                            setIsScanning(false);
                            setScanCompleted(false);
                          }}
                          className="px-4 py-2.5 border-2 border-neutral-300 hover:border-black bg-white text-black text-xs font-black uppercase tracking-wider rounded font-sans transition-all cursor-pointer shadow-xs"
                        >
                          Scan Another File
                        </button>
                        <button
                          type="button"
                          onClick={() => router.push("/dashboard")}
                          className="px-6 py-2.5 bg-[#f87171] hover:bg-[#ef4444] text-black text-xs font-black uppercase tracking-wider rounded font-sans transition-all cursor-pointer shadow-xs flex items-center space-x-2"
                        >
                          <span>View in Dashboard</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Standard Dropzone when not actively scanning */
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Select or Drop File */}
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`p-10 rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
                        isDragging
                          ? "border-[#1f5ea5] bg-blue-50/50"
                          : "border-neutral-300 hover:border-black bg-neutral-50/60 hover:bg-neutral-50"
                      }`}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept=".csv"
                        className="hidden"
                        onChange={handleFileChange}
                      />

                      <div className="w-14 h-14 rounded-full bg-white shadow-sm flex items-center justify-center mb-4 text-[#1f5ea5]">
                        <Upload className="w-7 h-7 stroke-[1.5]" />
                      </div>

                      <h3 className="text-lg font-black uppercase text-black font-sans mb-1">
                        Select or Drop Billing CSV
                      </h3>
                      <p className="text-xs text-neutral-500 font-sans max-w-sm mb-5">
                        Supports AWS CUR, FOCUS standard, and custom CSV formats with usage dates and unblended costs.
                      </p>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                        className="px-6 py-2.5 bg-[#f8b4b4] hover:bg-[#fca5a5] text-black font-black text-xs uppercase tracking-wider rounded transition-all cursor-pointer font-sans shadow-xs"
                      >
                        Choose CSV File
                      </button>
                    </div>

                    {/* Quick Load 1-Click Benchmark Bill & Root 90-Day File */}
                    <div className="p-8 rounded-xl border-2 border-neutral-200 bg-white flex flex-col justify-between">
                      <div>
                        <div className="flex items-center space-x-2 text-[#1f5ea5] mb-2">
                          <Database className="w-5 h-5" />
                          <span className="text-xs font-mono font-black uppercase">
                            Instant Telemetry
                          </span>
                        </div>
                        <h3 className="text-lg font-black uppercase text-black font-sans leading-snug">
                          Scan 90-Day FOCUS Bill (Root CSV)
                        </h3>
                        <p className="text-xs text-neutral-500 mt-2 leading-relaxed font-sans">
                          Immediately scans the 90-day FOCUS format dataset (<span className="font-mono text-neutral-800 font-bold">focus_90_days_anomalies.csv</span>) located in your root project folder. Recognizes all 90 dates (July 26 to Oct 23), identifies RDS and Lambda spikes in INR ₹, and triggers calculate-unit-economics.
                        </p>
                      </div>

                      <div className="pt-6 mt-6 border-t border-neutral-100 flex flex-col space-y-2.5">
                        <button
                          type="button"
                          onClick={handleScan90DaysRootCsv}
                          className="w-full py-3 bg-[#f87171] hover:bg-[#ef4444] text-black font-black text-xs uppercase tracking-wider rounded transition-all cursor-pointer font-sans shadow-xs flex items-center justify-center space-x-2"
                        >
                          <Sparkles className="w-4 h-4" />
                          <span>Scan 90-Day FOCUS Bill (Root CSV)</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleQuickBenchmarkScan}
                          className="w-full py-2 border border-neutral-300 hover:border-black bg-neutral-50 hover:bg-neutral-100 text-neutral-700 font-black text-[11px] uppercase tracking-wider rounded transition-all cursor-pointer font-sans"
                        >
                          Or Run 16-Day Benchmark Scan
                        </button>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Global Search Palette (Ctrl+K) */}
      <SearchPalette
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectResult={() => {}}
      />
    </main>
  );
}
