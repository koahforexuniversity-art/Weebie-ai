"use client";
import { motion } from "framer-motion";
import { useOthers, useSelf } from "@/liveblocks.config";

export function CollaboratorAvatars() {
  const others = useOthers();
  const self = useSelf();
  const list = self ? [self, ...others] : others;

  return (
    <div className="flex -space-x-2">
      {list.slice(0, 6).map((p) => {
        const color = p.info?.color ?? "#a855f7";
        const isAi = p.info?.kind === "ai";
        return (
          <motion.div
            key={"connectionId" in p ? p.connectionId : "self"}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
            title={`${p.info?.name ?? "guest"}${isAi ? " · AI" : ""}`}
            className="relative grid size-7 place-items-center rounded-full border-2 text-[10px] font-semibold text-slate-950 ring-2 ring-[#05060a]"
            style={{
              borderColor: color,
              background: p.info?.avatar
                ? `url(${p.info.avatar}) center/cover`
                : color,
            }}
          >
            {!p.info?.avatar && (p.info?.name?.[0]?.toUpperCase() ?? "?")}
            {isAi && (
              <span className="absolute -bottom-1 -right-1 size-3 rounded-full bg-cyan-400 text-[8px] leading-3 text-slate-950">
                ★
              </span>
            )}
          </motion.div>
        );
      })}
      {list.length > 6 && (
        <div className="grid size-7 place-items-center rounded-full border-2 border-white/20 bg-black/60 text-[10px] text-slate-300 ring-2 ring-[#05060a]">
          +{list.length - 6}
        </div>
      )}
    </div>
  );
}
