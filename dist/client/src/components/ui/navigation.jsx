import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Home, Wand2, Database, Eye, BarChart3, Settings, Brain } from "lucide-react";
var navItems = [
    { path: "/", label: "Command Center", icon: Home, shortLabel: "Home" },
    { path: "/generator", label: "God Generator", icon: Wand2, shortLabel: "Gen" },
    { path: "/library", label: "Neural Library", icon: Database, shortLabel: "Lib" },
    { path: "/expansion", label: "AI Expansion", icon: Brain, shortLabel: "AI" },
    { path: "/preview", label: "Reality Preview", icon: Eye, shortLabel: "View" },
    { path: "/status", label: "System Matrix", icon: BarChart3, shortLabel: "Stats" },
    { path: "/modules", label: "Core Modules", icon: Settings, shortLabel: "Mods" },
];
export default function Navigation() {
    var location = useLocation()[0];
    return (<nav className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 nav-floating rounded-full px-6 py-3 flex space-x-2 md:space-x-4">
      {navItems.map(function (item) {
            var Icon = item.icon;
            var isActive = location === item.path;
            return (<Link key={item.path} href={item.path}>
            <button className={cn("nav-button px-3 md:px-4 py-2 rounded-full text-xs md:text-sm font-medium transition-all duration-300", isActive
                    ? "active bg-gradient-to-r from-forge-cyan to-forge-electric text-white shadow-lg shadow-forge-cyan/25"
                    : "hover:bg-white/10 hover:-translate-y-1")} data-testid={"nav-button-".concat(item.path === "/" ? "dashboard" : item.path.slice(1))}>
              <Icon className="w-4 h-4 mr-1 md:mr-2"/>
              <span className="hidden sm:inline">{item.label}</span>
              <span className="sm:hidden">{item.shortLabel}</span>
            </button>
          </Link>);
        })}
    </nav>);
}
