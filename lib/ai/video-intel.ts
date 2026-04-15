import { generateObject } from "ai";
import { z } from "zod";
import { models } from "./providers";
import { PROMPTS } from "./prompts";

export const motionSpecSchema = z.object({
  segments: z.array(
    z.object({
      tStart: z.number(),
      tEnd: z.number(),
      summary: z.string(),
      interactions: z.array(z.string()).default([]),
    }),
  ),
  components: z.array(
    z.object({
      name: z.string(),
      role: z.string(),
      motion: z.object({
        easing: z.string(),
        durationMs: z.number(),
        stagger: z.number().optional(),
        springStiffness: z.number().optional(),
        springDamping: z.number().optional(),
        keyframes: z.array(z.record(z.string(), z.union([z.string(), z.number()]))).optional(),
      }),
    }),
  ),
  palette: z.array(z.string()).default([]),
  typography: z
    .object({
      headingFamily: z.string().optional(),
      bodyFamily: z.string().optional(),
    })
    .default({}),
  framerMotionTsx: z.string().describe("Copy-paste-ready TSX using framer-motion 12"),
  reducedMotionTsx: z.string().describe("Matching TSX that respects prefers-reduced-motion"),
  transcript: z.string().default(""),
});

export type MotionSpec = z.infer<typeof motionSpecSchema>;

export async function analyzeVideo(input: {
  videoUrl: string;
  mimeType?: string;
  notes?: string;
}): Promise<MotionSpec> {
  const { object } = await generateObject({
    model: models.video,
    schema: motionSpecSchema,
    system: PROMPTS.videoIntel,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text:
              input.notes ??
              "Analyze this video. Extract segments, components, motion specs, palette, typography, and produce Framer Motion 12 TSX.",
          },
          {
            type: "file",
            data: new URL(input.videoUrl),
            mediaType: input.mimeType ?? "video/mp4",
          },
        ],
      },
    ],
  });
  return object;
}
