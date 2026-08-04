"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Code2, Eye, Lightbulb, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Challenge {
  id: string;
  key: string;
  title: string;
  track: string;
  prompt: string;
  starterCode: string;
  solution: string;
  hints: string[];
  solved: boolean;
}

const TRACK_LABELS: Record<string, string> = {
  python: "Python",
  numpy: "NumPy",
  scipy: "SciPy",
  signal: "Signal Processing",
  ml: "Machine Learning",
  quantum: "Quantum",
};

export function CodingClient({ challenges }: { challenges: Challenge[] }) {
  const router = useRouter();
  const [selectedKey, setSelectedKey] = React.useState(challenges[0]?.key ?? "");
  const [code, setCode] = React.useState(challenges[0]?.starterCode ?? "");
  const [hintsShown, setHintsShown] = React.useState(0);
  const [showSolution, setShowSolution] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [savedMsg, setSavedMsg] = React.useState<string | null>(null);

  const challenge = challenges.find((c) => c.key === selectedKey);

  function select(c: Challenge) {
    setSelectedKey(c.key);
    setCode(c.starterCode);
    setHintsShown(0);
    setShowSolution(false);
    setSavedMsg(null);
  }

  async function submit(status: "attempted" | "solved") {
    if (!challenge) return;
    setBusy(true);
    const res = await fetch("/api/coding/submission", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ challengeId: challenge.id, code, status }),
    });
    setBusy(false);
    if (res.ok) {
      setSavedMsg(status === "solved" ? "Marked as solved 🎉" : "Progress saved");
      router.refresh();
    }
  }

  const solvedCount = challenges.filter((c) => c.solved).length;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Coding Lab</h1>
        <p className="text-sm text-muted-foreground">
          Python, NumPy, and signal-processing challenges drawn from real SETI workflows ·{" "}
          {solvedCount}/{challenges.length} solved. Write code here, run it in any Python
          environment, and save your work.
        </p>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row">
        {/* Challenge list */}
        <aside className="w-full shrink-0 space-y-1.5 lg:w-72">
          {challenges.map((c) => (
            <button
              key={c.key}
              onClick={() => select(c)}
              className={cn(
                "flex w-full items-center gap-2 rounded-md border p-2.5 text-left text-sm transition-colors hover:bg-accent",
                c.key === selectedKey && "border-primary bg-primary/10",
              )}
            >
              {c.solved ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              ) : (
                <Code2 className="h-4 w-4 shrink-0 text-muted-foreground" />
              )}
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{c.title}</span>
                <Badge variant="outline" className="mt-0.5">{TRACK_LABELS[c.track] ?? c.track}</Badge>
              </span>
            </button>
          ))}
        </aside>

        {/* Editor */}
        {challenge && (
          <Card className="min-w-0 flex-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{challenge.title}</CardTitle>
              <CardDescription>{challenge.prompt}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck={false}
                className="h-72 w-full resize-y rounded-md border bg-muted/40 p-3 font-mono text-xs leading-relaxed focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
              <div className="flex flex-wrap items-center gap-2">
                <Button size="sm" variant="outline" disabled={busy} onClick={() => submit("attempted")}>
                  <Save /> Save progress
                </Button>
                <Button size="sm" disabled={busy} onClick={() => submit("solved")}>
                  <CheckCircle2 /> Mark solved
                </Button>
                {hintsShown < challenge.hints.length && (
                  <Button size="sm" variant="ghost" onClick={() => setHintsShown((h) => h + 1)}>
                    <Lightbulb /> Hint ({hintsShown}/{challenge.hints.length})
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={() => setShowSolution((v) => !v)}>
                  <Eye /> {showSolution ? "Hide" : "Show"} solution
                </Button>
                {savedMsg && <span className="text-xs text-emerald-400">{savedMsg}</span>}
              </div>

              {challenge.hints.slice(0, hintsShown).map((h, i) => (
                <div key={i} className="rounded-md border border-amber-500/30 bg-amber-500/10 p-2.5 text-sm">
                  💡 {h}
                </div>
              ))}

              {showSolution && (
                <pre className="overflow-x-auto rounded-md border bg-muted/40 p-3 font-mono text-xs leading-relaxed">
                  {challenge.solution}
                </pre>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
