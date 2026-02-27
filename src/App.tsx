import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider, useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import DataCenters from "@/pages/data-centers";
import Monitoring from "@/pages/monitoring";
import Tasks from "@/pages/tasks";
import Billing from "@/pages/billing";
import Alerts from "@/pages/alerts";
import Clusters from "@/pages/clusters";
import Nodes from "@/pages/nodes";
import Gpus from "@/pages/gpus";
import Jobs from "@/pages/jobs";
import Queues from "@/pages/queues";
import Policies from "@/pages/policies";
import Endpoints from "@/pages/endpoints";
import Tenants from "@/pages/tenants";
import Incidents from "@/pages/incidents";
import Replay from "@/pages/replay";
import Settings from "@/pages/settings";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/data-centers" component={DataCenters} />
      <Route path="/clusters" component={Clusters} />
      <Route path="/nodes" component={Nodes} />
      <Route path="/gpus" component={Gpus} />
      <Route path="/monitoring" component={Monitoring} />
      <Route path="/jobs" component={Jobs} />
      <Route path="/queues" component={Queues} />
      <Route path="/policies" component={Policies} />
      <Route path="/tasks" component={Tasks} />
      <Route path="/endpoints" component={Endpoints} />
      <Route path="/tenants" component={Tenants} />
      <Route path="/billing" component={Billing} />
      <Route path="/alerts" component={Alerts} />
      <Route path="/incidents" component={Incidents} />
      <Route path="/replay" component={Replay} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <Button size="icon" variant="ghost" onClick={toggleTheme} data-testid="button-theme-toggle">
      {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </Button>
  );
}

function AppLayout() {
  const style = {
    "--sidebar-width": "15rem",
    "--sidebar-width-icon": "3.5rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <header className="flex items-center justify-between gap-2 px-4 py-2 border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
            <div className="flex items-center gap-2">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <div className="h-4 w-px bg-border" />
              <span className="text-xs text-muted-foreground font-mono">v2.4.1</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50 mr-2">
                <div className="w-1.5 h-1.5 rounded-full bg-status-online" />
                <span className="text-[11px] text-muted-foreground font-mono">LIVE</span>
              </div>
              <ThemeToggle />
            </div>
          </header>
          <main className="flex-1 overflow-auto">
            <Router />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <AppLayout />
          <Toaster />
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
