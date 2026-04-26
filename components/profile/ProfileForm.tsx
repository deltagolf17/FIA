"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Loader2, CheckCircle2, AlertCircle, Shield, Lock } from "lucide-react";
import { formatDate } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";

const ROLE_COLORS: Record<string, string> = {
  ADMIN:              "bg-purple-100 text-purple-800",
  SUPERVISOR:         "bg-authority-100 text-authority-800",
  INVESTIGATOR:       "bg-blue-100 text-blue-800",
  FIREFIGHTER:        "bg-fire-100 text-fire-800",
  INSURANCE_ADJUSTER: "bg-green-100 text-green-800",
};

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string | null;
  badgeNumber: string | null;
  certifications: string | null;
  createdAt: Date | string;
  _count: { investigations: number };
}

export function ProfileForm({ user }: { user: User }) {
  const router = useRouter();

  const [profile, setProfile] = useState({
    name: user.name,
    department: user.department ?? "",
    badgeNumber: user.badgeNumber ?? "",
    certifications: user.certifications ?? "",
  });

  const [passwords, setPasswords] = useState({
    current: "",
    newPw: "",
    confirm: "",
  });

  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileMsg(null);
    setProfileSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      const data = await res.json();
      if (!res.ok) {
        setProfileMsg({ type: "err", text: data.error ?? "Failed to save" });
      } else {
        setProfileMsg({ type: "ok", text: "Profile updated successfully" });
        router.refresh();
      }
    } catch {
      setProfileMsg({ type: "err", text: "Network error. Please try again." });
    } finally {
      setProfileSaving(false);
    }
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwMsg(null);
    if (passwords.newPw !== passwords.confirm) {
      setPwMsg({ type: "err", text: "New passwords do not match." });
      return;
    }
    if (passwords.newPw.length < 8) {
      setPwMsg({ type: "err", text: "New password must be at least 8 characters." });
      return;
    }
    setPwSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.newPw }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPwMsg({ type: "err", text: data.error ?? "Failed to update password" });
      } else {
        setPwMsg({ type: "ok", text: "Password updated successfully" });
        setPasswords({ current: "", newPw: "", confirm: "" });
      }
    } catch {
      setPwMsg({ type: "err", text: "Network error. Please try again." });
    } finally {
      setPwSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Account summary */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-authority-100 flex items-center justify-center text-xl font-bold text-authority-700 uppercase shrink-0">
              {user.name.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-slate-900">{user.name}</p>
              <p className="text-sm text-slate-500">{user.email}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", ROLE_COLORS[user.role] ?? "bg-slate-100 text-slate-600")}>
                  {user.role.replace("_", " ")}
                </span>
                <span className="text-xs text-slate-400">{user._count.investigations} investigations · Joined {formatDate(user.createdAt)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile details */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Shield className="w-4 h-4 text-authority-700" /> Profile Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={saveProfile} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="badgeNumber">Badge Number</Label>
                <Input id="badgeNumber" value={profile.badgeNumber} onChange={(e) => setProfile((p) => ({ ...p, badgeNumber: e.target.value }))} placeholder="e.g. INV-042" />
              </div>
              <div className="col-span-2 space-y-1">
                <Label htmlFor="department">Department</Label>
                <Input id="department" value={profile.department} onChange={(e) => setProfile((p) => ({ ...p, department: e.target.value }))} placeholder="e.g. Fire Investigation Unit" />
              </div>
              <div className="col-span-2 space-y-1">
                <Label htmlFor="certifications">Certifications</Label>
                <Input id="certifications" value={profile.certifications} onChange={(e) => setProfile((p) => ({ ...p, certifications: e.target.value }))} placeholder="e.g. NFPA 1033, IAAI-CFI" />
              </div>
            </div>

            {profileMsg && (
              <div className={cn("flex items-center gap-2 text-sm px-3 py-2 rounded-lg", profileMsg.type === "ok" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700")}>
                {profileMsg.type === "ok" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                {profileMsg.text}
              </div>
            )}

            <Button type="submit" disabled={profileSaving} className="gap-1.5 bg-authority-700 hover:bg-authority-800">
              {profileSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Save Profile
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Change password */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Lock className="w-4 h-4 text-authority-700" /> Change Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={savePassword} className="space-y-4">
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="currentPw">Current Password</Label>
                <Input id="currentPw" type="password" value={passwords.current} onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))} required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="newPw">New Password</Label>
                <Input id="newPw" type="password" value={passwords.newPw} onChange={(e) => setPasswords((p) => ({ ...p, newPw: e.target.value }))} placeholder="Min 8 characters" required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="confirmPw">Confirm New Password</Label>
                <Input id="confirmPw" type="password" value={passwords.confirm} onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))} required />
              </div>
            </div>

            {pwMsg && (
              <div className={cn("flex items-center gap-2 text-sm px-3 py-2 rounded-lg", pwMsg.type === "ok" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700")}>
                {pwMsg.type === "ok" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                {pwMsg.text}
              </div>
            )}

            <Button type="submit" disabled={pwSaving} variant="outline" className="gap-1.5">
              {pwSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
              Update Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
