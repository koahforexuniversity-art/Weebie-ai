"use client";
import { create } from "zustand";
import type { MotionSpec } from "@/lib/ai/video-intel";

export type VideoAssetState = {
  id: string;
  url: string;
  name: string;
  mimeType: string;
  size: number;
  status: "uploaded" | "analyzing" | "ready" | "failed";
  spec?: MotionSpec;
  error?: string;
};

export type ImageAsset = { id: string; url: string; name: string };

type State = {
  videos: VideoAssetState[];
  images: ImageAsset[];
  activeVideoId: string | null;
  addVideo: (v: VideoAssetState) => void;
  updateVideo: (id: string, patch: Partial<VideoAssetState>) => void;
  setActiveVideo: (id: string | null) => void;
  addImage: (i: ImageAsset) => void;
};

export const useMultimodalStore = create<State>((set) => ({
  videos: [],
  images: [],
  activeVideoId: null,
  addVideo: (v) =>
    set((s) => ({ videos: [v, ...s.videos], activeVideoId: v.id })),
  updateVideo: (id, patch) =>
    set((s) => ({
      videos: s.videos.map((v) => (v.id === id ? { ...v, ...patch } : v)),
    })),
  setActiveVideo: (activeVideoId) => set({ activeVideoId }),
  addImage: (i) => set((s) => ({ images: [i, ...s.images] })),
}));
