"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Layers, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DueCard {
  id: string;
  front: string;
  back: string;
  topic: string;
  intervalDays: number;
}

const RATINGS = [
  { key: "again", label: "Again", hint: "< 10 min", variant: "destructive" as const },
  { key: "hard", label: "Hard", hint: "shorter interval", variant: "outline" as const },
  { key: "good", label: "Good", hint: "normal interval", variant: "secondary" as const },
  { key: "easy", label: "Easy", hint: "longer interval", variant: "default" as const },
];

export function ReviewClient({
  dueCards,
  upcomingCount,
  totalCount,
}: {
  dueCards: DueCard[];
  upcomingCount: number;
  totalCount: number;
}) {
  const router = useRouter();
  const [queue, setQueue] = React.useState(dueCards);
  const [flipped, setFlipped] = React.useState(false);
  const [reviewed, setReviewed] = React.useState(0);
  const [busy, setBusy] = React.useState(false);
  const [showAdd, setShowAdd] = React.useState(false);
  const card = queue[0];

  async function rate(rating: string) {
    if (!card || busy) return;
    setBusy(true);
    const res = await fetch("/api/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cardId: card.id, rating }),
    });
    setBusy(false);
    if (res.ok) {
      setQueue((q) => q.slice(1));
      setFlipped(false);
      setReviewed((r) => r + 1);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">Spaced Repetition</h1>
          <p className="text-sm text-muted-foreground">
            SM-2 scheduling: cards you find hard return sooner, mastered ones stretch out for weeks.
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={() => setShowAdd((v) => !v)}>
          <Plus /> New card
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card><CardContent className="p-4 text-center">
          <div className="text-xl font-bold">{queue.length}</div>
          <div className="text-[11px] text-muted-foreground">due now</div>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <div className="text-xl font-bold">{reviewed}</div>
          <div className="text-[11px] text-muted-foreground">reviewed today</div>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <div className="text-xl font-bold">{totalCount}</div>
          <div className="text-[11px] text-muted-foreground">total cards</div>
        </CardContent></Card>
      </div>

      {showAdd && <AddCardForm onDone={() => { setShowAdd(false); router.refresh(); }} />}

      {card ? (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Badge variant="outline">{card.topic}</Badge>
              <span className="text-[11px] text-muted-foreground">
                interval: {card.intervalDays < 1 ? "new" : `${Math.round(card.intervalDays)} d`}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <button
              onClick={() => setFlipped(true)}
              className="block w-full cursor-pointer rounded-md border bg-muted/30 p-6 text-center"
            >
              <div className="text-base font-medium">{card.front}</div>
              {flipped ? (
                <div className="mt-4 whitespace-pre-wrap border-t pt-4 text-sm text-muted-foreground">
                  {card.back}
                </div>
              ) : (
                <div className="mt-4 text-xs text-muted-foreground">tap to reveal</div>
              )}
            </button>
            {flipped && (
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {RATINGS.map((r) => (
                  <Button
                    key={r.key}
                    variant={r.variant}
                    disabled={busy}
                    onClick={() => rate(r.key)}
                    className="flex-col gap-0 py-5"
                  >
                    <span>{r.label}</span>
                    <span className="text-[10px] opacity-70">{r.hint}</span>
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="items-center text-center">
            <Layers className="mb-2 h-8 w-8 text-primary" />
            <CardTitle>All caught up</CardTitle>
            <CardDescription>
              {reviewed > 0 && `${reviewed} card${reviewed === 1 ? "" : "s"} reviewed this session. `}
              {upcomingCount > 0
                ? `${upcomingCount} card${upcomingCount === 1 ? "" : "s"} scheduled for later — the SM-2 algorithm will bring them back at the right moment.`
                : "Miss a quiz question or add cards manually to build your deck."}
            </CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}

function AddCardForm({ onDone }: { onDone: () => void }) {
  const [front, setFront] = React.useState("");
  const [back, setBack] = React.useState("");
  const [topic, setTopic] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  return (
    <Card>
      <CardContent className="space-y-2 p-4">
        <Input placeholder="Front (question/prompt)" value={front} onChange={(e) => setFront(e.target.value)} />
        <Textarea placeholder="Back (answer/explanation)" value={back} onChange={(e) => setBack(e.target.value)} />
        <div className="flex gap-2">
          <Input placeholder="Topic (e.g. calculus)" value={topic} onChange={(e) => setTopic(e.target.value)} className="flex-1" />
          <Button
            disabled={busy || !front || !back || !topic}
            onClick={async () => {
              setBusy(true);
              await fetch("/api/review", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ front, back, topic }),
              });
              setBusy(false);
              onDone();
            }}
          >
            {busy ? "Saving…" : "Add card"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
