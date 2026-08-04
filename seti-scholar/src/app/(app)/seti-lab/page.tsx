import { Radio, Rocket } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ProjectMilestones, NewProjectForm, MilestoneToggle } from "./seti-client";

export const dynamic = "force-dynamic";

const RESOURCES = [
  {
    title: "Breakthrough Listen Open Data Archive",
    detail: "Petabytes of real radio SETI data, free to download and analyze — the basis of your seeded research project.",
  },
  {
    title: "turboSETI + blimpy (open source)",
    detail: "The actual Python tools used for narrowband drift searches on Listen data. Install with pip; practice in the Coding Lab first.",
  },
  {
    title: "SETI Institute REU program",
    detail: "Summer research experience for undergraduates at the SETI Institute — a direct pipeline toward the career goal. Requires physics/astro coursework and Python.",
  },
  {
    title: "Technosignature literature starting points",
    detail: "Tarter (2001) 'The Search for Extraterrestrial Intelligence'; Wright et al. (2022) technosignature reports; the original Cocconi & Morrison (1959) paper.",
  },
];

export default async function SetiLabPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [projects, milestones] = await Promise.all([
    db.researchProject.findMany({ where: { userId }, orderBy: { createdAt: "asc" } }),
    db.careerMilestone.findMany({ where: { userId }, orderBy: { sortOrder: "asc" } }),
  ]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Research &amp; SETI Lab</h1>
        <p className="text-sm text-muted-foreground">
          Hands-on research projects and the milestone ladder to a SETI Institute career.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Projects */}
        <div className="space-y-4">
          {projects.map((p) => (
            <Card key={p.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Radio className="h-4 w-4 text-primary" /> {p.title}
                  </CardTitle>
                  <Badge variant={p.status === "done" ? "success" : "secondary"}>
                    {p.progressPct}%
                  </Badge>
                </div>
                <CardDescription>
                  <Badge variant="outline" className="mr-2">{p.area}</Badge>
                  {p.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Progress value={p.progressPct} className="mb-3" />
                <ProjectMilestones
                  projectId={p.id}
                  milestones={(p.milestones as { title: string; done: boolean }[]) ?? []}
                />
              </CardContent>
            </Card>
          ))}
          <NewProjectForm />
        </div>

        {/* Career milestones + resources */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Rocket className="h-4 w-4 text-primary" /> SETI career milestones
              </CardTitle>
              <CardDescription>
                The long game: from advising appointment to SETI Institute astrophysicist.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {milestones.map((m) => (
                <MilestoneToggle
                  key={m.id}
                  id={m.id}
                  title={m.title}
                  description={m.description}
                  completed={m.completed}
                />
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Field resources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {RESOURCES.map((r) => (
                <div key={r.title} className="rounded-md border p-3">
                  <div className="text-sm font-medium">{r.title}</div>
                  <div className="text-xs text-muted-foreground">{r.detail}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
