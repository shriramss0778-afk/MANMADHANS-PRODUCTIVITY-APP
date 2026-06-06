"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  delta?: number;
  detail?: string;
  accent?: "cyan" | "indigo" | "purple" | "green" | "orange";
  index?: number;
  /** When true, `value` is a title (book title) and should be rendered prominently with truncation */
  valueIsTitle?: boolean;
}

const accentMap = {
  cyan: "bg-[#2d3943] text-[#bcd1de]",
  indigo: "bg-[#343c49] text-[#c5cfde]",
  purple: "bg-[#433848] text-[#d6cadb]",
  green: "bg-[#31453a] text-[#cae2d1]",
  orange: "bg-[#4a3a2d] text-[#ead8c6]",
};

export function StatCard({
  label,
  value,
  icon: Icon,
  delta,
  detail,
  accent = "indigo",
  index = 0,
  valueIsTitle = false,
}: StatCardProps) {
  const positive = (delta ?? 0) >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      whileHover={{ y: -2 }}
      className="glass-strong glow-ring relative min-w-0 overflow-hidden rounded-[22px] p-4 sm:p-5"
    >
      <div
        className={cn(
          "absolute right-[3%] top-4 grid size-10 shrink-0 place-items-center rounded-[18px] sm:right-[3.5%] sm:size-11",
          accentMap[accent],
        )}
      >
        <Icon className="size-4 sm:size-5" />
      </div>

      <div className="flex min-h-[150px] min-w-0 flex-col pr-12 sm:min-h-[180px] sm:pr-16">
        <p className="max-w-full text-balance text-xs font-medium uppercase leading-[1.25] tracking-[0.12em] text-muted sm:text-sm break-normal whitespace-normal">
          {label}
        </p>

        <div className="mt-6 min-w-0 sm:mt-8">
          {valueIsTitle ? (
            <>
              <p className="truncate text-[1.25rem] font-semibold leading-[1.05] tracking-[-0.02em] text-foreground sm:text-[1.55rem]">
                {value}
              </p>
              {detail && (
                <p className="mt-2 text-sm font-medium leading-[1.1] text-muted">{detail}</p>
              )}
            </>
          ) : (
            <>
              <p className="line-clamp-3 break-normal text-[1.65rem] font-semibold leading-[1] tracking-[-0.04em] text-foreground sm:line-clamp-2 sm:text-[2.5rem]">
                {value}
              </p>

              {detail && (
                <p className="mt-4 whitespace-pre-line text-[1rem] font-medium leading-[1.1] text-muted sm:text-[1.15rem]">
                  {detail}
                </p>
              )}
            </>
          )}
        </div>

        {delta !== undefined && (
          <span
            className={cn(
              "mt-auto inline-flex max-w-[7ch] flex-col items-start gap-1 text-sm sm:text-base",
              positive ? "text-emerald-400" : "text-rose-400",
            )}
          >
            <span className="inline-flex items-center gap-1 font-semibold">
              {positive ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
              {Math.abs(delta)}%
            </span>
            <span className="text-muted">vs last week</span>
          </span>
        )}
      </div>
    </motion.div>
  );
}
