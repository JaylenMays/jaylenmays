import Link from "next/link";
import {
  Flame,
  Layers,
  Target,
  Clock,
  BookOpen,
  CheckCircle2,
  Rocket,
  ArrowRight,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { getDashboardData } from "@/lib/stats";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ReadinessRadar, QuizPerformanceChart, WeeklyHoursChart } from "@/components/charts";
import { TaskList } from "@/components/task-list";

export const dynamic = "force-dynamic";

const CATEGORY_LABELS: Record<string, string> = {
  MATH: "Math",
  PHYSICS: "Physics",
  ASTRONOMY: "Astronomy",
  PROGRAMMING: "Programming",
  RESEARCH: "Research",
  QUANTUM: "Quantum",
};

export default async function DashboardPage() {
  const session = await auth();
  const data = await getDashboardData(session!.user.id);

  const radarData = Object.entries(CATEGORY_LABELS).map(([key, subject]) => ({
    subject,
    readiness: data.byCategory[key] ?? 0,
  }));

  const stats = [
    { icon: Target, label: "Overall readiness", value: `${data.readiness}%` },
    { icon: BookOpen, label: "Lessons completed", value: String(data.lessonsCompleted) },
    {
      icon: CheckCircle2,
      label: "Quiz accuracy",
      value: data.quizAccuracy === null ? "—" : `${data.quizAccuracy}%`,
    },
    { icon: Layers, label: "Cards due", value: String(data.dueCards) },
    { icon: Flame, label: "Study streak", value: `${data.streak} day${data.streak === 1 ? "" : "s"}` },
    {
      icon: Clock,
      label: "This week",
      value: `${Math.round((data.thisWeekMinutes / 60) * 10) / 10} h`,
    },
  ];

  const doneMilestones = data.milestones.filter((m) => m.completed).length;
  const project = data.researchProjects[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Mission Control</h1>
          <p className="text-sm text-muted-foreground">
            Long-term mission: <span className="font-medium text-foreground">Become a SETI astrophysicist</span>
            {" · "}Track: {data.activePath?.name ?? "No active path"}
          </p>
        </div>
        <div className="flex gap-2 text-right">
          <div className="rounded-lg border bg-card px-4 py-2">
            <div className="text-[11px] text-muted-foreground">Target GPA</div>
            <div className="text-lg font-bold">{data.settings?.targetGpa?.toFixed(2) ?? "3.90"}</div>
          </div>
          <div className="rounded-lg border bg-card px-4 py-2">
            <div className="text-[11px] text-muted-foreground">Projected GPA</div>
            <div className="text-lg font-bold">{data.projGpa?.toFixed(2) ?? "—"}</div>
          </div>
        </div>
      </div>

      {/* Current course + recommended next lesson */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Preparing for</CardDescription>
            <CardTitle className="text-lg">
              {data.currentCourse
                ? `${data.currentCourse.code} — ${data.currentCourse.title}`
                : "No course selected yet"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Overall readiness</span>
              <span className="font-medium">{data.readiness}%</span>
            </div>
            <Progress value={data.readiness} />
            <Button asChild variant="outline" size="sm" className="mt-4">
              <Link href="/prepare">
                Open course preparation <ArrowRight />
              </Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Recommended next lesson</CardDescription>
            <CardTitle className="text-lg">
              {data.recommendedLesson ? data.recommendedLesson.title : "All caught up 🎉"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.recommendedLesson ? (
              <>
                <p className="mb-3 text-sm text-muted-foreground">
                  From {data.recommendedLesson.moduleTitle} — chosen from your weakest subject area.
                </p>
                <Button asChild size="sm">
                  <Link href={`/studio/${data.recommendedLesson.slug}`}>
                    Start lesson <ArrowRight />
                  </Link>
                </Button>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Take a quiz or add lessons in the Learning Studio to get a new recommendation.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <s.icon className="mb-2 h-4 w-4 text-primary" />
              <div className="text-lg font-bold leading-tight">{s.value}</div>
              <div className="text-[11px] text-muted-foreground">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-0">
            <CardTitle className="text-base">Readiness by subject</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <ReadinessRadar data={radarData} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-0">
            <CardTitle className="text-base">Quiz performance</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            {data.quizSeries.length > 0 ? (
              <QuizPerformanceChart data={data.quizSeries} />
            ) : (
              <p className="py-16 text-center text-sm text-muted-foreground">
                No quizzes yet — take one in Quiz &amp; Exam Mode.
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-0">
            <CardTitle className="text-base">Weekly study hours</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            {data.weeklySeries.length > 0 ? (
              <WeeklyHoursChart
                data={data.weeklySeries}
                goal={data.settings?.weeklyStudyHoursGoal}
              />
            ) : (
              <p className="py-16 text-center text-sm text-muted-foreground">
                Study time appears here as you complete lessons and quizzes.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Weakest topics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Weakest topics</CardTitle>
            <CardDescription>From your quiz history — the tutor knows about these too.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.weakest.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Answer more quiz questions to surface weak areas.
              </p>
            )}
            {data.weakest.map((t) => {
              const acc = Math.round((t.correct / t.answered) * 100);
              return (
                <div key={t.topic}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>{t.topic}</span>
                    <span className="text-muted-foreground">{acc}%</span>
                  </div>
                  <Progress value={acc} />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Upcoming tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Upcoming study tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <TaskList tasks={data.tasks.map((t) => ({
              id: t.id,
              title: t.title,
              kind: t.kind,
              dueAt: t.dueAt?.toISOString() ?? null,
              completed: t.completed,
            }))} />
          </CardContent>
        </Card>

        {/* Mission progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Rocket className="h-4 w-4 text-primary" /> SETI career milestones
            </CardTitle>
            <CardDescription>
              {doneMilestones}/{data.milestones.length} complete
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Progress
              value={data.milestones.length ? (doneMilestones / data.milestones.length) * 100 : 0}
            />
            {project && (
              <div className="mt-4 rounded-md border p-3">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">{project.title}</span>
                  <Badge variant="secondary">{project.progressPct}%</Badge>
                </div>
                <Progress value={project.progressPct} />
                <Button asChild variant="link" size="sm" className="mt-1 h-auto p-0">
                  <Link href="/seti-lab">Open Research &amp; SETI Lab →</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
