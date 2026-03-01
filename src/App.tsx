import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider, useTheme } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/auth-context";
import { ProtectedRoute } from "@/components/protected-route";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useTranslation } from "react-i18next";
import {
  Sun, Moon, LayoutDashboard, Server, Cpu,
  Activity, Bell, Search, Command
} from "lucide-react";
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
import Console from "@/pages/console";
import LandingPage from "@/pages/landing";
import LoginPage from "@/pages/login";
import { Link } from "wouter";

function DashboardRouter() {
  return (
    <Switch>
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/dashboard/data-centers" component={DataCenters} />
      <Route path="/dashboard/clusters" component={Clusters} />
      <Route path="/dashboard/nodes" component={Nodes} />
      <Route path="/dashboard/gpus" component={Gpus} />
      <Route path="/dashboard/monitoring" component={Monitoring} />
      <Route path="/dashboard/jobs" component={Jobs} />
      <Route path="/dashboard/queues" component={Queues} />
      <Route path="/dashboard/policies" component={Policies} />
      <Route path="/dashboard/tasks" component={Tasks} />
      <Route path="/dashboard/endpoints" component={Endpoints} />
      <Route path="/dashboard/tenants" component={Tenants} />
      <Route path="/dashboard/billing" component={Billing} />
      <Route path="/dashboard/alerts" component={Alerts} />
      <Route path="/dashboard/incidents" component={Incidents} />
      <Route path="/dashboard/replay" component={Replay} />
      <Route path="/dashboard/console" component={Console} />
      <Route path="/dashboard/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <Button
      size="icon"
      variant="ghost"
      onClick={toggleTheme}
      data-testid="button-theme-toggle"
      className="h-8 w-8 rounded-lg hover:bg-accent/80 transition-all duration-200"
    >
      {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </Button>
  );
}

const mobileNavItems = [
  { icon: LayoutDashboard, labelKey: "mobile.home", url: "/dashboard" },
  { icon: Activity, labelKey: "mobile.monitor", url: "/dashboard/monitoring" },
  { icon: Cpu, labelKey: "mobile.gpus", url: "/dashboard/gpus" },
  { icon: Server, labelKey: "mobile.infra", url: "/dashboard/data-centers" },
  { icon: Bell, labelKey: "mobile.alerts", url: "/dashboard/alerts" },
];

function MobileBottomNav() {
  const [location] = useLocation();
  const { t } = useTranslation();
  const isActive = (url: string) => url === "/dashboard" ? location === "/dashboard" : location.startsWith(url);

  return (
    <nav className="mobile-bottom-nav md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-t border-border/50 safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-1">
        {mobileNavItems.map(item => {
          const active = isActive(item.url);
          return (
            <Link key={item.url} href={item.url}>
              <button className={`
                flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl min-w-[56px]
                transition-all duration-200 ease-out active:scale-90
                ${active
                  ? "text-primary"
                  : "text-muted-foreground"
                }
              `}>
                <div className={`
                  relative flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-300
                  ${active ? "bg-primary/12" : ""}
                `}>
                  <item.icon className={`w-[18px] h-[18px] transition-all duration-200 ${active ? "scale-105" : ""}`} />
                  {active && (
                    <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                  )}
                </div>
                <span className={`text-[10px] font-medium tracking-wide transition-all duration-200 ${active ? "text-primary" : ""}`}>
                  {t(item.labelKey)}
                </span>
              </button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function AppLayout() {
  const { t } = useTranslation();
  const style = {
    "--sidebar-width": "15.5rem",
    "--sidebar-width-icon": "3.5rem",
  };

  return (
    <ProtectedRoute>
      <SidebarProvider style={style as React.CSSProperties}>
        <div className="flex h-screen w-full">
          <AppSidebar />
          <div className="flex flex-col flex-1 min-w-0">
            <header className="flex items-center justify-between gap-2 px-3 md:px-4 py-2 border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
              <div className="flex items-center gap-2">
                <SidebarTrigger data-testid="button-sidebar-toggle" className="h-8 w-8 rounded-lg" />
                <div className="h-4 w-px bg-border/50 hidden sm:block" />
                <span className="text-[11px] text-muted-foreground/60 font-mono hidden sm:block">v2.4.1</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button className="hidden md:flex items-center gap-2 h-8 px-3 rounded-lg border border-border/50 bg-muted/30 hover:bg-muted/50 transition-colors text-muted-foreground text-xs">
                  <Search className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">{t('common.search')}</span>
                  <kbd className="hidden lg:inline-flex h-5 items-center gap-0.5 rounded border border-border/50 bg-background/80 px-1.5 text-[10px] font-mono text-muted-foreground/60">
                    <Command className="w-2.5 h-2.5" />K
                  </kbd>
                </button>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-500/8 border border-emerald-500/10">
                  <div className="w-1.5 h-1.5 rounded-full bg-status-online glow-online" />
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-medium tracking-wider">{t('common.live')}</span>
                </div>
                <LanguageSwitcher />
                <ThemeToggle />
              </div>
            </header>
            <main className="flex-1 overflow-auto pb-16 md:pb-0">
              <DashboardRouter />
            </main>
          </div>
        </div>
        <MobileBottomNav />
      </SidebarProvider>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <AuthProvider>
            <Switch>
              <Route path="/" component={LandingPage} />
              <Route path="/login" component={LoginPage} />
              <Route>
                <AppLayout />
              </Route>
            </Switch>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
