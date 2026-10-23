import fs from "fs";

const text = fs.readFileSync("focus_90_days_anomalies.csv", "utf8");
const lines = text.trim().split("\n");
const header = lines[0].split(",").map(c => c.trim());
console.log("Headers:", header);

const anomRows = [];
let totalCost = 0;
const services = new Set();
const dates = new Set();

const serviceCosts = {};
for (let i = 1; i < lines.length; i++) {
  const cols = lines[i].split(",").map(c => c.trim());
  const date = cols[5]?.slice(0, 10);
  const service = cols[7];
  const res = cols[9];
  const cost = parseFloat(cols[19] || cols[18] || "0");
  if (!serviceCosts[service]) serviceCosts[service] = [];
  serviceCosts[service].push({ date, res, cost });
}

console.log("\n--- Service Baselines and Spikes ---");
for (const [srv, items] of Object.entries(serviceCosts)) {
  const avg = items.reduce((s, it) => s + it.cost, 0) / items.length;
  console.log(`${srv}: count=${items.length}, avg=${avg.toFixed(2)}`);
  const spikes = items.filter(it => it.cost > avg * 1.8);
  if (spikes.length > 0) {
    console.log(`  Spikes (>1.8x avg):`, spikes);
  }
}
