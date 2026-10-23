"use client";

import React from "react";

import { SavingsItem } from "@/lib/types";

export type { SavingsItem };

export const TOP_SAVINGS_DATA: SavingsItem[] = [
  {
    id: "save-1",
    resource: "I-STG-GPU-01",
    amount: "$2,850",
    action: "STOP UNATTACHED GPU INSTANCE",
    service: "EC2",
    environment: "STAGING",
  },
  {
    id: "save-2",
    resource: "RDS-ANALYTICS-OLD",
    amount: "$1,920",
    action: "DOWNGRADE OR SNAPSHOT DB",
    service: "RDS",
    environment: "PRODUCTION",
  },
  {
    id: "save-3",
    resource: "I-API-03",
    amount: "$780",
    action: "RIGHTSIZE OVERPROVISIONED INSTANCE",
    service: "EC2",
    environment: "STAGING",
  },
];

interface TopSavingsProps {
  savings?: SavingsItem[];
  onSelectSavings?: (item: SavingsItem) => void;
}

export function TopSavings({ savings, onSelectSavings }: TopSavingsProps) {
  const items = savings && savings.length > 0 ? savings : TOP_SAVINGS_DATA;

  return (
    <div className="panel-card bg-white p-3.5 2xl:p-4.5 select-none h-[185px] 2xl:h-[210px] flex flex-col justify-between">
      {/* Title */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl 2xl:text-2xl font-black tracking-wider text-black uppercase font-sans leading-none">
          TOP SAVINGS
        </h3>
        <span className="text-xs font-mono font-bold text-neutral-400 uppercase">
          {items.length} ACTIONS READY
        </span>
      </div>

      {/* 3 List Rows */}
      <div className="space-y-2.5 pt-1">
        {items.slice(0, 3).map((item) => (
          <div
            key={item.resource}
            onClick={() => onSelectSavings?.(item)}
            className="flex items-center justify-between cursor-pointer group py-1 hover:bg-neutral-50 px-1.5 -mx-1.5 rounded transition-colors"
          >
            {/* Resource Name */}
            <span className="text-base 2xl:text-lg font-black tracking-wide text-black uppercase font-sans leading-none">
              {item.resource}
            </span>

            {/* Savings Amount in Mono */}
            <span className="text-base 2xl:text-lg font-black text-black font-mono tracking-tight leading-none">
              {item.amount}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
