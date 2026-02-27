import { useLocation, Link } from "wouter";
import {
  LayoutDashboard, Server, Network, HardDrive, Cpu, CalendarClock,
  ListTodo, Layers, ShieldCheck, Globe, Building2, CreditCard,
  Bell, AlertOctagon, Play, Settings, ChevronRight, ChevronDown
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup,
  SidebarGroupContent, SidebarGroupLabel, SidebarMenu,
  SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton,
  SidebarHeader, SidebarFooter,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import type { Alert } from "@shared/schema";
import logoSrc from "@assets/photo_2026-02-15_10-10-27_1772231713455.jpg";

interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  children?: { title: string; url: string }[];
}

const navSections: { label: string; items: NavItem[] }[] = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", url: "/", icon: LayoutDashboard },
    ],
  },
  {
    label: "Infrastructure",
    items: [
      { title: "Data Centers", url: "/data-centers", icon: Server },
      { title: "Clusters", url: "/clusters", icon: Network },
      { title: "Nodes", url: "/nodes", icon: HardDrive },
      { title: "GPUs", url: "/gpus", icon: Cpu },
    ],
  },
  {
    label: "Compute",
    items: [
      {
        title: "Scheduler", url: "/jobs", icon: CalendarClock,
        children: [
          { title: "Jobs", url: "/jobs" },
          { title: "Queues", url: "/queues" },
          { title: "Policies", url: "/policies" },
        ],
      },
      { title: "Endpoints", url: "/endpoints", icon: Globe },
    ],
  },
  {
    label: "Business",
    items: [
      { title: "Tenants", url: "/tenants", icon: Building2 },
      { title: "Billing", url: "/billing", icon: CreditCard },
    ],
  },
  {
    label: "Operations",
    items: [
      { title: "Alerts", url: "/alerts", icon: Bell },
      { title: "Incidents", url: "/incidents", icon: AlertOctagon },
      { title: "Replay", url: "/replay", icon: Play },
    ],
  },
  {
    label: "System",
    items: [
      { title: "Settings", url: "/settings", icon: Settings },
    ],
  },
];

export function AppSidebar() {
  const [location] = useLocation();
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set(["Scheduler"]));

  const { data: alerts } = useQuery<Alert[]>({
    queryKey: ["/api/alerts"],
    refetchInterval: 30000,
  });

  const criticalAlerts = alerts?.filter(a => !a.acknowledged && a.severity === "critical").length || 0;

  const toggleMenu = (title: string) => {
    setExpandedMenus(prev => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title); else next.add(title);
      return next;
    });
  };

  const isActive = (url: string) => url === "/" ? location === "/" : location.startsWith(url);

  return (
    <Sidebar>
      <SidebarHeader className="p-3 sm:p-4 border-b border-sidebar-border">
        <Link href="/">
          <div className="flex items-center gap-2.5">
            <img src={logoSrc} alt="CoreX" className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg object-cover" />
            <div className="min-w-0">
              <h1 className="font-display text-base sm:text-lg font-bold tracking-tight leading-none">CoreX</h1>
              <p className="text-[9px] sm:text-[10px] text-muted-foreground font-mono uppercase tracking-widest mt-0.5">Infrastructure</p>
            </div>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent className="pt-1 overflow-y-auto">
        {navSections.map(section => (
          <SidebarGroup key={section.label} className="py-1">
            <SidebarGroupLabel className="text-[10px] px-3 py-1">{section.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map(item => {
                  if (item.children) {
                    const isExpanded = expandedMenus.has(item.title);
                    const childActive = item.children.some(c => isActive(c.url));
                    return (
                      <Collapsible key={item.title} open={isExpanded || childActive}>
                        <SidebarMenuItem>
                          <CollapsibleTrigger asChild>
                            <SidebarMenuButton onClick={() => toggleMenu(item.title)} data-active={childActive}>
                              <item.icon className="w-4 h-4" />
                              <span className="flex-1 text-sm">{item.title}</span>
                              <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded || childActive ? "rotate-0" : "-rotate-90"}`} />
                            </SidebarMenuButton>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <SidebarMenuSub>
                              {item.children.map(child => (
                                <SidebarMenuSubItem key={child.url}>
                                  <SidebarMenuSubButton asChild data-active={isActive(child.url)}>
                                    <Link href={child.url}>
                                      <span className="text-sm">{child.title}</span>
                                      {isActive(child.url) && <ChevronRight className="w-3 h-3 ml-auto text-muted-foreground" />}
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        </SidebarMenuItem>
                      </Collapsible>
                    );
                  }

                  const active = isActive(item.url);
                  const showBadge = item.title === "Alerts" && criticalAlerts > 0;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild data-active={active}>
                        <Link href={item.url}>
                          <item.icon className="w-4 h-4" />
                          <span className="flex-1 text-sm">{item.title}</span>
                          {showBadge && (
                            <Badge variant="destructive" className="text-[10px] px-1.5 py-0 min-w-5 flex items-center justify-center">
                              {criticalAlerts}
                            </Badge>
                          )}
                          {active && <ChevronRight className="w-3 h-3 text-muted-foreground" />}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="p-3 sm:p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-status-online animate-pulse" />
          <span className="text-[10px] sm:text-xs text-muted-foreground font-mono">All Systems Operational</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
