/**
 * Thin Cloudflare Pages API client. Creates a Pages project linked to a GitHub
 * repo and triggers a deployment; returns the preview URL once Cloudflare
 * reports `success`.
 */
const API = "https://api.cloudflare.com/client/v4";

function headers() {
  const token = process.env.CLOUDFLARE_API_TOKEN;
  if (!token) throw new Error("CLOUDFLARE_API_TOKEN missing");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

function accountId() {
  const id = process.env.CLOUDFLARE_ACCOUNT_ID;
  if (!id) throw new Error("CLOUDFLARE_ACCOUNT_ID missing");
  return id;
}

export async function createPagesProject(input: {
  name: string;
  repo: { owner: string; name: string };
}) {
  const r = await fetch(`${API}/accounts/${accountId()}/pages/projects`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      name: input.name,
      production_branch: "main",
      build_config: {
        build_command: "npm run build",
        destination_dir: ".next",
        root_dir: "",
      },
      source: {
        type: "github",
        config: {
          owner: input.repo.owner,
          repo_name: input.repo.name,
          production_branch: "main",
          pr_comments_enabled: true,
          deployments_enabled: true,
        },
      },
    }),
  });
  if (!r.ok) throw new Error(`Cloudflare createPagesProject ${r.status}: ${await r.text()}`);
  return (await r.json()) as { result: { name: string; subdomain: string } };
}

export async function triggerPagesDeployment(projectName: string) {
  const r = await fetch(
    `${API}/accounts/${accountId()}/pages/projects/${projectName}/deployments`,
    { method: "POST", headers: headers() },
  );
  if (!r.ok) throw new Error(`Cloudflare trigger ${r.status}`);
  return (await r.json()) as { result: { id: string; url: string } };
}
