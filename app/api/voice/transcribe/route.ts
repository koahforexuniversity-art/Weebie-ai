import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { experimental_transcribe as transcribe } from "ai";
import { openai } from "@ai-sdk/openai";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const form = await req.formData();
  const audio = form.get("audio");
  if (!(audio instanceof File)) {
    return NextResponse.json({ error: "audio required" }, { status: 400 });
  }

  try {
    const { text } = await transcribe({
      model: openai.transcription("whisper-1"),
      audio: new Uint8Array(await audio.arrayBuffer()),
    });
    return NextResponse.json({ text });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
