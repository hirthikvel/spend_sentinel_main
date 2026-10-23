"use client";

import React from "react";
import { EvidenceChip } from "./EvidenceChip";
import { VerdictBadge } from "./VerdictBadge";
import { AnomalyItem } from "@/lib/types";

export type { AnomalyItem };

export const ANOMALIES_DATA: AnomalyItem[] = [
  {
    id: "anom-1",
    dotColor: "#c85a4b",
    service: "VPC US-EAST-1",
    delta: "+$198",
    verdict: "MISCONFIGURATION",
    confidence: 94,
    evidenceCode: "E1",
    description: "NAT Gateway idle data processing fee spike due to cross-AZ route table misconfiguration.",
    region: "US-EAST-1",
    environment: "PRODUCTION",
  },
  {
    id: "anom-2",
    dotColor: "#d99738",
    service: "EC2 US-WEST-2",
    delta: "+$285",
    verdict: "FORGOTTEN ENVIRONMENT",
    confidence: 88,
    evidenceCode: "E2",
    description: "Unused p3.2xlarge benchmarking instance running unattached across the weekend.",
    region: "US-WEST-2",
    environment: "STAGING",
  },
  {
    id: "anom-3",
    dotColor: "#60a377",
    service: "EC2 US-EAST-1",
    delta: "+$180",
    verdict: "HEALTHY GROWTH",
    confidence: 96,
    evidenceCode: "E3",
    description: "Autoscaling group scale-out triggered by legitimate organic traffic surge during launch.",
    region: "US-EAST-1",
    environment: "PRODUCTION",
  },
];

interface LatestAnomaliesProps {
  anomalies?: AnomalyItem[];
  onSelectAnomaly?: (anomaly: AnomalyItem) => void;
}

export function LatestAnomalies({
  anomalies,
  onSelectAnomaly,
}: LatestAnomaliesProps) {
  const items = anomalies !== undefined ? anomalies : [];

  return (
    <div className="panel-card bg-white p-3.5 2xl:p-4.5 select-none h-[185px] 2xl:h-[210px] flex flex-col justify-between">
      {/* Title */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl 2xl:text-2xl font-black tracking-wider text-black uppercase font-sans leading-none">
          LATEST ANOMALIES
        </h3>
        <span className="text-xs font-mono font-bold text-neutral-400 uppercase">
          {items.length} DETECTED
        </span>
      </div>

      {/* 3 List Rows or Empty State */}
      {items.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-2">
          <p className="text-sm font-black uppercase text-neutral-800 tracking-wider font-sans">
            No Anomalies Detected
          </p>
          <p className="text-xs text-neutral-500 font-sans mt-0.5 font-medium">
            All cloud spend is running within baseline parameters.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5 pt-1">
        {items.slice(0, 3).map((item) => (
          <div
            key={item.id}
            onClick={() => onSelectAnomaly?.(item)}
            className="flex items-center justify-between cursor-pointer group py-1 hover:bg-neutral-50 px-1.5 -mx-1.5 rounded transition-colors"
          >
            {/* Left: Coloured dot + Service Name + Evidence Chip */}
            <div className="flex items-center space-x-3">
              <span
                className="w-3 h-3 rounded-full inline-block shrink-0 shadow-xs"
                style={{ backgroundColor: item.dotColor }}
              />
              <span className="text-base 2xl:text-lg font-black tracking-wide text-black uppercase font-sans leading-none">
                {item.service}
              </span>
              <EvidenceChip id={item.evidenceCode} />
            </div>

            {/* Right: Delta in Mono font */}
            <div className="flex items-center space-x-2">
              <span className="text-base 2xl:text-lg font-black text-black font-mono tracking-tight leading-none">
                {item.delta}
              </span>
            </div>
          </div>
        ))}
        </div>
      )}
    </div>
  );
}
