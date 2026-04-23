import ShoeCardSkeleton from "@/components/catalog/ShoeCardSkeleton";

export default function CategoryLoading() {
  return (
    <div className="mb-5">
      <h1 className="text-3xl font-semibold mb-5">Loading Category</h1>
      
      {/* Responsive Grid of Skeletons */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <ShoeCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
