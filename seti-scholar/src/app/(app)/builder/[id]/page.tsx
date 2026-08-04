import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen, ExternalLink, Scale, ShieldCheck } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate } from "@/lib/utils";
import { LessonAccordion } from "./lesson-view";

export const dynamic = "force-dynamic";

export default async function CurriculumPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const userId = session!.user.id;
  const { id } = await params;

  const curriculum = await db.curriculum.findFirst({
    where: { id, userId },
    include: {
      lessons: {
        orderBy: { orderIdx: "asc" },
        include: { citations: { include: { source: true } } },
      },
      books: true,
      contradictions: true,
    },
  });
  if (!curriculum) notFound();

  const sources = await db.source.findMany({
    where: { id: { in: curriculum.sourceIds } },
    include: { events: { orderBy: { createdAt: "asc" } } },
    orderBy: { qualityScore: "desc" },
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href="/builder">
            <ArrowLeft /> Course Builder
          </Link>
        </Button>
        <Badge variant="success">published {formatDate(curriculum.updatedAt)}</Badge>
      </div>

      <div>
        <h1 className="text-2xl font-bold">
          {curriculum.courseCode} — {curriculum.courseTitle}
        </h1>
        <p className="text-sm text-muted-foreground">
          Auto-built preparation curriculum · {curriculum.lessons.length} units ·{" "}
          {sources.length} cited sources · every lesson independently reviewed and math-validated.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Learning outcomes</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              {curriculum.objectives.map((o) => <li key={o}>{o}</li>)}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Prerequisite concepts</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-1.5">
            {curriculum.prereqConcepts.map((p) => (
              <Badge key={p} variant="secondary">{p}</Badge>
            ))}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="lessons">
        <TabsList>
          <TabsTrigger value="lessons">Lessons ({curriculum.lessons.length})</TabsTrigger>
          <TabsTrigger value="books">Books ({curriculum.books.length})</TabsTrigger>
          <TabsTrigger value="sources">Sources ({sources.length})</TabsTrigger>
          <TabsTrigger value="disagreements">Disagreements ({curriculum.contradictions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="lessons">
          <LessonAccordion
            lessons={curriculum.lessons.map((l) => ({
              id: l.id,
              kind: l.kind,
              title: l.title,
              objectives: l.objectives,
              prereqConcepts: l.prereqConcepts,
              originalExplanation: l.originalExplanation,
              formalExplanation: l.formalExplanation,
              workedExamples: l.workedExamples as { problem: string; steps: string[]; answer: string }[],
              practiceProblems: l.practiceProblems as { prompt: string; answer: string; solution: string; validated: boolean; difficulty: number }[],
              commonMistakes: l.commonMistakes,
              setiApplication: l.setiApplication,
              masteryCriteria: l.masteryCriteria,
              followUp: l.followUp as { title: string; url: string }[],
              qualityScore: l.qualityScore,
              reviewStatus: l.reviewStatus,
              reviewNotes: l.reviewNotes,
              writtenBy: l.writtenBy,
              reviewedBy: l.reviewedBy,
              citations: l.citations.map((c) => ({
                title: c.source.title,
                url: c.source.url,
                note: c.note,
                quality: c.source.qualityScore,
              })),
            }))}
          />
        </TabsContent>

        <TabsContent value="books" className="space-y-3">
          {curriculum.books.map((b) => (
            <Card key={b.id}>
              <CardHeader className="pb-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <BookOpen className="h-4 w-4 text-primary" /> {b.title}
                  </CardTitle>
                  <span className="flex gap-1.5">
                    <Badge variant={b.role === "primary" ? "default" : "secondary"}>{b.role}</Badge>
                    <Badge variant={b.openFullText ? "success" : "warning"}>
                      {b.openFullText ? "open full text" : b.accessStatus.replace("_", " ")}
                    </Badge>
                  </span>
                </div>
                <CardDescription>
                  {b.author} · {b.edition} ed. {b.year ?? ""} · {b.difficulty} · prerequisites: {b.prereqLevel || "none"} ·
                  license: {b.license}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p><span className="font-medium">Why selected:</span> {b.rationale}</p>
                {b.relevantChapters.length > 0 && (
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">Relevant chapters:</span>{" "}
                    {b.relevantChapters.join(" · ")}
                  </p>
                )}
                <div className="flex flex-wrap gap-2 pt-1">
                  <Button asChild size="sm" variant="outline">
                    <a href={b.url} target="_blank" rel="noreferrer">
                      {b.openFullText ? "Read free" : "Publisher page"} <ExternalLink />
                    </a>
                  </Button>
                  {b.purchasePath && (
                    <Button asChild size="sm" variant="ghost">
                      <a href={b.purchasePath} target="_blank" rel="noreferrer">
                        Library / purchase lookup <ExternalLink />
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          <p className="text-xs text-muted-foreground">
            <ShieldCheck className="mr-1 inline h-3.5 w-3.5" />
            Commercial titles are stored as metadata only — the system never links to unauthorized
            copies, never bypasses paywalls, and builds its own original lessons covering the same
            objectives from open sources.
          </p>
        </TabsContent>

        <TabsContent value="sources" className="space-y-3">
          {sources.map((s) => {
            const scores = s.scores as Record<string, number>;
            return (
              <Card key={s.id}>
                <CardHeader className="pb-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <CardTitle className="text-base">
                      <a href={s.url} target="_blank" rel="noreferrer" className="hover:underline">
                        {s.title} <ExternalLink className="inline h-3.5 w-3.5" />
                      </a>
                    </CardTitle>
                    <span className="flex gap-1.5">
                      <Badge>{s.qualityScore}/100</Badge>
                      <Badge variant={s.openFullText ? "success" : "warning"}>
                        {s.accessStatus.replace(/_/g, " ")}
                      </Badge>
                    </span>
                  </div>
                  <CardDescription>
                    {s.type.replace("_", " ")} · {s.domain} · {s.license}
                    {s.year ? ` · ${s.year}` : ""} · last checked {formatDate(s.lastCheckedAt)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {s.description && <p className="text-muted-foreground">{s.description}</p>}
                  <div className="flex flex-wrap gap-1.5 text-xs">
                    {Object.entries(scores).map(([k, v]) => (
                      <Badge key={k} variant="outline">
                        {k}: {v}/10
                      </Badge>
                    ))}
                  </div>
                  <details className="text-xs">
                    <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                      Source history ({s.events.length} events)
                    </summary>
                    <ul className="mt-2 space-y-1 border-l pl-3">
                      {s.events.map((e) => (
                        <li key={e.id}>
                          <span className="font-medium">{e.kind}</span>{" "}
                          <span className="text-muted-foreground">{formatDate(e.createdAt)} — {e.note}</span>
                        </li>
                      ))}
                    </ul>
                  </details>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="disagreements" className="space-y-3">
          {curriculum.contradictions.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No contradictory information detected among the selected sources for this course.
            </p>
          )}
          {curriculum.contradictions.map((c) => (
            <Card key={c.id}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Scale className="h-4 w-4 text-amber-400" /> {c.topic}
                </CardTitle>
                <CardDescription>
                  {c.sourceATitle} vs. {c.sourceBTitle}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>{c.description}</p>
                <p className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-2.5">
                  <span className="font-medium">How to handle it: </span>
                  {c.resolution}
                </p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
