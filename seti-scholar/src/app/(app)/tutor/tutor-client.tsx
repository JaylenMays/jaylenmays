"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { Send, Sparkles, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ConversationSummary {
  id: string;
  title: string;
  updatedAt: string;
}

const SUGGESTIONS = [
  "Walk me through why sin θ ≈ θ for small angles.",
  "Quiz me on Newton's laws with one question at a time.",
  "Explain Doppler drift in SETI searches like I'm new to it.",
  "What should I master before Calculus I?",
  "Derive Kepler's third law from Newton's gravity.",
];

export function TutorClient({
  conversations,
  initialConversationId,
  initialMessages,
  context,
  provider,
}: {
  conversations: ConversationSummary[];
  initialConversationId: string | null;
  initialMessages: Message[];
  context: string | null;
  provider: string;
}) {
  const router = useRouter();
  const [conversationId, setConversationId] = React.useState(initialConversationId);
  const [messages, setMessages] = React.useState<Message[]>(initialMessages);
  const [input, setInput] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const bottomRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(text: string) {
    if (!text.trim() || busy) return;
    setBusy(true);
    setError(null);
    setInput("");
    setMessages((m) => [...m, { id: `local-${Date.now()}`, role: "user", content: text }]);

    try {
      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: conversationId ?? undefined,
          message: text,
          context: context ?? undefined,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "The tutor is unavailable right now");
      }
      const data = await res.json();
      setConversationId(data.conversationId);
      setMessages((m) => [...m, data.message]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-4 lg:h-[calc(100vh-6rem)] lg:flex-row">
      {/* Conversation list */}
      <aside className="hidden w-60 shrink-0 flex-col gap-1 overflow-y-auto rounded-lg border bg-card p-2 lg:flex">
        <Button
          variant="outline"
          size="sm"
          className="mb-1 justify-start"
          onClick={() => {
            setConversationId(null);
            setMessages([]);
            router.push("/tutor");
          }}
        >
          <Plus /> New conversation
        </Button>
        {conversations.map((c) => (
          <button
            key={c.id}
            onClick={() => router.push(`/tutor?c=${c.id}`)}
            className={cn(
              "truncate rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent",
              c.id === conversationId && "bg-primary/15 text-primary",
            )}
          >
            {c.title}
          </button>
        ))}
      </aside>

      {/* Chat area */}
      <div className="flex min-w-0 flex-1 flex-col rounded-lg border bg-card">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="font-semibold">Expert AI Tutor</span>
            {context && <Badge variant="secondary">context: {context}</Badge>}
          </div>
          <Badge variant={provider === "offline" ? "warning" : "success"}>
            {provider === "offline" ? "offline mode" : provider}
          </Badge>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {messages.length === 0 && (
            <div className="mx-auto max-w-md pt-8 text-center">
              <p className="mb-1 font-medium">Ask anything on your path to SETI astrophysics.</p>
              <p className="mb-4 text-sm text-muted-foreground">
                The tutor knows your current course, weak topics, and preferred teaching style.
                {provider === "offline" &&
                  " (Offline mode: add an API key in Settings for the full expert tutor.)"}
              </p>
              <div className="flex flex-col gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-md border px-3 py-2 text-left text-sm hover:bg-accent"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m) => (
            <div
              key={m.id}
              className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                  m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted",
                )}
              >
                {m.role === "assistant" ? (
                  <div className="prose-app">
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>
                ) : (
                  <span className="whitespace-pre-wrap">{m.content}</span>
                )}
              </div>
            </div>
          ))}
          {busy && (
            <div className="flex justify-start">
              <div className="animate-pulse rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
                Thinking…
              </div>
            </div>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div ref={bottomRef} />
        </div>

        <form
          className="flex items-end gap-2 border-t p-3"
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
        >
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            placeholder="Ask about math, physics, astronomy, coding, quantum…"
            className="min-h-[44px] flex-1 resize-none"
            rows={1}
          />
          <Button type="submit" size="icon" disabled={busy || !input.trim()} aria-label="Send">
            <Send />
          </Button>
        </form>
      </div>
    </div>
  );
}
