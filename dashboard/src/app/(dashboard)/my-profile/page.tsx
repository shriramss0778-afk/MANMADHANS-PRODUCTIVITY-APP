"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStore } from "@/lib/store";

export default function MyProfilePage() {
  const { user, loading, updateProfileName, changePassword } = useStore();
  const [name, setName] = useState(user?.name ?? "");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileMessage, setProfileMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  if (!user) {
    return null;
  }

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProfileError("");
    setProfileMessage("");

    try {
      await updateProfileName(name);
      setProfileMessage("Name updated successfully.");
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : "Could not update your name.");
    }
  };

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordError("");
    setPasswordMessage("");

    try {
      await changePassword(oldPassword, newPassword, confirmPassword);
      setPasswordMessage("Password updated successfully.");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : "Could not update your password.");
    }
  };

  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">My Profile</h1>
        <p className="text-sm text-muted">
          Manage your name, check your account details, and reset your password securely.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[28px] border border-card-border bg-card px-5 py-6 shadow-[0_20px_50px_rgba(0,0,0,0.18)] sm:px-6">
          <h2 className="text-xl font-semibold">Account details</h2>
          <div className="mt-5 space-y-4 text-sm text-muted">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted/80">Email</p>
              <p className="mt-1 text-base text-foreground">{user.email}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted/80">Role</p>
              <p className="mt-1 text-base text-foreground">{user.role.replaceAll("_", " ")}</p>
            </div>
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleProfileSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="profile-name">
                Name
              </label>
              <Input
                id="profile-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                disabled={loading}
                className="h-12 rounded-xl"
              />
            </div>

            <Button type="submit" disabled={loading || !name.trim()} className="h-12 rounded-xl px-5">
              Save name
            </Button>
          </form>

          {profileMessage && <p className="mt-4 text-sm text-emerald-400">{profileMessage}</p>}
          {profileError && <p className="mt-4 text-sm text-rose-400">{profileError}</p>}
        </div>

        <div className="rounded-[28px] border border-card-border bg-card px-5 py-6 shadow-[0_20px_50px_rgba(0,0,0,0.18)] sm:px-6">
          <h2 className="text-xl font-semibold">Reset password</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Enter your current password first, then choose a new one.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handlePasswordSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="old-password">
                Current password
              </label>
              <Input
                id="old-password"
                type="password"
                value={oldPassword}
                onChange={(event) => setOldPassword(event.target.value)}
                disabled={loading}
                className="h-12 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="new-password">
                New password
              </label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                disabled={loading}
                className="h-12 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="confirm-new-password">
                Confirm new password
              </label>
              <Input
                id="confirm-new-password"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                disabled={loading}
                className="h-12 rounded-xl"
              />
            </div>

            <Button
              type="submit"
              disabled={loading || !oldPassword || !newPassword || !confirmPassword}
              className="h-12 rounded-xl px-5"
            >
              Change password
            </Button>
          </form>

          {passwordMessage && <p className="mt-4 text-sm text-emerald-400">{passwordMessage}</p>}
          {passwordError && <p className="mt-4 text-sm text-rose-400">{passwordError}</p>}
        </div>
      </div>
    </section>
  );
}
