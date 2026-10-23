export type VerdictType = "MISCONFIGURATION" | "FORGOTTEN ENVIRONMENT" | "HEALTHY GROWTH";

export interface KpiMetrics {
  spendTotal: string; // e.g. "$27,400"
  spendGrowthPill: string; // e.g. "+9%"
  openAnomaliesCount: number; // e.g. 3
  openAnomaliesPill: string; // e.g. "2 HIGH"
  idleResourcesCount: number; // e.g. 8
  idleResourcesPill: string; // e.g. "REVIEW"
  monthlySavingTotal: string; // e.g. "$12,100"
  monthlySavingPill: string; // e.g. "SAVINGS"
}

export interface SpendDataPoint {
  dayIndex: number;
  dateStr: string;
  amount: number;
  service?: string;
  anomaly?: {
    id: string;
    dotColor: string;
    bandColor: string;
    service: string;
    delta: string;
    verdict: VerdictType;
    confidence: number;
    evidenceCode: string;
    description: string;
  };
}

export interface AnomalyItem {
  id: string;
  dotColor: string;
  service: string;
  delta: string;
  verdict: VerdictType;
  confidence: number;
  evidenceCode: string;
  description: string;
  region: string;
  environment: string;
}

export interface SavingsItem {
  id: string;
  resource: string;
  amount: string;
  action: string;
  service: string;
  environment: string;
}

export interface DashboardFilters {
  days: number; // 7, 14, 30, 60, 90
  service: string; // "ALL SERVICES", "EC2", "RDS", "VPC", etc.
  region: string; // "ALL REGIONS", "US-EAST-1", "US-WEST-2", etc.
  environment: string; // "ALL ENVIRONMENTS", "PRODUCTION", "STAGING", "DEV"
}

export interface DashboardPayload {
  kpis: KpiMetrics;
  chartPoints: SpendDataPoint[];
  anomalies: AnomalyItem[];
  savings: SavingsItem[];
  activeRangeLabel: string;
  isLiveFromSupabase: boolean;
}
