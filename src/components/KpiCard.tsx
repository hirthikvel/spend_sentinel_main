"use client";

import React from "react";

interface KpiCardProps {
  caption: string;
  value: string;
  pillText: string;
  pillType?: "outline" | "rose";
  sparklinePath: string;
  onClick?: () => void;
}

export function KpiCard({
  caption,
  value,
  pillText,
  pillType = "outline",
  sparklinePath,
  onClick,
}: KpiCardProps) {
  return (
    <div
      onClick={onClick}
      className="panel-card bg-white p-3.5 2xl:p-4 flex flex-col justify-between h-[135px] 2xl:h-[155px] select-none cursor-pointer hover:-translate-y-0.5 transition-transform"
    >
      <div>
        {/* Caption */}
        <p className="text-xs 2xl:text-sm font-black tracking-wider text-black uppercase font-sans">
          {caption}
        </p>
        {/* Value - Massive Burbank Number taking over card space */}
        <h3 className="text-4xl 2xl:text-5xl 3xl:text-6xl font-black tracking-tight text-black mt-0.5 leading-none font-sans">
          {value}
        </h3>
      </div>

      {/* Sparkline and Pill */}
      <div className="flex items-center justify-between pt-0.5">
        {/* Sparkline */}
        <svg
          className="w-20 2xl:w-24 h-5 2xl:h-6 overflow-visible"
          viewBox="0 0 70 20"
          fill="none"
        >
          <path
            d={sparklinePath}
            stroke="#171717"
            strokeWidth="2.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/* Pill */}
        {pillType === "rose" ? (
          <span className="px-2.5 py-0.5 rounded-full bg-[#f8b4b4] text-black font-black text-xs tracking-wider uppercase font-sans">
            {pillText}
          </span>
        ) : (
          <span className="px-2.5 py-0.5 rounded-full border-2 border-black text-black font-black text-xs tracking-wider uppercase font-sans">
            {pillText}
          </span>
        )}
      </div>
    </div>
  );
}

import { KpiMetrics } from "@/lib/types";

interface KpiCardsRowProps {
  kpis?: KpiMetrics;
  periodDays?: number;
  onCardClick?: (cardIndex: number) => void;
}

export function KpiCardsRow({
  kpis,
  periodDays = 30,
  onCardClick,
}: KpiCardsRowProps) {
  const currentKpis: KpiMetrics = kpis || {
    spendTotal: "$27,400",
    spendGrowthPill: "+9%",
    openAnomaliesCount: 3,
    openAnomaliesPill: "2 HIGH",
    idleResourcesCount: 8,
    idleResourcesPill: "REVIEW",
    monthlySavingTotal: "$12,100",
    monthlySavingPill: "SAVINGS",
  };

  const cards: KpiCardProps[] = [
    {
      caption: `SPEND, LAST ${periodDays} DAYS`,
      value: currentKpis.spendTotal,
      pillText: currentKpis.spendGrowthPill,
      pillType: "outline",
      sparklinePath: "M 2 12 Q 10 4 18 11 T 34 10 T 50 12 T 66 6",
    },
    {
      caption: "OPEN ANOMALIES",
      value: String(currentKpis.openAnomaliesCount),
      pillText: currentKpis.openAnomaliesPill,
      pillType: "outline",
      sparklinePath: "M 2 14 Q 14 13 24 10 T 40 4 T 52 14 T 66 11",
    },
    {
      caption: "IDLE RESOURCES",
      value: String(currentKpis.idleResourcesCount),
      pillText: currentKpis.idleResourcesPill,
      pillType: "outline",
      sparklinePath: "M 2 15 Q 12 15 20 12 T 34 8 T 46 14 T 66 12",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2.5 2xl:gap-3 w-full">
      {cards.map((card, idx) => (
        <KpiCard
          key={card.caption}
          {...card}
          onClick={() => onCardClick?.(idx)}
        />
      ))}
    </div>
  );
}
