"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Check, Plus, Trash2, X, GitCompare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CourseRow {
  id: string;
  code: string;
  title: string;
  category: string;
  credits: number;
  semester: string | null;
  year: number | null;
  sortOrder: number;
  status: string;
  grade: string | null;
  plannedGrade: string | null;
  isTransfer: boolean;
  isGradPrereq: boolean;
  prerequisites: string[];
}

interface PathData {
  id: string;
  name: string;
  type: string;
  isActive: boolean;
  notes: string | null;
  courses: CourseRow[];
}

const GRADES = ["", "A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D", "E"];
const STATUSES = ["PLANNED", "PREPARING", "IN_PROGRESS", "COMPLETED", "TRANSFER"];
const CATEGORIES = ["MATH", "PHYSICS", "ASTRONOMY", "PROGRAMMING", "RESEARCH", "QUANTUM", "GENERAL"];
const SEMESTERS = ["", "Fall", "Spring", "Summer"];

const STATUS_BADGE: Record<string, "default" | "secondary" | "success" | "warning" | "outline"> = {
  PLANNED: "outline",
  PREPARING: "warning",
  IN_PROGRESS: "default",
  COMPLETED: "success",
  TRANSFER: "secondary",
};

async function api(url: string, method: string, body?: unknown) {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? `Request failed (${res.status})`);
  }
  return res.json();
}

