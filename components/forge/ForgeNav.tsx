"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { useUser, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export function ForgeNav() {
  const { isSignedIn } = useUser();
  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-4 inset-x-4 z-50 flex justify-center"
    >
      <div className="glass scanlines relative flex w-full max-w-6xl items-center justify-between rounded-full px-5 py-2.5">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <motion.span
            aria-hidden
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
            className="grid size-7 place-items-center rounded-full bg-gradient-to-br from-fuchsia-400 to-cyan-400 text-slate-950"
          >
            <Sparkles className="size-4" />
          </motion.span>
          <span className="tracking-tight">
            Forge<span className="text-fuchsia-400">Agent</span>
            <span className="ml-1 rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] font-mono text-cyan-300">
              v4
            </span>
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm text-slate-300">
          <a href="#video" className="hover:text-white transition-colors">Video-to-Site</a>
          <a href="#collab" className="hover:text-white transition-colors">Live Collab</a>
          <a href="#swarm" className="hover:text-white transition-colors">Agent Swarm</a>
          <a href="#deploy" className="hover:text-white transition-colors">Self-Deploy</a>
        </nav>
        <div className="flex items-center gap-2">
          {!isSignedIn ? (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/sign-in">Sign in</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/sign-up">Launch Forge</Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="secondary" size="sm">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <UserButton />
            </>
          )}
        </div>
      </div>
    </motion.header>
  );
}
