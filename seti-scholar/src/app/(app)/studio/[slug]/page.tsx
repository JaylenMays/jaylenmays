import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, Clock, Target } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CompleteLessonButton } from "./complete-button";

export const dynamic = "force-dynamic";

export default async function LessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const session = await auth();
  const { slug } = await params;

  const lesson = await db.lesson.findUnique({
    where: { slug },
    include: { module: { include: { lessons: { orderBy: { sortOrder: "asc" } } } } },
  });
  if (!lesson) notFound();

  const progress = await db.lessonProgress.findUnique({
    where: { userId_lessonId: { userId: session!.user.id, lessonId: lesson.id } },
  });
  const completed = progress?.status === "completed";

  const siblings = lesson.module.lessons;
  const idx = siblings.findIndex((l) => l.id === lesson.id);
  const next = siblings[idx + 1];

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex items-center justify-between gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href="/studio">
            <ArrowLeft /> Learning Studio
          </Link>
        </Button>
        <Badge variant="secondary">{lesson.module.title}</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{lesson.title}</CardTitle>
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> ~{lesson.estimatedMinutes} min
            </span>
            {completed && <Badge variant="success">completed</Badge>}
          </div>
          {lesson.objectives.length > 0 && (
            <div className="mt-2 rounded-md border bg-muted/40 p-3">
              <div className="mb-1 flex items-center gap-1.5 text-xs font-medium">
                <Target className="h-3.5 w-3.5 text-primary" /> Objectives
              </div>
              <ul className="list-disc space-y-0.5 pl-5 text-xs text-muted-foreground">
                {lesson.objectives.map((o) => (
                  <li key={o}>{o}</li>
                ))}
              </ul>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="prose-app">
            <ReactMarkdown>{lesson.content}</ReactMarkdown>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2 border-t pt-4">
            <CompleteLessonButton slug={lesson.slug} completed={completed} minutes={lesson.estimatedMinutes} />
            <Button asChild variant="outline" size="sm">
              <Link href={`/quiz?module=${lesson.module.key}`}>Quiz me on this module</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href={`/tutor?context=${lesson.slug}`}>Ask the AI tutor</Link>
            </Button>
            {next && (
              <Button asChild variant="ghost" size="sm" className="ml-auto">
                <Link href={`/studio/${next.slug}`}>Next: {next.title} →</Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
