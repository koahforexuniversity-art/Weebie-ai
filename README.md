# ForgeAgent v4

> Autonomous · multi-modal · collaborative AI web development platform.
> Text, voice, images, and video in → production Next.js 16 app, self-deployed, out.

ForgeAgent v4 is a sci-fi developer control room. A swarm of autonomous agents
(Orchestrator, Video Intelligence, Design System, Frontend/Backend Coders, QA,
Refinement, GitHub, Cloud Deploy, Self-Host, CI/CD, Collab/Conflict) works
alongside humans in a shared Liveblocks room — watching your videos, writing
tokens, committing code, and shipping live URLs.

---

## Tech stack

| Layer            | Tech |
| ---------------- | ---- |
| Framework        | **Next.js 16.2** (App Router · Turbopack · Cache Components) |
| Language         | TypeScript (strict) |
| UI               | Tailwind v4 · Shadcn primitives · Radix · Framer Motion 12 |
| Auth             | Clerk (Organizations / Teams) |
| Realtime         | Liveblocks + Yjs + y-monaco |
| DB / ORM         | Supabase Postgres · Prisma 7 |
| AI               | Vercel AI SDK v6 · Anthropic · Google (multimodal video) · OpenAI fallback |
| Code editor      | Monaco + Yjs CRDT bindings |
| Deploy targets   | Vercel · Netlify · Cloudflare · Docker / self-host |
| Repo automation  | Octokit (GitHub App) |

---

## Getting started

```bash
npm install
cp .env.example .env.local
# fill in Clerk, Supabase, Liveblocks, Anthropic, GitHub, Vercel keys
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

Open http://localhost:3000.

---

## Folder structure

```
forgeagent-v4/
├── app/
│   ├── (auth)/            Clerk sign-in / sign-up
│   ├── (dashboard)/       project list + collab/deploy badges
│   ├── (builder)/         Liveblocks RoomProvider shell (M2)
│   ├── api/liveblocks/    auth webhook for Liveblocks sessions
│   ├── api/agents/        orchestrator SSE stream
│   └── api/deploy/        GitHub + Vercel + Docker endpoints
├── components/
│   ├── ui/                shadcn-flavored primitives
│   ├── forge/             landing + nav + hero
│   ├── agents/            holographic swarm UI (M2)
│   ├── builder/           Yjs Monaco + split-pane (M2)
│   ├── preview/           live preview + video replay (M2)
│   ├── multimodal/        record/upload + transcription (M3)
│   ├── collab/            presence / cursors / comments (M2)
│   └── deployment/        deploy hub (M4)
├── lib/
│   ├── ai/                providers · prompts · orchestrator
│   ├── agents/            agent registry (14 agents)
│   ├── deployment/        vercel + docker artefact generators
│   ├── github.ts          Octokit wrappers
│   ├── liveblocks.ts      server + browser clients + types
│   ├── prisma.ts
│   └── supabase.ts
├── prisma/schema.prisma   User, Org, Project, VideoAsset,
│                          CollaborationRoom, DeploymentLog, AgentRun
└── proxy.ts               Clerk-protected route matcher (Next 16 name)
```

---

## Milestone status

- **M1 · Scaffold + landing** ✅ *this commit* — deps installed, Clerk +
  Liveblocks + AI SDK + GitHub + Vercel wired, immersive landing page with
  aurora hero, agent swarm grid, deployment log showcase, production build green.
- **M2 · Builder core** — Liveblocks RoomProvider, Yjs-Monaco split pane, live
  preview, holographic Control Room with presence.
- **M3 · Multi-modal input** — video record/upload, AI SDK v6 multimodal
  streams, Video Intelligence Agent end-to-end.
- **M4 · Deployment swarm** — live GitHub repo creation, Vercel streaming build
  logs, rollback, one-click Docker self-host bundle.

---

## Agents

| id              | role                                            |
| --------------- | ----------------------------------------------- |
| orchestrator    | conducts the swarm, holds shared memory         |
| video-intel     | frames + audio → Framer Motion specs            |
| requirements    | clarifies goals, audiences, competitors         |
| design-system   | tokens, motion, adaptive/a11y themes            |
| architecture    | routes, boundaries, data model                  |
| frontend        | motion-first React + Tailwind                   |
| backend         | Prisma, routes, ai-sdk streams                  |
| qa              | a11y, perf, flow validation                     |
| refinement      | loops until acceptance criteria pass            |
| collab          | real-time conflict resolution                   |
| github          | repo + commits + PRs                            |
| cloud-deploy    | Vercel / Netlify / Cloudflare                   |
| self-host       | Dockerfile + compose + nginx                    |
| cicd            | GitHub Actions, preview envs                    |

Prompts live in `lib/ai/prompts.ts`; routing in `lib/ai/orchestrator.ts`.

---

## Next.js 16 notes

- `middleware.ts` → **`proxy.ts`** (new convention, used here).
- Async request APIs are mandatory: `await params`, `await cookies()`.
- Prisma 7 moves connection URLs out of `schema.prisma` into `prisma.config.ts`.
- Every agent pulls its model from `lib/ai/providers.ts` — swap regions, cost
  tiers, or fallbacks in one place.

---

© ForgeAgent v4. Forged by an autonomous swarm.
