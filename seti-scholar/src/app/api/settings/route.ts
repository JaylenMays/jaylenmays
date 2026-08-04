import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUserId } from "@/lib/auth";
import { apiHandler, parseBody } from "@/lib/api";
import { settingsSchema } from "@/lib/schemas";

export const PUT = apiHandler(async (req) => {
  const userId = await requireUserId();
  const data = await parseBody(req, settingsSchema);
  const settings = await db.userSettings.upsert({
    where: { userId },
    create: { userId, ...data },
    update: data,
  });
  return NextResponse.json({ settings });
});
