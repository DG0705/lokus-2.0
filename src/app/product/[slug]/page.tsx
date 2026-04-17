import Image from "next/image";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { connectToDatabase } from "@/lib/db";
import Shoe from "@/models/Shoe";

export default async function ProductPage({ params }: { params: { slug: string } }) {
  let product: any;

  try {
    await connectToDatabase();
    product = (await Shoe.findOne({ slug: params.slug }).lean()) as any;
  } catch (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {error instanceof Error ? error.message : "Unable to load product"}
      </div>
    );
  }

  if (!product) notFound();

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="rounded-[28px] bg-white p-6 shadow-soft">
        <div className="relative h-[520px] w-full overflow-hidden rounded-3xl">
          <Image
            src={product.images?.[0] || "/shoe-placeholder.svg"}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 45vw, 100vw"
          />
        </div>
      </div>
      <div>
        <h1 className="text-4xl font-semibold">{product.name}</h1>
        <p className="mt-3 text-lokus-text/70">{product.description}</p>
        <div className="mt-6">
          <AddToCartButton product={product} />
        </div>
      </div>
    </div>
  );
}
