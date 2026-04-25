import { Flame, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";

interface KPI {
  label: string;
  value: number | string;
  delta?: string;
  deltaUp?: boolean;
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
}

interface KPICardsProps {
  stats: {
    open: number;
    inProgress: number;
    closed: number;
    incendiary: number;
  };
}

export function KPICards({ stats }: KPICardsProps) {
  const kpis: KPI[] = [
    {
      label: "Open Cases",
      value: stats.open,
      delta: "Active investigations",
      icon: Flame,
      color: "text-authority-800",
      bg: "bg-authority-50",
      border: "border-authority-100",
    },
    {
      label: "In Progress",
      value: stats.inProgress,
      delta: "Under investigation",
      icon: Clock,
      color: "text-fire-600",
      bg: "bg-fire-50",
      border: "border-fire-100",
    },
    {
      label: "Closed",
      value: stats.closed,
      delta: "Resolved cases",
      icon: CheckCircle,
      color: "text-green-700",
      bg: "bg-green-50",
      border: "border-green-100",
    },
    {
      label: "Incendiary Flags",
      value: stats.incendiary,
      delta: "Require attention",
      icon: AlertTriangle,
      color: "text-red-700",
      bg: "bg-red-50",
      border: "border-red-100",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <Card key={kpi.label} className={cn("border p-5 card-hover", kpi.border)}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{kpi.label}</p>
                <p className={cn("text-3xl font-bold mt-1", kpi.color)}>{kpi.value}</p>
                <p className="text-xs text-slate-400 mt-1">{kpi.delta}</p>
              </div>
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", kpi.bg)}>
                <Icon className={cn("w-5 h-5", kpi.color)} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
