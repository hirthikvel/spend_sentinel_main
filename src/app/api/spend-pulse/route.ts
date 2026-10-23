import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { getFilteredDashboardData } from "@/lib/mock-data";
import { DashboardFilters, DashboardPayload } from "@/lib/types";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const daysParam = parseInt(searchParams.get("days") || "60", 10);
  const days = [7, 14, 30, 60, 90].includes(daysParam) ? daysParam : 60;
  const service = searchParams.get("service") || "ALL SERVICES";
  const region = searchParams.get("region") || "ALL REGIONS";
  const environment = searchParams.get("environment") || "ALL ENVIRONMENTS";

  const filters: DashboardFilters = {
    days,
    service,
    region,
    environment,
  };

  // If Supabase is connected, attempt to fetch live data from database
  if (isSupabaseConfigured() && supabase) {
    try {
      const [anomaliesRes, savingsRes, kpisRes] = await Promise.all([
        supabase
          .from("anomalies")
          .select("*")
          .limit(10),
        supabase
          .from("savings_recommendations")
          .select("*")
          .limit(10),
        supabase
          .from("kpi_metrics")
          .select("*")
          .eq("period_days", days)
          .single(),
      ]);

      if (!anomaliesRes.error && anomaliesRes.data && anomaliesRes.data.length > 0) {
        // Successfully retrieved live rows from Supabase
        const mockBase = getFilteredDashboardData(filters);
        const payload: DashboardPayload = {
          kpis: kpisRes.data
            ? {
                spendTotal: kpisRes.data.spend_total,
                spendGrowthPill: kpisRes.data.spend_growth_pill,
                openAnomaliesCount: kpisRes.data.open_anomalies_count,
                openAnomaliesPill: kpisRes.data.open_anomalies_pill,
                idleResourcesCount: kpisRes.data.idle_resources_count,
                idleResourcesPill: kpisRes.data.idle_resources_pill,
                monthlySavingTotal: kpisRes.data.monthly_saving_total,
                monthlySavingPill: kpisRes.data.monthly_saving_pill,
              }
            : mockBase.kpis,
          chartPoints: mockBase.chartPoints,
          anomalies: anomaliesRes.data.map((row) => ({
            id: row.id,
            dotColor: row.dot_color || "#c85a4b",
            service: row.service,
            delta: row.delta,
            verdict: row.verdict,
            confidence: row.confidence,
            evidenceCode: row.evidence_code,
            description: row.description,
            region: row.region || "US-EAST-1",
            environment: row.environment || "PRODUCTION",
          })),
          savings: (savingsRes.data || []).map((row) => ({
            id: row.id,
            resource: row.resource,
            amount: row.amount,
            action: row.action,
            service: row.service || "EC2",
            environment: row.environment || "STAGING",
          })),
          activeRangeLabel: `LAST ${days} DAYS`,
          isLiveFromSupabase: true,
        };

        return NextResponse.json(payload);
      }
    } catch (err) {
      console.warn("Supabase query fallback to mock engine:", err);
    }
  }

  // Use dynamic filter engine (mock data layer)
  const payload = getFilteredDashboardData(filters);
  return NextResponse.json(payload);
}
