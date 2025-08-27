import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Upload from "@/pages/upload";
import Generator from "@/pages/generator";
import Library from "@/pages/library";
import Preview from "@/pages/preview";
import Status from "@/pages/status";
import Modules from "@/pages/modules";
import Navigation from "@/components/ui/navigation";
import ParticleBackground from "@/components/ui/particle-background";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/upload" component={Upload} />
      <Route path="/generator" component={Generator} />
      <Route path="/library" component={Library} />
      <Route path="/preview" component={Preview} />
      <Route path="/status" component={Status} />
      <Route path="/modules" component={Modules} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="bg-forge-black text-forge-white min-h-screen relative overflow-x-hidden">
          <ParticleBackground />
          <Navigation />
          <main className="pt-24 pb-16 px-4 max-w-7xl mx-auto relative z-10">
            <Router />
          </main>
          <footer className="text-center py-8 text-forge-white/50 text-sm relative z-10">
            <p className="mb-2">EffectForge AI - Digital Forge of the Future</p>
            <p className="text-xs opacity-0 hover:opacity-100 transition-opacity">
              Autonomous • Modular • God-Level Performance
            </p>
          </footer>
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
