"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { AGENT_LIST, type AgentId } from "@/lib/agents/registry";
import { useEventListener } from "@/liveblocks.config";
import { useBuilderStore } from "@/stores/builder-store";
import { cn } from "@/lib/utils";
import { CollaboratorAvatars } from "@/components/collab/CollaboratorAvatars";
import { VideoIntelPanel } from "@/components/multimodal/VideoIntelPanel";
import { SwarmParticles } from "@/components/forge/SwarmParticles";

type AgentStatus = "idle" | "thinking" | "active" | "done";

type LogEntry = {
  id: string;
  agent: string;
  message: string;
  level: "info" | "warn" | "error";
  t: number;
};

export function ControlRoom() {
  const { controlRoomTab, setControlRoomTab } = useBuilderStore();
  const [statuses, setStatuses] = useState<Record<string, AgentStatus>>({});
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const logScrollRef = useRef<HTMLDivElement>(null);

  useEventListener(({ event }) => {
    if (event.type === "agent-activity") {
      setStatuses((s) => ({
        ...s,
        [event.agent]:
          event.phase === "start" ? "thinking" : event.phase === "end" ? "done" : "active",
      }));
    }
    if (event.type === "agent-log") {
      setLogs((l) =>
        [
          ...l,
          {
            id: Math.random().toString(36).slice(2),
            agent: event.agent,
            message: event.message,
            level: event.level ?? "info",
            t: Date.now(),
          },
        ].slice(-80),
      );
    }
  });

  useEffect(() => {
    logScrollRef.current?.scrollTo({
      top: logScrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [logs.length]);

  return (
    <div className="flex h-full flex-col border-l border-white/5 bg-[#060810]">
      <div className="flex items-center justify-between border-b border-white/5 px-3 py-2">
        <div className="flex items-center gap-1 rounded-full border border-white/10 bg-black/40 p-0.5 text-xs">
          {(["swarm", "intel", "logs", "presence"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setControlRoomTab(t)}
              className={cn(
                "rounded-full px-3 py-1 capitalize transition",
                controlRoomTab === t
                  ? "bg-gradient-to-r from-fuchsia-500 to-cyan-400 text-slate-950"
                  : "text-slate-400 hover:text-white",
              )}
            >
              {t}
            </button>
          ))}
        </div>
        <CollaboratorAvatars />
      </div>

      <AnimatePresence mode="wait">
        {controlRoomTab === "swarm" && (
          <motion.div
            key="swarm"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="relative flex-1 overflow-hidden"
          >
            <SwarmGrid statuses={statuses} />
          </motion.div>
        )}

        {controlRoomTab === "intel" && (
          <motion.div
            key="intel"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex-1 overflow-hidden"
          >
            <VideoIntelPanel />
          </motion.div>
        )}

        {controlRoomTab === "logs" && (
          <motion.div
            key="logs"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            ref={logScrollRef}
            className="flex-1 space-y-1 overflow-y-auto p-3 font-mono text-[11px]"
          >
            {logs.length === 0 && (
              <div className="text-slate-600">// no agent activity yet.</div>
            )}
            {logs.map((l) => (
              <div
                key={l.id}
                className={cn(
                  "grid grid-cols-[80px_1fr] gap-2 rounded border border-white/5 bg-black/30 px-2 py-1",
                  l.level === "error" && "border-rose-500/30 text-rose-200",
                  l.level === "warn" && "border-amber-500/30 text-amber-200",
                )}
              >
                <span className="text-fuchsia-300">{l.agent}</span>
                <span className="text-slate-300">{l.message}</span>
              </div>
            ))}
          </motion.div>
        )}

        {controlRoomTab === "presence" && (
          <motion.div
            key="presence"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex-1 overflow-y-auto p-4 text-xs text-slate-400"
          >
            <p className="mb-3">
              Humans and AI agents sharing this room. @mention any agent in chat
              to hand off a task.
            </p>
            <CollaboratorAvatars />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SwarmGrid({ statuses }: { statuses: Record<string, AgentStatus> }) {
  return (
    <div className="relative h-full">
      <div className="absolute inset-0 holo-grid opacity-60" aria-hidden />
      <SwarmParticles />
      <div className="relative grid h-full grid-cols-2 gap-2 overflow-y-auto p-3">
        {AGENT_LIST.map((a) => {
          const s = statuses[a.id] ?? "idle";
          return <HolographicAgent key={a.id} agent={a} status={s} />;
        })}
      </div>
    </div>
  );
}

function HolographicAgent({
  agent,
  status,
}: {
  agent: (typeof AGENT_LIST)[number];
  status: AgentStatus;
}) {
  const glow =
    status === "thinking"
      ? { duration: 1.4, scale: [1, 1.05, 1] }
      : status === "active"
        ? { duration: 0.9, scale: [1, 1.08, 1] }
        : { duration: 3, scale: [1, 1.02, 1] };

  return (
    <div className="glass relative overflow-hidden rounded-xl p-3">
      <div className="flex items-center gap-2">
        <motion.div
          animate={{ scale: glow.scale }}
          transition={{ duration: glow.duration, repeat: Infinity }}
          className="grid size-8 place-items-center rounded-lg text-lg"
          style={{
            background: `radial-gradient(circle at 30% 30%, ${agent.color}66, transparent 75%)`,
            boxShadow:
              status === "idle"
                ? `0 0 10px -4px ${agent.color}`
                : `0 0 24px -4px ${agent.color}`,
          }}
        >
          {agent.emoji}
        </motion.div>
        <div className="min-w-0">
          <div className="truncate text-xs font-medium">{agent.label}</div>
          <div className="text-[10px] uppercase tracking-wide text-slate-500">
            {status}
          </div>
        </div>
        <StatusDot status={status} color={agent.color} />
      </div>
      {status === "thinking" && (
        <motion.div
          className="mt-2 h-0.5 w-full overflow-hidden rounded-full bg-white/5"
          aria-hidden
        >
          <motion.div
            className="h-full w-1/3 rounded-full"
            style={{ background: agent.color }}
            animate={{ x: ["-100%", "300%"] }}
            transition={{ duration: 1.3, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      )}
    </div>
  );
}

function StatusDot({ status, color }: { status: AgentStatus; color: string }) {
  return (
    <span
      className="ml-auto size-2 rounded-full"
      style={{
        background: status === "idle" ? "#334155" : color,
        boxShadow: status === "idle" ? "none" : `0 0 8px ${color}`,
      }}
    />
  );
}
