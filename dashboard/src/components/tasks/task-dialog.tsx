"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Plus, Save } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import type { Task, TaskStatus, Priority } from "@/lib/types";

const STATUSES: TaskStatus[] = ["pending", "in-progress", "completed", "delayed"];
const PRIORITIES: Priority[] = ["low", "medium", "high"];
const SCOPES: Task["goalScope"][] = ["daily", "weekly", "monthly"];

interface TaskDialogProps {
  /** When provided, the dialog edits this task; otherwise it creates a new one. */
  task?: Task;
  onSave: (task: Task) => void;
  /** Custom trigger element (defaults to a "New task" button in create mode). */
  trigger?: ReactNode;
  /** Controlled open state (omit to use the built-in trigger). */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function TaskDialog({
  task,
  onSave,
  trigger,
  open: controlledOpen,
  onOpenChange,
}: TaskDialogProps) {
  const isEdit = !!task;
  const isControlled = controlledOpen !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = (o: boolean) => {
    if (isControlled) onOpenChange?.(o);
    else setInternalOpen(o);
  };

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("pending");
  const [priority, setPriority] = useState<Priority>("medium");
  const [scope, setScope] = useState<Task["goalScope"]>("daily");
  const [deadline, setDeadline] = useState("");
  const [tags, setTags] = useState("");
  const [subtasks, setSubtasks] = useState("");

  // Load the editing task's values whenever the dialog opens.
  useEffect(() => {
    if (open && task) {
      setTitle(task.title);
      setDescription(task.description ?? "");
      setStatus(task.status);
      setPriority(task.priority);
      setScope(task.goalScope);
      setDeadline(task.deadline ?? "");
      setTags(task.tags.join(", "));
      setSubtasks(task.subtasks.map((s) => s.title).join("\n"));
    }
  }, [open, task]);

  const reset = () => {
    setTitle("");
    setDescription("");
    setStatus("pending");
    setPriority("medium");
    setScope("daily");
    setDeadline("");
    setTags("");
    setSubtasks("");
  };

  const canSubmit = title.trim().length > 0;

  const submit = () => {
    if (!canSubmit) return;

    const subtaskTitles = subtasks
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    // Preserve done-state for unchanged subtask titles when editing.
    const existingByTitle = new Map(
      (task?.subtasks ?? []).map((s) => [s.title, s]),
    );

    const next: Task = {
      id: task?.id ?? `t-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || undefined,
      status,
      priority,
      goalScope: scope,
      deadline: deadline || undefined,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      subtasks: subtaskTitles.map((t, i) => {
        const prev = existingByTitle.get(t);
        return prev
          ? { ...prev, title: t }
          : { id: `st-${Date.now()}-${i}`, title: t, done: false };
      }),
    };

    onSave(next);
    if (!isEdit) reset();
    setOpen(false);
  };

  const pill = (active: boolean) =>
    `rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors ${
      active
        ? "bg-gradient-to-r from-brand-indigo to-brand-purple text-white"
        : "glass text-muted hover:text-foreground"
    }`;

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o && !isEdit) reset();
      }}
    >
      {!isControlled && (
        <DialogTrigger asChild>
          {trigger ?? (
            <Button>
              <Plus className="size-4" /> New task
            </Button>
          )}
        </DialogTrigger>
      )}

      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit task" : "New task"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update the details of this task." : "Add a task to your board."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Title *</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Finish revision notes" />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional details..."
              className="min-h-[60px]"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Status</label>
            <div className="flex flex-wrap gap-2">
              {STATUSES.map((s) => (
                <button key={s} type="button" onClick={() => setStatus(s)} className={pill(status === s)}>
                  {s.replace("-", " ")}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Priority</label>
              <div className="flex flex-wrap gap-2">
                {PRIORITIES.map((p) => (
                  <button key={p} type="button" onClick={() => setPriority(p)} className={pill(priority === p)}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Scope</label>
              <div className="flex flex-wrap gap-2">
                {SCOPES.map((s) => (
                  <button key={s} type="button" onClick={() => setScope(s)} className={pill(scope === s)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Deadline</label>
              <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Tags (comma separated)</label>
              <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="learning, AI" />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted">
              Subtasks (one per line)
            </label>
            <Textarea
              value={subtasks}
              onChange={(e) => setSubtasks(e.target.value)}
              placeholder={"Draft outline\nReview\nPublish"}
              className="min-h-[60px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={!canSubmit}>
            {isEdit ? (
              <>
                <Save className="size-4" /> Save changes
              </>
            ) : (
              <>
                <Plus className="size-4" /> Add task
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
