import type { CatalogProduct, CatalogVariant } from "@/lib/catalog";

export const SHOE_CATEGORIES = ["sneakers", "boots", "heels", "sandals", "loafers", "sports"] as const;

export type ShoeCategory = (typeof SHOE_CATEGORIES)[number];
export type CatalogSortOption = "newest" | "price_asc" | "price_desc";
export type SearchParamsRecord = Record<string, string | string[] | undefined>;

type SearchParamsLike = Pick<URLSearchParams, "get" | "getAll" | "toString">;

export type SearchParamsInput = SearchParamsLike | SearchParamsRecord;

export type CatalogFilters = {
  search: string;
  category: ShoeCategory | "";
  colors: string[];
  sizes: number[];
  minPrice: number | null;
  maxPrice: number | null;
  sort: CatalogSortOption;
};

export type CatalogMatch = {
  product: CatalogProduct;
  variants: CatalogVariant[];
  minPrice: number;
  maxPrice: number;
  colorNames: string[];
  sizeLabels: number[];
  totalStock: number;
  heroImage: string;
};

function isSearchParamsLike(input: SearchParamsInput | undefined): input is SearchParamsLike {
  return Boolean(input && typeof input === "object" && "get" in input && "getAll" in input);
}

function firstValue(input: SearchParamsInput | undefined, ...keys: string[]) {
  if (!input) return "";

  if (isSearchParamsLike(input)) {
    for (const key of keys) {
      const value = input.get(key);
      if (value) return value;
    }
    return "";
  }

  for (const key of keys) {
    const value = input[key];
    if (typeof value === "string" && value) return value;
    if (Array.isArray(value) && value[0]) return value[0];
  }

  return "";
}

function listValues(input: SearchParamsInput | undefined, ...keys: string[]) {
  if (!input) return [] as string[];

  if (isSearchParamsLike(input)) {
    return keys.flatMap((key) =>
      input
        .getAll(key)
        .flatMap((value) => value.split(","))
        .map((value) => value.trim())
        .filter(Boolean),
    );
  }

  return keys.flatMap((key) => {
    const value = input[key];
    if (typeof value === "string") {
      return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }

    if (Array.isArray(value)) {
      return value.flatMap((item) =>
        item
          .split(",")
          .map((entry) => entry.trim())
          .filter(Boolean),
      );
    }

    return [];
  });
}

function parsePriceValue(value: string) {
  if (!value.trim()) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return Math.round(parsed);
}

function normalizeSort(value: string): CatalogSortOption {
  if (value === "price_asc" || value === "price-asc") return "price_asc";
  if (value === "price_desc" || value === "price-desc") return "price_desc";
  return "newest";
}

export function normalizeCategory(value: string | undefined) {
  const normalized = (value ?? "").trim().toLowerCase();
  return SHOE_CATEGORIES.includes(normalized as ShoeCategory) ? (normalized as ShoeCategory) : "";
}

export function normalizeColorValue(color: string) {
  return color.trim().toLowerCase();
}

export function parseCatalogFilters(input?: SearchParamsInput, overrides: Partial<CatalogFilters> = {}): CatalogFilters {
  const parsedSizes = Array.from(
    new Set(
      listValues(input, "size", "sizes")
        .map((value) => Number(value))
        .filter((value) => Number.isFinite(value) && value > 0),
    ),
  ).sort((left, right) => left - right);

  const parsedColors = Array.from(new Set(listValues(input, "color", "colors").map(normalizeColorValue)));

  let minPrice = parsePriceValue(firstValue(input, "minPrice"));
  let maxPrice = parsePriceValue(firstValue(input, "maxPrice"));

  if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) {
    [minPrice, maxPrice] = [maxPrice, minPrice];
  }

  return {
    search: overrides.search ?? firstValue(input, "search", "q").trim(),
    category: overrides.category ?? normalizeCategory(firstValue(input, "category")),
    colors: overrides.colors ?? parsedColors,
    sizes: overrides.sizes ?? parsedSizes,
    minPrice: overrides.minPrice ?? minPrice,
    maxPrice: overrides.maxPrice ?? maxPrice,
    sort: overrides.sort ?? normalizeSort(firstValue(input, "sort")),
  };
}

