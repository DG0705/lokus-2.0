import Link from "next/link";
import { CatalogBrowser } from "@/components/catalog/CatalogBrowser";
import { connectToDatabase } from "@/lib/db";
import { serializeCatalogProduct } from "@/lib/catalog";
import Shoe from "@/models/Shoe";

const categories = ["sneakers", "boots", "heels", "sandals", "loafers", "sports"];

export default async function CategoryIndexPage({ searchParams }: { searchParams?: { q?: string } }) {
  const q = searchParams?.q?.trim() ?? "";
  let products: any[] = [];
  let dbError = "";

  if (q) {
    try {
      await connectToDatabase();
      products = await Shoe.find({
        $or: [
          { name: { $regex: q, $options: "i" } },
          { description: { $regex: q, $options: "i" } },
          { category: { $regex: q, $options: "i" } },
        ],
      })
        .sort({ createdAt: -1 })
        .limit(20)
        .lean();
    } catch (error) {
      dbError = error instanceof Error ? error.message : "Search unavailable";
    }
  }

  return (
    <div>
      <h1 className="text-4xl font-semibold">Shop by category</h1>

      {q ? (
        <section className="mt-8">
          {dbError ? <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700">{dbError}</p> : null}
          {!dbError ? (
            <CatalogBrowser
              title="Search results"
              subtitle={`Results for "${q}"`}
              products={products.map((product) => serializeCatalogProduct(product))}
              emptyMessage="No shoes matched your search."
            />
          ) : null}
        </section>
      ) : null}

      {!q ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <Link key={c} href={`/category/${c}`} className="rounded-3xl border border-[#D4C4B7] bg-white p-6 capitalize shadow-soft">
              {c}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