export function RoadmapClient({ paths }: { paths: PathData[] }) {
  const router = useRouter();
  const [selectedId, setSelectedId] = React.useState(
    paths.find((p) => p.isActive)?.id ?? paths[0]?.id ?? "",
  );
  const [compareId, setCompareId] = React.useState<string>("");
  const [error, setError] = React.useState<string | null>(null);
  const [showAdd, setShowAdd] = React.useState(false);

  const selected = paths.find((p) => p.id === selectedId);
  const compare = paths.find((p) => p.id === compareId);

  async function run(fn: () => Promise<unknown>) {
    setError(null);
    try {
      await fn();
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    }
  }

  if (!selected) return <p className="text-sm text-muted-foreground">No degree paths yet.</p>;

  const completed = selected.courses.filter((c) => c.status === "COMPLETED" || c.status === "TRANSFER");
  const completedCredits = completed.reduce((a, c) => a + c.credits, 0);
  const totalCredits = selected.courses.reduce((a, c) => a + c.credits, 0);
  const remainingCredits = totalCredits - completedCredits;
  // Graduation estimate: ~12 credits per semester, 2.5 semesters/year online pace.
  const semestersLeft = Math.ceil(remainingCredits / 12);
  const gradDate = new Date();
  gradDate.setMonth(gradDate.getMonth() + Math.round(semestersLeft * (12 / 2.5)));

  const completedCodes = new Set(completed.map((c) => c.code));
  const gradPrereqGaps = paths
    .find((p) => p.type === "GRAD_PREP")
    ?.courses.filter((c) => !completedCodes.has(c.code)) ?? [];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Degree Roadmap</h1>
          <p className="text-sm text-muted-foreground">
            Fully editable — the exact ASU degree isn&apos;t confirmed yet, so keep multiple candidate paths.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={compareId}
            onChange={(e) => setCompareId(e.target.value)}
            className="w-auto"
            aria-label="Compare with path"
          >
            <option value="">Compare with…</option>
            {paths.filter((p) => p.id !== selectedId).map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </Select>
        </div>
      </div>

      {/* Path selector */}
      <div className="flex flex-wrap gap-2">
        {paths.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedId(p.id)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm transition-colors",
              p.id === selectedId
                ? "border-primary bg-primary/15 text-primary"
                : "hover:bg-accent",
            )}
          >
            {p.name}
            {p.isActive && <span className="ml-1.5 text-[10px] uppercase text-emerald-400">active</span>}
          </button>
        ))}
      </div>

      {error && <p className="rounded-md border border-destructive/50 bg-destructive/10 p-2 text-sm text-destructive">{error}</p>}

      {/* Summary row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card><CardContent className="p-4">
          <div className="text-lg font-bold">{completedCredits} / {totalCredits}</div>
          <div className="text-[11px] text-muted-foreground">Credits completed</div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="text-lg font-bold">{remainingCredits}</div>
          <div className="text-[11px] text-muted-foreground">Credits remaining</div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="text-lg font-bold">
            {remainingCredits > 0
              ? gradDate.toLocaleDateString("en-US", { month: "short", year: "numeric" })
              : "Done!"}
          </div>
          <div className="text-[11px] text-muted-foreground">Est. graduation (~12 cr/semester)</div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="text-lg font-bold">{gradPrereqGaps.length}</div>
          <div className="text-[11px] text-muted-foreground">Missing grad-school prereqs</div>
        </CardContent></Card>
      </div>

      {!selected.isActive && (
        <Button size="sm" variant="outline" onClick={() => run(() => api("/api/roadmap/paths", "PATCH", { pathId: selected.id }))}>
          <Check /> Make this my active path
        </Button>
      )}
      {selected.notes && <p className="text-sm text-muted-foreground">{selected.notes}</p>}

      {/* Compare view */}
      {compare && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <GitCompare className="h-4 w-4" /> {selected.name} vs. {compare.name}
            </CardTitle>
            <CardDescription>Courses unique to each path (matched by course code).</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm sm:grid-cols-2">
            {[
              { label: `Only in ${selected.name}`, a: selected, b: compare },
              { label: `Only in ${compare.name}`, a: compare, b: selected },
            ].map(({ label, a, b }) => {
              const bCodes = new Set(b.courses.map((c) => c.code));
              const unique = a.courses.filter((c) => !bCodes.has(c.code));
              return (
                <div key={label}>
                  <div className="mb-1 font-medium">{label} ({unique.length})</div>
                  <ul className="space-y-0.5 text-muted-foreground">
                    {unique.map((c) => <li key={c.id}>{c.code} — {c.title}</li>)}
                    {unique.length === 0 && <li>None</li>}
                  </ul>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Grad prereq gaps */}
      {gradPrereqGaps.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Graduate-school prerequisite gaps</CardTitle>
            <CardDescription>
              Expected by most astrophysics PhD programs but not yet completed in the selected path.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-1.5">
            {gradPrereqGaps.map((c) => (
              <Badge key={c.id} variant="warning">{c.code} {c.title}</Badge>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Course table */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-base">Courses ({selected.courses.length})</CardTitle>
          <Button size="sm" onClick={() => setShowAdd((v) => !v)}>
            {showAdd ? <X /> : <Plus />} {showAdd ? "Cancel" : "Add course"}
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {showAdd && (
            <AddCourseForm
              pathId={selected.id}
              onDone={() => {
                setShowAdd(false);
                router.refresh();
              }}
            />
          )}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-sm">
              <thead>
                <tr className="border-b text-left text-[11px] uppercase text-muted-foreground">
                  <th className="py-2 pr-2">Order</th>
                  <th className="py-2 pr-2">Code</th>
                  <th className="py-2 pr-2">Title</th>
                  <th className="py-2 pr-2">Cr</th>
                  <th className="py-2 pr-2">Term</th>
                  <th className="py-2 pr-2">Status</th>
                  <th className="py-2 pr-2">Grade</th>
                  <th className="py-2 pr-2">Plan</th>
                  <th className="py-2 pr-2">Prereqs</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody>
                {selected.courses.map((c, i) => (
                  <CourseRowView
                    key={c.id}
                    course={c}
                    isFirst={i === 0}
                    isLast={i === selected.courses.length - 1}
                    swapWith={(dir) => {
                      const other = selected.courses[i + dir];
                      if (!other) return;
                      run(async () => {
                        await api(`/api/roadmap/courses/${c.id}`, "PATCH", { sortOrder: other.sortOrder });
                        await api(`/api/roadmap/courses/${other.id}`, "PATCH", { sortOrder: c.sortOrder });
                      });
                    }}
                    update={(patch) => run(() => api(`/api/roadmap/courses/${c.id}`, "PATCH", patch))}
                    remove={() => run(() => api(`/api/roadmap/courses/${c.id}`, "DELETE"))}
                  />
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground">
            Tip: mark a course <em>Preparing</em> to make it your current focus — the dashboard,
            Course Preparation, and the AI tutor all key off it. Prerequisites are edited as
            comma-separated course codes.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function CourseRowView({
  course: c,
  isFirst,
  isLast,
  swapWith,
  update,
  remove,
}: {
  course: CourseRow;
  isFirst: boolean;
  isLast: boolean;
  swapWith: (dir: -1 | 1) => void;
  update: (patch: Record<string, unknown>) => void;
  remove: () => void;
}) {
  const [editingPrereqs, setEditingPrereqs] = React.useState(false);
  const [prereqText, setPrereqText] = React.useState(c.prerequisites.join(", "));

  return (
    <tr className="border-b last:border-0">
      <td className="py-1.5 pr-2">
        <div className="flex flex-col">
          <button disabled={isFirst} onClick={() => swapWith(-1)} className="text-muted-foreground hover:text-foreground disabled:opacity-20" aria-label="Move up">
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
          <button disabled={isLast} onClick={() => swapWith(1)} className="text-muted-foreground hover:text-foreground disabled:opacity-20" aria-label="Move down">
            <ArrowDown className="h-3.5 w-3.5" />
          </button>
        </div>
      </td>
      <td className="py-1.5 pr-2 font-mono text-xs">{c.code}</td>
      <td className="max-w-[220px] py-1.5 pr-2">
        <span className="line-clamp-2">{c.title}</span>
        {c.isTransfer && <Badge variant="secondary" className="ml-1">transfer</Badge>}
      </td>
      <td className="py-1.5 pr-2">{c.credits}</td>
      <td className="py-1.5 pr-2">
        <div className="flex gap-1">
          <Select
            className="h-7 w-[74px] px-1 text-xs"
            value={c.semester ?? ""}
            onChange={(e) => update({ semester: e.target.value || null })}
          >
            {SEMESTERS.map((s) => <option key={s} value={s}>{s || "—"}</option>)}
          </Select>
          <Input
            className="h-7 w-[64px] px-1 text-xs"
            type="number"
            placeholder="Year"
            defaultValue={c.year ?? ""}
            onBlur={(e) => {
              const v = e.target.value ? parseInt(e.target.value, 10) : null;
              if (v !== c.year) update({ year: v });
            }}
          />
        </div>
      </td>
      <td className="py-1.5 pr-2">
        <Select
          className={cn("h-7 w-[110px] px-1 text-xs")}
          value={c.status}
          onChange={(e) => update({ status: e.target.value })}
        >
          {STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ").toLowerCase()}</option>)}
        </Select>
        <Badge variant={STATUS_BADGE[c.status]} className="mt-1 hidden" />
      </td>
      <td className="py-1.5 pr-2">
        <Select
          className="h-7 w-[58px] px-1 text-xs"
          value={c.grade ?? ""}
          onChange={(e) => update({ grade: e.target.value || null })}
        >
          {GRADES.map((g) => <option key={g} value={g}>{g || "—"}</option>)}
        </Select>
      </td>
      <td className="py-1.5 pr-2">
        <Select
          className="h-7 w-[58px] px-1 text-xs"
          value={c.plannedGrade ?? ""}
          onChange={(e) => update({ plannedGrade: e.target.value || null })}
        >
          {GRADES.map((g) => <option key={g} value={g}>{g || "—"}</option>)}
        </Select>
      </td>
      <td className="max-w-[140px] py-1.5 pr-2">
        {editingPrereqs ? (
          <div className="flex gap-1">
            <Input
              className="h-7 w-[120px] px-1 text-xs"
              value={prereqText}
              onChange={(e) => setPrereqText(e.target.value)}
            />
            <button
              className="text-primary"
              aria-label="Save prerequisites"
              onClick={() => {
                update({
                  prerequisites: prereqText
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                });
                setEditingPrereqs(false);
              }}
            >
              <Check className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <button
            className="text-left text-xs text-muted-foreground hover:text-foreground"
            onClick={() => setEditingPrereqs(true)}
            title="Click to edit prerequisites"
          >
            {c.prerequisites.length ? c.prerequisites.join(", ") : "— none —"}
          </button>
        )}
      </td>
      <td className="py-1.5 text-right">
        <button
          onClick={() => {
            if (confirm(`Remove ${c.code} from this path?`)) remove();
          }}
          className="text-muted-foreground hover:text-destructive"
          aria-label={`Remove ${c.code}`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </td>
    </tr>
  );
}

function AddCourseForm({ pathId, onDone }: { pathId: string; onDone: () => void }) {
  const [form, setForm] = React.useState({
    code: "",
    title: "",
    category: "GENERAL",
    credits: "3",
    isTransfer: false,
  });
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api("/api/roadmap/courses", "POST", {
        pathId,
        code: form.code,
        title: form.title,
        category: form.category,
        credits: parseFloat(form.credits),
        isTransfer: form.isTransfer,
        status: form.isTransfer ? "TRANSFER" : "PLANNED",
      });
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add course");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-wrap items-end gap-2 rounded-md border p-3">
      <div>
        <label className="text-[11px] text-muted-foreground">Code</label>
        <Input required placeholder="AST 494" className="w-28" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
      </div>
      <div className="min-w-[180px] flex-1">
        <label className="text-[11px] text-muted-foreground">Title</label>
        <Input required placeholder="Special Topics" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      </div>
      <div>
        <label className="text-[11px] text-muted-foreground">Category</label>
        <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c.toLowerCase()}</option>)}
        </Select>
      </div>
      <div>
        <label className="text-[11px] text-muted-foreground">Credits</label>
        <Input type="number" step="0.5" min="0" max="12" className="w-20" value={form.credits} onChange={(e) => setForm({ ...form, credits: e.target.value })} />
      </div>
      <label className="flex items-center gap-1.5 pb-2 text-sm">
        <input type="checkbox" checked={form.isTransfer} onChange={(e) => setForm({ ...form, isTransfer: e.target.checked })} />
        Transfer credit
      </label>
      <Button type="submit" size="sm" disabled={saving}>
        {saving ? "Adding…" : "Add"}
      </Button>
      {error && <p className="w-full text-sm text-destructive">{error}</p>}
    </form>
  );
}
