"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col h-full items-center justify-center p-6">
      <div className="max-w-md text-center">
        <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <AlertTriangle className="w-7 h-7 text-red-600" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 mb-2">Something went wrong</h2>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
          An unexpected error occurred while loading this page. The issue has been logged.
          {error.digest && (
            <span className="block mt-2 font-mono text-xs text-slate-400">
              Error ID: {error.digest}
            </span>
          )}
        </p>
        <Button onClick={reset} className="gap-2">
          <RefreshCw className="w-3.5 h-3.5" />
          Try again
        </Button>
      </div>
    </div>
  );
}
