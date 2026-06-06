import { cn } from "@/lib/utils";

/** Shimmering loading placeholder. */
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-[var(--surface-hover)]",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
