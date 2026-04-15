"use client";
import { ChevronRight, File, Folder, FolderOpen } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { useBuilderStore } from "@/stores/builder-store";

type Node = { name: string; path: string; children?: Node[] };

function buildTree(paths: string[]): Node[] {
  const root: Node = { name: "", path: "", children: [] };
  for (const p of paths) {
    const parts = p.split("/");
    let cur = root;
    parts.forEach((name, i) => {
      const path = parts.slice(0, i + 1).join("/");
      cur.children ??= [];
      let next = cur.children.find((c) => c.name === name);
      if (!next) {
        next = { name, path, children: i < parts.length - 1 ? [] : undefined };
        cur.children.push(next);
      }
      cur = next;
    });
  }
  return root.children ?? [];
}

const SAMPLE_FILES = [
  "app/layout.tsx",
  "app/page.tsx",
  "app/globals.css",
  "components/Hero.tsx",
  "components/Nav.tsx",
  "lib/utils.ts",
  "package.json",
  "tailwind.config.ts",
];

export function FileTree({ files = SAMPLE_FILES }: { files?: string[] }) {
  const tree = useMemo(() => buildTree(files), [files]);
  return (
    <div className="space-y-0.5 text-sm">
      {tree.map((n) => (
        <TreeNode key={n.path} node={n} depth={0} />
      ))}
    </div>
  );
}

function TreeNode({ node, depth }: { node: Node; depth: number }) {
  const [open, setOpen] = useState(depth < 1);
  const { activeFile, setActiveFile } = useBuilderStore();
  const isDir = !!node.children;
  const isActive = activeFile === node.path;

  if (isDir) {
    return (
      <div>
        <button
          onClick={() => setOpen((o) => !o)}
          className="group flex w-full items-center gap-1 rounded px-2 py-0.5 text-left text-slate-300 hover:bg-white/5"
          style={{ paddingLeft: 8 + depth * 12 }}
        >
          <ChevronRight
            className={cn("size-3.5 transition-transform", open && "rotate-90")}
          />
          {open ? (
            <FolderOpen className="size-3.5 text-fuchsia-300" />
          ) : (
            <Folder className="size-3.5 text-fuchsia-300" />
          )}
          <span className="truncate">{node.name}</span>
        </button>
        {open && (
          <div>
            {node.children!.map((c) => (
              <TreeNode key={c.path} node={c} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => setActiveFile(node.path)}
      className={cn(
        "flex w-full items-center gap-2 rounded px-2 py-0.5 text-left hover:bg-white/5",
        isActive ? "bg-fuchsia-500/10 text-fuchsia-100" : "text-slate-400",
      )}
      style={{ paddingLeft: 8 + depth * 12 }}
    >
      <File className="size-3.5" />
      <span className="truncate">{node.name}</span>
    </button>
  );
}
