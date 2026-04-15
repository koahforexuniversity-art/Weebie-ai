import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { liveblocksServer } from "@/lib/liveblocks";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const user = await currentUser();
  const { room } = (await req.json()) as { room?: string };
  if (!room) return new NextResponse("Missing room", { status: 400 });

  const session = liveblocksServer.prepareSession(userId, {
    userInfo: {
      name: user?.firstName ?? user?.username ?? "Forger",
      avatar: user?.imageUrl ?? "",
      color: pickColor(userId),
      kind: "human",
    },
  });

  session.allow(room, session.FULL_ACCESS);
  const { status, body } = await session.authorize();
  return new NextResponse(body, { status });
}

function pickColor(seed: string) {
  const palette = ["#a855f7", "#22d3ee", "#f472b6", "#a3e635", "#f59e0b", "#60a5fa"];
  let hash = 0;
  for (const ch of seed) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return palette[hash % palette.length];
}
