import type {
  DataCenter, GpuSummary, Task, Alert, BillingRecord,
  DashboardData, MonitoringData, BillingData, MetricPoint, LogEntry
} from "@shared/schema";

const GPU_MODELS = [
  { model: "H100 SXM", vram: 80, maxPower: 700, idlePower: 100, pricePerHour: 3.49 },
  { model: "A100 SXM 80G", vram: 80, maxPower: 400, idlePower: 60, pricePerHour: 2.21 },
  { model: "A100 PCIe 40G", vram: 40, maxPower: 250, idlePower: 45, pricePerHour: 1.49 },
  { model: "L40S", vram: 48, maxPower: 350, idlePower: 50, pricePerHour: 1.19 },
];

const DC_CONFIGS = [
  { id: "dc-us-east", name: "US-East (Virginia)", location: "Ashburn, VA", region: "US-East", gpus: { "H100 SXM": 64, "A100 SXM 80G": 48, "A100 PCIe 40G": 32, "L40S": 24 }, clusters: 4, bw: 400 },
  { id: "dc-us-west", name: "US-West (Oregon)", location: "The Dalles, OR", region: "US-West", gpus: { "H100 SXM": 48, "A100 SXM 80G": 40, "A100 PCIe 40G": 24, "L40S": 16 }, clusters: 3, bw: 320 },
  { id: "dc-eu-west", name: "EU-West (Frankfurt)", location: "Frankfurt, DE", region: "EU-West", gpus: { "H100 SXM": 32, "A100 SXM 80G": 32, "A100 PCIe 40G": 16, "L40S": 16 }, clusters: 2, bw: 240 },
  { id: "dc-apac", name: "APAC (Tokyo)", location: "Tokyo, JP", region: "APAC", gpus: { "H100 SXM": 24, "A100 SXM 80G": 24, "L40S": 24 }, clusters: 2, bw: 200 },
];

const TENANTS = [
  { name: "NeuralForge AI", tier: "enterprise" as const },
  { name: "DeepVision Labs", tier: "enterprise" as const },
  { name: "PixelMind Studio", tier: "pro" as const },
  { name: "Quantum Research", tier: "pro" as const },
  { name: "SynthWave AI", tier: "pro" as const },
  { name: "DataForge Inc", tier: "starter" as const },
  { name: "CloudBrain Tech", tier: "enterprise" as const },
  { name: "Apex Compute", tier: "pro" as const },
];

const AI_MODELS = [
  "LLaMA-3.1-70B", "Mixtral-8x7B", "Stable Diffusion XL", "Whisper-Large-V3",
  "CodeLlama-34B", "DALL-E 3", "Gemma-2-27B", "Phi-3-Medium",
  "DeepSeek-V2", "Qwen-2-72B",
];

const TASK_TYPES: Task["type"][] = ["training", "inference", "rendering", "fine-tuning"];
const PRIORITIES: Task["priority"][] = ["low", "normal", "high", "urgent"];

function smoothNoise(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return Math.abs(x - Math.floor(x));
}

function randIndex(seed: number, length: number): number {
  return Math.min(Math.floor(smoothNoise(seed) * length), length - 1);
}

function timeBasedMetric(base: number, amplitude: number, periodMin: number, offset: number = 0): number {
  const now = Date.now() / 60000;
  const wave = Math.sin((now + offset) * 2 * Math.PI / periodMin);
  const noise = Math.sin(now * 0.7 + offset * 3.14) * amplitude * 0.15;
  return base + amplitude * wave + noise;
}

