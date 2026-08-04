import Link from "next/link";
import { ArrowRight, GraduationCap } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getModuleStats } from "@/lib/stats";
import { moduleReadiness } from "@/lib/readiness";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SetPreparingButton } from "./set-preparing";

export const dynamic = "force-dynamic";

export default async function PreparePage() {
  const session = await auth();
  const userId = session!.user.id;

  const [activePath, moduleStats, modules] = await Promise.all([
    db.degreePath.findFirst({
      where: { userId, isActive: true },
      include: { courses: { orderBy: { sortOrder: "asc" } } },
    }),
    getModuleStats(userId),
    db.prepModule.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  const statsByKey = new Map(moduleStats.map((m) => [m.moduleKey, m]));
  const moduleByKey = new Map(modules.map((m) => [m.key, m]));
  const courses = (activePath?.courses ?? []).filter((c) => c.status !== "COMPLETED" && c.status !== "TRANSFER");
  const preparing = courses.find((c) => c.status === "PREPARING");

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Course Preparation</h1>
        <p className="text-sm text-muted-foreground">
          Learn the prerequisite knowledge for each course <em>before</em> you enroll. Readiness
          blends lesson completion (55%) with demonstrated quiz mastery (45%).
        </p>
      </div>

      {!activePath && (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            No active degree path.{" "}
            <Link href="/roadmap" className="text-primary underline">Choose one in the Degree Roadmap</Link>.
          </CardContent>
        </Card>
      )}

      {courses.map((course) => {
        const keys = course.prepSubjectKeys.filter((k) => moduleByKey.has(k));
        const stats = keys.map((k) => statsByKey.get(k)).filter(Boolean);
        const readiness = stats.length
          ? Math.round(stats.reduce((a, s) => a + moduleReadiness(s!), 0) / stats.length)
          : null;
        const isCurrent = course.id === preparing?.id;

        return (
          <Card key={course.id} className={isCurrent ? "border-primary/60" : undefined}>
            <CardHeader className="pb-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <GraduationCap className="h-4 w-4 text-primary" />
                  {course.code} — {course.title}
                  {isCurrent && <Badge>current focus</Badge>}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {readiness !== null && (
                    <span className="text-sm font-medium">{readiness}% ready</span>
                  )}
                  {!isCurrent && <SetPreparingButton courseId={course.id} />}
                </div>
              </div>
              {course.prerequisites.length > 0 && (
                <CardDescription>
                  Course prerequisites: {course.prerequisites.join(", ")}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              {readiness !== null && <Progress value={readiness} className="mb-3" />}
              {keys.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No prep modules mapped to this course yet — it may rely on knowledge covered by
                  earlier courses in your roadmap.
                </p>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2">
                  {keys.map((k) => {
                    const mod = moduleByKey.get(k)!;
                    const s = statsByKey.get(k);
                    const r = s ? moduleReadiness(s) : 0;
                    return (
                      <div key={k} className="flex items-center justify-between gap-3 rounded-md border p-2.5">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium">{mod.title}</div>
                          <div className="text-[11px] text-muted-foreground">
                            {s?.lessonsCompleted ?? 0}/{s?.lessonsTotal ?? 0} lessons ·{" "}
                            {s?.quizQuestionsAnswered ?? 0} questions answered · {r}%
                          </div>
                        </div>
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/studio?module=${k}`}>
                            Study <ArrowRight />
                          </Link>
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
