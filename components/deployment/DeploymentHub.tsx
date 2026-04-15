"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  Cloud,
  Container,
  Download,
  Globe,
  Rocket,
  RotateCcw,
  X,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useDeployStream } from "@/hooks/useDeployStream";
import type { DeployTarget } from "@/lib/deployment/swarm";
import { cn, slugify } from "@/lib/utils";

const TARGETS: { id: DeployTarget; label: string; Icon: typeof Cloud; note: string }[] = [
  { id: "vercel", label: "Vercel", Icon: Rocket, note: "GitHub → preview + prod" },
  { id: "netlify", label: "Netlify", Icon: Globe, note: "GitHub → edge functions" },
  { id: "cloudflare", label: "Cloudflare", Icon: Cloud, note: "Workers + Pages" },
  { id: "docker", label: "Self-host", Icon: Container, note: "Docker + nginx zip" },
];

export function DeploymentHub({
  open,
  onClose,
  projectName,
}: {
  open: boolean;
  onClose: () => void;
  projectName: string;
}) {
  const [target, setTarget] = useState<DeployTarget>("vercel");
  const [nameDraft, setNameDraft] = useState(slugify(projectName));
  const { logs, status, result, error, run, reset } = useDeployStream();
  const logEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) setNameDraft(slugify(projectName));
  }, [open, projectName]);

  useEffect(() => {
    logEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs.length]);

  async function downloadSelfHost() {
    const r = await fetch("/api/deploy/self-host", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectName: nameDraft }),
    });
    if (!r.ok) {
      toast.error("Self-host bundle failed");
      return;
    }
    const blob = await r.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${nameDraft}-selfhost.zip`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function launch() {
    if (target === "docker") {
      await downloadSelfHost();
      return;
    }
    run({ projectName: nameDraft, target });
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
            className="glass scanlines relative flex w-full max-w-3xl flex-col overflow-hidden rounded-2xl"
          >
            <header className="flex items-center justify-between border-b border-white/5 px-5 py-3">
              <div>
                <div className="text-xs uppercase tracking-[0.24em] text-cyan-300">
                  deployment swarm
                </div>
                <h2 className="mt-0.5 text-lg font-semibold">Deploy {projectName}</h2>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-1 text-slate-400 hover:bg-white/5 hover:text-white"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </header>

            <div className="grid gap-4 p-5 md:grid-cols-[1fr_1.2fr]">
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-[10px] uppercase tracking-[0.2em] text-slate-500">
                    Project slug
                  </label>
                  <input
                    value={nameDraft}
                    onChange={(e) => setNameDraft(slugify(e.target.value))}
                    className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 font-mono text-sm text-slate-100 outline-none focus:border-fuchsia-400/60"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-[10px] uppercase tracking-[0.2em] text-slate-500">
                    Target
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {TARGETS.map(({ id, label, Icon, note }) => (
                      <button
                        key={id}
                        onClick={() => setTarget(id)}
                        className={cn(
                          "relative overflow-hidden rounded-xl border p-3 text-left transition",
                          target === id
                            ? "border-fuchsia-400/60 bg-fuchsia-500/10 shadow-[0_0_24px_-8px_rgba(168,85,247,0.7)]"
                            : "border-white/10 bg-black/30 hover:border-white/25",
                        )}
                      >
                        <Icon className="mb-2 size-4 text-fuchsia-300" />
                        <div className="text-sm font-medium">{label}</div>
                        <div className="mt-0.5 text-[10px] text-slate-500">{note}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={launch}
                    disabled={status === "streaming" || !nameDraft}
                    className="flex-1"
                  >
                    {target === "docker" ? (
                      <>
                        <Download className="size-3.5" /> Download bundle
                      </>
                    ) : (
                      <>
                        <Rocket className="size-3.5" />
                        {status === "streaming" ? "Deploying…" : "Launch swarm"}
                      </>
                    )}
                  </Button>
                  {status !== "idle" && status !== "streaming" && (
                    <Button variant="ghost" size="sm" onClick={reset}>
                      <RotateCcw className="size-3.5" /> Reset
                    </Button>
                  )}
                </div>

                {result?.liveUrl && (
                  <a
                    href={result.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200 hover:bg-emerald-500/15"
                  >
                    <span className="truncate">{result.liveUrl}</span>
                    <CheckCircle2 className="size-4" />
                  </a>
                )}

                {error && (
                  <div className="flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-200">
                    <XCircle className="mt-0.5 size-4 shrink-0" /> {error}
                  </div>
                )}
              </div>

              <div className="min-h-[280px] rounded-xl border border-white/10 bg-black/60 p-3 font-mono text-[11px]">
                {logs.length === 0 && status === "idle" && (
                  <div className="grid h-full place-items-center text-slate-600">
                    // swarm idle — hit launch
                  </div>
                )}
                {logs.length === 0 && status === "streaming" && (
                  <div className="text-slate-400">spinning up agents…</div>
                )}
                <div className="space-y-1">
                  {logs.map((l) => (
                    <motion.div
                      key={l.id}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={cn(
                        "grid grid-cols-[110px_16px_1fr] items-start gap-2 rounded border border-white/5 bg-black/40 px-2 py-1",
                        l.phase === "error" && "border-rose-500/30 text-rose-200",
                        l.phase === "end" && "border-emerald-500/20",
                      )}
                    >
                      <span className="text-fuchsia-300">{l.agent}</span>
                      <PhaseGlyph phase={l.phase} />
                      <span className="text-slate-200">{l.message}</span>
                    </motion.div>
                  ))}
                  <div ref={logEnd} />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function PhaseGlyph({ phase }: { phase: string }) {
  if (phase === "end") return <CheckCircle2 className="size-3.5 text-emerald-400" />;
  if (phase === "error") return <XCircle className="size-3.5 text-rose-400" />;
  return (
    <motion.span
      animate={{ rotate: 360 }}
      transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
      className="block size-3 rounded-full border border-fuchsia-400 border-t-transparent"
    />
  );
}
