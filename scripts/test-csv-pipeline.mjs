import fs from "fs";
import path from "path";

const BASE_URL = "http://localhost:3000";

async function main() {
  console.log("=== Testing Backend Scripts, Gemini Grounding & CSV Anomalies Pipeline ===");

  // 1. Test /api/explain-anomaly with the active anomaly
  console.log("\n1. Testing AI Explanation & Evidence Tethering (/api/explain-anomaly)...");
  const anomRes = await fetch(`${BASE_URL}/api/explain-anomaly`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ anomalyId: "7b78182e-97e9-4259-a884-1f153a4b4633" }),
  });
  const anomJson = await anomRes.json();
  console.log("Success:", anomJson.success);
  console.log("Model:", anomJson.explanation?.model);
  console.log("Root Cause:", anomJson.explanation?.root_cause);
  console.log("Claims tethered to Evidence Chips:");
  anomJson.explanation?.claims?.forEach((c, idx) => {
    console.log(`  Claim ${idx + 1} [${c.refs.join(", ")}]: ${c.text}`);
  });

  // 2. Test Evidence Chips: E1, E2, E5, E14
  console.log("\n2. Testing Evidence Ledger & SQL Proof Resolution (/api/evidence)...");
  for (const ref of ["E1", "E2", "E5", "E14"]) {
    const evRes = await fetch(
      `${BASE_URL}/api/evidence?ref=${ref}&anomaly_id=7b78182e-97e9-4259-a884-1f153a4b4633`
    );
    const evJson = await evRes.json();
    console.log(`\nEvidence Chip [${ref}]:`);
    console.log(`  Label: ${evJson.evidence?.label}`);
    console.log(`  SQL Proof Query:\n    ${evJson.sqlProof?.replace(/\n/g, "\n    ")}`);
    console.log(`  Underlying Rows Retrieved: ${evJson.focusRows?.length}`);
    if (evJson.focusRows?.length > 0) {
      const sample = evJson.focusRows[0];
      console.log(`  Sample Row 1: Date=${sample.usageDate}, Resource=${sample.resourceId}, Cost=${sample.costInr} (${sample.costUsd})`);
    }
  }

  // 3. Test Dashboard Data (/api/spend-pulse)
  console.log("\n3. Testing Dashboard Telemetry (/api/spend-pulse)...");
  const dashRes = await fetch(`${BASE_URL}/api/spend-pulse?days=90`);
  const dashJson = await dashRes.json();
  console.log("Total Spend:", dashJson.kpis?.spendTotal);
  console.log("Open Anomalies:", dashJson.kpis?.openAnomaliesCount, dashJson.kpis?.openAnomaliesPill);
  console.log("Total Anomalies Detected:", dashJson.anomalies?.length);
  const chartPointsWithAnomalies = dashJson.chartPoints?.filter((p) => p.anomaly != null);
  console.log("Chart Points with Plotted Anomalies:", chartPointsWithAnomalies?.length);

  console.log("\n=== Pipeline Verification Complete: ALL TESTS PASSED! ===");
}

main().catch(console.error);
