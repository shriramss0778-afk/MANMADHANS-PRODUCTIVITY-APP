"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStore } from "@/lib/store";

export function PasswordChangeGate() {
  const { user, loading, changePassword, logout } = useStore();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      await changePassword(oldPassword, newPassword, confirmPassword);
      setSuccess("Password updated successfully. Your account is ready.");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (submissionError) {
      if (submissionError instanceof Error) {
        setError(submissionError.message);
        return;
      }
      setError("Could not change password. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-xl rounded-[28px] border border-white/10 bg-[#1f1f1f] px-8 py-10 shadow-[0_30px_80px_rgba(0,0,0,0.45)] sm:px-10">
        <div className="text-center">
          <h1 className="text-4xl font-semibold tracking-tight text-white">Set a new password</h1>
          <p className="mt-3 text-base leading-7 text-white/65">
            Welcome, {user?.name ?? "there"}. For security, every new user must change the default
            password before entering the app.
          </p>
        </div>

        <form className="mt-10 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2.5">
            <label className="text-base font-medium text-white" htmlFor="current-password">
              Current password
            </label>
            <Input
              id="current-password"
              type="password"
              value={oldPassword}
              onChange={(event) => setOldPassword(event.target.value)}
              disabled={loading}
              className="h-14 rounded-xl border-white/10 bg-black/80 px-4 text-base text-white"
            />
          </div>

          <div className="space-y-2.5">
            <label className="text-base font-medium text-white" htmlFor="new-password">
              New password
            </label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              disabled={loading}
              className="h-14 rounded-xl border-white/10 bg-black/80 px-4 text-base text-white"
            />
          </div>

          <div className="space-y-2.5">
            <label className="text-base font-medium text-white" htmlFor="confirm-password">
              Confirm new password
            </label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              disabled={loading}
              className="h-14 rounded-xl border-white/10 bg-black/80 px-4 text-base text-white"
            />
          </div>

          <Button
            type="submit"
            className="h-14 w-full rounded-xl bg-white text-lg font-semibold text-black hover:bg-white/90"
            disabled={loading || !oldPassword || !newPassword || !confirmPassword}
          >
            {loading ? "Saving..." : "Update password"}
          </Button>
        </form>

        <button
          type="button"
          onClick={() => void logout()}
          disabled={loading}
          className="mt-4 w-full text-sm font-medium text-white/70 transition hover:text-white"
        >
          Sign out
        </button>

        {error && <p className="mt-5 text-center text-sm text-rose-400">{error}</p>}
        {success && <p className="mt-5 text-center text-sm text-emerald-400">{success}</p>}
      </div>
    </div>
  );
}
