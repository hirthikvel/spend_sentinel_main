"use client";

import React from "react";

export type VerdictType = "MISCONFIGURATION" | "FORGOTTEN ENVIRONMENT" | "HEALTHY GROWTH";

interface VerdictBadgeProps {
  verdict: VerdictType;
  confidencePercent: number; // e.g. 94
  className?: string;
  size?: "sm" | "md";
}

const VERDICT_CONFIG = {
  MISCONFIGURATION: {
    color: "#FF6B6B",
    bgClass: "bg-red-50",
    borderClass: "border-[#FF6B6B]/40",
    textClass: "text-neutral-900",
  },
  "FORGOTTEN ENVIRONMENT": {
    color: "#FFB547",
    bgClass: "bg-amber-50",
    borderClass: "border-[#FFB547]/40",
    textClass: "text-neutral-900",
  },
  "HEALTHY GROWTH": {
    color: "#4ADE9A",
    bgClass: "bg-emerald-50",
    borderClass: "border-[#4ADE9A]/40",
    textClass: "text-neutral-900",
  },
};

export function VerdictBadge({
  verdict,
  confidencePercent,
  className = "",
  size = "md",
}: VerdictBadgeProps) {
  const cfg = VERDICT_CONFIG[verdict] || VERDICT_CONFIG["MISCONFIGURATION"];
  const radius = 6;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (confidencePercent / 100) * circumference;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 border ${cfg.borderClass} ${cfg.bgClass} rounded-none shadow-xs ${className}`}
    >
      {/* Coloured dot */}
      <span
        className="w-2 h-2 rounded-full inline-block shrink-0"
        style={{ backgroundColor: cfg.color }}
      />

      {/* Uppercase Neuf text */}
      <span className="font-bold text-[10px] tracking-wider text-black uppercase">
        {verdict}
      </span>

      {/* Thin circular ring showing confidence percent */}
      <div className="relative inline-flex items-center justify-center w-4 h-4 ml-0.5 shrink-0" title={`Confidence: ${confidencePercent}%`}>
        <svg className="w-4 h-4 -rotate-90" viewBox="0 0 16 16">
          <circle
            cx="8"
            cy="8"
            r={radius}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="1.5"
          />
          <circle
            cx="8"
            cy="8"
            r={radius}
            fill="none"
            stroke={cfg.color}
            strokeWidth="1.5"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
      </div>
      <span className="text-[9px] font-mono font-bold text-neutral-600">
        {confidencePercent}%
      </span>
    </div>
  );
}
