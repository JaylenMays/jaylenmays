"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ModuleOption {
  key: string;
  title: string;
}

interface Question {
  id: string;
  prompt: string;
  choices: string[];
  topic: string;
  difficulty: number;
  correctIndex?: number;
  explanation?: string;
}

interface SubmitResult {
  score: number;
  total: number;
  accuracy: number;
  newReviewCards: number;
  results: {
    questionId: string;
    prompt: string;
    selectedIndex: number;
    correctIndex: number;
    isCorrect: boolean;
    explanation: string;
    topic: string;
  }[];
}

export function QuizRunner({
  modules,
  mode,
  initialModule,
  title,
  description,
}: {
  modules: ModuleOption[];
  mode: "practice" | "quiz" | "exam";
  initialModule?: string;
  title: string;
  description: string;
}) {
  const router = useRouter();
  const [moduleKey, setModuleKey] = React.useState(initialModule ?? modules[0]?.key ?? "");
  const [count, setCount] = React.useState(mode === "exam" ? "20" : "10");
  const [attemptId, setAttemptId] = React.useState<string | null>(null);
  const [questions, setQuestions] = React.useState<Question[]>([]);
  const [answers, setAnswers] = React.useState<Record<string, number>>({});
  const [current, setCurrent] = React.useState(0);
  const [revealed, setRevealed] = React.useState(false);
  const [result, setResult] = React.useState<SubmitResult | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function start() {
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/quiz/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moduleKey, mode, count: parseInt(count, 10) }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Could not start");
      }
      const data = await res.json();
      setAttemptId(data.attemptId);
      setQuestions(data.questions);
      setAnswers({});
      setCurrent(0);
      setRevealed(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function submitAll(finalAnswers: Record<string, number>) {
    if (!attemptId) return;
    setBusy(true);
    try {
      const res = await fetch("/api/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attemptId,
          answers: Object.entries(finalAnswers).map(([questionId, selectedIndex]) => ({
            questionId,
            selectedIndex,
          })),
        }),
      });
      if (!res.ok) throw new Error("Submission failed");
      setResult(await res.json());
      setAttemptId(null);
      setQuestions([]);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  const q = questions[current];
  const answered = q !== undefined && answers[q.id] !== undefined;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      {/* Setup */}
      {questions.length === 0 && !result && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Choose your material</CardTitle>
            <CardDescription>
              {mode === "exam"
                ? "Exam mode pulls extra questions from topics you've previously missed."
                : mode === "practice"
                  ? "Practice mode gives instant feedback and explanations after each question."
                  : "Quiz mode grades at the end; missed questions become review cards automatically."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap items-end gap-3">
            <div className="min-w-[220px] flex-1">
              <label className="text-[11px] text-muted-foreground">Module</label>
              <Select value={moduleKey} onChange={(e) => setModuleKey(e.target.value)}>
                {mode === "exam" && <option value="__all__">All modules (comprehensive)</option>}
                {modules.map((m) => (
                  <option key={m.key} value={m.key}>{m.title}</option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground">Questions</label>
              <Select value={count} onChange={(e) => setCount(e.target.value)} className="w-24">
                {["5", "10", "15", "20", "30"].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </Select>
            </div>
            <Button onClick={start} disabled={busy || !moduleKey}>
              {busy ? "Loading…" : "Start"}
            </Button>
            {error && <p className="w-full text-sm text-destructive">{error}</p>}
          </CardContent>
        </Card>
      )}

      {/* Active question */}
      {q && (
        <Card>
          <CardHeader className="pb-3">
            <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
              <span>Question {current + 1} of {questions.length}</span>
              <Badge variant="outline">{q.topic}</Badge>
            </div>
            <Progress value={((current + (answered ? 1 : 0)) / questions.length) * 100} />
            <CardTitle className="pt-3 text-base leading-relaxed">{q.prompt}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {q.choices.map((choice, i) => {
              const selected = answers[q.id] === i;
              const showFeedback = mode === "practice" && revealed;
              const isCorrect = showFeedback && i === q.correctIndex;
              const isWrongPick = showFeedback && selected && i !== q.correctIndex;
              return (
                <button
                  key={i}
                  disabled={mode === "practice" && revealed}
                  onClick={() => {
                    setAnswers((a) => ({ ...a, [q.id]: i }));
                    if (mode === "practice") setRevealed(true);
                  }}
                  className={cn(
                    "flex w-full items-start gap-2 rounded-md border p-3 text-left text-sm transition-colors",
                    selected && !showFeedback && "border-primary bg-primary/10",
                    isCorrect && "border-emerald-500 bg-emerald-500/10",
                    isWrongPick && "border-destructive bg-destructive/10",
                    !selected && !showFeedback && "hover:bg-accent",
                  )}
                >
                  <span className="font-mono text-xs text-muted-foreground">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="flex-1">{choice}</span>
                  {isCorrect && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />}
                  {isWrongPick && <XCircle className="h-4 w-4 shrink-0 text-destructive" />}
                </button>
              );
            })}

            {mode === "practice" && revealed && q.explanation && (
              <div className="rounded-md border bg-muted/40 p-3 text-sm">
                <span className="font-medium">Explanation: </span>
                {q.explanation}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              {mode === "practice" ? (
                <Button
                  size="sm"
                  disabled={!revealed}
                  onClick={() => {
                    if (current + 1 < questions.length) {
                      setCurrent((c) => c + 1);
                      setRevealed(false);
                    } else {
                      submitAll(answers);
                    }
                  }}
                >
                  {current + 1 < questions.length ? "Next question" : "Finish & save results"}
                </Button>
              ) : (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={current === 0}
                    onClick={() => setCurrent((c) => c - 1)}
                  >
                    Back
                  </Button>
                  {current + 1 < questions.length ? (
                    <Button size="sm" disabled={!answered} onClick={() => setCurrent((c) => c + 1)}>
                      Next
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      disabled={busy || Object.keys(answers).length < questions.length}
                      onClick={() => submitAll(answers)}
                    >
                      {busy ? "Grading…" : "Submit for grading"}
                    </Button>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {result && (
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">{result.accuracy}%</CardTitle>
            <CardDescription>
              {result.score} / {result.total} correct
              {result.newReviewCards > 0 &&
                ` · ${result.newReviewCards} missed question${result.newReviewCards === 1 ? "" : "s"} added to spaced repetition`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {result.results.filter((r) => !r.isCorrect).map((r) => (
              <div key={r.questionId} className="rounded-md border border-destructive/40 p-3 text-sm">
                <div className="mb-1 font-medium">{r.prompt}</div>
                <div className="text-muted-foreground">
                  <span className="text-destructive">Your answer was incorrect.</span>{" "}
                  {r.explanation}
                </div>
              </div>
            ))}
            <div className="flex justify-center pt-2">
              <Button variant="outline" onClick={() => setResult(null)}>
                <RefreshCcw /> Another round
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
