"use client";
import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Download,
  GitBranch,
  Headphones,
  Rocket,
  Sparkles,
  UserPlus,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useBroadcastEvent } from "@/liveblocks.config";
import { DeploymentHub } from "@/components/deployment/DeploymentHub";
import { AgentHuddle } from "@/components/agents/AgentHuddle";
import { VersionHistory } from "@/components/builder/VersionHistory";

export function BuilderTopBar({ projectName }: { projectName: string }) {
  const [autopilot, setAutopilot] = useState(false);
  const [deployOpen, setDeployOpen] = useState(false);
  const [huddleOpen, setHuddleOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const broadcast = useBroadcastEvent();

  const handleAutopilot = () => {
    setAutopilot((a) => !a);
    broadcast({
      type: "agent-log",
      agent: "orchestrator",
      message: autopilot ? "autopilot paused" : "autopilot engaged — swarm dispatching",
    });
    toast(autopilot ? "Autopilot paused" : "Autopilot engaged", {
      description: autopilot
        ? "Agents are on standby."
        : "The swarm will self-iterate until acceptance criteria pass.",
    });
  };

  return (
    <header className="flex items-center gap-2 border-b border-white/5 bg-[#05060a]/80 px-3 py-2 backdrop-blur">
      <Button asChild size="icon" variant="ghost">
        <Link href="/dashboard" aria-label="Back to dashboard">
          <ArrowLeft className="size-4" />
        </Link>
      </Button>
      <div className="flex items-center gap-2 text-sm">
        <span className="font-mono text-fuchsia-300">forge://</span>
        <span className="font-medium">{projectName}</span>
        <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[10px] text-cyan-300">
          live
        </span>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <motion.button
          onClick={handleAutopilot}
          whileTap={{ scale: 0.96 }}
          className={`relative inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium transition ${
            autopilot
              ? "bg-gradient-to-r from-fuchsia-500 to-cyan-400 text-slate-950 shadow-[0_0_30px_-6px_rgba(168,85,247,0.9)]"
              : "border border-white/10 bg-white/5 text-slate-200 hover:border-fuchsia-400/50"
          }`}
        >
          <AnimatePresence mode="wait">
            {autopilot ? (
              <motion.span
                key="on"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
              >
                <Sparkles className="size-3.5" />
              </motion.span>
            ) : (
              <motion.span
                key="off"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
              >
                <Wand2 className="size-3.5" />
              </motion.span>
            )}
          </AnimatePresence>
          Autopilot {autopilot ? "ON" : "OFF"}
        </motion.button>

        <Button variant="secondary" size="sm" onClick={() => setHuddleOpen(true)}>
          <Headphones className="size-3.5" /> Huddle
        </Button>
        <Button variant="secondary" size="sm" onClick={() => setHistoryOpen(true)}>
          <GitBranch className="size-3.5" /> History
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => toast("Invite link copied (stub)")}
        >
          <UserPlus className="size-3.5" /> Invite
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => toast("Export stub — exports zip in M3")}
        >
          <Download className="size-3.5" /> Export
        </Button>
        <Button size="sm" onClick={() => setDeployOpen(true)}>
          <Rocket className="size-3.5" /> Deploy
        </Button>
      </div>

      <DeploymentHub
        open={deployOpen}
        onClose={() => setDeployOpen(false)}
        projectName={projectName}
      />
      <AgentHuddle
        open={huddleOpen}
        onClose={() => setHuddleOpen(false)}
        defaultTopic={`Review the autopilot plan for ${projectName}`}
      />
      <VersionHistory open={historyOpen} onClose={() => setHistoryOpen(false)} />
    </header>
  );
}
