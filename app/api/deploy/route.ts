import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { runDeploySwarm, type SwarmEvent } from "@/lib/deployment/swarm";

const bodySchema = z.object({
  projectName: z
    .string()
    .min(1)
    .regex(/^[a-z0-9][a-z0-9-_]{0,62}$/i, "projectName must be URL-friendly"),
  target: z.enum(["vercel", "netlify", "cloudflare", "docker"]),
  files: z.array(z.object({ path: z.string(), content: z.string() })).default([]),
  envVars: z.record(z.string(), z.string()).optional(),
});

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const input = parsed.data;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const enc = new TextEncoder();
      const send = (payload: SwarmEvent | { done: true; result: unknown } | { error: string }) =>
        controller.enqueue(enc.encode(`data: ${JSON.stringify(payload)}\n\n`));

      try {
        const result = await runDeploySwarm(input, (e) => send(e));
        send({ done: true, result });
      } catch (err) {
        send({ error: String(err) });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
