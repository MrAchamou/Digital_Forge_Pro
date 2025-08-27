import { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Home, 
  Upload, 
  Wand2, 
  Database, 
  Eye, 
  BarChart3 
} from "lucide-react";

const navItems = [
  { path: "/", label: "Dashboard", icon: Home, shortLabel: "Home" },
  { path: "/upload", label: "Upload", icon: Upload, shortLabel: "Upload" },
  { path: "/generator", label: "Generator", icon: Wand2, shortLabel: "Gen" },
  { path: "/library", label: "Library", icon: Database, shortLabel: "Lib" },
  { path: "/preview", label: "Preview", icon: Eye, shortLabel: "View" },
  { path: "/status", label: "Status", icon: BarChart3, shortLabel: "Stats" },
];

export default function Navigation() {
  const [location] = useLocation();

  return (
    <nav className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 nav-floating rounded-full px-6 py-3 flex space-x-2 md:space-x-4">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location === item.path;
        
        return (
          <Link key={item.path} href={item.path}>
            <button
              className={cn(
                "nav-button px-3 md:px-4 py-2 rounded-full text-xs md:text-sm font-medium transition-all duration-300",
                isActive 
                  ? "active bg-gradient-to-r from-forge-cyan to-forge-electric text-white shadow-lg shadow-forge-cyan/25" 
                  : "hover:bg-white/10 hover:-translate-y-1"
              )}
              data-testid={`nav-button-${item.path === "/" ? "dashboard" : item.path.slice(1)}`}
            >
              <Icon className="w-4 h-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">{item.label}</span>
              <span className="sm:hidden">{item.shortLabel}</span>
            </button>
          </Link>
        );
      })}
    </nav>
  );
}
