"use client";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBuilderStore } from "@/stores/builder-store";

export function EditorTabs() {
  const { openFiles, activeFile, setActiveFile, closeFile } = useBuilderStore();
  if (openFiles.length === 0) return null;

  return (
    <div className="flex items-stretch overflow-x-auto border-b border-white/5 bg-black/30">
      {openFiles.map((path) => {
        const active = path === activeFile;
        return (
          <div
            key={path}
            className={cn(
              "group relative flex items-center gap-2 border-r border-white/5 px-3 py-2 text-xs transition-colors",
              active
                ? "bg-[#0b0d14] text-fuchsia-100"
                : "text-slate-400 hover:text-slate-200",
            )}
          >
            <button onClick={() => setActiveFile(path)} className="font-mono">
              {path.split("/").pop()}
            </button>
            <button
              onClick={() => closeFile(path)}
              aria-label={`Close ${path}`}
              className="rounded p-0.5 opacity-60 hover:bg-white/10 hover:opacity-100"
            >
              <X className="size-3" />
            </button>
            {active && (
              <span className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-fuchsia-400 via-violet-400 to-cyan-400" />
            )}
          </div>
        );
      })}
    </div>
  );
}
