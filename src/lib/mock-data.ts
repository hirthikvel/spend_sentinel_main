import {
  DashboardFilters,
  DashboardPayload,
  AnomalyItem,
  SavingsItem,
  SpendDataPoint,
  KpiMetrics,
} from "./types";

export const MASTER_ANOMALIES: AnomalyItem[] = [
  {
    id: "anom-1",
    dotColor: "#c85a4b",
    service: "VPC US-EAST-1",
    delta: "+$198",
    verdict: "MISCONFIGURATION",
    confidence: 94,
    evidenceCode: "E1",
    description: "NAT Gateway cross-AZ data processing loop caused by route table misconfiguration.",
    region: "US-EAST-1",
    environment: "PRODUCTION",
  },
  {
    id: "anom-2",
    dotColor: "#d99738",
    service: "EC2 US-WEST-2",
    delta: "+$285",
    verdict: "FORGOTTEN ENVIRONMENT",
    confidence: 88,
    evidenceCode: "E2",
    description: "Unattached p3.2xlarge benchmarking GPU instance running unmonitored over weekend.",
    region: "US-WEST-2",
    environment: "STAGING",
  },
  {
    id: "anom-3",
    dotColor: "#60a377",
    service: "EC2 US-EAST-1",
    delta: "+$180",
    verdict: "HEALTHY GROWTH",
    confidence: 96,
    evidenceCode: "E3",
    description: "Autoscaling group scale-out triggered by organic customer traffic surge during launch.",
    region: "US-EAST-1",
    environment: "PRODUCTION",
  },
  {
    id: "anom-4",
    dotColor: "#c85a4b",
    service: "RDS US-EAST-1",
    delta: "+$320",
    verdict: "MISCONFIGURATION",
    confidence: 91,
    evidenceCode: "E4",
    description: "Unindexed query spike causing IOPS burst credits depletion and autoscaling replica cost.",
    region: "US-EAST-1",
    environment: "PRODUCTION",
  },
  {
    id: "anom-5",
    dotColor: "#d99738",
    service: "EKS EU-WEST-1",
    delta: "+$145",
    verdict: "FORGOTTEN ENVIRONMENT",
    confidence: 85,
    evidenceCode: "E5",
    description: "Abandoned test namespace with daemonsets running without resource quotas.",
    region: "EU-WEST-1",
    environment: "DEV",
  },
];

export const MASTER_SAVINGS: SavingsItem[] = [
  {
    id: "save-1",
    resource: "I-STG-GPU-01",
    amount: "$2,850",
    action: "STOP UNATTACHED GPU INSTANCE",
    service: "EC2",
    environment: "STAGING",
  },
  {
    id: "save-2",
    resource: "RDS-ANALYTICS-OLD",
    amount: "$1,920",
    action: "DOWNGRADE OR SNAPSHOT DB",
    service: "RDS",
    environment: "PRODUCTION",
  },
  {
    id: "save-3",
    resource: "I-API-03",
    amount: "$780",
    action: "RIGHTSIZE OVERPROVISIONED INSTANCE",
    service: "EC2",
    environment: "STAGING",
  },
  {
    id: "save-4",
    resource: "NAT-GW-DEV-01",
    amount: "$420",
    action: "CONSOLIDATE INTO SHARED VPC",
    service: "VPC",
    environment: "DEV",
  },
  {
    id: "save-5",
    resource: "VOL-EBS-ORPHAN-88",
    amount: "$360",
    action: "DELETE UNATTACHED EBS VOLUME",
    service: "EC2",
    environment: "DEV",
  },
];

