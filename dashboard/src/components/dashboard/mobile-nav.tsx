"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { navItems } from "@/lib/nav";
import { cn } from "@/lib/utils";

/**
 * Bottom navigation bar for mobile/tablet. Shows the 5 primary views;
 * the full list (incl. Analytics, Weekly, Focus) is in the slide-out menu.
 */
export function MobileNav() {
  const pathname = usePathname();
  const items = navItems.slice(0, 5);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-card-border bg-background pb-[env(safe-area-inset-bottom)] lg:hidden">
      <ul className="mx-auto flex max-w-lg items-stretch justify-around px-1.5 py-1.5">
        {items.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={cn(
                  "relative flex flex-col items-center gap-1 rounded-xl px-1 py-1.5 text-[10px] font-medium transition-colors",
                  active ? "text-foreground" : "text-muted active:text-foreground",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="mobilenav-active"
                    className="absolute inset-x-2 top-0 h-0.5 rounded-full bg-foreground/75"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <Icon className="size-5" />
                <span className="truncate">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
