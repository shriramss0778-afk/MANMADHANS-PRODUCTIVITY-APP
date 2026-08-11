"use client";

import type { ReactNode } from "react";
import { useStore } from "@/lib/store";
import { LoginScreen } from "@/components/auth/login-screen";
import { PasswordChangeGate } from "@/components/auth/password-change-gate";
import { StoreProvider } from "@/lib/store";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { AiAssistant } from "@/components/dashboard/ai-assistant";
import { AppBackground } from "@/components/dashboard/app-background";
import { PendingToast } from "@/components/dashboard/pending-toast";
import { ErrorToast } from "@/components/dashboard/error-toast";

function DashboardShell({ children }: { children: ReactNode }) {
  const { user, loading, login, loginWithGoogle, sessionError, retryHydration } = useStore();

  if (!user) {
    return (
      <LoginScreen
        loading={loading}
        onPasswordLogin={login}
        onGoogleLogin={loginWithGoogle}
        sessionError={sessionError}
        onRetrySession={retryHydration}
      />
    );
  }

  if (user.passwordChangeRequired) {
    return <PasswordChangeGate />;
  }

  return (
    <div className="flex h-screen w-full max-w-full overflow-hidden">
      <AppBackground />
      <Sidebar />
      <div className="relative z-10 flex h-screen w-full min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="w-full min-w-0 flex-1 overflow-y-auto px-3 pb-28 pt-5 sm:px-4 md:px-6 md:pt-6 lg:pb-10">
          {children}
        </main>
      </div>
      <MobileNav />
      <AiAssistant />
      <PendingToast />
      <ErrorToast />
    </div>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <StoreProvider>
      <DashboardShell>{children}</DashboardShell>
    </StoreProvider>
  );
}
