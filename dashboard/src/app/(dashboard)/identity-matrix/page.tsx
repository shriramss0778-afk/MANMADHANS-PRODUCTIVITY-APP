"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Copy,
  Loader2,
  MailPlus,
  Power,
  Settings2,
  ShieldCheck,
  Trash2,
  UserCog,
  Users,
  XCircle,
} from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  createManagedUser,
  deleteManagedUser,
  fetchAppSettings,
  fetchManagedUsers,
  updateAppSettings,
  updateManagedUser,
} from "@/lib/api/dashboard";
import type { AppSettings, ManagedUser } from "@/lib/types";

type RoleValue = ManagedUser["role"];

const ROLES: RoleValue[] = ["SUPER_ADMIN", "ADMIN", "USER"];

function buildInviteMessage(
  user: { name: string; email: string; temporaryPassword: string },
  portalUrl: string,
) {
  return [
    "Manmadhan's Productivity Access Invitation",
    "",
    "Your private account has been successfully initialized.",
    "",
    `Name: ${user.name.toUpperCase()}`,
    `Email: ${user.email}`,
    `Password: ${user.temporaryPassword}`,
    "",
    "Please reset your password after your first login.",
    "Please do not share your login credentials.",
    "",
    `Access Portal: ${portalUrl}`,
  ].join("\n");
}

