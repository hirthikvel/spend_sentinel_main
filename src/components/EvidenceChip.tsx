"use client";

import React from "react";

interface EvidenceChipProps {
  id: string; // e.g. "E1", "E2", "E3"
  className?: string;
  onClick?: () => void;
}

export function EvidenceChip({ id, className = "", onClick }: EvidenceChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center px-1.5 py-0.5 border border-[#1f5ea5] bg-white text-[#1f5ea5] font-bold text-[10px] tracking-wider uppercase rounded-none hover:bg-[#1f5ea5]/5 active:scale-95 transition-transform ${className}`}
      title={`Evidence marker ${id}`}
    >
      {id}
    </button>
  );
}
