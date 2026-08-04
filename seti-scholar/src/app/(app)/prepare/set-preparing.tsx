"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function SetPreparingButton({ courseId }: { courseId: string }) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);

  return (
    <Button
      size="sm"
      variant="ghost"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await fetch(`/api/roadmap/courses/${courseId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "PREPARING" }),
        });
        setBusy(false);
        router.refresh();
      }}
    >
      Set as focus
    </Button>
  );
}
