"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Headphones, Mic, Volume2, VolumeX, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AGENTS, AGENT_LIST, type AgentId } from "@/lib/agents/registry";
import { cn } from "@/lib/utils";

type Turn = { id: string; agent: AgentId; text: string; done: boolean };

const DEFAULT_ROSTER: AgentId[] = [
  "orchestrator",
  "architecture",
  "design-system",
  "frontend",
  "qa",
];

/**
 * Agent Huddle — streams a scripted multi-agent conversation with optional
 * voice synthesis via the Web Speech API. Voices are hashed per-agent so the
 * same agent always sounds the same across huddles.
 */
export function AgentHuddle({
  open,
  onClose,
  defaultTopic = "Review the autopilot plan for the current project",
}: {
  open: boolean;
  onClose: () => void;
  defaultTopic?: string;
}) {
  const [topic, setTopic] = useState(defaultTopic);
  const [roster, setRoster] = useState<AgentId[]>(DEFAULT_ROSTER);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [status, setStatus] = useState<"idle" | "streaming">("idle");
  const [speak, setSpeak] = useState(false);
  const [activeSpeaker, setActiveSpeaker] = useState<AgentId | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [turns]);

  useEffect(() => () => abortRef.current?.abort(), []);

  function toggleAgent(id: AgentId) {
    setRoster((r) =>
      r.includes(id) ? r.filter((x) => x !== id) : r.length < 6 ? [...r, id] : r,
    );
  }

  function speakText(text: string, agentId: AgentId) {
    if (!speak || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) return;
    const u = new SpeechSynthesisUtterance(text);
    let hash = 0;
    for (const c of agentId) hash = (hash * 31 + c.charCodeAt(0)) >>> 0;
    u.voice = voices[hash % voices.length];
    u.rate = 1.05;
    u.pitch = 0.9 + ((hash % 40) / 100);
    window.speechSynthesis.speak(u);
  }

  async function start() {
    if (!topic.trim() || roster.length < 2) return;
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    setTurns([]);
    setStatus("streaming");

    try {
      const res = await fetch("/api/huddle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, participants: roster, turns: 8 }),
        signal: ac.signal,
      });
      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = "";
      let current: Turn | null = null;
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const frames = buf.split("\n\n");
        buf = frames.pop() ?? "";
        for (const f of frames) {
          if (!f.startsWith("data:")) continue;
          const e = JSON.parse(f.slice(5).trim());
          if (e.done) {
            setStatus("idle");
            setActiveSpeaker(null);
            return;
          }
          if (e.error) throw new Error(e.error);
          if (e.delta) {
            if (!current || current.agent !== e.agent) {
              current = {
                id: Math.random().toString(36).slice(2),
                agent: e.agent,
                text: "",
                done: false,
              };
              setActiveSpeaker(e.agent);
              setTurns((t) => [...t, current!]);
            }
            current.text += e.delta;
            setTurns((t) =>
              t.map((x) => (x.id === current!.id ? { ...x, text: current!.text } : x)),
            );
          }
          if (e.done === true && e.full && current) {
            speakText(e.full, e.agent);
            setTurns((t) =>
              t.map((x) => (x.id === current!.id ? { ...x, done: true } : x)),
            );
            current = null;
          }
        }
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      console.error(err);
    } finally {
      setStatus("idle");
      setActiveSpeaker(null);
    }
  }

  function stop() {
    abortRef.current?.abort();
    setStatus("idle");
    setActiveSpeaker(null);
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-center bg-black/70 backdrop-blur"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="glass scanlines flex w-full max-w-3xl flex-col overflow-hidden rounded-2xl"
          >
            <header className="flex items-center justify-between border-b border-white/5 px-5 py-3">
              <div className="flex items-center gap-2">
                <Headphones className="size-4 text-fuchsia-300" />
                <div>
                  <div className="text-xs uppercase tracking-[0.24em] text-cyan-300">
                    agent huddle
                  </div>
                  <h2 className="mt-0.5 text-lg font-semibold">Simulated swarm discussion</h2>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setSpeak((s) => !s)}
                  className={cn(
                    "grid size-8 place-items-center rounded-full transition",
                    speak
                      ? "bg-fuchsia-500/20 text-fuchsia-200"
                      : "text-slate-400 hover:bg-white/5 hover:text-white",
                  )}
                  title={speak ? "Mute voices" : "Enable voices"}
                >
                  {speak ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
                </button>
                <button
                  onClick={onClose}
                  className="grid size-8 place-items-center rounded-full text-slate-400 hover:bg-white/5 hover:text-white"
                  aria-label="Close"
                >
                  <X className="size-4" />
                </button>
              </div>
            </header>

            <div className="grid gap-4 p-5 md:grid-cols-[1fr_1.4fr]">
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-[10px] uppercase tracking-[0.2em] text-slate-500">
                    Topic
                  </label>
                  <textarea
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    rows={3}
                    className="w-full resize-none rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none focus:border-fuchsia-400/60"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] uppercase tracking-[0.2em] text-slate-500">
                    Participants ({roster.length}/6)
                  </label>
                  <div className="grid grid-cols-2 gap-1">
                    {AGENT_LIST.map((a) => {
                      const on = roster.includes(a.id);
                      return (
                        <button
                          key={a.id}
                          onClick={() => toggleAgent(a.id)}
                          className={cn(
                            "flex items-center gap-2 rounded-lg border px-2 py-1.5 text-left text-xs transition",
                            on
                              ? "border-fuchsia-400/50 bg-fuchsia-500/10 text-white"
                              : "border-white/5 bg-black/30 text-slate-400 hover:text-white",
                          )}
                        >
                          <span>{a.emoji}</span>
                          <span className="truncate">{a.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="flex gap-2">
                  {status === "idle" ? (
                    <Button onClick={start} disabled={roster.length < 2} className="flex-1">
                      <Mic className="size-3.5" /> Start huddle
                    </Button>
                  ) : (
                    <Button variant="outline" onClick={stop} className="flex-1">
                      Stop
                    </Button>
                  )}
                </div>
              </div>

              <div
                ref={scrollRef}
                className="relative max-h-[60vh] min-h-[280px] overflow-y-auto rounded-xl border border-white/10 bg-black/60 p-3"
              >
                {turns.length === 0 && (
                  <div className="grid h-full place-items-center text-xs text-slate-600">
                    // pick topic + roster, hit start
                  </div>
                )}
                <div className="space-y-3">
                  {turns.map((t) => {
                    const a = AGENTS[t.agent];
                    const isActive = activeSpeaker === t.agent && !t.done;
                    return (
                      <motion.div
                        key={t.id}
                        layout
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-2"
                      >
                        <motion.div
                          animate={isActive ? { scale: [1, 1.12, 1] } : { scale: 1 }}
                          transition={{ duration: 1, repeat: isActive ? Infinity : 0 }}
                          className="grid size-8 shrink-0 place-items-center rounded-lg"
                          style={{
                            background: `radial-gradient(circle at 30% 30%, ${a.color}66, transparent 75%)`,
                            boxShadow: isActive
                              ? `0 0 24px -4px ${a.color}`
                              : `0 0 10px -6px ${a.color}`,
                          }}
                        >
                          <span className="text-base">{a.emoji}</span>
                        </motion.div>
                        <div className="min-w-0 flex-1 rounded-lg border border-white/5 bg-black/40 p-2">
                          <div
                            className="text-[11px] font-medium"
                            style={{ color: a.color }}
                          >
                            {a.label}
                          </div>
                          <div className="mt-0.5 text-sm text-slate-200">{t.text || "…"}</div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
