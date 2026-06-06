"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
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
import type { CalendarEvent, EventType } from "@/lib/types";

const TYPE_COLORS: Record<EventType, string> = {
  focus: "#6366f1",
  meeting: "#22d3ee",
  revision: "#a855f7",
  habit: "#01c3a8",
  deadline: "#a63d2a",
  break: "#ffb741",
};

const TYPES = Object.keys(TYPE_COLORS) as EventType[];

const TYPE_LABELS: Record<EventType, string> = {
  focus: "Focus",
  meeting: "Meeting",
  revision: "Revision",
  habit: "Habit",
  deadline: "Deadline",
  break: "Break",
};

interface AddEventDialogProps {
  defaultDate: string; // yyyy-mm-dd
  onAdd: (event: CalendarEvent) => void;
}

export function AddEventDialog({ defaultDate, onAdd }: AddEventDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<EventType>("focus");
  const [typeLabel, setTypeLabel] = useState(TYPE_LABELS.focus);
  const [date, setDate] = useState(defaultDate);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");

  const reset = () => {
    setTitle("");
    setType("focus");
    setTypeLabel(TYPE_LABELS.focus);
    setDate(defaultDate);
    setStartTime("09:00");
    setEndTime("10:00");
  };

  const canSubmit = title.trim().length > 0 && startTime < endTime;

  const submit = () => {
    if (!canSubmit) return;
    onAdd({
      id: `e-${Date.now()}`,
      title: title.trim(),
      type,
      typeLabel: typeLabel.trim() || TYPE_LABELS[type],
      date,
      startTime,
      endTime,
      color: TYPE_COLORS[type],
    });
    reset();
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) setDate(defaultDate);
        if (!o) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" /> New block
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>New time block</DialogTitle>
          <DialogDescription>Schedule a block on your calendar.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Title *</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Deep Work Block" />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Type</label>
            <div className="flex flex-wrap gap-2">
              {TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setType(t);
                    setTypeLabel((current) =>
                      current.trim().length === 0 || current === TYPE_LABELS[type]
                        ? TYPE_LABELS[t]
                        : current,
                    );
                  }}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors ${
                    type === t ? "text-white" : "glass text-muted hover:text-foreground"
                  }`}
                  style={type === t ? { background: TYPE_COLORS[t] } : {}}
                >
                  <span className="size-2 rounded-full" style={{ background: TYPE_COLORS[t] }} />
                  {TYPE_LABELS[t]}
                </button>
              ))}
            </div>
            <div className="mt-3">
              <Input
                value={typeLabel}
                onChange={(e) => setTypeLabel(e.target.value)}
                placeholder="Custom type label"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Date</label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Start</label>
              <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">End</label>
              <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>
          </div>
          {startTime >= endTime && (
            <p className="text-xs text-rose-400">End time must be after start time.</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={!canSubmit}>
            <Plus className="size-4" /> Add block
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
