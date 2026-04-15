"use client";
import { Suspense } from "react";
import { ClientSideSuspense } from "@liveblocks/react";
import { RoomProvider, LiveblocksProvider } from "@/liveblocks.config";
import { useBuilderStore } from "@/stores/builder-store";
import { BuilderTopBar } from "./BuilderTopBar";
import { FileTree } from "./FileTree";
import { EditorTabs } from "./EditorTabs";
import { CollaborativeEditor } from "./CollaborativeEditor";
import { LivePreview } from "@/components/preview/LivePreview";
import { ControlRoom } from "@/components/agents/ControlRoom";
import { PresenceCursors } from "@/components/collab/PresenceCursors";
import { MultimodalInputBar } from "@/components/multimodal/MultimodalInputBar";

function BuilderSkeleton() {
  return (
    <div className="grid min-h-screen place-items-center">
      <div className="glass scanlines rounded-2xl px-6 py-5 text-sm text-slate-300">
        <span className="mr-2 inline-block size-2 animate-pulse rounded-full bg-fuchsia-400" />
        Entering Control Room…
      </div>
    </div>
  );
}

function BuilderInner({ projectId }: { projectId: string }) {
  const { activeFile } = useBuilderStore();
  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-[#05060a] text-slate-100">
      <PresenceCursors />
      <BuilderTopBar projectName={projectId} />
      <div className="grid flex-1 grid-cols-[220px_1fr_520px] overflow-hidden">
        <aside className="overflow-y-auto border-r border-white/5 bg-[#070910] p-3">
          <div className="mb-3 text-[10px] uppercase tracking-[0.24em] text-slate-500">
            files
          </div>
          <FileTree />
        </aside>
        <section className="grid grid-rows-[auto_1fr_auto_36%] overflow-hidden">
          <EditorTabs />
          <div className="relative min-h-0">
            {activeFile ? (
              <CollaborativeEditor
                filePath={activeFile}
                language={activeFile.endsWith(".css") ? "css" : "typescript"}
              />
            ) : (
              <div className="grid h-full place-items-center text-slate-600">
                open a file to start editing
              </div>
            )}
          </div>
          <div className="border-t border-white/5 bg-[#06080f] p-3">
            <MultimodalInputBar projectId={projectId} />
          </div>
          <div className="border-t border-white/5">
            <LivePreview url="about:blank" />
          </div>
        </section>
        <aside className="min-w-0">
          <ControlRoom />
        </aside>
      </div>
    </div>
  );
}

export function BuilderShell({ projectId }: { projectId: string }) {
  const roomId = `forge-project-${projectId}`;
  return (
    <LiveblocksProvider>
      <RoomProvider
        id={roomId}
        initialPresence={{
          cursor: null,
          activeFile: null,
          selection: null,
          isTyping: false,
        }}
        initialStorage={{}}
      >
        <ClientSideSuspense fallback={<BuilderSkeleton />}>
          <Suspense fallback={<BuilderSkeleton />}>
            <BuilderInner projectId={projectId} />
          </Suspense>
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
}
