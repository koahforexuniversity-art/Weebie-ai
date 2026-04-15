import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { analyzeVideo } from "@/lib/ai/video-intel";

const bodySchema = z.object({
  videoUrl: z.string().url(),
  mimeType: z.string().optional(),
  notes: z.string().optional(),
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

  try {
    const spec = await analyzeVideo(parsed.data);
    return NextResponse.json({ spec });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
