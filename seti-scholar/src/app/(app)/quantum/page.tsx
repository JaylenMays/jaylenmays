import Link from "next/link";
import { Atom, ArrowRight, CheckCircle2, Circle } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getModuleStats } from "@/lib/stats";
import { moduleReadiness } from "@/lib/readiness";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function QuantumPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [modules, moduleStats, quantumPath, progress, challenges, submissions] = await Promise.all([
    db.prepModule.findMany({
      where: { key: { in: ["linear-algebra-prep", "quantum-prep", "quantum-computing-prep"] } },
      include: { lessons: { orderBy: { sortOrder: "asc" } } },
    }),
    getModuleStats(userId),
    db.degreePath.findFirst({
      where: { userId, type: "QUANTUM_SECONDARY" },
      include: { courses: { orderBy: { sortOrder: "asc" } } },
    }),
    db.lessonProgress.findMany({ where: { userId, status: "completed" } }),
    db.codingChallenge.findMany({ where: { track: "quantum" }, orderBy: { sortOrder: "asc" } }),
    db.challengeSubmission.findMany({ where: { userId, status: "solved" } }),
  ]);

  const order = ["linear-algebra-prep", "quantum-prep", "quantum-computing-prep"];
  const sorted = [...modules].sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key));
  const statsByKey = new Map(moduleStats.map((m) => [m.moduleKey, m]));
  const doneLessons = new Set(progress.map((p) => p.lessonId));
  const solvedIds = new Set(submissions.map((s) => s.challengeId));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Quantum Computing Track</h1>
        <p className="text-sm text-muted-foreground">
          Secondary specialization — it complements the astrophysics pathway (shared linear algebra,
          signal thinking, and computation limits) without replacing it.
        </p>
      </div>

      {/* Learning sequence */}
      <div className="grid gap-4 lg:grid-cols-3">
        {sorted.map((mod, idx) => {
          const s = statsByKey.get(mod.key);
          const r = s ? moduleReadiness(s) : 0;
          return (
            <Card key={mod.id}>
              <CardHeader className="pb-2">
                <CardDescription>Step {idx + 1}</CardDescription>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Atom className="h-4 w-4 text-cyan-400" /> {mod.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                  <span>Mastery</span><span>{r}%</span>
                </div>
                <Progress value={r} className="mb-3" />
                <ul className="space-y-1">
                  {mod.lessons.map((l) => (
                    <li key={l.id}>
                      <Link
                        href={`/studio/${l.slug}`}
                        className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                      >
                        {doneLessons.has(l.id) ? (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                        ) : (
                          <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />
                        )}
                        {l.title}
                      </Link>
                    </li>
                  ))}
                </ul>
                <Button asChild size="sm" variant="outline" className="mt-3">
                  <Link href={`/quiz?module=${mod.key}`}>Quiz this module <ArrowRight /></Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Course sequence from the quantum path */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Specialization course sequence</CardTitle>
            <CardDescription>
              From your &quot;{quantumPath?.name ?? "Quantum Computing Secondary"}&quot; roadmap path —
              edit it in the Degree Roadmap.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {(quantumPath?.courses ?? []).map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-md border p-2.5 text-sm">
                <span>
                  <span className="font-mono text-xs">{c.code}</span>{" "}
                  <span className="text-muted-foreground">{c.title}</span>
                </span>
                <Badge variant={c.status === "COMPLETED" ? "success" : "outline"}>
                  {c.status.replace("_", " ").toLowerCase()}
                </Badge>
              </div>
            ))}
            {!quantumPath && (
              <p className="text-sm text-muted-foreground">Quantum path not found — add one in the roadmap.</p>
            )}
          </CardContent>
        </Card>

        {/* Quantum coding challenges */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Quantum coding challenges</CardTitle>
            <CardDescription>Simulate qubits with NumPy in the Coding Lab.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {challenges.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-md border p-2.5 text-sm">
                <span className="flex items-center gap-2">
                  {solvedIds.has(c.id) ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground" />
                  )}
                  {c.title}
                </span>
                <Button asChild size="sm" variant="ghost">
                  <Link href="/coding">Open <ArrowRight /></Link>
                </Button>
              </div>
            ))}
            <div className="rounded-md border border-cyan-500/30 bg-cyan-500/10 p-3 text-xs text-muted-foreground">
              Why this track matters for SETI: quantum-limited amplifiers and squeezed-state receivers
              are already used in radio astronomy front-ends, and understanding the physical limits of
              computation sharpens reasoning about what any technological civilization could build.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
