"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { CatalogProduct, CatalogVariant } from "@/lib/catalog";

type SortOption = "newest" | "price-asc" | "price-desc" | "name";

type CatalogBrowserProps = {
  title: string;
  subtitle: string;
  products: CatalogProduct[];
  emptyMessage: string;
};

type ProductMatch = {
  product: CatalogProduct;
  variants: CatalogVariant[];
  minPrice: number;
  maxPrice: number;
  colorNames: string[];
  sizeLabels: number[];
  totalStock: number;
  heroImage: string;
};

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const colorMap: Record<string, string> = {
  black: "#1f1f1f",
  white: "#f6f3ee",
  offwhite: "#f2ede4",
  "off white": "#f2ede4",
  cream: "#efe1c6",
  beige: "#d7c1a2",
  tan: "#bc8a5f",
  brown: "#6b4f3a",
  mocha: "#7b5a44",
  cognac: "#8b5e3c",
  grey: "#8a8f98",
  gray: "#8a8f98",
  silver: "#c3c8d1",
  blue: "#4361ee",
  navy: "#1f3b73",
  "navy blue": "#1f3b73",
  red: "#c44b4f",
  burgundy: "#7f1d3a",
  green: "#4d7c58",
  olive: "#7a7d3b",
  yellow: "#f1c550",
  orange: "#e58f3f",
  pink: "#d78ea0",
  purple: "#7561a7",
  gold: "#b58b6b",
};

function formatPrice(price: number) {
  return currencyFormatter.format(price / 100);
}

