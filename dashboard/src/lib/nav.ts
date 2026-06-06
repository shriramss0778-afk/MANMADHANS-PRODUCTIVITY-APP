import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Brain,
  BookOpen,
  CheckSquare,
  CalendarDays,
  BarChart3,
  CalendarRange,
  NotebookPen,
  Timer,
  ShieldCheck,
  UserRoundCog,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  description: string;
}

export const navItems: NavItem[] = [
  { label: "Overview", href: "/", icon: LayoutDashboard, description: "Your daily command center" },
  { label: "Knowledge", href: "/knowledge", icon: Brain, description: "Notes, videos & concepts" },
  { label: "Books", href: "/books", icon: BookOpen, description: "Reading tracker & streaks" },
  { label: "Tasks", href: "/tasks", icon: CheckSquare, description: "Plan & ship your work" },
  { label: "Calendar", href: "/calendar", icon: CalendarDays, description: "Time blocking & schedule" },
  { label: "Analytics", href: "/analytics", icon: BarChart3, description: "Progress & insights" },
  { label: "Identity Matrix", href: "/identity-matrix", icon: ShieldCheck, description: "Users, roles & access" },
  { label: "My Profile", href: "/my-profile", icon: UserRoundCog, description: "Account & password settings" },
  { label: "Weekly", href: "/weekly", icon: CalendarRange, description: "Weekly to-dos & habits" },
  { label: "Notepad", href: "/notepad", icon: NotebookPen, description: "Quick notes & scratchpad" },
  { label: "Focus", href: "/focus", icon: Timer, description: "Pomodoro & deep work" },
];
