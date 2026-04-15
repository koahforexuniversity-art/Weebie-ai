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
cp .env.example .env            # fill every key — see table below

# Option A — local Postgres via Docker (recommended for dev)
docker compose up -d postgres
# DATABASE_URL=postgresql://forgeagent:forgeagent@localhost:5432/forgeagent
# DIRECT_URL=postgresql://forgeagent:forgeagent@localhost:5432/forgeagent

# Option B — Supabase / Neon: paste their connection strings into .env

npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

Open http://localhost:3000.

### Required environment keys

| Key | Where to get it | Required for |
| --- | --- | --- |
| `DATABASE_URL` / `DIRECT_URL` | Supabase / Neon Postgres connection strings | Prisma, all persisted state |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY` | [dashboard.clerk.com](https://dashboard.clerk.com) → API Keys | Auth, org membership |
| `LIVEBLOCKS_SECRET_KEY` | [liveblocks.io/dashboard](https://liveblocks.io/dashboard) → API Keys | Realtime presence + Yjs |
| `NEXT_PUBLIC_SUPABASE_URL` / `..._ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` | Supabase project settings | Video / image asset storage |
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) | Orchestrator, coder, huddle agents |
| `GOOGLE_GENERATIVE_AI_API_KEY` | [aistudio.google.com](https://aistudio.google.com/apikey) | Video intelligence, vision |
| `OPENAI_API_KEY` | [platform.openai.com](https://platform.openai.com/api-keys) | Whisper transcription, fallback |
| `VERCEL_TOKEN` (+ `VERCEL_TEAM_ID`) | [vercel.com/account/tokens](https://vercel.com/account/tokens) | Cloud deploy to Vercel |
| `NETLIFY_TOKEN` | Netlify → User settings → Personal access tokens | Cloud deploy to Netlify |
| `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` | Cloudflare → My Profile → API Tokens | Cloud deploy to Pages |
| `GITHUB_OAUTH_TOKEN` | GitHub → Settings → Developer settings → Personal access tokens (repo scope) | Repo + commit automation |

> **Model IDs note** — `lib/ai/providers.ts` references forward-looking IDs
> (`claude-opus-4-6`, `gemini-3.1-pro`). Swap to the latest available on your
> account if these error at runtime.

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

- **M1 · Scaffold + landing** ✅ — deps, Clerk + Liveblocks + AI SDK wired,
  aurora landing, swarm grid, green build.
- **M2 · Builder core** ✅ — Liveblocks RoomProvider, Yjs-Monaco split pane,
  live preview, holographic Control Room with presence.
- **M3 · Multi-modal input** ✅ — video record/upload, AI SDK v6 multimodal
  streams, Video Intelligence Agent (frames + motion specs).
- **M4 · Deployment swarm** ✅ — GitHub repo creation, Vercel / Netlify /
  Cloudflare Pages streaming deploys, Docker self-host zip.
- **Polish** ✅ — Agent Huddle voice layer (Web Speech), SwarmParticles canvas,
  LCS-based version history with visual diff.

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
