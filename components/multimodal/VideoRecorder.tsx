"use client";
import { useEffect, useRef, useState } from "react";
import { Camera, Monitor, StopCircle, UploadCloud } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { formatElapsed, useMediaRecorder } from "@/hooks/useMediaRecorder";
import { useMultimodalStore } from "@/stores/multimodal-store";
import { shortId } from "@/lib/utils";

export function VideoRecorder({
  projectId,
  onClose,
}: {
  projectId: string;
  onClose: () => void;
}) {
  const { state, elapsedMs, lastBlob, start, stop } = useMediaRecorder();
  const [uploading, setUploading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const addVideo = useMultimodalStore((s) => s.addVideo);
  const updateVideo = useMultimodalStore((s) => s.updateVideo);

  useEffect(() => {
    if (lastBlob && videoRef.current) {
      videoRef.current.src = URL.createObjectURL(lastBlob);
    }
  }, [lastBlob]);

  async function uploadAndAnalyze() {
    if (!lastBlob) return;
    setUploading(true);
    const id = shortId();
    const file = new File([lastBlob], `recording-${id}.webm`, { type: lastBlob.type });
    addVideo({
      id,
      url: URL.createObjectURL(lastBlob),
      name: file.name,
      mimeType: file.type,
      size: file.size,
      status: "uploaded",
    });
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("projectId", projectId);
      const upRes = await fetch("/api/video/upload", { method: "POST", body: form });
      const upJson = await upRes.json();
      if (!upRes.ok) throw new Error(upJson.error ?? "upload failed");

      updateVideo(id, { url: upJson.url, status: "analyzing" });
      const anRes = await fetch("/api/video/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrl: upJson.url, mimeType: upJson.mimeType }),
      });
      const anJson = await anRes.json();
      if (!anRes.ok) throw new Error(anJson.error ?? "analyze failed");

      updateVideo(id, { status: "ready", spec: anJson.spec });
      toast.success("Video analyzed", {
        description: `${anJson.spec.components?.length ?? 0} components · ${anJson.spec.segments?.length ?? 0} segments`,
      });
      onClose();
    } catch (err) {
      updateVideo(id, { status: "failed", error: String(err) });
      toast.error("Video analysis failed", { description: String(err) });
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="glass scanlines relative flex w-full max-w-xl flex-col gap-4 rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.24em] text-cyan-300">
            video intelligence
          </div>
          <h3 className="mt-1 text-lg font-semibold">Record or upload</h3>
        </div>
        <AnimatePresence>
          {state === "recording" && (
            <motion.div
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 rounded-full border border-rose-500/40 bg-rose-500/10 px-3 py-1 text-xs text-rose-200"
            >
              <span className="size-2 animate-pulse rounded-full bg-rose-400 shadow-[0_0_8px_#f43f5e]" />
              {formatElapsed(elapsedMs)}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="secondary"
          disabled={state !== "idle"}
          onClick={() => start({ kind: "screen" })}
        >
          <Monitor className="size-4" /> Record screen
        </Button>
        <Button
          variant="secondary"
          disabled={state !== "idle"}
          onClick={() => start({ kind: "camera" })}
        >
          <Camera className="size-4" /> Record camera
        </Button>
      </div>

      {state === "recording" && (
        <Button variant="outline" onClick={stop}>
          <StopCircle className="size-4 text-rose-400" /> Stop recording
        </Button>
      )}

      {lastBlob && (
        <div className="space-y-3">
          <video
            ref={videoRef}
            controls
            className="w-full rounded-xl border border-white/10 bg-black"
          />
          <div className="flex gap-2">
            <Button onClick={uploadAndAnalyze} disabled={uploading} className="flex-1">
              <UploadCloud className="size-4" />
              {uploading ? "Analyzing…" : "Analyze with Video Intel"}
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
