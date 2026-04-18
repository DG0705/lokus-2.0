import { notFound } from "next/navigation";
import { CatalogBrowser } from "@/components/catalog/CatalogBrowser";
import { normalizeCategory, type SearchParamsRecord } from "@/lib/catalog-discovery";
import { getCatalogProducts } from "@/lib/shoe-data";

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams?: SearchParamsRecord;
}) {
  const category = normalizeCategory(params.slug);
  if (!category) notFound();

  try {
    const products = await getCatalogProducts(searchParams, { category });

    return (
      <CatalogBrowser
        routeCategory={category}
        title={category}
        subtitle="Category spotlight"
        products={products}
        emptyMessage={`No ${category} shoes are available with the current filters.`}
      />
    );
  } catch (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {error instanceof Error ? error.message : "Unable to load category"}
      </div>
    );
  }
}
