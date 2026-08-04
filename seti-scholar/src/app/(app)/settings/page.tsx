import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { SettingsClient } from "./settings-client";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await auth();
  const userId = session!.user.id;

  const settings = await db.userSettings.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });

  return (
    <SettingsClient
      settings={{
        aiProvider: settings.aiProvider as "anthropic" | "openai" | "offline",
        aiModel: settings.aiModel,
        tutorStyle: settings.tutorStyle as "socratic" | "direct" | "detailed",
        targetGpa: settings.targetGpa,
        weeklyStudyHoursGoal: settings.weeklyStudyHoursGoal,
        dailyReviewGoal: settings.dailyReviewGoal,
        remindersEnabled: settings.remindersEnabled,
      }}
      keysConfigured={{
        anthropic: Boolean(process.env.ANTHROPIC_API_KEY),
        openai: Boolean(process.env.OPENAI_API_KEY),
      }}
      userEmail={session!.user.email ?? ""}
    />
  );
}