function dailyPattern(hour: number): number {
  if (hour < 4) return 0.35 + 0.05 * Math.sin(hour * 0.5);
  if (hour < 8) return 0.35 + (hour - 4) * 0.08;
  if (hour < 14) return 0.67 + (hour - 8) * 0.04;
  if (hour < 18) return 0.85 + 0.05 * Math.sin((hour - 14) * 0.8);
  if (hour < 22) return 0.85 - (hour - 18) * 0.1;
  return 0.45 + (24 - hour) * 0.05;
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

class CoreXSimulator {
  private totalGpuCount: number;
  private gpuList: { dcId: string; dcName: string; cluster: string; node: string; model: typeof GPU_MODELS[0]; idx: number }[] = [];

  constructor() {
    this.totalGpuCount = 0;
    let gpuIdx = 0;

    for (const dc of DC_CONFIGS) {
      for (const [modelName, count] of Object.entries(dc.gpus)) {
        const modelSpec = GPU_MODELS.find(m => m.model === modelName)!;
        for (let i = 0; i < count; i++) {
          const clusterIdx = i % dc.clusters;
          const nodeIdx = Math.floor(i / 8);
          this.gpuList.push({
            dcId: dc.id,
            dcName: dc.name,
            cluster: `${dc.id}-cluster-${clusterIdx}`,
            node: `${dc.id}-node-${clusterIdx}-${nodeIdx}`,
            model: modelSpec,
            idx: gpuIdx++,
          });
        }
        this.totalGpuCount += count;
      }
    }
  }

  private getGpuUtilization(gpuIdx: number): number {
    const now = new Date();
    const hour = now.getHours() + now.getMinutes() / 60;
    const base = dailyPattern(hour) * 100;
    const perGpuOffset = smoothNoise(gpuIdx * 17) * 30 - 15;
    const timeNoise = Math.sin(Date.now() / 45000 + gpuIdx * 2.7) * 8;
    return clamp(base + perGpuOffset + timeNoise, 0, 100);
  }

  private getGpuStatus(util: number, gpuIdx: number): GpuSummary["status"] {
    const errorThreshold = smoothNoise(gpuIdx * 31 + Math.floor(Date.now() / 600000));
    if (errorThreshold > 0.97) return "error";
    if (smoothNoise(gpuIdx * 53 + Math.floor(Date.now() / 1800000)) > 0.95) return "maintenance";
    if (util < 15) return "idle";
    return "busy";
  }

  getDataCenters(): DataCenter[] {
    return DC_CONFIGS.map((dc, dcIdx) => {
      const dcGpus = this.gpuList.filter(g => g.dcId === dc.id);
      const totalGpus = dcGpus.length;
      const utils = dcGpus.map((g) => this.getGpuUtilization(g.idx));
      const avgUtil = utils.reduce((a, b) => a + b, 0) / utils.length;
      const statuses = dcGpus.map((g, i) => this.getGpuStatus(utils[i], g.idx));
      const available = statuses.filter(s => s === "idle").length;
      const avgTemp = 32 + avgUtil * 0.45 + Math.sin(Date.now() / 60000 + dcIdx) * 2;
      const totalPower = dcGpus.reduce((sum, g, i) => {
        const u = utils[i] / 100;
        return sum + g.model.idlePower + (g.model.maxPower - g.model.idlePower) * u;
      }, 0) / 1000;

      const nodesSet = new Set(dcGpus.map(g => g.node));

      return {
        id: dc.id,
        name: dc.name,
        location: dc.location,
        region: dc.region,
        status: "online" as const,
        totalGpus: totalGpus,
        availableGpus: available,
        utilization: Math.round(avgUtil * 10) / 10,
        powerUsageKw: Math.round(totalPower * 10) / 10,
        avgTemperature: Math.round(avgTemp * 10) / 10,
        clusterCount: dc.clusters,
        nodeCount: nodesSet.size,
        networkBandwidthGbps: dc.bw,
        storageUsedTb: Math.round((150 + dcIdx * 30 + Math.sin(Date.now() / 3600000) * 10) * 10) / 10,
        storageTotalTb: 250 + dcIdx * 50,
      };
    });
  }

  private generateLogs(): LogEntry[] {
    const now = Date.now();
    const logs: LogEntry[] = [];
    const logTemplates: { level: LogEntry["level"]; source: string; messages: string[] }[] = [
      { level: "INFO", source: "scheduler", messages: [
        "Task task-{id} assigned to gpu-{gpu} on {dc}",
        "Batch queue processed: {n} tasks dispatched in {ms}ms",
        "Auto-scaling evaluated: no changes needed for {dc}",
        "Tenant {tenant} quota check passed: {n}% utilized",
        "Health check completed for {dc}: all nodes responsive",
      ]},
      { level: "INFO", source: "gpu-manager", messages: [
        "GPU gpu-{gpu} utilization stable at {util}%",
        "Memory allocation: {mem}GB/{total}GB on gpu-{gpu}",
        "Driver version verified: 550.127.05 on {dc} nodes",
        "ECC scrub completed on gpu-{gpu}: 0 errors found",
        "PCIe link speed verified: Gen4 x16 on node {node}",
      ]},
      { level: "WARN", source: "thermal-monitor", messages: [
        "GPU gpu-{gpu} temperature {temp}°C approaching threshold",
        "Fan speed increased to {fan}% on node {node}",
        "Ambient temperature elevated in {dc} zone B: {temp}°C",
      ]},
      { level: "WARN", source: "resource-monitor", messages: [
        "VRAM pressure on gpu-{gpu}: {util}% utilized",
        "Network bandwidth spike on {dc}: {bw}Gbps sustained",
        "Storage I/O latency elevated on {dc}: {ms}ms avg",
      ]},
      { level: "ERROR", source: "health-checker", messages: [
        "GPU gpu-{gpu} ECC uncorrectable error detected",
        "Node {node} heartbeat missed (timeout: 30s)",
        "NVLink error on gpu-{gpu}: link degraded to x8",
      ]},
      { level: "DEBUG", source: "orchestrator", messages: [
        "Evaluating placement for {n}x {model} request",
        "Cache hit for tenant {tenant} model weights: {model}",
        "Checkpoint saved for task task-{id} at epoch {n}",
        "gRPC keepalive sent to {dc} control plane",
        "Metrics aggregation cycle completed in {ms}ms",
      ]},
      { level: "INFO", source: "network", messages: [
        "Inter-DC latency {dc}: {ms}ms (within SLA)",
        "InfiniBand fabric health: {n} active ports, 0 errors",
        "DNS resolution time: {ms}ms for api.corex.internal",
      ]},
      { level: "INFO", source: "storage", messages: [
        "NFS mount healthy on {dc}: {n}TB available",
        "Object store sync completed: {n} blobs replicated",
        "Snapshot created for tenant {tenant}: {n}GB",
      ]},
    ];

    for (let i = 0; i < 40; i++) {
      const age = Math.floor(smoothNoise(i * 73 + Math.floor(now / 10000)) * 300000);
      const tmplIdx = randIndex(i * 31 + Math.floor(now / 30000), logTemplates.length);
      const tmpl = logTemplates[tmplIdx];
      const msgIdx = randIndex(i * 41 + Math.floor(now / 15000), tmpl.messages.length);
      let msg = tmpl.messages[msgIdx];

      const dcIdx = randIndex(i * 51, DC_CONFIGS.length);
      const gpuIdx = Math.floor(smoothNoise(i * 61) * 464);
      const tenantIdx = randIndex(i * 71, TENANTS.length);
      const modelIdx = randIndex(i * 81, AI_MODELS.length);

      msg = msg
        .replace("{id}", String(Math.floor(smoothNoise(i * 91) * 45)).padStart(4, "0"))
        .replace("{gpu}", String(gpuIdx).padStart(4, "0"))
        .replace("{dc}", DC_CONFIGS[dcIdx].name)
        .replace("{tenant}", TENANTS[tenantIdx].name)
        .replace("{model}", AI_MODELS[modelIdx])
        .replace("{n}", String(Math.floor(smoothNoise(i * 101) * 200) + 1))
        .replace("{ms}", String(Math.floor(smoothNoise(i * 111) * 150) + 1))
        .replace("{util}", String(Math.floor(smoothNoise(i * 121) * 60) + 40))
        .replace("{temp}", String(Math.floor(smoothNoise(i * 131) * 20) + 70))
        .replace("{fan}", String(Math.floor(smoothNoise(i * 141) * 40) + 50))
        .replace("{mem}", String(Math.floor(smoothNoise(i * 151) * 60) + 20))
        .replace("{total}", "80")
        .replace("{bw}", String(Math.floor(smoothNoise(i * 161) * 300) + 100))
        .replace("{node}", `dc-${["us-east", "us-west", "eu-west", "apac"][dcIdx]}-node-${Math.floor(smoothNoise(i * 171) * 4)}-${Math.floor(smoothNoise(i * 181) * 6)}`);

      logs.push({
        timestamp: new Date(now - age).toISOString(),
        level: tmpl.level,
        source: tmpl.source,
        message: msg,
      });
    }

    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  getMonitoringData(): MonitoringData {
    const gpus: GpuSummary[] = this.gpuList.map((g) => {
      const util = this.getGpuUtilization(g.idx);
      const status = this.getGpuStatus(util, g.idx);
      const temp = 30 + util * 0.5 + Math.sin(Date.now() / 30000 + g.idx) * 3;
      const power = g.model.idlePower + (g.model.maxPower - g.model.idlePower) * (util / 100);
      const memUsed = (util / 100) * g.model.vram * (0.7 + smoothNoise(g.idx * 7) * 0.3);

      return {
        id: `gpu-${g.idx.toString().padStart(4, "0")}`,
        nodeHostname: g.node,
        dcName: g.dcName,
        clusterName: g.cluster,
        model: g.model.model,
        vramGb: g.model.vram,
        utilization: Math.round(util * 10) / 10,
        temperature: Math.round(temp * 10) / 10,
        powerDraw: Math.round(power),
        memoryUsedGb: Math.round(memUsed * 10) / 10,
        memoryTotalGb: g.model.vram,
        status: status,
        eccErrors: smoothNoise(g.idx * 41 + Math.floor(Date.now() / 3600000)) > 0.92 ? Math.floor(smoothNoise(g.idx * 67) * 5) + 1 : 0,
        fanSpeed: Math.round(30 + util * 0.5 + Math.sin(Date.now() / 20000 + g.idx) * 5),
      };
    });

    const avgUtil = gpus.reduce((s, g) => s + g.utilization, 0) / gpus.length;
    const avgTemp = gpus.reduce((s, g) => s + g.temperature, 0) / gpus.length;
    const avgPower = gpus.reduce((s, g) => s + g.powerDraw, 0) / gpus.length;
    const totalPower = gpus.reduce((s, g) => s + g.powerDraw, 0) / 1000;
    const totalMemUsed = gpus.reduce((s, g) => s + g.memoryUsedGb, 0);
    const totalMemTotal = gpus.reduce((s, g) => s + g.memoryTotalGb, 0);

    const statusCounts: Record<string, number> = {};
    gpus.forEach(g => { statusCounts[g.status] = (statusCounts[g.status] || 0) + 1; });

    const dcStatusMap: Record<string, { busy: number; idle: number; error: number; maintenance: number }> = {};
    gpus.forEach(g => {
      if (!dcStatusMap[g.dcName]) dcStatusMap[g.dcName] = { busy: 0, idle: 0, error: 0, maintenance: 0 };
      dcStatusMap[g.dcName][g.status]++;
    });
    const gpusByDc = Object.entries(dcStatusMap).map(([dc, counts]) => ({ dc, ...counts }));

    const now = Date.now();
    const tempHistory: MetricPoint[] = [];
    const powerHistory: MetricPoint[] = [];
    const memHistory: MetricPoint[] = [];
    const utilHistory: MetricPoint[] = [];

    for (let i = 47; i >= 0; i--) {
      const t = new Date(now - i * 30 * 60000);
      const h = t.getHours() + t.getMinutes() / 60;
      const u = dailyPattern(h) * 100;
      const noise = Math.sin(i * 0.7) * 5;
      tempHistory.push({ time: t.toISOString(), value: Math.round((32 + u * 0.45) * 10) / 10 });
      powerHistory.push({ time: t.toISOString(), value: Math.round(totalPower * (u / Math.max(1, avgUtil)) * 10) / 10 });
      memHistory.push({ time: t.toISOString(), value: Math.round(u * 0.75 * 10) / 10 });
      utilHistory.push({ time: t.toISOString(), value: Math.round((u + noise) * 10) / 10 });
    }

    return {
      gpus: gpus.slice(0, 100),
      avgUtilization: Math.round(avgUtil * 10) / 10,
      avgTemperature: Math.round(avgTemp * 10) / 10,
      avgPowerDraw: Math.round(avgPower),
      totalPowerKw: Math.round(totalPower * 10) / 10,
      totalMemoryUsedGb: Math.round(totalMemUsed * 10) / 10,
      totalMemoryTotalGb: Math.round(totalMemTotal),
      gpusByStatus: Object.entries(statusCounts).map(([status, count]) => ({ status, count })),
      gpusByDc,
      temperatureHistory: tempHistory,
      powerHistory: powerHistory,
      memoryHistory: memHistory,
      utilizationHistory: utilHistory,
      logs: this.generateLogs(),
    };
  }

  getTasks(): Task[] {
    const tasks: Task[] = [];
    const now = Date.now();

    for (let i = 0; i < 45; i++) {
      const seed = smoothNoise(i * 97 + Math.floor(now / 3600000));
      const tenant = TENANTS[randIndex(i * 13, TENANTS.length)];
      const modelIdx = randIndex(i * 23, AI_MODELS.length);
      const typeIdx = randIndex(i * 37, TASK_TYPES.length);
      const gpuModel = GPU_MODELS[randIndex(i * 47, GPU_MODELS.length)];
      const dcIdx = randIndex(i * 59, DC_CONFIGS.length);
      const priorityIdx = randIndex(i * 71, PRIORITIES.length);
      const gpuCount = [1, 2, 4, 8][randIndex(i * 83, 4)];
      const estimatedMin = Math.floor(30 + smoothNoise(i * 91) * 480);
      const isEndpoint = smoothNoise(i * 101) > 0.7;

      let status: Task["status"];
      let progress = 0;
      let startTime: string | null = null;
      let endTime: string | null = null;
      let submitOffset: number;

      if (i < 12) {
        status = "running";
        submitOffset = Math.floor(smoothNoise(i * 111) * 7200000) + 600000;
        startTime = new Date(now - submitOffset + 300000).toISOString();
        const elapsed = (now - (now - submitOffset + 300000)) / 60000;
        progress = Math.min(95, Math.round((elapsed / estimatedMin) * 100));
      } else if (i < 18) {
        status = "queued";
        submitOffset = Math.floor(smoothNoise(i * 121) * 1800000);
      } else if (i < 38) {
        status = "completed";
        submitOffset = Math.floor(smoothNoise(i * 131) * 86400000);
        startTime = new Date(now - submitOffset + 300000).toISOString();
        endTime = new Date(now - submitOffset + 300000 + estimatedMin * 60000).toISOString();
        progress = 100;
      } else {
        status = "failed";
        submitOffset = Math.floor(smoothNoise(i * 141) * 86400000);
        startTime = new Date(now - submitOffset + 300000).toISOString();
        endTime = new Date(now - submitOffset + Math.floor(estimatedMin * 0.3) * 60000).toISOString();
        progress = Math.floor(smoothNoise(i * 151) * 60) + 10;
      }

      const gpuHoursUsed = status === "running"
        ? Math.round(((Date.now() - new Date(startTime!).getTime()) / 3600000) * gpuCount * 100) / 100
        : status === "completed" || status === "failed"
          ? Math.round((estimatedMin / 60) * gpuCount * (status === "failed" ? 0.3 : 1) * 100) / 100
          : 0;

      const cost = Math.round(gpuHoursUsed * gpuModel.pricePerHour * 100) / 100;

      tasks.push({
        id: `task-${i.toString().padStart(4, "0")}`,
        tenantName: tenant.name,
        type: TASK_TYPES[typeIdx],
        taskMode: isEndpoint ? "endpoint" : "batch",
        modelName: AI_MODELS[modelIdx],
        status,
        gpuCount,
        gpuModel: gpuModel.model,
        dcName: DC_CONFIGS[dcIdx].name,
        priority: PRIORITIES[priorityIdx],
        submitTime: new Date(now - submitOffset).toISOString(),
        startTime,
        endTime,
        estimatedMinutes: estimatedMin,
        progress,
        gpuHoursUsed,
        cost,
      });
    }

    return tasks.sort((a, b) => {
      const order = { running: 0, queued: 1, failed: 2, completed: 3 };
      return order[a.status] - order[b.status];
    });
  }

  getAlerts(): Alert[] {
    const alerts: Alert[] = [];
    const now = Date.now();
    const alertTemplates = [
      { severity: "critical" as const, title: "GPU ECC Error Detected", source: "DCGM Monitor" },
      { severity: "critical" as const, title: "Node Unreachable", source: "Health Checker" },
      { severity: "critical" as const, title: "Storage Capacity Critical", source: "Storage Monitor" },
      { severity: "warning" as const, title: "GPU Temperature High", source: "Thermal Monitor" },
      { severity: "warning" as const, title: "Memory Utilization > 90%", source: "Resource Monitor" },
      { severity: "warning" as const, title: "Network Latency Spike", source: "Network Monitor" },
      { severity: "warning" as const, title: "Task Queue Backlog Growing", source: "Scheduler" },
      { severity: "warning" as const, title: "Power Usage Approaching Limit", source: "Power Monitor" },
      { severity: "info" as const, title: "Scheduled Maintenance Window", source: "Ops Manager" },
      { severity: "info" as const, title: "New GPU Driver Available", source: "Update Manager" },
      { severity: "info" as const, title: "Cluster Scaling Completed", source: "Auto Scaler" },
      { severity: "info" as const, title: "Backup Completed Successfully", source: "Backup Service" },
      { severity: "info" as const, title: "SSL Certificate Renewed", source: "Cert Manager" },
      { severity: "warning" as const, title: "SLA Threshold Warning", source: "SLA Monitor" },
      { severity: "critical" as const, title: "Cooling System Alert", source: "HVAC Controller" },
    ];

    const messages: Record<string, string[]> = {
      "GPU ECC Error Detected": ["Uncorrectable ECC error on GPU gpu-0142 in node dc-us-east-node-2-3. Recommend replacement.", "Multiple ECC errors detected on GPU gpu-0287. Error count: 12 in last hour."],
      "Node Unreachable": ["Node dc-eu-west-node-1-2 failed health check. Last heartbeat 180s ago.", "IPMI connection lost to dc-apac-node-0-1. Attempting BMC reset."],
      "Storage Capacity Critical": ["NVMe storage on cluster dc-us-east-cluster-2 at 94% capacity. Expansion required."],
      "GPU Temperature High": ["GPU gpu-0089 reporting 87°C. Throttling may occur above 90°C.", "Multiple GPUs in dc-us-west-cluster-1 exceeding 82°C threshold."],
      "Memory Utilization > 90%": ["Node dc-us-east-node-0-4 VRAM usage at 93%. OOM risk for new allocations."],
      "Network Latency Spike": ["Inter-DC latency US-East to EU-West increased to 145ms (baseline: 85ms)."],
      "Task Queue Backlog Growing": ["H100 queue depth reached 23 tasks. Average wait time: 47 minutes."],
      "Power Usage Approaching Limit": ["DC US-East power consumption at 89% of contracted capacity (2.1MW/2.4MW)."],
      "Scheduled Maintenance Window": ["DC EU-West cluster-1 maintenance scheduled for 2026-03-01 02:00 UTC. Duration: 4 hours."],
      "New GPU Driver Available": ["NVIDIA driver 550.127.05 available. Includes H100 performance improvements."],
      "Cluster Scaling Completed": ["DC APAC cluster-0 expanded by 8 L40S GPUs. New total: 32 GPUs."],
      "Backup Completed Successfully": ["Daily configuration backup completed. 847 configs archived. Size: 2.3GB."],
      "SSL Certificate Renewed": ["API endpoint SSL certificate renewed. Valid until 2027-02-27."],
      "SLA Threshold Warning": ["Tenant NeuralForge AI approaching 99.9% SLA boundary. Current uptime: 99.92%."],
      "Cooling System Alert": ["Chiller unit #3 in DC US-East showing reduced cooling capacity. Maintenance dispatched."],
    };

    for (let i = 0; i < alertTemplates.length; i++) {
      const tmpl = alertTemplates[i];
      const dcIdx = randIndex(i * 19, DC_CONFIGS.length);
      const msgList = messages[tmpl.title] || [`${tmpl.title} detected in ${DC_CONFIGS[dcIdx].name}.`];
      const msg = msgList[randIndex(i * 29, msgList.length)];
      const age = Math.floor(smoothNoise(i * 39) * 86400000);
      const acked = smoothNoise(i * 49) > 0.4 && tmpl.severity !== "critical";

      alerts.push({
        id: `alert-${i.toString().padStart(3, "0")}`,
        severity: tmpl.severity,
        title: tmpl.title,
        message: msg,
        source: tmpl.source,
        dcName: DC_CONFIGS[dcIdx].name,
        timestamp: new Date(now - age).toISOString(),
        acknowledged: acked,
      });
    }

    return alerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  getBillingData(): BillingData {
    const records: BillingRecord[] = [];
    const now = new Date();

    for (let t = 0; t < TENANTS.length; t++) {
      for (let m = 0; m < 3; m++) {
        const month = new Date(now.getFullYear(), now.getMonth() - m, 1);
        const monthStr = month.toISOString().slice(0, 7);
        const baseHours = TENANTS[t].tier === "enterprise" ? 8000 : TENANTS[t].tier === "pro" ? 3000 : 800;
        const gpuHours = Math.round(baseHours * (1 + smoothNoise(t * 11 + m * 7) * 0.4 - 0.2));
        const avgPrice = 2.1 + smoothNoise(t * 13 + m * 3) * 0.8;
        const amount = Math.round(gpuHours * avgPrice * 100) / 100;

        let status: BillingRecord["status"] = "paid";
        if (m === 0) status = smoothNoise(t * 17) > 0.7 ? "pending" : "paid";
        if (m === 0 && smoothNoise(t * 23) > 0.9) status = "overdue";

        records.push({
          id: `inv-${t}-${m}`,
          tenantName: TENANTS[t].name,
          tier: TENANTS[t].tier,
          period: monthStr,
          gpuHours,
          amount,
          status,
          invoiceDate: new Date(month.getFullYear(), month.getMonth() + 1, 1).toISOString().slice(0, 10),
          dueDate: new Date(month.getFullYear(), month.getMonth() + 1, 15).toISOString().slice(0, 10),
        });
      }
    }

    const currentMonthRecords = records.filter(r => r.period === now.toISOString().slice(0, 7));
    const totalRevenue = records.reduce((s, r) => s + r.amount, 0);
    const monthlyRevenue = currentMonthRecords.reduce((s, r) => s + r.amount, 0);
    const outstanding = records.filter(r => r.status !== "paid").reduce((s, r) => s + r.amount, 0);

    const revenueByTier = [
      { tier: "Enterprise", revenue: records.filter(r => r.tier === "enterprise").reduce((s, r) => s + r.amount, 0) },
      { tier: "Pro", revenue: records.filter(r => r.tier === "pro").reduce((s, r) => s + r.amount, 0) },
      { tier: "Starter", revenue: records.filter(r => r.tier === "starter").reduce((s, r) => s + r.amount, 0) },
    ];

    const costBreakdown = [
      { category: "GPU Depreciation", amount: Math.round(monthlyRevenue * 0.28) },
      { category: "Power & Cooling", amount: Math.round(monthlyRevenue * 0.18) },
      { category: "Network & Bandwidth", amount: Math.round(monthlyRevenue * 0.08) },
      { category: "Staff & Operations", amount: Math.round(monthlyRevenue * 0.12) },
      { category: "Facility Lease", amount: Math.round(monthlyRevenue * 0.10) },
      { category: "Software Licenses", amount: Math.round(monthlyRevenue * 0.05) },
    ];

    const monthlyTrend: MetricPoint[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const base = 180000 + (12 - i) * 12000;
      const noise = Math.sin(i * 1.5) * 15000;
      monthlyTrend.push({ time: d.toISOString(), value: Math.round(base + noise) });
    }

    return { totalRevenue: Math.round(totalRevenue), monthlyRevenue: Math.round(monthlyRevenue), outstandingAmount: Math.round(outstanding), records, revenueByTier, costBreakdown, monthlyTrend };
  }

  getDashboardData(): DashboardData {
    const dcs = this.getDataCenters();
    const tasks = this.getTasks();
    const alerts = this.getAlerts();
    const billing = this.getBillingData();

    const totalGpus = dcs.reduce((s, d) => s + d.totalGpus, 0);
    const availableGpus = dcs.reduce((s, d) => s + d.availableGpus, 0);
    const avgUtil = dcs.reduce((s, d) => s + d.utilization * d.totalGpus, 0) / totalGpus;
    const totalPower = dcs.reduce((s, d) => s + d.powerUsageKw, 0);

    const activeTasks = tasks.filter(t => t.status === "running").length;
    const queuedTasks = tasks.filter(t => t.status === "queued").length;
    const completedTasks24h = tasks.filter(t => t.status === "completed").length;
    const failedTasks24h = tasks.filter(t => t.status === "failed").length;
    const activeEndpoints = tasks.filter(t => t.taskMode === "endpoint" && t.status === "running").length;

    const revenue24h = Math.round(tasks.filter(t => t.status === "running" || t.status === "completed").reduce((s, t) => s + t.cost, 0));
    const revenueTrend = 12.4 + Math.sin(Date.now() / 3600000) * 3;

    const critAlerts = alerts.filter(a => a.severity === "critical" && !a.acknowledged).length;
    const healthScore = Math.max(85, 99.5 - critAlerts * 3 - failedTasks24h * 0.5);

    const now = Date.now();
    const utilizationHistory: MetricPoint[] = [];
    const revenueHistory: MetricPoint[] = [];
    const powerHistory: MetricPoint[] = [];

    for (let i = 47; i >= 0; i--) {
      const t = new Date(now - i * 30 * 60000);
      const h = t.getHours() + t.getMinutes() / 60;
      const u = dailyPattern(h) * 100;
      const noise = Math.sin(i * 0.7) * 5;
      utilizationHistory.push({ time: t.toISOString(), value: Math.round((u + noise) * 10) / 10 });
      powerHistory.push({ time: t.toISOString(), value: Math.round(totalPower * (u / Math.max(1, avgUtil)) * 10) / 10 });
    }

    for (let i = 6; i >= 0; i--) {
      const t = new Date(now - i * 86400000);
      const dayOfWeek = t.getDay();
      const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
      const base = isWeekday ? 48000 : 34000;
      const noise = Math.sin(i * 1.3) * 5000;
      revenueHistory.push({ time: t.toISOString(), value: Math.round(base + noise) });
    }

    const gpuModelCounts: Record<string, number> = {};
    for (const dc of DC_CONFIGS) {
      for (const [model, count] of Object.entries(dc.gpus)) {
        gpuModelCounts[model] = (gpuModelCounts[model] || 0) + count;
      }
    }

    const regionStats = dcs.map(dc => ({
      region: dc.region,
      totalGpus: dc.totalGpus,
      utilization: dc.utilization,
      revenue: Math.round(dc.totalGpus * avgUtil / 100 * 2.2 * 24),
    }));

    const typeCounts: Record<string, number> = {};
    tasks.filter(t => t.status === "running" || t.status === "queued").forEach(t => {
      typeCounts[t.type] = (typeCounts[t.type] || 0) + 1;
    });

    const topTenants = TENANTS.map(t => {
      const tenantTasks = tasks.filter(tk => tk.tenantName === t.name);
      return {
        name: t.name,
        gpuHours: Math.round(tenantTasks.reduce((s, tk) => s + tk.gpuHoursUsed, 0) * 10) / 10,
        revenue: Math.round(tenantTasks.reduce((s, tk) => s + tk.cost, 0) * 100) / 100,
      };
    }).sort((a, b) => b.revenue - a.revenue).slice(0, 6);

    return {
      totalGpus: totalGpus,
      availableGpus: availableGpus,
      utilization: Math.round(avgUtil * 10) / 10,
      activeTasks,
      queuedTasks,
      completedTasks24h,
      failedTasks24h,
      revenue24h,
      revenueTrend: Math.round(revenueTrend * 10) / 10,
      healthScore: Math.round(healthScore * 10) / 10,
      totalPowerKw: Math.round(totalPower * 10) / 10,
      activeEndpoints,
      utilizationHistory,
      revenueHistory,
      powerHistory,
      gpuModelDistribution: Object.entries(gpuModelCounts).map(([name, value]) => ({ name, value })),
      regionStats,
      recentAlerts: alerts.slice(0, 5),
      topTenants,
      taskTypeDistribution: Object.entries(typeCounts).map(([name, value]) => ({ name, value })),
    };
  }
}

export const simulator = new CoreXSimulator();
