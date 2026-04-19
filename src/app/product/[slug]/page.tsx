import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { connectToDatabase } from "@/lib/db";
import Shoe from "@/models/Shoe";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    await connectToDatabase();
    const product = await Shoe.findOne({ slug: params.slug }).lean();
    
    if (!product) {
      return {
        title: "Product Not Found | Lokus",
        description: "The requested product could not be found.",
      };
    }

    const productData = product as any;
    const title = `${productData.name || 'Product'} | Lokus`;
    const description = productData.description?.slice(0, 160) || "Premium footwear from Lokus";
    
    // Get the first image for Open Graph
    const ogImage = productData.images?.[0] || "/shoe-placeholder.svg";

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: productData.name || 'Product',
          },
        ],
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [ogImage],
      },
    };
  } catch {
    return {
      title: "Product | Lokus",
      description: "Premium footwear from Lokus",
    };
  }
}

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
