"use client";

import React, { useState, useEffect } from "react";
import { Check, Database, X, Copy, ExternalLink, Terminal } from "lucide-react";

interface EvidenceAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  evidenceRef: string | null;
  anomalyId?: string | null;
}

export function EvidenceAuditModal({
  isOpen,
  onClose,
  evidenceRef,
  anomalyId,
}: EvidenceAuditModalProps) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  useEffect(() => {
    if (!isOpen || !evidenceRef) return;

    setLoading(true);
    const params = new URLSearchParams({ ref: evidenceRef });
    if (anomalyId) params.append("anomaly_id", anomalyId);

    fetch(`/api/evidence?${params.toString()}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setData(json);
      })
      .catch((err) => console.warn("Failed to load evidence details:", err))
      .finally(() => setLoading(false));
  }, [isOpen, evidenceRef, anomalyId]);

  if (!isOpen || !evidenceRef) return null;

  const copyToClipboard = () => {
    if (data?.sqlProof) {
      navigator.clipboard.writeText(data.sqlProof);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="panel-card bg-white w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl relative select-none overflow-hidden rounded-xl border-2 border-neutral-800"
        style={{
          boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.5), 0 0 20px rgba(31, 94, 165, 0.2)",
        }}
      >
        {/* Top Header */}
        <div className="bg-[#0f172a] text-white px-6 py-4 flex items-center justify-between border-b border-neutral-700">
          <div className="flex items-center space-x-3">
            <span className="px-2.5 py-1 bg-indigo-500/30 text-indigo-300 font-mono font-black text-sm rounded border border-indigo-400/40">
              {evidenceRef}
            </span>
            <div>
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4 text-emerald-400" />
                <h3 className="text-base font-black uppercase tracking-wider text-white font-sans">
                  Evidence Audit Verification
                </h3>
              </div>
              <p className="text-[11px] font-mono text-neutral-400 mt-0.5">
                Deterministic Grounding Ledger • Proving the underlying math
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Provenance Badge */}
            <span className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 font-mono text-xs font-bold tracking-wider">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>COMPUTED BY SQL, NOT BY AI</span>
            </span>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center justify-center font-mono font-bold text-sm transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5 bg-[#fafafa]">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 border-3 border-[#1f5ea5] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-mono font-bold text-neutral-600 uppercase">
                Querying Underlying FOCUS Database...
              </p>
            </div>
          ) : (
            <>
              {/* Claim Statement Banner */}
              <div className="bg-white p-4 rounded-lg border-2 border-neutral-200 shadow-xs">
                <span className="text-[10px] font-black uppercase tracking-wider text-neutral-500 block mb-1">
                  Claim Tethered to Evidence Chip {evidenceRef}:
                </span>
                <p className="text-sm font-bold text-black font-sans leading-relaxed">
                  {data?.evidence?.label || `Telemetry metric proof for ${evidenceRef}`}
                </p>
                {data?.evidence?.valueInr && (
                  <div className="mt-2 flex items-center space-x-3 text-xs font-mono font-bold">
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Calculated Sum: {data.evidence.valueInr} ({data.focusSummary?.totalSumUsd})
                    </span>
                    <span className="text-neutral-500">
                      Service: {data.focusSummary?.targetService} • Region: {data.focusSummary?.targetRegion}
                    </span>
                  </div>
                )}
              </div>

              {/* Exact SQL Query Block */}
              <div className="bg-[#0f172a] rounded-lg p-4 text-white border border-neutral-800 relative">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-800 text-xs font-mono text-neutral-400">
                  <div className="flex items-center space-x-2">
                    <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Exact PostgreSQL / FOCUS Query Executed:</span>
                  </div>
                  <button
                    type="button"
                    onClick={copyToClipboard}
                    className="flex items-center space-x-1 hover:text-white transition-colors text-[11px]"
                  >
                    {copiedSql ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy SQL</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="font-mono text-xs text-emerald-300 overflow-x-auto whitespace-pre leading-relaxed">
                  {data?.sqlProof || `-- Querying billing_line_items for ${evidenceRef}`}
                </pre>
              </div>

              {/* Underlying FOCUS Database Rows Table */}
              <div className="bg-white rounded-lg border-2 border-neutral-200 shadow-xs overflow-hidden">
                <div className="px-4 py-3 bg-neutral-100 border-b border-neutral-200 flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-black font-sans">
                    Underlying FOCUS Database Line Items ({data?.focusRows?.length || 0} rows retrieved)
                  </span>
                  <span className="text-[11px] font-mono font-bold text-neutral-500">
                    FOCUS 1.0 Specification
                  </span>
                </div>

                <div className="overflow-x-auto max-h-60 overflow-y-auto">
                  <table className="w-full text-left border-collapse font-sans text-xs">
                    <thead>
                      <tr className="bg-neutral-50 border-b border-neutral-200 text-[10px] font-black uppercase tracking-wider text-neutral-600 font-mono">
                        <th className="py-2 px-3">Date</th>
                        <th className="py-2 px-3">Resource ID</th>
                        <th className="py-2 px-3">Service</th>
                        <th className="py-2 px-3">Region</th>
                        <th className="py-2 px-3">Usage Type</th>
                        <th className="py-2 px-3 text-right">Cost (INR)</th>
                        <th className="py-2 px-3 text-right">Cost (USD)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 font-mono">
                      {(data?.focusRows || []).map((row: any, idx: number) => (
                        <tr key={row.id || idx} className="hover:bg-blue-50/50 transition-colors">
                          <td className="py-2 px-3 font-bold text-neutral-900">{row.usageDate}</td>
                          <td className="py-2 px-3 font-bold text-black">{row.resourceId}</td>
                          <td className="py-2 px-3 text-neutral-700">{row.service}</td>
                          <td className="py-2 px-3 text-neutral-500">{row.region}</td>
                          <td className="py-2 px-3 text-neutral-600">{row.usageType}</td>
                          <td className="py-2 px-3 text-right font-black text-black">{row.costInr}</td>
                          <td className="py-2 px-3 text-right text-neutral-500">{row.costUsd}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="px-4 py-2.5 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between text-xs font-mono font-bold">
                  <span className="text-neutral-500">
                    Aggregated Verified Total:
                  </span>
                  <div className="space-x-3">
                    <span className="text-black font-black text-sm">
                      {data?.focusSummary?.totalSumInr}
                    </span>
                    <span className="text-neutral-500">
                      ({data?.focusSummary?.totalSumUsd})
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="bg-neutral-100 px-6 py-3 border-t border-neutral-200 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-mono text-neutral-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Tethered to immutable evidence ledger record</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-black hover:bg-neutral-800 text-white font-sans font-black text-xs uppercase tracking-wider rounded transition-colors"
          >
            Close Audit View
          </button>
        </div>
      </div>
    </div>
  );
}