export function getFilteredDashboardData(filters: DashboardFilters): DashboardPayload {
  const { days, service, region, environment } = filters;

  // Filter anomalies based on selected service, region, environment
  let filteredAnomalies = MASTER_ANOMALIES.filter((item) => {
    const serviceMatch =
      service === "ALL SERVICES" || item.service.toUpperCase().includes(service.toUpperCase());
    const regionMatch =
      region === "ALL REGIONS" || item.region.toUpperCase().includes(region.toUpperCase());
    const envMatch =
      environment === "ALL ENVIRONMENTS" ||
      item.environment.toUpperCase().includes(environment.toUpperCase());
    return serviceMatch && regionMatch && envMatch;
  });

  // Always show at least the core items if filters allow, matching the reference image
  if (filteredAnomalies.length === 0) {
    filteredAnomalies = MASTER_ANOMALIES.slice(0, 3);
  }

  // Filter savings
  let filteredSavings = MASTER_SAVINGS.filter((item) => {
    const serviceMatch =
      service === "ALL SERVICES" || item.service.toUpperCase().includes(service.toUpperCase());
    const envMatch =
      environment === "ALL ENVIRONMENTS" ||
      item.environment.toUpperCase().includes(environment.toUpperCase());
    return serviceMatch && envMatch;
  });

  if (filteredSavings.length === 0) {
    filteredSavings = MASTER_SAVINGS.slice(0, 3);
  }

  // Compute KPI numbers based on selected days and filters
  let kpis: KpiMetrics;
  switch (days) {
    case 7:
      kpis = {
        spendTotal: "$6,350",
        spendGrowthPill: "+4%",
        openAnomaliesCount: 1,
        openAnomaliesPill: "1 HIGH",
        idleResourcesCount: 3,
        idleResourcesPill: "REVIEW",
        monthlySavingTotal: "$2,900",
        monthlySavingPill: "SAVINGS",
      };
      break;
    case 14:
      kpis = {
        spendTotal: "$12,800",
        spendGrowthPill: "+7%",
        openAnomaliesCount: 2,
        openAnomaliesPill: "1 HIGH",
        idleResourcesCount: 5,
        idleResourcesPill: "REVIEW",
        monthlySavingTotal: "$5,750",
        monthlySavingPill: "SAVINGS",
      };
      break;
    case 30:
      kpis = {
        spendTotal: "$27,400",
        spendGrowthPill: "+9%",
        openAnomaliesCount: 3,
        openAnomaliesPill: "2 HIGH",
        idleResourcesCount: 8,
        idleResourcesPill: "REVIEW",
        monthlySavingTotal: "$12,100",
        monthlySavingPill: "SAVINGS",
      };
      break;
    case 90:
      kpis = {
        spendTotal: "$81,200",
        spendGrowthPill: "+14%",
        openAnomaliesCount: 7,
        openAnomaliesPill: "4 HIGH",
        idleResourcesCount: 16,
        idleResourcesPill: "REVIEW",
        monthlySavingTotal: "$16,800",
        monthlySavingPill: "SAVINGS",
      };
      break;
    case 60:
    default:
      kpis = {
        spendTotal: "$27,400", // Standard benchmark from screenshot
        spendGrowthPill: "+9%",
        openAnomaliesCount: 3,
        openAnomaliesPill: "2 HIGH",
        idleResourcesCount: 8,
        idleResourcesPill: "REVIEW",
        monthlySavingTotal: "$12,100",
        monthlySavingPill: "SAVINGS",
      };
      break;
  }

  // Generate spline data points corresponding to requested time range
  const totalSteps = days >= 60 ? 39 : days >= 30 ? 25 : days >= 14 ? 16 : 9;
  const chartPoints: SpendDataPoint[] = [];

  for (let i = 0; i < totalSteps; i++) {
    const frac = i / (totalSteps - 1);
    const dayNum = Math.round(1 + frac * (days - 1));

    // Base undulation pattern matching the reference image's rose graph
    let baseAmount = 420 + Math.sin(i * 0.9) * 28 + Math.cos(i * 1.7) * 22;

    let anomaly: SpendDataPoint["anomaly"] = undefined;

    // Place the 3 key anomaly peaks at their exact visual spots
    if (days >= 30) {
      if (i === Math.floor(totalSteps * 0.28)) {
        baseAmount = 560; // Peak 1: Terracotta
        anomaly = {
          id: "anom-1",
          dotColor: "#c85a4b",
          bandColor: "rgba(200, 90, 75, 0.16)",
          service: "VPC US-EAST-1",
          delta: "+$198",
          verdict: "MISCONFIGURATION",
          confidence: 94,
          evidenceCode: "E1",
          description: "NAT Gateway cross-AZ data processing loop.",
        };
      } else if (i === Math.floor(totalSteps * 0.72)) {
        baseAmount = 590; // Peak 2: Ochre
        anomaly = {
          id: "anom-2",
          dotColor: "#d99738",
          bandColor: "rgba(217, 151, 56, 0.18)",
          service: "EC2 US-WEST-2",
          delta: "+$285",
          verdict: "FORGOTTEN ENVIRONMENT",
          confidence: 88,
          evidenceCode: "E2",
          description: "Unattached p3.2xlarge benchmarking GPU instance.",
        };
      } else if (i === Math.floor(totalSteps * 0.88)) {
        baseAmount = 550; // Peak 3: Sage
        anomaly = {
          id: "anom-3",
          dotColor: "#60a377",
          bandColor: "rgba(96, 163, 119, 0.18)",
          service: "EC2 US-EAST-1",
          delta: "+$180",
          verdict: "HEALTHY GROWTH",
          confidence: 96,
          evidenceCode: "E3",
          description: "Autoscaling group scale-out triggered by traffic surge.",
        };
      }
    } else {
      // 7 or 14 days peak
      if (i === Math.floor(totalSteps * 0.6)) {
        baseAmount = 580;
        anomaly = {
          id: "anom-2",
          dotColor: "#d99738",
          bandColor: "rgba(217, 151, 56, 0.18)",
          service: "EC2 US-WEST-2",
          delta: "+$285",
          verdict: "FORGOTTEN ENVIRONMENT",
          confidence: 88,
          evidenceCode: "E2",
          description: "Unattached p3.2xlarge benchmarking GPU instance.",
        };
      }
    }

    chartPoints.push({
      dayIndex: i,
      dateStr: `DAY ${dayNum}`,
      amount: Math.round(baseAmount),
      service: anomaly ? anomaly.service : undefined,
      anomaly,
    });
  }

  return {
    kpis,
    chartPoints,
    anomalies: filteredAnomalies.slice(0, 3),
    savings: filteredSavings.slice(0, 3),
    activeRangeLabel: `LAST ${days} DAYS`,
    isLiveFromSupabase: false,
  };
}
