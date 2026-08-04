import { db } from "@/lib/db";
import { QuizRunner } from "@/components/quiz-runner";

export const dynamic = "force-dynamic";

export default async function PracticePage({
  searchParams,
}: {
  searchParams: Promise<{ module?: string }>;
}) {
  const { module } = await searchParams;
  const modules = await db.prepModule.findMany({
    orderBy: { sortOrder: "asc" },
    select: { key: true, title: true },
  });

  return (
    <QuizRunner
      modules={modules}
      mode="practice"
      initialModule={module}
      title="Practice Problems"
      description="Work through problems with instant feedback and full explanations — mistakes still feed your analytics and spaced repetition."
    />
  );
}
