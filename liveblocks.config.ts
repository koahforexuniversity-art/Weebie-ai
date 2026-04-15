/**
 * Liveblocks typed client + hooks. Single source of truth for room types.
 * Imported by `components/builder/*` and the collab primitives.
 */
import { createClient } from "@liveblocks/client";
import { createRoomContext, createLiveblocksContext } from "@liveblocks/react";

export type Presence = {
  cursor: { x: number; y: number } | null;
  activeFile: string | null;
  selection: { from: number; to: number } | null;
  isTyping: boolean;
};

export type UserMeta = {
  id: string;
  info: {
    name: string;
    avatar: string;
    color: string;
    kind: "human" | "ai";
    agentId?: string;
  };
};

export type Storage = {
  /* Yjs doc is bound via getYjsProviderForRoom; Storage reserved for non-doc state. */
};

export type RoomEvent =
  | { type: "agent-log"; agent: string; message: string; level?: "info" | "warn" | "error" }
  | { type: "agent-activity"; agent: string; phase: "start" | "end" | "delta"; payload?: string }
  | { type: "deploy-update"; status: string; url?: string };

type ThreadMetadata = { filePath?: string; line?: number };

const client = createClient({
  authEndpoint: "/api/liveblocks",
  throttle: 16,
});

export const {
  suspense: {
    RoomProvider,
    useRoom,
    useMyPresence,
    useUpdateMyPresence,
    useOthers,
    useOthersMapped,
    useOthersConnectionIds,
    useOther,
    useBroadcastEvent,
    useEventListener,
    useSelf,
    useStorage,
    useMutation,
    useThreads,
  },
} = createRoomContext<Presence, Storage, UserMeta, RoomEvent, ThreadMetadata>(client);

export const {
  suspense: { LiveblocksProvider, useInboxNotifications },
} = createLiveblocksContext<UserMeta, ThreadMetadata>(client);

export { client as liveblocksBrowserClient };
