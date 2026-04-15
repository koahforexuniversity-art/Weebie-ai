"use client";
import { useEffect, useRef } from "react";
import { useEventListener } from "@/liveblocks.config";
import { AGENTS } from "@/lib/agents/registry";

/**
 * Canvas particle field that lives behind the Control Room. Each agent event
 * spawns a short-lived drifting glow colored by that agent's palette entry —
 * so visual energy in the UI tracks real swarm activity.
 */
type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
};

export function SwarmParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);

  useEventListener(({ event }) => {
    if (event.type !== "agent-activity" && event.type !== "agent-log") return;
    const agent = AGENTS[event.agent as keyof typeof AGENTS];
    if (!agent) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const burst = event.type === "agent-activity" ? 18 : 6;
    for (let i = 0; i < burst; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.4 + Math.random() * 1.4;
      particles.current.push({
        x: rect.width / 2 + (Math.random() - 0.5) * 40,
        y: rect.height / 2 + (Math.random() - 0.5) * 40,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 140 + Math.random() * 120,
        color: agent.color,
        size: 0.8 + Math.random() * 2.2,
      });
    }
    if (particles.current.length > 600) {
      particles.current.splice(0, particles.current.length - 600);
    }
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const list = particles.current;
      for (let i = list.length - 1; i >= 0; i--) {
        const p = list[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.985;
        p.vy *= 0.985;
        p.life += 1;
        const t = 1 - p.life / p.maxLife;
        if (t <= 0) {
          list.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = Math.min(t, 0.9);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * t, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
