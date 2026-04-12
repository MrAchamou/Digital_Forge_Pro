import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  opacity: number;
  life: number;
  maxLife: number;
  pulsePhase: number;
}

const PALETTE = [
  "#00d4ff",
  "#0ea5e9",
  "#0284c7",
  "#06b6d4",
  "#38bdf8",
  "#7dd3fc",
];

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticle = (forced?: Partial<Particle>): Particle => {
      const maxLife = Math.random() * 300 + 150;
      return {
        x: forced?.x ?? Math.random() * canvas.width,
        y: forced?.y ?? Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2.5 + 0.5,
        color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
        opacity: Math.random() * 0.5 + 0.1,
        life: forced?.life ?? Math.random() * maxLife,
        maxLife,
        pulsePhase: Math.random() * Math.PI * 2,
      };
    };

    const initParticles = () => {
      particlesRef.current = [];
      const count = Math.min(80, Math.floor((canvas.width * canvas.height) / 14000));
      for (let i = 0; i < count; i++) {
        particlesRef.current.push(createParticle());
      }
    };

    const updateParticles = () => {
      particlesRef.current.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        p.pulsePhase += 0.02;

        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;
        if (p.y < -10) p.y = canvas.height + 10;
        if (p.y > canvas.height + 10) p.y = -10;

        if (p.life <= 0) {
          particlesRef.current[idx] = createParticle({ life: p.maxLife });
        }
      });
    };

    const drawConnections = () => {
      const pts = particlesRef.current;
      const maxDist = 120;
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.12;
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.strokeStyle = pts[i].color;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.stroke();
            ctx.restore();
          }
        }
      }
    };

    const renderParticles = () => {
      const pts = particlesRef.current;
      pts.forEach((p) => {
        const lifeRatio = p.life / p.maxLife;
        const fade = lifeRatio < 0.15 ? lifeRatio / 0.15 : lifeRatio > 0.85 ? (1 - lifeRatio) / 0.15 : 1;
        const pulse = 1 + 0.25 * Math.sin(p.pulsePhase);
        const alpha = p.opacity * fade * pulse;

        ctx.save();
        ctx.globalAlpha = Math.min(alpha, 0.85);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = p.size * 4;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    };

    const drawAurora = () => {
      const t = timeRef.current * 0.0006;
      const w = canvas.width;
      const h = canvas.height;

      const drawBlob = (
        cx: number,
        cy: number,
        r: number,
        r2: number,
        g2: number,
        b2: number,
        alpha: number
      ) => {
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        grad.addColorStop(0, `rgba(${r2},${g2},${b2},${alpha})`);
        grad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.save();
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(cx, cy, r, r * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      };

      drawBlob(
        w * (0.15 + 0.1 * Math.sin(t)),
        h * (0.4 + 0.15 * Math.cos(t * 0.7)),
        w * 0.28, 15, 76, 117, 0.22
      );
      drawBlob(
        w * (0.82 + 0.08 * Math.cos(t * 0.8)),
        h * (0.7 + 0.12 * Math.sin(t * 1.1)),
        w * 0.22, 15, 60, 180, 0.14
      );
      drawBlob(
        w * (0.5 + 0.12 * Math.sin(t * 0.5)),
        h * (0.15 + 0.1 * Math.cos(t * 0.9)),
        w * 0.2, 6, 182, 212, 0.12
      );
    };

    const drawScanLine = () => {
      const scanY = (timeRef.current * 0.4) % (canvas.height + 60) - 30;
      const grad = ctx.createLinearGradient(0, scanY - 20, 0, scanY + 20);
      grad.addColorStop(0, "rgba(0, 212, 255, 0)");
      grad.addColorStop(0.5, "rgba(0, 212, 255, 0.03)");
      grad.addColorStop(1, "rgba(0, 212, 255, 0)");
      ctx.save();
      ctx.fillStyle = grad;
      ctx.fillRect(0, scanY - 20, canvas.width, 40);
      ctx.restore();
    };

    const animate = () => {
      timeRef.current++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawAurora();
      drawScanLine();
      drawConnections();
      updateParticles();
      renderParticles();
      animationRef.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    initParticles();
    animate();

    const handleResize = () => {
      resizeCanvas();
      initParticles();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: "transparent" }}
    />
  );
}

// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion
// Auto-fixed: bracket_completion