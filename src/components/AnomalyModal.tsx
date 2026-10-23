"use client";

import React from "react";
import { AnomalyItem } from "./LatestAnomalies";
import { EvidenceChip } from "./EvidenceChip";
import { VerdictBadge } from "./VerdictBadge";
import { EvidenceAuditModal } from "./EvidenceAuditModal";
import Link from "next/link";
import { ArrowRight, Database } from "lucide-react";

interface AnomalyModalProps {
  anomaly: AnomalyItem | null;
  onClose: () => void;
}

export function AnomalyModal({ anomaly, onClose }: AnomalyModalProps) {
  const [auditRef, setAuditRef] = React.useState<string | null>(null);
  const [auditOpen, setAuditOpen] = React.useState(false);

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
              <EvidenceChip
                id={anomaly.evidenceCode || "E1"}
                onClick={() => {
                  setAuditRef(anomaly.evidenceCode || "E1");
                  setAuditOpen(true);
                }}
              />
              <span className="text-[10px] font-mono text-neutral-500 uppercase">
                CLICK TO AUDIT SQL PROOF
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
        <div className="flex items-center justify-between pt-2 border-t border-neutral-200">
          <button
            type="button"
            onClick={() => {
              setAuditRef(anomaly.evidenceCode || "E1");
              setAuditOpen(true);
            }}
            className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded text-xs font-mono font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <Database className="w-3.5 h-3.5" />
            <span>Audit SQL Proof</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 border border-neutral-300 text-xs font-black uppercase tracking-wider text-black hover:bg-neutral-100 transition-colors"
            >
              DISMISS
            </button>
            <Link
              href={`/anomalies/${anomaly.id}`}
              onClick={onClose}
              className="px-4 py-2 bg-[#1f5ea5] hover:bg-[#184980] text-white text-xs font-black uppercase tracking-wider transition-colors shadow-xs flex items-center space-x-1.5"
            >
              <span>Drill Into Finding</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Embedded Evidence Audit Modal */}
      <EvidenceAuditModal
        isOpen={auditOpen}
        onClose={() => setAuditOpen(false)}
        evidenceRef={auditRef}
        anomalyId={anomaly.id}
      />
    </div>
  );
}
