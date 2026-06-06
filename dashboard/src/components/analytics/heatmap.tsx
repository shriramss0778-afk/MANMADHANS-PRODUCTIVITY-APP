"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface HeatmapProps {
  /** intensity values 0–4 */
  data: number[];
  columns?: number;
  className?: string;
  accent?: "purple" | "green" | "cyan";
}

const palettes = {
  purple: ["bg-[var(--surface)]", "bg-purple-500/25", "bg-purple-500/45", "bg-purple-500/70", "bg-purple-400"],
  green: ["bg-[var(--surface)]", "bg-emerald-500/25", "bg-emerald-500/45", "bg-emerald-500/70", "bg-emerald-400"],
  cyan: ["bg-[var(--surface)]", "bg-cyan-500/25", "bg-cyan-500/45", "bg-cyan-500/70", "bg-cyan-400"],
};

/** GitHub-style contribution heatmap. */
export function Heatmap({ data, columns = 7, className, accent = "purple" }: HeatmapProps) {
  const palette = palettes[accent];
  return (
    <div className={cn("space-y-3", className)}>
      <div
        className="grid gap-1.5"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {data.map((v, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.004 }}
            title={`Level ${v}`}
            className={cn("aspect-square rounded-[4px]", palette[v] ?? palette[0])}
          />
        ))}
      </div>
      <div className="flex items-center justify-end gap-1.5 text-[10px] text-muted">
        <span>Less</span>
        {palette.map((p, i) => (
          <span key={i} className={cn("size-3 rounded-[3px]", p)} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
