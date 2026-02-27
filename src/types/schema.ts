// ═══════════════════════════════════════════════
// CoreX Dashboard — Pure TypeScript Types
// ═══════════════════════════════════════════════

export interface User {
  id: string;
  username: string;
  email?: string;
  role?: "admin" | "operator" | "viewer";
}

// ═══════════════════════════════════════════════
// Multi-Tenant & RBAC
// ═══════════════════════════════════════════════

export interface Tenant {
  id: string;
  name: string;
  tier: "enterprise" | "pro" | "starter";
  contactEmail: string;
  status: "active" | "suspended" | "trial";
  createdAt: string;
  mrr: number;
  gpuQuota: number;
  gpuUsed: number;
}

// ═══════════════════════════════════════════════
// Asset Model (Inventory)
// ═══════════════════════════════════════════════

export interface DataCenter {
  id: string;
  name: string;
  location: string;
  region: string;
  status: "online" | "maintenance" | "offline";
  totalGpus: number;
  availableGpus: number;
  utilization: number;
  powerUsageKw: number;
  avgTemperature: number;
  clusterCount: number;
  nodeCount: number;
  networkBandwidthGbps: number;
  storageUsedTb: number;
  storageTotalTb: number;
  lat?: number;
  lng?: number;
}

export interface Cluster {
  id: string;
  dataCenterId: string;
  dcName: string;
  name: string;
  schedulerType: "binpack" | "spread" | "priority";
  status: "healthy" | "degraded" | "down";
  nodeCount: number;
  totalGpus: number;
  availableGpus: number;
  utilization: number;
  networkFabric: string;
}

export interface Node {
  id: string;
  clusterId: string;
  clusterName: string;
  dcName: string;
  hostname: string;
  cpu: string;
  ramGb: number;
  storageGb: number;
  netGbps: number;
  status: "online" | "offline" | "maintenance" | "draining";
  gpuCount: number;
  gpuModel: string;
  utilization: number;
  lastSeenAt: string;
}

export interface GpuSummary {
  id: string;
  nodeId: string;
  nodeHostname: string;
  dcName: string;
  clusterName: string;
  model: string;
  vramGb: number;
  serial: string;
  migCapable: boolean;
  utilization: number;
  temperature: number;
  powerDraw: number;
  memoryUsedGb: number;
  memoryTotalGb: number;
  status: "idle" | "busy" | "error" | "maintenance";
  eccErrors: number;
  fanSpeed: number;
  allocatedTo?: string; // job or endpoint id
}

// ═══════════════════════════════════════════════
// Metrics (Timeseries)
// ═══════════════════════════════════════════════

export interface MetricPoint {
  time: string;
  value: number;
}

export interface GpuMetric {
  gpuId: string;
  ts: string;
  utilization: number;
  memUsedGb: number;
  tempC: number;
  powerW: number;
  eccErrors: number;
}

export interface NodeMetric {
  nodeId: string;
  ts: string;
  cpuPct: number;
  ramPct: number;
  netIn: number;
  netOut: number;
}

// ═══════════════════════════════════════════════
// Scheduler: Jobs, Queues, Policies
// ═══════════════════════════════════════════════

export interface Queue {
  id: string;
  tenantId: string;
  tenantName: string;
  name: string;
  priority: number;
  quotaGpu: number;
  usedGpu: number;
  pendingJobs: number;
  status: "active" | "paused";
}

export interface Job {
  id: string;
  tenantId: string;
  tenantName: string;
  queueId: string;
  type: "training" | "inference" | "rendering" | "fine-tuning";
  status: "queued" | "running" | "completed" | "failed" | "cancelled";
  requestedGpuModel: string;
  requestedGpus: number;
  requestedVramGb: number;
  regionPref: string;
  image: string;
  command: string;
  modelName: string;
  priority: "low" | "normal" | "high" | "urgent";
  createdAt: string;
  startedAt: string | null;
  finishedAt: string | null;
  estimatedMinutes: number;
  progress: number;
  gpuHoursUsed: number;
  cost: number;
  traceId: string;
  events: JobEvent[];
}

export interface JobEvent {
  id: string;
  jobId: string;
  ts: string;
  level: "info" | "warn" | "error" | "debug";
  message: string;
  traceId: string;
}

export interface Allocation {
  id: string;
  jobId: string;
  nodeId: string;
  gpuIds: string[];
  status: "active" | "released" | "preempted";
  allocatedAt: string;
  releasedAt: string | null;
}

