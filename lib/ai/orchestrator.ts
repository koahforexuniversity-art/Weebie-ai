import { generateText, streamText, tool } from "ai";
import { z } from "zod";
import { models } from "./providers";
import { PROMPTS } from "./prompts";
import type { AgentId } from "@/lib/agents/registry";

type DispatchInput = {
  agent: AgentId;
  task: string;
  context?: Record<string, unknown>;
};

export type DispatchSink = (event: {
  agent: AgentId;
  phase: "start" | "delta" | "end" | "error";
  payload: unknown;
}) => void;

/**
 * Dispatches a single agent. Streams tokens back through the sink so the
 * Control Room can animate holographic avatars in real time.
 */
export async function runAgent(input: DispatchInput, sink: DispatchSink) {
  const prompt = (PROMPTS as Record<string, string>)[input.agent] ?? PROMPTS.orchestrator;
  sink({ agent: input.agent, phase: "start", payload: input.task });
  try {
    const result = await streamText({
      model: models.coder,
      system: prompt,
      prompt: `TASK:\n${input.task}\n\nCONTEXT:\n${JSON.stringify(input.context ?? {}, null, 2)}`,
    });
    let acc = "";
    for await (const delta of result.textStream) {
      acc += delta;
      sink({ agent: input.agent, phase: "delta", payload: delta });
    }
    sink({ agent: input.agent, phase: "end", payload: acc });
    return acc;
  } catch (err) {
    sink({ agent: input.agent, phase: "error", payload: String(err) });
    throw err;
  }
}

/**
 * Orchestrator loop — exposes dispatch as a tool so the model can fan out
 * work across the swarm via tool calling.
 */
export async function orchestrate(goal: string, sink: DispatchSink) {
  return generateText({
    model: models.orchestrator,
    system: PROMPTS.orchestrator,
    prompt: goal,
    tools: {
      dispatch: tool({
        description: "Dispatch a task to a named agent in the swarm.",
        inputSchema: z.object({
          agent: z.enum([
            "video-intel",
            "requirements",
            "design-system",
            "architecture",
            "frontend",
            "backend",
            "qa",
            "refinement",
            "collab",
            "github",
            "cloud-deploy",
            "self-host",
            "cicd",
          ]),
          task: z.string(),
          context: z.record(z.string(), z.unknown()).optional(),
        }),
        execute: async ({ agent, task, context }) =>
          runAgent({ agent: agent as AgentId, task, context }, sink),
      }),
    },
  });
}
