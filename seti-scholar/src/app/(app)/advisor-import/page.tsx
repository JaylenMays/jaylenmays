import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdvisorImportClient } from "./import-client";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function AdvisorImportPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [paths, imports] = await Promise.all([
    db.degreePath.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true, isActive: true },
    }),
    db.advisorImport.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Advisor Plan Import</h1>
        <p className="text-sm text-muted-foreground">
          Paste a DARS degree-audit extract or an advisor-provided course list. The parser recognizes
          course codes, titles, credits, grades, and terms — preview first, then import into any
          roadmap path.
        </p>
      </div>

      <AdvisorImportClient paths={paths} />

      {imports.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Import history</CardTitle>
            <CardDescription>Raw text is stored so nothing is ever lost.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {imports.map((imp) => {
              const s = imp.summary as { courseCount?: number; totalCredits?: number };
              return (
                <div key={imp.id} className="flex items-center justify-between rounded-md border p-2.5 text-sm">
                  <span className="text-muted-foreground">{formatDate(imp.createdAt)}</span>
                  <span>
                    {s.courseCount ?? 0} courses · {s.totalCredits ?? 0} credits parsed
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
