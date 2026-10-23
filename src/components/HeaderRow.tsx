"use client";

import React, { useState } from "react";

interface HeaderRowProps {
  onFilterChange?: (filterCategory: string, value: string) => void;
  availableServices?: string[];
  availableRegions?: string[];
  availableEnvironments?: string[];
}

export function HeaderRow({
  onFilterChange,
  availableServices,
  availableRegions,
  availableEnvironments,
}: HeaderRowProps) {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const filterOptions: Record<string, string[]> = {
    "ALL SERVICES": availableServices && availableServices.length > 0
      ? availableServices
      : ["ALL SERVICES", "EC2", "RDS", "VPC"],
    "ALL REGIONS": availableRegions && availableRegions.length > 0
      ? availableRegions
      : ["ALL REGIONS", "US-EAST-1", "US-WEST-2"],
    "ALL ENVIRONMENTS": availableEnvironments && availableEnvironments.length > 0
      ? availableEnvironments
      : ["ALL ENVIRONMENTS", "PRODUCTION", "STAGING"],
  };

  const [selectedValues, setSelectedValues] = useState<Record<string, string>>({
    "ALL SERVICES": "ALL SERVICES",
    "ALL REGIONS": "ALL REGIONS",
    "ALL ENVIRONMENTS": "ALL ENVIRONMENTS",
  });

  const handleSelect = (category: string, value: string) => {
    setSelectedValues((prev) => ({ ...prev, [category]: value }));
    setActiveFilter(null);
    onFilterChange?.(category, value);
  };

  return (
    <div className="flex items-center justify-between select-none pt-0 pb-0 shrink-0">
      {/* Page Title - Enlarge bold Burbank typography */}
      <h2 className="text-4xl 2xl:text-[44px] font-black tracking-normal text-white uppercase font-sans leading-none">
        SPEND PULSE
      </h2>

      {/* Filter Pills */}
      <div className="flex items-center space-x-3">
        {(["ALL SERVICES", "ALL REGIONS", "ALL ENVIRONMENTS"] as const).map(
          (category) => (
            <div key={category} className="relative">
              <button
                type="button"
                onClick={() =>
                  setActiveFilter(activeFilter === category ? null : category)
                }
                className="bg-white hover:bg-neutral-100 text-black px-5 2xl:px-6 py-2 rounded-full font-black text-xs 2xl:text-sm tracking-wider uppercase transition-colors shadow-xs font-sans"
              >
                {selectedValues[category]}
              </button>

              {activeFilter === category && (
                <div className="absolute right-0 mt-1.5 w-44 bg-white rounded-md shadow-lg border border-neutral-200 py-1 z-50">
                  {filterOptions[category].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleSelect(category, opt)}
                      className={`w-full text-left px-3 py-1.5 text-xs font-bold uppercase tracking-wider hover:bg-neutral-100 ${
                        selectedValues[category] === opt
                          ? "text-[#1f5ea5]"
                          : "text-black"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
}
