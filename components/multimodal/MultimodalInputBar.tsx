"use client";
import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Image as ImageIcon,
  Mic,
  Paperclip,
  Send,
  Square,
  Video,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn, shortId } from "@/lib/utils";
import { VideoRecorder } from "./VideoRecorder";
import { useMultimodalStore } from "@/stores/multimodal-store";
import { useBroadcastEvent } from "@/liveblocks.config";
import { formatElapsed, useMediaRecorder } from "@/hooks/useMediaRecorder";

type Attachment =
  | { kind: "image"; url: string; name: string }
  | { kind: "video"; url: string; name: string; videoId: string };

export function MultimodalInputBar({ projectId }: { projectId: string }) {
  const [text, setText] = useState("");
  const [recorderOpen, setRecorderOpen] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [sending, setSending] = useState(false);
  const imgInput = useRef<HTMLInputElement>(null);
  const vidInput = useRef<HTMLInputElement>(null);
  const broadcast = useBroadcastEvent();
  const addVideo = useMultimodalStore((s) => s.addVideo);
  const updateVideo = useMultimodalStore((s) => s.updateVideo);
  const addImage = useMultimodalStore((s) => s.addImage);

  const mic = useMediaRecorder();
  const [transcribing, setTranscribing] = useState(false);

  async function handleImage(file: File) {
    const url = URL.createObjectURL(file);
    const id = shortId();
    addImage({ id, url, name: file.name });
    setAttachments((a) => [...a, { kind: "image", url, name: file.name }]);
  }

  async function handleVideoFile(file: File) {
    const id = shortId();
    const tempUrl = URL.createObjectURL(file);
    addVideo({
      id,
      url: tempUrl,
      name: file.name,
      mimeType: file.type,
      size: file.size,
      status: "uploaded",
    });
    setAttachments((a) => [...a, { kind: "video", url: tempUrl, name: file.name, videoId: id }]);

    try {
      const form = new FormData();
      form.append("file", file);
      form.append("projectId", projectId);
      const up = await fetch("/api/video/upload", { method: "POST", body: form });
      const upJson = await up.json();
      if (!up.ok) throw new Error(upJson.error ?? "upload failed");
      updateVideo(id, { url: upJson.url, status: "analyzing" });
      broadcast({ type: "agent-activity", agent: "video-intel", phase: "start" });

      const an = await fetch("/api/video/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrl: upJson.url, mimeType: upJson.mimeType }),
      });
      const anJson = await an.json();
      if (!an.ok) throw new Error(anJson.error ?? "analyze failed");
      updateVideo(id, { status: "ready", spec: anJson.spec });
      broadcast({
        type: "agent-log",
        agent: "video-intel",
        message: `parsed ${anJson.spec.components?.length ?? 0} components · ${anJson.spec.segments?.length ?? 0} segments`,
      });
      broadcast({ type: "agent-activity", agent: "video-intel", phase: "end" });
      toast.success("Video analyzed");
    } catch (err) {
      updateVideo(id, { status: "failed", error: String(err) });
      toast.error("Video analysis failed", { description: String(err) });
    }
  }

  async function toggleMic() {
    if (mic.state === "recording") {
      mic.stop();
      return;
    }
    try {
      await mic.start({ kind: "microphone", audio: true });
    } catch (err) {
      toast.error("Microphone access denied", { description: String(err) });
    }
  }

  async function transcribeLastBlob() {
    if (!mic.lastBlob) return;
    setTranscribing(true);
    try {
      const form = new FormData();
      form.append("audio", new File([mic.lastBlob], "voice.webm", { type: mic.lastBlob.type }));
      const r = await fetch("/api/voice/transcribe", { method: "POST", body: form });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error ?? "transcription failed");
      setText((t) => (t ? `${t} ${j.text}` : j.text));
    } catch (err) {
      toast.error("Transcription failed", { description: String(err) });
    } finally {
      setTranscribing(false);
    }
  }

  // Auto-transcribe once recording ends and we have a blob.
  if (mic.lastBlob && !transcribing && mic.state === "idle") {
    const blob = mic.lastBlob;
    queueMicrotask(() => {
      // fire-and-forget; guard against re-trigger via referential check
      if (blob === mic.lastBlob) {
        transcribeLastBlob().finally(() => {
          // clear via replacement blob — stateless approach: nothing to clear,
          // next recording creates a new blob reference.
        });
      }
    });
  }

  async function send() {
    if (!text.trim() && attachments.length === 0) return;
    setSending(true);
    broadcast({
      type: "agent-log",
      agent: "orchestrator",
      message: `new prompt · ${text.slice(0, 60) || "(attachment only)"}`,
    });
    try {
      await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal: buildGoal(text, attachments),
        }),
      });
      setText("");
      setAttachments([]);
      toast("Sent to the swarm");
    } catch (err) {
      toast.error("Send failed", { description: String(err) });
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <AnimatePresence>
        {recorderOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-black/70 backdrop-blur"
            onClick={() => setRecorderOpen(false)}
          >
            <div onClick={(e) => e.stopPropagation()}>
              <VideoRecorder projectId={projectId} onClose={() => setRecorderOpen(false)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="glass scanlines relative rounded-2xl p-3">
        {attachments.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {attachments.map((a, i) => (
              <div
                key={i}
                className="group relative overflow-hidden rounded-lg border border-white/10 bg-black/40"
              >
                {a.kind === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={a.url} alt={a.name} className="h-14 w-20 object-cover" />
                ) : (
                  <video src={a.url} className="h-14 w-20 object-cover" muted />
                )}
                <button
                  onClick={() => setAttachments((arr) => arr.filter((_, j) => j !== i))}
                  className="absolute right-0.5 top-0.5 grid size-4 place-items-center rounded-full bg-black/70 opacity-0 transition group-hover:opacity-100"
                  aria-label="Remove attachment"
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-end gap-2">
          <div className="flex items-center gap-1">
            <IconBtn
              onClick={() => imgInput.current?.click()}
              title="Add image"
            >
              <ImageIcon className="size-4" />
            </IconBtn>
            <IconBtn
              onClick={() => vidInput.current?.click()}
              title="Upload video"
            >
              <Paperclip className="size-4" />
            </IconBtn>
            <IconBtn
              onClick={() => setRecorderOpen(true)}
              title="Record video"
              accent
            >
              <Video className="size-4" />
            </IconBtn>
            <IconBtn
              onClick={toggleMic}
              title={mic.state === "recording" ? "Stop" : "Voice"}
              active={mic.state === "recording"}
            >
              {mic.state === "recording" ? (
                <Square className="size-3.5 fill-current" />
              ) : (
                <Mic className="size-4" />
              )}
            </IconBtn>
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) send();
            }}
            rows={1}
            placeholder={
              mic.state === "recording"
                ? `recording ${formatElapsed(mic.elapsedMs)}…`
                : transcribing
                  ? "transcribing…"
                  : "Describe what you want. Attach images or video. Record your screen."
            }
            className="min-h-[40px] flex-1 resize-none bg-transparent px-2 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500"
          />

          <Button
            onClick={send}
            disabled={sending || (!text.trim() && attachments.length === 0)}
            size="sm"
          >
            <Send className="size-3.5" />
            {sending ? "Dispatching" : "Send"}
          </Button>
        </div>

        <input
          ref={imgInput}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleImage(e.target.files[0])}
        />
        <input
          ref={vidInput}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleVideoFile(e.target.files[0])}
        />
      </div>
    </>
  );
}

function IconBtn({
  children,
  onClick,
  title,
  active,
  accent,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
  active?: boolean;
  accent?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={title}
      className={cn(
        "grid size-8 place-items-center rounded-full transition",
        active
          ? "bg-rose-500/20 text-rose-300 ring-1 ring-rose-500/60"
          : accent
            ? "bg-fuchsia-500/15 text-fuchsia-200 hover:bg-fuchsia-500/25"
            : "text-slate-400 hover:bg-white/5 hover:text-white",
      )}
    >
      {children}
    </button>
  );
}

function buildGoal(text: string, atts: Attachment[]) {
  const parts = [text.trim()].filter(Boolean);
  const videos = atts.filter((a) => a.kind === "video");
  const images = atts.filter((a) => a.kind === "image");
  if (videos.length) parts.push(`[${videos.length} video attached → videoIntel]`);
  if (images.length) parts.push(`[${images.length} image attached]`);
  return parts.join("\n");
}
