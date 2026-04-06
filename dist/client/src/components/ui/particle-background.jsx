import { useEffect, useRef } from "react";
export default function ParticleBackground() {
    var canvasRef = useRef(null);
    var particlesRef = useRef([]);
    var animationRef = useRef();
    useEffect(function () {
        var canvas = canvasRef.current;
        if (!canvas)
            return;
        var ctx = canvas.getContext("2d");
        if (!ctx)
            return;
        var resizeCanvas = function () {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        var colors = ["#00d4ff", "#ff006e", "#ffbe0b", "#8338ec"];
        var createParticle = function () { return ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            size: Math.random() * 3 + 1,
            color: colors[Math.floor(Math.random() * colors.length)],
            opacity: Math.random() * 0.7 + 0.3,
            life: Math.random() * 200 + 100,
        }); };
        var initParticles = function () {
            particlesRef.current = [];
            for (var i = 0; i < 50; i++) {
                particlesRef.current.push(createParticle());
            }
        };
        var updateParticles = function () {
            particlesRef.current.forEach(function (particle, index) {
                particle.x += particle.vx;
                particle.y += particle.vy;
                particle.life--;
                // Wrap around screen
                if (particle.x < 0)
                    particle.x = canvas.width;
                if (particle.x > canvas.width)
                    particle.x = 0;
                if (particle.y < 0)
                    particle.y = canvas.height;
                if (particle.y > canvas.height)
                    particle.y = 0;
                // Regenerate particle if life is over
                if (particle.life <= 0) {
                    particlesRef.current[index] = createParticle();
                }
            });
        };
        var renderParticles = function () {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particlesRef.current.forEach(function (particle) {
                ctx.save();
                ctx.globalAlpha = particle.opacity * (particle.life / 200);
                ctx.fillStyle = particle.color;
                ctx.shadowColor = particle.color;
                ctx.shadowBlur = particle.size * 2;
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            });
        };
        var animate = function () {
            updateParticles();
            renderParticles();
            animationRef.current = requestAnimationFrame(animate);
        };
        resizeCanvas();
        initParticles();
        animate();
        var handleResize = function () {
            resizeCanvas();
            initParticles();
        };
        window.addEventListener("resize", handleResize);
        return function () {
            window.removeEventListener("resize", handleResize);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, []);
    return (<>
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" style={{
            background: "\n            radial-gradient(circle at 20% 50%, rgba(15, 76, 117, 0.3) 0%, transparent 50%),\n            radial-gradient(circle at 80% 80%, rgba(255, 0, 110, 0.2) 0%, transparent 50%),\n            radial-gradient(circle at 40% 20%, rgba(255, 190, 11, 0.2) 0%, transparent 50%)\n          ",
        }}/>
    </>);
}
