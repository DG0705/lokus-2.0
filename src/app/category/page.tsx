import { CatalogBrowser } from "@/components/catalog/CatalogBrowser";
import { parseCatalogFilters, type SearchParamsRecord } from "@/lib/catalog-discovery";
import { getCatalogProducts } from "@/lib/shoe-data";

export default async function CategoryIndexPage({ searchParams }: { searchParams?: SearchParamsRecord }) {
  try {
    const filters = parseCatalogFilters(searchParams);
    const products = await getCatalogProducts(searchParams);
    const title = filters.category || "all shoes";
    const subtitle = filters.search ? `Results for "${filters.search}"` : "Discovery hub";

    return (
      <CatalogBrowser
        title={title}
        subtitle={subtitle}
        products={products}
        emptyMessage="No shoes matched these filters. Try a different search or widen the price range."
      />
    );
  } catch (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {error instanceof Error ? error.message : "Unable to load catalog"}
      </div>
    );
  }
}
