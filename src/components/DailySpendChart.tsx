"use client";

import React, { useState, useMemo } from "react";
import { SpendDataPoint } from "@/lib/types";

interface DailySpendChartProps {
  chartPoints?: SpendDataPoint[];
  periodDays?: number;
  onDotClick?: (anomalyId: string) => void;
}

export function DailySpendChart({
  chartPoints,
  periodDays = 60,
  onDotClick,
}: DailySpendChartProps) {
  // Benchmark 60-day coordinates matching reference image
  const defaultPoints = [
    { x: 10, y: 130 },
    { x: 30, y: 125 },
    { x: 50, y: 128 },
    { x: 75, y: 120 },
    { x: 95, y: 124 },
    { x: 120, y: 118 },
    { x: 145, y: 110 },
    { x: 170, y: 122 },
    { x: 195, y: 126 },
    { x: 220, y: 120 },
    { x: 245, y: 105 },
    { x: 270, y: 88, anomaly: { id: "anom-1", color: "#c85a4b", service: "VPC US-EAST-1", delta: "+$198" } },
    { x: 295, y: 108 },
    { x: 320, y: 124 },
    { x: 345, y: 122 },
    { x: 370, y: 115 },
    { x: 395, y: 110 },
    { x: 420, y: 116 },
    { x: 445, y: 120 },
    { x: 470, y: 112 },
    { x: 495, y: 102 },
    { x: 520, y: 110 },
    { x: 545, y: 122 },
    { x: 570, y: 120 },
    { x: 595, y: 108 },
    { x: 620, y: 118 },
    { x: 645, y: 122 },
    { x: 670, y: 115 },
    { x: 695, y: 86, anomaly: { id: "anom-2", color: "#d99738", service: "EC2 US-WEST-2", delta: "+$285" } },
    { x: 720, y: 112 },
    { x: 745, y: 124 },
    { x: 770, y: 114 },
    { x: 795, y: 106 },
    { x: 820, y: 116 },
    { x: 845, y: 88, anomaly: { id: "anom-3", color: "#60a377", service: "EC2 US-EAST-1", delta: "+$180" } },
    { x: 870, y: 112 },
    { x: 895, y: 120 },
    { x: 920, y: 115 },
    { x: 940, y: 118 },
  ];

  // Map dynamic chartPoints if provided, or use default coordinates
  const svgCoords = useMemo(() => {
    if (!chartPoints || chartPoints.length === 0) {
      return defaultPoints;
    }

    const minX = 15;
    const maxX = 935;
    const minY = 65;
    const maxY = 135;

    // Find min and max amounts
    let minVal = Infinity;
    let maxVal = -Infinity;
    chartPoints.forEach((p) => {
      if (p.amount < minVal) minVal = p.amount;
      if (p.amount > maxVal) maxVal = p.amount;
    });
    if (minVal === maxVal) {
      minVal -= 50;
      maxVal += 50;
    }

    const count = chartPoints.length;
    return chartPoints.map((pt, idx) => {
      const x = minX + (idx / Math.max(count - 1, 1)) * (maxX - minX);
      const frac = (pt.amount - minVal) / (maxVal - minVal);
      // Invert Y because SVG 0 is top
      const y = maxY - frac * (maxY - minY);

      return {
        x: Math.round(x),
        y: Math.round(y),
        anomaly: pt.anomaly
          ? {
              id: pt.anomaly.id,
              color: pt.anomaly.dotColor,
              service: pt.anomaly.service,
              delta: pt.anomaly.delta,
            }
          : undefined,
      };
    });
  }, [chartPoints]);

  // Generate smooth spline path
  const splinePath = useMemo(() => {
    return svgCoords.reduce((acc, pt, i, arr) => {
      if (i === 0) return `M ${pt.x} ${pt.y}`;
      const prev = arr[i - 1];
      const mx = (prev.x + pt.x) / 2;
      return `${acc} C ${mx} ${prev.y}, ${mx} ${pt.y}, ${pt.x} ${pt.y}`;
    }, "");
  }, [svgCoords]);

  // Extract anomaly dots
  const anomalyDots = useMemo(() => {
    return svgCoords
      .map((pt) => {
        if (!pt.anomaly) return null;
        return {
          ...pt.anomaly,
          x: pt.x,
          y: pt.y,
          bandX: pt.x - 14,
          bandW: 28,
        };
      })
      .filter(Boolean) as Array<{
      id: string;
      color: string;
      service: string;
      delta: string;
      x: number;
      y: number;
      bandX: number;
      bandW: number;
    }>;
  }, [svgCoords]);

  // Active tooltip defaults to the ochre anomaly dot (or middle dot)
  const [activeTooltipId, setActiveTooltipId] = useState<string>("anom-2");

  const activeDot = anomalyDots.find((d) => d.id === activeTooltipId) || anomalyDots[1] || anomalyDots[0];

  return (
    <div className="panel-card bg-white p-3.5 2xl:p-4 select-none relative h-[225px] 2xl:h-[250px] flex flex-col justify-between">
      {/* Title - Enlarge bold Burbank font */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl 2xl:text-2xl font-black tracking-wider text-black uppercase font-sans leading-none">
          DAILY SPEND
        </h3>
        {chartPoints && chartPoints.length > 0 && (
          <span className="text-[11px] font-mono font-bold text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200 uppercase">
            {chartPoints.length} DATES SCANNED FROM CSV
          </span>
        )}
      </div>

      {chartPoints !== undefined && chartPoints.length === 0 ? (
        <div className="relative w-full h-[165px] 2xl:h-[190px] mt-1 flex flex-col items-center justify-center border-2 border-dashed border-neutral-300 rounded bg-neutral-50/80 p-4 text-center">
          <p className="text-sm font-black uppercase text-neutral-800 tracking-wider font-sans mb-1">
            No Billing CSV Data Ingested Yet
          </p>
          <p className="text-xs text-neutral-500 font-sans max-w-md mb-3 font-medium">
            Daily spend graph is strictly generated from uploaded CSV billing records and scanned dates.
          </p>
          <a
            href="/upload"
            className="px-4 py-1.5 bg-[#1f5ea5] hover:bg-[#184980] text-white text-xs font-black uppercase tracking-wider rounded font-sans transition-colors shadow-xs"
          >
            Upload Billing CSV
          </a>
        </div>
      ) : (
        /* Line Chart Area */
        <div className="relative w-full h-[165px] 2xl:h-[190px] mt-1">
          <svg
            viewBox="0 0 950 160"
            className="w-full h-full overflow-visible"
            preserveAspectRatio="none"
          >
            {/* Faint Horizontal Grid Lines */}
            <line x1="10" y1="36" x2="940" y2="36" stroke="#e5e7eb" strokeWidth="1" />
            <line x1="10" y1="72" x2="940" y2="72" stroke="#e5e7eb" strokeWidth="1" />
            <line x1="10" y1="108" x2="940" y2="108" stroke="#e5e7eb" strokeWidth="1" />
            <line x1="10" y1="144" x2="940" y2="144" stroke="#e5e7eb" strokeWidth="1" />

          {/* Vertical Faint Bands behind dots */}
          {anomalyDots.map((dot) => (
            <rect
              key={`band-${dot.id}`}
              x={dot.bandX}
              y="28"
              width={dot.bandW}
              height="116"
              fill={dot.color ? `${dot.color}2e` : "rgba(200, 90, 75, 0.16)"}
              rx="2"
            />
          ))}

          {/* Main Rose Line */}
          <path
            d={splinePath}
            fill="none"
            stroke="#cb7272"
            strokeWidth="2.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Anomaly Dots */}
          {anomalyDots.map((dot) => (
            <g
              key={`dot-${dot.id}`}
              className="cursor-pointer transition-transform hover:scale-125"
              onClick={() => {
                setActiveTooltipId(dot.id);
                onDotClick?.(dot.id);
              }}
            >
              <circle
                cx={dot.x}
                cy={dot.y}
                r="8.5"
                fill={dot.color}
                stroke="#ffffff"
                strokeWidth="2.5"
              />
            </g>
          ))}
        </svg>

        {/* Tooltip Card floating above the selected dot */}
        {activeDot && (
          <div
            className="absolute z-30 tooltip-card px-4 py-2 pointer-events-none transition-all duration-150"
            style={{
              left: `${(activeDot.x / 950) * 100}%`,
              top: "-12px",
              transform: "translateX(-50%)",
            }}
          >
            <p className="text-xs 2xl:text-sm font-black tracking-wider text-black uppercase leading-tight font-sans">
              {activeDot.service}
            </p>
            <p className="text-xs 2xl:text-sm font-black tracking-wider text-black font-mono leading-tight">
              {activeDot.delta}
            </p>
          </div>
        )}
      </div>
      )}
    </div>
  );
}
