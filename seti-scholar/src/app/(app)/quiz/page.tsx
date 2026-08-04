import { db } from "@/lib/db";
import { QuizRunner } from "@/components/quiz-runner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const dynamic = "force-dynamic";

export default async function QuizPage({
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
    <Tabs defaultValue="quiz">
      <TabsList className="mx-auto flex w-fit">
        <TabsTrigger value="quiz">Quiz mode</TabsTrigger>
        <TabsTrigger value="exam">Exam mode</TabsTrigger>
      </TabsList>
      <TabsContent value="quiz">
        <QuizRunner
          modules={modules}
          mode="quiz"
          initialModule={module}
          title="Quiz Mode"
          description="Graded at the end. Missed questions automatically become spaced-repetition cards."
        />
      </TabsContent>
      <TabsContent value="exam">
        <QuizRunner
          modules={modules}
          mode="exam"
          initialModule={module}
          title="Exam Mode"
          description="Longer, comprehensive, and adaptive — questions you've missed before appear more often, simulating a real exam."
        />
      </TabsContent>
    </Tabs>
  );
}
