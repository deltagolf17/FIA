"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, UserCog, Eye, EyeOff, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ROLES = [
  { value: "FIREFIGHTER",        label: "Firefighter" },
  { value: "INVESTIGATOR",       label: "Investigator" },
  { value: "SUPERVISOR",         label: "Supervisor" },
  { value: "INSURANCE_ADJUSTER", label: "Insurance Adjuster" },
  { value: "ADMIN",              label: "Admin" },
];

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string | null;
  badgeNumber: string | null;
}

interface Props {
  user: User;
  onClose: () => void;
}

export function EditUserModal({ user, onClose }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    name:           user.name,
    email:          user.email,
    role:           user.role,
    department:     user.department ?? "",
    badgeNumber:    user.badgeNumber ?? "",
    certifications: "",
    newPassword:    "",
  });

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (form.newPassword && form.newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      const body: Record<string, string> = {
        name:           form.name,
        email:          form.email,
        role:           form.role,
        department:     form.department,
        badgeNumber:    form.badgeNumber,
        certifications: form.certifications,
      };
      if (form.newPassword) body.newPassword = form.newPassword;

      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to update user");
        return;
      }

      router.refresh();
      onClose();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <UserCog className="w-5 h-5 text-authority-700" />
            <h2 className="font-semibold text-slate-900">Edit User</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="edit-name">Full Name *</Label>
              <Input
                id="edit-name"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="edit-email">Email *</Label>
              <Input
                id="edit-email"
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="edit-role">Role *</Label>
            <select
              id="edit-role"
              value={form.role}
              onChange={(e) => set("role", e.target.value)}
              className="w-full h-9 px-3 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-authority-500"
              required
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="edit-department">Department</Label>
              <Input
                id="edit-department"
                value={form.department}
                onChange={(e) => set("department", e.target.value)}
                placeholder="Fire Marshal Office"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="edit-badge">Badge Number</Label>
              <Input
                id="edit-badge"
                value={form.badgeNumber}
                onChange={(e) => set("badgeNumber", e.target.value)}
                placeholder="INV-042"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="edit-certs">Certifications</Label>
            <Input
              id="edit-certs"
              value={form.certifications}
              onChange={(e) => set("certifications", e.target.value)}
              placeholder="NFPA 1033, IAAI-CFI"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="edit-password">New Password <span className="text-slate-400 font-normal">(leave blank to keep current)</span></Label>
            <div className="relative">
              <Input
                id="edit-password"
                type={showPassword ? "text" : "password"}
                value={form.newPassword}
                onChange={(e) => set("newPassword", e.target.value)}
                placeholder="Min 8 characters"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-authority-700 hover:bg-authority-800" disabled={loading}>
              {loading ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
