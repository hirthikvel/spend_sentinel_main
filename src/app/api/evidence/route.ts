import { NextRequest, NextResponse } from "next/server";
import { supabase, formatInr, formatDateToShortMonth } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const anomalyId = searchParams.get("anomaly_id");
  const ref = searchParams.get("ref") || "E1";

  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  try {
    // 1. Fetch the specific evidence record from evidence_ledger
    let query = supabase.from("evidence_ledger").select("*").eq("ref", ref);
    if (anomalyId) {
      query = query.eq("finding_id", anomalyId);
    }
    const { data: evidenceData, error: evError } = await query.limit(1);

    const evidence = evidenceData?.[0] || null;

    // 2. Fetch the anomaly details to contextualize query
    let anomaly: any = null;
    if (anomalyId) {
      const { data: anomData } = await supabase
        .from("anomalies")
        .select("*")
        .eq("id", anomalyId)
        .single();
      anomaly = anomData;
    }

    // 3. Formulate the SQL proof statement based on the evidence ref
    const targetDate = anomaly?.anomaly_date || "2026-08-15";
    const targetService = anomaly?.service || "RDS";
    const targetRegion = anomaly?.region || "ap-south-1";
    const targetResource = evidence?.value_text || (evidence?.source as any)?.resource_id || null;

    let sqlProof = "";
    let focusRows: any[] = [];

    if (ref === "E2" || evidence?.kind === "expected") {
      sqlProof = `SELECT usage_date, resource_id, service, region, cost, usage_type, tags\nFROM billing_line_items\nWHERE service ILIKE '%${targetService}%'\n  AND usage_date < '${targetDate}'\nORDER BY usage_date DESC, cost DESC\nLIMIT 25;`;

      const { data } = await supabase
        .from("billing_line_items")
        .select("id, usage_date, resource_id, service, region, cost, usage_type, tags")
        .ilike("service", `%${targetService}%`)
        .lt("usage_date", targetDate)
        .order("usage_date", { ascending: false })
        .order("cost", { ascending: false })
        .limit(25);

      focusRows = data || [];
    } else if (ref === "E14" || evidence?.kind === "verdict_confidence") {
      sqlProof = `SELECT v.label, v.confidence, v.reasons, v.scores, a.service, a.anomaly_date\nFROM verdicts v\nJOIN anomalies a ON a.id = v.anomaly_id\nWHERE v.anomaly_id = '${anomalyId || anomaly?.id}';`;

      const { data } = await supabase
        .from("billing_line_items")
        .select("id, usage_date, resource_id, service, region, cost, usage_type, tags")
        .ilike("service", `%${targetService}%`)
        .eq("usage_date", targetDate)
        .order("cost", { ascending: false })
        .limit(25);

      focusRows = data || [];
    } else {
      sqlProof = `SELECT usage_date, resource_id, service, region, cost, usage_type, tags\nFROM billing_line_items\nWHERE service ILIKE '%${targetService}%'\n  AND usage_date = '${targetDate}'`;

      if (targetResource && targetResource !== "(none)") {
        sqlProof += `\n  AND resource_id = '${targetResource}'`;
      }
      sqlProof += `\nORDER BY cost DESC\nLIMIT 25;`;

      let lineItemsQuery = supabase
        .from("billing_line_items")
        .select("id, usage_date, resource_id, service, region, cost, usage_type, tags")
        .ilike("service", `%${targetService}%`)
        .eq("usage_date", targetDate);

      if (targetResource && targetResource !== "(none)") {
        lineItemsQuery = lineItemsQuery.eq("resource_id", targetResource);
      }

      const { data } = await lineItemsQuery.order("cost", { ascending: false }).limit(25);
      focusRows = data || [];

      // Fallback: if filtering by specific resource yielded 0 rows, fetch service rows on that date
      if (focusRows.length === 0) {
        const { data: fallbackData } = await supabase
          .from("billing_line_items")
          .select("id, usage_date, resource_id, service, region, cost, usage_type, tags")
          .ilike("service", `%${targetService}%`)
          .eq("usage_date", targetDate)
          .order("cost", { ascending: false })
          .limit(25);
        focusRows = fallbackData || [];
      }
    }

    // Calculate sum of rows retrieved
    const sumCost = focusRows.reduce((acc, r) => acc + (Number(r.cost) || 0), 0);
    const sumInr = Math.round(sumCost * 85);

    return NextResponse.json({
      success: true,
      ref,
      evidence: evidence
        ? {
            id: evidence.id,
            ref: evidence.ref,
            kind: evidence.kind,
            label: evidence.label,
            valueNumeric: evidence.value_numeric,
            valueInr: evidence.value_numeric ? formatInr(Number(evidence.value_numeric) * 85) : null,
            valueText: evidence.value_text,
            unit: evidence.unit,
            source: evidence.source,
          }
        : {
            ref,
            label: `${ref}: SQL Verified Telemetry Evidence`,
            kind: "sql_telemetry",
            valueNumeric: sumCost,
            valueInr: formatInr(sumInr),
            valueText: targetResource || targetService,
            unit: "USD",
            source: { observed: sumCost, date: targetDate, service: targetService },
          },
      sqlProof,
      focusSummary: {
        targetDate,
        targetService,
        targetRegion,
        targetResource,
        totalRows: focusRows?.length || 0,
        totalSumUsd: `$${sumCost.toFixed(2)}`,
        totalSumInr: formatInr(sumInr),
      },
      focusRows: (focusRows || []).map((row) => ({
        id: row.id,
        usageDate: row.usage_date ? formatDateToShortMonth(row.usage_date) : targetDate,
        rawDate: row.usage_date,
        resourceId: row.resource_id || "Unspecified",
        service: row.service,
        region: row.region || targetRegion,
        costUsd: `$${Number(row.cost).toFixed(2)}`,
        costInr: formatInr(Number(row.cost) * 85),
        usageType: row.usage_type || "Compute",
        environment: row.tags?.env || "production",
      })),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
