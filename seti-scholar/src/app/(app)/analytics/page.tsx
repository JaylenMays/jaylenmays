import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getDashboardData } from "@/lib/stats";
import { moduleReadiness } from "@/lib/readiness";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ReadinessRadar,
  QuizPerformanceChart,
  WeeklyHoursChart,
  ReadinessBars,
  GpaProjectionChart,
} from "@/components/charts";
import { gpaFor } from "@/lib/gpa";
import { Progress } from "@/components/ui/progress";

export const dynamic = "force-dynamic";

const CATEGORY_LABELS: Record<string, string> = {
  MATH: "Math",
  PHYSICS: "Physics",
  ASTRONOMY: "Astronomy",
  PROGRAMMING: "Programming",
  RESEARCH: "Research",
  QUANTUM: "Quantum",
};

export default async function AnalyticsPage() {
  const session = await auth();
  const userId = session!.user.id;
  const data = await getDashboardData(userId);

  const modules = await db.prepModule.findMany({ orderBy: { sortOrder: "asc" } });
  const titleByKey = new Map(modules.map((m) => [m.key, m.title]));

  const masteryData = data.moduleStats.map((m) => ({
    name: titleByKey.get(m.moduleKey) ?? m.moduleKey,
    readiness: moduleReadiness(m),
  }));

  const radarData = Object.entries(CATEGORY_LABELS).map(([key, subject]) => ({
    subject,
    readiness: data.byCategory[key] ?? 0,
  }));

  // GPA trajectory from earned + planned grades.
  const courses = data.activePath?.courses ?? [];
  const running: { credits: number; grade: string | null }[] = [];
  const gpaSeries: { label: string; gpa: number | null }[] = [];
  for (const [i, c] of courses.filter((c) => c.grade || c.plannedGrade).entries()) {
    running.push({ credits: c.credits, grade: c.grade ?? c.plannedGrade });
    gpaSeries.push({ label: `#${i + 1}`, gpa: gpaFor(running) });
  }

  const topics = [...data.weakest].sort((a, b) => a.correct / a.answered - b.correct / b.answered);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Progress Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Everything the adaptive engine knows about your preparation.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-0">
            <CardTitle className="text-base">Readiness by subject area</CardTitle>
            <CardDescription>Math · physics · astronomy · programming · research · quantum</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <ReadinessRadar data={radarData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-0">
            <CardTitle className="text-base">Quiz performance over time</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            {data.quizSeries.length > 0 ? (
              <QuizPerformanceChart data={data.quizSeries} />
            ) : (
              <p className="py-16 text-center text-sm text-muted-foreground">No quiz data yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-0">
            <CardTitle className="text-base">Weekly study hours</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            {data.weeklySeries.length > 0 ? (
              <WeeklyHoursChart data={data.weeklySeries} goal={data.settings?.weeklyStudyHoursGoal} />
            ) : (
              <p className="py-16 text-center text-sm text-muted-foreground">No study sessions yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-0">
            <CardTitle className="text-base">GPA projection</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            {gpaSeries.length > 0 ? (
              <GpaProjectionChart data={gpaSeries} target={data.settings?.targetGpa} />
            ) : (
              <p className="py-16 text-center text-sm text-muted-foreground">
                Add earned or planned grades in the GPA Planner.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-0">
          <CardTitle className="text-base">Mastery by module</CardTitle>
          <CardDescription>Course-preparation modules ranked by your current mastery.</CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <ReadinessBars
            data={[...masteryData].sort((a, b) => b.readiness - a.readiness)}
            height={Math.max(260, masteryData.length * 26)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Topic-level accuracy</CardTitle>
          <CardDescription>Topics with the lowest quiz accuracy — your highest-leverage study targets.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {topics.length === 0 && (
            <p className="text-sm text-muted-foreground">Answer quiz questions to populate this.</p>
          )}
          {topics.map((t) => {
            const acc = Math.round((t.correct / t.answered) * 100);
            return (
              <div key={t.topic}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{t.topic}</span>
                  <span className="text-muted-foreground">{t.correct}/{t.answered} ({acc}%)</span>
                </div>
                <Progress value={acc} />
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
