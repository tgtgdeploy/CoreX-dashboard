import type { Express } from "express";
import { createServer, type Server } from "http";
import { simulator } from "./simulator";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get("/api/dashboard", (_req, res) => {
    res.json(simulator.getDashboardData());
  });

  app.get("/api/data-centers", (_req, res) => {
    res.json(simulator.getDataCenters());
  });

  app.get("/api/monitoring", (_req, res) => {
    res.json(simulator.getMonitoringData());
  });

  app.get("/api/tasks", (_req, res) => {
    res.json(simulator.getTasks());
  });

  app.get("/api/alerts", (_req, res) => {
    res.json(simulator.getAlerts());
  });

  app.get("/api/billing", (_req, res) => {
    res.json(simulator.getBillingData());
  });

  return httpServer;
}
