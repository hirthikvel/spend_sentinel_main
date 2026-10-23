import { NextRequest, NextResponse } from "next/server";
import { getLiveDashboardData } from "@/lib/supabase";
import { DashboardFilters } from "@/lib/types";

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

  const payload = await getLiveDashboardData(filters);
  return NextResponse.json(payload);
}
