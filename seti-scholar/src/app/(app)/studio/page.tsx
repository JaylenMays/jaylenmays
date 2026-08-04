import Link from "next/link";
import { BookOpen, CheckCircle2, Circle } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const CATEGORY_COLORS: Record<string, string> = {
  MATH: "text-sky-400",
  PHYSICS: "text-amber-400",
  ASTRONOMY: "text-violet-400",
  PROGRAMMING: "text-emerald-400",
  RESEARCH: "text-rose-400",
  QUANTUM: "text-cyan-400",
};

export default async function StudioPage({
  searchParams,
}: {
  searchParams: Promise<{ module?: string }>;
}) {
  const session = await auth();
  const userId = session!.user.id;
  const { module: focusKey } = await searchParams;

  const [modules, progress] = await Promise.all([
    db.prepModule.findMany({
      orderBy: { sortOrder: "asc" },
      include: { lessons: { orderBy: { sortOrder: "asc" } } },
    }),
    db.lessonProgress.findMany({ where: { userId } }),
  ]);
  const progressByLesson = new Map(progress.map((p) => [p.lessonId, p]));

  const sorted = focusKey
    ? [...modules.filter((m) => m.key === focusKey), ...modules.filter((m) => m.key !== focusKey)]
    : modules;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Learning Studio</h1>
        <p className="text-sm text-muted-foreground">
          {modules.length} preparation modules · every lesson feeds your readiness score and the
          spaced-repetition system.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {sorted.map((mod) => {
          const done = mod.lessons.filter(
            (l) => progressByLesson.get(l.id)?.status === "completed",
          ).length;
          return (
            <Card key={mod.id} className={cn(mod.key === focusKey && "border-primary/60")}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <BookOpen className={cn("h-4 w-4", CATEGORY_COLORS[mod.category] ?? "text-primary")} />
                    {mod.title}
                  </CardTitle>
                  <Badge variant="secondary">{done}/{mod.lessons.length}</Badge>
                </div>
                <CardDescription>{mod.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {mod.lessons.map((l) => {
                    const p = progressByLesson.get(l.id);
                    const completed = p?.status === "completed";
                    return (
                      <li key={l.id}>
                        <Link
                          href={`/studio/${l.slug}`}
                          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                        >
                          {completed ? (
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                          ) : (
                            <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />
                          )}
                          <span className="flex-1">{l.title}</span>
                          <span className="text-[11px] text-muted-foreground">{l.estimatedMinutes} min</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
