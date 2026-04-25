import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RoleGuard } from "@/components/layout/RoleGuard";
import { Shield, Database, Bell, Palette } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="flex flex-col h-full">
      <Header title="System Settings" subtitle="Department configuration and platform settings" />

      <div className="flex-1 p-6 overflow-y-auto">
        <RoleGuard allowedRoles={["ADMIN"]}>
          <div className="max-w-2xl space-y-4">
            {[
              {
                icon: Shield,
                title: "NFPA Compliance",
                items: [
                  { label: "NFPA 921 Edition", value: "2021 Edition" },
                  { label: "NFPA 1033 Edition", value: "2022 Edition" },
                  { label: "Compliance Mode", value: "Strict" },
                ],
              },
              {
                icon: Database,
                title: "Database",
                items: [
                  { label: "Provider", value: "SQLite (dev) / PostgreSQL (prod)" },
                  { label: "Backup", value: "Daily at 02:00 UTC" },
                ],
              },
              {
                icon: Bell,
                title: "Notifications",
                items: [
                  { label: "Incendiary Alerts", value: "Enabled" },
                  { label: "Case Assignments", value: "Enabled" },
                  { label: "Report Approvals", value: "Enabled" },
                ],
              },
              {
                icon: Palette,
                title: "Branding",
                items: [
                  { label: "Platform Name", value: "FireTrace Pro" },
                  { label: "Primary Color", value: "#1E3A8A (Authority Blue)" },
                  { label: "Accent Color", value: "#EA580C (Fire Orange)" },
                ],
              },
            ].map(({ icon: Icon, title, items }) => (
              <Card key={title} className="border-slate-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Icon className="w-4 h-4 text-authority-700" />
                    {title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {items.map(({ label, value }) => (
                      <div key={label} className="flex justify-between text-sm border-b border-slate-50 pb-2">
                        <span className="text-slate-500">{label}</span>
                        <span className="font-medium text-slate-900">{value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </RoleGuard>
      </div>
    </div>
  );
}
