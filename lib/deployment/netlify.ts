/**
 * Thin Netlify REST client. Netlify deploys via a site + build hook, or a
 * direct zip upload. We use the build-hook flow after linking a repo.
 */
const API = "https://api.netlify.com/api/v1";

function headers() {
  const token = process.env.NETLIFY_TOKEN;
  if (!token) throw new Error("NETLIFY_TOKEN missing");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function createSite(name: string, repo: { owner: string; name: string }) {
  const r = await fetch(`${API}/sites`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      name,
      repo: {
        provider: "github",
        repo: `${repo.owner}/${repo.name}`,
        branch: "main",
        cmd: "npm run build",
        dir: ".next",
      },
    }),
  });
  if (!r.ok) throw new Error(`Netlify createSite ${r.status}: ${await r.text()}`);
  return (await r.json()) as { id: string; ssl_url: string; admin_url: string };
}

export async function getSite(id: string) {
  const r = await fetch(`${API}/sites/${id}`, { headers: headers() });
  if (!r.ok) throw new Error(`Netlify getSite ${r.status}`);
  return r.json();
}
