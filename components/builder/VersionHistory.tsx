"use client";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Clock, GitBranch, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVersionStore } from "@/stores/version-store";
import { lineDiff } from "@/lib/diff";
import { cn } from "@/lib/utils";

export function VersionHistory({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const snapshots = useVersionStore((s) => s.snapshots);
  const { compareFromId, compareToId, setCompare } = useVersionStore();
  const [activeFile, setActiveFile] = useState<string | null>(null);

  const from = snapshots.find((s) => s.id === compareFromId);
  const to = snapshots.find((s) => s.id === compareToId);

  const files = useMemo(() => {
    if (!from || !to) return [];
    const all = new Set([...Object.keys(from.files), ...Object.keys(to.files)]);
    return [...all].sort();
  }, [from, to]);

  const diff = useMemo(() => {
    if (!from || !to || !activeFile) return [];
    return lineDiff(from.files[activeFile] ?? "", to.files[activeFile] ?? "");
  }, [from, to, activeFile]);

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
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            onClick={(e) => e.stopPropagation()}
            className="glass scanlines flex h-[80vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl"
          >
            <header className="flex items-center justify-between border-b border-white/5 px-5 py-3">
              <div className="flex items-center gap-2">
                <GitBranch className="size-4 text-fuchsia-300" />
                <div>
                  <div className="text-xs uppercase tracking-[0.24em] text-cyan-300">
                    version history
                  </div>
                  <h2 className="mt-0.5 text-lg font-semibold">Visual diff across snapshots</h2>
                </div>
              </div>
              <button onClick={onClose} className="rounded-full p-1 text-slate-400 hover:bg-white/5">
                <X className="size-4" />
              </button>
            </header>

            <div className="grid h-full grid-cols-[220px_220px_1fr] overflow-hidden">
              <Column title="Snapshots">
                {snapshots.length === 0 && <Empty>No snapshots yet. Use ⌘S to capture one.</Empty>}
                {snapshots.map((s) => (
                  <SnapshotPick
                    key={s.id}
                    snap={s}
                    selectedAs={
                      s.id === compareToId ? "to" : s.id === compareFromId ? "from" : null
                    }
                    onClick={() => {
                      // Click cycle: from → to → none
                      if (compareToId === s.id) setCompare(compareFromId, null);
                      else if (compareFromId === s.id) setCompare(null, compareToId);
                      else setCompare(compareToId, s.id);
                    }}
                  />
                ))}
              </Column>

              <Column title={from && to ? "Files" : "Pick two snapshots"}>
                {files.map((f) => (
                  <button
                    key={f}
                    onClick={() => setActiveFile(f)}
                    className={cn(
                      "w-full truncate rounded px-2 py-1 text-left font-mono text-[11px]",
                      activeFile === f
                        ? "bg-fuchsia-500/15 text-fuchsia-100"
                        : "text-slate-400 hover:text-white",
                    )}
                  >
                    {f}
                  </button>
                ))}
              </Column>

              <div className="overflow-auto bg-black/60 p-4 font-mono text-[12px]">
                {diff.length === 0 && (
                  <div className="grid h-full place-items-center text-slate-600">
                    // pick from + to + file to see diff
                  </div>
                )}
                {diff.map((d, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex gap-2 whitespace-pre rounded px-2",
                      d.type === "add" && "bg-emerald-500/10 text-emerald-200",
                      d.type === "remove" && "bg-rose-500/10 text-rose-200 line-through decoration-rose-400/50",
                      d.type === "equal" && "text-slate-400",
                    )}
                  >
                    <span className="w-4 shrink-0 text-slate-600">
                      {d.type === "add" ? "+" : d.type === "remove" ? "−" : " "}
                    </span>
                    <span>{d.line || " "}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Column({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col overflow-hidden border-r border-white/5 bg-[#060810]">
      <div className="border-b border-white/5 px-3 py-2 text-[10px] uppercase tracking-[0.22em] text-slate-500">
        {title}
      </div>
      <div className="flex-1 space-y-0.5 overflow-y-auto p-2">{children}</div>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div className="p-3 text-xs text-slate-500">{children}</div>;
}

function SnapshotPick({
  snap,
  selectedAs,
  onClick,
}: {
  snap: { id: string; label: string; createdAt: number; createdBy: string };
  selectedAs: "from" | "to" | null;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group flex w-full items-center gap-2 rounded-lg border px-2 py-1.5 text-left transition",
        selectedAs === "to"
          ? "border-fuchsia-400/60 bg-fuchsia-500/10"
          : selectedAs === "from"
            ? "border-cyan-400/60 bg-cyan-500/10"
            : "border-white/5 bg-black/30 hover:border-white/25",
      )}
    >
      <Clock className="size-3.5 text-slate-500" />
      <div className="min-w-0 flex-1">
        <div className="truncate text-xs font-medium text-slate-100">{snap.label}</div>
        <div className="text-[10px] text-slate-500">
          {new Date(snap.createdAt).toLocaleTimeString()} · {snap.createdBy}
        </div>
      </div>
      {selectedAs && (
        <span
          className={cn(
            "rounded-full px-1.5 text-[9px] uppercase tracking-wider",
            selectedAs === "to" ? "bg-fuchsia-500/30 text-fuchsia-100" : "bg-cyan-500/30 text-cyan-100",
          )}
        >
          {selectedAs}
        </span>
      )}
    </button>
  );
}
