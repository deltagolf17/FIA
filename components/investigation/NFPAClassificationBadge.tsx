import { cn } from "@/lib/utils/cn";
import { NFPA_CAUSE_CODES, getCauseCodeColor } from "@/lib/nfpa/nfpa921";

interface NFPAClassificationBadgeProps {
  code: string | null | undefined;
  showLabel?: boolean;
  size?: "sm" | "md";
}

export function NFPAClassificationBadge({ code, showLabel = true, size = "md" }: NFPAClassificationBadgeProps) {
  if (!code) {
    return (
      <span className={cn(
        "inline-flex items-center rounded-full border font-medium",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs",
        "bg-slate-100 text-slate-500 border-slate-200"
      )}>
        Pending
      </span>
    );
  }

  const info = NFPA_CAUSE_CODES[code as keyof typeof NFPA_CAUSE_CODES];
  const colorClass = getCauseCodeColor(code);

  return (
    <span className={cn(
      "inline-flex items-center gap-1 rounded-full border font-semibold",
      size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs",
      colorClass
    )}>
      <span className="font-mono">{info?.code ?? code.slice(0, 3)}</span>
      {showLabel && info && <span>— {info.label}</span>}
    </span>
  );
}
