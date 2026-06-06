"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { TaskCard } from "@/components/tasks/task-card";
import { TaskDialog } from "@/components/tasks/task-dialog";
import { useStore } from "@/lib/store";
import type { Task, TaskStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const COLUMNS: { id: TaskStatus; label: string; accent: string }[] = [
  { id: "pending", label: "Pending", accent: "from-slate-500/20 to-slate-500/5" },
  { id: "in-progress", label: "In Progress", accent: "from-indigo-500/20 to-indigo-500/5" },
  { id: "completed", label: "Completed", accent: "from-emerald-500/20 to-emerald-500/5" },
  { id: "delayed", label: "Delayed", accent: "from-rose-500/20 to-rose-500/5" },
];

export function TaskBoard() {
  const { tasks, setTaskStatus, toggleSubtask, removeTask, updateTask } = useStore();
  const [dragId, setDragId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<TaskStatus | null>(null);
  const [editing, setEditing] = useState<Task | null>(null);

  const onDragStart = (e: React.DragEvent, id: string) => {
    setDragId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const onDrop = (status: TaskStatus) => {
    if (!dragId) return;
    setTaskStatus(dragId, status);
    setDragId(null);
    setOverCol(null);
  };

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.id);
          return (
            <div
              key={col.id}
              onDragOver={(e) => {
                e.preventDefault();
                setOverCol(col.id);
              }}
              onDragLeave={() => setOverCol((c) => (c === col.id ? null : c))}
              onDrop={() => onDrop(col.id)}
              className={cn(
                "flex min-w-0 flex-col gap-3 rounded-2xl border border-card-border bg-gradient-to-b p-3 transition-colors",
                col.accent,
                overCol === col.id && "ring-2 ring-brand-purple/50",
              )}
            >
              <div className="flex min-w-0 items-center justify-between gap-3 px-1">
                <h3 className="min-w-0 break-words text-sm font-semibold">{col.label}</h3>
                <span className="shrink-0 rounded-full bg-[var(--surface-hover)] px-2 py-0.5 text-xs text-muted">
                  {colTasks.length}
                </span>
              </div>

              <div className="flex min-h-[120px] flex-col gap-3">
                <AnimatePresence mode="popLayout">
                  {colTasks.map((t) => (
                    <TaskCard
                      key={t.id}
                      task={t}
                      onDragStart={onDragStart}
                      onToggleSubtask={toggleSubtask}
                      onDelete={removeTask}
                      onEdit={setEditing}
                    />
                  ))}
                </AnimatePresence>
                {colTasks.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid flex-1 place-items-center rounded-xl border border-dashed border-card-border py-6 text-xs text-muted"
                  >
                    Drop tasks here
                  </motion.div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Controlled edit dialog */}
      {editing && (
        <TaskDialog
          task={editing}
          open={!!editing}
          onOpenChange={(o) => !o && setEditing(null)}
          onSave={(t) => {
            updateTask(t);
            setEditing(null);
          }}
        />
      )}
    </>
  );
}
