"use client";

import React, { useState, useEffect, useCallback } from "react";
import { SerratedStripes } from "@/components/SerratedStripes";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { HeaderRow } from "@/components/HeaderRow";
import { KpiCardsRow } from "@/components/KpiCard";
import { DailySpendChart } from "@/components/DailySpendChart";
import { LatestAnomalies } from "@/components/LatestAnomalies";
import { TopSavings } from "@/components/TopSavings";
import { AnomalyModal } from "@/components/AnomalyModal";
import { SearchPalette } from "@/components/SearchPalette";
import {
  DashboardPayload,
  AnomalyItem,
  SavingsItem,
} from "@/lib/types";
import { getFilteredDashboardData } from "@/lib/mock-data";

export default function SpendSentinelDashboard() {
  const [currentMenu, setCurrentMenu] = useState("DASHBOARD");
  const [selectedRange, setSelectedRange] = useState("LAST 60 DAYS");
  const [selectedService, setSelectedService] = useState("ALL SERVICES");
  const [selectedRegion, setSelectedRegion] = useState("ALL REGIONS");
  const [selectedEnvironment, setSelectedEnvironment] = useState("ALL ENVIRONMENTS");

  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedAnomaly, setSelectedAnomaly] = useState<AnomalyItem | null>(null);
  const [selectedSavings, setSelectedSavings] = useState<SavingsItem | null>(null);

  // Parse days from selectedRange
  const daysNumber = React.useMemo(() => {
    const match = selectedRange.match(/\d+/);
    return match ? parseInt(match[0], 10) : 60;
  }, [selectedRange]);

  // Real-time backend data state
  const [dashboardData, setDashboardData] = useState<DashboardPayload>(() =>
    getFilteredDashboardData({
      days: 60,
      service: "ALL SERVICES",
      region: "ALL REGIONS",
      environment: "ALL ENVIRONMENTS",
    })
  );
  const [isLoading, setIsLoading] = useState(false);

  // Fetch from backend API route (/api/spend-pulse) whenever filters change
  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        days: String(daysNumber),
        service: selectedService,
        region: selectedRegion,
        environment: selectedEnvironment,
      });

      const res = await fetch(`/api/spend-pulse?${params.toString()}`);
      if (res.ok) {
        const json: DashboardPayload = await res.json();
        setDashboardData(json);
      }
    } catch (err) {
      console.warn("Backend fetch failed, using fallback engine:", err);
      const localData = getFilteredDashboardData({
        days: daysNumber,
        service: selectedService,
        region: selectedRegion,
        environment: selectedEnvironment,
      });
      setDashboardData(localData);
    } finally {
      setIsLoading(false);
    }
  }, [daysNumber, selectedService, selectedRegion, selectedEnvironment]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleFilterChange = (category: string, value: string) => {
    if (category === "ALL SERVICES") setSelectedService(value);
    if (category === "ALL REGIONS") setSelectedRegion(value);
    if (category === "ALL ENVIRONMENTS") setSelectedEnvironment(value);
  };

  const handleDotClick = (anomalyId: string) => {
    const found = dashboardData.anomalies.find((a) => a.id === anomalyId);
    if (found) {
      setSelectedAnomaly(found);
    } else if (dashboardData.anomalies[0]) {
      setSelectedAnomaly(dashboardData.anomalies[0]);
    }
  };

  return (
    <main
      className="fixed inset-0 w-screen h-screen bg-[#1f5ea5] overflow-hidden flex flex-col p-3 2xl:p-4 select-none font-sans"
      style={{ backgroundColor: "#1f5ea5" }}
    >
      {/* Background Graphic Elements: Diagonal Serrated Tape Stripes */}
      <SerratedStripes />

      {/* Real-time Supabase status badge */}
      {dashboardData.isLiveFromSupabase && (
        <div className="absolute top-2 right-4 z-40 bg-emerald-500/90 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded shadow">
          ● SUPABASE LIVE
        </div>
      )}

      {/* Main Full-Screen Layout: Tightened gaps, zoomed bold fonts */}
      <div className="relative z-10 w-full h-full flex gap-2.5 2xl:gap-3 overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          currentMenu={currentMenu}
          onSelectMenu={(menu) => setCurrentMenu(menu)}
        />

        {/* Main Content Area (Stretching to fill 100% of remaining screen with tight gaps) */}
        <div className="flex-1 h-full flex flex-col justify-between gap-1.5 2xl:gap-2 overflow-hidden">
          {/* Top Bar */}
          <TopBar
            onOpenSearch={() => setSearchOpen(true)}
            selectedRange={selectedRange}
            onRangeChange={(range) => setSelectedRange(range)}
          />

          {/* Row 1: Page Title 'SPEND PULSE' & Filter Pills */}
          <HeaderRow onFilterChange={handleFilterChange} />

          {/* Row 2: Four KPI Cards */}
          <KpiCardsRow
            kpis={dashboardData.kpis}
            periodDays={daysNumber}
            onCardClick={(idx) => {
              if (idx === 1 && dashboardData.anomalies[0]) {
                setSelectedAnomaly(dashboardData.anomalies[0]);
              }
            }}
          />

          {/* Row 3: Daily Spend Wide Card */}
          <DailySpendChart
            chartPoints={dashboardData.chartPoints}
            periodDays={daysNumber}
            onDotClick={handleDotClick}
          />

          {/* Row 4: Two Cards Side by Side (Latest Anomalies & Top Savings) */}
          <div className="grid grid-cols-2 gap-2.5 2xl:gap-3">
            <LatestAnomalies
              anomalies={dashboardData.anomalies}
              onSelectAnomaly={(anom) => setSelectedAnomaly(anom)}
            />
            <TopSavings
              savings={dashboardData.savings}
              onSelectSavings={(save) => setSelectedSavings(save)}
            />
          </div>
        </div>
      </div>

      {/* Interactive Deep Dive Anomaly Modal */}
      <AnomalyModal
        anomaly={selectedAnomaly}
        onClose={() => setSelectedAnomaly(null)}
      />

      {/* Interactive Quick Savings Modal */}
      {selectedSavings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="panel-card bg-white w-full max-w-md p-6 relative select-none">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3 mb-4">
              <h3 className="text-xl font-black uppercase tracking-tight text-black font-sans">
                {selectedSavings.resource}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedSavings(null)}
                className="w-8 h-8 rounded border-2 border-neutral-300 flex items-center justify-center font-mono font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-3 rounded">
                <span className="text-xs font-black uppercase text-emerald-900 font-sans">
                  ESTIMATED MONTHLY SAVINGS:
                </span>
                <span className="text-base font-mono font-black text-emerald-800">
                  {selectedSavings.amount}
                </span>
              </div>

              <div>
                <p className="text-xs font-black uppercase text-neutral-600 mb-1 font-sans">
                  RECOMMENDED REMEDIATION ACTION:
                </p>
                <p className="text-sm font-bold uppercase text-black font-mono bg-neutral-100 p-3 rounded border border-neutral-200">
                  {selectedSavings.action}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setSelectedSavings(null)}
                className="px-4 py-2 border-2 border-neutral-300 text-xs font-black uppercase tracking-wider text-black hover:bg-neutral-100 font-sans"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={() => setSelectedSavings(null)}
                className="px-4 py-2 bg-[#1f5ea5] text-white text-xs font-black uppercase tracking-wider hover:bg-[#184980] font-sans"
              >
                EXECUTE SAVINGS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Search Palette (Ctrl+K) */}
      <SearchPalette
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelectResult={(item) => {
          const foundAnomaly = dashboardData.anomalies.find((a) => item.includes(a.service));
          if (foundAnomaly) setSelectedAnomaly(foundAnomaly);
        }}
      />
    </main>
  );
}
