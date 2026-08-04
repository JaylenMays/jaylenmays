"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const GRADES = ["", "A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D", "E"];

interface Row {
  id: string;
  code: string;
  title: string;
  credits: number;
  grade: string | null;
  plannedGrade: string | null;
  status: string;
}

export function GpaPlannerTable({ courses }: { courses: Row[] }) {
  const router = useRouter();

  async function update(id: string, field: "grade" | "plannedGrade", value: string) {
    await fetch(`/api/roadmap/courses/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value || null }),
    });
    router.refresh();
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Courses ({courses.length})</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b text-left text-[11px] uppercase text-muted-foreground">
              <th className="py-2 pr-2">Course</th>
              <th className="py-2 pr-2">Credits</th>
              <th className="py-2 pr-2">Status</th>
              <th className="py-2 pr-2">Earned grade</th>
              <th className="py-2">Planned grade</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((c) => (
              <tr key={c.id} className="border-b last:border-0">
                <td className="py-1.5 pr-2">
                  <span className="font-mono text-xs">{c.code}</span>{" "}
                  <span className="text-muted-foreground">{c.title}</span>
                </td>
                <td className="py-1.5 pr-2">{c.credits}</td>
                <td className="py-1.5 pr-2">
                  <Badge variant={c.status === "COMPLETED" ? "success" : "outline"}>
                    {c.status.replace("_", " ").toLowerCase()}
                  </Badge>
                </td>
                <td className="py-1.5 pr-2">
                  <Select
                    className="h-7 w-[64px] px-1 text-xs"
                    value={c.grade ?? ""}
                    onChange={(e) => update(c.id, "grade", e.target.value)}
                  >
                    {GRADES.map((g) => <option key={g} value={g}>{g || "—"}</option>)}
                  </Select>
                </td>
                <td className="py-1.5">
                  <Select
                    className="h-7 w-[64px] px-1 text-xs"
                    value={c.plannedGrade ?? ""}
                    onChange={(e) => update(c.id, "plannedGrade", e.target.value)}
                    disabled={!!c.grade}
                  >
                    {GRADES.map((g) => <option key={g} value={g}>{g || "—"}</option>)}
                  </Select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
