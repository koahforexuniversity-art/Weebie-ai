export type AgentId =
  | "orchestrator"
  | "video-intel"
  | "requirements"
  | "design-system"
  | "architecture"
  | "frontend"
  | "backend"
  | "qa"
  | "refinement"
  | "collab"
  | "github"
  | "cloud-deploy"
  | "self-host"
  | "cicd";

export type AgentDefinition = {
  id: AgentId;
  label: string;
  emoji: string;
  color: string;
  summary: string;
  model: "orchestrator" | "reasoner" | "coder" | "fast" | "vision" | "video";
};

export const AGENTS: Record<AgentId, AgentDefinition> = {
  orchestrator: {
    id: "orchestrator",
    label: "Orchestrator",
    emoji: "🧠",
    color: "#a855f7",
    summary: "Routes work across the swarm, holds shared memory.",
    model: "orchestrator",
  },
  "video-intel": {
    id: "video-intel",
    label: "Video Intelligence",
    emoji: "🎞️",
    color: "#f472b6",
    summary: "Frame/audio analysis → Framer Motion specs.",
    model: "video",
  },
  requirements: {
    id: "requirements",
    label: "Requirements & Research",
    emoji: "🔎",
    color: "#38bdf8",
    summary: "Clarifies goals, audiences, competitors.",
    model: "reasoner",
  },
  "design-system": {
    id: "design-system",
    label: "Design System",
    emoji: "🎨",
    color: "#fb7185",
    summary: "Generates tokens, motion, adaptive themes.",
    model: "reasoner",
  },
  architecture: {
    id: "architecture",
    label: "Architecture",
    emoji: "🏗️",
    color: "#f59e0b",
    summary: "Routes, data models, service boundaries.",
    model: "reasoner",
  },
  frontend: {
    id: "frontend",
    label: "Frontend Coder",
    emoji: "⚛️",
    color: "#22d3ee",
    summary: "Motion-first React + Tailwind components.",
    model: "coder",
  },
  backend: {
    id: "backend",
    label: "Backend Coder",
    emoji: "🧩",
    color: "#34d399",
    summary: "APIs, Prisma, integrations.",
    model: "coder",
  },
  qa: {
    id: "qa",
    label: "QA & Polish",
    emoji: "🛡️",
    color: "#fde047",
    summary: "Accessibility, regressions, flow validation.",
    model: "reasoner",
  },
  refinement: {
    id: "refinement",
    label: "Autonomous Refinement",
    emoji: "🌀",
    color: "#c084fc",
    summary: "Self-iterates until acceptance criteria pass.",
    model: "reasoner",
  },
  collab: {
    id: "collab",
    label: "Collab & Conflict",
    emoji: "🤝",
    color: "#60a5fa",
    summary: "Live sync, suggestion merging.",
    model: "fast",
  },
  github: {
    id: "github",
    label: "GitHub Agent",
    emoji: "🐙",
    color: "#f472b6",
    summary: "Repo creation, commits, PRs.",
    model: "fast",
  },
  "cloud-deploy": {
    id: "cloud-deploy",
    label: "Cloud Deploy",
    emoji: "☁️",
    color: "#38bdf8",
    summary: "Vercel / Netlify / Cloudflare automation.",
    model: "fast",
  },
  "self-host": {
    id: "self-host",
    label: "Self-Host",
    emoji: "🐳",
    color: "#22d3ee",
    summary: "Docker + nginx + run scripts.",
    model: "coder",
  },
  cicd: {
    id: "cicd",
    label: "CI/CD",
    emoji: "⚙️",
    color: "#facc15",
    summary: "GitHub Actions, preview envs.",
    model: "fast",
  },
};

export const AGENT_LIST = Object.values(AGENTS);
