"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";

const words = ["Text.", "Voice.", "Images.", "Video.", "Intent."];

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden pt-40 pb-28">
      <div className="aurora" aria-hidden />
      <div className="absolute inset-0 holo-grid opacity-70" aria-hidden />

      <div className="relative mx-auto max-w-6xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.24em] text-cyan-300"
        >
          <span className="size-1.5 rounded-full bg-cyan-400 shadow-[0_0_12px_var(--color-neon-cyan)]" />
          autonomous · multimodal · collaborative
        </motion.div>

        <h1 className="mx-auto max-w-5xl text-balance bg-gradient-to-br from-white via-fuchsia-100 to-cyan-200 bg-clip-text text-5xl font-semibold leading-[1.05] text-transparent md:text-7xl">
          Forge full-stack web apps from{" "}
          <span className="inline-flex h-[1.1em] overflow-hidden align-bottom">
            <motion.span
              className="flex flex-col"
              animate={{ y: ["0%", "-20%", "-40%", "-60%", "-80%"] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            >
              {[...words, words[0]].map((w, i) => (
                <span
                  key={i}
                  className="block bg-gradient-to-r from-fuchsia-400 via-violet-300 to-cyan-300 bg-clip-text text-transparent"
                >
                  {w}
                </span>
              ))}
            </motion.span>
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="mx-auto mt-7 max-w-2xl text-lg text-slate-300"
        >
          ForgeAgent v4 is a sci-fi developer control room. A swarm of autonomous agents
          collaborates with your team in real time — reading your videos, sketching
          your designs, writing the code, and self-deploying the result.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.7 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          <Button asChild size="lg">
            <Link href="/sign-up">
              Enter the Control Room <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <a href="#video">
              <Play className="size-4" /> Watch video-to-site
            </a>
          </Button>
        </motion.div>

        <HeroOrbital />
      </div>
    </section>
  );
}

function HeroOrbital() {
  const rings = [0, 1, 2];
  return (
    <div className="relative mx-auto mt-20 h-[420px] w-full max-w-4xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        className="glass scanlines relative mx-auto h-full w-full rounded-3xl p-6"
      >
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="size-2 rounded-full bg-rose-400" />
          <span className="size-2 rounded-full bg-amber-400" />
          <span className="size-2 rounded-full bg-emerald-400" />
          <span className="ml-3 font-mono">forge://control-room/session-42</span>
        </div>
        <div className="mt-6 grid grid-cols-12 gap-4">
          <div className="col-span-3 space-y-2 text-xs font-mono text-slate-400">
            <div className="text-cyan-300">// agents online</div>
            {["🧠 Orchestrator", "🎞️ Video-Intel", "🎨 Design-System", "⚛️ Frontend", "🐙 GitHub", "☁️ Cloud-Deploy"].map(
              (a, i) => (
                <motion.div
                  key={a}
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 2.4, delay: i * 0.2, repeat: Infinity }}
                  className="flex items-center gap-2 rounded-md border border-white/5 bg-black/30 px-2 py-1"
                >
                  <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                  {a}
                </motion.div>
              ),
            )}
          </div>
          <div className="col-span-6 relative overflow-hidden rounded-xl border border-white/10 bg-black/40">
            <div className="absolute inset-0 grid place-items-center">
              {rings.map((r) => (
                <motion.div
                  key={r}
                  className="absolute rounded-full border border-fuchsia-400/30"
                  style={{ width: 160 + r * 90, height: 160 + r * 90 }}
                  animate={{ rotate: r % 2 === 0 ? 360 : -360 }}
                  transition={{ duration: 18 + r * 8, repeat: Infinity, ease: "linear" }}
                />
              ))}
              <motion.div
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="grid size-28 place-items-center rounded-full bg-gradient-to-br from-fuchsia-500 via-violet-500 to-cyan-400 text-slate-950 shadow-[0_0_60px_-10px_rgba(168,85,247,0.9)]"
              >
                <span className="font-mono text-xs">SWARM</span>
              </motion.div>
            </div>
          </div>
          <div className="col-span-3 space-y-2 text-xs font-mono text-slate-400">
            <div className="text-fuchsia-300">// live log</div>
            {[
              "video-intel: parsed 42 interactions",
              "design-system: emitted 128 tokens",
              "frontend: wrote hero.tsx",
              "qa: ✔ a11y pass",
              "github: pushed main@a1b2c",
              "cloud-deploy: ✨ live",
            ].map((l, i) => (
              <motion.div
                key={l}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + i * 0.25 }}
                className="truncate rounded-md border border-white/5 bg-black/30 px-2 py-1"
              >
                {l}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
