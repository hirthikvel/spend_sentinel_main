"use client";

import React, { useState, useEffect } from "react";

interface TopBarProps {
  onOpenSearch?: () => void;
  selectedRange?: string;
  onRangeChange?: (range: string) => void;
}

export function TopBar({
  onOpenSearch,
  selectedRange = "LAST 60 DAYS",
  onRangeChange,
}: TopBarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenSearch?.();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onOpenSearch]);

  const ranges = [
    "LAST 7 DAYS",
    "LAST 14 DAYS",
    "LAST 30 DAYS",
    "LAST 60 DAYS",
    "LAST 90 DAYS",
  ];

  return (
    <header className="h-13 2xl:h-15 panel-card bg-white px-5 2xl:px-6 flex items-center justify-between select-none z-10 relative shrink-0">
      {/* Search trigger - Enlarge bold Burbank font */}
      <button
        type="button"
        onClick={onOpenSearch}
        className="text-lg 2xl:text-xl font-black tracking-wider text-black uppercase hover:text-[#1f5ea5] transition-colors flex items-center cursor-pointer text-left font-sans"
      >
        <span>SEARCH OR PRESS CTRL K</span>
      </button>

      {/* Date Range Selector Box */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="px-4 2xl:px-5 py-1 2xl:py-1.5 border-2 border-black rounded-sm text-sm 2xl:text-base font-black tracking-wider text-black uppercase hover:bg-neutral-50 transition-colors font-sans cursor-pointer"
        >
          {selectedRange}
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white border border-neutral-300 rounded shadow-lg py-1 z-50">
            {ranges.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => {
                  onRangeChange?.(r);
                  setDropdownOpen(false);
                }}
                className={`w-full text-left px-3 py-1.5 text-xs font-black uppercase tracking-wider hover:bg-neutral-100 ${
                  r === selectedRange ? "text-[#1f5ea5]" : "text-black"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