export function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function priceToPaise(value: number | null) {
  return value === null ? null : Math.round(value * 100);
}

export function buildCatalogMongoQuery(filters: CatalogFilters) {
  const clauses: Record<string, unknown>[] = [];

  if (filters.search) {
    const searchRegex = new RegExp(escapeRegex(filters.search), "i");

    clauses.push({
      $or: [{ name: searchRegex }, { brand: searchRegex }, { category: searchRegex }],
    });
  }

  if (filters.category) {
    clauses.push({ category: filters.category });
  }

  const variantMatch: Record<string, unknown> = {};

  if (filters.sizes.length) {
    variantMatch.size = { $in: filters.sizes };
  }

  if (filters.colors.length) {
    variantMatch.color = {
      $in: filters.colors.map((color) => new RegExp(`^${escapeRegex(color)}$`, "i")),
    };
  }

  const minPrice = priceToPaise(filters.minPrice);
  const maxPrice = priceToPaise(filters.maxPrice);

  if (minPrice !== null || maxPrice !== null) {
    variantMatch.price = {
      ...(minPrice !== null ? { $gte: minPrice } : {}),
      ...(maxPrice !== null ? { $lte: maxPrice } : {}),
    };
  }

  if (Object.keys(variantMatch).length) {
    clauses.push({ variants: { $elemMatch: variantMatch } });
  }

  if (!clauses.length) return {};
  if (clauses.length === 1) return clauses[0];
  return { $and: clauses };
}

export function getMatchingVariants(product: CatalogProduct, filters: Pick<CatalogFilters, "colors" | "sizes" | "minPrice" | "maxPrice">) {
  let variants = [...product.variants];

  if (filters.colors.length) {
    variants = variants.filter((variant) => filters.colors.includes(normalizeColorValue(variant.color)));
  }

  if (filters.sizes.length) {
    variants = variants.filter((variant) => filters.sizes.includes(variant.size));
  }

  const minPrice = priceToPaise(filters.minPrice);
  const maxPrice = priceToPaise(filters.maxPrice);

  if (minPrice !== null) {
    variants = variants.filter((variant) => variant.price >= minPrice);
  }

  if (maxPrice !== null) {
    variants = variants.filter((variant) => variant.price <= maxPrice);
  }

  return variants;
}

function sortMatches(matches: CatalogMatch[], sort: CatalogSortOption) {
  return [...matches].sort((left, right) => {
    if (sort === "price_asc") {
      if (left.minPrice !== right.minPrice) return left.minPrice - right.minPrice;
    }

    if (sort === "price_desc") {
      if (left.maxPrice !== right.maxPrice) return right.maxPrice - left.maxPrice;
    }

    return new Date(right.product.createdAt).getTime() - new Date(left.product.createdAt).getTime();
  });
}

export function getCatalogMatches(products: CatalogProduct[], filters: Pick<CatalogFilters, "colors" | "sizes" | "minPrice" | "maxPrice" | "sort">) {
  const matches = products
    .map<CatalogMatch | null>((product) => {
      const variants = getMatchingVariants(product, filters);

      if (!variants.length) return null;

      const sortedPrices = variants.map((variant) => variant.price).sort((left, right) => left - right);
      const colorNames = Array.from(new Set(variants.map((variant) => variant.color)));
      const sizeLabels = Array.from(new Set(variants.map((variant) => variant.size))).sort((left, right) => left - right);
      const totalStock = variants.reduce((sum, variant) => sum + variant.stock, 0);
      const heroImage =
        variants.find((variant) => variant.image)?.image ||
        product.images.find(Boolean) ||
        "/shoe-placeholder.svg";

      return {
        product,
        variants,
        minPrice: sortedPrices[0],
        maxPrice: sortedPrices[sortedPrices.length - 1],
        colorNames,
        sizeLabels,
        totalStock,
        heroImage,
      };
    })
    .filter((match): match is CatalogMatch => match !== null);

  return sortMatches(matches, filters.sort);
}
