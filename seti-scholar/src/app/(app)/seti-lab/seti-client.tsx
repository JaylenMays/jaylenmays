"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Circle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function ProjectMilestones({
  projectId,
  milestones,
}: {
  projectId: string;
  milestones: { title: string; done: boolean }[];
}) {
  const router = useRouter();
  const [busy, setBusy] = React.useState<number | null>(null);

  return (
    <ul className="space-y-1">
      {milestones.map((m, i) => (
        <li key={i}>
          <button
            disabled={busy === i}
            onClick={async () => {
              setBusy(i);
              await fetch("/api/research", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ projectId, milestoneIndex: i, done: !m.done }),
              });
              setBusy(null);
              router.refresh();
            }}
            className={cn(
              "flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent",
              m.done && "text-muted-foreground",
            )}
          >
            {m.done ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
            ) : (
              <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            )}
            <span className={cn(m.done && "line-through")}>{m.title}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

export function MilestoneToggle({
  id,
  title,
  description,
  completed,
}: {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);

  return (
    <button
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await fetch(`/api/milestones/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ completed: !completed }),
        });
        setBusy(false);
        router.refresh();
      }}
      className="flex w-full items-start gap-2 rounded-md border p-2.5 text-left hover:bg-accent"
    >
      {completed ? (
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
      ) : (
        <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      )}
      <span>
        <span className={cn("block text-sm font-medium", completed && "line-through opacity-60")}>
          {title}
        </span>
        <span className="block text-xs text-muted-foreground">{description}</span>
      </span>
    </button>
  );
}

const AREAS = ["technosignatures", "radio astronomy", "signal processing", "machine learning", "exoplanets", "astrobiology", "quantum computing"];

export function NewProjectForm() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [area, setArea] = React.useState(AREAS[0]);
  const [description, setDescription] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  if (!open) {
    return (
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Plus /> New research project
      </Button>
    );
  }

  return (
    <Card>
      <CardContent className="space-y-2 p-4">
        <Input placeholder="Project title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Select value={area} onChange={(e) => setArea(e.target.value)}>
          {AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
        </Select>
        <Textarea
          placeholder="What will you build/analyze, and what's the deliverable?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="flex gap-2">
          <Button
            disabled={busy || !title}
            onClick={async () => {
              setBusy(true);
              await fetch("/api/research", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, area, description }),
              });
              setBusy(false);
              setOpen(false);
              setTitle("");
              setDescription("");
              router.refresh();
            }}
          >
            {busy ? "Creating…" : "Create"}
          </Button>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
        </div>
      </CardContent>
    </Card>
  );
}
