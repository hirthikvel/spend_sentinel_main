export type VerdictType = "MISCONFIGURATION" | "FORGOTTEN ENVIRONMENT" | "HEALTHY GROWTH";

export type OrganizationType = "b2b_saas" | "gen_ai" | "quick_commerce" | "consumer_social";

export const ORGANIZATION_TYPES: { value: OrganizationType; label: string; description: string }[] = [
  { value: "b2b_saas", label: "B2B SaaS", description: "Multi-tenant B2B architectures (Cost per Tenant)" },
  { value: "gen_ai", label: "Gen AI / AI Wrapper", description: "LLM & token intensive pipelines (Cost per 1,000 Prompts)" },
  { value: "quick_commerce", label: "Quick Commerce", description: "Logistics & route calculation compute (Cost per Order)" },
  { value: "consumer_social", label: "Consumer Social", description: "High-concurrency user traffic (Cost per DAU)" },
];

export interface KpiMetrics {
  spendTotal: string; // e.g. "$27,400" or "₹2,32,900"
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
  fullDate?: string;
  amount: number;
  service?: string;
  anomaly?: {
    id: string;
    dotColor: string;
    bandColor?: string;
    service: string;
    delta: string;
    verdict?: VerdictType;
    confidence?: number;
    evidenceCode?: string;
    description?: string;
  };
}

export interface AnomalyItem {
  id: string;
  dotColor: string;
  service: string;
  date?: string;
  anomalyDate?: string;
  delta: string;
  expectedCost?: string;
  observedCost?: string;
  rawDeltaCost?: number;
  verdict: VerdictType;
  confidence: number;
  evidenceCode: string;
  description: string;
  region: string;
  environment: string;
  status?: string;
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
  availableServices?: string[];
  availableRegions?: string[];
  availableEnvironments?: string[];
}

export interface OrgMember {
  id: string;
  email: string;
  role: string;
  createdAt: string;
}
