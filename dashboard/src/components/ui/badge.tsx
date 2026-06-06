import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-card-border bg-[var(--surface)] text-foreground",
        outline: "border-card-border text-muted",
        indigo: "border-[#496d95]/30 bg-[#496d95]/20 text-[#b9d0ec]",
        purple: "border-[#6f6581]/30 bg-[#6f6581]/20 text-[#d6c9e7]",
        cyan: "border-[#5f8198]/30 bg-[#5f8198]/20 text-[#c8deea]",
        green: "border-[#4c8b63]/30 bg-[#4c8b63]/20 text-[#cde8d5]",
        orange: "border-[#8b6b4f]/30 bg-[#8b6b4f]/20 text-[#e8d0b8]",
        red: "border-[#8a4e46]/30 bg-[#8a4e46]/20 text-[#edc4be]",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
