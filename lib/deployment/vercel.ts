/**
 * Thin Vercel REST client. Only the endpoints we actually call are wrapped.
 */
const API = "https://api.vercel.com";

function headers() {
  const token = process.env.VERCEL_TOKEN;
  if (!token) throw new Error("VERCEL_TOKEN missing");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function deployFromRepo(input: {
  name: string;
  repo: { owner: string; name: string; ref?: string };
  envVars?: Record<string, string>;
}) {
  const r = await fetch(`${API}/v13/deployments`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      name: input.name,
      gitSource: {
        type: "github",
        repo: `${input.repo.owner}/${input.repo.name}`,
        ref: input.repo.ref ?? "main",
      },
      env: input.envVars
        ? Object.entries(input.envVars).map(([key, value]) => ({
            key,
            value,
            target: ["production", "preview", "development"],
            type: "encrypted",
          }))
        : undefined,
    }),
  });
  if (!r.ok) throw new Error(`Vercel deploy failed: ${r.status} ${await r.text()}`);
  return (await r.json()) as { url: string; id: string };
}

export async function getDeployment(id: string) {
  const r = await fetch(`${API}/v13/deployments/${id}`, { headers: headers() });
  if (!r.ok) throw new Error(`Vercel get failed: ${r.status}`);
  return r.json();
}