export interface SchedulerPolicy {
  id: string;
  tenantId: string;
  tenantName: string;
  name: string;
  type: "quota" | "priority" | "preemption" | "affinity";
  rules: Record<string, unknown>;
  enabled: boolean;
}

// ═══════════════════════════════════════════════
// Endpoints (Inference Service)
// ═══════════════════════════════════════════════

export interface Endpoint {
  id: string;
  tenantId: string;
  tenantName: string;
  name: string;
  region: string;
  gpuModel: string;
  gpus: number;
  modelName: string;
  image: string;
  status: "deploying" | "running" | "stopped" | "error" | "scaling";
  url: string;
  rps: number;
  latencyP50: number;
  latencyP95: number;
  errorRate: number;
  tokensIn: number;
  tokensOut: number;
  minReplicas: number;
  maxReplicas: number;
  currentReplicas: number;
  createdAt: string;
  costPerHour: number;
}

export interface EndpointMetric {
  endpointId: string;
  ts: string;
  rps: number;
  latencyP50: number;
  latencyP95: number;
  errorRate: number;
  tokensIn: number;
  tokensOut: number;
}

// ═══════════════════════════════════════════════
// Usage & Billing
// ═══════════════════════════════════════════════

export interface UsageRecord {
  id: string;
  tenantId: string;
  tenantName: string;
  sourceType: "job" | "endpoint";
  sourceId: string;
  tsStart: string;
  tsEnd: string;
  gpuSeconds: number;
  requests: number;
  tokensIn: number;
  tokensOut: number;
  region: string;
  gpuModel: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  currency: string;
  rules: {
    gpuPricing: Record<string, number>; // model -> price per GPU-hour
    endpointBaseHourly: number;
    requestOverageRate: number;
    discounts: { type: string; value: number }[];
  };
}

export interface Invoice {
  id: string;
  tenantId: string;
  tenantName: string;
  periodStart: string;
  periodEnd: string;
  amount: number;
  currency: string;
  status: "draft" | "sent" | "paid" | "overdue";
  items: InvoiceItem[];
  createdAt: string;
}

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  meta: Record<string, unknown>;
}

export interface BillingRecord {
  id: string;
  tenantName: string;
  tier: "enterprise" | "pro" | "starter";
  period: string;
  gpuHours: number;
  amount: number;
  status: "paid" | "pending" | "overdue";
  invoiceDate: string;
  dueDate: string;
}

// ═══════════════════════════════════════════════
// SLA / Alerts / Incidents
// ═══════════════════════════════════════════════

export interface Alert {
  id: string;
  tenantId?: string;
  severity: "critical" | "warning" | "info";
  sourceType: string;
  sourceId: string;
  title: string;
  message: string;
  source: string;
  dcName: string;
  status: "firing" | "resolved" | "acknowledged";
  timestamp: string;
  resolvedAt?: string;
  acknowledged: boolean;
  impactScope?: string;
  relatedIncidentId?: string;
}

export interface Incident {
  id: string;
  title: string;
  severity: "critical" | "major" | "minor";
  status: "investigating" | "identified" | "monitoring" | "resolved";
  startedAt: string;
  resolvedAt: string | null;
  summary: string;
  updates: IncidentUpdate[];
  affectedServices: string[];
  commander: string;
}

export interface IncidentUpdate {
  id: string;
  incidentId: string;
  ts: string;
  message: string;
  author: string;
}

// ═══════════════════════════════════════════════
// Replay / Scenario Engine
// ═══════════════════════════════════════════════

export interface ReplayScenario {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  tags: string[];
  icon: string;
}

export interface ReplayEvent {
  ts: string;
  type: "job" | "alert" | "scale" | "incident" | "billing" | "endpoint" | "metric";
  severity: "info" | "warning" | "critical" | "success";
  title: string;
  description: string;
  data?: Record<string, unknown>;
}

export interface ReplayState {
  scenarioId: string;
  currentTime: string;
  playing: boolean;
  speed: number;
  events: ReplayEvent[];
  metrics: {
    utilization: MetricPoint[];
    revenue: MetricPoint[];
    queueDepth: MetricPoint[];
    latency: MetricPoint[];
    gpuAvailable: MetricPoint[];
  };
}

// ═══════════════════════════════════════════════
// API Keys / Webhooks / Settings
// ═══════════════════════════════════════════════

