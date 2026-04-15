import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";

/**
 * Central model registry. Every agent pulls its model from here so the stack
 * can be re-routed (fallback, cost tier, region) in one place.
 */
export const models = {
  orchestrator: anthropic("claude-opus-4-6"),
  reasoner: anthropic("claude-opus-4-6"),
  coder: anthropic("claude-sonnet-4-6"),
  fast: anthropic("claude-haiku-4-5-20251001"),
  vision: google("gemini-3.1-pro"),
  video: google("gemini-3.1-pro"),
  fallback: openai("gpt-5.1"),
} as const;

export type ModelKey = keyof typeof models;
