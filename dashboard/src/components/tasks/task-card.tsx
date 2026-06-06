"use client";

import { motion } from "framer-motion";
import { Calendar, GripVertical, CheckCircle2, Circle, Trash2, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { Task } from "@/lib/types";
import { cn } from "@/lib/utils";

const priorityColor = {
  high: "red",
  medium: "orange",
  low: "green",
} as const;

export function TaskCard({
  task,
  onDragStart,
  onToggleSubtask,
  onDelete,
  onEdit,
}: {
  task: Task;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onToggleSubtask?: (taskId: string, subtaskId: string) => void;
  onDelete?: (id: string) => void;
  onEdit?: (task: Task) => void;
}) {
  const doneSubs = task.subtasks.filter((s) => s.done).length;
  const subPct = task.subtasks.length
    ? Math.round((doneSubs / task.subtasks.length) * 100)
    : 0;

  const overdue =
    task.deadline && task.status !== "completed" && new Date(task.deadline) < new Date();

  return (
    <motion.div
      layout
      layoutId={task.id}
      draggable
      onDragStart={(e) => onDragStart(e as unknown as React.DragEvent, task.id)}
      whileHover={{ y: -3 }}
      whileDrag={{ scale: 1.04, rotate: 1 }}
      className="group min-w-0 cursor-grab overflow-hidden rounded-xl glass p-3.5 active:cursor-grabbing"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 flex-1 break-words text-sm font-medium leading-snug">{task.title}</p>
        <div className="flex shrink-0 items-center gap-1">
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(task)}
              aria-label={`Edit ${task.title}`}
              className="rounded-md p-1 text-muted transition-all hover:bg-[var(--surface-hover)] hover:text-brand-cyan focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
            >
              <Pencil className="size-4" />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(task.id)}
              aria-label={`Delete ${task.title}`}
              className="rounded-md p-1 text-muted transition-all hover:bg-[var(--surface-hover)] hover:text-rose-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
            >
              <Trash2 className="size-4" />
            </button>
          )}
          <GripVertical className="hidden size-4 text-muted sm:block sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100" />
        </div>
      </div>

      {task.description && (
        <p className="mt-1 line-clamp-2 text-xs text-muted">{task.description}</p>
      )}

      {task.subtasks.length > 0 && (
        <div className="mt-3 space-y-1.5">
          {task.subtasks.map((s) => (
            <button
              key={s.id}
              onClick={() => onToggleSubtask?.(task.id, s.id)}
              className="flex w-full items-center gap-2 text-left text-xs text-muted hover:text-foreground"
            >
              {s.done ? (
                <CheckCircle2 className="size-3.5 text-emerald-400" />
              ) : (
                <Circle className="size-3.5" />
              )}
              <span className={cn("min-w-0 break-words", s.done && "line-through opacity-60")}>{s.title}</span>
            </button>
          ))}
          <Progress value={subPct} className="mt-1 h-1" />
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2 overflow-hidden">
        <Badge variant={priorityColor[task.priority]}>{task.priority}</Badge>
        <Badge variant="outline">{task.goalScope}</Badge>
        {task.deadline && (
          <span
            className={cn(
              "flex items-center gap-1 text-[11px] sm:ml-auto",
              overdue ? "text-rose-400" : "text-muted",
            )}
          >
            <Calendar className="size-3" />
            {new Date(task.deadline).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        )}
      </div>
    </motion.div>
  );
}
