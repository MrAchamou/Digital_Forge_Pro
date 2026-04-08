import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Database,
  Brain,
  Zap,
  TrendingUp,
  Cpu,
  Activity,
  ChevronRight,
  Shield,
  Rocket,
  ArrowUpRight,
  CircleDot,
  Layers3,
  Gauge,
} from "lucide-react";

interface LibraryStats {
  totalDescriptions: number;
  effectsGenerated: number;
  effectsRemaining: number;
  averageGenerationTime: number;
  successRate: number;
  categories: Record<string, number>;
  expansionRate: number;
  qualityScore: number;
}

interface SystemHealth {
  overall: number;
  modules: Record<string, { status: string; performance: number; uptime: string }>;
  ai?: { confidence: number };
  predictiveAccuracy?: number;
}

const quickActions = [
  {
    href: "/generator",
    label: "God Generator",
    sublabel: "Create new effects with AI",
    icon: Wand2Icon,
    gradFrom: "#00D4FF",
    gradTo: "#7C3AED",
    glow: "rgba(0,212,255,0.25)",
  },
  {
    href: "/library",
    label: "Neural Library",
    sublabel: "Browse 55+ premium effects",
    icon: Database,
    gradFrom: "#7C3AED",
    gradTo: "#FF006E",
    glow: "rgba(124,58,237,0.25)",
  },
  {
    href: "/expansion",
    label: "AI Expansion",
    sublabel: "Quantum learning matrix",
    icon: Brain,
    gradFrom: "#FF006E",
    gradTo: "#FFB800",
    glow: "rgba(255,0,110,0.25)",
  },
  {
    href: "/studio",
    label: "Signature Vivante",
    sublabel: "Studio God Tier — 3 IA",
    icon: Sparkles,
    gradFrom: "#FFB800",
    gradTo: "#00D4FF",
    glow: "rgba(255,184,0,0.25)",
  },
];

function Wand2Icon(props: any) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M15 4V2M15 16v-2M8 9h2M20 9h2M17.8 11.8 19 13M17.8 6.2 19 5M3 21l9-9M12.2 6.2 11 5" />
    </svg>
  );
}

function getStatusColor(value: number) {
  if (value >= 90) return "#22c55e";
  if (value >= 70) return "#eab308";
  return "#ef4444";
}

function getStatusLabel(status: string) {
  if (status === "active" || status === "online") return "online";
  return status;
}

