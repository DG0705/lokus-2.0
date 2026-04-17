import { notFound } from "next/navigation";
import { CatalogBrowser } from "@/components/catalog/CatalogBrowser";
import { connectToDatabase } from "@/lib/db";
import { serializeCatalogProduct } from "@/lib/catalog";
import Shoe from "@/models/Shoe";

const categories = ["sneakers", "boots", "heels", "sandals", "loafers", "sports"];

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  if (!categories.includes(params.slug)) notFound();

  try {
    await connectToDatabase();
    const products = await Shoe.find({ category: params.slug }).sort({ createdAt: -1 }).lean();

    return (
      <CatalogBrowser
        title={params.slug}
        subtitle="Category spotlight"
        products={products.map((product: any) => serializeCatalogProduct(product))}
        emptyMessage={`No ${params.slug} shoes are available with the current filters.`}
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
