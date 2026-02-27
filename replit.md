# CoreX - AI Computing Infrastructure Management Dashboard

## Overview
CoreX is a GPU infrastructure management dashboard with a simulation engine that generates realistic, self-consistent data. It simulates a multi-datacenter GPU fleet with real-time metrics, task management, billing, and alerting.

## Architecture
- **Frontend**: React + Vite + Tailwind CSS + Recharts + shadcn/ui
- **Backend**: Express.js with in-memory simulation engine (no database needed)
- **Theme**: Dark mode by default with blue accent (hsl 217), Inter + Space Grotesk + JetBrains Mono fonts
- **Data**: All data is simulated via `server/simulator.ts` with time-based deterministic functions for realistic behavior

## Project Structure
```
client/src/
  App.tsx              - Root layout with sidebar, theme toggle, router
  components/
    app-sidebar.tsx    - Navigation sidebar with CoreX logo
    theme-provider.tsx - Dark/light theme context provider
    radial-gauge.tsx   - SVG radial gauge component with glow effects
    gpu-heatmap.tsx    - GPU fleet topology heat map grid
    live-console.tsx   - Terminal-style live system log viewer
    ui/                - shadcn/ui components
  pages/
    dashboard.tsx      - Global overview with hero image, KPI cards, charts
    data-centers.tsx   - DC topology with aerial hero image
    monitoring.tsx     - Enterprise monitoring: gauges, heatmap, console, charts
    tasks.tsx          - Task management (batch jobs & endpoints)
    billing.tsx        - Revenue, invoices, cost breakdown
    alerts.tsx         - System alerts with severity filtering
server/
  simulator.ts         - Simulation engine (4 DCs, 464 GPUs, 8 tenants, log stream)
  routes.ts            - API endpoints (/api/dashboard, /api/data-centers, etc.)
shared/
  schema.ts            - TypeScript interfaces for all data types
attached_assets/
  photo_2026-02-15...  - CoreX logo (used in sidebar)
  dc-hero.png          - Generated data center interior image
  dc-aerial.png        - Generated data center aerial image
```

## Simulation Engine
- 4 Data Centers: US-East (168 GPUs), US-West (128), EU-West (96), APAC (72)
- GPU Models: H100 SXM, A100 SXM 80G, A100 PCIe 40G, L40S
- 8 Simulated Tenants (Enterprise/Pro/Starter tiers)
- Metrics use daily sine-wave patterns with noise for realistic behavior
- Self-consistent: utilization affects temperature, power, and revenue
- Data refreshes every 8-10 seconds via polling
- Log stream generates 40 realistic infrastructure log entries per refresh

## API Endpoints
- GET /api/dashboard - Aggregated dashboard data with charts
- GET /api/data-centers - Data center details
- GET /api/monitoring - GPU fleet metrics, logs, GPU grid data, utilization history
- GET /api/tasks - Task list with status
- GET /api/billing - Revenue and invoice data
- GET /api/alerts - System alerts

## Key Design Decisions
- No database needed (simulation runs in-memory)
- Dark mode default for infrastructure dashboard aesthetic
- Font stack: Inter (body), Space Grotesk (headings), JetBrains Mono (metrics)
- All data auto-refreshes to simulate live monitoring
- Monitoring page features: radial gauge indicators, GPU topology heatmap, live terminal console, multi-tab charts
- Hero images with gradient overlays on dashboard, data centers, and monitoring pages
- CoreX logo from attached_assets used in sidebar
