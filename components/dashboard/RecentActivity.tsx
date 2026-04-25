import { formatRelative } from "@/lib/utils/formatters";
import { getStatusColor } from "@/lib/nfpa/nfpa921";
import { Flame } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

interface ActivityItem {
  id: string;
  caseNumber: string;
  address: string;
  status: string;
  createdAt: Date;
}

export function RecentActivity({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-slate-400">
        <Flame className="w-8 h-8 mb-2 opacity-40" />
        <p className="text-sm">No recent investigations</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <Link
          key={item.id}
          href={`/investigations/${item.id}`}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors group"
        >
          <div className="w-8 h-8 bg-authority-100 rounded-lg flex items-center justify-center shrink-0">
            <Flame className="w-4 h-4 text-authority-700" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate group-hover:text-authority-800">
              {item.caseNumber}
            </p>
            <p className="text-xs text-slate-500 truncate">{item.address}</p>
          </div>
          <div className="shrink-0 flex flex-col items-end gap-1">
            <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", getStatusColor(item.status))}>
              {item.status.replace("_", " ")}
            </span>
            <span className="text-xs text-slate-400">{formatRelative(item.createdAt)}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
