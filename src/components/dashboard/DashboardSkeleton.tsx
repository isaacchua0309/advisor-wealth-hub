
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-9 w-32 mt-4 sm:mt-0" />
      </div>
      
      {/* KPI cards skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="p-4 rounded-lg border bg-card">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-5 w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Charts skeleton */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="border rounded-lg p-6 space-y-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-3 w-48" />
          <Skeleton className="h-[300px] w-full mt-4" />
        </div>
        
        <div className="border rounded-lg p-6 space-y-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-3 w-36" />
          <div className="flex flex-col items-center mt-6">
            <Skeleton className="h-40 w-40 rounded-full" />
            <div className="mt-6 text-center">
              <Skeleton className="h-6 w-32 mx-auto" />
              <Skeleton className="h-3 w-48 mx-auto mt-2" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Notifications and Client Leaderboard skeleton */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="border rounded-lg p-6 space-y-4">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-3 w-48" />
          <div className="space-y-4 mt-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24 mt-1" />
                  </div>
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            ))}
          </div>
        </div>
        
        <div className="border rounded-lg p-6 space-y-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-3 w-36" />
          <div className="space-y-4 mt-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <Skeleton className="h-4 w-28" />
                </div>
                <div className="text-right">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-12 mt-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Recent Activities skeleton */}
      <div className="border rounded-lg p-6 space-y-4">
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-3 w-48" />
        <div className="space-y-4 mt-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-start space-x-3 p-3 border rounded-lg">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div>
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-60 mt-1" />
                <Skeleton className="h-2 w-20 mt-2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
