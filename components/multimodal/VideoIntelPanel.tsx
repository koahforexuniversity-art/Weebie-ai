"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Film, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useMultimodalStore } from "@/stores/multimodal-store";
import { cn } from "@/lib/utils";

export function VideoIntelPanel() {
  const videos = useMultimodalStore((s) => s.videos);
  const activeId = useMultimodalStore((s) => s.activeVideoId);
  const setActive = useMultimodalStore((s) => s.setActiveVideo);
  const active = videos.find((v) => v.id === activeId) ?? videos[0];

  if (videos.length === 0) {
    return (
      <div className="grid h-full place-items-center p-6 text-center text-xs text-slate-500">
        <div>
          <Film className="mx-auto mb-3 size-6 text-fuchsia-400/60" />
          Drop a screen recording or competitor demo above. Video Intelligence
          will extract motion, components, and Framer Motion TSX.
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex gap-1 overflow-x-auto border-b border-white/5 bg-black/30 px-2 py-1">
        {videos.map((v) => (
          <button
            key={v.id}
            onClick={() => setActive(v.id)}
            className={cn(
              "flex items-center gap-2 rounded-full border border-white/5 px-3 py-1 text-xs transition",
              active?.id === v.id
                ? "bg-gradient-to-r from-fuchsia-500/30 to-cyan-400/20 text-white"
                : "text-slate-400 hover:text-white",
            )}
          >
            <StatusDot status={v.status} />
            <span className="max-w-[14ch] truncate">{v.name}</span>
          </button>
        ))}
      </div>

      {active && (
        <div className="flex-1 overflow-y-auto p-3 text-xs">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id + active.status}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <video src={active.url} controls className="w-full rounded-lg border border-white/10" />

              {active.status === "analyzing" && (
                <div className="flex items-center gap-2 rounded-lg border border-fuchsia-500/30 bg-fuchsia-500/10 p-3 text-fuchsia-200">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="size-4" />
                  </motion.span>
                  Video Intelligence is analyzing frames and audio…
                </div>
              )}

              {active.status === "failed" && (
                <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-rose-200">
                  {active.error}
                </div>
              )}

              {active.spec && (
                <>
                  <SpecSection title="Segments">
                    <ul className="space-y-1">
                      {active.spec.segments.map((s, i) => (
                        <li key={i} className="rounded border border-white/5 bg-black/40 px-2 py-1">
                          <span className="font-mono text-cyan-300">
                            {fmt(s.tStart)}–{fmt(s.tEnd)}
                          </span>{" "}
                          · {s.summary}
                        </li>
                      ))}
                    </ul>
                  </SpecSection>

                  <SpecSection title="Components + motion">
                    <ul className="space-y-1">
                      {active.spec.components.map((c, i) => (
                        <li key={i} className="rounded border border-white/5 bg-black/40 px-2 py-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-fuchsia-200">{c.name}</span>
                            <span className="text-[10px] text-slate-500">{c.role}</span>
                          </div>
                          <div className="mt-1 font-mono text-[10px] text-slate-400">
                            {c.motion.easing} · {c.motion.durationMs}ms
                            {c.motion.springStiffness != null &&
                              ` · spring(${c.motion.springStiffness}/${c.motion.springDamping})`}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </SpecSection>

                  <CodeBlock label="Framer Motion TSX" code={active.spec.framerMotionTsx} />
                  <CodeBlock label="Reduced-motion variant" code={active.spec.reducedMotionTsx} />

                  {active.spec.transcript && (
                    <SpecSection title="Transcript">
                      <div className="max-h-32 overflow-y-auto rounded border border-white/5 bg-black/40 px-2 py-1 text-slate-400">
                        {active.spec.transcript}
                      </div>
                    </SpecSection>
                  )}
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function StatusDot({ status }: { status: string }) {
  const color =
    status === "ready"
      ? "#22d3ee"
      : status === "analyzing"
        ? "#f472b6"
        : status === "failed"
          ? "#f43f5e"
          : "#64748b";
  return (
    <span
      className="size-1.5 rounded-full"
      style={{ background: color, boxShadow: `0 0 6px ${color}` }}
    />
  );
}

function SpecSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1 text-[10px] uppercase tracking-[0.2em] text-slate-500">{title}</div>
      {children}
    </div>
  );
}

function CodeBlock({ label, code }: { label: string; code: string }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-slate-500">
        {label}
        <button
          onClick={() => {
            navigator.clipboard.writeText(code);
            toast("Copied");
          }}
          className="flex items-center gap-1 text-fuchsia-300 hover:text-fuchsia-200"
        >
          <Copy className="size-3" /> copy
        </button>
      </div>
      <pre className="max-h-60 overflow-auto rounded-lg border border-white/10 bg-black/60 p-3 font-mono text-[11px] leading-relaxed text-slate-200">
        {code}
      </pre>
    </div>
  );
}

function fmt(ms: number) {
  const s = ms / 1000;
  return `${s.toFixed(2)}s`;
}
