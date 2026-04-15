"use client";
import { Laptop, Smartphone, Tablet, RefreshCcw, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { useBuilderStore } from "@/stores/builder-store";
import { cn } from "@/lib/utils";
import { useState } from "react";

const FRAME_SIZES = {
  desktop: { w: "100%", label: "1440" },
  tablet: { w: "768px", label: "768" },
  mobile: { w: "390px", label: "390" },
} as const;

export function LivePreview({ url = "about:blank" }: { url?: string }) {
  const { previewDevice, setPreviewDevice } = useBuilderStore();
  const [bust, setBust] = useState(0);
  const size = FRAME_SIZES[previewDevice];

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-1 border-b border-white/5 bg-black/30 px-3 py-1.5 text-xs">
        <div className="flex items-center gap-0.5 rounded-full border border-white/10 bg-black/40 p-0.5">
          {[
            { id: "desktop", Icon: Laptop },
            { id: "tablet", Icon: Tablet },
            { id: "mobile", Icon: Smartphone },
          ].map(({ id, Icon }) => (
            <button
              key={id}
              onClick={() => setPreviewDevice(id as keyof typeof FRAME_SIZES)}
              className={cn(
                "grid size-7 place-items-center rounded-full transition",
                previewDevice === id
                  ? "bg-gradient-to-br from-fuchsia-500 to-cyan-400 text-slate-950"
                  : "text-slate-400 hover:text-white",
              )}
            >
              <Icon className="size-3.5" />
            </button>
          ))}
        </div>
        <span className="ml-3 font-mono text-slate-500">{size.label}px</span>
        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={() => setBust((b) => b + 1)}
            className="grid size-7 place-items-center rounded-full text-slate-400 hover:bg-white/5 hover:text-white"
            aria-label="Reload preview"
          >
            <RefreshCcw className="size-3.5" />
          </button>
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="grid size-7 place-items-center rounded-full text-slate-400 hover:bg-white/5 hover:text-white"
          >
            <ExternalLink className="size-3.5" />
          </a>
        </div>
      </div>
      <div className="relative flex-1 overflow-auto bg-[#020308] p-4">
        <div className="absolute inset-0 holo-grid opacity-40" aria-hidden />
        <motion.div
          key={previewDevice}
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto h-full overflow-hidden rounded-xl border border-white/10 bg-white shadow-[0_20px_80px_-20px_rgba(168,85,247,0.4)]"
          style={{ width: size.w, maxWidth: "100%" }}
        >
          <iframe
            key={bust}
            title="Live preview"
            src={url}
            className="h-full w-full"
            sandbox="allow-scripts allow-same-origin allow-forms"
          />
        </motion.div>
      </div>
    </div>
  );
}
