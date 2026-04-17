export type CatalogVariant = {
  id: string;
  sku: string;
  size: number;
  color: string;
  stock: number;
  price: number;
  image: string;
};

export type CatalogProduct = {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  soldOut: boolean;
  featured: boolean;
  images: string[];
  variants: CatalogVariant[];
  createdAt: string;
};

export function serializeCatalogProduct(product: any): CatalogProduct {
  return {
    id: product._id.toString(),
    name: product.name ?? "",
    slug: product.slug ?? "",
    description: product.description ?? "",
    category: product.category ?? "",
    soldOut: Boolean(product.soldOut),
    featured: Boolean(product.featured),
    images: Array.isArray(product.images) ? product.images.filter(Boolean) : [],
    createdAt: product.createdAt ? new Date(product.createdAt).toISOString() : new Date(0).toISOString(),
    variants: Array.isArray(product.variants)
      ? product.variants.map((variant: any, index: number) => ({
          id: variant._id?.toString?.() ?? `${product._id.toString()}-${variant.sku ?? index}`,
          sku: variant.sku ?? "",
          size: Number(variant.size ?? 0),
          color: variant.color ?? "Unknown",
          stock: Number(variant.stock ?? 0),
          price: Number(variant.price ?? 0),
          image: variant.image ?? "",
        }))
      : [],
  };
}
