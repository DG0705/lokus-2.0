export default function OrderRowSkeleton() {
  return (
    <div className="border-b border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between gap-4">
        {/* Order ID and Customer Skeleton */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
        </div>
        
        {/* Date and Amount Skeleton */}
        <div className="flex items-center gap-4">
          <div className="h-4 w-28 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
        </div>
        
        {/* Status and Actions Skeleton */}
        <div className="flex items-center gap-3">
          <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
