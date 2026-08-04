import "server-only";

/**
 * Server-side AI provider abstraction. API keys never leave the server.
 * Supports Anthropic and OpenAI, with a deterministic offline tutor fallback
 * so the app remains fully usable without any API key.
 */

export type AiProvider = "anthropic" | "openai" | "offline";

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export interface TutorRequest {
  provider: AiProvider;
  model: string;
  system: string;
  messages: ChatTurn[];
  maxTokens?: number;
}

export interface TutorResponse {
  content: string;
  provider: AiProvider;
}

export function resolveProvider(preferred: string): AiProvider {
  if (preferred === "anthropic" && process.env.ANTHROPIC_API_KEY) return "anthropic";
  if (preferred === "openai" && process.env.OPENAI_API_KEY) return "openai";
  // Auto-upgrade: use whichever key exists if the preferred one is missing.
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";
  if (process.env.OPENAI_API_KEY) return "openai";
  return "offline";
}

export async function generateTutorReply(req: TutorRequest): Promise<TutorResponse> {
  const provider = resolveProvider(req.provider);

  if (provider === "anthropic") {
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const response = await client.messages.create({
      model: req.model.startsWith("claude") ? req.model : "claude-sonnet-5",
      max_tokens: req.maxTokens ?? 1200,
      system: req.system,
      messages: req.messages.map((m) => ({ role: m.role, content: m.content })),
    });
    const text = response.content
      .filter((b): b is { type: "text"; text: string } & typeof b => b.type === "text")
      .map((b) => b.text)
      .join("\n");
    return { content: text, provider };
  }

  if (provider === "openai") {
    const { default: OpenAI } = await import("openai");
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.chat.completions.create({
      model: req.model.startsWith("gpt") ? req.model : "gpt-4o",
      max_tokens: req.maxTokens ?? 1200,
      messages: [
        { role: "system", content: req.system },
        ...req.messages.map((m) => ({ role: m.role, content: m.content })),
      ],
    });
    return { content: response.choices[0]?.message?.content ?? "", provider };
  }

  return { content: offlineTutorReply(req.messages), provider: "offline" };
}

/**
 * Deterministic study-skills tutor used when no API key is configured.
 * It cannot answer arbitrary questions, but it always gives a structured,
 * pedagogically useful response so the tutor page never dead-ends.
 */
export function offlineTutorReply(messages: ChatTurn[]): string {
  const last = messages.filter((m) => m.role === "user").at(-1)?.content ?? "";
  const topic = last.slice(0, 120);
  return [
    `**Offline tutor mode** — no AI API key is configured yet (add one in Settings → AI Configuration to enable the full expert tutor).`,
    ``,
    `Here's a structured way to attack: *"${topic}"*`,
    ``,
    `1. **Define every term.** Write each symbol or word in the question and its precise definition. Most confusion in physics and math is undefined vocabulary.`,
    `2. **Find the governing relationship.** Which equation, theorem, or principle connects the knowns to the unknown? Write it before substituting anything.`,
    `3. **Check units and limiting cases.** Does the expression behave sensibly when a variable goes to 0 or ∞? Unit errors catch most mistakes.`,
    `4. **Solve a simpler version first.** Reduce dimensions, drop a term, or use round numbers, then scale back up.`,
    `5. **Explain it back.** Write a two-sentence summary as if teaching it. If you can't, revisit step 1 — then bring the sticking point to the practice problems for this module.`,
    ``,
    `Related tools: the **Practice Problems** section has worked problems on this material, and **Spaced Repetition** will keep it fresh once you've learned it.`,
  ].join("\n");
}

export function buildTutorSystemPrompt(opts: {
  studentName: string;
  tutorStyle: string;
  contextLabel?: string;
  weakTopics: string[];
  currentCourse?: string;
}): string {
  const style =
    opts.tutorStyle === "socratic"
      ? "Prefer guiding questions over direct answers; reveal full solutions only when the student is stuck or asks directly."
      : opts.tutorStyle === "detailed"
        ? "Give thorough, step-by-step explanations with derivations and worked examples."
        : "Be concise and direct; give the answer first, then a short explanation.";

  return [
    `You are the SETI Scholar expert tutor: a patient university instructor covering mathematics, physics, astronomy, scientific programming, signal processing, and quantum computing.`,
    `The student is ${opts.studentName}, an active-duty U.S. Air Force member studying online toward a physics/astronomy degree, whose long-term goal is to become a SETI astrophysicist working on technosignatures and radio astronomy.`,
    style,
    `Use LaTeX-free plain notation readable in markdown (e.g. v = d/t, x^2, sqrt(x), integral of f(x) dx).`,
    `Connect concepts to astrophysics and SETI applications whenever natural — it builds motivation.`,
    opts.currentCourse ? `The student is currently preparing for: ${opts.currentCourse}.` : ``,
    opts.contextLabel ? `This conversation is anchored to the lesson/module: ${opts.contextLabel}.` : ``,
    opts.weakTopics.length
      ? `Known weak topics from quiz analytics (probe these gently when relevant): ${opts.weakTopics.join(", ")}.`
      : ``,
    `Never fabricate citations or observational data. If asked about grades or degree requirements, remind the student to confirm with their ASU advisor.`,
  ]
    .filter(Boolean)
    .join("\n");
}
