"use client";
import { useEffect, useRef } from "react";
import Editor, { type OnMount } from "@monaco-editor/react";
import * as Y from "yjs";
import { MonacoBinding } from "y-monaco";
import { getYjsProviderForRoom } from "@liveblocks/yjs";
import { useRoom, useSelf, useOthers, useUpdateMyPresence } from "@/liveblocks.config";

type Props = { filePath: string; language?: string };

/**
 * Monaco editor bound to a Yjs doc synced via Liveblocks. Each file lives in
 * its own Y.Text under the room doc, so tabs share state across users + agents.
 */
export function CollaborativeEditor({ filePath, language = "typescript" }: Props) {
  const room = useRoom();
  const self = useSelf();
  const others = useOthers();
  const updatePresence = useUpdateMyPresence();
  const bindingRef = useRef<MonacoBinding | null>(null);

  const handleMount: OnMount = (editor, monaco) => {
    const yProvider = getYjsProviderForRoom(room);
    const yDoc = yProvider.getYDoc() as Y.Doc;
    const yText = yDoc.getText(filePath);

    // Dispose any previous binding (tab switch) before creating a new one.
    bindingRef.current?.destroy();
    bindingRef.current = new MonacoBinding(
      yText,
      editor.getModel()!,
      new Set([editor]),
      yProvider.awareness as unknown as ConstructorParameters<typeof MonacoBinding>[3],
    );

    // Forge theme — matches the app aesthetic.
    monaco.editor.defineTheme("forge", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "64748b", fontStyle: "italic" },
        { token: "keyword", foreground: "f472b6" },
        { token: "string", foreground: "a3e635" },
        { token: "number", foreground: "22d3ee" },
        { token: "type", foreground: "a855f7" },
      ],
      colors: {
        "editor.background": "#05060a",
        "editor.foreground": "#e5e7eb",
        "editor.lineHighlightBackground": "#0b0d1466",
        "editorCursor.foreground": "#a855f7",
        "editorLineNumber.foreground": "#334155",
        "editorLineNumber.activeForeground": "#a855f7",
        "editor.selectionBackground": "#a855f733",
      },
    });
    monaco.editor.setTheme("forge");

    editor.onDidChangeCursorSelection((e) => {
      updatePresence({
        activeFile: filePath,
        selection: {
          from: editor.getModel()?.getOffsetAt(e.selection.getStartPosition()) ?? 0,
          to: editor.getModel()?.getOffsetAt(e.selection.getEndPosition()) ?? 0,
        },
      });
    });
  };

  useEffect(() => () => bindingRef.current?.destroy(), []);

  return (
    <div className="relative h-full w-full">
      <div className="absolute right-3 top-2 z-10 flex items-center gap-1">
        {others.slice(0, 5).map((o) => (
          <div
            key={o.connectionId}
            title={`${o.info?.name} · editing`}
            className="size-6 rounded-full border-2 ring-2 ring-black/40"
            style={{
              borderColor: o.info?.color ?? "#a855f7",
              background: `url(${o.info?.avatar}) center/cover, ${o.info?.color}`,
            }}
          />
        ))}
        {self?.info && (
          <div
            className="size-6 rounded-full border-2 ring-2 ring-black/40"
            style={{
              borderColor: self.info.color,
              background: `url(${self.info.avatar}) center/cover, ${self.info.color}`,
            }}
          />
        )}
      </div>
      <Editor
        key={filePath}
        height="100%"
        language={language}
        theme="forge"
        onMount={handleMount}
        options={{
          fontFamily: "var(--font-mono)",
          fontSize: 13,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          smoothScrolling: true,
          cursorBlinking: "smooth",
          cursorSmoothCaretAnimation: "on",
          renderLineHighlight: "all",
          padding: { top: 16, bottom: 16 },
        }}
      />
    </div>
  );
}
