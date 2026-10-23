"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { SerratedStripes } from "@/components/SerratedStripes";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { SearchPalette } from "@/components/SearchPalette";
import { VerdictBadge, VerdictType } from "@/components/VerdictBadge";
import { AnomalyModal } from "@/components/AnomalyModal";
import { AnomalyItem } from "@/components/LatestAnomalies";

interface AnomalyRowData {
  id: string;
  date: string;
  service: string;
  region: string;
  expected: string;
  observed: string;
  delta: string;
  severity: "High" | "Medium" | "Low";
  verdict: VerdictType;
  confidence: number;
  status: "Open" | "Investigating" | "Resolved";
  borderColor: string;
  isHoveredDefault?: boolean;
  evidenceChip: string;
  rootCause: string;
}

export default function AnomaliesPage() {
  const router = useRouter();
  const [currentMenu, setCurrentMenu] = useState("ANOMALIES");
  const [selectedRange, setSelectedRange] = useState("LAST 60 DAYS");
  const [selectedFilter, setSelectedFilter] = useState<
    "All" | "Misconfiguration" | "Forgotten" | "Growth"
  >("All");
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedAnomaly, setSelectedAnomaly] = useState<AnomalyItem | null>(null);
  const [hoveredRowId, setHoveredRowId] = useState<string>("anom-ec2-2"); // Row 2 hovered by default as specified

  const anomaliesList: AnomalyRowData[] = [
    {
      id: "anom-vpc-1",
      date: "Oct 12",
      service: "Amazon VPC",
      region: "us-east-1",
      expected: "$23",
      observed: "$221",
      delta: "+$198",
      severity: "High",
      verdict: "MISCONFIGURATION",
      confidence: 88,
      status: "Open",
      borderColor: "#FF6B6B",
      evidenceChip: "E3",
      rootCause:
        "NAT Gateway cross-AZ data transfer loop configured without VPC gateway endpoints",
    },
    {
      id: "anom-ec2-2",
      date: "Oct 15",
      service: "Amazon EC2",
      region: "us-west-2",
      expected: "$29",
      observed: "$314",
      delta: "+$285",
      severity: "High",
      verdict: "FORGOTTEN ENVIRONMENT",
      confidence: 81,
      status: "Open",
      borderColor: "#FFB547",
      isHoveredDefault: true,
      evidenceChip: "E5",
      rootCause:
        "Orphaned GPU dev training cluster running 24/7 with zero active CPU/network utilization",
    },
    {
      id: "anom-ec2-3",
      date: "Oct 18",
      service: "Amazon EC2",
      region: "us-east-1",
      expected: "$512",
      observed: "$692",
      delta: "+$180",
      severity: "Medium",
      verdict: "HEALTHY GROWTH",
      confidence: 74,
      status: "Open",
      borderColor: "#4ADE9A",
      evidenceChip: "E1",
      rootCause:
        "Q4 customer load expansion causing autoscaling group surge backed by verified revenue",
    },
  ];

  const filteredAnomalies = anomaliesList.filter((item) => {
    if (selectedFilter === "All") return true;
    if (selectedFilter === "Misconfiguration") return item.verdict === "MISCONFIGURATION";
    if (selectedFilter === "Forgotten") return item.verdict === "FORGOTTEN ENVIRONMENT";
    if (selectedFilter === "Growth") return item.verdict === "HEALTHY GROWTH";
    return true;
  });

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
              {/* Header Row: Title "Anomalies" on Left, Segmented Control on Right */}
              <div className="panel-card bg-white px-5 py-3 2xl:px-6 2xl:py-3.5 flex items-center justify-between shadow-lg">
                <h1 className="text-3xl 2xl:text-4xl font-black uppercase text-black leading-none font-sans tracking-tight">
                  Anomalies
                </h1>

                {/* Segmented Control with Four Options: All (selected), Misconfiguration, Forgotten, Growth */}
                <div className="inline-flex items-center border-2 border-neutral-200 rounded p-0.5 bg-neutral-100/70">
                  {(
                    ["All", "Misconfiguration", "Forgotten", "Growth"] as const
                  ).map((option) => {
                    const isSelected = selectedFilter === option;
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setSelectedFilter(option)}
                        className={`px-3.5 py-1.5 text-xs 2xl:text-sm font-black uppercase tracking-wider font-sans rounded-xs transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#1f5ea5] text-white shadow-xs"
                            : "text-neutral-600 hover:text-black bg-transparent"
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Large Card Holding the Anomalies Table */}
              <div className="panel-card bg-white shadow-2xl overflow-hidden flex flex-col">
                <div className="w-full overflow-x-auto">
                  <table className="w-full text-left border-collapse select-none">
                    {/* Sticky and Muted Header Row */}
                    <thead>
                      <tr className="sticky top-0 z-20 bg-neutral-100/90 border-b-2 border-neutral-200 text-xs 2xl:text-sm font-black uppercase tracking-wider text-neutral-500 font-sans backdrop-blur-xs">
                        <th className="py-3 px-4 w-28">Date</th>
                        <th className="py-3 px-4 w-44">Service</th>
                        <th className="py-3 px-4 w-32">Region</th>
                        <th className="py-3 px-4 text-right w-28 font-sans">Expected</th>
                        <th className="py-3 px-4 text-right w-28 font-sans">Observed</th>
                        <th className="py-3 px-4 text-right w-28 font-sans">Delta</th>
                        <th className="py-3 px-4 text-center w-28">Severity</th>
                        <th className="py-3 px-4 w-64">Verdict</th>
                        <th className="py-3 px-4 text-center w-24">Status</th>
                      </tr>
                    </thead>

                    {/* Table Body */}
                    <tbody className="divide-y divide-neutral-200/80">
                      {filteredAnomalies.map((row) => {
                        const isHovered = hoveredRowId === row.id;
                        // Row 2 displays hover surface colour #251F2D
                        const isDarkRow = isHovered && (row.id === "anom-ec2-2" || hoveredRowId === row.id);

                        return (
                          <tr
                            key={row.id}
                            onMouseEnter={() => setHoveredRowId(row.id)}
                            onClick={() => {
                              if (row.id === "anom-ec2-2") {
                                router.push("/anomalies/oct-15");
                              } else {
                                router.push(`/anomalies/${row.id}`);
                              }
                            }}
                            className={`cursor-pointer transition-colors relative group font-sans ${
                              isDarkRow
                                ? "text-white"
                                : "text-black hover:bg-neutral-50/80"
                            }`}
                            style={{
                              backgroundColor: isDarkRow ? "#251F2D" : "transparent",
                              borderLeft: `4px solid ${row.borderColor}`,
                            }}
                          >
                            {/* Date */}
                            <td className="py-3.5 px-4 text-xs 2xl:text-sm font-black uppercase tracking-wider font-sans whitespace-nowrap">
                              {row.date}
                            </td>

                            {/* Service */}
                            <td className="py-3.5 px-4 text-xs 2xl:text-sm font-black uppercase tracking-wider font-sans whitespace-nowrap">
                              {row.service}
                            </td>

                            {/* Region */}
                            <td
                              className={`py-3.5 px-4 text-xs 2xl:text-sm font-mono font-bold uppercase whitespace-nowrap ${
                                isDarkRow ? "text-neutral-300" : "text-neutral-600"
                              }`}
                            >
                              {row.region}
                            </td>

                            {/* Expected (Right-aligned in Mono) */}
                            <td
                              className={`py-3.5 px-4 text-right text-xs 2xl:text-sm font-mono font-bold whitespace-nowrap ${
                                isDarkRow ? "text-neutral-300" : "text-neutral-700"
                              }`}
                            >
                              {row.expected}
                            </td>

                            {/* Observed (Right-aligned in Mono) */}
                            <td
                              className={`py-3.5 px-4 text-right text-xs 2xl:text-sm font-mono font-bold whitespace-nowrap ${
                                isDarkRow ? "text-white" : "text-black"
                              }`}
                            >
                              {row.observed}
                            </td>

                            {/* Delta (Right-aligned in Mono) */}
                            <td className="py-3.5 px-4 text-right text-xs 2xl:text-sm font-mono font-black text-[#FF6B6B] whitespace-nowrap">
                              {row.delta}
                            </td>

                            {/* Severity */}
                            <td className="py-3.5 px-4 text-center whitespace-nowrap">
                              <span
                                className={`px-2 py-0.5 text-[10px] 2xl:text-xs font-black uppercase tracking-wider rounded font-sans ${
                                  row.severity === "High"
                                    ? isDarkRow
                                      ? "bg-red-500/30 text-red-300 border border-red-500/40"
                                      : "bg-red-100 text-red-800 border border-red-300"
                                    : isDarkRow
                                    ? "bg-amber-500/30 text-amber-300 border border-amber-500/40"
                                    : "bg-amber-100 text-amber-800 border border-amber-300"
                                }`}
                              >
                                {row.severity}
                              </span>
                            </td>

                            {/* Verdict Badge */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <div className="flex flex-col gap-0.5">
                                <VerdictBadge
                                  verdict={row.verdict}
                                  confidencePercent={row.confidence}
                                  size="sm"
                                  className={isDarkRow ? "bg-white/10 text-white border-white/20" : ""}
                                />
                              </div>
                            </td>

                            {/* Status */}
                            <td className="py-3.5 px-4 text-center whitespace-nowrap">
                              <span
                                className={`px-2.5 py-1 text-[11px] font-black uppercase tracking-wider rounded-sm font-sans ${
                                  isDarkRow
                                    ? "bg-white/15 text-white border border-white/20"
                                    : "bg-neutral-100 text-neutral-800 border border-neutral-300"
                                }`}
                              >
                                {row.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Table Footer Summary Bar */}
                <div className="py-3 px-6 bg-neutral-50/80 border-t border-neutral-200 flex items-center justify-between text-xs font-mono font-bold text-neutral-500 uppercase">
                  <span>SHOWING {filteredAnomalies.length} OF 3 VERIFIED ANOMALIES</span>
                  <span>CLICK ANY ROW FOR ROOT CAUSE & EVIDENCE DEEP DIVE</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Anomaly Detail Modal */}
      <AnomalyModal
        anomaly={selectedAnomaly}
        onClose={() => setSelectedAnomaly(null)}
      />

      {/* Global Search Palette (Ctrl+K) */}
      <SearchPalette
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectResult={(item) => {
          const match = anomaliesList.find((a) => item.includes(a.service));
          if (match) {
            setSelectedAnomaly({
              id: match.id,
              service: match.service,
              delta: match.delta,
              verdict: match.verdict,
              confidence: match.confidence,
              evidenceCode: match.evidenceChip,
              description: match.rootCause,
              dotColor: match.borderColor,
              region: match.region,
              environment: "PRODUCTION",
            });
          }
        }}
      />
    </main>
  );
}
