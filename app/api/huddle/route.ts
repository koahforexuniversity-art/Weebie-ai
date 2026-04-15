import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { streamText } from "ai";
import { z } from "zod";
import { models } from "@/lib/ai/providers";
import { AGENTS, type AgentId } from "@/lib/agents/registry";

export const runtime = "nodejs";
export const maxDuration = 120;

const bodySchema = z.object({
  topic: z.string().min(1),
  participants: z.array(z.string()).min(2).max(6),
  turns: z.number().int().min(2).max(10).default(6),
});

/**
 * Streams a scripted multi-agent huddle as `data:` SSE frames. Each frame is
 * `{ agent, delta }` for partial token streaming or `{ agent, done: true }`
 * when a turn completes; `{ done: true }` terminates the session.
 */
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { topic, participants, turns } = parsed.data;

  const roster = participants
    .map((id) => AGENTS[id as AgentId])
    .filter(Boolean)
    .map((a) => `${a.label} (${a.summary})`)
    .join("\n- ");

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const enc = new TextEncoder();
      const send = (o: unknown) =>
        controller.enqueue(enc.encode(`data: ${JSON.stringify(o)}\n\n`));

      try {
        const transcript: { agent: AgentId; text: string }[] = [];
        for (let i = 0; i < turns; i++) {
          const speaker = participants[i % participants.length] as AgentId;
          const agent = AGENTS[speaker];
          if (!agent) continue;

          const { textStream } = await streamText({
            model: models.fast,
            system: `You are ${agent.label} — ${agent.summary}. Speak in first person, <= 40 words per turn, concrete, senior engineer tone. Stay in character.`,
            prompt: `Topic: ${topic}\n\nRoster:\n- ${roster}\n\nTranscript so far:\n${transcript
              .map((t) => `${AGENTS[t.agent].label}: ${t.text}`)
              .join("\n")}\n\nContinue the conversation. Speak as ${agent.label} now.`,
          });

          let acc = "";
          for await (const delta of textStream) {
            acc += delta;
            send({ agent: speaker, delta });
          }
          transcript.push({ agent: speaker, text: acc });
          send({ agent: speaker, done: true, full: acc });
        }
        send({ done: true });
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
    },
  });
}
