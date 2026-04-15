"use client";
import { create } from "zustand";

type BuilderState = {
  activeFile: string;
  openFiles: string[];
  previewDevice: "desktop" | "tablet" | "mobile";
  controlRoomTab: "swarm" | "logs" | "presence" | "intel";
  setActiveFile: (path: string) => void;
  closeFile: (path: string) => void;
  setPreviewDevice: (d: BuilderState["previewDevice"]) => void;
  setControlRoomTab: (t: BuilderState["controlRoomTab"]) => void;
};

export const useBuilderStore = create<BuilderState>((set) => ({
  activeFile: "app/page.tsx",
  openFiles: ["app/page.tsx"],
  previewDevice: "desktop",
  controlRoomTab: "swarm",
  setActiveFile: (path) =>
    set((s) => ({
      activeFile: path,
      openFiles: s.openFiles.includes(path) ? s.openFiles : [...s.openFiles, path],
    })),
  closeFile: (path) =>
    set((s) => {
      const next = s.openFiles.filter((f) => f !== path);
      return {
        openFiles: next,
        activeFile: s.activeFile === path ? next[0] ?? "" : s.activeFile,
      };
    }),
  setPreviewDevice: (previewDevice) => set({ previewDevice }),
  setControlRoomTab: (controlRoomTab) => set({ controlRoomTab }),
}));
