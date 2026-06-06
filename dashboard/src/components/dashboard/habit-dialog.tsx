"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  Plus,
  Save,
  BookOpen,
  Brain,
  Dumbbell,
  Flower2,
  Flame,
  Droplets,
  Moon,
  Code,
  Heart,
  Music,
  type LucideIcon,
} from "lucide-react";
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
import { Input } from "@/components/ui/input";
import type { Habit } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Icons available for habits (keys match the Weekly page icon map). */
export const HABIT_ICONS: Record<string, LucideIcon> = {
  BookOpen,
  Brain,
  Dumbbell,
  Flower2,
  Flame,
  Droplets,
  Moon,
  Code,
  Heart,
  Music,
};

const COLORS = [
  "#01c3a8",
  "#6366f1",
  "#ffb741",
  "#a855f7",
  "#22d3ee",
  "#f43f5e",
  "#10b981",
  "#3b82f6",
];

interface HabitDialogProps {
  /** When provided, edits this habit; otherwise creates a new one. */
  habit?: Habit;
  onSave: (habit: Habit) => void;
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function HabitDialog({
  habit,
  onSave,
  trigger,
  open: controlledOpen,
  onOpenChange,
}: HabitDialogProps) {
  const isEdit = !!habit;
  const isControlled = controlledOpen !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = (o: boolean) => {
    if (isControlled) onOpenChange?.(o);
    else setInternalOpen(o);
  };

  const [name, setName] = useState("");
  const [icon, setIcon] = useState("BookOpen");
  const [color, setColor] = useState(COLORS[0]);
  const [goalPerWeek, setGoalPerWeek] = useState("7");

  useEffect(() => {
    if (open && habit) {
      setName(habit.name);
      setIcon(habit.icon in HABIT_ICONS ? habit.icon : "BookOpen");
      setColor(habit.color);
      setGoalPerWeek(String(habit.goalPerWeek));
    }
  }, [open, habit]);

  const reset = () => {
    setName("");
    setIcon("BookOpen");
    setColor(COLORS[0]);
    setGoalPerWeek("7");
  };

  const canSubmit = name.trim().length > 0;

  const submit = () => {
    if (!canSubmit) return;
    const goal = Math.min(7, Math.max(1, parseInt(goalPerWeek, 10) || 7));
    const next: Habit = {
      id: habit?.id ?? `h-${Date.now()}`,
      name: name.trim(),
      icon,
      color,
      goalPerWeek: goal,
      streak: habit?.streak ?? 0,
      history: habit?.history ?? Array.from({ length: 49 }, () => false),
      log: habit?.log ?? {},
    };
    onSave(next);
    if (!isEdit) reset();
    setOpen(false);
  };

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
              <Plus className="size-4" /> Add habit
            </Button>
          )}
        </DialogTrigger>
      )}

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit habit" : "New habit"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update this habit's details." : "Create a habit to track each week."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Name *</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Drink water" />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Icon</label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(HABIT_ICONS).map(([key, Icon]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setIcon(key)}
                  aria-label={key}
                  className={cn(
                    "grid size-9 place-items-center rounded-lg border transition-all",
                    icon === key ? "border-transparent text-white" : "border-card-border text-muted hover:bg-[var(--surface-hover)]",
                  )}
                  style={icon === key ? { background: color } : {}}
                >
                  <Icon className="size-4" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Color</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  aria-label={`Color ${c}`}
                  className={cn(
                    "size-8 rounded-full transition-transform",
                    color === c ? "ring-2 ring-white ring-offset-2 ring-offset-transparent scale-110" : "",
                  )}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Goal per week</label>
            <Input
              type="number"
              min={1}
              max={7}
              value={goalPerWeek}
              onChange={(e) => setGoalPerWeek(e.target.value)}
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
                <Plus className="size-4" /> Add habit
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
