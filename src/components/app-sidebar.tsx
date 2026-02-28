import { useLocation, Link } from "wouter";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard, Server, Network, HardDrive, Cpu, CalendarClock,
  ListTodo, Layers, ShieldCheck, Globe, Building2, CreditCard,
  Bell, AlertOctagon, Play, Settings, ChevronRight, ChevronDown,
  Activity, Terminal
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup,
  SidebarGroupContent, SidebarGroupLabel, SidebarMenu,
  SidebarMenuItem, SidebarMenuSub, SidebarMenuSubItem,
  SidebarHeader, SidebarFooter,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import type { Alert } from "@shared/schema";
import logoSrc from "@assets/photo_2026-02-15_10-10-27_1772231713455.jpg";

interface NavItem {
  titleKey: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  children?: { titleKey: string; url: string }[];
}

export function AppSidebar() {
  const [location] = useLocation();
  const { t } = useTranslation();
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set(["Scheduler"]));

  const navSections: { labelKey: string; items: NavItem[] }[] = [
    {
      labelKey: "nav.overview",
      items: [
        { titleKey: "nav.dashboard", url: "/", icon: LayoutDashboard },
      ],
    },
    {
      labelKey: "nav.infrastructure",
      items: [
        { titleKey: "nav.dataCenters", url: "/data-centers", icon: Server },
        { titleKey: "nav.clusters", url: "/clusters", icon: Network },
        { titleKey: "nav.nodes", url: "/nodes", icon: HardDrive },
        { titleKey: "nav.gpus", url: "/gpus", icon: Cpu },
      ],
    },
    {
      labelKey: "nav.compute",
      items: [
        {
          titleKey: "nav.scheduler", url: "/jobs", icon: CalendarClock,
          children: [
            { titleKey: "nav.jobs", url: "/jobs" },
            { titleKey: "nav.queues", url: "/queues" },
            { titleKey: "nav.policies", url: "/policies" },
          ],
        },
        { titleKey: "nav.endpoints", url: "/endpoints", icon: Globe },
      ],
    },
    {
      labelKey: "nav.business",
      items: [
        { titleKey: "nav.tenants", url: "/tenants", icon: Building2 },
        { titleKey: "nav.billing", url: "/billing", icon: CreditCard },
      ],
    },
    {
      labelKey: "nav.observability",
      items: [
        { titleKey: "nav.monitoring", url: "/monitoring", icon: Activity },
        { titleKey: "nav.console", url: "/console", icon: Terminal },
      ],
    },
    {
      labelKey: "nav.operations",
      items: [
        { titleKey: "nav.alerts", url: "/alerts", icon: Bell },
        { titleKey: "nav.incidents", url: "/incidents", icon: AlertOctagon },
        { titleKey: "nav.replay", url: "/replay", icon: Play },
      ],
    },
    {
      labelKey: "nav.system",
      items: [
        { titleKey: "nav.settings", url: "/settings", icon: Settings },
      ],
    },
  ];

  const { data: alerts } = useQuery<Alert[]>({
    queryKey: ["/api/alerts"],
    refetchInterval: 30000,
  });

  const criticalAlerts = alerts?.filter(a => !a.acknowledged && a.severity === "critical").length || 0;

  const toggleMenu = (titleKey: string) => {
    setExpandedMenus(prev => {
      const next = new Set(prev);
      if (next.has(titleKey)) next.delete(titleKey); else next.add(titleKey);
      return next;
    });
  };

  const isActive = (url: string) => url === "/" ? location === "/" : location.startsWith(url);

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <Link href="/">
          <div className="flex items-center gap-3 group/logo">
            <div className="relative">
              <img src={logoSrc} alt="CoreX" className="w-9 h-9 rounded-xl object-cover ring-2 ring-primary/20 transition-all duration-300 group-hover/logo:ring-primary/40 group-hover/logo:scale-105" />
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-status-online ring-2 ring-sidebar" />
            </div>
            <div className="min-w-0">
              <h1 className="font-display text-base font-bold tracking-tight leading-none bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">CoreX</h1>
              <p className="text-[9px] text-muted-foreground font-mono uppercase tracking-[0.2em] mt-0.5">{t('common.infrastructure')}</p>
            </div>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="pt-2 overflow-y-auto sidebar-scroll">
        {navSections.map(section => (
          <SidebarGroup key={section.labelKey} className="py-0.5 px-2">
            <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/60 px-3 py-1.5 mb-0.5">
              {t(section.labelKey)}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map(item => {
                  if (item.children) {
                    const isExpanded = expandedMenus.has(item.titleKey);
                    const childActive = item.children.some(c => isActive(c.url));
                    return (
                      <Collapsible key={item.titleKey} open={isExpanded || childActive}>
                        <SidebarMenuItem>
                          <CollapsibleTrigger asChild>
                            <button
                              onClick={() => toggleMenu(item.titleKey)}
                              className={`
                                nav-btn group/nav-btn w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm
                                transition-all duration-200 ease-out relative overflow-hidden
                                ${childActive
                                  ? "bg-primary/10 text-primary font-medium"
                                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/60"
                                }
                              `}
                            >
                              {childActive && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary transition-all duration-300" />
                              )}
                              <div className={`
                                flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-200
                                ${childActive
                                  ? "bg-primary/15 text-primary"
                                  : "text-muted-foreground group-hover/nav-btn:text-sidebar-foreground group-hover/nav-btn:bg-sidebar-accent/80"
                                }
                              `}>
                                <item.icon className="w-[15px] h-[15px]" />
                              </div>
                              <span className="flex-1 text-left">{t(item.titleKey)}</span>
                              <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-300 ease-out ${isExpanded || childActive ? "rotate-0" : "-rotate-90"}`} />
                            </button>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="animate-collapsible">
                            <SidebarMenuSub>
                              {item.children.map(child => {
                                const active = isActive(child.url);
                                return (
                                  <SidebarMenuSubItem key={child.url}>
                                    <Link href={child.url}>
                                      <div className={`
                                        flex items-center gap-2.5 px-3 py-1.5 rounded-md text-sm
                                        transition-all duration-200 ease-out cursor-pointer
                                        ${active
                                          ? "text-primary font-medium bg-primary/5"
                                          : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/40"
                                        }
                                      `}>
                                        <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${active ? "bg-primary scale-110" : "bg-muted-foreground/30"}`} />
                                        <span>{t(child.titleKey)}</span>
                                        {active && <ChevronRight className="w-3 h-3 ml-auto text-primary/60" />}
                                      </div>
                                    </Link>
                                  </SidebarMenuSubItem>
                                );
                              })}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        </SidebarMenuItem>
                      </Collapsible>
                    );
                  }

                  const active = isActive(item.url);
                  const showBadge = item.titleKey === "nav.alerts" && criticalAlerts > 0;
                  return (
                    <SidebarMenuItem key={item.titleKey}>
                      <Link href={item.url}>
                        <div
                          className={`
                            nav-btn group/nav-btn flex items-center gap-3 px-3 py-2 rounded-lg text-sm
                            transition-all duration-200 ease-out relative overflow-hidden cursor-pointer
                            ${active
                              ? "bg-primary/10 text-primary font-medium shadow-sm shadow-primary/5"
                              : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/60"
                            }
                          `}
                        >
                          {active && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary transition-all duration-300" />
                          )}
                          <div className={`
                            flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-200
                            ${active
                              ? "bg-primary/15 text-primary"
                              : "text-muted-foreground group-hover/nav-btn:text-sidebar-foreground group-hover/nav-btn:bg-sidebar-accent/80"
                            }
                          `}>
                            <item.icon className="w-[15px] h-[15px]" />
                          </div>
                          <span className="flex-1">{t(item.titleKey)}</span>
                          {showBadge && (
                            <span className="relative flex items-center justify-center">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-40" />
                              <Badge variant="destructive" className="relative text-[10px] px-1.5 py-0 min-w-5 flex items-center justify-center font-mono">
                                {criticalAlerts}
                              </Badge>
                            </span>
                          )}
                          {active && !showBadge && <ChevronRight className="w-3.5 h-3.5 text-primary/50" />}
                        </div>
                      </Link>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-2.5 px-1">
          <div className="relative flex items-center justify-center">
            <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 opacity-30" />
            <div className="relative w-2 h-2 rounded-full bg-status-online" />
          </div>
          <span className="text-[11px] text-muted-foreground font-mono tracking-wide">{t('common.allSystemsOperational')}</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
