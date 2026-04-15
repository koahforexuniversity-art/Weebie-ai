import { Liveblocks } from "@liveblocks/node";
import { createClient } from "@liveblocks/client";

export const liveblocksServer = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY ?? "sk_dev_placeholder",
});

export const liveblocksClient = createClient({
  authEndpoint: "/api/liveblocks",
  throttle: 16,
});

export type Presence = {
  cursor: { x: number; y: number } | null;
  selection: string | null;
  agent?: {
    id: string;
    label: string;
    color: string;
    kind: "human" | "ai";
  };
};

export type Storage = {
  // Yjs binding lives alongside — Storage kept for non-doc state.
  activeFile: string | null;
};

export type UserMeta = {
  id: string;
  info: {
    name: string;
    avatar: string;
    color: string;
    kind: "human" | "ai";
  };
};
