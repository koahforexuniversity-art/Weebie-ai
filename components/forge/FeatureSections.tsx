"use client";
import { motion } from "framer-motion";
import { Video, Users, Cpu, Rocket, Sparkles, ShieldCheck } from "lucide-react";
import { AGENT_LIST } from "@/lib/agents/registry";

function Section({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="relative mx-auto max-w-6xl px-6 py-28">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="mb-3 text-xs uppercase tracking-[0.28em] text-cyan-300/90">
          {eyebrow}
        </div>
        <h2 className="text-balance text-3xl font-semibold leading-tight md:text-5xl">
          {title}
        </h2>
        <div className="mt-10">{children}</div>
      </motion.div>
    </section>
  );
}

export function VideoSection() {
  return (
    <Section
      id="video"
      eyebrow="01 · Video Intelligence"
      title="Upload a screen recording. Get back real Framer Motion code."
    >
      <div className="grid gap-6 md:grid-cols-5">
        <div className="glass scanlines relative md:col-span-3 rounded-2xl p-6">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Video className="size-4 text-fuchsia-300" /> video-intel.agent
          </div>
          <pre className="mt-4 overflow-x-auto rounded-xl border border-white/10 bg-black/60 p-5 text-xs leading-relaxed text-slate-200">
{`{
  "segments": [
    { "tStart": 320, "tEnd": 860, "summary": "hero headline staggers in" },
    { "tStart": 900, "tEnd": 1380, "summary": "CTA pulse with spring bounce" }
  ],
  "framerMotion": "<motion.h1 initial={{y:24,opacity:0}} animate={{y:0,opacity:1}} transition={{type:'spring',stiffness:160,damping:18}} />"
}`}
          </pre>
        </div>
        <div className="glass md:col-span-2 flex flex-col justify-between rounded-2xl p-6">
          <div className="space-y-3">
            {[
              "Frame-by-frame analysis (Gemini 3.1 multi-modal)",
              "Audio transcription + speaker diarization",
              "Interaction extraction → motion tokens",
              "Respects prefers-reduced-motion by default",
            ].map((f) => (
              <div key={f} className="flex gap-3 text-sm text-slate-200">
                <Sparkles className="mt-0.5 size-4 shrink-0 text-cyan-300" />
                {f}
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-xl border border-fuchsia-400/30 bg-fuchsia-500/10 p-4 text-xs text-fuchsia-100">
            Record your competitor → ship the motion system in minutes.
          </div>
        </div>
      </div>
    </Section>
  );
}

export function CollabSection() {
  return (
    <Section
      id="collab"
      eyebrow="02 · Live Collaboration"
      title="Humans and AI agents in the same Liveblocks room."
    >
      <div className="grid gap-6 md:grid-cols-3">
        {[
          { icon: Users, title: "Presence + cursors", body: "See every teammate and every agent move in real time." },
          { icon: Cpu, title: "Yjs-powered Monaco", body: "CRDT-synced code editing, zero conflicts." },
          { icon: ShieldCheck, title: "Conflict agent", body: "Auto-merges suggestions with threaded review." },
        ].map((c, i) => (
          <motion.div
            key={c.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.5 }}
            className="glass group relative rounded-2xl p-6"
          >
            <c.icon className="size-5 text-fuchsia-300" />
            <h3 className="mt-4 text-lg font-medium">{c.title}</h3>
            <p className="mt-2 text-sm text-slate-400">{c.body}</p>
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity group-hover:opacity-100"
              style={{ boxShadow: "inset 0 0 0 1px rgba(168,85,247,0.4)" }}
            />
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

export function SwarmSection() {
  return (
    <Section
      id="swarm"
      eyebrow="03 · Intelligent Agent Swarm"
      title="Fourteen specialized agents, one orchestrator, zero handoff loss."
    >
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {AGENT_LIST.map((agent, i) => (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.04, duration: 0.4 }}
            whileHover={{ y: -4 }}
            className="glass relative flex items-start gap-3 rounded-xl p-4"
          >
            <div
              className="grid size-10 shrink-0 place-items-center rounded-lg"
              style={{
                background: `radial-gradient(circle at 30% 30%, ${agent.color}55, transparent 70%)`,
                boxShadow: `0 0 24px -8px ${agent.color}`,
              }}
            >
              <span className="text-xl">{agent.emoji}</span>
            </div>
            <div>
              <div className="text-sm font-medium">{agent.label}</div>
              <div className="mt-0.5 text-xs text-slate-400">{agent.summary}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

export function DeploySection() {
  return (
    <Section
      id="deploy"
      eyebrow="04 · Self-Deployment"
      title="GitHub → Vercel → live URL. With logs, previews, rollback."
    >
      <div className="glass scanlines relative rounded-2xl p-6">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Rocket className="size-4 text-cyan-300" />
          deployment-swarm · streaming
        </div>
        <div className="mt-5 grid gap-2 font-mono text-xs">
          {[
            ["github", "create repo forge/aurora-studio — ✓"],
            ["github", "push initial tree (182 files) — ✓"],
            ["cicd", "write .github/workflows/ci.yml — ✓"],
            ["cloud-deploy", "vercel: building — ▓▓▓▓▓▓░░"],
            ["cloud-deploy", "vercel: preview https://aurora-studio.vercel.app — ✓"],
            ["self-host", "Dockerfile + compose + nginx emitted — ✓"],
            ["qa", "flow validation pass — ✓"],
          ].map(([agent, log], i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="grid grid-cols-[140px_1fr] items-center gap-3 rounded-md border border-white/5 bg-black/30 px-3 py-1.5"
            >
              <span className="text-fuchsia-300">{agent}</span>
              <span className="text-slate-300">{log}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}

export function Footer() {
  return (
    <footer className="relative border-t border-white/10 py-10 text-center text-xs text-slate-500">
      <div className="mx-auto max-w-6xl px-6">
        ForgeAgent v4 · forged by an autonomous swarm · © {new Date().getFullYear()}
      </div>
    </footer>
  );
}
