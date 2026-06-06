"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { navItems } from "@/lib/nav";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 z-10 hidden h-screen w-64 shrink-0 flex-col border-r border-card-border bg-background-2 p-4 lg:flex">
      <Link href="/" className="mb-6 shrink-0 flex items-center gap-3 px-2 pt-2">
        <div className="grid size-10 place-items-center rounded-xl border border-card-border bg-[var(--surface)] p-[2px]">
          <Image
            src="/logo.jpeg"
            alt="Manmadhan's Productivity logo"
            width={40}
            height={40}
            priority
            className="size-full rounded-[10px] object-cover"
          />
        </div>
        <div>
          <p className="text-sm font-bold leading-tight">MANMADHAN&apos;S PRODUCTIVITY</p>
          <p className="text-[11px] text-muted">Private command center</p>
        </div>
      </Link>

      <nav className="min-h-0 flex-1 overflow-y-auto pr-1">
        <div className="flex flex-col gap-0.5">
        {navItems.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                active ? "text-foreground" : "text-muted hover:bg-[var(--surface)] hover:text-foreground",
              )}
            >
              {active && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-xl bg-[var(--surface-hover)] ring-1 ring-inset ring-white/6"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <Icon className={cn("relative z-10 size-[18px]", active && "text-foreground")} />
              <span className="relative z-10 font-medium">{item.label}</span>
            </Link>
          );
        })}
        </div>
      </nav>
    </aside>
  );
}
