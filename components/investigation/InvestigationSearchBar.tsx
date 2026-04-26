"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Search, X } from "lucide-react";

export function InvestigationSearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const q = searchParams.get("q") ?? "";
  const status = searchParams.get("status") ?? "";
  const cause = searchParams.get("cause") ?? "";

  const push = useCallback(
    (newQ: string) => {
      const params = new URLSearchParams();
      if (newQ) params.set("q", newQ);
      if (status) params.set("status", status);
      if (cause) params.set("cause", cause);
      const qs = params.toString();
      startTransition(() => {
        router.push(qs ? `/investigations?${qs}` : "/investigations");
      });
    },
    [router, status, cause]
  );

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
      <input
        type="text"
        defaultValue={q}
        placeholder="Search case #, address, city…"
        onChange={(e) => push(e.target.value)}
        className="pl-9 pr-8 py-1.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 w-64 focus:outline-none focus:ring-2 focus:ring-authority-500 focus:border-transparent"
      />
      {q && (
        <button
          onClick={() => push("")}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