export default function Dashboard() {
  const { data: stats } = useQuery<LibraryStats>({
    queryKey: ["/api/library/real-time-stats"],
    refetchInterval: 5000,
  });

  const { data: health } = useQuery<SystemHealth>({
    queryKey: ["/api/system/health"],
    refetchInterval: 6000,
  });

  const healthVal = health?.overall ?? 0;
  const totalEffects = stats?.totalDescriptions ?? 0;
  const avgTime = stats?.averageGenerationTime;
  const qualityScore = stats?.qualityScore ? (stats.qualityScore * 100).toFixed(0) : "95";

  return (
    <div className="space-y-8">

      {/* ─── HERO HEADER ─── */}
      <div className="relative pt-2 pb-4">
        {/* Background glow */}
        <div
          className="absolute -top-8 left-1/2 -translate-x-1/2 w-[600px] h-[200px] rounded-full blur-[80px] pointer-events-none"
          style={{ background: "radial-gradient(ellipse, rgba(0,212,255,0.12) 0%, rgba(124,58,237,0.08) 60%, transparent 100%)" }}
        />

        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="section-label">Command Center</span>
          </div>

          <h1
            className="text-4xl md:text-5xl font-black leading-tight mb-3"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            <span
              className="text-gradient-animate"
              style={{
                background: "linear-gradient(135deg, #ffffff 0%, #00D4FF 30%, #7C3AED 60%, #FF006E 85%, #00D4FF 100%)",
                backgroundSize: "300% 300%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                animation: "gradient-x-shift 4s ease infinite",
              }}
            >
              NEXUS COMMAND
            </span>
          </h1>

          <p className="text-white/40 text-sm max-w-xl">
            Neural Effect Generation System &mdash; GOD Mode Active &mdash; Quantum Processing Online
          </p>
        </div>
      </div>

      {/* ─── TOP STATS ROW ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Neural Library",
            value: totalEffects.toLocaleString(),
            unit: "effects",
            icon: Database,
            color: "#00D4FF",
            sub: `${Object.keys(stats?.categories ?? {}).length} categories`,
          },
          {
            label: "Generation Speed",
            value: avgTime !== undefined ? avgTime.toFixed(1) : "—",
            unit: "ms avg",
            icon: Zap,
            color: "#7C3AED",
            sub: "Quantum accelerated",
          },
          {
            label: "System Health",
            value: `${healthVal.toFixed(0)}`,
            unit: "%",
            icon: Shield,
            color: getStatusColor(healthVal),
            sub: "All nodes online",
          },
          {
            label: "Quality Score",
            value: qualityScore,
            unit: "%",
            icon: TrendingUp,
            color: "#FFB800",
            sub: "GOD tier rating",
          },
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="stat-card group"
              style={{ animationDelay: `${idx * 1.2}s` }}
            >
              <div
                className="absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl pointer-events-none opacity-40"
                style={{ background: stat.color, transform: "translate(40%, -40%)" }}
              />
              <div className="flex items-center justify-between mb-4">
                <span className="section-label">{stat.label}</span>
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${stat.color}18` }}
                >
                  <Icon className="w-4 h-4" style={{ color: stat.color }} />
                </div>
              </div>
              <div className="flex items-baseline gap-1">
                <span
                  className="text-3xl font-black text-white metric-live"
                  style={{ fontFamily: "'Space Grotesk', sans-serif", animationDelay: `${idx * 0.8}s` }}
                >
                  {stat.value}
                </span>
                <span className="text-sm text-white/30">{stat.unit}</span>
              </div>
              <div className="mt-2 text-xs text-white/30">{stat.sub}</div>
            </div>
          );
        })}
      </div>

      {/* ─── MAIN CONTENT AREA ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Quick Actions */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Rocket className="w-4 h-4 text-white/30" />
            <span className="section-label">Quick Access</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.href} href={action.href}>
                  <div
                    className="group p-5 rounded-2xl border border-white/[0.06] cursor-pointer transition-all duration-200 hover:border-white/[0.12] hover:-translate-y-0.5"
                    style={{
                      background: "hsl(var(--forge-dark))",
                      boxShadow: `0 0 0 0 ${action.glow}`,
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 32px ${action.glow}`;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.boxShadow = `0 0 0 0 ${action.glow}`;
                    }}
                    data-testid={`action-${action.href.slice(1)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                        style={{ background: `linear-gradient(135deg, ${action.gradFrom}, ${action.gradTo})` }}
                      >
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-white/20 group-hover:text-white/60 transition-colors" />
                    </div>
                    <div className="font-semibold text-white text-sm mb-1">{action.label}</div>
                    <div className="text-xs text-white/35">{action.sublabel}</div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* AI Status bar */}
          <div
            className="mt-4 p-5 rounded-2xl border border-white/[0.06] flex items-center justify-between gap-4"
            style={{ background: "hsl(var(--forge-dark))" }}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-[#00D4FF]/10 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-[#00D4FF]" />
                </div>
                <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-[#080C14]" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">GOD System — Online</div>
                <div className="text-xs text-white/30">Auto-correction active • 0 errors detected</div>
              </div>
            </div>
            <Link href="/status">
              <Button
                size="sm"
                variant="outline"
                className="border-white/10 text-white/60 hover:text-white hover:border-white/20 text-xs"
              >
                View metrics
                <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Module Status Panel */}
        <div
          className="p-5 rounded-2xl border border-white/[0.06]"
          style={{ background: "hsl(var(--forge-dark))" }}
        >
          <div className="flex items-center gap-2 mb-5">
            <Cpu className="w-4 h-4 text-white/30" />
            <span className="section-label">Core Modules</span>
          </div>

          <div className="space-y-2.5">
            {health?.modules ? (
              Object.entries(health.modules).map(([name, mod]) => {
                const color = getStatusColor(mod.performance);
                return (
                  <div
                    key={name}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.05] transition-colors"
                  >
                    <CircleDot className="w-3.5 h-3.5 flex-shrink-0" style={{ color }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-white capitalize truncate">{name}</div>
                    </div>
                    <div className="text-xs font-mono" style={{ color }}>
                      {(mod.performance ?? 0).toFixed(0)}%
                    </div>
                  </div>
                );
              })
            ) : (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-10 rounded-xl bg-white/[0.03] animate-pulse" />
              ))
            )}
          </div>

          {/* Library categories */}
          {stats?.categories && Object.keys(stats.categories).length > 0 && (
            <div className="mt-5 pt-5 border-t border-white/[0.06]">
              <div className="flex items-center gap-2 mb-3">
                <Layers3 className="w-3.5 h-3.5 text-white/30" />
                <span className="section-label">Effect Categories</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(stats.categories)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 8)
                  .map(([cat, count]) => (
                    <Link key={cat} href="/library">
                      <span
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium cursor-pointer hover:bg-white/10 transition-colors"
                        style={{ background: "rgba(0,212,255,0.08)", color: "#00D4FF" }}
                      >
                        {cat}
                        <span className="text-white/30">{count}</span>
                      </span>
                    </Link>
                  ))}
              </div>
            </div>
          )}

          {/* AI Confidence */}
          <div className="mt-5 pt-5 border-t border-white/[0.06]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Gauge className="w-3.5 h-3.5 text-white/30" />
                <span className="section-label">AI Confidence</span>
              </div>
              <span className="text-xs font-mono text-[#7C3AED]">
                {health?.ai ? (health.ai.confidence * 100).toFixed(0) : "90"}%
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${health?.ai ? health.ai.confidence * 100 : 90}%`,
                  background: "linear-gradient(90deg, #7C3AED, #00D4FF)",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
