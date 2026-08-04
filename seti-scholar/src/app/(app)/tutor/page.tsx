import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { resolveProvider } from "@/lib/ai/provider";
import { TutorClient } from "./tutor-client";

export const dynamic = "force-dynamic";

export default async function TutorPage({
  searchParams,
}: {
  searchParams: Promise<{ context?: string; c?: string }>;
}) {
  const session = await auth();
  const userId = session!.user.id;
  const { context, c } = await searchParams;

  const [conversations, settings] = await Promise.all([
    db.tutorConversation.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: 20,
      select: { id: true, title: true, updatedAt: true },
    }),
    db.userSettings.findUnique({ where: { userId } }),
  ]);

  const activeId = c ?? null;
  const messages = activeId
    ? await db.tutorMessage.findMany({
        where: { conversation: { id: activeId, userId } },
        orderBy: { createdAt: "asc" },
      })
    : [];

  const provider = resolveProvider(settings?.aiProvider ?? "offline");

  return (
    <TutorClient
      conversations={conversations.map((cv) => ({
        id: cv.id,
        title: cv.title,
        updatedAt: cv.updatedAt.toISOString(),
      }))}
      initialConversationId={activeId}
      initialMessages={messages.map((m) => ({
        id: m.id,
        role: m.role as "user" | "assistant",
        content: m.content,
      }))}
      context={context ?? null}
      provider={provider}
    />
  );
}
