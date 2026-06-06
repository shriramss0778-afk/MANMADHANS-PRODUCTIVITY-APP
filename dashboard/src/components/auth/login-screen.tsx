"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Script from "next/script";
import { Eye, EyeOff, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: Record<string, string | number | boolean>,
          ) => void;
          prompt: () => void;
        };
      };
    };
  }
}

interface LoginScreenProps {
  loading: boolean;
  onPasswordLogin: (email: string, password: string) => Promise<void>;
  onGoogleLogin: (credential: string) => Promise<void>;
}

export function LoginScreen({ loading, onPasswordLogin, onGoogleLogin }: LoginScreenProps) {
  const buttonRef = useRef<HTMLDivElement | null>(null);
  const googleButtonShellRef = useRef<HTMLDivElement | null>(null);
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!googleLoaded || !clientId || !window.google || !buttonRef.current || !googleButtonShellRef.current) {
      return;
    }

    buttonRef.current.innerHTML = "";
    const buttonWidth = Math.max(googleButtonShellRef.current.clientWidth - 2, 240);
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async ({ credential }) => {
        setError("");
        try {
          await onGoogleLogin(credential);
        } catch {
          setError("This Google account is not authorized for this app.");
        }
      },
    });

    window.google.accounts.id.renderButton(buttonRef.current, {
      theme: "outline",
      size: "large",
      shape: "pill",
      text: "continue_with",
      logo_alignment: "left",
      width: buttonWidth,
    });
  }, [clientId, googleLoaded, onGoogleLogin]);

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    try {
      await onPasswordLogin(email, password);
    } catch {
      setError("Invalid email or password.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => setGoogleLoaded(true)}
      />

      <div className="w-full max-w-xl rounded-[28px] border border-white/10 bg-[#1f1f1f] px-8 py-10 shadow-[0_30px_80px_rgba(0,0,0,0.45)] sm:px-10">
        <div className="text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-white">Welcome back</h1>
          <p className="mt-3 text-lg text-white/65">Sign in to your account</p>
        </div>

        <form className="mt-10 space-y-6" onSubmit={handlePasswordSubmit}>
          <div className="space-y-2.5">
            <label className="text-base font-medium text-white" htmlFor="login-email">
              Email
            </label>
            <Input
              id="login-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@example.com"
              disabled={loading}
              className="h-14 rounded-xl border-white/10 bg-black/80 px-4 text-base text-white placeholder:text-white/35"
            />
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-4">
              <label className="text-base font-medium text-white" htmlFor="login-password">
                Password
              </label>
              <button
                type="button"
                className="text-sm font-medium text-white/80 transition hover:text-white"
                disabled={loading}
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Input
                id="login-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                disabled={loading}
                className="h-14 rounded-xl border-white/10 bg-black/80 px-4 pr-14 text-base text-white placeholder:text-white/35"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/75 transition hover:text-white"
                aria-label={showPassword ? "Hide password" : "Show password"}
                disabled={loading}
              >
                {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="h-14 w-full rounded-xl bg-white text-lg font-semibold text-black hover:bg-white/90"
            disabled={loading || !email.trim() || !password.trim()}
          >
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <div className="mt-8 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-sm uppercase tracking-[0.24em] text-white/55">Or continue with</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        {clientId ? (
          <div className="mt-8">
            <div
              ref={googleButtonShellRef}
              className="relative h-14 w-full overflow-hidden rounded-xl border border-white/10 bg-black/75"
            >
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center gap-3 px-5 text-base font-semibold text-white">
                <svg className="size-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M21.805 10.023h-9.787v3.955h5.613c-.241 1.274-.965 2.354-2.051 3.082v2.56h3.316c1.936-1.783 3.048-4.406 3.048-7.534 0-.684-.061-1.341-.139-2.063Z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12.018 22c2.768 0 5.091-.917 6.788-2.48l-3.316-2.56c-.92.62-2.095.994-3.472.994-2.675 0-4.943-1.805-5.753-4.232H2.836v2.638A10.247 10.247 0 0 0 12.018 22Z"
                    fill="#34A853"
                  />
                  <path
                    d="M6.265 13.722a6.154 6.154 0 0 1-.322-1.954c0-.68.116-1.337.322-1.954V7.176H2.836A10.246 10.246 0 0 0 1.75 11.768c0 1.649.394 3.209 1.086 4.592l3.429-2.638Z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12.018 5.582c1.505 0 2.857.517 3.921 1.531l2.943-2.943C17.104 2.533 14.781 1.5 12.018 1.5A10.247 10.247 0 0 0 2.836 7.176l3.429 2.638c.81-2.427 3.078-4.232 5.753-4.232Z"
                    fill="#EA4335"
                  />
                </svg>
                <span>Continue with Google</span>
              </div>
              <div
                ref={buttonRef}
                className={loading ? "pointer-events-none absolute inset-0 opacity-0" : "absolute inset-0 opacity-0"}
                aria-hidden="true"
              />
            </div>
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-white/10 bg-black/45 p-4 text-center text-sm text-white/65">
            Add `NEXT_PUBLIC_GOOGLE_CLIENT_ID` to `.env` to enable Google sign-in.
          </div>
        )}

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/70">
          <div className="flex items-center gap-2 text-white">
            <Globe className="size-4 text-brand-cyan" />
            Google-only access
          </div>
          <p className="mt-2 leading-6">
            Only users created and approved in the Identity Matrix can enter the app.
          </p>
        </div>

        {error && <p className="mt-5 text-center text-sm text-rose-400">{error}</p>}
      </div>
    </div>
  );
}
