import Link from "next/link";
import { Plus, Rocket, Users } from "lucide-react";
import { ForgeNav } from "@/components/forge/ForgeNav";
import { Button } from "@/components/ui/button";

// Dashboard shell — projects list will be wired to Prisma in Milestone 2.
const placeholders = [
  { id: "aurora-studio", name: "Aurora Studio", status: "DEPLOYED", collab: 3 },
  { id: "nebula-shop", name: "Nebula Shop", status: "BUILDING", collab: 1 },
  { id: "helix-docs", name: "Helix Docs", status: "DRAFT", collab: 0 },
];

export default function DashboardPage() {
  return (
    <>
      <ForgeNav />
      <main className="relative mx-auto max-w-6xl px-6 pt-32 pb-20">
        <div className="aurora" aria-hidden />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold md:text-4xl">Projects</h1>
            <p className="mt-1 text-sm text-slate-400">
              Your active forges. Each is a collaborative Liveblocks room with an agent swarm on standby.
            </p>
          </div>
          <Button asChild>
            <Link href="/builder/new">
              <Plus className="size-4" /> New project
            </Link>
          </Button>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {placeholders.map((p) => (
            <Link
              key={p.id}
              href={`/builder/${p.id}`}
              className="glass scanlines group relative rounded-2xl p-5 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-glow-violet)]"
            >
              <div className="flex items-center justify-between">
                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[10px] text-cyan-300">
                  {p.status}
                </span>
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <Users className="size-3.5" /> {p.collab}
                </span>
              </div>
              <h3 className="mt-4 text-lg font-medium">{p.name}</h3>
              <div className="mt-6 flex items-center gap-2 text-xs text-slate-500">
                <Rocket className="size-3.5" /> open control room →
              </div>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
