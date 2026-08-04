"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Area,
  AreaChart,
  ReferenceLine,
} from "recharts";

const AXIS = { fontSize: 11, fill: "hsl(224 15% 62%)" };
const GRID = "hsl(230 22% 20%)";
const PRIMARY = "hsl(252 80% 68%)";
const ACCENT = "hsl(160 70% 55%)";

const tooltipStyle = {
  backgroundColor: "hsl(230 32% 12%)",
  border: "1px solid hsl(230 22% 24%)",
  borderRadius: 8,
  fontSize: 12,
  color: "hsl(220 30% 92%)",
};

export function ReadinessRadar({ data }: { data: { subject: string; readiness: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <RadarChart data={data} outerRadius="70%">
        <PolarGrid stroke={GRID} />
        <PolarAngleAxis dataKey="subject" tick={AXIS} />
        <Radar dataKey="readiness" stroke={PRIMARY} fill={PRIMARY} fillOpacity={0.35} />
        <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`, "Readiness"]} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

export function QuizPerformanceChart({
  data,
}: {
  data: { date: string; accuracy: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
        <XAxis dataKey="date" tick={AXIS} />
        <YAxis domain={[0, 100]} tick={AXIS} />
        <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`, "Accuracy"]} />
        <Line type="monotone" dataKey="accuracy" stroke={PRIMARY} strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function WeeklyHoursChart({
  data,
  goal,
}: {
  data: { week: string; hours: number }[];
  goal?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
        <XAxis dataKey="week" tick={AXIS} />
        <YAxis tick={AXIS} />
        <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v} h`, "Study time"]} />
        {goal ? (
          <ReferenceLine y={goal} stroke={ACCENT} strokeDasharray="4 4" label={{ value: "goal", fill: ACCENT, fontSize: 11 }} />
        ) : null}
        <Area type="monotone" dataKey="hours" stroke={PRIMARY} fill={PRIMARY} fillOpacity={0.25} strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function ReadinessBars({
  data,
  height = 260,
}: {
  data: { name: string; readiness: number }[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 40, bottom: 4 }}>
        <CartesianGrid stroke={GRID} strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" domain={[0, 100]} tick={AXIS} />
        <YAxis type="category" dataKey="name" tick={AXIS} width={140} />
        <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`, "Mastery"]} />
        <Bar dataKey="readiness" fill={PRIMARY} radius={[0, 4, 4, 0]} barSize={14} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function GpaProjectionChart({
  data,
  target,
}: {
  data: { label: string; gpa: number | null }[];
  target?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
        <XAxis dataKey="label" tick={AXIS} />
        <YAxis domain={[0, 4.33]} tick={AXIS} />
        <Tooltip contentStyle={tooltipStyle} />
        {target ? (
          <ReferenceLine y={target} stroke={ACCENT} strokeDasharray="4 4" label={{ value: "target", fill: ACCENT, fontSize: 11 }} />
        ) : null}
        <Line type="monotone" dataKey="gpa" stroke={PRIMARY} strokeWidth={2} dot={{ r: 3 }} connectNulls />
      </LineChart>
    </ResponsiveContainer>
  );
}
