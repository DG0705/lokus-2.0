import "server-only";

import { cache } from "react";
import { type CatalogFilters, type SearchParamsInput, buildCatalogMongoQuery, getCatalogMatches, parseCatalogFilters } from "@/lib/catalog-discovery";
import { serializeCatalogProduct } from "@/lib/catalog";
import { connectToDatabase } from "@/lib/db";
import Shoe from "@/models/Shoe";

const catalogProjection = {
  name: 1,
  brand: 1,
  slug: 1,
  description: 1,
  category: 1,
  images: 1,
  variants: 1,
  soldOut: 1,
  featured: 1,
  createdAt: 1,
};

export async function getCatalogProducts(input?: SearchParamsInput, overrides?: Partial<CatalogFilters>) {
  const filters = parseCatalogFilters(input, overrides);

  await connectToDatabase();

  const shoes = await Shoe.find(buildCatalogMongoQuery(filters))
    .select(catalogProjection)
    .sort({ createdAt: -1 })
    .lean();

  return getCatalogMatches(
    shoes.map((shoe) => serializeCatalogProduct(shoe)),
    filters,
  ).map((match) => match.product);
}

export const getShoeBySlug = cache(async (slug: string) => {
  await connectToDatabase();

  return Shoe.findOne({ slug })
    .select(catalogProjection)
    .lean();
});
