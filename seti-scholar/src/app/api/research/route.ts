import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUserId } from "@/lib/auth";
import { apiHandler, parseBody } from "@/lib/api";
import { researchProjectSchema } from "@/lib/schemas";

export const POST = apiHandler(async (req) => {
  const userId = await requireUserId();
  const data = await parseBody(req, researchProjectSchema);
  const project = await db.researchProject.create({
    data: { userId, title: data.title, area: data.area, description: data.description },
  });
  return NextResponse.json({ project });
});

const milestoneSchema = z.object({
  projectId: z.string(),
  milestoneIndex: z.number().int().min(0),
  done: z.boolean(),
});

export const PATCH = apiHandler(async (req) => {
  const userId = await requireUserId();
  const { projectId, milestoneIndex, done } = await parseBody(req, milestoneSchema);
  const project = await db.researchProject.findFirst({ where: { id: projectId, userId } });
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const milestones = (project.milestones as { title: string; done: boolean }[]) ?? [];
  if (milestoneIndex >= milestones.length) {
    return NextResponse.json({ error: "Milestone index out of range" }, { status: 400 });
  }
  milestones[milestoneIndex] = { ...milestones[milestoneIndex], done };
  const doneCount = milestones.filter((m) => m.done).length;
  const progressPct = milestones.length
    ? Math.round((doneCount / milestones.length) * 100)
    : project.progressPct;

  const updated = await db.researchProject.update({
    where: { id: project.id },
    data: {
      milestones,
      progressPct,
      status: progressPct === 100 ? "done" : project.status,
    },
  });
  return NextResponse.json({ project: updated });
});
