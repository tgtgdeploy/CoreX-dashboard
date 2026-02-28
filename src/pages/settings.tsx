import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import type { ApiKey, Webhook, PricingPlan } from "@shared/schema";
import { HealthBadge } from "@/components/health-badge";
import { DataTable, type Column } from "@/components/data-table";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings as SettingsIcon, Key, Webhook as WebhookIcon, CreditCard } from "lucide-react";

export default function Settings() {
  const { t } = useTranslation();
  const { data: apiKeys = [] } = useQuery<ApiKey[]>({ queryKey: ["/api/api-keys"] });
  const { data: webhooks = [] } = useQuery<Webhook[]>({ queryKey: ["/api/webhooks"] });
  const { data: plans = [] } = useQuery<PricingPlan[]>({ queryKey: ["/api/pricing"] });

  const apiKeyColumns: Column<ApiKey>[] = [
    { key: "name", header: t('settings.tableName'), render: r => <span className="font-medium text-sm">{r.name}</span> },
    { key: "prefix", header: t('settings.tableKey'), render: r => <span className="font-mono text-xs">{r.prefix}••••••••</span> },
    { key: "status", header: t('settings.tableStatus'), render: r => <HealthBadge status={r.status} /> },
    { key: "created", header: t('settings.tableCreated'), render: r => new Date(r.createdAt).toLocaleDateString(), hideOnMobile: true },
    { key: "lastUsed", header: t('settings.tableLastUsed'), render: r => r.lastUsedAt ? new Date(r.lastUsedAt).toLocaleDateString() : t('common.never'), hideOnMobile: true },
  ];

  const webhookColumns: Column<Webhook>[] = [
    { key: "url", header: t('settings.tableUrl'), render: r => <span className="font-mono text-xs truncate max-w-[200px] block">{r.url}</span> },
    { key: "events", header: t('settings.tableEvents'), render: r => (
      <div className="flex gap-1 flex-wrap">
        {r.events.slice(0, 3).map(e => (
          <span key={e} className="text-[10px] px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground">{e}</span>
        ))}
        {r.events.length > 3 && <span className="text-[10px] text-muted-foreground">+{r.events.length - 3}</span>}
      </div>
    )},
    { key: "status", header: t('settings.tableStatus'), render: r => <HealthBadge status={r.status} /> },
    { key: "failures", header: t('settings.tableFailures'), render: r => (
      <span className={r.failureCount > 0 ? "text-amber-400 font-mono text-xs" : "text-muted-foreground text-xs"}>{r.failureCount}</span>
    ), hideOnMobile: true },
    { key: "lastDelivered", header: t('settings.tableLastDelivered'), render: r => r.lastDeliveredAt ? new Date(r.lastDeliveredAt).toLocaleDateString() : t('common.never'), hideOnMobile: true },
  ];

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex items-center gap-3">
        <SettingsIcon className="w-6 h-6 text-muted-foreground" />
        <h1 className="text-xl sm:text-2xl font-display font-bold">{t('settings.title')}</h1>
      </div>

      <Tabs defaultValue="api-keys">
        <TabsList>
          <TabsTrigger value="api-keys" className="gap-1.5">
            <Key className="w-3.5 h-3.5" /> {t('settings.tabApiKeys')}
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="gap-1.5">
            <WebhookIcon className="w-3.5 h-3.5" /> {t('settings.tabWebhooks')}
          </TabsTrigger>
          <TabsTrigger value="pricing" className="gap-1.5">
            <CreditCard className="w-3.5 h-3.5" /> {t('settings.tabPricing')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="api-keys">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium">{t('settings.apiKeysCount', { count: apiKeys.length })}</h3>
            </div>
            <DataTable data={apiKeys} columns={apiKeyColumns} pageSize={10} />
          </Card>
        </TabsContent>

        <TabsContent value="webhooks">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium">{t('settings.webhooksCount', { count: webhooks.length })}</h3>
            </div>
            <DataTable data={webhooks} columns={webhookColumns} pageSize={10} />
          </Card>
        </TabsContent>

        <TabsContent value="pricing">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {plans.map(plan => (
              <Card key={plan.id} className="bg-card/50 backdrop-blur-sm border-border/50 p-4">
                <h3 className="font-medium text-sm mb-2">{plan.name}</h3>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-muted-foreground block mb-1">{t('settings.gpuPricing')}</span>
                    {Object.entries(plan.rules.gpuPricing).map(([model, price]) => (
                      <div key={model} className="flex justify-between py-0.5">
                        <span className="text-muted-foreground">{model}</span>
                        <span className="font-mono">${(price as number).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between pt-2 border-t border-border/30">
                    <span className="text-muted-foreground">{t('settings.endpointBase')}</span>
                    <span className="font-mono">${plan.rules.endpointBaseHourly.toFixed(2)}/hr</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('settings.overageRate')}</span>
                    <span className="font-mono">${plan.rules.requestOverageRate.toFixed(4)}/req</span>
                  </div>
                  {plan.rules.discounts.length > 0 && (
                    <div className="pt-2 border-t border-border/30">
                      <span className="text-muted-foreground block mb-1">{t('settings.discounts')}</span>
                      {plan.rules.discounts.map((d, i) => (
                        <div key={i} className="flex justify-between py-0.5">
                          <span className="text-muted-foreground">{d.type}</span>
                          <span className="text-emerald-400 font-mono">-{d.value}%</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            ))}
            {plans.length === 0 && (
              <p className="text-sm text-muted-foreground col-span-full text-center py-8">{t('settings.noPricingPlans')}</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
