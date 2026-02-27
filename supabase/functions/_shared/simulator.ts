// Simulator — Deno-compatible, no external type imports.
// All types are inferred from return values.

// ═══════════════════════════════════════════════
// GPU & Infrastructure Constants
// ═══════════════════════════════════════════════

const GPU_MODELS = [
  { model: "H100 SXM", vram: 80, maxPower: 700, idlePower: 100, pricePerHour: 3.49, migCapable: true },
  { model: "A100 SXM 80G", vram: 80, maxPower: 400, idlePower: 60, pricePerHour: 2.21, migCapable: true },
  { model: "A100 PCIe 40G", vram: 40, maxPower: 250, idlePower: 45, pricePerHour: 1.49, migCapable: false },
  { model: "L40S", vram: 48, maxPower: 350, idlePower: 50, pricePerHour: 1.19, migCapable: false },
];

const DC_CONFIGS = [
  { id: "dc-uk-london", name: "UK-London (HQ)", location: "London, UK", region: "UK-London", lat: 51.51, lng: -0.13, gpus: { "H100 SXM": 128, "A100 SXM 80G": 96, "A100 PCIe 40G": 64, "L40S": 48 }, clusters: 6, bw: 800 },
  { id: "dc-us-east", name: "US-East (Virginia)", location: "Ashburn, VA", region: "US-East", lat: 39.05, lng: -77.47, gpus: { "H100 SXM": 96, "A100 SXM 80G": 64, "A100 PCIe 40G": 48, "L40S": 32 }, clusters: 5, bw: 600 },
  { id: "dc-us-west", name: "US-West (Oregon)", location: "The Dalles, OR", region: "US-West", lat: 45.59, lng: -121.18, gpus: { "H100 SXM": 64, "A100 SXM 80G": 48, "A100 PCIe 40G": 32, "L40S": 24 }, clusters: 4, bw: 400 },
  { id: "dc-eu-west", name: "EU-Frankfurt", location: "Frankfurt, DE", region: "EU-West", lat: 50.11, lng: 8.68, gpus: { "H100 SXM": 48, "A100 SXM 80G": 40, "A100 PCIe 40G": 24, "L40S": 24 }, clusters: 3, bw: 320 },
  { id: "dc-apac", name: "APAC (Tokyo)", location: "Tokyo, JP", region: "APAC", lat: 35.68, lng: 139.69, gpus: { "H100 SXM": 48, "A100 SXM 80G": 40, "A100 PCIe 40G": 16, "L40S": 24 }, clusters: 3, bw: 300 },
  { id: "dc-apac-sg", name: "APAC (Singapore)", location: "Singapore, SG", region: "APAC-SG", lat: 1.35, lng: 103.82, gpus: { "H100 SXM": 32, "A100 SXM 80G": 24, "L40S": 16 }, clusters: 2, bw: 200 },
];

const TENANTS: { id: string; name: string; tier: "enterprise" | "pro" | "starter"; email: string; mrr: number; gpuQuota: number }[] = [
  { id: "t-001", name: "NeuralForge AI", tier: "enterprise", email: "ops@neuralforge.ai", mrr: 247000, gpuQuota: 256 },
  { id: "t-002", name: "DeepVision Labs", tier: "enterprise", email: "infra@deepvision.io", mrr: 189500, gpuQuota: 192 },
  { id: "t-003", name: "Barclays AI Division", tier: "enterprise", email: "ai-ops@barclays.co.uk", mrr: 312000, gpuQuota: 320 },
  { id: "t-004", name: "Rolls-Royce Digital", tier: "enterprise", email: "hpc@rolls-royce.com", mrr: 178000, gpuQuota: 160 },
  { id: "t-005", name: "AstraZeneca R&D", tier: "enterprise", email: "compute@astrazeneca.com", mrr: 267000, gpuQuota: 256 },
  { id: "t-006", name: "PixelMind Studio", tier: "pro", email: "admin@pixelmind.co", mrr: 43200, gpuQuota: 48 },
  { id: "t-007", name: "Quantum Research", tier: "pro", email: "compute@quantumres.org", mrr: 38700, gpuQuota: 40 },
  { id: "t-008", name: "SynthWave AI", tier: "pro", email: "team@synthwave.ai", mrr: 29500, gpuQuota: 32 },
  { id: "t-009", name: "CloudBrain Tech", tier: "enterprise", email: "sre@cloudbrain.tech", mrr: 156000, gpuQuota: 128 },
  { id: "t-010", name: "Apex Compute", tier: "pro", email: "ops@apexcompute.io", mrr: 24800, gpuQuota: 24 },
  { id: "t-011", name: "DataForge Inc", tier: "starter", email: "hello@dataforge.dev", mrr: 8900, gpuQuota: 12 },
  { id: "t-012", name: "BP Energy AI", tier: "enterprise", email: "digital@bp.com", mrr: 198000, gpuQuota: 192 },
  { id: "t-013", name: "GSK Pharma AI", tier: "enterprise", email: "ai-lab@gsk.com", mrr: 223000, gpuQuota: 208 },
  { id: "t-014", name: "HSBC Quant Lab", tier: "enterprise", email: "quant-ai@hsbc.co.uk", mrr: 287000, gpuQuota: 288 },
  { id: "t-015", name: "Unilever ML Ops", tier: "pro", email: "mlops@unilever.com", mrr: 52000, gpuQuota: 56 },
  { id: "t-016", name: "Tesco Analytics", tier: "pro", email: "data@tesco.com", mrr: 31000, gpuQuota: 32 },
];

const AI_MODELS = [
  "LLaMA-3.1-70B", "Mixtral-8x7B", "Stable Diffusion XL", "Whisper-Large-V3",
  "CodeLlama-34B", "DALL-E 3", "Gemma-2-27B", "Phi-3-Medium",
  "DeepSeek-V2", "Qwen-2-72B", "GPT-J-6B", "Falcon-40B",
];

const TASK_TYPES: Job["type"][] = ["training", "inference", "rendering", "fine-tuning"];
const PRIORITIES: Job["priority"][] = ["low", "normal", "high", "urgent"];
const IMAGES = ["nvcr.io/nvidia/pytorch:24.01", "nvcr.io/nvidia/tensorflow:24.01", "ghcr.io/corex/inference:2.1", "docker.io/huggingface/tgi:2.0"];
const COMMANDS = ["python train.py --epochs 100", "torchrun --nproc_per_node=8 main.py", "python serve.py --model-path /models/llama", "accelerate launch finetune.py"];

// ═══════════════════════════════════════════════
// Utility Functions
// ═══════════════════════════════════════════════

function smoothNoise(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return Math.abs(x - Math.floor(x));
}

function randIndex(seed: number, length: number): number {
  return Math.min(Math.floor(smoothNoise(seed) * length), length - 1);
}

