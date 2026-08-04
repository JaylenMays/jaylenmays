"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { cn, formatDate } from "@/lib/utils";
import { CheckCircle2, Circle } from "lucide-react";

export interface TaskItem {
  id: string;
  title: string;
  kind: string;
  dueAt: string | null;
  completed: boolean;
}

export function TaskList({ tasks }: { tasks: TaskItem[] }) {
  const router = useRouter();
  const [pending, setPending] = React.useState<string | null>(null);

  async function toggle(task: TaskItem) {
    setPending(task.id);
    await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !task.completed }),
    });
    setPending(null);
    router.refresh();
  }

  if (tasks.length === 0) {
    return <p className="text-sm text-muted-foreground">Nothing scheduled — nice and clear.</p>;
  }

  return (
    <ul className="space-y-2">
      {tasks.map((t) => (
        <li key={t.id}>
          <button
            onClick={() => toggle(t)}
            disabled={pending === t.id}
            className={cn(
              "flex w-full items-start gap-2 rounded-md border p-2 text-left text-sm transition-colors hover:bg-accent",
              t.completed && "opacity-50",
            )}
          >
            {t.completed ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            ) : (
              <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            )}
            <span className="flex-1">
              <span className={cn(t.completed && "line-through")}>{t.title}</span>
              <span className="block text-[11px] text-muted-foreground">
                {t.kind} · due {formatDate(t.dueAt)}
              </span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
