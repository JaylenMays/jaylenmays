"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Map,
  BookOpen,
  GraduationCap,
  Sparkles,
  PencilRuler,
  ClipboardCheck,
  Layers,
  Calculator,
  Radio,
  Code2,
  Atom,
  LineChart,
  FileUp,
  Settings,
  Menu,
  X,
  Telescope,
  LogOut,
  Bot,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/roadmap", label: "Degree Roadmap", icon: Map },
  { href: "/prepare", label: "Course Preparation", icon: GraduationCap },
  { href: "/builder", label: "Course Builder", icon: Bot },
  { href: "/studio", label: "Learning Studio", icon: BookOpen },
  { href: "/tutor", label: "AI Tutor", icon: Sparkles },
  { href: "/practice", label: "Practice Problems", icon: PencilRuler },
  { href: "/quiz", label: "Quiz & Exam Mode", icon: ClipboardCheck },
  { href: "/review", label: "Spaced Repetition", icon: Layers },
  { href: "/gpa", label: "GPA Planner", icon: Calculator },
  { href: "/seti-lab", label: "Research & SETI Lab", icon: Radio },
  { href: "/coding", label: "Coding Lab", icon: Code2 },
  { href: "/quantum", label: "Quantum Track", icon: Atom },
  { href: "/analytics", label: "Progress Analytics", icon: LineChart },
  { href: "/advisor-import", label: "Advisor Plan Import", icon: FileUp },
  { href: "/settings", label: "Settings & AI", icon: Settings },
];

export function AppShell({
  children,
  userName,
}: {
  children: React.ReactNode;
  userName: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  const nav = (
    <nav className="flex flex-col gap-0.5 px-3 pb-6">
      {NAV.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
      <form action="/api/auth/signout" method="post" className="mt-4 border-t pt-3">
        <button
          type="submit"
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </form>
    </nav>
  );

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col overflow-y-auto border-r bg-card lg:flex">
        <div className="flex items-center gap-2 px-6 py-5">
          <Telescope className="h-6 w-6 text-primary" />
          <div>
            <div className="text-base font-bold leading-tight">SETI Scholar</div>
            <div className="text-[11px] text-muted-foreground">Mission: SETI astrophysicist</div>
          </div>
        </div>
        {nav}
      </aside>

      {/* Mobile header */}
      <div className="fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b bg-card/95 px-4 py-3 backdrop-blur lg:hidden">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Telescope className="h-5 w-5 text-primary" />
          <span className="font-bold">SETI Scholar</span>
        </Link>
        <button
          aria-label="Toggle navigation"
          onClick={() => setOpen((v) => !v)}
          className="rounded-md p-2 hover:bg-accent"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-30 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 overflow-y-auto bg-card pt-16 shadow-xl">
            {nav}
          </div>
        </div>
      )}

      <main className="min-w-0 flex-1 px-4 pb-16 pt-20 lg:ml-64 lg:px-8 lg:pt-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-1 hidden text-xs text-muted-foreground lg:block">
            Signed in as {userName}
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
