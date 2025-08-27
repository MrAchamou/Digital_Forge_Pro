import { useEffect, useRef } from "react";
import { Brain } from "lucide-react";

export default function AIOrb() {
  const orbRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const orb = orbRef.current;
    if (!orb) return;

    // Add floating animation
    let startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const intensity = Math.sin(elapsed * 0.002) * 0.5 + 0.5; // 0 to 1
      
      orb.style.filter = `brightness(${100 + intensity * 20}%)`;
      orb.style.transform = `scale(${1 + intensity * 0.05})`;
      
      requestAnimationFrame(animate);
    };
    
    animate();
  }, []);

  return (
    <div className="relative">
      <div
        ref={orbRef}
        className="ai-orb relative w-28 h-28 rounded-full transition-all duration-300"
        style={{
          background: "radial-gradient(circle, #00d4ff 0%, #8338ec 50%, #ff006e 100%)",
        }}
      >
        {/* Rotating ring */}
        <div className="absolute -inset-2 rounded-full animate-spin-slow opacity-70">
          <div
            className="w-full h-full rounded-full"
            style={{
              background: "conic-gradient(from 0deg, #00d4ff, #8338ec, #ff006e, #ffbe0b, #00d4ff)",
            }}
          />
        </div>
        
        {/* Inner content */}
        <div className="absolute inset-2 rounded-full bg-forge-black/80 backdrop-blur-sm flex items-center justify-center z-10">
          <Brain className="w-8 h-8 text-white" />
        </div>
        
        {/* Pulsing overlay */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-forge-cyan/20 to-forge-plasma/20 animate-pulse" />
      </div>
    </div>
  );
}
