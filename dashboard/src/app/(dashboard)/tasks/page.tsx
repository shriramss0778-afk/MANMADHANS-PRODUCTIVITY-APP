"use client";

import { ListTodo, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { TaskBoard } from "@/components/tasks/task-board";
import { TaskDialog } from "@/components/tasks/task-dialog";
import { StatCard } from "@/components/dashboard/stat-card";
import { useStore } from "@/lib/store";

export default function TasksPage() {
  const { tasks, addTask, runAction } = useStore();
  const count = (s: string) => tasks.filter((t) => t.status === s).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Task Board"
        subtitle="Drag cards between columns to update status"
        action={<TaskDialog onSave={(task) => runAction(() => addTask(task), "Could not create this task.")} />}
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard label="Pending" value={`${count("pending")}`} icon={ListTodo} accent="indigo" index={0} />
        <StatCard label="In progress" value={`${count("in-progress")}`} icon={Loader2} accent="cyan" index={1} />
        <StatCard label="Completed" value={`${count("completed")}`} icon={CheckCircle2} delta={10} accent="green" index={2} />
        <StatCard label="Delayed" value={`${count("delayed")}`} icon={AlertTriangle} delta={-2} accent="orange" index={3} />
      </div>

      <TaskBoard />
    </div>
  );
}
