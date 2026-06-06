"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, X, ArrowRight } from "lucide-react";
import { useStore } from "@/lib/store";

/**
 * One-time toast that appears shortly after the app loads when there are
 * pending or overdue tasks, nudging the user toward the task board.
 * Auto-dismisses after a few seconds.
 */
export function PendingToast() {
  const { tasks, hydrated } = useStore();
  const [show, setShow] = useState(false);
  const [shown, setShown] = useState(false);

  const pending = tasks.filter((t) => t.status === "pending").length;
  const overdue = tasks.filter(
    (t) => t.status !== "completed" && t.deadline && new Date(t.deadline) < new Date(),
  ).length;
  const total = pending + overdue;

  useEffect(() => {
    if (!hydrated || shown || total === 0) return;
    const openTimer = setTimeout(() => {
      setShow(true);
      setShown(true);
    }, 900);
    return () => clearTimeout(openTimer);
  }, [hydrated, shown, total]);

  useEffect(() => {
    if (!show) return;
    const closeTimer = setTimeout(() => setShow(false), 6000);
    return () => clearTimeout(closeTimer);
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -24, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: -24, x: "-50%" }}
          transition={{ type: "spring", stiffness: 320, damping: 26 }}
          className="fixed left-1/2 top-4 z-[60] w-[calc(100vw-2rem)] max-w-sm"
          role="status"
          aria-live="polite"
        >
          <div className="glass-strong glow-ring flex items-start gap-3 rounded-2xl p-4">
            <span className="relative grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-indigo to-brand-purple">
              <Bell className="size-5 text-white" />
              <span className="absolute -right-1 -top-1 grid min-w-[18px] place-items-center rounded-full bg-brand-neon px-1 text-[10px] font-bold text-white">
                {total > 9 ? "9+" : total}
              </span>
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">
                You have {pending} pending task{pending === 1 ? "" : "s"}
                {overdue > 0 ? ` and ${overdue} overdue` : ""}
              </p>
              <p className="mt-0.5 text-[11px] text-muted">
                Stay on track — review your board.
              </p>
              <Link
                href="/tasks"
                onClick={() => setShow(false)}
                className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-brand-cyan hover:underline"
              >
                Open tasks <ArrowRight className="size-3" />
              </Link>
            </div>
            <button
              onClick={() => setShow(false)}
              aria-label="Dismiss notification"
              className="text-muted transition-colors hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