export interface ApiKey {
  id: string;
  tenantId: string;
  name: string;
  prefix: string; // first 8 chars visible
  createdAt: string;
  lastUsedAt: string | null;
  status: "active" | "revoked";
}

export interface Webhook {
  id: string;
  tenantId: string;
  url: string;
  events: string[];
  status: "active" | "disabled" | "failing";
  lastDeliveredAt: string | null;
  failureCount: number;
}

// ═══════════════════════════════════════════════
// Log Entry
// ═══════════════════════════════════════════════

export interface LogEntry {
  timestamp: string;
  level: "INFO" | "WARN" | "ERROR" | "DEBUG";
  source: string;
  message: string;
}

// ═══════════════════════════════════════════════
// Dashboard Aggregates
// ═══════════════════════════════════════════════

export interface DashboardData {
  totalGpus: number;
  availableGpus: number;
  utilization: number;
  activeTasks: number;
  queuedTasks: number;
  completedTasks24h: number;
  failedTasks24h: number;
  revenue24h: number;
  revenueTrend: number;
  mrr: number;
  healthScore: number;
  totalPowerKw: number;
  activeEndpoints: number;
  avgEndpointLatency: number;
  totalRps: number;
  avgQueueWaitMin: number;
  utilizationHistory: MetricPoint[];
  revenueHistory: MetricPoint[];
  powerHistory: MetricPoint[];
  gpuModelDistribution: { name: string; value: number }[];
  regionStats: { region: string; totalGpus: number; utilization: number; revenue: number; lat: number; lng: number }[];
  recentAlerts: Alert[];
  topTenants: { name: string; gpuHours: number; revenue: number; tier: string }[];
  taskTypeDistribution: { name: string; value: number }[];
  activityFeed: ActivityEvent[];
}

export interface ActivityEvent {
  id: string;
  ts: string;
  type: "job_started" | "job_completed" | "job_failed" | "alert_fired" | "alert_resolved" | "scale_up" | "scale_down" | "endpoint_deployed" | "invoice_generated" | "incident_opened" | "node_added";
  title: string;
  description: string;
  severity: "info" | "warning" | "critical" | "success";
  icon: string;
}

// ═══════════════════════════════════════════════
// Monitoring Aggregates
// ═══════════════════════════════════════════════

export interface MonitoringData {
  gpus: GpuSummary[];
  avgUtilization: number;
  avgTemperature: number;
  avgPowerDraw: number;
  totalPowerKw: number;
  totalMemoryUsedGb: number;
  totalMemoryTotalGb: number;
  gpusByStatus: { status: string; count: number }[];
  gpusByDc: { dc: string; busy: number; idle: number; error: number; maintenance: number }[];
  temperatureHistory: MetricPoint[];
  powerHistory: MetricPoint[];
  memoryHistory: MetricPoint[];
  utilizationHistory: MetricPoint[];
  logs: LogEntry[];
}

// ═══════════════════════════════════════════════
// Billing Aggregates
// ═══════════════════════════════════════════════

export interface BillingData {
  totalRevenue: number;
  monthlyRevenue: number;
  outstandingAmount: number;
  mrr: number;
  records: BillingRecord[];
  invoices: Invoice[];
  revenueByTier: { tier: string; revenue: number }[];
  revenueBySource: { source: string; revenue: number }[];
  costBreakdown: { category: string; amount: number }[];
  monthlyTrend: MetricPoint[];
  usageRecords: UsageRecord[];
}

// ═══════════════════════════════════════════════
// Search
// ═══════════════════════════════════════════════

export interface SearchResult {
  type: "tenant" | "job" | "endpoint" | "gpu" | "node" | "alert" | "incident";
  id: string;
  title: string;
  subtitle: string;
  url: string;
  icon: string;
}

// ═══════════════════════════════════════════════
// Task (legacy compat alias for Job display)
// ═══════════════════════════════════════════════

export interface Task {
  id: string;
  tenantName: string;
  type: "training" | "inference" | "rendering" | "fine-tuning";
  taskMode: "batch" | "endpoint";
  modelName: string;
  status: "queued" | "running" | "completed" | "failed";
  gpuCount: number;
  gpuModel: string;
  dcName: string;
  priority: "low" | "normal" | "high" | "urgent";
  submitTime: string;
  startTime: string | null;
  endTime: string | null;
  estimatedMinutes: number;
  progress: number;
  gpuHoursUsed: number;
  cost: number;
  traceId?: string;
}
