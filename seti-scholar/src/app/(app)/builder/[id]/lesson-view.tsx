"use client";

import * as React from "react";
import { ChevronDown, CheckCircle2, GraduationCap, FlaskConical, Stethoscope } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface LessonData {
  id: string;
  kind: string;
  title: string;
  objectives: string[];
  prereqConcepts: string[];
  originalExplanation: string;
  formalExplanation: string;
  workedExamples: { problem: string; steps: string[]; answer: string }[];
  practiceProblems: { prompt: string; answer: string; solution: string; validated: boolean; difficulty: number }[];
  commonMistakes: string[];
  setiApplication: string;
  masteryCriteria: string[];
  followUp: { title: string; url: string }[];
  qualityScore: number;
  reviewStatus: string;
  reviewNotes: string;
  writtenBy: string;
  reviewedBy: string;
  citations: { title: string; url: string; note: string; quality: number }[];
}

const KIND_META: Record<string, { label: string; icon: typeof GraduationCap; badge: "default" | "secondary" | "warning" | "success" }> = {
  diagnostic: { label: "Diagnostic exam", icon: Stethoscope, badge: "warning" },
  lesson: { label: "Lesson", icon: GraduationCap, badge: "secondary" },
  remediation: { label: "Remediation", icon: FlaskConical, badge: "warning" },
  readiness_exam: { label: "Readiness exam", icon: CheckCircle2, badge: "success" },
};

export function LessonAccordion({ lessons }: { lessons: LessonData[] }) {
  const [openId, setOpenId] = React.useState<string | null>(lessons[0]?.id ?? null);

  return (
    <div className="space-y-2">
      {lessons.map((l) => {
        const meta = KIND_META[l.kind] ?? KIND_META.lesson;
        const Icon = meta.icon;
        const open = openId === l.id;
        return (
          <Card key={l.id}>
            <button
              className="flex w-full items-center gap-3 p-4 text-left"
              onClick={() => setOpenId(open ? null : l.id)}
            >
              <Icon className="h-4 w-4 shrink-0 text-primary" />
              <span className="flex-1 font-medium">{l.title}</span>
              <Badge variant={meta.badge}>{meta.label}</Badge>
              <Badge variant="outline">quality {l.qualityScore}</Badge>
              <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
            </button>

            {open && (
              <CardContent className="space-y-4 border-t pt-4 text-sm">
                {/* provenance */}
                <div className="flex flex-wrap gap-1.5 text-xs">
                  <Badge variant="outline">written by {l.writtenBy}</Badge>
                  <Badge variant="outline">reviewed by {l.reviewedBy || "—"}</Badge>
                  <Badge variant={l.reviewStatus === "approved" ? "success" : "warning"}>
                    review: {l.reviewStatus}
                  </Badge>
                </div>
                {l.reviewNotes && (
                  <p className="text-xs text-muted-foreground">Reviewer notes: {l.reviewNotes}</p>
                )}

                {l.objectives.length > 0 && (
                  <Section title="Learning objectives">
                    <ul className="list-disc space-y-0.5 pl-5">
                      {l.objectives.map((o) => <li key={o}>{o}</li>)}
                    </ul>
                  </Section>
                )}

                {l.prereqConcepts.length > 0 && (
                  <Section title="Prerequisite concepts">
                    <div className="flex flex-wrap gap-1.5">
                      {l.prereqConcepts.map((p) => <Badge key={p} variant="secondary">{p}</Badge>)}
                    </div>
                  </Section>
                )}

                <Section title="Explanation">
                  <p className="whitespace-pre-wrap leading-relaxed">{l.originalExplanation}</p>
                </Section>

                <Section title="Formal treatment">
                  <p className="whitespace-pre-wrap rounded-md bg-muted/40 p-3 font-mono text-xs leading-relaxed">
                    {l.formalExplanation}
                  </p>
                </Section>

                {l.workedExamples.length > 0 && (
                  <Section title="Worked examples">
                    <div className="space-y-2">
                      {l.workedExamples.map((w, i) => (
                        <div key={i} className="rounded-md border p-3">
                          <p className="mb-1 font-medium">{w.problem}</p>
                          <ol className="list-decimal space-y-0.5 pl-5 text-muted-foreground">
                            {w.steps.map((s, j) => <li key={j}>{s}</li>)}
                          </ol>
                          <p className="mt-1"><span className="font-medium">Answer:</span> {w.answer}</p>
                        </div>
                      ))}
                    </div>
                  </Section>
                )}

                {l.practiceProblems.length > 0 && (
                  <Section title={`Practice problems (${l.practiceProblems.length})`}>
                    <div className="space-y-2">
                      {l.practiceProblems.map((p, i) => (
                        <details key={i} className="rounded-md border p-3">
                          <summary className="cursor-pointer">
                            {p.prompt}{" "}
                            <span className="ml-1 inline-flex gap-1 align-middle">
                              <Badge variant="outline">difficulty {p.difficulty}</Badge>
                              {p.validated && <Badge variant="success">✓ machine-validated</Badge>}
                            </span>
                          </summary>
                          <div className="mt-2 space-y-1 text-muted-foreground">
                            <p><span className="font-medium text-foreground">Answer:</span> {p.answer}</p>
                            <p><span className="font-medium text-foreground">Solution:</span> {p.solution}</p>
                          </div>
                        </details>
                      ))}
                    </div>
                  </Section>
                )}

                {l.commonMistakes.length > 0 && (
                  <Section title="Common mistakes">
                    <ul className="list-disc space-y-0.5 pl-5 text-muted-foreground">
                      {l.commonMistakes.map((m) => <li key={m}>{m}</li>)}
                    </ul>
                  </Section>
                )}

                {l.setiApplication && (
                  <Section title="Astronomy / SETI application">
                    <p className="rounded-md border border-primary/30 bg-primary/5 p-3">{l.setiApplication}</p>
                  </Section>
                )}

                {l.masteryCriteria.length > 0 && (
                  <Section title="Mastery criteria">
                    <ul className="list-disc space-y-0.5 pl-5">
                      {l.masteryCriteria.map((m) => <li key={m}>{m}</li>)}
                    </ul>
                  </Section>
                )}

                <Section title={`Sources cited (${l.citations.length})`}>
                  <ul className="space-y-1">
                    {l.citations.map((c, i) => (
                      <li key={i} className="text-xs">
                        <a href={c.url} target="_blank" rel="noreferrer" className="text-primary underline underline-offset-2">
                          {c.title}
                        </a>{" "}
                        <span className="text-muted-foreground">(quality {c.quality}/100) — {c.note}</span>
                      </li>
                    ))}
                  </ul>
                </Section>

                {l.followUp.length > 0 && (
                  <Section title="Follow-up resources">
                    <ul className="space-y-0.5 text-xs">
                      {l.followUp.map((f, i) => (
                        <li key={i}>
                          <a href={f.url} target="_blank" rel="noreferrer" className="text-primary underline underline-offset-2">
                            {f.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </Section>
                )}
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </div>
      {children}
    </div>
  );
}
