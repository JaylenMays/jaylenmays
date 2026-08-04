"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Settings {
  aiProvider: "anthropic" | "openai" | "offline";
  aiModel: string;
  tutorStyle: "socratic" | "direct" | "detailed";
  targetGpa: number;
  weeklyStudyHoursGoal: number;
  dailyReviewGoal: number;
  remindersEnabled: boolean;
}

const MODELS: Record<string, string[]> = {
  anthropic: ["claude-sonnet-5", "claude-opus-5", "claude-haiku-4-5-20251001"],
  openai: ["gpt-4o", "gpt-4o-mini"],
  offline: ["offline-tutor"],
};

export function SettingsClient({
  settings: initial,
  keysConfigured,
  userEmail,
}: {
  settings: Settings;
  keysConfigured: { anthropic: boolean; openai: boolean };
  userEmail: string;
}) {
  const router = useRouter();
  const [s, setS] = React.useState<Settings>(initial);
  const [busy, setBusy] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function save() {
    setBusy(true);
    setMessage(null);
    setError(null);
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(s),
    });
    setBusy(false);
    if (res.ok) {
      setMessage("Settings saved.");
      router.refresh();
    } else {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Failed to save");
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Settings &amp; AI Configuration</h1>
        <p className="text-sm text-muted-foreground">Signed in as {userEmail}</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">AI tutor</CardTitle>
          <CardDescription>
            API keys are configured server-side via environment variables (ANTHROPIC_API_KEY /
            OPENAI_API_KEY) and never touch the browser. Status:{" "}
            <Badge variant={keysConfigured.anthropic ? "success" : "outline"} className="mr-1">
              Anthropic {keysConfigured.anthropic ? "configured" : "not set"}
            </Badge>
            <Badge variant={keysConfigured.openai ? "success" : "outline"}>
              OpenAI {keysConfigured.openai ? "configured" : "not set"}
            </Badge>
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Provider</Label>
            <Select
              value={s.aiProvider}
              onChange={(e) => {
                const p = e.target.value as Settings["aiProvider"];
                setS({ ...s, aiProvider: p, aiModel: MODELS[p][0] });
              }}
            >
              <option value="anthropic">Anthropic (Claude)</option>
              <option value="openai">OpenAI</option>
              <option value="offline">Offline tutor (no API key)</option>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Model</Label>
            <Select value={s.aiModel} onChange={(e) => setS({ ...s, aiModel: e.target.value })}>
              {(MODELS[s.aiProvider] ?? []).map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </Select>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Teaching style</Label>
            <Select
              value={s.tutorStyle}
              onChange={(e) => setS({ ...s, tutorStyle: e.target.value as Settings["tutorStyle"] })}
            >
              <option value="socratic">Socratic — guide me with questions</option>
              <option value="detailed">Detailed — full derivations and worked examples</option>
              <option value="direct">Direct — answer first, brief explanation after</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Goals</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label>Target GPA</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              max="4.33"
              value={s.targetGpa}
              onChange={(e) => setS({ ...s, targetGpa: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Weekly study hours</Label>
            <Input
              type="number"
              min="1"
              max="80"
              value={s.weeklyStudyHoursGoal}
              onChange={(e) => setS({ ...s, weeklyStudyHoursGoal: parseInt(e.target.value, 10) || 1 })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Daily review cards</Label>
            <Input
              type="number"
              min="1"
              max="500"
              value={s.dailyReviewGoal}
              onChange={(e) => setS({ ...s, dailyReviewGoal: parseInt(e.target.value, 10) || 1 })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Reminders</CardTitle>
          <CardDescription>
            The scheduled job (see README) creates review reminders when cards come due.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <Label htmlFor="reminders">Spaced-repetition reminders</Label>
          <Switch
            id="reminders"
            checked={s.remindersEnabled}
            onCheckedChange={(v) => setS({ ...s, remindersEnabled: v })}
          />
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button onClick={save} disabled={busy}>
          <Save /> {busy ? "Saving…" : "Save settings"}
        </Button>
        {message && <span className="text-sm text-emerald-400">{message}</span>}
        {error && <span className="text-sm text-destructive">{error}</span>}
      </div>
    </div>
  );
}
