"use client";

import { useState } from "react";
import { addMonths, format } from "date-fns";
import { ChevronLeft, ChevronRight, Clock, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { MonthGrid } from "@/components/calendar/month-grid";
import { DaySchedule } from "@/components/calendar/day-schedule";
import { AddEventDialog } from "@/components/calendar/add-event-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStore } from "@/lib/store";

export default function CalendarPage() {
  const { events: calendarEvents, addEvent, removeEvent } = useStore();
  const [month, setMonth] = useState(new Date("2026-05-31"));
  const [selected, setSelected] = useState("2026-05-31");

  const dayEvents = calendarEvents
    .filter((e) => e.date === selected)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const totalBlocked = dayEvents.reduce((sum, e) => {
    const [sh, sm] = e.startTime.split(":").map(Number);
    const [eh, em] = e.endTime.split(":").map(Number);
    return sum + (eh * 60 + em - (sh * 60 + sm));
  }, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendar & Planning"
        subtitle="Time-block your day, week, and month"
        action={<AddEventDialog defaultDate={selected} onAdd={addEvent} />}
      />

      <Tabs defaultValue="month">
        <TabsList>
          <TabsTrigger value="day">Daily</TabsTrigger>
          <TabsTrigger value="month">Monthly</TabsTrigger>
        </TabsList>

        <TabsContent value="month">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">{format(month, "MMMM yyyy")}</h2>
                <div className="flex gap-2">
                  <Button variant="secondary" size="icon" onClick={() => setMonth((m) => addMonths(m, -1))}>
                    <ChevronLeft className="size-4" />
                  </Button>
                  <Button variant="secondary" size="icon" onClick={() => setMonth((m) => addMonths(m, 1))}>
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
              <MonthGrid month={month} events={calendarEvents} selected={selected} onSelect={setSelected} />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>
                  {format(new Date(selected), "EEEE, MMM d")}
                </CardTitle>
                <p className="flex items-center gap-1 text-sm text-muted">
                  <Clock className="size-3.5" /> {Math.round((totalBlocked / 60) * 10) / 10}h blocked
                </p>
              </CardHeader>
              <CardContent className="space-y-2">
                {dayEvents.length === 0 && (
                  <p className="py-8 text-center text-sm text-muted">No events scheduled.</p>
                )}
                {dayEvents.map((e) => (
                  <div key={e.id} className="group flex items-center gap-3 rounded-xl glass p-3">
                    <span className="h-8 w-1 rounded-full" style={{ background: e.color }} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{e.title}</p>
                      <p className="text-[11px] text-muted">
                        {e.startTime} – {e.endTime}
                      </p>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {e.typeLabel ?? e.type}
                    </Badge>
                    <button
                      type="button"
                      onClick={() => removeEvent(e.id)}
                      aria-label={`Delete ${e.title}`}
                      className="text-muted opacity-0 transition-all hover:text-rose-400 focus:outline-none focus-visible:opacity-100 group-hover:opacity-100"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="day">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <h2 className="mb-4 text-lg font-semibold">{format(new Date(selected), "EEEE, MMMM d")}</h2>
              <DaySchedule events={dayEvents} />
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Productivity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "Focus blocks", value: dayEvents.filter((e) => e.type === "focus").length, color: "#6366f1" },
                  { label: "Habits", value: dayEvents.filter((e) => e.type === "habit").length, color: "#01c3a8" },
                  { label: "Meetings", value: dayEvents.filter((e) => e.type === "meeting").length, color: "#22d3ee" },
                  { label: "Deadlines", value: dayEvents.filter((e) => e.type === "deadline").length, color: "#a63d2a" },
                ].map((s) => (
                  <div key={s.label} className="flex items-center justify-between rounded-xl glass p-3">
                    <span className="flex items-center gap-2 text-sm">
                      <span className="size-2.5 rounded-full" style={{ background: s.color }} />
                      {s.label}
                    </span>
                    <span className="font-bold">{s.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