function formatPriceRange(minPrice: number, maxPrice: number) {
  if (minPrice === maxPrice) return formatPrice(minPrice);
  return `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;
}

function normalizeColor(color: string) {
  return color.trim().toLowerCase();
}

function colorFallback(color: string) {
  const hue = Array.from(color).reduce((total, char) => (total + char.charCodeAt(0) * 7) % 360, 0);
  return `hsl(${hue} 55% 68%)`;
}

function getColorStyle(color: string): CSSProperties {
  const normalized = normalizeColor(color);
  if (colorMap[normalized]) return { backgroundColor: colorMap[normalized] };
  if (/^[a-z]+$/.test(normalized)) return { backgroundColor: normalized };
  return { backgroundColor: colorFallback(normalized) };
}

function isLightColor(color: string) {
  const normalized = normalizeColor(color);
  return ["white", "off white", "offwhite", "cream", "beige", "silver", "yellow"].some((item) => normalized.includes(item));
}

function getProductMatches(
  products: CatalogProduct[],
  selectedColors: string[],
  selectedSizes: number[],
  inStockOnly: boolean,
  minPriceInput: string,
  maxPriceInput: string,
  sortBy: SortOption,
) {
  const minPrice = minPriceInput ? Number(minPriceInput) : null;
  const maxPrice = maxPriceInput ? Number(maxPriceInput) : null;

  const matches = products
    .map<ProductMatch | null>((product) => {
      let variants = [...product.variants];

      if (inStockOnly) {
        variants = variants.filter((variant) => variant.stock > 0);
      }

      if (selectedColors.length) {
        variants = variants.filter((variant) => selectedColors.includes(variant.color));
      }

      if (selectedSizes.length) {
        variants = variants.filter((variant) => selectedSizes.includes(variant.size));
      }

      if (minPrice !== null) {
        variants = variants.filter((variant) => variant.price / 100 >= minPrice);
      }

      if (maxPrice !== null) {
        variants = variants.filter((variant) => variant.price / 100 <= maxPrice);
      }

      if (!variants.length) return null;

      const sortedPrices = variants.map((variant) => variant.price).sort((a, b) => a - b);
      const colorNames = Array.from(new Set(variants.map((variant) => variant.color)));
      const sizeLabels = Array.from(new Set(variants.map((variant) => variant.size))).sort((a, b) => a - b);
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
    .filter((entry): entry is ProductMatch => entry !== null);

  matches.sort((left, right) => {
    if (sortBy === "price-asc") return left.minPrice - right.minPrice;
    if (sortBy === "price-desc") return right.maxPrice - left.maxPrice;
    if (sortBy === "name") return left.product.name.localeCompare(right.product.name);
    return new Date(right.product.createdAt).getTime() - new Date(left.product.createdAt).getTime();
  });

  return matches;
}

export function CatalogBrowser({ title, subtitle, products, emptyMessage }: CatalogBrowserProps) {
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<number[]>([]);
  const [minPriceInput, setMinPriceInput] = useState("");
  const [maxPriceInput, setMaxPriceInput] = useState("");

  const availableColors = useMemo(
    () => Array.from(new Set(products.flatMap((product) => product.variants.map((variant) => variant.color)))).sort(),
    [products],
  );

  const availableSizes = useMemo(
    () => Array.from(new Set(products.flatMap((product) => product.variants.map((variant) => variant.size)))).sort((a, b) => a - b),
    [products],
  );

  const priceBounds = useMemo(() => {
    const allPrices = products.flatMap((product) => product.variants.map((variant) => variant.price / 100));
    if (!allPrices.length) return { min: 0, max: 0 };
    return {
      min: Math.floor(Math.min(...allPrices)),
      max: Math.ceil(Math.max(...allPrices)),
    };
  }, [products]);

  const matches = useMemo(
    () => getProductMatches(products, selectedColors, selectedSizes, inStockOnly, minPriceInput, maxPriceInput, sortBy),
    [products, selectedColors, selectedSizes, inStockOnly, minPriceInput, maxPriceInput, sortBy],
  );

  const toggleColor = (color: string) => {
    setSelectedColors((current) => (current.includes(color) ? current.filter((item) => item !== color) : [...current, color]));
  };

  const toggleSize = (size: number) => {
    setSelectedSizes((current) => (current.includes(size) ? current.filter((item) => item !== size) : [...current, size]));
  };

  const clearFilters = () => {
    setSortBy("newest");
    setInStockOnly(false);
    setSelectedColors([]);
    setSelectedSizes([]);
    setMinPriceInput("");
    setMaxPriceInput("");
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-[#B58B6B]">{subtitle}</p>
          <h1 className="mt-3 text-4xl font-semibold capitalize text-[#2C2B2B]">{title}</h1>
        </div>
        <p className="text-sm text-[#2C2B2B]/65">
          Showing {matches.length} of {products.length} styles
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <div className="order-2 lg:order-1">
          {matches.length ? (
            <div className="grid gap-6 md:grid-cols-2">
              {matches.map((entry) => (
                <Link
                  key={entry.product.id}
                  href={`/product/${entry.product.slug}`}
                  className="group rounded-[30px] border border-[#D4C4B7] bg-white p-4 shadow-soft transition-transform duration-200 hover:-translate-y-1"
                >
                  <div className="relative overflow-hidden rounded-[24px] bg-[#F1E7DE]">
                    <div className="absolute left-4 top-4 z-10 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#2C2B2B]">
                      {entry.totalStock > 0 ? "In stock" : "Sold out"}
                    </div>
                    <div className="relative aspect-[4/3] overflow-hidden rounded-[24px]">
                      <Image
                        src={entry.heroImage}
                        alt={entry.product.name}
                        fill
                        className="object-cover transition duration-300 group-hover:scale-[1.03]"
                        sizes="(min-width: 1024px) 32vw, (min-width: 768px) 44vw, 100vw"
                      />
                    </div>
                  </div>

                  <div className="mt-5 flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-semibold text-[#2C2B2B]">{entry.product.name}</h2>
                      <p className="mt-2 text-sm leading-6 text-[#2C2B2B]/68">{entry.product.description}</p>
                    </div>
                    <span className="rounded-full bg-[#F6F0EA] px-3 py-1 text-xs font-semibold capitalize text-[#B58B6B]">
                      {entry.product.category}
                    </span>
                  </div>

                  <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-[#2C2B2B]/45">Price</p>
                      <p className="mt-2 text-2xl font-semibold text-[#2C2B2B]">
                        {formatPriceRange(entry.minPrice, entry.maxPrice)}
                      </p>
                    </div>
                    <div className="text-right text-sm text-[#2C2B2B]/62">
                      <p>{entry.colorNames.length} colors</p>
                      <p>{entry.sizeLabels.length} sizes</p>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      {entry.colorNames.slice(0, 5).map((color) => (
                        <span
                          key={`${entry.product.id}-${color}`}
                          title={color}
                          className={`h-5 w-5 rounded-full ${isLightColor(color) ? "ring-1 ring-black/15" : ""}`}
                          style={getColorStyle(color)}
                          aria-label={color}
                        />
                      ))}
                      {entry.colorNames.length > 5 ? (
                        <span className="rounded-full bg-[#F6F0EA] px-2 py-1 text-[11px] font-semibold text-[#2C2B2B]/65">
                          +{entry.colorNames.length - 5}
                        </span>
                      ) : null}
                    </div>
                    <span className="text-sm font-medium text-[#B58B6B]">View details</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-[30px] border border-dashed border-[#D4C4B7] bg-white/70 px-6 py-12 text-center">
              <h2 className="text-xl font-semibold text-[#2C2B2B]">No shoes match these filters</h2>
              <p className="mt-3 text-sm text-[#2C2B2B]/68">{emptyMessage}</p>
              <button
                type="button"
                onClick={clearFilters}
                className="mt-6 rounded-full bg-[#2C2B2B] px-5 py-2.5 text-sm font-semibold text-white"
              >
                Reset filters
              </button>
            </div>
          )}
        </div>

        <aside className="order-1 lg:order-2">
          <div className="rounded-[30px] border border-[#D4C4B7] bg-white p-5 shadow-soft lg:sticky lg:top-24">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#B58B6B]">Filter & sort</p>
                <p className="mt-1 text-sm text-[#2C2B2B]/62">Refine by price, stock, color, and size.</p>
              </div>
              <button type="button" onClick={clearFilters} className="text-sm font-medium text-[#2C2B2B]/65">
                Clear
              </button>
            </div>

            <div className="mt-6 space-y-6">
              <div>
                <label htmlFor="sort-by" className="text-sm font-semibold text-[#2C2B2B]">
                  Sort by
                </label>
                <select
                  id="sort-by"
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value as SortOption)}
                  className="mt-2 w-full rounded-2xl border border-[#D4C4B7] bg-[#F9F7F5] px-4 py-3 text-sm text-[#2C2B2B] outline-none"
                >
                  <option value="newest">Newest arrivals</option>
                  <option value="price-asc">Price: low to high</option>
                  <option value="price-desc">Price: high to low</option>
                  <option value="name">Name: A to Z</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold text-[#2C2B2B]">Price range</p>
                  <span className="text-xs text-[#2C2B2B]/55">
                    {priceBounds.min ? `${currencyFormatter.format(priceBounds.min)} - ${currencyFormatter.format(priceBounds.max)}` : "Any budget"}
                  </span>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  <label className="text-sm text-[#2C2B2B]/70">
                    Min (INR)
                    <input
                      type="number"
                      min="0"
                      inputMode="numeric"
                      value={minPriceInput}
                      onChange={(event) => setMinPriceInput(event.target.value)}
                      placeholder={priceBounds.min ? String(priceBounds.min) : "0"}
                      className="mt-2 w-full rounded-2xl border border-[#D4C4B7] bg-[#F9F7F5] px-4 py-3 text-sm text-[#2C2B2B] outline-none"
                    />
                  </label>
                  <label className="text-sm text-[#2C2B2B]/70">
                    Max (INR)
                    <input
                      type="number"
                      min="0"
                      inputMode="numeric"
                      value={maxPriceInput}
                      onChange={(event) => setMaxPriceInput(event.target.value)}
                      placeholder={priceBounds.max ? String(priceBounds.max) : "0"}
                      className="mt-2 w-full rounded-2xl border border-[#D4C4B7] bg-[#F9F7F5] px-4 py-3 text-sm text-[#2C2B2B] outline-none"
                    />
                  </label>
                </div>
              </div>

              <label className="flex items-center justify-between gap-4 rounded-2xl border border-[#D4C4B7] bg-[#F9F7F5] px-4 py-3 text-sm text-[#2C2B2B]">
                <span className="font-semibold">Only show in-stock pairs</span>
                <input type="checkbox" checked={inStockOnly} onChange={(event) => setInStockOnly(event.target.checked)} />
              </label>

              <div>
                <p className="text-sm font-semibold text-[#2C2B2B]">Colors</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {availableColors.map((color) => {
                    const active = selectedColors.includes(color);
                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => toggleColor(color)}
                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition ${
                          active ? "border-[#B58B6B] bg-[#F6F0EA] text-[#2C2B2B]" : "border-[#D4C4B7] bg-white text-[#2C2B2B]/70"
                        }`}
                      >
                        <span className={`h-4 w-4 rounded-full ${isLightColor(color) ? "ring-1 ring-black/15" : ""}`} style={getColorStyle(color)} />
                        {color}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-[#2C2B2B]">Sizes</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {availableSizes.map((size) => {
                    const active = selectedSizes.includes(size);
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => toggleSize(size)}
                        className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                          active ? "border-[#2C2B2B] bg-[#2C2B2B] text-white" : "border-[#D4C4B7] bg-white text-[#2C2B2B]/75"
                        }`}
                      >
                        EU {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
