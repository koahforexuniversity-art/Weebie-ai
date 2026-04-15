"use client";
import { useCallback, useEffect, useRef, useState } from "react";

type RecorderKind = "screen" | "camera" | "microphone";

type Opts = {
  kind: RecorderKind;
  mimeType?: string;
  audio?: boolean;
};

export function useMediaRecorder() {
  const [state, setState] = useState<"idle" | "recording" | "stopping">("idle");
  const [elapsedMs, setElapsedMs] = useState(0);
  const [lastBlob, setLastBlob] = useState<Blob | null>(null);
  const chunks = useRef<Blob[]>([]);
  const rec = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAt = useRef<number>(0);

  const cleanup = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
    rec.current = null;
  }, []);

  useEffect(() => cleanup, [cleanup]);

  const start = useCallback(async ({ kind, mimeType, audio = true }: Opts) => {
    chunks.current = [];
    setLastBlob(null);

    const media =
      kind === "screen"
        ? await navigator.mediaDevices.getDisplayMedia({
            video: { frameRate: 30 },
            audio,
          })
        : await navigator.mediaDevices.getUserMedia({
            video: kind === "camera",
            audio,
          });

    stream.current = media;
    const r = new MediaRecorder(media, {
      mimeType: mimeType ?? (kind === "microphone" ? "audio/webm" : "video/webm;codecs=vp9,opus"),
      bitsPerSecond: kind === "microphone" ? 128_000 : 4_500_000,
    });
    rec.current = r;
    r.ondataavailable = (e) => e.data.size && chunks.current.push(e.data);
    r.onstop = () => {
      const blob = new Blob(chunks.current, { type: r.mimeType });
      setLastBlob(blob);
      cleanup();
      setState("idle");
      setElapsedMs(0);
    };
    // User ends screen share → auto-stop.
    media.getVideoTracks().forEach((t) => (t.onended = () => r.state !== "inactive" && r.stop()));

    r.start(1000);
    startedAt.current = Date.now();
    timer.current = setInterval(() => setElapsedMs(Date.now() - startedAt.current), 200);
    setState("recording");
  }, [cleanup]);

  const stop = useCallback(() => {
    if (rec.current && rec.current.state !== "inactive") {
      setState("stopping");
      rec.current.stop();
    }
  }, []);

  return { state, elapsedMs, lastBlob, start, stop };
}

export function formatElapsed(ms: number) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return `${m.toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
}
