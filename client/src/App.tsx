import React from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Upload from './pages/upload';
import Preview from './pages/preview';
import Status from './pages/status';
import Expansion from './pages/expansion';
import NotFound from './pages/not-found';
import Dashboard from "@/pages/dashboard";
import Generator from "@/pages/generator";
import Library from "@/pages/library";
import Modules from "@/pages/modules";
import Studio from "@/pages/studio";
import ExportStudio from "@/pages/export-studio";
import Navigation from "@/components/ui/navigation";
import ParticleBackground from "@/components/ui/particle-background";
import { useEffect } from "react";

// Global error handler
const useGlobalErrorHandler = () => {
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      // Prevent the default browser behavior
      event.preventDefault();
    };

    const handleError = (event: ErrorEvent) => {
      console.error('Global error:', event.error);
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);
};


function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/generator" component={Generator} />
      <Route path="/library" component={Library} />
      <Route path="/preview" component={Preview} />
      <Route path="/status" component={Status} />
      <Route path="/modules" component={Modules} />
      <Route path="/expansion" component={Expansion} />
      <Route path="/studio" component={Studio} />
      <Route path="/export" component={ExportStudio} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useGlobalErrorHandler();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="bg-forge-black text-forge-white min-h-screen flex">
          <ParticleBackground />
          <Navigation />
          {/* Main content — offset by sidebar width on large screens */}
          <div className="flex-1 flex flex-col min-h-screen lg:ml-[240px] transition-all duration-300 relative z-10">
            <main className="flex-1 px-6 py-8 max-w-6xl w-full mx-auto">
              <Router />
            </main>
            <footer className="text-center py-6 text-forge-white/30 text-xs border-t border-white/[0.04]">
              <p>EffectForge AI &mdash; Digital Forge of the Future &mdash; GOD Level Performance</p>
            </footer>
          </div>
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;