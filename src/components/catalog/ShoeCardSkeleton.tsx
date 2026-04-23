export default function ShoeCardSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
      {/* Image Area Skeleton */}
      <div className="relative h-[520px] w-full bg-gray-200 animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-t from-gray-200 to-gray-300 opacity-20"></div>
      </div>
      
      {/* Content Area Skeleton */}
      <div className="p-6 space-y-4">
        {/* Title Line Skeleton */}
        <div className="h-8 bg-gray-200 rounded-lg animate-pulse mb-4"></div>
        
        {/* Price Line Skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
        </div>
        
        {/* Action Button Skeleton */}
        <div className="mt-6">
          <div className="h-12 bg-gray-200 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
