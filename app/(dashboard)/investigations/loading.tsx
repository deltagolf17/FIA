import { Skeleton, SkeletonTable } from "@/components/ui/skeleton";

export default function InvestigationsLoading() {
  return (
    <div className="flex flex-col h-full">
      <div className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-8 w-36 rounded-lg" />
      </div>

      <div className="flex-1 p-6 space-y-4 overflow-hidden">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-64 rounded-lg" />
          <Skeleton className="h-8 w-36 rounded-lg" />
        </div>

        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-7 w-20 rounded-lg" />
          ))}
        </div>

        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-7 w-24 rounded-lg" />
          ))}
        </div>

        <SkeletonTable rows={8} />
      </div>
    </div>
  );
}
