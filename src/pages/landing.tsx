import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/components/theme-provider";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Button } from "@/components/ui/button";
import {
  Sun, Moon, Cpu, Activity, Users, Scaling,
  Globe, ShieldCheck, Menu, X
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import logoSrc from "@assets/photo_2026-02-15_10-10-27_1772231713455.jpg";
import dcHeroSrc from "@assets/dc-hero.png";
import dcAerialSrc from "@assets/dc-aerial.png";

function useCountUp(target: number, duration = 2000) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const step = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return { value, ref };
}

function StatCounter({ target, label, suffix = "" }: { target: number; label: string; suffix?: string }) {
  const { value, ref } = useCountUp(target);
  return (
    <div ref={ref} className="text-center">
      <div className="font-display text-3xl md:text-4xl font-bold text-white">
        {value.toLocaleString()}{suffix}
      </div>
      <div className="text-sm text-white/60 mt-1">{label}</div>
    </div>
  );
}

export default function LandingPage() {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navAnchors = [
    { key: "landing.navFeatures", href: "#features" },
    { key: "landing.navInfrastructure", href: "#infrastructure" },
    { key: "landing.navCompliance", href: "#compliance" },
  ];

  const features = [
    { icon: Cpu, titleKey: "landing.featureGpuTitle", descKey: "landing.featureGpuDesc" },
    { icon: Activity, titleKey: "landing.featureMonitorTitle", descKey: "landing.featureMonitorDesc" },
    { icon: Users, titleKey: "landing.featureBillingTitle", descKey: "landing.featureBillingDesc" },
    { icon: Scaling, titleKey: "landing.featureScalingTitle", descKey: "landing.featureScalingDesc" },
    { icon: Globe, titleKey: "landing.featureGlobalTitle", descKey: "landing.featureGlobalDesc" },
    { icon: ShieldCheck, titleKey: "landing.featureSecurityTitle", descKey: "landing.featureSecurityDesc" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Sticky Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer">
              <img src={logoSrc} alt="CoreX" className="w-9 h-9 rounded-xl object-cover ring-2 ring-primary/20" />
              <span className="font-display text-xl font-bold tracking-tight">CoreX</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {navAnchors.map(n => (
              <a key={n.href} href={n.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t(n.key)}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2">
            <LanguageSwitcher />
            <Button size="icon" variant="ghost" onClick={toggleTheme} className="h-8 w-8 rounded-lg">
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Link href="/login">
              <Button variant="ghost" size="sm">{t("landing.login")}</Button>
            </Link>
            <Link href="/login">
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                {t("landing.getStarted")}
              </Button>
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-background/95 backdrop-blur-xl border-t border-border/50 px-4 pb-4 space-y-3">
            {navAnchors.map(n => (
              <a key={n.href} href={n.href} onClick={() => setMobileMenuOpen(false)} className="block text-sm text-muted-foreground hover:text-foreground py-2">
                {t(n.key)}
              </a>
            ))}
            <div className="flex items-center gap-2 pt-2">
              <LanguageSwitcher />
              <Button size="icon" variant="ghost" onClick={toggleTheme} className="h-8 w-8 rounded-lg">
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
            </div>
            <div className="flex gap-2 pt-2">
              <Link href="/login" className="flex-1">
                <Button variant="outline" size="sm" className="w-full">{t("landing.login")}</Button>
              </Link>
              <Link href="/login" className="flex-1">
                <Button size="sm" className="w-full bg-primary text-primary-foreground">{t("landing.getStarted")}</Button>
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── Hero Section ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden hero-shimmer">
        <div className="absolute inset-0">
          <img src={dcHeroSrc} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80" />
        </div>
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center pt-24 pb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm mb-8">
            <div className="w-2 h-2 rounded-full bg-emerald-400 glow-online" />
            <span className="text-xs text-white/70 font-mono tracking-wider">{t("landing.heroBadge")}</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-bold text-white leading-tight tracking-tight">
            {t("landing.heroTitle")}
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed">
            {t("landing.heroSubtitle")}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <Link href="/login">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 text-base h-12">
                {t("landing.heroCtaPrimary")}
              </Button>
            </Link>
            <a href="#features">
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 px-8 text-base h-12">
                {t("landing.heroCtaSecondary")}
              </Button>
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 pt-10 border-t border-white/10">
            <StatCounter target={12000} label={t("landing.statGpus")} suffix="+" />
            <StatCounter target={9999} label={t("landing.statUptime")} suffix="%" />
            <StatCounter target={4} label={t("landing.statRegions")} />
            <StatCounter target={2} label={t("landing.statLatency")} suffix="ms" />
          </div>
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">{t("landing.featuresTitle")}</h2>
          <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">{t("landing.featuresSubtitle")}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.titleKey}
              className="card-hover group relative rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-8 transition-all duration-300"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-5 group-hover:bg-primary/15 transition-colors">
                <f.icon className="w-6 h-6" />
              </div>
              <h3 className="font-display text-lg font-semibold mb-2">{t(f.titleKey)}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{t(f.descKey)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Infrastructure Section ── */}
      <section id="infrastructure" className="relative py-24 overflow-hidden">
        <div className="absolute inset-0">
          <img src={dcAerialSrc} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/70 to-black/80" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white tracking-tight">
              {t("landing.infraTitle")}
            </h2>
            <p className="mt-6 text-lg text-white/60 leading-relaxed">
              {t("landing.infraDesc")}
            </p>
            <div className="grid grid-cols-2 gap-6 mt-10">
              <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-5">
                <div className="font-display text-2xl font-bold text-white">1,080+</div>
                <div className="text-sm text-white/50 mt-1">{t("landing.infraGpus")}</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-5">
                <div className="font-display text-2xl font-bold text-white">232+</div>
                <div className="text-sm text-white/50 mt-1">{t("landing.infraNodes")}</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-5">
                <div className="font-display text-2xl font-bold text-white">23+</div>
                <div className="text-sm text-white/50 mt-1">{t("landing.infraClusters")}</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-5">
                <div className="font-display text-2xl font-bold text-white">H100 / A100</div>
                <div className="text-sm text-white/50 mt-1">{t("landing.infraHardware")}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Regulatory & Compliance Section ── */}
      <section id="compliance" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">{t("landing.complianceTitle")}</h2>
          <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">{t("landing.complianceSubtitle")}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* FCA Badge */}
          <div className="card-hover rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-8 text-center">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary mx-auto mb-5">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h3 className="font-display text-lg font-semibold mb-1">{t("landing.fcaTitle")}</h3>
            <p className="text-sm text-muted-foreground">{t("landing.fcaRef")}</p>
            <p className="text-xs text-muted-foreground/70 mt-2">{t("landing.fcaStatus")}</p>
          </div>

          {/* Companies House */}
          <div className="card-hover rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-8 text-center">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary mx-auto mb-5">
              <Globe className="w-7 h-7" />
            </div>
            <h3 className="font-display text-lg font-semibold mb-1">{t("landing.companyTitle")}</h3>
            <p className="text-sm text-muted-foreground">{t("landing.companyReg")}</p>
            <p className="text-xs text-muted-foreground/70 mt-2">{t("landing.companySince")}</p>
          </div>

          {/* London HQ */}
          <div className="card-hover rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-8 text-center">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary mx-auto mb-5">
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 21h18" /><path d="M5 21V7l8-4v18" /><path d="M19 21V11l-6-4" /><path d="M9 9v.01" /><path d="M9 12v.01" /><path d="M9 15v.01" /><path d="M9 18v.01" />
              </svg>
            </div>
            <h3 className="font-display text-lg font-semibold mb-1">{t("landing.hqTitle")}</h3>
            <p className="text-sm text-muted-foreground">{t("landing.hqAddress")}</p>
            <p className="text-xs text-muted-foreground/70 mt-2">{t("landing.hqCity")}</p>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border/50 bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img src={logoSrc} alt="CoreX" className="w-8 h-8 rounded-xl object-cover ring-1 ring-primary/20" />
              <span className="font-display text-lg font-bold">CoreX</span>
            </div>
            <p className="text-xs text-muted-foreground/60 text-center max-w-xl">
              {t("landing.footerDisclaimer")}
            </p>
          </div>
          <div className="mt-8 pt-6 border-t border-border/30 text-center">
            <p className="text-xs text-muted-foreground/50">
              {t("landing.footerCopyright")}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
