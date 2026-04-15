import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const maxDuration = 120;

function adminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const form = await req.formData();
  const file = form.get("file");
  const projectId = form.get("projectId");
  if (!(file instanceof File) || typeof projectId !== "string") {
    return NextResponse.json({ error: "file + projectId required" }, { status: 400 });
  }
  if (file.size > 200 * 1024 * 1024) {
    return NextResponse.json({ error: "video exceeds 200MB limit" }, { status: 413 });
  }

  const key = `projects/${projectId}/${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
  const sb = adminSupabase();
  const { error } = await sb.storage.from("forge-videos").upload(key, file, {
    contentType: file.type,
    upsert: false,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: pub } = sb.storage.from("forge-videos").getPublicUrl(key);
  return NextResponse.json({
    url: pub.publicUrl,
    mimeType: file.type,
    size: file.size,
    key,
  });
}
