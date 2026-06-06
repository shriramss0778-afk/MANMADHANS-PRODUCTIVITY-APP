"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Bell, CircleAlert, Clock, ListTodo, BrainCircuit, CheckCircle2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  title: string;
  detail: string;
  href: string;
  tone: "danger" | "warn" | "info";
  icon: typeof Bell;
}

const toneStyles = {
  danger: "bg-rose-500/15 text-rose-300",
  warn: "bg-amber-500/15 text-amber-300",
  info: "bg-indigo-500/15 text-indigo-300",
} as const;

export function Notifications() {
  const { tasks, knowledge, hydrated } = useStore();

  const notifications = useMemo<Notification[]>(() => {
    const now = new Date();
    const items: Notification[] = [];

    // Overdue tasks (deadline passed, not completed) — highest priority
    tasks
      .filter(
        (t) =>
          t.status !== "completed" &&
          t.deadline &&
          new Date(t.deadline) < now,
      )
      .forEach((t) =>
        items.push({
          id: `overdue-${t.id}`,
          title: t.title,
          detail: `Overdue · was due ${new Date(t.deadline!).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}`,
          href: "/tasks",
          tone: "danger",
          icon: CircleAlert,
        }),
      );

    // Pending tasks
    tasks
      .filter((t) => t.status === "pending")
      .forEach((t) =>
        items.push({
          id: `pending-${t.id}`,
          title: t.title,
          detail: t.deadline
            ? `Pending · due ${new Date(t.deadline).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}`
            : `Pending · ${t.goalScope} goal`,
          href: "/tasks",
          tone: "warn",
          icon: ListTodo,
        }),
      );

    // Delayed tasks
    tasks
      .filter((t) => t.status === "delayed")
      .forEach((t) =>
        items.push({
          id: `delayed-${t.id}`,
          title: t.title,
          detail: "Delayed · needs attention",
          href: "/tasks",
          tone: "danger",
          icon: Clock,
        }),
      );

    // Knowledge due / overdue for review
    knowledge
      .filter((k) => k.revisionStatus === "due" || k.revisionStatus === "overdue")
      .forEach((k) =>
        items.push({
          id: `review-${k.id}`,
          title: k.title,
          detail: `Review ${k.revisionStatus} · retention ${k.retention}%`,
          href: "/knowledge",
          tone: k.revisionStatus === "overdue" ? "danger" : "info",
          icon: BrainCircuit,
        }),
      );

    return items;
  }, [tasks, knowledge]);

  const count = notifications.length;
  const pendingCount = tasks.filter((t) => t.status === "pending").length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" size="icon" aria-label={`Notifications (${count})`} className="relative">
          <Bell className="size-[18px]" />
          {hydrated && count > 0 && (
            <span className="absolute -right-1 -top-1 grid min-w-[18px] place-items-center rounded-full bg-brand-neon px-1 text-[10px] font-bold text-white shadow-[0_0_8px_2px_rgba(192,38,211,0.5)]">
              {count > 9 ? "9+" : count}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-card-border p-3">
          <div>
            <p className="text-sm font-semibold">Notifications</p>
            <p className="text-[11px] text-muted">
              {pendingCount} pending task{pendingCount === 1 ? "" : "s"}
              {count > pendingCount ? ` · ${count} total alerts` : ""}
            </p>
          </div>
          {count > 0 && (
            <span className="rounded-full bg-brand-neon/20 px-2 py-0.5 text-[11px] font-semibold text-brand-neon">
              {count}
            </span>
          )}
        </div>

        <div className="max-h-80 overflow-y-auto p-1.5">
          {count === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <div className="grid size-10 place-items-center rounded-xl bg-emerald-500/15">
                <CheckCircle2 className="size-5 text-emerald-400" />
              </div>
              <p className="text-sm font-medium">You&apos;re all caught up</p>
              <p className="text-[11px] text-muted">No pending tasks or reviews.</p>
            </div>
          ) : (
            notifications.map((n, i) => {
              const Icon = n.icon;
              return (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Link
                    href={n.href}
                    className="flex items-start gap-3 rounded-lg p-2.5 transition-colors hover:bg-[var(--surface-hover)]"
                  >
                    <span
                      className={cn(
                        "mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg",
                        toneStyles[n.tone],
                      )}
                    >
                      <Icon className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{n.title}</p>
                      <p className="text-[11px] text-muted">{n.detail}</p>
                    </div>
                  </Link>
                </motion.div>
              );
            })
          )}
        </div>

        {count > 0 && (
          <div className="border-t border-card-border p-2">
            <Button asChild variant="ghost" size="sm" className="w-full">
              <Link href="/tasks">View all tasks</Link>
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
