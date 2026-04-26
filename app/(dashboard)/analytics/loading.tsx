import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";

export default function AnalyticsLoading() {
  return (
    <div className="flex flex-col h-full">
      <div className="h-14 bg-white border-b border-slate-200 px-6 flex items-center shrink-0">
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-48" />
        </div>
      </div>

      <div className="flex-1 p-6 space-y-6 overflow-hidden">
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 bg-white rounded-xl border border-slate-200 p-5">
            <Skeleton className="h-4 w-64 mb-4" />
            <Skeleton className="h-52 w-full" />
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <Skeleton className="h-4 w-32 mb-2" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
