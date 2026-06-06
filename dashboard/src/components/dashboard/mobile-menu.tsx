"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { LogOut, X } from "lucide-react";
import { navItems } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

/** Full-navigation slide-out drawer for mobile/tablet (triggered by the topbar menu button). */
export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const pathname = usePathname();
  const { logout, user, loading } = useStore();

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 360, damping: 36 }}
            className="absolute inset-y-0 left-0 flex w-[82%] max-w-[20rem] flex-col overflow-hidden border-r border-card-border bg-background-2 p-4 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.45)]"
            role="dialog"
            aria-label="Navigation menu"
          >
            <div className="mb-6 flex items-center justify-between">
              <Link href="/" onClick={onClose} className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-xl border border-card-border bg-[var(--surface)] p-[2px]">
                  <Image
                    src="/logo.jpeg"
                    alt="Manmadhan's Productivity logo"
                    width={40}
                    height={40}
                    className="size-full rounded-[10px] object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold leading-tight">MANMADHAN&apos;S PRODUCTIVITY</p>
                  <p className="text-[11px] text-muted">Private command center</p>
                </div>
              </Link>
              <button
                onClick={onClose}
                aria-label="Close menu"
                className="grid size-9 place-items-center rounded-lg text-muted hover:bg-[var(--surface-hover)] hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>

            <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto pr-1 pb-28 [padding-bottom:calc(7rem+env(safe-area-inset-bottom))]">
              {navItems.map((item) => {
                const active =
                  item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-colors",
                      active
                        ? "bg-[var(--surface-hover)] text-foreground ring-1 ring-inset ring-white/6"
                        : "text-muted hover:bg-[var(--surface)] hover:text-foreground",
                    )}
                  >
                    <Icon className={cn("size-5", active && "text-foreground")} />
                    <div className="min-w-0">
                      <p className="font-medium leading-tight">{item.label}</p>
                      <p className="truncate text-[11px] text-muted">{item.description}</p>
                    </div>
                  </Link>
                );
              })}
            </nav>
            <button
              type="button"
              onClick={() => {
                onClose();
                void logout();
              }}
              disabled={loading}
              className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-card-border bg-[var(--surface)] px-4 py-3 text-sm font-medium text-foreground"
            >
              <span className="truncate">{user?.name ?? "Logout"}</span>
              <LogOut className="size-4" />
            </button>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
