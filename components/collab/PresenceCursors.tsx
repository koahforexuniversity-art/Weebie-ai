"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { useOthers, useUpdateMyPresence } from "@/liveblocks.config";

/**
 * Full-viewport cursor layer for the Builder. Humans + AI agents show up as
 * neon comets with trailing labels.
 */
export function PresenceCursors() {
  const others = useOthers();
  const update = useUpdateMyPresence();

  useEffect(() => {
    const onMove = (e: PointerEvent) =>
      update({ cursor: { x: e.clientX, y: e.clientY } });
    const onLeave = () => update({ cursor: null });
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, [update]);

  return (
    <div className="pointer-events-none fixed inset-0 z-40">
      <AnimatePresence>
        {others.map((o) => {
          if (!o.presence?.cursor) return null;
          const color = o.info?.color ?? "#a855f7";
          return (
            <motion.div
              key={o.connectionId}
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              style={{
                position: "absolute",
                left: o.presence.cursor.x,
                top: o.presence.cursor.y,
                color,
              }}
            >
              <svg width="20" height="22" viewBox="0 0 20 22" aria-hidden>
                <path
                  d="M2 2 L18 10 L10 12 L7 20 Z"
                  fill={color}
                  stroke="white"
                  strokeWidth="1.2"
                />
              </svg>
              <div
                className="ml-4 -mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium text-slate-950 shadow-lg"
                style={{ background: color }}
              >
                {o.info?.kind === "ai" && <span className="text-[9px]">🤖</span>}
                {o.info?.name ?? "guest"}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
