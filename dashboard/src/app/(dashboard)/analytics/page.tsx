"use client";

import { Clock, BookOpen, CheckCircle2, Brain, Target, Zap } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CircularProgress } from "@/components/ui/circular-progress";
import { Heatmap } from "@/components/analytics/heatmap";
import {
  LearningHoursChart,
  KnowledgeGrowthChart,
  CategoryDonut,
  ProductivityRadar,
} from "@/components/analytics/charts";
import { useStore } from "@/lib/store";

export default function AnalyticsPage() {
  const { analytics, tasks, knowledge } = useStore();
  const learningHours = analytics.weeklyLearningHours.reduce((sum, item) => sum + item.hours, 0);
  const focusHours = analytics.weeklyLearningHours.reduce((sum, item) => sum + item.focus, 0);
  const completionRate = tasks.length
    ? Math.round((tasks.filter((task) => task.status === "completed").length / tasks.length) * 100)
    : 0;
  const productivityScore = Math.round(
    analytics.productivityRadar.reduce((sum, item) => sum + item.value, 0) /
      Math.max(1, analytics.productivityRadar.length),
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" subtitle="Your growth, measured" />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Learning hours" value={`${learningHours.toFixed(1)}h`} icon={Clock} delta={12} accent="indigo" index={0} />
        <StatCard label="Focus time" value={`${focusHours.toFixed(1)}h`} icon={Zap} delta={9} accent="cyan" index={1} />
        <StatCard label="Completion rate" value={`${completionRate}%`} icon={CheckCircle2} delta={4} accent="green" index={2} />
        <StatCard label="Knowledge items" value={`${knowledge.length}`} icon={Brain} delta={18} accent="purple" index={3} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Learning & focus hours</CardTitle>
          </CardHeader>
          <CardContent>
            <LearningHoursChart data={analytics.weeklyLearningHours} />
          </CardContent>
        </Card>

        <Card className="flex flex-col items-center justify-center">
          <CardHeader className="items-center">
            <CardTitle>Productivity score</CardTitle>
          </CardHeader>
          <CardContent>
            <CircularProgress value={productivityScore} size={170} strokeWidth={12} sublabel="overall" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Knowledge growth</CardTitle>
            <p className="text-sm text-muted">Entries logged & retention over 6 months</p>
          </CardHeader>
          <CardContent>
            <KnowledgeGrowthChart data={analytics.knowledgeGrowth} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>By category</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryDonut data={analytics.categoryDistribution} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="size-4 text-brand-purple" /> Skill balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ProductivityRadar data={analytics.productivityRadar} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Focus heatmap</CardTitle>
            <p className="text-sm text-muted">Deep work consistency over time</p>
          </CardHeader>
          <CardContent>
            <Heatmap data={analytics.focusHeatmap} columns={17} accent="cyan" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
