import { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import Logo from "./logo";
import {
  Home,
  Wand2,
  Database,
  Eye,
  BarChart3,
  Settings,
  Brain,
  Mail,
  Package,
  ChevronLeft,
  ChevronRight,
  Activity,
  Layers,
} from "lucide-react";

const navItems = [
  { path: "/", label: "Command Center", icon: Home, color: "#00D4FF" },
  { path: "/generator", label: "God Generator", icon: Wand2, color: "#7C3AED" },
  { path: "/library", label: "Neural Library", icon: Database, color: "#00D4FF" },
  { path: "/studio", label: "Générateur Signatures", icon: Mail, color: "#FF006E" },
  { path: "/export", label: "Export Studio", icon: Package, color: "#00b894" },
  { path: "/pipeline", label: "Livraisons clients", icon: Layers, color: "#f59e0b" },
  { path: "/expansion", label: "AI Expansion", icon: Brain, color: "#7C3AED" },
  { path: "/preview", label: "Reality Preview", icon: Eye, color: "#00D4FF" },
  { path: "/status", label: "System Matrix", icon: BarChart3, color: "#FF006E" },
  { path: "/modules", label: "Core Modules", icon: Settings, color: "#FFB800" },
];

export default function Navigation() {
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-[90] lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile toggle button */}
      <button
        className="fixed top-4 left-4 z-[100] lg:hidden p-2.5 rounded-xl bg-[#0D1117] border border-white/10 text-white"
        onClick={() => setMobileOpen(!mobileOpen)}
        data-testid="nav-mobile-toggle"
      >
        <div className="w-5 h-0.5 bg-[#00D4FF] mb-1" />
        <div className="w-5 h-0.5 bg-[#7C3AED] mb-1" />
        <div className="w-5 h-0.5 bg-[#FF006E]" />
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full z-[95] flex flex-col transition-all duration-300 ease-in-out",
          "bg-[#080C14] border-r border-white/[0.06]",
          collapsed ? "w-[72px]" : "w-[240px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
        style={{
          boxShadow: "4px 0 24px rgba(0,0,0,0.5)",
        }}
      >
        {/* Right gradient line */}
        <div
          className="absolute right-0 top-0 bottom-0 w-[1px]"
          style={{
            background: "linear-gradient(180deg, transparent 0%, #00D4FF33 30%, #7C3AED33 70%, transparent 100%)",
          }}
        />

        {/* Logo */}
        <div className={cn("px-4 py-5 border-b border-white/[0.06]", collapsed ? "px-2" : "px-5")}>
          {collapsed ? (
            <Logo size="sm" showText={false} />
          ) : (
            <Logo size="sm" showText={true} />
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden">
          <div className="space-y-1 px-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;

              return (
                <Link key={item.path} href={item.path}>
                  <button
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                      "text-sm font-medium",
                      isActive
                        ? "text-white"
                        : "text-white/40 hover:text-white/80"
                    )}
                    style={
                      isActive
                        ? {
                            background: `linear-gradient(135deg, ${item.color}18, ${item.color}08)`,
                            borderLeft: `2px solid ${item.color}`,
                          }
                        : {}
                    }
                    data-testid={`nav-button-${item.path === "/" ? "dashboard" : item.path.slice(1)}`}
                  >
                    {/* Active glow */}
                    {isActive && (
                      <div
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 rounded-r-full"
                        style={{ background: item.color, boxShadow: `0 0 8px ${item.color}` }}
                      />
                    )}

                    <div
                      className={cn(
                        "flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 transition-all duration-200",
                        isActive ? "shadow-lg" : "group-hover:scale-110"
                      )}
                      style={
                        isActive
                          ? { background: `${item.color}22`, boxShadow: `0 0 12px ${item.color}44` }
                          : { background: "rgba(255,255,255,0.04)" }
                      }
                    >
                      <Icon
                        className="w-4 h-4"
                        style={{ color: isActive ? item.color : "inherit" }}
                      />
                    </div>

                    {!collapsed && (
                      <span className="truncate">{item.label}</span>
                    )}

                    {/* Tooltip when collapsed */}
                    {collapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-[#0D1117] border border-white/10 rounded-md text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                        {item.label}
                      </div>
                    )}
                  </button>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* System status indicator */}
        {!collapsed && (
          <div className="px-4 py-4 border-t border-white/[0.06]">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03]">
              <Activity className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-[10px] text-green-400 font-semibold tracking-wider">SYSTÈME ACTIF</div>
                <div className="text-[10px] text-white/30 truncate">10 templates · 55 effets</div>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
            </div>
          </div>
        )}

        {/* Collapse toggle */}
        <button
          className={cn(
            "absolute -right-3 top-1/2 -translate-y-1/2",
            "w-6 h-6 rounded-full bg-[#0D1117] border border-white/10",
            "flex items-center justify-center text-white/50 hover:text-white",
            "transition-colors hidden lg:flex"
          )}
          onClick={() => setCollapsed(!collapsed)}
          data-testid="nav-collapse-toggle"
        >
          {collapsed ? (
            <ChevronRight className="w-3 h-3" />
          ) : (
            <ChevronLeft className="w-3 h-3" />
          )}
        </button>
      </aside>
    </>
  );
}
