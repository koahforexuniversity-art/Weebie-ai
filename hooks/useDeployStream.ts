"use client";
import { useCallback, useRef, useState } from "react";
import type { SwarmEvent, DeployResult, DeployTarget } from "@/lib/deployment/swarm";

export type DeployLog = SwarmEvent & { id: string; t: number };

export function useDeployStream() {
  const [logs, setLogs] = useState<DeployLog[]>([]);
  const [status, setStatus] = useState<"idle" | "streaming" | "done" | "error">("idle");
  const [result, setResult] = useState<DeployResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setLogs([]);
    setStatus("idle");
    setResult(null);
    setError(null);
  }, []);

  const run = useCallback(
    async (input: {
      projectName: string;
      target: DeployTarget;
      files?: { path: string; content: string }[];
      envVars?: Record<string, string>;
    }) => {
      reset();
      setStatus("streaming");
      const ac = new AbortController();
      abortRef.current = ac;

      try {
        const res = await fetch("/api/deploy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ files: [], ...input }),
          signal: ac.signal,
        });
        if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buf = "";
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          const events = buf.split("\n\n");
          buf = events.pop() ?? "";
          for (const e of events) {
            const line = e.trim();
            if (!line.startsWith("data:")) continue;
            const payload = JSON.parse(line.slice(5).trim());
            if ("error" in payload) {
              setError(payload.error);
              setStatus("error");
              return;
            }
            if ("done" in payload) {
              setResult(payload.result as DeployResult);
              setStatus("done");
              return;
            }
            setLogs((l) => [
              ...l,
              { ...(payload as SwarmEvent), id: Math.random().toString(36).slice(2), t: Date.now() },
            ]);
          }
        }
        setStatus("done");
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setError(String(err));
        setStatus("error");
      }
    },
    [reset],
  );

  return { logs, status, result, error, run, reset };
}
