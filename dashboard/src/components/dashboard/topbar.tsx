"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Search, Moon, Sun, Menu, LogOut } from "lucide-react";
import { navItems } from "@/lib/nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Notifications } from "@/components/dashboard/notifications";
import { MobileMenu } from "@/components/dashboard/mobile-menu";
import { useStore } from "@/lib/store";

export function Topbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { user, logout, loading } = useStore();
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  const current =
    navItems.find((n) => (n.href === "/" ? pathname === "/" : pathname.startsWith(n.href))) ??
    navItems[0];

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-card-border bg-background px-3 py-3 sm:gap-3 md:px-6">
        <button
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          className="grid size-9 shrink-0 place-items-center rounded-lg border border-card-border bg-[var(--surface)] text-foreground lg:hidden"
        >
          <Menu className="size-5" />
        </button>

        <div className="min-w-0">
          <h1 className="truncate text-base font-semibold tracking-[-0.01em] sm:text-lg">{current.label}</h1>
          <p className="hidden truncate text-xs text-muted sm:block">{current.description}</p>
        </div>

        <div className="relative ml-auto hidden max-w-xs flex-1 sm:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <Input placeholder="Search everything..." className="pl-9" />
        </div>

        <div className="ml-auto flex items-center gap-1.5 sm:ml-0 sm:gap-2">
          <Notifications />

          <Button
            variant="secondary"
            size="icon"
            aria-label="Toggle theme"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            {mounted && theme === "light" ? (
              <Moon className="size-[18px]" />
            ) : (
              <Sun className="size-[18px]" />
            )}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => void logout()}
            disabled={loading}
            className="hidden sm:inline-flex"
          >
            <span className="max-w-32 truncate">{user?.name ?? "Logout"}</span>
            <LogOut className="size-4" />
          </Button>
        </div>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