function randId(prefix: string, seed: number): string {
  return `${prefix}-${Math.floor(smoothNoise(seed) * 999999).toString(16).padStart(6, "0")}`;
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

function formatCurrency(n: number): string {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ═══════════════════════════════════════════════
// Replay Scenarios
// ═══════════════════════════════════════════════

const REPLAY_SCENARIOS: ReplayScenario[] = [
  { id: "normal-day", name: "Normal Day", description: "Typical 24-hour operational pattern with steady workload distribution across all regions.", durationMinutes: 1440, tags: ["baseline", "steady-state"], icon: "Sun" },
  { id: "marketing-spike", name: "Marketing Spike", description: "Sudden surge in inference requests from a product launch. Queue depth spikes, autoscale kicks in.", durationMinutes: 480, tags: ["spike", "autoscale"], icon: "TrendingUp" },
  { id: "gpu-failure", name: "GPU Failure", description: "Multiple H100 GPUs in US-East encounter ECC errors, triggering node drain and job migration.", durationMinutes: 360, tags: ["failure", "recovery"], icon: "AlertTriangle" },
  { id: "region-congestion", name: "Region Congestion", description: "EU-West network experiences congestion causing latency spikes for endpoints in that region.", durationMinutes: 300, tags: ["network", "latency"], icon: "Wifi" },
  { id: "big-customer", name: "Big Customer Onboarding", description: "New enterprise customer provisions 128x H100 GPUs. MRR jumps, capacity redistributes.", durationMinutes: 720, tags: ["growth", "revenue"], icon: "UserPlus" },
  { id: "auto-scale", name: "Auto-Scale Story", description: "Endpoint traffic ramps, triggers auto-scale from 2 to 16 replicas, latency stabilizes.", durationMinutes: 240, tags: ["autoscale", "endpoint"], icon: "Maximize2" },
];

// ═══════════════════════════════════════════════
// Main Simulator Class
// ═══════════════════════════════════════════════

class CoreXSimulator {
  private totalGpuCount: number;
  private gpuList: { dcId: string; dcName: string; dcRegion: string; cluster: string; clusterIdx: number; node: string; nodeIdx: number; model: typeof GPU_MODELS[0]; idx: number }[] = [];
  private replayState: ReplayState | null = null;

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
            dcRegion: dc.region,
            cluster: `${dc.id}-cluster-${clusterIdx}`,
            clusterIdx,
            node: `${dc.id}-node-${clusterIdx}-${nodeIdx}`,
            nodeIdx,
            model: modelSpec,
            idx: gpuIdx++,
          });
        }
        this.totalGpuCount += count;
      }
    }
  }

  // ─── GPU Metrics ──────────────────────────────

  private getGpuUtilization(gpuIdx: number): number {
    const now = Date.now();
    const d = new Date(now);
    const hour = d.getHours() + d.getMinutes() / 60;
    const base = dailyPattern(hour) * 100;
    const perGpuOffset = smoothNoise(gpuIdx * 17) * 30 - 15;
    // Multiple overlapping oscillations for realistic real-time feel
    const fast = Math.sin(now / 8000 + gpuIdx * 2.7) * 5;
    const medium = Math.sin(now / 25000 + gpuIdx * 1.3) * 7;
    const slow = Math.sin(now / 120000 + gpuIdx * 0.9) * 4;
    const micro = Math.sin(now / 3000 + gpuIdx * 4.1) * 2;
    return clamp(base + perGpuOffset + fast + medium + slow + micro, 0, 100);
  }

  private getGpuStatus(util: number, gpuIdx: number): GpuSummary["status"] {
    const errorThreshold = smoothNoise(gpuIdx * 31 + Math.floor(Date.now() / 600000));
    if (errorThreshold > 0.97) return "error";
    if (smoothNoise(gpuIdx * 53 + Math.floor(Date.now() / 1800000)) > 0.95) return "maintenance";
    if (util < 15) return "idle";
    return "busy";
  }

  // ─── Tenants ──────────────────────────────────

  getTenants(): Tenant[] {
    return TENANTS.map(t => {
      const gpuUsed = Math.floor(t.gpuQuota * (0.5 + smoothNoise(parseInt(t.id.slice(-1)) * 13) * 0.4));
      return {
        id: t.id,
        name: t.name,
        tier: t.tier,
        contactEmail: t.email,
        status: "active" as const,
        createdAt: new Date(Date.now() - Math.floor(smoothNoise(parseInt(t.id.slice(-1)) * 7) * 365 * 86400000)).toISOString(),
        mrr: t.mrr + Math.floor(Math.sin(Date.now() / 86400000) * t.mrr * 0.05),
        gpuQuota: t.gpuQuota,
        gpuUsed,
      };
    });
  }

  // ─── Data Centers ─────────────────────────────

  getDataCenters(): DataCenter[] {
    return DC_CONFIGS.map((dc, dcIdx) => {
      const dcGpus = this.gpuList.filter(g => g.dcId === dc.id);
      const totalGpus = dcGpus.length;
      const utils = dcGpus.map(g => this.getGpuUtilization(g.idx));
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
        totalGpus,
        availableGpus: available,
        utilization: Math.round(avgUtil * 10) / 10,
        powerUsageKw: Math.round(totalPower * 10) / 10,
        avgTemperature: Math.round(avgTemp * 10) / 10,
        clusterCount: dc.clusters,
        nodeCount: nodesSet.size,
        networkBandwidthGbps: dc.bw,
        storageUsedTb: Math.round((150 + dcIdx * 30 + Math.sin(Date.now() / 3600000) * 10) * 10) / 10,
        storageTotalTb: 250 + dcIdx * 50,
        lat: dc.lat,
        lng: dc.lng,
      };
    });
  }

  // ─── Clusters ─────────────────────────────────

  getClusters(dcId?: string): Cluster[] {
    const clusters: Cluster[] = [];
    for (const dc of DC_CONFIGS) {
      if (dcId && dc.id !== dcId) continue;
      for (let c = 0; c < dc.clusters; c++) {
        const cId = `${dc.id}-cluster-${c}`;
        const clusterGpus = this.gpuList.filter(g => g.cluster === cId);
        const utils = clusterGpus.map(g => this.getGpuUtilization(g.idx));
        const avgUtil = utils.length > 0 ? utils.reduce((a, b) => a + b, 0) / utils.length : 0;
        const statuses = clusterGpus.map((g, i) => this.getGpuStatus(utils[i], g.idx));
        const available = statuses.filter(s => s === "idle").length;
        const nodesSet = new Set(clusterGpus.map(g => g.node));
        const hasError = statuses.some(s => s === "error");

        clusters.push({
          id: cId,
          dataCenterId: dc.id,
          dcName: dc.name,
          name: `Cluster ${c}`,
          schedulerType: c === 0 ? "binpack" : c === 1 ? "spread" : "priority",
          status: hasError ? "degraded" : "healthy",
          nodeCount: nodesSet.size,
          totalGpus: clusterGpus.length,
          availableGpus: available,
          utilization: Math.round(avgUtil * 10) / 10,
          networkFabric: c < 2 ? "InfiniBand NDR 400G" : "RoCEv2 100G",
        });
      }
    }
    return clusters;
  }

  // ─── Nodes ────────────────────────────────────

  getNodes(clusterId?: string): Node[] {
    const nodeMap = new Map<string, typeof this.gpuList>();
    for (const g of this.gpuList) {
      if (clusterId && g.cluster !== clusterId) continue;
      if (!nodeMap.has(g.node)) nodeMap.set(g.node, []);
      nodeMap.get(g.node)!.push(g);
    }

    return Array.from(nodeMap.entries()).map(([nodeId, gpus]) => {
      const utils = gpus.map(g => this.getGpuUtilization(g.idx));
      const avgUtil = utils.reduce((a, b) => a + b, 0) / utils.length;
      const status = smoothNoise(gpus[0].idx * 71 + Math.floor(Date.now() / 1800000)) > 0.97 ? "maintenance" as const : "online" as const;

      return {
        id: nodeId,
        clusterId: gpus[0].cluster,
        clusterName: `Cluster ${gpus[0].clusterIdx}`,
        dcName: gpus[0].dcName,
        hostname: nodeId,
        cpu: gpus[0].model.model.includes("H100") ? "AMD EPYC 9654 96-Core" : "Intel Xeon w9-3495X 56-Core",
        ramGb: gpus.length >= 8 ? 2048 : 1024,
        storageGb: gpus.length >= 8 ? 30720 : 15360,
        netGbps: gpus[0].model.model.includes("H100") ? 400 : 100,
        status,
        gpuCount: gpus.length,
        gpuModel: gpus[0].model.model,
        utilization: Math.round(avgUtil * 10) / 10,
        lastSeenAt: new Date(Date.now() - Math.floor(Math.random() * 30000)).toISOString(),
      };
    });
  }

  // ─── GPUs ─────────────────────────────────────

  getGpus(nodeId?: string, status?: string): GpuSummary[] {
    let gpus = this.gpuList;
    if (nodeId) gpus = gpus.filter(g => g.node === nodeId);

    const result = gpus.map(g => {
      const util = this.getGpuUtilization(g.idx);
      const st = this.getGpuStatus(util, g.idx);
      const temp = 30 + util * 0.5 + Math.sin(Date.now() / 30000 + g.idx) * 3;
      const power = g.model.idlePower + (g.model.maxPower - g.model.idlePower) * (util / 100);
      const memUsed = (util / 100) * g.model.vram * (0.7 + smoothNoise(g.idx * 7) * 0.3);

      return {
        id: `gpu-${g.idx.toString().padStart(4, "0")}`,
        nodeId: g.node,
        nodeHostname: g.node,
        dcName: g.dcName,
        clusterName: g.cluster,
        model: g.model.model,
        vramGb: g.model.vram,
        serial: `SN${(g.idx * 7919 + 100000).toString(16).toUpperCase().slice(0, 10)}`,
        migCapable: g.model.migCapable,
        utilization: Math.round(util * 10) / 10,
        temperature: Math.round(temp * 10) / 10,
        powerDraw: Math.round(power),
        memoryUsedGb: Math.round(memUsed * 10) / 10,
        memoryTotalGb: g.model.vram,
        status: st,
        eccErrors: smoothNoise(g.idx * 41 + Math.floor(Date.now() / 3600000)) > 0.92 ? Math.floor(smoothNoise(g.idx * 67) * 5) + 1 : 0,
        fanSpeed: Math.round(30 + util * 0.5 + Math.sin(Date.now() / 20000 + g.idx) * 5),
      };
    });

    if (status) return result.filter(g => g.status === status);
    return result;
  }

  // ─── Queues ───────────────────────────────────

  getQueues(): Queue[] {
    return TENANTS.map((t, i) => {
      const now = Date.now();
      const pending = Math.floor(smoothNoise(i * 37 + Math.floor(now / 20000)) * 15 + Math.sin(now / 8000 + i * 3) * 3);
      const usedGpu = Math.floor(t.gpuQuota * (0.4 + smoothNoise(i * 47 + Math.floor(now / 30000)) * 0.5));
      return {
        id: `q-${t.id}`,
        tenantId: t.id,
        tenantName: t.name,
        name: `${t.name} Default Queue`,
        priority: t.tier === "enterprise" ? 100 : t.tier === "pro" ? 50 : 10,
        quotaGpu: t.gpuQuota,
        usedGpu,
        pendingJobs: pending,
        status: "active" as const,
      };
    });
  }

  // ─── Jobs ─────────────────────────────────────

  getJobs(status?: string, tenantId?: string): Job[] {
    const jobs: Job[] = [];
    const now = Date.now();

    for (let i = 0; i < 150; i++) {
      const tenantIdx = randIndex(i * 13, TENANTS.length);
      const tenant = TENANTS[tenantIdx];
      if (tenantId && tenant.id !== tenantId) continue;

      const modelIdx = randIndex(i * 23, AI_MODELS.length);
      const typeIdx = randIndex(i * 37, TASK_TYPES.length);
      const gpuModel = GPU_MODELS[randIndex(i * 47, GPU_MODELS.length)];
      const dcIdx = randIndex(i * 59, DC_CONFIGS.length);
      const priorityIdx = randIndex(i * 71, PRIORITIES.length);
      const gpuCount = [1, 2, 4, 8][randIndex(i * 83, 4)];
      const estimatedMin = Math.floor(30 + smoothNoise(i * 91) * 480);
      const traceId = `trace-${(i * 31337).toString(16).padStart(12, "0")}`;

      let jobStatus: Job["status"];
      let progress = 0;
      let startedAt: string | null = null;
      let finishedAt: string | null = null;
      let submitOffset: number;

      if (i < 35) {
        jobStatus = "running";
        submitOffset = Math.floor(smoothNoise(i * 111) * 7200000) + 600000;
        startedAt = new Date(now - submitOffset + 300000).toISOString();
        const elapsed = (now - (now - submitOffset + 300000)) / 60000;
        // Live-updating progress based on real time
        progress = Math.min(95, Math.round((elapsed / estimatedMin) * 100 + Math.sin(now / 10000 + i) * 2));
      } else if (i < 55) {
        jobStatus = "queued";
        submitOffset = Math.floor(smoothNoise(i * 121) * 1800000);
      } else if (i < 130) {
        jobStatus = "completed";
        submitOffset = Math.floor(smoothNoise(i * 131) * 86400000);
        startedAt = new Date(now - submitOffset + 300000).toISOString();
        finishedAt = new Date(now - submitOffset + 300000 + estimatedMin * 60000).toISOString();
        progress = 100;
      } else {
        jobStatus = "failed";
        submitOffset = Math.floor(smoothNoise(i * 141) * 86400000);
        startedAt = new Date(now - submitOffset + 300000).toISOString();
        finishedAt = new Date(now - submitOffset + Math.floor(estimatedMin * 0.3) * 60000).toISOString();
        progress = Math.floor(smoothNoise(i * 151) * 60) + 10;
      }

      if (status && jobStatus !== status) continue;

      const gpuHoursUsed = jobStatus === "running"
        ? Math.round(((Date.now() - new Date(startedAt!).getTime()) / 3600000) * gpuCount * 100) / 100
        : jobStatus === "completed" || jobStatus === "failed"
          ? Math.round((estimatedMin / 60) * gpuCount * (jobStatus === "failed" ? 0.3 : 1) * 100) / 100
          : 0;
      const cost = Math.round(gpuHoursUsed * gpuModel.pricePerHour * 100) / 100;

      // Generate events for this job
      const events: JobEvent[] = [];
      events.push({ id: `${traceId}-e0`, jobId: `job-${i.toString().padStart(4, "0")}`, ts: new Date(now - submitOffset).toISOString(), level: "info", message: `Job submitted by ${tenant.name}. Requesting ${gpuCount}x ${gpuModel.model} in ${DC_CONFIGS[dcIdx].region}`, traceId });
      if (startedAt) {
        events.push({ id: `${traceId}-e1`, jobId: `job-${i.toString().padStart(4, "0")}`, ts: startedAt, level: "info", message: `Allocated ${gpuCount}x ${gpuModel.model} on ${DC_CONFIGS[dcIdx].name}. Starting container ${IMAGES[randIndex(i * 88, IMAGES.length)]}`, traceId });
        events.push({ id: `${traceId}-e2`, jobId: `job-${i.toString().padStart(4, "0")}`, ts: new Date(new Date(startedAt).getTime() + 15000).toISOString(), level: "debug", message: `Model weights loaded: ${AI_MODELS[modelIdx]} (${gpuModel.vram * gpuCount}GB VRAM allocated)`, traceId });
      }
      if (jobStatus === "completed" && finishedAt) {
        events.push({ id: `${traceId}-e3`, jobId: `job-${i.toString().padStart(4, "0")}`, ts: finishedAt, level: "info", message: `Job completed. GPU-hours: ${gpuHoursUsed.toFixed(2)}, Cost: $${cost.toFixed(2)}`, traceId });
      }
      if (jobStatus === "failed" && finishedAt) {
        events.push({ id: `${traceId}-e3`, jobId: `job-${i.toString().padStart(4, "0")}`, ts: finishedAt, level: "error", message: `Job failed: CUDA OOM at epoch ${Math.floor(smoothNoise(i * 99) * 50) + 1}. Peak memory: ${(gpuModel.vram * 0.98).toFixed(1)}GB/${gpuModel.vram}GB`, traceId });
      }

      jobs.push({
        id: `job-${i.toString().padStart(4, "0")}`,
        tenantId: tenant.id,
        tenantName: tenant.name,
        queueId: `q-${tenant.id}`,
        type: TASK_TYPES[typeIdx],
        status: jobStatus,
        requestedGpuModel: gpuModel.model,
        requestedGpus: gpuCount,
        requestedVramGb: gpuModel.vram * gpuCount,
        regionPref: DC_CONFIGS[dcIdx].region,
        image: IMAGES[randIndex(i * 88, IMAGES.length)],
        command: COMMANDS[randIndex(i * 77, COMMANDS.length)],
        modelName: AI_MODELS[modelIdx],
        priority: PRIORITIES[priorityIdx],
        createdAt: new Date(now - submitOffset).toISOString(),
        startedAt,
        finishedAt,
        estimatedMinutes: estimatedMin,
        progress,
        gpuHoursUsed,
        cost,
        traceId,
        events,
      });
    }

    return jobs.sort((a, b) => {
      const order = { running: 0, queued: 1, failed: 2, completed: 3, cancelled: 4 };
      return order[a.status] - order[b.status];
    });
  }

  // ─── Legacy Tasks compat ──────────────────────

  getTasks(): Task[] {
    return this.getJobs().map(j => ({
      id: j.id,
      tenantName: j.tenantName,
      type: j.type,
      taskMode: smoothNoise(parseInt(j.id.slice(-4)) * 101) > 0.7 ? "endpoint" as const : "batch" as const,
      modelName: j.modelName,
      status: j.status === "cancelled" ? "failed" as const : j.status as Task["status"],
      gpuCount: j.requestedGpus,
      gpuModel: j.requestedGpuModel,
      dcName: DC_CONFIGS[randIndex(parseInt(j.id.slice(-4)) * 59, DC_CONFIGS.length)].name,
      priority: j.priority,
      submitTime: j.createdAt,
      startTime: j.startedAt,
      endTime: j.finishedAt,
      estimatedMinutes: j.estimatedMinutes,
      progress: j.progress,
      gpuHoursUsed: j.gpuHoursUsed,
      cost: j.cost,
      traceId: j.traceId,
    }));
  }

  // ─── Endpoints ────────────────────────────────

  getEndpoints(): Endpoint[] {
    const endpoints: Endpoint[] = [
      { id: "ep-001", tenantId: "t-003", tenantName: "Barclays AI Division", name: "llama-70b-trading-signals", region: "UK-London", gpuModel: "H100 SXM", gpus: 16, modelName: "LLaMA-3.1-70B", image: "ghcr.io/corex/tgi:2.1", status: "running", url: "https://api.corex.cloud/v1/ep-001", minReplicas: 4, maxReplicas: 24, currentReplicas: 12, createdAt: new Date(Date.now() - 90 * 86400000).toISOString(), costPerHour: 55.84 },
      { id: "ep-002", tenantId: "t-001", tenantName: "NeuralForge AI", name: "codellama-34b-prod", region: "US-East", gpuModel: "H100 SXM", gpus: 8, modelName: "CodeLlama-34B", image: "ghcr.io/corex/tgi:2.1", status: "running", url: "https://api.corex.cloud/v1/ep-002", minReplicas: 2, maxReplicas: 16, currentReplicas: 8, createdAt: new Date(Date.now() - 60 * 86400000).toISOString(), costPerHour: 27.92 },
      { id: "ep-003", tenantId: "t-002", tenantName: "DeepVision Labs", name: "sdxl-generation-v2", region: "EU-West", gpuModel: "L40S", gpus: 8, modelName: "Stable Diffusion XL", image: "ghcr.io/corex/sdxl:2.0", status: "running", url: "https://api.corex.cloud/v1/ep-003", minReplicas: 2, maxReplicas: 16, currentReplicas: 6, createdAt: new Date(Date.now() - 45 * 86400000).toISOString(), costPerHour: 9.52 },
      { id: "ep-004", tenantId: "t-005", tenantName: "AstraZeneca R&D", name: "protein-folding-api", region: "UK-London", gpuModel: "H100 SXM", gpus: 16, modelName: "AlphaFold-Custom", image: "ghcr.io/corex/alphafold:3.1", status: "running", url: "https://api.corex.cloud/v1/ep-004", minReplicas: 4, maxReplicas: 32, currentReplicas: 16, createdAt: new Date(Date.now() - 120 * 86400000).toISOString(), costPerHour: 55.84 },
      { id: "ep-005", tenantId: "t-009", tenantName: "CloudBrain Tech", name: "mixtral-8x7b-chat", region: "APAC", gpuModel: "H100 SXM", gpus: 8, modelName: "Mixtral-8x7B", image: "ghcr.io/corex/tgi:2.1", status: "running", url: "https://api.corex.cloud/v1/ep-005", minReplicas: 2, maxReplicas: 12, currentReplicas: 6, createdAt: new Date(Date.now() - 75 * 86400000).toISOString(), costPerHour: 27.92 },
      { id: "ep-006", tenantId: "t-014", tenantName: "HSBC Quant Lab", name: "risk-model-inference", region: "UK-London", gpuModel: "H100 SXM", gpus: 8, modelName: "Custom-Risk-Model", image: "ghcr.io/corex/hsbc-risk:1.4", status: "running", url: "https://api.corex.cloud/v1/ep-006", minReplicas: 2, maxReplicas: 16, currentReplicas: 8, createdAt: new Date(Date.now() - 180 * 86400000).toISOString(), costPerHour: 27.92 },
      { id: "ep-007", tenantId: "t-012", tenantName: "BP Energy AI", name: "energy-forecast-api", region: "UK-London", gpuModel: "A100 SXM 80G", gpus: 4, modelName: "Energy-Transformer", image: "ghcr.io/corex/bp-forecast:2.0", status: "running", url: "https://api.corex.cloud/v1/ep-007", minReplicas: 1, maxReplicas: 8, currentReplicas: 4, createdAt: new Date(Date.now() - 30 * 86400000).toISOString(), costPerHour: 8.84 },
      { id: "ep-008", tenantId: "t-004", tenantName: "Rolls-Royce Digital", name: "defect-detection-v3", region: "UK-London", gpuModel: "A100 SXM 80G", gpus: 4, modelName: "DefectNet-V3", image: "ghcr.io/corex/rr-defect:3.0", status: "running", url: "https://api.corex.cloud/v1/ep-008", minReplicas: 1, maxReplicas: 8, currentReplicas: 3, createdAt: new Date(Date.now() - 200 * 86400000).toISOString(), costPerHour: 8.84 },
      { id: "ep-009", tenantId: "t-013", tenantName: "GSK Pharma AI", name: "drug-discovery-api", region: "UK-London", gpuModel: "H100 SXM", gpus: 16, modelName: "MolFormer-XL", image: "ghcr.io/corex/gsk-mol:2.1", status: "running", url: "https://api.corex.cloud/v1/ep-009", minReplicas: 4, maxReplicas: 24, currentReplicas: 12, createdAt: new Date(Date.now() - 150 * 86400000).toISOString(), costPerHour: 55.84 },
      { id: "ep-010", tenantId: "t-001", tenantName: "NeuralForge AI", name: "llama-70b-eu-failover", region: "EU-West", gpuModel: "H100 SXM", gpus: 8, modelName: "LLaMA-3.1-70B", image: "ghcr.io/corex/tgi:2.1", status: "running", url: "https://api.corex.cloud/v1/ep-010", minReplicas: 1, maxReplicas: 8, currentReplicas: 4, createdAt: new Date(Date.now() - 14 * 86400000).toISOString(), costPerHour: 27.92 },
      { id: "ep-011", tenantId: "t-008", tenantName: "SynthWave AI", name: "deepseek-v2-api", region: "US-West", gpuModel: "H100 SXM", gpus: 4, modelName: "DeepSeek-V2", image: "ghcr.io/corex/tgi:2.1", status: "deploying", url: "https://api.corex.cloud/v1/ep-011", minReplicas: 1, maxReplicas: 8, currentReplicas: 0, createdAt: new Date(Date.now() - 600000).toISOString(), costPerHour: 13.96 },
      { id: "ep-012", tenantId: "t-002", tenantName: "DeepVision Labs", name: "falcon-40b-staging", region: "US-East", gpuModel: "A100 SXM 80G", gpus: 4, modelName: "Falcon-40B", image: "ghcr.io/corex/tgi:2.1", status: "stopped", url: "https://api.corex.cloud/v1/ep-012", minReplicas: 0, maxReplicas: 4, currentReplicas: 0, createdAt: new Date(Date.now() - 90 * 86400000).toISOString(), costPerHour: 0 },
      { id: "ep-013", tenantId: "t-015", tenantName: "Unilever ML Ops", name: "demand-forecast-prod", region: "UK-London", gpuModel: "A100 PCIe 40G", gpus: 4, modelName: "TimeSeriesFormer", image: "ghcr.io/corex/tsf:1.2", status: "running", url: "https://api.corex.cloud/v1/ep-013", minReplicas: 1, maxReplicas: 6, currentReplicas: 3, createdAt: new Date(Date.now() - 40 * 86400000).toISOString(), costPerHour: 5.96 },
      { id: "ep-014", tenantId: "t-006", tenantName: "PixelMind Studio", name: "whisper-transcription", region: "US-East", gpuModel: "A100 PCIe 40G", gpus: 2, modelName: "Whisper-Large-V3", image: "ghcr.io/corex/whisper:3.0", status: "running", url: "https://api.corex.cloud/v1/ep-014", minReplicas: 1, maxReplicas: 4, currentReplicas: 2, createdAt: new Date(Date.now() - 7 * 86400000).toISOString(), costPerHour: 2.98 },
    ].map(ep => {
      const now = Date.now();
      const epSeed = parseInt(ep.id.slice(-3));
      const rpsBase = ep.status === "running" ? (ep.gpus * 18 + Math.sin(now / 12000 + epSeed) * 25 + Math.sin(now / 5000 + epSeed * 2) * 10) : 0;
      const latBase = ep.status === "running" ? (65 + Math.sin(now / 15000 + epSeed * 1.7) * 25 + Math.sin(now / 6000 + epSeed * 3) * 8) : 0;
      return {
        ...ep,
        rps: Math.round(Math.max(0, rpsBase) * 10) / 10,
        latencyP50: Math.round(Math.max(0, latBase) * 10) / 10,
        latencyP95: Math.round(Math.max(0, latBase * 2.1) * 10) / 10,
        errorRate: ep.status === "running" ? Math.round(smoothNoise(parseInt(ep.id.slice(-1)) * 77 + Math.floor(now / 120000)) * 2 * 100) / 100 : 0,
        tokensIn: ep.status === "running" ? Math.round(rpsBase * 350) : 0,
        tokensOut: ep.status === "running" ? Math.round(rpsBase * 120) : 0,
      };
    });

    return endpoints;
  }

  getEndpointMetrics(endpointId: string): EndpointMetric[] {
    const metrics: EndpointMetric[] = [];
    const now = Date.now();
    for (let i = 47; i >= 0; i--) {
      const t = new Date(now - i * 30 * 60000);
      const h = t.getHours() + t.getMinutes() / 60;
      const load = dailyPattern(h);
      const rps = Math.round(load * 120 + Math.sin(i * 0.5) * 15);
      metrics.push({
        endpointId,
        ts: t.toISOString(),
        rps: Math.max(0, rps),
        latencyP50: Math.round((60 + load * 40 + Math.sin(i * 0.7) * 10) * 10) / 10,
        latencyP95: Math.round((120 + load * 80 + Math.sin(i * 0.7) * 20) * 10) / 10,
        errorRate: Math.round(smoothNoise(i * 31) * 1.5 * 100) / 100,
        tokensIn: Math.round(rps * 350),
        tokensOut: Math.round(rps * 120),
      });
    }
    return metrics;
  }

  // ─── Allocations ──────────────────────────────

  getAllocations(): Allocation[] {
    const runningJobs = this.getJobs("running");
    return runningJobs.map((job, i) => ({
      id: `alloc-${i.toString().padStart(4, "0")}`,
      jobId: job.id,
      nodeId: this.gpuList[i % this.gpuList.length].node,
      gpuIds: Array.from({ length: job.requestedGpus }, (_, gi) => `gpu-${((i * 8 + gi) % this.totalGpuCount).toString().padStart(4, "0")}`),
      status: "active" as const,
      allocatedAt: job.startedAt!,
      releasedAt: null,
    }));
  }

  // ─── Policies ─────────────────────────────────

  getPolicies(): SchedulerPolicy[] {
    return [
      { id: "pol-001", tenantId: "t-003", tenantName: "Barclays AI Division", name: "Financial Data Locality", type: "affinity", rules: { preferRegion: "UK-London", enforceDataResidency: true, fallback: "EU-West" }, enabled: true },
      { id: "pol-002", tenantId: "t-001", tenantName: "NeuralForge AI", name: "Enterprise Priority Boost", type: "priority", rules: { boost: 20, minGpu: 8 }, enabled: true },
      { id: "pol-003", tenantId: "t-002", tenantName: "DeepVision Labs", name: "GPU Quota Enforcement", type: "quota", rules: { maxGpu: 192, softLimit: 160 }, enabled: true },
      { id: "pol-004", tenantId: "t-005", tenantName: "AstraZeneca R&D", name: "H100 Affinity + UK Priority", type: "affinity", rules: { preferGpuModel: "H100 SXM", preferRegion: "UK-London" }, enabled: true },
      { id: "pol-005", tenantId: "t-014", tenantName: "HSBC Quant Lab", name: "Low-Latency Preemption", type: "preemption", rules: { canPreempt: true, preemptibleBy: ["enterprise"], maxLatencyMs: 50 }, enabled: true },
      { id: "pol-006", tenantId: "t-011", tenantName: "DataForge Inc", name: "Starter Preemption Guard", type: "preemption", rules: { canPreempt: false, preemptibleBy: ["enterprise", "pro"] }, enabled: true },
      { id: "pol-007", tenantId: "t-009", tenantName: "CloudBrain Tech", name: "APAC Region Affinity", type: "affinity", rules: { preferRegion: "APAC", fallback: "APAC-SG" }, enabled: true },
      { id: "pol-008", tenantId: "t-012", tenantName: "BP Energy AI", name: "UK Data Sovereignty", type: "affinity", rules: { preferRegion: "UK-London", enforceDataResidency: true }, enabled: true },
      { id: "pol-009", tenantId: "t-004", tenantName: "Rolls-Royce Digital", name: "Manufacturing GPU Priority", type: "priority", rules: { boost: 15, minGpu: 4, preferGpuModel: "A100 SXM 80G" }, enabled: true },
      { id: "pol-010", tenantId: "t-013", tenantName: "GSK Pharma AI", name: "Research Quota Scale", type: "quota", rules: { maxGpu: 208, softLimit: 180, autoRequestIncrease: true }, enabled: true },
    ];
  }

  // ─── Alerts ───────────────────────────────────

  getAlerts(): Alert[] {
    const alerts: Alert[] = [];
    const now = Date.now();
    const alertTemplates = [
      { severity: "critical" as const, title: "GPU ECC Error Detected", source: "DCGM Monitor", sourceType: "gpu", impact: "Affected GPU taken offline. Running job migrated to healthy GPU." },
      { severity: "critical" as const, title: "Node Unreachable", source: "Health Checker", sourceType: "node", impact: "Node removed from scheduler pool. 8 GPUs unavailable." },
      { severity: "critical" as const, title: "Storage Capacity Critical", source: "Storage Monitor", sourceType: "storage", impact: "New job submissions paused for affected cluster." },
      { severity: "warning" as const, title: "GPU Temperature High", source: "Thermal Monitor", sourceType: "gpu", impact: "GPU throttling imminent. Fan speed increased." },
      { severity: "warning" as const, title: "Memory Utilization > 90%", source: "Resource Monitor", sourceType: "node", impact: "OOM risk for new allocations on this node." },
      { severity: "warning" as const, title: "Network Latency Spike", source: "Network Monitor", sourceType: "network", impact: "Endpoint latency P95 increased by 40%." },
      { severity: "warning" as const, title: "Task Queue Backlog Growing", source: "Scheduler", sourceType: "scheduler", impact: "Average wait time increased to 47 minutes." },
      { severity: "warning" as const, title: "Power Usage Approaching Limit", source: "Power Monitor", sourceType: "power", impact: "May need to reduce load or expand capacity." },
      { severity: "info" as const, title: "Scheduled Maintenance Window", source: "Ops Manager", sourceType: "maintenance", impact: "Cluster will be unavailable during maintenance." },
      { severity: "info" as const, title: "New GPU Driver Available", source: "Update Manager", sourceType: "software", impact: "Performance improvements available for H100." },
      { severity: "info" as const, title: "Cluster Scaling Completed", source: "Auto Scaler", sourceType: "cluster", impact: "Capacity increased. Queue depth should decrease." },
      { severity: "info" as const, title: "Backup Completed Successfully", source: "Backup Service", sourceType: "backup", impact: "All configurations archived." },
      { severity: "warning" as const, title: "SLA Threshold Warning", source: "SLA Monitor", sourceType: "sla", impact: "Current uptime: 99.92%. SLA target: 99.9%." },
      { severity: "critical" as const, title: "Cooling System Alert", source: "HVAC Controller", sourceType: "facility", impact: "Reduced cooling capacity may trigger GPU throttling." },
      { severity: "warning" as const, title: "Endpoint Error Rate Elevated", source: "Endpoint Monitor", sourceType: "endpoint", impact: "Error rate at 3.2% (threshold: 2%)." },
    ];

    const messages: Record<string, string[]> = {
      "GPU ECC Error Detected": ["Uncorrectable ECC error on GPU gpu-0142 in node dc-us-east-node-2-3. Recommend replacement.", "Multiple ECC errors detected on GPU gpu-0287. Error count: 12 in last hour."],
      "Node Unreachable": ["Node dc-uk-london-node-3-1 failed health check. Last heartbeat 180s ago.", "IPMI connection lost to dc-apac-node-0-1. Attempting BMC reset.", "Node dc-us-east-node-2-4 unresponsive. Failover initiated."],
      "Storage Capacity Critical": ["NVMe storage on cluster dc-uk-london-cluster-3 at 94% capacity.", "DC US-East cluster-2 storage at 91%."],
      "GPU Temperature High": ["GPU gpu-0089 in UK-London reporting 87\u00B0C. Throttling may occur above 90\u00B0C.", "Multiple GPUs in dc-us-west-cluster-1 exceeding 82\u00B0C threshold."],
      "Memory Utilization > 90%": ["Node dc-uk-london-node-1-2 VRAM usage at 93%. OOM risk for Barclays workloads.", "Node dc-us-east-node-0-4 VRAM at 91%."],
      "Network Latency Spike": ["Inter-DC latency UK-London to EU-Frankfurt increased to 145ms (baseline: 35ms).", "APAC-Tokyo to APAC-Singapore link at 92ms (baseline: 45ms)."],
      "Task Queue Backlog Growing": ["H100 queue depth reached 42 tasks in UK-London. Average wait: 67 minutes.", "US-East A100 queue at 28 tasks. Wait: 35 minutes."],
      "Power Usage Approaching Limit": ["DC UK-London power at 89% of contracted capacity (4.8MW/5.4MW).", "DC US-East at 82% (3.2MW/3.9MW)."],
      "Scheduled Maintenance Window": ["DC UK-London cluster-4 maintenance scheduled 2026-03-01 02:00 UTC.", "DC EU-Frankfurt cluster-1 firmware update 2026-03-03."],
      "New GPU Driver Available": ["NVIDIA driver 550.127.05 available. H100 performance improvements across all DCs."],
      "Cluster Scaling Completed": ["DC UK-London cluster-5 expanded by 16 H100 GPUs. Total HQ capacity: 352 GPUs.", "DC APAC-SG expanded by 8 L40S GPUs."],
      "Backup Completed Successfully": ["Daily config backup completed. 2,847 configs archived across 6 data centres."],
      "SLA Threshold Warning": ["Tenant Barclays AI Division approaching 99.99% SLA boundary.", "Tenant HSBC Quant Lab at 99.93% (target: 99.9%)."],
      "Cooling System Alert": ["Chiller unit #5 in DC UK-London showing reduced cooling capacity.", "DC US-East chiller #3 efficiency down 12%."],
      "Endpoint Error Rate Elevated": ["Endpoint ep-001 (Barclays trading-signals) error rate at 1.8% (threshold: 1%).", "Endpoint ep-009 (GSK drug-discovery) error rate at 2.1%."],
    };

    for (let i = 0; i < alertTemplates.length; i++) {
      const tmpl = alertTemplates[i];
      const dcIdx = randIndex(i * 19, DC_CONFIGS.length);
      const msgList = messages[tmpl.title] || [`${tmpl.title} detected.`];
      const msg = msgList[randIndex(i * 29, msgList.length)];
      const age = Math.floor(smoothNoise(i * 39) * 86400000);
      const isResolved = smoothNoise(i * 49) > 0.5 && tmpl.severity !== "critical";

      alerts.push({
        id: `alert-${i.toString().padStart(3, "0")}`,
        severity: tmpl.severity,
        sourceType: tmpl.sourceType,
        sourceId: `gpu-${Math.floor(smoothNoise(i * 61) * 464).toString().padStart(4, "0")}`,
        title: tmpl.title,
        message: msg,
        source: tmpl.source,
        dcName: DC_CONFIGS[dcIdx].name,
        status: isResolved ? "resolved" : tmpl.severity === "critical" ? "firing" : "acknowledged",
        timestamp: new Date(now - age).toISOString(),
        resolvedAt: isResolved ? new Date(now - age + Math.floor(smoothNoise(i * 71) * 3600000)).toISOString() : undefined,
        acknowledged: isResolved || smoothNoise(i * 81) > 0.4,
        impactScope: tmpl.impact,
        relatedIncidentId: tmpl.severity === "critical" ? `inc-${(i % 3).toString().padStart(3, "0")}` : undefined,
      });
    }

    return alerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  // ─── Incidents ────────────────────────────────

  getIncidents(): Incident[] {
    const now = Date.now();
    return [
      {
        id: "inc-000",
        title: "UK-London HQ: H100 Node Failure - Cluster 2",
        severity: "critical",
        status: "investigating",
        startedAt: new Date(now - 3600000).toISOString(),
        resolvedAt: null,
        summary: "ECC errors on 8 H100 GPUs in UK-London HQ cluster-2 triggered node drain. 5 running Barclays AI jobs migrated. Hardware team dispatched to Docklands facility.",
        affectedServices: ["GPU Compute - UK-London", "Barclays AI Division", "HSBC Quant Lab", "Job Scheduler"],
        commander: "James Wright (UK SRE Lead)",
        updates: [
          { id: "iu-001", incidentId: "inc-000", ts: new Date(now - 3600000).toISOString(), message: "Multiple ECC uncorrectable errors detected on 8x H100 GPUs in dc-uk-london-cluster-2. Node marked unhealthy. Severity: CRITICAL.", author: "DCGM Auto-detector" },
          { id: "iu-002", incidentId: "inc-000", ts: new Date(now - 3300000).toISOString(), message: "Node drain initiated. 5 running jobs (3 Barclays, 2 HSBC) queued for migration to cluster-0 and cluster-1.", author: "Scheduler" },
          { id: "iu-003", incidentId: "inc-000", ts: new Date(now - 3000000).toISOString(), message: "4 of 5 jobs migrated successfully. 1 HSBC risk-model job requires manual checkpoint recovery.", author: "James Wright" },
          { id: "iu-004", incidentId: "inc-000", ts: new Date(now - 1800000).toISOString(), message: "Hardware team onsite at Docklands. PCIe riser card identified as root cause. Replacement ETA: 2 hours.", author: "James Wright" },
          { id: "iu-005", incidentId: "inc-000", ts: new Date(now - 600000).toISOString(), message: "HSBC risk-model job recovered from checkpoint. All customer workloads running. Capacity reduced by 8 GPUs until hardware fix.", author: "James Wright" },
        ],
      },
      {
        id: "inc-001",
        title: "US-East GPU Node Failure - dc-us-east-node-3-2",
        severity: "critical",
        status: "monitoring",
        startedAt: new Date(now - 14400000).toISOString(),
        resolvedAt: null,
        summary: "ECC errors on 4 H100 GPUs in US-East caused node drain. 3 running NeuralForge jobs migrated. Hardware replacement in progress.",
        affectedServices: ["GPU Compute - US-East", "Job Scheduler"],
        commander: "Sarah Chen (US SRE Lead)",
        updates: [
          { id: "iu-006", incidentId: "inc-001", ts: new Date(now - 14400000).toISOString(), message: "Multiple ECC uncorrectable errors detected on GPU gpu-0342, gpu-0343, gpu-0344, gpu-0345. Node marked unhealthy.", author: "DCGM Auto-detector" },
          { id: "iu-007", incidentId: "inc-001", ts: new Date(now - 14100000).toISOString(), message: "Node drain initiated. 3 running jobs queued for migration.", author: "Scheduler" },
          { id: "iu-008", incidentId: "inc-001", ts: new Date(now - 13800000).toISOString(), message: "All 3 jobs successfully migrated to dc-us-east-node-1-4. No data loss.", author: "Sarah Chen" },
          { id: "iu-009", incidentId: "inc-001", ts: new Date(now - 7200000).toISOString(), message: "Hardware team onsite. Replacement node ETA: 3 hours. Impact contained.", author: "Sarah Chen" },
        ],
      },
      {
        id: "inc-002",
        title: "EU-Frankfurt Network Congestion",
        severity: "major",
        status: "resolved",
        startedAt: new Date(now - 86400000).toISOString(),
        resolvedAt: new Date(now - 82800000).toISOString(),
        summary: "Network congestion at Frankfurt IX peering point caused elevated latency for EU-West endpoints. Traffic rerouted via London HQ interconnect.",
        affectedServices: ["Endpoints - EU-West", "Inter-DC Replication", "UK-London ↔ EU-West Link"],
        commander: "Marcus Weber (NetOps)",
        updates: [
          { id: "iu-010", incidentId: "inc-002", ts: new Date(now - 86400000).toISOString(), message: "Latency spike detected: EU-West endpoints P95 latency increased from 120ms to 450ms.", author: "Network Monitor" },
          { id: "iu-011", incidentId: "inc-002", ts: new Date(now - 85800000).toISOString(), message: "Root cause: Frankfurt IX peering congestion from major ISP maintenance. Rerouting via UK-London HQ.", author: "Marcus Weber" },
          { id: "iu-012", incidentId: "inc-002", ts: new Date(now - 84600000).toISOString(), message: "Traffic rerouted through London HQ interconnect. Latency recovering to 95ms.", author: "Marcus Weber" },
          { id: "iu-013", incidentId: "inc-002", ts: new Date(now - 82800000).toISOString(), message: "Frankfurt IX maintenance completed. All metrics nominal. Incident resolved.", author: "Marcus Weber" },
        ],
      },
      {
        id: "inc-003",
        title: "UK-London Cooling System Alert - Zone A",
        severity: "minor",
        status: "resolved",
        startedAt: new Date(now - 172800000).toISOString(),
        resolvedAt: new Date(now - 158400000).toISOString(),
        summary: "Chiller unit #5 in UK-London Docklands facility experienced reduced capacity during summer heatwave. Proactive GPU throttling applied. No customer impact.",
        affectedServices: ["GPU Compute - UK-London (Zone A)"],
        commander: "Oliver Thompson (UK Facilities)",
        updates: [
          { id: "iu-014", incidentId: "inc-003", ts: new Date(now - 172800000).toISOString(), message: "Chiller #5 output down 35%. Zone A ambient temp rising to 28°C. External temp 34°C.", author: "HVAC Controller" },
          { id: "iu-015", incidentId: "inc-003", ts: new Date(now - 172200000).toISOString(), message: "Proactive GPU power limit applied to Zone A (700W -> 500W). AstraZeneca and GSK workloads unaffected.", author: "Oliver Thompson" },
          { id: "iu-016", incidentId: "inc-003", ts: new Date(now - 164400000).toISOString(), message: "Backup chiller unit activated. Temperature stabilised at 24°C.", author: "Oliver Thompson" },
          { id: "iu-017", incidentId: "inc-003", ts: new Date(now - 158400000).toISOString(), message: "Primary chiller repaired. Power limits removed. All systems nominal.", author: "Oliver Thompson" },
        ],
      },
      {
        id: "inc-004",
        title: "APAC-Tokyo Storage Capacity Warning",
        severity: "minor",
        status: "resolved",
        startedAt: new Date(now - 259200000).toISOString(),
        resolvedAt: new Date(now - 248400000).toISOString(),
        summary: "NVMe storage in APAC-Tokyo reached 92% capacity. Emergency cleanup and capacity expansion executed.",
        affectedServices: ["Storage - APAC", "CloudBrain Tech Jobs"],
        commander: "Yuki Tanaka (APAC Ops)",
        updates: [
          { id: "iu-018", incidentId: "inc-004", ts: new Date(now - 259200000).toISOString(), message: "Storage utilisation at 92%. Alert threshold: 90%. New job submissions may be affected.", author: "Storage Monitor" },
          { id: "iu-019", incidentId: "inc-004", ts: new Date(now - 255600000).toISOString(), message: "Initiated cleanup of expired checkpoints (47TB recovered). Ordering additional NVMe arrays.", author: "Yuki Tanaka" },
          { id: "iu-020", incidentId: "inc-004", ts: new Date(now - 248400000).toISOString(), message: "Storage at 71% after cleanup. New NVMe arrays arriving next week. Incident resolved.", author: "Yuki Tanaka" },
        ],
      },
    ];
  }

  // ─── Billing ──────────────────────────────────

  getBillingData(): BillingData {
    const records: BillingRecord[] = [];
    const invoices: Invoice[] = [];
    const usageRecords: UsageRecord[] = [];
    const now = new Date();

    // Generate billing records per tenant per month
    for (let t = 0; t < TENANTS.length; t++) {
      const tenant = TENANTS[t];
      for (let m = 0; m < 3; m++) {
        const month = new Date(now.getFullYear(), now.getMonth() - m, 1);
        const monthStr = month.toISOString().slice(0, 7);
        const baseHours = tenant.tier === "enterprise" ? 24000 : tenant.tier === "pro" ? 6000 : 1500;
        const gpuHours = Math.round(baseHours * (1 + smoothNoise(t * 11 + m * 7) * 0.4 - 0.2));
        const avgPrice = 2.1 + smoothNoise(t * 13 + m * 3) * 0.8;
        const amount = Math.round(gpuHours * avgPrice * 100) / 100;

        let status: BillingRecord["status"] = "paid";
        if (m === 0) status = smoothNoise(t * 17) > 0.7 ? "pending" : "paid";
        if (m === 0 && smoothNoise(t * 23) > 0.9) status = "overdue";

        records.push({
          id: `inv-${t}-${m}`,
          tenantName: tenant.name,
          tier: tenant.tier,
          period: monthStr,
          gpuHours,
          amount,
          status,
          invoiceDate: new Date(month.getFullYear(), month.getMonth() + 1, 1).toISOString().slice(0, 10),
          dueDate: new Date(month.getFullYear(), month.getMonth() + 1, 15).toISOString().slice(0, 10),
        });

        // Generate invoices
        const invoiceItems: InvoiceItem[] = [
          { id: `ii-${t}-${m}-1`, invoiceId: `invoice-${t}-${m}`, description: `GPU Compute - Batch Jobs (${gpuModel(t)})`, quantity: Math.round(gpuHours * 0.7), unitPrice: avgPrice, amount: Math.round(gpuHours * 0.7 * avgPrice * 100) / 100, meta: { source: "jobs" } },
          { id: `ii-${t}-${m}-2`, invoiceId: `invoice-${t}-${m}`, description: `GPU Compute - Endpoints (${gpuModel(t)})`, quantity: Math.round(gpuHours * 0.3), unitPrice: avgPrice * 1.1, amount: Math.round(gpuHours * 0.3 * avgPrice * 1.1 * 100) / 100, meta: { source: "endpoints" } },
        ];

        invoices.push({
          id: `invoice-${t}-${m}`,
          tenantId: tenant.id,
          tenantName: tenant.name,
          periodStart: month.toISOString(),
          periodEnd: new Date(month.getFullYear(), month.getMonth() + 1, 0).toISOString(),
          amount,
          currency: "USD",
          status: m === 0 ? (status === "paid" ? "paid" : status === "overdue" ? "overdue" : "sent") : "paid",
          items: invoiceItems,
          createdAt: new Date(month.getFullYear(), month.getMonth() + 1, 1).toISOString(),
        });

        // Generate usage records
        usageRecords.push({
          id: `usage-${t}-${m}-batch`,
          tenantId: tenant.id,
          tenantName: tenant.name,
          sourceType: "job",
          sourceId: `batch-aggregate-${monthStr}`,
          tsStart: month.toISOString(),
          tsEnd: new Date(month.getFullYear(), month.getMonth() + 1, 0).toISOString(),
          gpuSeconds: Math.round(gpuHours * 0.7 * 3600),
          requests: 0,
          tokensIn: 0,
          tokensOut: 0,
          region: DC_CONFIGS[t % DC_CONFIGS.length].region,
          gpuModel: gpuModel(t),
        });
      }
    }

    const currentMonthRecords = records.filter(r => r.period === now.toISOString().slice(0, 7));
    const totalRevenue = records.reduce((s, r) => s + r.amount, 0);
    const monthlyRevenue = currentMonthRecords.reduce((s, r) => s + r.amount, 0);
    const outstanding = records.filter(r => r.status !== "paid").reduce((s, r) => s + r.amount, 0);
    const mrr = TENANTS.reduce((s, t) => s + t.mrr, 0);

    const revenueByTier = [
      { tier: "Enterprise", revenue: records.filter(r => r.tier === "enterprise").reduce((s, r) => s + r.amount, 0) },
      { tier: "Pro", revenue: records.filter(r => r.tier === "pro").reduce((s, r) => s + r.amount, 0) },
      { tier: "Starter", revenue: records.filter(r => r.tier === "starter").reduce((s, r) => s + r.amount, 0) },
    ];

    const revenueBySource = [
      { source: "Batch Jobs", revenue: Math.round(totalRevenue * 0.62) },
      { source: "Inference Endpoints", revenue: Math.round(totalRevenue * 0.33) },
      { source: "Reserved Instances", revenue: Math.round(totalRevenue * 0.05) },
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
      const base = 1800000 + (12 - i) * 85000;
      const noise = Math.sin(i * 1.5) * 120000;
      monthlyTrend.push({ time: d.toISOString(), value: Math.round(base + noise) });
    }

    return {
      totalRevenue: Math.round(totalRevenue),
      monthlyRevenue: Math.round(monthlyRevenue),
      outstandingAmount: Math.round(outstanding),
      mrr,
      records,
      invoices,
      revenueByTier,
      revenueBySource,
      costBreakdown,
      monthlyTrend,
      usageRecords,
    };
  }

  // ─── Activity Feed ────────────────────────────

  private generateActivityFeed(): ActivityEvent[] {
    const now = Date.now();
    const events: ActivityEvent[] = [];
    const templates: { type: ActivityEvent["type"]; severity: ActivityEvent["severity"]; icon: string; titles: string[] }[] = [
      { type: "job_started", severity: "info", icon: "Play", titles: ["Job {job} started on {dc}", "Training job for {model} allocated {n}x {gpu}"] },
      { type: "job_completed", severity: "success", icon: "CheckCircle", titles: ["Job {job} completed successfully", "{model} training finished - {n} GPU-hours used"] },
      { type: "job_failed", severity: "critical", icon: "XCircle", titles: ["Job {job} failed: CUDA OOM", "Task failed on {dc}: memory exceeded"] },
      { type: "alert_fired", severity: "warning", icon: "AlertTriangle", titles: ["High temperature alert on {dc}", "ECC error detected on gpu-{gpuId}"] },
      { type: "alert_resolved", severity: "success", icon: "CheckCircle2", titles: ["Temperature alert resolved on {dc}", "Network latency normalized for {dc}"] },
      { type: "scale_up", severity: "info", icon: "ArrowUpCircle", titles: ["Endpoint {ep} scaled up to {n} replicas", "Auto-scale triggered for {ep}"] },
      { type: "endpoint_deployed", severity: "success", icon: "Rocket", titles: ["Endpoint {ep} deployed in {dc}", "New inference service {ep} online"] },
      { type: "invoice_generated", severity: "info", icon: "FileText", titles: ["Invoice generated for {tenant}: ${amount}", "Monthly billing processed for {tenant}"] },
      { type: "incident_opened", severity: "critical", icon: "AlertOctagon", titles: ["Incident opened: {dc} node failure", "Critical: cooling system alert in {dc}"] },
    ];

    for (let i = 0; i < 40; i++) {
      const age = Math.floor(smoothNoise(i * 37 + Math.floor(now / 15000)) * 3600000);
      const tmpl = templates[randIndex(i * 41 + Math.floor(now / 60000), templates.length)];
      const title = tmpl.titles[randIndex(i * 43, tmpl.titles.length)]
        .replace("{job}", `job-${Math.floor(smoothNoise(i * 51) * 60).toString().padStart(4, "0")}`)
        .replace("{dc}", DC_CONFIGS[randIndex(i * 53, DC_CONFIGS.length)].name)
        .replace("{model}", AI_MODELS[randIndex(i * 57, AI_MODELS.length)])
        .replace("{gpu}", GPU_MODELS[randIndex(i * 59, GPU_MODELS.length)].model)
        .replace("{n}", String(Math.floor(smoothNoise(i * 61) * 12) + 2))
        .replace("{gpuId}", Math.floor(smoothNoise(i * 63) * 464).toString().padStart(4, "0"))
        .replace("{ep}", `ep-${String(Math.floor(smoothNoise(i * 67) * 8) + 1).padStart(3, "0")}`)
        .replace("{tenant}", TENANTS[randIndex(i * 71, TENANTS.length)].name)
        .replace("{amount}", Math.floor(smoothNoise(i * 73) * 50000 + 5000).toLocaleString());

      events.push({
        id: `act-${i.toString().padStart(4, "0")}`,
        ts: new Date(now - age).toISOString(),
        type: tmpl.type,
        title,
        description: "",
        severity: tmpl.severity,
        icon: tmpl.icon,
      });
    }

    return events.sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());
  }

  // ─── Logs ─────────────────────────────────────

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
      ]},
      { level: "WARN", source: "thermal-monitor", messages: [
        "GPU gpu-{gpu} temperature {temp}\u00B0C approaching threshold",
        "Fan speed increased to {fan}% on node {node}",
      ]},
      { level: "WARN", source: "resource-monitor", messages: [
        "VRAM pressure on gpu-{gpu}: {util}% utilized",
        "Network bandwidth spike on {dc}: {bw}Gbps sustained",
      ]},
      { level: "ERROR", source: "health-checker", messages: [
        "GPU gpu-{gpu} ECC uncorrectable error detected",
        "Node {node} heartbeat missed (timeout: 30s)",
      ]},
      { level: "DEBUG", source: "orchestrator", messages: [
        "Evaluating placement for {n}x {model} request",
        "Cache hit for tenant {tenant} model weights: {model}",
        "Checkpoint saved for task task-{id} at epoch {n}",
      ]},
      { level: "INFO", source: "endpoint-mgr", messages: [
        "Endpoint {ep} health check passed: latency {ms}ms",
        "Autoscaler evaluated {ep}: current load {util}%, no action",
        "Endpoint {ep} scaled from {n} to {fan} replicas",
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

      msg = msg
        .replace("{id}", String(Math.floor(smoothNoise(i * 91) * 60)).padStart(4, "0"))
        .replace("{gpu}", String(gpuIdx).padStart(4, "0"))
        .replace("{dc}", DC_CONFIGS[dcIdx].name)
        .replace("{tenant}", TENANTS[randIndex(i * 71, TENANTS.length)].name)
        .replace("{model}", AI_MODELS[randIndex(i * 81, AI_MODELS.length)])
        .replace("{n}", String(Math.floor(smoothNoise(i * 101) * 200) + 1))
        .replace("{ms}", String(Math.floor(smoothNoise(i * 111) * 150) + 1))
        .replace("{util}", String(Math.floor(smoothNoise(i * 121) * 60) + 40))
        .replace("{temp}", String(Math.floor(smoothNoise(i * 131) * 20) + 70))
        .replace("{fan}", String(Math.floor(smoothNoise(i * 141) * 40) + 50))
        .replace("{mem}", String(Math.floor(smoothNoise(i * 151) * 60) + 20))
        .replace("{total}", "80")
        .replace("{bw}", String(Math.floor(smoothNoise(i * 161) * 300) + 100))
        .replace("{ep}", `ep-${String(Math.floor(smoothNoise(i * 171) * 8) + 1).padStart(3, "0")}`)
        .replace("{node}", `dc-${["us-east", "us-west", "eu-west", "apac"][dcIdx]}-node-${Math.floor(smoothNoise(i * 181) * 4)}-${Math.floor(smoothNoise(i * 191) * 6)}`);

      logs.push({ timestamp: new Date(now - age).toISOString(), level: tmpl.level, source: tmpl.source, message: msg });
    }

    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  // ─── Monitoring Data ──────────────────────────

  getMonitoringData(): MonitoringData {
    const gpus = this.getGpus();
    const sample = gpus.slice(0, 100);
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

    const now = Date.now();
    const historyGen = (fn: (h: number, i: number) => number) => {
      const pts: MetricPoint[] = [];
      for (let i = 47; i >= 0; i--) {
        const t = new Date(now - i * 30 * 60000);
        const h = t.getHours() + t.getMinutes() / 60;
        pts.push({ time: t.toISOString(), value: Math.round(fn(h, i) * 10) / 10 });
      }
      return pts;
    };

    return {
      gpus: sample,
      avgUtilization: Math.round(avgUtil * 10) / 10,
      avgTemperature: Math.round(avgTemp * 10) / 10,
      avgPowerDraw: Math.round(avgPower),
      totalPowerKw: Math.round(totalPower * 10) / 10,
      totalMemoryUsedGb: Math.round(totalMemUsed * 10) / 10,
      totalMemoryTotalGb: Math.round(totalMemTotal),
      gpusByStatus: Object.entries(statusCounts).map(([status, count]) => ({ status, count })),
      gpusByDc: Object.entries(dcStatusMap).map(([dc, counts]) => ({ dc, ...counts })),
      temperatureHistory: historyGen((h) => 32 + dailyPattern(h) * 100 * 0.45),
      powerHistory: historyGen((h) => totalPower * (dailyPattern(h) / Math.max(0.01, avgUtil / 100))),
      memoryHistory: historyGen((h) => dailyPattern(h) * 75),
      utilizationHistory: historyGen((h, i) => dailyPattern(h) * 100 + Math.sin(i * 0.7) * 5),
      logs: this.generateLogs(),
    };
  }

  // ─── Dashboard ────────────────────────────────

  getDashboardData(): DashboardData {
    const dcs = this.getDataCenters();
    const jobs = this.getJobs();
    const alerts = this.getAlerts();
    const billing = this.getBillingData();
    const endpoints = this.getEndpoints();

    const totalGpus = dcs.reduce((s, d) => s + d.totalGpus, 0);
    const availableGpus = dcs.reduce((s, d) => s + d.availableGpus, 0);
    const avgUtil = dcs.reduce((s, d) => s + d.utilization * d.totalGpus, 0) / totalGpus;
    const totalPower = dcs.reduce((s, d) => s + d.powerUsageKw, 0);

    const activeTasks = jobs.filter(t => t.status === "running").length;
    const queuedTasks = jobs.filter(t => t.status === "queued").length;
    const completedTasks24h = jobs.filter(t => t.status === "completed").length;
    const failedTasks24h = jobs.filter(t => t.status === "failed").length;
    const activeEndpoints = endpoints.filter(e => e.status === "running").length;
    const avgEndpointLatency = endpoints.filter(e => e.status === "running").reduce((s, e) => s + e.latencyP50, 0) / Math.max(1, activeEndpoints);
    const totalRps = endpoints.filter(e => e.status === "running").reduce((s, e) => s + e.rps, 0);

    const revenue24h = Math.round(jobs.filter(t => t.status === "running" || t.status === "completed").reduce((s, t) => s + t.cost, 0));
    const revenueTrend = 12.4 + Math.sin(Date.now() / 3600000) * 3;
    const mrr = TENANTS.reduce((s, t) => s + t.mrr, 0);

    const queuedJobsList = jobs.filter(j => j.status === "queued");
    const avgQueueWaitMin = queuedJobsList.length > 0
      ? Math.round(queuedJobsList.reduce((s, j) => s + (Date.now() - new Date(j.createdAt).getTime()) / 60000, 0) / queuedJobsList.length)
      : 0;

    const critAlerts = alerts.filter(a => a.severity === "critical" && a.status === "firing").length;
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
      const base = isWeekday ? 340000 : 245000;
      const noise = Math.sin(i * 1.3) * 35000;
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
      lat: dc.lat || 0,
      lng: dc.lng || 0,
    }));

    const typeCounts: Record<string, number> = {};
    jobs.filter(t => t.status === "running" || t.status === "queued").forEach(t => {
      typeCounts[t.type] = (typeCounts[t.type] || 0) + 1;
    });

    const topTenants = TENANTS.map(t => {
      const tenantJobs = jobs.filter(j => j.tenantName === t.name);
      return {
        name: t.name,
        gpuHours: Math.round(tenantJobs.reduce((s, j) => s + j.gpuHoursUsed, 0) * 10) / 10,
        revenue: Math.round(tenantJobs.reduce((s, j) => s + j.cost, 0) * 100) / 100,
        tier: t.tier,
      };
    }).sort((a, b) => b.revenue - a.revenue).slice(0, 6);

    return {
      totalGpus,
      availableGpus,
      utilization: Math.round(avgUtil * 10) / 10,
      activeTasks,
      queuedTasks,
      completedTasks24h,
      failedTasks24h,
      revenue24h,
      revenueTrend: Math.round(revenueTrend * 10) / 10,
      mrr,
      healthScore: Math.round(healthScore * 10) / 10,
      totalPowerKw: Math.round(totalPower * 10) / 10,
      activeEndpoints,
      avgEndpointLatency: Math.round(avgEndpointLatency * 10) / 10,
      totalRps: Math.round(totalRps * 10) / 10,
      avgQueueWaitMin,
      utilizationHistory,
      revenueHistory,
      powerHistory,
      gpuModelDistribution: Object.entries(gpuModelCounts).map(([name, value]) => ({ name, value })),
      regionStats,
      recentAlerts: alerts.slice(0, 5),
      topTenants,
      taskTypeDistribution: Object.entries(typeCounts).map(([name, value]) => ({ name, value })),
      activityFeed: this.generateActivityFeed(),
    };
  }

  // ─── Search ───────────────────────────────────

  search(query: string): SearchResult[] {
    const q = query.toLowerCase();
    const results: SearchResult[] = [];

    // Search tenants
    TENANTS.filter(t => t.name.toLowerCase().includes(q)).forEach(t => {
      results.push({ type: "tenant", id: t.id, title: t.name, subtitle: `${t.tier} tier`, url: `/tenants`, icon: "Building2" });
    });

    // Search jobs
    this.getJobs().filter(j => j.id.includes(q) || j.modelName.toLowerCase().includes(q) || j.tenantName.toLowerCase().includes(q)).slice(0, 5).forEach(j => {
      results.push({ type: "job", id: j.id, title: `${j.id} - ${j.modelName}`, subtitle: `${j.tenantName} \u00B7 ${j.status}`, url: `/jobs`, icon: "Cpu" });
    });

    // Search endpoints
    this.getEndpoints().filter(e => e.name.toLowerCase().includes(q) || e.modelName.toLowerCase().includes(q)).forEach(e => {
      results.push({ type: "endpoint", id: e.id, title: e.name, subtitle: `${e.tenantName} \u00B7 ${e.status}`, url: `/endpoints`, icon: "Globe" });
    });

    // Search GPUs
    if (q.startsWith("gpu-") || q.includes("h100") || q.includes("a100") || q.includes("l40")) {
      this.getGpus().filter(g => g.id.includes(q) || g.model.toLowerCase().includes(q)).slice(0, 5).forEach(g => {
        results.push({ type: "gpu", id: g.id, title: `${g.id} (${g.model})`, subtitle: `${g.dcName} \u00B7 ${g.status}`, url: `/gpus`, icon: "Zap" });
      });
    }

    // Search alerts
    this.getAlerts().filter(a => a.title.toLowerCase().includes(q)).slice(0, 3).forEach(a => {
      results.push({ type: "alert", id: a.id, title: a.title, subtitle: `${a.severity} \u00B7 ${a.dcName}`, url: `/alerts`, icon: "Bell" });
    });

    return results.slice(0, 15);
  }

  // ─── API Keys & Webhooks ──────────────────────

  getApiKeys(): ApiKey[] {
    return TENANTS.slice(0, 5).map((t, i) => ({
      id: `key-${i.toString().padStart(3, "0")}`,
      tenantId: t.id,
      name: `${t.name} Production Key`,
      prefix: `cx_live_${randId("", i * 37).slice(0, 8)}`,
      createdAt: new Date(Date.now() - (90 + i * 30) * 86400000).toISOString(),
      lastUsedAt: new Date(Date.now() - Math.floor(smoothNoise(i * 47) * 3600000)).toISOString(),
      status: "active" as const,
    }));
  }

  getWebhooks(): Webhook[] {
    return [
      { id: "wh-001", tenantId: "t-003", url: "https://ai-ops.barclays.co.uk/webhooks/corex", events: ["job.completed", "job.failed", "alert.fired", "incident.opened"], status: "active", lastDeliveredAt: new Date(Date.now() - 120000).toISOString(), failureCount: 0 },
      { id: "wh-002", tenantId: "t-001", url: "https://hooks.neuralforge.ai/corex", events: ["job.completed", "job.failed", "alert.fired"], status: "active", lastDeliveredAt: new Date(Date.now() - 300000).toISOString(), failureCount: 0 },
      { id: "wh-003", tenantId: "t-005", url: "https://compute.astrazeneca.com/hooks/gpu-events", events: ["job.completed", "alert.fired", "incident.opened", "sla.warning"], status: "active", lastDeliveredAt: new Date(Date.now() - 600000).toISOString(), failureCount: 0 },
      { id: "wh-004", tenantId: "t-014", url: "https://quant-ai.hsbc.co.uk/webhooks/infra", events: ["alert.fired", "alert.resolved", "incident.opened"], status: "active", lastDeliveredAt: new Date(Date.now() - 900000).toISOString(), failureCount: 0 },
      { id: "wh-005", tenantId: "t-002", url: "https://api.deepvision.io/webhooks/corex", events: ["job.completed", "invoice.generated"], status: "active", lastDeliveredAt: new Date(Date.now() - 1800000).toISOString(), failureCount: 0 },
      { id: "wh-006", tenantId: "t-009", url: "https://cloudbrain.tech/hooks/infra", events: ["alert.fired", "alert.resolved", "incident.opened"], status: "failing", lastDeliveredAt: new Date(Date.now() - 86400000).toISOString(), failureCount: 12 },
      { id: "wh-007", tenantId: "t-012", url: "https://digital.bp.com/ai-webhooks/gpu", events: ["job.completed", "job.failed", "sla.warning"], status: "active", lastDeliveredAt: new Date(Date.now() - 450000).toISOString(), failureCount: 0 },
    ];
  }

  getPricingPlans(): PricingPlan[] {
    return [
      {
        id: "plan-enterprise",
        name: "Enterprise",
        currency: "USD",
        rules: {
          gpuPricing: { "H100 SXM": 3.29, "A100 SXM 80G": 2.09, "A100 PCIe 40G": 1.39, "L40S": 1.09 },
          endpointBaseHourly: 5.00,
          requestOverageRate: 0.001,
          discounts: [{ type: "volume", value: 0.10 }, { type: "commitment", value: 0.15 }],
        },
      },
      {
        id: "plan-pro",
        name: "Pro",
        currency: "USD",
        rules: {
          gpuPricing: { "H100 SXM": 3.49, "A100 SXM 80G": 2.21, "A100 PCIe 40G": 1.49, "L40S": 1.19 },
          endpointBaseHourly: 7.50,
          requestOverageRate: 0.002,
          discounts: [{ type: "volume", value: 0.05 }],
        },
      },
      {
        id: "plan-starter",
        name: "Starter",
        currency: "USD",
        rules: {
          gpuPricing: { "H100 SXM": 3.99, "A100 SXM 80G": 2.49, "A100 PCIe 40G": 1.69, "L40S": 1.39 },
          endpointBaseHourly: 10.00,
          requestOverageRate: 0.003,
          discounts: [],
        },
      },
    ];
  }

  // ─── Replay Engine ────────────────────────────

  getReplayScenarios(): ReplayScenario[] {
    return REPLAY_SCENARIOS;
  }

  startReplay(scenarioId: string): ReplayState {
    const scenario = REPLAY_SCENARIOS.find(s => s.id === scenarioId);
    if (!scenario) throw new Error("Unknown scenario");

    const events = this.generateReplayEvents(scenarioId, scenario.durationMinutes);
    const metrics = this.generateReplayMetrics(scenarioId, scenario.durationMinutes);

    this.replayState = {
      scenarioId,
      currentTime: events[0]?.ts || new Date().toISOString(),
      playing: true,
      speed: 1,
      events,
      metrics,
    };

    return this.replayState;
  }

  getReplayEvents(from?: string, to?: string): ReplayEvent[] {
    if (!this.replayState) return [];
    let events = this.replayState.events;
    if (from) events = events.filter(e => e.ts >= from);
    if (to) events = events.filter(e => e.ts <= to);
    return events;
  }

  getReplayMetrics(): ReplayState["metrics"] | null {
    return this.replayState?.metrics || null;
  }

  private generateReplayEvents(scenarioId: string, durationMin: number): ReplayEvent[] {
    const events: ReplayEvent[] = [];
    const baseTime = new Date();
    baseTime.setHours(8, 0, 0, 0);
    const base = baseTime.getTime();

    switch (scenarioId) {
      case "normal-day":
        for (let m = 0; m < durationMin; m += 30) {
          const t = new Date(base + m * 60000).toISOString();
          events.push({ ts: t, type: "job", severity: "info", title: "Batch jobs processing", description: `${Math.floor(3 + smoothNoise(m) * 5)} new jobs submitted, ${Math.floor(2 + smoothNoise(m + 1) * 3)} completed` });
        }
        events.push({ ts: new Date(base + 60 * 60000).toISOString(), type: "metric", severity: "info", title: "Peak utilization period begins", description: "GPU utilization ramping to 85%+ across all regions" });
        events.push({ ts: new Date(base + 600 * 60000).toISOString(), type: "metric", severity: "info", title: "Off-peak transition", description: "Utilization decreasing as business hours end in US regions" });
        break;

      case "marketing-spike":
        events.push({ ts: new Date(base).toISOString(), type: "metric", severity: "info", title: "Baseline steady state", description: "All systems nominal. Utilization at 68%" });
        events.push({ ts: new Date(base + 60 * 60000).toISOString(), type: "endpoint", severity: "warning", title: "Traffic surge detected", description: "Endpoint ep-001 RPS jumped from 120 to 450. Product launch campaign live." });
        events.push({ ts: new Date(base + 75 * 60000).toISOString(), type: "alert", severity: "warning", title: "Queue depth increasing", description: "H100 queue depth: 15 -> 42 tasks. Wait time: 12min -> 35min" });
        events.push({ ts: new Date(base + 90 * 60000).toISOString(), type: "scale", severity: "info", title: "Auto-scale triggered", description: "Endpoint ep-001 scaling from 6 to 12 replicas" });
        events.push({ ts: new Date(base + 120 * 60000).toISOString(), type: "scale", severity: "success", title: "Scale-up complete", description: "12 replicas active. Latency P95 recovering: 850ms -> 180ms" });
        events.push({ ts: new Date(base + 180 * 60000).toISOString(), type: "billing", severity: "info", title: "Revenue spike recorded", description: "Hourly revenue +340% vs baseline. MRR projection updated." });
        events.push({ ts: new Date(base + 360 * 60000).toISOString(), type: "metric", severity: "success", title: "Traffic normalizing", description: "RPS returning to baseline. Scale-down initiated." });
        events.push({ ts: new Date(base + 420 * 60000).toISOString(), type: "scale", severity: "info", title: "Scale-down complete", description: "Endpoint ep-001 scaled back to 8 replicas" });
        break;

      case "gpu-failure":
        events.push({ ts: new Date(base).toISOString(), type: "metric", severity: "info", title: "Normal operations", description: "US-East running at 78% utilization. 168 GPUs online." });
        events.push({ ts: new Date(base + 30 * 60000).toISOString(), type: "alert", severity: "critical", title: "ECC errors detected", description: "GPU gpu-0142, gpu-0143 reporting uncorrectable ECC errors on dc-us-east-node-2-3" });
        events.push({ ts: new Date(base + 32 * 60000).toISOString(), type: "incident", severity: "critical", title: "Incident opened", description: "INC-2024-031: US-East GPU node failure. Commander: Sarah Chen" });
        events.push({ ts: new Date(base + 35 * 60000).toISOString(), type: "alert", severity: "warning", title: "Node drain initiated", description: "Node dc-us-east-node-2-3 marked for drain. 8 GPUs going offline." });
        events.push({ ts: new Date(base + 40 * 60000).toISOString(), type: "job", severity: "warning", title: "Jobs migrating", description: "3 running jobs on affected node queued for migration to healthy nodes" });
        events.push({ ts: new Date(base + 45 * 60000).toISOString(), type: "metric", severity: "warning", title: "Capacity reduced", description: "US-East available GPUs: 42 -> 34. Queue wait time increasing." });
        events.push({ ts: new Date(base + 60 * 60000).toISOString(), type: "job", severity: "success", title: "Jobs migrated", description: "All 3 jobs successfully resumed on dc-us-east-node-1-2. No data loss." });
        events.push({ ts: new Date(base + 180 * 60000).toISOString(), type: "scale", severity: "info", title: "Hardware replacement", description: "Replacement node arriving. ETA: 2 hours." });
        events.push({ ts: new Date(base + 300 * 60000).toISOString(), type: "scale", severity: "success", title: "New node online", description: "Replacement node dc-us-east-node-2-3 provisioned with 8x H100 SXM" });
        events.push({ ts: new Date(base + 310 * 60000).toISOString(), type: "incident", severity: "success", title: "Incident resolved", description: "All systems restored. Post-mortem scheduled." });
        break;

      case "region-congestion":
        events.push({ ts: new Date(base).toISOString(), type: "metric", severity: "info", title: "Normal operations", description: "EU-West endpoints serving at P95 latency 120ms" });
        events.push({ ts: new Date(base + 45 * 60000).toISOString(), type: "alert", severity: "warning", title: "Latency spike detected", description: "EU-West endpoint P95 latency: 120ms -> 380ms" });
        events.push({ ts: new Date(base + 50 * 60000).toISOString(), type: "alert", severity: "critical", title: "Network congestion", description: "Frankfurt IX peering point congestion. Packet loss: 2.3%" });
        events.push({ ts: new Date(base + 55 * 60000).toISOString(), type: "incident", severity: "critical", title: "Incident opened", description: "Network congestion affecting EU-West region" });
        events.push({ ts: new Date(base + 75 * 60000).toISOString(), type: "scale", severity: "info", title: "Traffic rerouting", description: "Initiating traffic reroute through Amsterdam secondary path" });
        events.push({ ts: new Date(base + 120 * 60000).toISOString(), type: "metric", severity: "info", title: "Latency recovering", description: "P95 latency: 380ms -> 160ms via Amsterdam path" });
        events.push({ ts: new Date(base + 180 * 60000).toISOString(), type: "alert", severity: "success", title: "Network restored", description: "Frankfurt IX congestion cleared. Latency nominal." });
        events.push({ ts: new Date(base + 200 * 60000).toISOString(), type: "incident", severity: "success", title: "Incident resolved", description: "Traffic returned to primary path. All metrics nominal." });
        break;

      case "big-customer":
        events.push({ ts: new Date(base).toISOString(), type: "metric", severity: "info", title: "Current state", description: "464 total GPUs. MRR: $285,100. 8 active tenants." });
        events.push({ ts: new Date(base + 60 * 60000).toISOString(), type: "billing", severity: "info", title: "New customer signed", description: "MegaCorp AI signed Enterprise plan. Requested: 128x H100 SXM" });
        events.push({ ts: new Date(base + 90 * 60000).toISOString(), type: "scale", severity: "info", title: "Capacity planning", description: "Provisioning 128 additional H100 GPUs across US-East and US-West" });
        events.push({ ts: new Date(base + 180 * 60000).toISOString(), type: "scale", severity: "info", title: "Hardware provisioning", description: "First batch: 64x H100 online in US-East. Cluster dc-us-east-cluster-4 created." });
        events.push({ ts: new Date(base + 300 * 60000).toISOString(), type: "scale", severity: "success", title: "Full capacity online", description: "128x H100 provisioned. Total fleet: 592 GPUs" });
        events.push({ ts: new Date(base + 360 * 60000).toISOString(), type: "job", severity: "info", title: "Customer onboarding", description: "MegaCorp AI submitting first batch jobs. 32x H100 training run." });
        events.push({ ts: new Date(base + 480 * 60000).toISOString(), type: "billing", severity: "success", title: "MRR updated", description: "MRR increased: $285,100 -> $376,400 (+32%)" });
        events.push({ ts: new Date(base + 600 * 60000).toISOString(), type: "endpoint", severity: "success", title: "Endpoint deployed", description: "MegaCorp AI deployed first inference endpoint: llama-70b-megacorp" });
        break;

      case "auto-scale":
        events.push({ ts: new Date(base).toISOString(), type: "endpoint", severity: "info", title: "Endpoint baseline", description: "ep-001 running 2 replicas. RPS: 45. Latency P95: 95ms" });
        events.push({ ts: new Date(base + 30 * 60000).toISOString(), type: "metric", severity: "info", title: "Traffic ramping", description: "RPS increasing: 45 -> 120. Latency stable at 110ms" });
        events.push({ ts: new Date(base + 60 * 60000).toISOString(), type: "metric", severity: "warning", title: "Latency threshold approached", description: "RPS: 200. Latency P95: 280ms. Autoscale threshold: 300ms" });
        events.push({ ts: new Date(base + 75 * 60000).toISOString(), type: "scale", severity: "info", title: "Scale-up triggered", description: "Autoscaler adding 4 replicas (2 -> 6). Target latency: <150ms" });
        events.push({ ts: new Date(base + 85 * 60000).toISOString(), type: "scale", severity: "success", title: "Replicas ready", description: "6 replicas active. Latency P95: 280ms -> 130ms" });
        events.push({ ts: new Date(base + 120 * 60000).toISOString(), type: "metric", severity: "warning", title: "Traffic still growing", description: "RPS: 380. Latency P95 creeping up: 130ms -> 200ms" });
        events.push({ ts: new Date(base + 130 * 60000).toISOString(), type: "scale", severity: "info", title: "Second scale-up", description: "Scaling from 6 -> 12 replicas" });
        events.push({ ts: new Date(base + 145 * 60000).toISOString(), type: "scale", severity: "success", title: "Scale stable", description: "12 replicas serving RPS: 450 at P95 latency: 85ms" });
        events.push({ ts: new Date(base + 200 * 60000).toISOString(), type: "metric", severity: "info", title: "Traffic decreasing", description: "RPS declining: 450 -> 200. Cool-down period starting." });
        events.push({ ts: new Date(base + 220 * 60000).toISOString(), type: "scale", severity: "info", title: "Scale-down", description: "Scaling from 12 -> 6 replicas. Latency stable." });
        break;
    }

    return events.sort((a, b) => a.ts.localeCompare(b.ts));
  }

  private generateReplayMetrics(scenarioId: string, durationMin: number): ReplayState["metrics"] {
    const points = Math.min(96, Math.ceil(durationMin / 15));
    const baseTime = new Date();
    baseTime.setHours(8, 0, 0, 0);

    const gen = (fn: (progress: number) => number): MetricPoint[] => {
      const pts: MetricPoint[] = [];
      for (let i = 0; i < points; i++) {
        const progress = i / points;
        const t = new Date(baseTime.getTime() + progress * durationMin * 60000);
        pts.push({ time: t.toISOString(), value: Math.round(fn(progress) * 10) / 10 });
      }
      return pts;
    };

    switch (scenarioId) {
      case "normal-day":
        return {
          utilization: gen(p => { const h = 8 + p * 24; return dailyPattern(h % 24) * 100; }),
          revenue: gen(p => 45000 + Math.sin(p * Math.PI * 2) * 8000),
          queueDepth: gen(p => 5 + dailyPattern((8 + p * 24) % 24) * 15),
          latency: gen(p => 80 + dailyPattern((8 + p * 24) % 24) * 40 + Math.sin(p * 20) * 10),
          gpuAvailable: gen(p => 464 - Math.floor(dailyPattern((8 + p * 24) % 24) * 380)),
        };

      case "marketing-spike":
        return {
          utilization: gen(p => p < 0.12 ? 68 : p < 0.35 ? 68 + (p - 0.12) * 130 : p < 0.7 ? 98 - (p - 0.35) * 30 : 72),
          revenue: gen(p => p < 0.12 ? 42000 : p < 0.35 ? 42000 + (p - 0.12) * 600000 : p < 0.7 ? 180000 - (p - 0.35) * 300000 : 50000),
          queueDepth: gen(p => p < 0.12 ? 5 : p < 0.2 ? 5 + (p - 0.12) * 500 : p < 0.4 ? 45 - (p - 0.2) * 150 : 8),
          latency: gen(p => p < 0.12 ? 95 : p < 0.2 ? 95 + (p - 0.12) * 9500 : p < 0.35 ? 850 - (p - 0.2) * 4500 : 110),
          gpuAvailable: gen(p => p < 0.12 ? 140 : p < 0.25 ? 140 - (p - 0.12) * 900 : p < 0.7 ? 25 + (p - 0.25) * 250 : 130),
        };

      case "gpu-failure":
        return {
          utilization: gen(p => p < 0.08 ? 78 : p < 0.15 ? 78 + (p - 0.08) * 200 : p < 0.5 ? 92 - (p - 0.15) * 40 : 78),
          revenue: gen(p => p < 0.08 ? 46000 : p < 0.3 ? 46000 - (p - 0.08) * 30000 : p < 0.8 ? 39000 + (p - 0.3) * 14000 : 46000),
          queueDepth: gen(p => p < 0.08 ? 6 : p < 0.2 ? 6 + (p - 0.08) * 250 : p < 0.6 ? 36 - (p - 0.2) * 70 : 8),
          latency: gen(p => 90 + Math.sin(p * 10) * 15),
          gpuAvailable: gen(p => p < 0.08 ? 84 : p < 0.15 ? 84 - 8 : p < 0.8 ? 76 : 84),
        };

      case "region-congestion":
        return {
          utilization: gen(p => 75 + Math.sin(p * 6) * 5),
          revenue: gen(p => p < 0.15 ? 44000 : p < 0.4 ? 44000 - (p - 0.15) * 40000 : p < 0.6 ? 34000 + (p - 0.4) * 50000 : 44000),
          queueDepth: gen(p => 7 + Math.sin(p * 8) * 3),
          latency: gen(p => p < 0.15 ? 120 : p < 0.3 ? 120 + (p - 0.15) * 1700 : p < 0.5 ? 380 - (p - 0.3) * 1100 : p < 0.65 ? 160 - (p - 0.5) * 250 : 120),
          gpuAvailable: gen(p => 90 + Math.sin(p * 5) * 10),
        };

      case "big-customer":
        return {
          utilization: gen(p => p < 0.25 ? 72 : p < 0.5 ? 72 + (p - 0.25) * 40 : p < 0.7 ? 82 : 78),
          revenue: gen(p => p < 0.1 ? 285100 / 30 : p < 0.4 ? (285100 + (p - 0.1) * 304333) / 30 : (376400) / 30),
          queueDepth: gen(p => p < 0.25 ? 8 : p < 0.45 ? 8 + (p - 0.25) * 100 : p < 0.7 ? 28 - (p - 0.45) * 80 : 10),
          latency: gen(p => 95 + Math.sin(p * 12) * 15),
          gpuAvailable: gen(p => p < 0.25 ? 120 : p < 0.45 ? 120 + (p - 0.25) * 640 : p < 0.65 ? 248 - (p - 0.45) * 600 : 128),
        };

      case "auto-scale":
      default:
        return {
          utilization: gen(p => p < 0.1 ? 45 : p < 0.3 ? 45 + (p - 0.1) * 275 : p < 0.5 ? 100 : p < 0.8 ? 100 - (p - 0.5) * 150 : 55),
          revenue: gen(p => 35000 + dailyPattern(8 + p * 4) * 15000),
          queueDepth: gen(p => 3 + Math.sin(p * 8) * 2),
          latency: gen(p => p < 0.1 ? 95 : p < 0.25 ? 95 + (p - 0.1) * 1200 : p < 0.35 ? 280 : p < 0.55 ? 280 - (p - 0.35) * 950 : p < 0.75 ? 90 + (p - 0.55) * 550 : p < 0.85 ? 200 - (p - 0.75) * 1100 : 85),
          gpuAvailable: gen(p => p < 0.25 ? 140 : p < 0.35 ? 140 - (p - 0.25) * 400 : p < 0.55 ? 100 - (p - 0.35) * 250 : p < 0.8 ? 50 + (p - 0.55) * 360 : 140),
        };
    }
  }
}

function gpuModel(tenantIdx: number): string {
  return GPU_MODELS[tenantIdx % GPU_MODELS.length].model;
}

export const simulator = new CoreXSimulator();
