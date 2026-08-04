import "server-only";

/**
 * LLM helper for agents: same secure server-side provider abstraction as the
 * tutor, plus JSON-structured output. Returns null when no API key is
 * configured — every agent has a deterministic fallback, so the pipeline is
 * fully functional offline.
 */

import { db } from "@/lib/db";
import { generateTutorReply, resolveProvider, type AiProvider } from "@/lib/ai/provider";

export async function llmAvailable(userId: string): Promise<{ provider: AiProvider; model: string } | null> {
  const settings = await db.userSettings.findUnique({ where: { userId } });
  const provider = resolveProvider(settings?.aiProvider ?? "offline");
  if (provider === "offline") return null;
  return { provider, model: settings?.aiModel ?? "claude-sonnet-5" };
}

/** Ask for strict-JSON output; returns parsed object or null on any failure. */
export async function llmJson<T>(
  userId: string,
  system: string,
  prompt: string,
  maxTokens = 3000,
): Promise<T | null> {
  const cfg = await llmAvailable(userId);
  if (!cfg) return null;
  try {
    const res = await generateTutorReply({
      provider: cfg.provider,
      model: cfg.model,
      system: `${system}\nRespond with ONLY valid JSON — no prose, no markdown fences.`,
      messages: [{ role: "user", content: prompt }],
      maxTokens,
    });
    const text = res.content.trim().replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}
