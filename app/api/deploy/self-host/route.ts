import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import JSZip from "jszip";
import {
  renderCompose,
  renderDockerfile,
  renderNginx,
  renderRunScript,
} from "@/lib/deployment/docker";

export const runtime = "nodejs";

/**
 * Streams back a zip bundle of self-host artefacts the user can run with
 * `docker compose up`. Kept stateless: no DB write, no auth webhook.
 */
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const { projectName } = (await req.json().catch(() => ({}))) as { projectName?: string };
  const name = (projectName ?? "forgeagent-project").replace(/[^a-z0-9-_]/gi, "-");

  const zip = new JSZip();
  const folder = zip.folder(name)!;
  const run = renderRunScript();
  folder.file("Dockerfile", renderDockerfile());
  folder.file("docker-compose.yml", renderCompose());
  folder.file("nginx.conf", renderNginx());
  folder.file("run.sh", run.sh, { unixPermissions: "755" });
  folder.file("run.ps1", run.ps1);
  folder.file(
    "README.md",
    `# ${name} — self-host bundle\n\n\`\`\`bash\n./run.sh   # or: docker compose up -d --build\n\`\`\`\n\nBuilt by the ForgeAgent v4 Self-Host agent.\n`,
  );

  const buffer = await zip.generateAsync({ type: "uint8array" });
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${name}-selfhost.zip"`,
    },
  });
}
