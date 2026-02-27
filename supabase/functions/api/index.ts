import { corsHeaders, corsResponse, jsonResponse, errorResponse } from "../_shared/cors.ts";
import { simulator } from "../_shared/simulator.ts";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return corsResponse();

  const url = new URL(req.url);
  const path = url.pathname.replace(/^\/api\//, "").replace(/\/$/, "");
  const params = url.searchParams;

  try {
    // ── Dashboard ──
    if (path === "dashboard" && req.method === "GET") {
      return jsonResponse(simulator.getDashboardData());
    }

    // ── Data Centers ──
    if (path === "data-centers" && req.method === "GET") {
      return jsonResponse(simulator.getDataCenters());
    }

    // ── Clusters ──
    if (path === "clusters" && req.method === "GET") {
      return jsonResponse(simulator.getClusters(params.get("dc_id") || undefined));
    }

    // ── Nodes ──
    if (path === "nodes" && req.method === "GET") {
      return jsonResponse(simulator.getNodes(params.get("cluster_id") || undefined));
    }

    // ── GPUs ──
    if (path === "gpus" && req.method === "GET") {
      return jsonResponse(simulator.getGpus(
        params.get("node_id") || undefined,
        params.get("status") || undefined,
      ));
    }

    // ── Monitoring ──
    if (path === "monitoring" && req.method === "GET") {
      return jsonResponse(simulator.getMonitoringData());
    }

    // ── Tenants ──
    if (path === "tenants" && req.method === "GET") {
      return jsonResponse(simulator.getTenants());
    }

    // ── Jobs ──
    if (path === "jobs" && req.method === "GET") {
      return jsonResponse(simulator.getJobs(
        params.get("status") || undefined,
        params.get("tenant_id") || undefined,
      ));
    }

    // ── Single Job ──
    const jobMatch = path.match(/^jobs\/([^/]+)$/);
    if (jobMatch && req.method === "GET") {
      const jobs = simulator.getJobs();
      const job = jobs.find((j: any) => j.id === jobMatch[1]);
      if (!job) return errorResponse("Job not found", 404);
      return jsonResponse(job);
    }

    // ── Cancel Job ──
    const jobCancelMatch = path.match(/^jobs\/([^/]+)\/cancel$/);
    if (jobCancelMatch && req.method === "POST") {
      return jsonResponse({ success: true, message: `Job ${jobCancelMatch[1]} cancelled` });
    }

    // ── Legacy Tasks ──
    if (path === "tasks" && req.method === "GET") {
      return jsonResponse(simulator.getTasks());
    }

    // ── Queues ──
    if (path === "queues" && req.method === "GET") {
      return jsonResponse(simulator.getQueues());
    }

    // ── Policies ──
    if (path === "policies" && req.method === "GET") {
      return jsonResponse(simulator.getPolicies());
    }

    // ── Endpoints ──
    if (path === "endpoints" && req.method === "GET") {
      return jsonResponse(simulator.getEndpoints());
    }

    // ── Endpoint Metrics ──
    const epMetricsMatch = path.match(/^endpoints\/([^/]+)\/metrics$/);
    if (epMetricsMatch && req.method === "GET") {
      return jsonResponse(simulator.getEndpointMetrics(epMetricsMatch[1]));
    }

    // ── Endpoint Scale ──
    const epScaleMatch = path.match(/^endpoints\/([^/]+)\/scale$/);
    if (epScaleMatch && req.method === "POST") {
      return jsonResponse({ success: true, message: `Endpoint ${epScaleMatch[1]} scale request submitted` });
    }

    // ── Allocations ──
    if (path === "allocations" && req.method === "GET") {
      return jsonResponse(simulator.getAllocations());
    }

    // ── Billing ──
    if (path === "billing" && req.method === "GET") {
      return jsonResponse(simulator.getBillingData());
    }

    // ── Pricing ──
    if (path === "pricing" && req.method === "GET") {
      return jsonResponse(simulator.getPricingPlans());
    }

    // ── Alerts ──
    if (path === "alerts" && req.method === "GET") {
      return jsonResponse(simulator.getAlerts());
    }

    const alertResolveMatch = path.match(/^alerts\/([^/]+)\/resolve$/);
    if (alertResolveMatch && req.method === "POST") {
      return jsonResponse({ success: true, message: `Alert ${alertResolveMatch[1]} resolved` });
    }

    // ── Incidents ──
    if (path === "incidents" && req.method === "GET") {
      return jsonResponse(simulator.getIncidents());
    }

    // ── Replay ──
    if (path === "replay/scenarios" && req.method === "GET") {
      return jsonResponse(simulator.getReplayScenarios());
    }

    if (path === "replay/start" && req.method === "POST") {
      const body = await req.json();
      if (!body.scenarioId) return errorResponse("scenarioId required");
      try {
        return jsonResponse(simulator.startReplay(body.scenarioId));
      } catch (e: any) {
        return errorResponse(e.message);
      }
    }

    if (path === "replay/events" && req.method === "GET") {
      return jsonResponse(simulator.getReplayEvents(
        params.get("from") || undefined,
        params.get("to") || undefined,
      ));
    }

    if (path === "replay/metrics" && req.method === "GET") {
      const metrics = simulator.getReplayMetrics();
      if (!metrics) return errorResponse("No active replay", 404);
      return jsonResponse(metrics);
    }

    // ── Search ──
    if (path === "search" && req.method === "GET") {
      return jsonResponse(simulator.search(params.get("q") || ""));
    }

    // ── Settings ──
    if (path === "api-keys" && req.method === "GET") {
      return jsonResponse(simulator.getApiKeys());
    }

    if (path === "webhooks" && req.method === "GET") {
      return jsonResponse(simulator.getWebhooks());
    }

    return errorResponse("Not found", 404);
  } catch (e: any) {
    console.error("Edge function error:", e);
    return errorResponse(e.message || "Internal error", 500);
  }
});
