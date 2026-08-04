"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { FileUp, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PathOption {
  id: string;
  name: string;
  isActive: boolean;
}

interface ParsedCourse {
  code: string;
  title: string;
  credits: number;
  grade: string | null;
  semester: string | null;
  year: number | null;
}

const EXAMPLE = `MAT 265 Calculus for Engineers I 3 A- Fall 2025
PHY 121 - University Physics I (4 credits) Spring 2026
AST 111, Introduction to Astronomy, 4
ENG 101 First-Year Composition 3 B+ FA25`;

export function AdvisorImportClient({ paths }: { paths: PathOption[] }) {
  const router = useRouter();
  const [text, setText] = React.useState("");
  const [pathId, setPathId] = React.useState(paths.find((p) => p.isActive)?.id ?? paths[0]?.id ?? "");
  const [preview, setPreview] = React.useState<ParsedCourse[] | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function run(doImport: boolean) {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/advisor-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          targetPathId: doImport ? pathId : undefined,
          markCompleted: false,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Import failed");
      }
      const data = await res.json();
      setPreview(data.parsed);
      if (doImport) {
        setMessage(
          `Imported/updated ${data.importedCount} course${data.importedCount === 1 ? "" : "s"} into the selected path.`,
        );
        router.refresh();
      } else if (data.parsed.length === 0) {
        setError("No course lines recognized — check that each line contains a course code like MAT 265.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Paste your plan</CardTitle>
        <CardDescription>
          One course per line. Grades and terms are optional — graded courses import as completed.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Textarea
          rows={8}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={EXAMPLE}
          className="font-mono text-xs"
        />
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setText(EXAMPLE)}>
            Use example
          </Button>
          <Button size="sm" variant="secondary" disabled={busy || text.length < 10} onClick={() => run(false)}>
            <Search /> Preview parse
          </Button>
          <Select value={pathId} onChange={(e) => setPathId(e.target.value)} className="w-auto">
            {paths.map((p) => (
              <option key={p.id} value={p.id}>{p.name}{p.isActive ? " (active)" : ""}</option>
            ))}
          </Select>
          <Button size="sm" disabled={busy || text.length < 10 || !pathId} onClick={() => run(true)}>
            <FileUp /> Import into path
          </Button>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        {message && <p className="text-sm text-emerald-400">{message}</p>}

        {preview && preview.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="border-b text-left text-[11px] uppercase text-muted-foreground">
                  <th className="py-2 pr-2">Code</th>
                  <th className="py-2 pr-2">Title</th>
                  <th className="py-2 pr-2">Credits</th>
                  <th className="py-2 pr-2">Grade</th>
                  <th className="py-2">Term</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((c) => (
                  <tr key={c.code} className="border-b last:border-0">
                    <td className="py-1.5 pr-2 font-mono text-xs">{c.code}</td>
                    <td className="py-1.5 pr-2">{c.title}</td>
                    <td className="py-1.5 pr-2">{c.credits}</td>
                    <td className="py-1.5 pr-2">{c.grade ?? "—"}</td>
                    <td className="py-1.5">
                      {c.semester ? `${c.semester} ${c.year ?? ""}` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
