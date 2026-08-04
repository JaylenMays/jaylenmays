"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CompleteLessonButton({
  slug,
  completed,
  minutes,
}: {
  slug: string;
  completed: boolean;
  minutes: number;
}) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);

  if (completed) {
    return (
      <Button size="sm" variant="secondary" disabled>
        <CheckCircle2 /> Completed
      </Button>
    );
  }

  return (
    <Button
      size="sm"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await fetch(`/api/lessons/${slug}/progress`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "completed", secondsSpent: minutes * 60 }),
        });
        setBusy(false);
        router.refresh();
      }}
    >
      <CheckCircle2 /> Mark complete
    </Button>
  );
}
