import { useLocation, Link } from "wouter";
import {
  LayoutDashboard, Server, Activity, ListTodo,
  CreditCard, Bell, ChevronRight
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup,
  SidebarGroupContent, SidebarMenu,
  SidebarMenuButton, SidebarMenuItem,
  SidebarHeader, SidebarFooter,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import type { Alert } from "@shared/schema";
import logoSrc from "@assets/photo_2026-02-15_10-10-27_1772231713455.jpg";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Data Centers", url: "/data-centers", icon: Server },
  { title: "Monitoring", url: "/monitoring", icon: Activity },
  { title: "Tasks", url: "/tasks", icon: ListTodo },
  { title: "Billing", url: "/billing", icon: CreditCard },
  { title: "Alerts", url: "/alerts", icon: Bell },
];

export function AppSidebar() {
  const [location] = useLocation();

  const { data: alerts } = useQuery<Alert[]>({
    queryKey: ["/api/alerts"],
    refetchInterval: 30000,
  });

  const unacknowledgedAlerts = alerts?.filter(a => !a.acknowledged && a.severity === "critical").length || 0;

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <Link href="/" data-testid="link-home">
          <div className="flex items-center gap-2.5">
            <img src={logoSrc} alt="CoreX" className="w-9 h-9 rounded-lg object-cover" />
            <div>
              <h1 className="font-display text-lg font-bold tracking-tight leading-none">CoreX</h1>
              <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest mt-0.5">Infrastructure</p>
            </div>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent className="pt-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = item.url === "/" ? location === "/" : location.startsWith(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild data-active={isActive}>
                      <Link href={item.url} data-testid={`link-${item.title.toLowerCase().replace(/\s/g, "-")}`}>
                        <item.icon className="w-4 h-4" />
                        <span className="flex-1">{item.title}</span>
                        {item.title === "Alerts" && unacknowledgedAlerts > 0 && (
                          <Badge variant="destructive" className="text-[10px] px-1.5 py-0 min-w-5 flex items-center justify-center">
                            {unacknowledgedAlerts}
                          </Badge>
                        )}
                        {isActive && <ChevronRight className="w-3 h-3 text-muted-foreground" />}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-status-online animate-pulse" />
          <span className="text-xs text-muted-foreground font-mono">All Systems Operational</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
