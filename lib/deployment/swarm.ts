import { createRepoWithFiles } from "@/lib/github";
import { deployFromRepo, getDeployment } from "./vercel";
import { createSite } from "./netlify";
import { createPagesProject, triggerPagesDeployment } from "./cloudflare";
import {
  renderCompose,
  renderDockerfile,
  renderNginx,
  renderRunScript,
} from "./docker";

export type DeployTarget = "vercel" | "netlify" | "cloudflare" | "docker";

export type SwarmEvent =
  | { agent: string; phase: "start" | "end" | "error"; message: string; data?: unknown }
  | { agent: "done"; phase: "end"; message: string; data: DeployResult };

export type DeployInput = {
  projectName: string;
  target: DeployTarget;
  files: { path: string; content: string }[];
  envVars?: Record<string, string>;
};

export type DeployResult = {
  target: DeployTarget;
  repoUrl?: string;
  liveUrl?: string;
  previewUrl?: string;
  artifacts?: Record<string, string>;
};

type Emit = (e: SwarmEvent) => void;

/**
 * Runs the full deployment swarm sequentially, emitting progress events.
 * Each agent in the chain (github → cicd → cloud-deploy | self-host) reports
 * start/end so the Deployment Hub can animate.
 */
export async function runDeploySwarm(input: DeployInput, emit: Emit): Promise<DeployResult> {
  if (input.target === "docker") return runSelfHost(input, emit);

  emit({ agent: "github", phase: "start", message: "creating repository" });
  const repo = await createRepoWithFiles({
    name: input.projectName,
    description: `ForgeAgent v4 · ${input.projectName}`,
    files: input.files,
    privateRepo: true,
  });
  emit({
    agent: "github",
    phase: "end",
    message: `repo ready: ${repo.url}`,
    data: repo,
  });

  emit({ agent: "cicd", phase: "start", message: "wiring CI workflow" });
  // CI file was included in files[] by the caller; here we just confirm.
  const hasCi = input.files.some((f) => f.path.startsWith(".github/workflows/"));
  emit({
    agent: "cicd",
    phase: "end",
    message: hasCi ? "workflow detected" : "no workflow in tree — skipping",
  });

  emit({ agent: "cloud-deploy", phase: "start", message: `deploying to ${input.target}` });
  try {
    if (input.target === "vercel") {
      const deploy = await deployFromRepo({
        name: input.projectName,
        repo: { owner: repo.owner, name: repo.name },
        envVars: input.envVars,
      });
      // Best-effort poll for READY — bounded so we never block deploy UI.
      const final = await pollVercel(deploy.id, emit).catch(() => null);
      const liveUrl = final?.url ? `https://${final.url}` : `https://${deploy.url}`;
      emit({ agent: "cloud-deploy", phase: "end", message: `live: ${liveUrl}` });
      return { target: "vercel", repoUrl: repo.url, liveUrl, previewUrl: liveUrl };
    }
    if (input.target === "netlify") {
      const site = await createSite(input.projectName, repo);
      emit({
        agent: "cloud-deploy",
        phase: "end",
        message: `netlify site: ${site.ssl_url}`,
      });
      return { target: "netlify", repoUrl: repo.url, liveUrl: site.ssl_url };
    }
    if (input.target === "cloudflare") {
      const project = await createPagesProject({
        name: input.projectName,
        repo: { owner: repo.owner, name: repo.name },
      });
      const deploy = await triggerPagesDeployment(project.result.name);
      const liveUrl = deploy.result.url ?? `https://${project.result.subdomain}`;
      emit({ agent: "cloud-deploy", phase: "end", message: `cloudflare: ${liveUrl}` });
      return { target: "cloudflare", repoUrl: repo.url, liveUrl };
    }
    emit({
      agent: "cloud-deploy",
      phase: "end",
      message: `${input.target} adapter not yet wired — repo pushed`,
    });
    return { target: input.target, repoUrl: repo.url };
  } catch (err) {
    emit({ agent: "cloud-deploy", phase: "error", message: String(err) });
    throw err;
  }
}

async function pollVercel(id: string, emit: Emit) {
  const start = Date.now();
  while (Date.now() - start < 90_000) {
    const d = (await getDeployment(id)) as { readyState?: string; url?: string };
    emit({
      agent: "cloud-deploy",
      phase: "start",
      message: `vercel: ${d.readyState ?? "queued"}`,
    });
    if (d.readyState === "READY" || d.readyState === "ERROR") return d;
    await new Promise((r) => setTimeout(r, 3000));
  }
  return null;
}

function runSelfHost(input: DeployInput, emit: Emit): DeployResult {
  emit({ agent: "self-host", phase: "start", message: "emitting Docker artefacts" });
  const run = renderRunScript();
  const artifacts: Record<string, string> = {
    Dockerfile: renderDockerfile(),
    "docker-compose.yml": renderCompose(),
    "nginx.conf": renderNginx(),
    "run.sh": run.sh,
    "run.ps1": run.ps1,
  };
  emit({
    agent: "self-host",
    phase: "end",
    message: `${Object.keys(artifacts).length} files ready for download`,
  });
  return { target: "docker", artifacts };
}
