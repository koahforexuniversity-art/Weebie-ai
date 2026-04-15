"use client";
import { create } from "zustand";

export type Snapshot = {
  id: string;
  label: string;
  createdAt: number;
  createdBy: string;
  files: Record<string, string>;
};

type State = {
  snapshots: Snapshot[];
  compareFromId: string | null;
  compareToId: string | null;
  addSnapshot: (s: Snapshot) => void;
  setCompare: (from: string | null, to: string | null) => void;
};

export const useVersionStore = create<State>((set) => ({
  snapshots: [],
  compareFromId: null,
  compareToId: null,
  addSnapshot: (s) =>
    set((st) => ({
      snapshots: [s, ...st.snapshots],
      compareToId: s.id,
      compareFromId: st.snapshots[0]?.id ?? null,
    })),
  setCompare: (from, to) => set({ compareFromId: from, compareToId: to }),
}));
