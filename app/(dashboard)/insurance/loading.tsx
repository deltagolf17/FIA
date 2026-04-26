import { Skeleton, SkeletonTable } from "@/components/ui/skeleton";

export default function InsuranceLoading() {
  return (
    <div className="flex flex-col h-full">
      <div className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
        <Skeleton className="h-8 w-28 rounded-lg" />
      </div>

      <div className="flex-1 p-6 space-y-6 overflow-hidden">
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
              <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-7 w-12" />
              </div>
            </div>
          ))}
        </div>
        <SkeletonTable rows={5} />
      </div>
    </div>
  );
}
