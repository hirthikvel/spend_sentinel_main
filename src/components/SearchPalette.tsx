"use client";

import React, { useState, useEffect } from "react";

import { useRouter } from "next/navigation";

interface SearchPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectResult?: (query: string) => void;
}

const SEARCH_ITEMS = [
  { category: "PAGE", title: "DASHBOARD", subtitle: "Live Cloud Spend & Baseline Trajectory", route: "/dashboard" },
  { category: "PAGE", title: "ANOMALIES", subtitle: "Detected Inefficiencies & Evidence Cards", route: "/anomalies" },
  { category: "ACTION", title: "UPLOAD BILLING CSV", subtitle: "Ingest FOCUS Standard or AWS CUR CSV", route: "/upload" },
  { category: "PAGE", title: "ACCOUNT DETAILS", subtitle: "Profile, Organization Type & Security", route: "/account" },
  { category: "PAGE", title: "ORGANIZATION SETTINGS", subtitle: "Member Access & RBAC Controls", route: "/settings" },
];

export function SearchPalette({ isOpen, onClose, onSelectResult }: SearchPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = SEARCH_ITEMS.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/60 backdrop-blur-xs cursor-pointer select-none animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="panel-card bg-white w-full max-w-xl overflow-hidden cursor-default shadow-2xl animate-in zoom-in-95 duration-150 font-sans"
      >
        {/* Search Input Bar */}
        <div className="p-3.5 2xl:p-4 border-b border-neutral-200 flex items-center space-x-3 bg-white">
          <span className="text-base font-black text-[#1f5ea5] uppercase tracking-wide">
            SEARCH:
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="TYPE SERVICE, RESOURCE, OR COMMAND..."
            autoFocus
            className="w-full text-base font-black uppercase tracking-wider text-black placeholder-neutral-400 focus:outline-none font-sans"
          />
          <button
            type="button"
            onClick={onClose}
            className="px-2.5 py-1 text-xs font-mono font-bold text-neutral-400 hover:text-black hover:bg-neutral-100 rounded cursor-pointer transition-colors"
            title="Press Escape to close"
          >
            ESC ✕
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto divide-y divide-neutral-100 p-2">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-xs font-mono text-neutral-500 uppercase">
              NO MATCHING CLOUD RESOURCES FOUND
            </div>
          ) : (
            filtered.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  onSelectResult?.(item.title);
                  if (item.route) router.push(item.route);
                  onClose();
                }}
                className="w-full text-left p-3 hover:bg-neutral-50 rounded flex items-center justify-between group transition-colors"
              >
                <div>
                  <p className="text-sm font-black uppercase tracking-wide text-black group-hover:text-[#1f5ea5] font-sans">
                    {item.title}
                  </p>
                  <p className="text-xs text-neutral-500 font-sans mt-0.5 font-bold">
                    {item.subtitle}
                  </p>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 border border-neutral-300 text-neutral-700 uppercase bg-neutral-50">
                  {item.category}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
