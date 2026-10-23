"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { SerratedStripes } from "@/components/SerratedStripes";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { SearchPalette } from "@/components/SearchPalette";
import { Upload, Check, FileText } from "lucide-react";
import { uploadBillingFileToSupabase } from "@/lib/supabase";

export default function UploadDataPage() {
  const router = useRouter();
  const [currentMenu, setCurrentMenu] = useState("UPLOAD");
  const [selectedRange, setSelectedRange] = useState("LAST 60 DAYS");
  const [activeTab, setActiveTab] = useState<"Billing" | "Utilization">("Billing");
  const [searchOpen, setSearchOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const columnMappings = [
    {
      yourCol: "line_item_usage_start_date",
      mapsTo: "usage_date",
    },
    {
      yourCol: "product_servicename",
      mapsTo: "service",
    },
    {
      yourCol: "product_region",
      mapsTo: "region",
    },
    {
      yourCol: "line_item_unblended_cost",
      mapsTo: "cost",
    },
    {
      yourCol: "line_item_resource_id",
      mapsTo: "resource_id",
    },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0].name);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadedFile(e.dataTransfer.files[0].name);
    }
  };

  const handleUploadAndValidate = async () => {
    setIsValidating(true);
    try {
      await uploadBillingFileToSupabase({
        filename: uploadedFile || "aws-cur-october-2024.csv",
        sizeBytes: 38400000,
        format: "AWS CUR",
        rowCount: 500000,
      });
    } catch (err) {
      console.warn("Supabase billing upload notice:", err);
    }
    setTimeout(() => {
      router.push("/analysis");
    }, 450);
  };

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
          onSelectMenu={(menu) => setCurrentMenu(menu)}
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
            <div className="max-w-[1280px] w-full mx-auto flex flex-col gap-2 2xl:gap-2.5">
              {/* Main Canvas Panel (White overlapping panel with tightened padding) */}
              <div className="panel-card bg-white p-5 2xl:p-6 shadow-2xl flex flex-col gap-3 2xl:gap-3.5">
                {/* Header: Symmetrically Centered Page Title & Tabs */}
                <div className="text-center pt-0 pb-1">
                  <h1 className="text-3xl 2xl:text-[40px] font-black uppercase text-black leading-none mb-3 font-sans tracking-tight">
                    Upload data
                  </h1>
                  <div className="inline-flex items-center space-x-10 border-b border-neutral-200 px-8">
                    <button
                      type="button"
                      onClick={() => setActiveTab("Billing")}
                      className={`relative pb-2.5 text-base 2xl:text-lg font-black uppercase tracking-wider font-sans transition-colors cursor-pointer ${
                        activeTab === "Billing"
                          ? "text-black"
                          : "text-neutral-400 hover:text-black"
                      }`}
                    >
                      <span>Billing</span>
                      {activeTab === "Billing" && (
                        <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#cb7272]" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab("Utilization")}
                      className={`relative pb-2.5 text-base 2xl:text-lg font-black uppercase tracking-wider font-sans transition-colors cursor-pointer ${
                        activeTab === "Utilization"
                          ? "text-black"
                          : "text-neutral-400 hover:text-black"
                      }`}
                    >
                      <span>Utilization</span>
                      {activeTab === "Utilization" && (
                        <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#cb7272]" />
                      )}
                    </button>
                  </div>
                </div>

              {/* Large Dropzone Card: Dashed 1.5 pixel border #2F2839 */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`panel-card bg-white p-4 2xl:p-5 shadow-lg cursor-pointer transition-all ${
                  isDragging ? "ring-2 ring-[#1f5ea5]" : ""
                }`}
              >
                <div
                  className="w-full py-6 2xl:py-8 px-6 rounded-lg flex flex-col items-center justify-center text-center transition-colors hover:bg-neutral-50/60"
                  style={{
                    border: "1.5px dashed #2F2839",
                  }}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".csv"
                    className="hidden"
                    onChange={handleFileChange}
                  />

                  {/* Upload Icon in the Centre (Thin 1.5 pixel line) */}
                  <div className="w-12 h-12 2xl:w-14 2xl:h-14 rounded-full bg-neutral-100 flex items-center justify-center mb-2.5 text-[#2F2839]">
                    <Upload className="w-6 h-6 2xl:w-7 2xl:h-7 stroke-[1.5]" />
                  </div>

                  {/* Header text: Drop a CSV here */}
                  <h2 className="text-2xl 2xl:text-3xl font-black uppercase text-black font-sans tracking-tight mb-1">
                    {uploadedFile ? uploadedFile : "Drop a CSV here"}
                  </h2>

                  {/* Muted text: Up to 50 MB and 500,000 rows */}
                  <p className="text-xs 2xl:text-sm font-black uppercase text-neutral-500 font-sans tracking-wider mb-3.5">
                    {uploadedFile
                      ? "File loaded successfully • Ready to validate"
                      : "Up to 50 MB and 500,000 rows"}
                  </p>

                  {/* Small Ghost Button: Choose file */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="px-5 py-1.5 2xl:py-2 border-2 border-neutral-300 hover:border-black rounded text-xs 2xl:text-sm font-black uppercase tracking-wider text-black font-sans transition-colors cursor-pointer bg-white"
                  >
                    Choose file
                  </button>
                </div>
              </div>

              {/* Column Mapping Card */}
              <div className="panel-card bg-white p-4 2xl:p-5 shadow-lg flex flex-col justify-between">
                <div>
                  {/* Card Title: Column mapping */}
                  <h3 className="text-xl 2xl:text-2xl font-black uppercase text-black font-sans tracking-tight mb-2.5">
                    Column mapping
                  </h3>

                  {/* Table with 3 Columns: "Your column", "Maps to", "Status" */}
                  <div className="w-full">
                    {/* Table Header */}
                    <div className="grid grid-cols-12 py-2 px-3 border-b-2 border-neutral-200 text-xs 2xl:text-sm font-black uppercase tracking-wider text-neutral-500 font-sans">
                      <div className="col-span-5">Your column</div>
                      <div className="col-span-5">Maps to</div>
                      <div className="col-span-2 text-right pr-2">Status</div>
                    </div>

                    {/* Five Mapped Rows */}
                    <div className="divide-y divide-neutral-100">
                      {columnMappings.map((row, index) => (
                        <div
                          key={index}
                          className="grid grid-cols-12 items-center py-2 2xl:py-2.5 px-3 hover:bg-neutral-50/70 transition-colors font-mono text-xs 2xl:text-sm font-bold text-black"
                        >
                          {/* Your column */}
                          <div className="col-span-5 truncate text-black font-mono">
                            {row.yourCol}
                          </div>

                          {/* Maps to */}
                          <div className="col-span-5 truncate text-[#1f5ea5] font-mono">
                            {row.mapsTo}
                          </div>

                          {/* Status: Sage Tick */}
                          <div className="col-span-2 flex items-center justify-end pr-2">
                            <span
                              className="inline-flex items-center justify-center text-[#4ADE9A]"
                              title="Mapped"
                            >
                              <Check className="w-5 h-5 2xl:w-6 2xl:h-6 stroke-[2.5]" />
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Bar: Muted line left, Rose button right */}
                <div className="pt-3.5 mt-2 border-t border-neutral-200 flex items-center justify-between">
                  {/* Small muted line at bottom left */}
                  <span className="text-xs 2xl:text-sm font-mono font-bold text-neutral-500 uppercase tracking-wide">
                    Format found: AWS CUR
                  </span>

                  {/* Rose button at bottom right: Upload and validate */}
                  <button
                    type="button"
                    disabled={isValidating}
                    onClick={handleUploadAndValidate}
                    className="px-7 py-2.5 2xl:py-3 bg-[#f8b4b4] hover:bg-[#fca5a5] active:bg-[#f29898] text-black font-black text-sm 2xl:text-base uppercase tracking-wider rounded transition-all shadow-xs cursor-pointer font-sans"
                  >
                    {isValidating ? "Validating..." : "Upload and validate"}
                  </button>
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
        onSelectResult={() => router.push("/dashboard")}
      />
    </main>
  );
}
