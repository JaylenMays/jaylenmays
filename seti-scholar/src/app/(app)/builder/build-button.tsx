"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Bot, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

const STAGES = [
  "Discovering sources…",
  "Verifying licenses & scoring…",
  "Designing curriculum…",
  "Writing lessons…",
  "Generating assessments…",
  "Validating mathematics…",
  "Reviewing accuracy…",
  "Checking citations…",
  "Publishing…",
];

export function BuildCourseButton({
  courseCode,
  rebuild,
}: {
  courseCode: string;
  rebuild: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);
  const [stageIdx, setStageIdx] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!busy) return;
    const t = setInterval(() => setStageIdx((i) => Math.min(i + 1, STAGES.length - 1)), 2500);
    return () => clearInterval(t);
  }, [busy]);

  async function build() {
    setBusy(true);
    setStageIdx(0);
    setError(null);
    try {
      const res = await fetch("/api/agents/build-course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseCode }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Build failed");
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Build failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className="flex items-center gap-2">
      <Button
        size="sm"
        variant={rebuild ? "outline" : "default"}
        disabled={busy}
        onClick={build}
        aria-label={`${rebuild ? "Rebuild" : "Build"} curriculum for ${courseCode}`}
      >
        {busy ? <RefreshCcw className="animate-spin" /> : <Bot />}
        {busy ? STAGES[stageIdx] : rebuild ? "Rebuild" : "Build curriculum"}
      </Button>
      {error && <span className="text-xs text-destructive">{error}</span>}
    </span>
  );
}
