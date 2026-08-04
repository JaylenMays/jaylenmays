import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { gpaFor, projectedGpa, requiredAverageForTarget, letterForPoints } from "@/lib/gpa";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GpaProjectionChart } from "@/components/charts";
import { GpaPlannerTable } from "./gpa-table";

export const dynamic = "force-dynamic";

export default async function GpaPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [path, settings] = await Promise.all([
    db.degreePath.findFirst({
      where: { userId, isActive: true },
      include: { courses: { orderBy: [{ year: "asc" }, { sortOrder: "asc" }] } },
    }),
    db.userSettings.findUnique({ where: { userId } }),
  ]);

  const courses = path?.courses ?? [];
  const targetGpa = settings?.targetGpa ?? 3.9;

  const graded = courses.filter((c) => c.grade);
  const earned = gpaFor(graded.map((c) => ({ credits: c.credits, grade: c.grade })));
  const projected = projectedGpa(
    courses.map((c) => ({ credits: c.credits, grade: c.grade, plannedGrade: c.plannedGrade })),
  );
  const remainingCredits = courses
    .filter((c) => !c.grade)
    .reduce((a, c) => a + c.credits, 0);
  const requiredAvg = requiredAverageForTarget(
    graded.map((c) => ({ credits: c.credits, grade: c.grade })),
    remainingCredits,
    targetGpa,
  );

  // Cumulative GPA trajectory: earned grades in term order, then planned grades.
  const series: { label: string; gpa: number | null }[] = [];
  const running: { credits: number; grade: string | null }[] = [];
  const termLabel = (c: (typeof courses)[number], i: number) =>
    c.semester && c.year ? `${c.semester.slice(0, 2)} '${String(c.year).slice(2)}` : `#${i + 1}`;
  const gradedOrdered = courses.filter((c) => c.grade);
  const plannedOrdered = courses.filter((c) => !c.grade && c.plannedGrade);
  for (const [i, c] of [...gradedOrdered, ...plannedOrdered].entries()) {
    running.push({ credits: c.credits, grade: c.grade ?? c.plannedGrade });
    series.push({ label: termLabel(c, i), gpa: gpaFor(running) });
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">GPA Planner</h1>
        <p className="text-sm text-muted-foreground">
          Set planned grades per course to see your projected GPA and what it takes to hit your target
          {path ? ` on ${path.name}` : ""}.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card><CardContent className="p-4">
          <div className="text-xl font-bold">{earned?.toFixed(2) ?? "—"}</div>
          <div className="text-[11px] text-muted-foreground">Current GPA ({graded.length} graded)</div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="text-xl font-bold">{projected?.toFixed(2) ?? "—"}</div>
          <div className="text-[11px] text-muted-foreground">Projected GPA (with planned grades)</div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="text-xl font-bold">{targetGpa.toFixed(2)}</div>
          <div className="text-[11px] text-muted-foreground">Target GPA (set in Settings)</div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="text-xl font-bold">
            {requiredAvg === null
              ? "—"
              : requiredAvg > 4.33
                ? "Not reachable"
                : `${requiredAvg.toFixed(2)} (${letterForPoints(requiredAvg)})`}
          </div>
          <div className="text-[11px] text-muted-foreground">
            Required avg on remaining {remainingCredits} credits
          </div>
        </CardContent></Card>
      </div>

      <Card>
        <CardHeader className="pb-0">
          <CardTitle className="text-base">GPA trajectory</CardTitle>
          <CardDescription>Earned grades first, then your planned grades, in term order.</CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          {series.length > 0 ? (
            <GpaProjectionChart data={series} target={targetGpa} />
          ) : (
            <p className="py-12 text-center text-sm text-muted-foreground">
              Add grades or planned grades to your courses to see the projection.
            </p>
          )}
        </CardContent>
      </Card>

      <GpaPlannerTable
        courses={courses.map((c) => ({
          id: c.id,
          code: c.code,
          title: c.title,
          credits: c.credits,
          grade: c.grade,
          plannedGrade: c.plannedGrade,
          status: c.status,
        }))}
      />
    </div>
  );
}
