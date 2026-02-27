import { sql } from "drizzle-orm";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

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
}

export interface GpuSummary {
  id: string;
  nodeHostname: string;
  dcName: string;
  clusterName: string;
  model: string;
  vramGb: number;
  utilization: number;
  temperature: number;
  powerDraw: number;
  memoryUsedGb: number;
  memoryTotalGb: number;
  status: "idle" | "busy" | "error" | "maintenance";
  eccErrors: number;
  fanSpeed: number;
}

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
}

export interface Alert {
  id: string;
  severity: "critical" | "warning" | "info";
  title: string;
  message: string;
  source: string;
  dcName: string;
  timestamp: string;
  acknowledged: boolean;
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

export interface MetricPoint {
  time: string;
  value: number;
}

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
  healthScore: number;
  totalPowerKw: number;
  activeEndpoints: number;
  utilizationHistory: MetricPoint[];
  revenueHistory: MetricPoint[];
  powerHistory: MetricPoint[];
  gpuModelDistribution: { name: string; value: number }[];
  regionStats: { region: string; totalGpus: number; utilization: number; revenue: number }[];
  recentAlerts: Alert[];
  topTenants: { name: string; gpuHours: number; revenue: number }[];
  taskTypeDistribution: { name: string; value: number }[];
}

export interface LogEntry {
  timestamp: string;
  level: "INFO" | "WARN" | "ERROR" | "DEBUG";
  source: string;
  message: string;
}

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

export interface BillingData {
  totalRevenue: number;
  monthlyRevenue: number;
  outstandingAmount: number;
  records: BillingRecord[];
  revenueByTier: { tier: string; revenue: number }[];
  costBreakdown: { category: string; amount: number }[];
  monthlyTrend: MetricPoint[];
}
