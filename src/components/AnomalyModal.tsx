"use client";

import React from "react";
import { AnomalyItem } from "./LatestAnomalies";
import { EvidenceChip } from "./EvidenceChip";
import { VerdictBadge } from "./VerdictBadge";

interface AnomalyModalProps {
  anomaly: AnomalyItem | null;
  onClose: () => void;
}

export function AnomalyModal({ anomaly, onClose }: AnomalyModalProps) {
  if (!anomaly) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="panel-card bg-white w-full max-w-lg p-6 relative select-none">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-neutral-200 pb-4 mb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span
                className="w-3 h-3 rounded-full inline-block"
                style={{ backgroundColor: anomaly.dotColor }}
              />
              <h3 className="text-lg font-black tracking-tight text-black uppercase font-sans">
                {anomaly.service}
              </h3>
            </div>
            <p className="text-xs font-mono font-bold text-neutral-500 mt-1 uppercase">
              ANOMALY INCIDENT DELTA: {anomaly.delta}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded border border-neutral-300 flex items-center justify-center font-mono font-bold text-sm text-neutral-600 hover:bg-neutral-100"
          >
            ✕
          </button>
        </div>

        {/* Verdict Badge & Evidence Chip Demonstration */}
        <div className="bg-neutral-50 border border-neutral-200 p-4 rounded mb-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-neutral-600">
              VERDICT CLASSIFICATION:
            </span>
            <VerdictBadge
              verdict={anomaly.verdict}
              confidencePercent={anomaly.confidence}
            />
          </div>

          <div className="flex items-center justify-between border-t border-neutral-200 pt-2.5">
            <span className="text-[11px] font-black uppercase tracking-wider text-neutral-600">
              EVIDENCE TAG:
            </span>
            <div className="flex items-center space-x-2">
              <EvidenceChip id={anomaly.evidenceCode} />
              <span className="text-[10px] font-mono text-neutral-500 uppercase">
                VERIFIED TELEMETRY CHIP
              </span>
            </div>
          </div>
        </div>

        {/* Incident Summary */}
        <div className="mb-6">
          <h4 className="text-[11px] font-black uppercase tracking-wider text-neutral-700 mb-1.5">
            ROOT CAUSE SUMMARY
          </h4>
          <p className="text-xs text-neutral-800 leading-relaxed font-sans">
            {anomaly.description}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-neutral-300 text-xs font-black uppercase tracking-wider text-black hover:bg-neutral-100 transition-colors"
          >
            DISMISS
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#1f5ea5] text-white text-xs font-black uppercase tracking-wider hover:bg-[#184980] transition-colors shadow-xs"
          >
            APPLY REMEDIATION
          </button>
        </div>
      </div>
    </div>
  );
}