export default function IdentityMatrixPage() {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [error, setError] = useState("");
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [copied, setCopied] = useState(false);
  const [inviteMessage, setInviteMessage] = useState("");
  const [invitedUser, setInvitedUser] = useState<{
    name: string;
    email: string;
    temporaryPassword: string;
  } | null>(null);
  const [settings, setSettings] = useState<AppSettings>({
    accessPortalUrl: "",
  });
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "USER" as RoleValue,
  });

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [nextUsers, nextSettings] = await Promise.all([
        fetchManagedUsers(),
        fetchAppSettings(),
      ]);
      setUsers(nextUsers);
      setSettings(nextSettings);
    } catch {
      setError("Unable to load the Identity Matrix.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((user) => user.isActive).length;
    const admin = users.filter((user) => user.role === "SUPER_ADMIN" || user.role === "ADMIN").length;
    const inactive = users.filter((user) => !user.isActive).length;
    return { total, active, admin, inactive };
  }, [users]);

  const addUser = async () => {
    if (!form.name.trim() || !form.email.trim()) return;
    setSaving(true);
    setError("");
    try {
      const { user: created, temporaryPassword } = await createManagedUser({
        name: form.name.trim(),
        email: form.email.trim(),
        role: form.role,
        isActive: true,
        googleLoginEnabled: true,
      });
      setUsers((prev) => [created, ...prev]);
      const invited = { name: created.name, email: created.email, temporaryPassword };
      setInvitedUser(invited);
      setInviteMessage(buildInviteMessage(invited, settings.accessPortalUrl));
      setForm({
        name: "",
        email: "",
        role: "USER",
      });
      setShowInviteForm(false);
      setCopied(false);
    } catch {
      setError("Unable to invite this identity.");
    } finally {
      setSaving(false);
    }
  };

  const savePortalUrl = async () => {
    if (!settings.accessPortalUrl.trim()) return;
    setSettingsSaving(true);
    setError("");
    try {
      const saved = await updateAppSettings({
        accessPortalUrl: settings.accessPortalUrl.trim(),
      });
      setSettings(saved);
      if (inviteMessage && invitedUser) {
        setInviteMessage(buildInviteMessage(invitedUser, saved.accessPortalUrl));
      }
    } catch {
      setError("Unable to save the access portal URL.");
    } finally {
      setSettingsSaving(false);
    }
  };

  const patchUser = async (
    id: string,
    updates: Partial<Omit<ManagedUser, "id" | "createdAt" | "updatedAt">>,
  ) => {
    const current = users.find((user) => user.id === id);
    if (!current) return;

    const optimistic = { ...current, ...updates };
    setUsers((prev) => prev.map((user) => (user.id === id ? optimistic : user)));

    try {
      const saved = await updateManagedUser(id, updates);
      setUsers((prev) => prev.map((user) => (user.id === id ? saved : user)));
    } catch {
      setUsers((prev) => prev.map((user) => (user.id === id ? current : user)));
      setError("Unable to update this identity.");
    }
  };

  const removeUser = async (id: string) => {
    const previous = users;
    setUsers((prev) => prev.filter((user) => user.id !== id));
    try {
      await deleteManagedUser(id);
    } catch {
      setUsers(previous);
      setError("Unable to delete this identity.");
    }
  };

  const copyInvite = async () => {
    if (!inviteMessage) return;
    await navigator.clipboard.writeText(inviteMessage);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Identity Matrix"
        subtitle="Invite and manage the identities that can access Manmadhan's Productivity."
        action={
          <Button onClick={() => setShowInviteForm((value) => !value)}>
            <MailPlus className="size-4" />
            {showInviteForm ? "Close invite" : "Invite identity"}
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted">Total Identities</p>
            <p className="mt-2 text-3xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted">Active Nodes</p>
            <p className="mt-2 text-3xl font-bold">{stats.active}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted">Admin Access</p>
            <p className="mt-2 text-3xl font-bold">{stats.admin}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted">Inactive</p>
            <p className="mt-2 text-3xl font-bold">{stats.inactive}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="size-4 text-brand-cyan" /> Identity Directory
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading && (
              <div className="rounded-xl glass p-4 text-sm text-muted">Loading identities...</div>
            )}

            {!loading && users.length === 0 && (
              <div className="rounded-xl glass p-4 text-sm text-muted">
                No identities have been invited yet.
              </div>
            )}

            {users.map((user) => (
              <div key={user.id} className="rounded-2xl glass p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{user.name}</p>
                    <p className="truncate text-sm text-muted">{user.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void removeUser(user.id)}
                    className="grid size-8 shrink-0 place-items-center rounded-lg bg-[var(--surface)] text-muted transition-all hover:bg-rose-500/80 hover:text-white"
                    aria-label={`Delete ${user.email}`}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Badge variant="default">{user.role}</Badge>
                  <Badge variant={user.isActive ? "green" : "outline"}>
                    {user.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <Badge variant={user.googleLoginEnabled ? "cyan" : "outline"}>
                    {user.googleLoginEnabled ? "Google enabled" : "Google off"}
                  </Badge>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {ROLES.map((role) => (
                    <Button
                      key={role}
                      type="button"
                      variant={user.role === role ? "default" : "secondary"}
                      size="sm"
                      onClick={() => void patchUser(user.id, { role })}
                    >
                      {role}
                    </Button>
                  ))}
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => void patchUser(user.id, { isActive: !user.isActive })}
                  >
                    {user.isActive ? <XCircle className="size-4" /> : <CheckCircle2 className="size-4" />}
                    {user.isActive ? "Deactivate" : "Activate"}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      void patchUser(user.id, { googleLoginEnabled: !user.googleLoginEnabled })
                    }
                  >
                    <Power className="size-4" />
                    {user.googleLoginEnabled ? "Google off" : "Google on"}
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          {showInviteForm && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="size-4 text-brand-cyan" /> Invite identity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-muted">Name</label>
                  <Input
                    value={form.name}
                    onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                    placeholder="Team member name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-muted">Email</label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                    placeholder="name@gmail.com"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-muted">Role</label>
                  <div className="flex flex-wrap gap-2">
                    {ROLES.map((role) => (
                      <Button
                        key={role}
                        type="button"
                        variant={form.role === role ? "default" : "secondary"}
                        size="sm"
                        onClick={() => setForm((prev) => ({ ...prev, role }))}
                      >
                        {role}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl glass p-3 text-sm text-muted">
                  Access and Google login are enabled automatically for invited identities.
                </div>
                <Button onClick={() => void addUser()} className="w-full" disabled={saving}>
                  {saving ? <Loader2 className="size-4 animate-spin" /> : <MailPlus className="size-4" />}
                  Send invite
                </Button>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="size-4 text-brand-cyan" /> Access portal URL
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                value={settings.accessPortalUrl}
                onChange={(event) =>
                  setSettings((prev) => ({ ...prev, accessPortalUrl: event.target.value }))
                }
                placeholder="https://your-app-url.com"
              />
              <Button onClick={() => void savePortalUrl()} disabled={settingsSaving} className="w-full">
                {settingsSaving ? <Loader2 className="size-4 animate-spin" /> : <Settings2 className="size-4" />}
                Save portal URL
              </Button>
              <p className="text-xs text-muted">
                Super admins can update the invite portal after deployment.
              </p>
            </CardContent>
          </Card>

          {inviteMessage && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCog className="size-4 text-brand-cyan" /> Invite message
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <pre className="whitespace-pre-wrap rounded-xl glass p-4 text-sm leading-6 text-foreground">
                  {inviteMessage}
                </pre>
                <Button onClick={() => void copyInvite()} className="w-full" variant="secondary">
                  <Copy className="size-4" />
                  {copied ? "Copied" : "Copy invitation"}
                </Button>
              </CardContent>
            </Card>
          )}

          {error && <p className="text-sm text-rose-400">{error}</p>}
        </div>
      </div>
    </div>
  );
}
