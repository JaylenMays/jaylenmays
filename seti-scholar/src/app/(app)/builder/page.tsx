import Link from "next/link";
import { Bot, CheckCircle2 } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { BuildCourseButton } from "./build-button";

export const dynamic = "force-dynamic";

const PIPELINE_STAGES = [
  "Source Discovery",
  "Source Verification",
  "Curriculum Design",
  "Lesson Generation",
  "Assessment Generation",
  "Mathematical Validation",
  "Scientific Accuracy Review",
  "Citation Validation",
  "Publication",
];

export default async function BuilderPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [activePath, curricula, recentRuns, sourceCount] = await Promise.all([
    db.degreePath.findFirst({
      where: { userId, isActive: true },
      include: { courses: { orderBy: { sortOrder: "asc" } } },
    }),
    db.curriculum.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      include: { _count: { select: { lessons: true, books: true, contradictions: true } } },
    }),
    db.pipelineRun.findMany({
      where: { userId },
      orderBy: { startedAt: "desc" },
      take: 5,
    }),
    db.source.count(),
  ]);

  const curriculumByCourse = new Map(curricula.map((c) => [c.courseCode, c]));
  const courses = (activePath?.courses ?? []).filter(
    (c) => c.status !== "COMPLETED" && c.status !== "TRANSFER",
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Course Builder</h1>
        <p className="text-sm text-muted-foreground">
          Autonomous agents research each course, discover and score legal open sources, and build an
          original cited curriculum — no textbook uploads required. {sourceCount > 0 && `${sourceCount} sources in the library.`}
        </p>
      </div>

      {/* Pipeline explainer */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Bot className="h-4 w-4 text-primary" /> Review pipeline
          </CardTitle>
          <CardDescription>
            Every curriculum passes this chain. The agent that writes a lesson is never the one that
            verifies it: lessons are written by the Lesson Writer Agent and independently checked by
            the Scientific Accuracy Reviewer and Mathematical Validator.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-1.5 text-xs">
          {PIPELINE_STAGES.map((s, i) => (
            <span key={s} className="flex items-center gap-1.5">
              <Badge variant="secondary">{s}</Badge>
              {i < PIPELINE_STAGES.length - 1 && <span className="text-muted-foreground">→</span>}
            </span>
          ))}
        </CardContent>
      </Card>

      {/* Courses */}
      <div className="grid gap-3 lg:grid-cols-2">
        {courses.map((course) => {
          const curriculum = curriculumByCourse.get(course.code);
          return (
            <Card key={course.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base">
                    {course.code} — {course.title}
                  </CardTitle>
                  {curriculum ? (
                    <Badge variant="success">curriculum ready</Badge>
                  ) : (
                    <Badge variant="outline">not built</Badge>
                  )}
                </div>
                {curriculum && (
                  <CardDescription>
                    {curriculum._count.lessons} units · {curriculum._count.books} book recommendations ·{" "}
                    {curriculum._count.contradictions} documented source disagreements · updated{" "}
                    {formatDate(curriculum.updatedAt)}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="flex gap-2">
                {curriculum && (
                  <Button asChild size="sm">
                    <Link
                      href={`/builder/${curriculum.id}`}
                      aria-label={`Open curriculum for ${course.code}`}
                    >
                      Open curriculum
                    </Link>
                  </Button>
                )}
                <BuildCourseButton courseCode={course.code} rebuild={Boolean(curriculum)} />
              </CardContent>
            </Card>
          );
        })}
        {courses.length === 0 && (
          <Card className="lg:col-span-2">
            <CardContent className="p-6 text-sm text-muted-foreground">
              No upcoming courses on your active path.{" "}
              <Link href="/roadmap" className="text-primary underline">Add courses in the Degree Roadmap</Link>{" "}
              and the builder (and its nightly job) will take it from there.
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent runs */}
      {recentRuns.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recent pipeline runs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentRuns.map((run) => (
              <div key={run.id} className="flex items-center justify-between rounded-md border p-2.5 text-sm">
                <span className="flex items-center gap-2">
                  {run.status === "completed" ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Bot className="h-4 w-4 text-muted-foreground" />
                  )}
                  {run.courseCode}
                  <span className="text-xs text-muted-foreground">{formatDate(run.startedAt)}</span>
                </span>
                <Badge
                  variant={run.status === "completed" ? "success" : run.status === "failed" ? "destructive" : "warning"}
                >
                  {run.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
