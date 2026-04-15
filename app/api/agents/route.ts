import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { orchestrate } from "@/lib/ai/orchestrator";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const { goal } = (await req.json()) as { goal: string };
  if (!goal) return new NextResponse("Missing goal", { status: 400 });

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      const emit = (obj: unknown) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));

      try {
        await orchestrate(goal, (event) => emit(event));
        emit({ done: true });
      } catch (err) {
        emit({ error: String(err) });
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
    },
  });
}
