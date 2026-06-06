"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const tooltipStyle = {
  background: "rgba(12,12,20,0.92)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 12,
  color: "#e9e9f2",
  fontSize: 12,
  backdropFilter: "blur(8px)",
};

const axisStyle = { fill: "#9a9ab0", fontSize: 11 };

/** Stacked area chart for learning vs focus hours. */
export function LearningHoursChart({
  data,
}: {
  data: { day: string; hours: number; focus: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 10, right: 6, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id="gHours" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity={0.6} />
            <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gFocus" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.6} />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
        <XAxis dataKey="day" tick={axisStyle} axisLine={false} tickLine={false} />
        <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: "rgba(255,255,255,0.15)" }} />
        <Area type="monotone" dataKey="hours" stroke="#6366f1" strokeWidth={2} fill="url(#gHours)" name="Total hrs" />
        <Area type="monotone" dataKey="focus" stroke="#22d3ee" strokeWidth={2} fill="url(#gFocus)" name="Focus hrs" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/** Knowledge growth line chart. */
export function KnowledgeGrowthChart({
  data,
}: {
  data: { month: string; entries: number; retention: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 10, right: 6, left: -18, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
        <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} />
        <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 11, color: "#9a9ab0" }} />
        <Line type="monotone" dataKey="entries" stroke="#a855f7" strokeWidth={2.5} dot={{ r: 3 }} name="Entries" />
        <Line type="monotone" dataKey="retention" stroke="#22d3ee" strokeWidth={2.5} dot={{ r: 3 }} name="Retention %" />
      </LineChart>
    </ResponsiveContainer>
  );
}

/** Category distribution donut. */
export function CategoryDonut({
  data,
}: {
  data: { name: string; value: number; color: string }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={60}
          outerRadius={95}
          paddingAngle={3}
          stroke="none"
        >
          {data.map((d) => (
            <Cell key={d.name} fill={d.color} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 11, color: "#9a9ab0" }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

/** Productivity radar. */
export function ProductivityRadar({
  data,
}: {
  data: { metric: string; value: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <RadarChart data={data} outerRadius="72%">
        <PolarGrid stroke="rgba(255,255,255,0.1)" />
        <PolarAngleAxis dataKey="metric" tick={axisStyle} />
        <Radar dataKey="value" stroke="#a855f7" fill="#a855f7" fillOpacity={0.35} strokeWidth={2} />
        <Tooltip contentStyle={tooltipStyle} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

/** Weekly bar chart (generic). */
export function WeeklyBars<T extends { day: string }>({
  data,
  dataKey = "hours" as keyof T & string,
  color = "#6366f1",
}: {
  data: T[];
  dataKey?: keyof T & string;
  color?: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 10, right: 6, left: -18, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
        <XAxis dataKey="day" tick={axisStyle} axisLine={false} tickLine={false} />
        <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
        <Bar dataKey={dataKey as never} fill={color} radius={[6, 6, 0, 0]} maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  );
}
