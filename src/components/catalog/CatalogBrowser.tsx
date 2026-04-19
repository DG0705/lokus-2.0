"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Search, Filter, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { CatalogProduct } from "@/lib/catalog";
import { ShoeCategory, CatalogSortOption, SHOE_CATEGORIES } from "@/lib/catalog-discovery";

interface CatalogBrowserProps {
  routeCategory?: ShoeCategory;
  title: string;
  subtitle: string;
  products: CatalogProduct[];
  emptyMessage: string;
}

export function CatalogBrowser({ routeCategory, title, subtitle, products, emptyMessage }: CatalogBrowserProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState(searchParams.get("search") || "");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Update URL when debounced search changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedSearch) {
      params.set("search", debouncedSearch);
    } else {
      params.delete("search");
    }
    router.push(`${pathname}?${params.toString()}`);
  }, [debouncedSearch, pathname, router, searchParams]);

  const currentFilters = useMemo(() => ({
    search: searchParams.get("search") || "",
    category: routeCategory || (searchParams.get("category") as ShoeCategory) || "",
    colors: searchParams.getAll("color"),
    sizes: searchParams.getAll("size").map(Number),
    minPrice: searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : null,
    maxPrice: searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : null,
    sort: (searchParams.get("sort") as CatalogSortOption) || "newest",
  }), [searchParams, routeCategory]);

  const updateFilter = (key: string, value: string | number | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null || value === "") {
      params.delete(key);
    } else {
      params.set(key, String(value));
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const updateMultiFilter = (key: string, value: string | number, isActive: boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    const currentValues = params.getAll(key);
    
    if (isActive) {
      // Remove the value
      const newValues = currentValues.filter(v => v !== String(value));
      params.delete(key);
      newValues.forEach(v => params.append(key, v));
    } else {
      // Add the value
      params.append(key, String(value));
    }
    
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearAllFilters = () => {
    const params = new URLSearchParams();
    if (routeCategory) {
      params.set("category", routeCategory);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const hasActiveFilters = useMemo(() => {
    return currentFilters.search || 
           currentFilters.colors.length > 0 || 
           currentFilters.sizes.length > 0 || 
           currentFilters.minPrice !== null || 
           currentFilters.maxPrice !== null ||
           currentFilters.sort !== "newest";
  }, [currentFilters]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold capitalize">{title}</h1>
        <p className="mt-2 text-gray-600">{subtitle}</p>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search shoes, brands, categories..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full rounded-lg border border-gray-200 pl-10 pr-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2">
          <select
            value={currentFilters.sort}
            onChange={(e) => updateFilter("sort", e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="newest">Newest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>

          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50"
          >
            <Filter className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <span className="rounded-full bg-blue-500 px-2 py-0.5 text-xs text-white">
                {[currentFilters.colors.length, currentFilters.sizes.length, currentFilters.minPrice !== null ? 1 : 0, currentFilters.maxPrice !== null ? 1 : 0].reduce((a, b) => a + b, 0)}
              </span>
            )}
          </button>

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              <X className="h-4 w-4" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Filter Sidebar */}
      {isFilterOpen && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Price Range */}
            <div>
              <h3 className="mb-3 font-semibold">Price Range</h3>
              <div className="space-y-2">
                <input
                  type="number"
                  placeholder="Min Price"
                  value={currentFilters.minPrice || ""}
                  onChange={(e) => updateFilter("minPrice", e.target.value ? Number(e.target.value) : null)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <input
                  type="number"
                  placeholder="Max Price"
                  value={currentFilters.maxPrice || ""}
                  onChange={(e) => updateFilter("maxPrice", e.target.value ? Number(e.target.value) : null)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Sizes */}
            <div>
              <h3 className="mb-3 font-semibold">Sizes</h3>
              <div className="flex flex-wrap gap-2">
                {[6, 7, 8, 9, 10, 11, 12].map((size) => {
                  const isActive = currentFilters.sizes.includes(size);
                  return (
                    <button
                      key={size}
                      onClick={() => updateMultiFilter("size", size, isActive)}
                      className={`rounded-lg border px-3 py-1 text-sm transition-colors ${
                        isActive
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Colors */}
            <div>
              <h3 className="mb-3 font-semibold">Colors</h3>
              <div className="flex flex-wrap gap-2">
                {["black", "white", "red", "blue", "green", "brown", "gray", "navy"].map((color) => {
                  const isActive = currentFilters.colors.includes(color);
                  return (
                    <button
                      key={color}
                      onClick={() => updateMultiFilter("color", color, isActive)}
                      className={`rounded-lg border px-3 py-1 text-sm capitalize transition-colors ${
                        isActive
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {color}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Categories */}
            <div>
              <h3 className="mb-3 font-semibold">Categories</h3>
              <div className="flex flex-wrap gap-2">
                {SHOE_CATEGORIES.map((category) => {
                  const isActive = currentFilters.category === category;
                  return (
                    <button
                      key={category}
                      onClick={() => updateFilter("category", isActive ? "" : category)}
                      className={`rounded-lg border px-3 py-1 text-sm capitalize transition-colors ${
                        isActive
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {category}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-12 text-center">
          <div className="text-gray-500">{emptyMessage}</div>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <div key={product.id} className="group relative rounded-lg border border-gray-200 bg-white overflow-hidden hover:shadow-lg transition-shadow">
              {/* Sold Out Badge */}
              {product.soldOut && (
                <div className="absolute top-2 left-2 z-10 rounded-full bg-red-500 px-2 py-1 text-xs font-semibold text-white">
                  Sold Out
                </div>
              )}

              {/* Product Image */}
              <div className="relative h-48 w-full overflow-hidden bg-gray-50">
                <Image
                  src={product.images[0] || "/shoe-placeholder.svg"}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(min-width: 640px) 50vw, 100vw"
                />
              </div>

              {/* Product Info */}
              <div className="p-4">
                <div className="text-xs text-gray-500 uppercase tracking-wide">{product.brand}</div>
                <h3 className="mt-1 font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  <Link href={`/product/${product.slug}`}>
                    {product.name}
                  </Link>
                </h3>
                <p className="mt-1 text-sm text-gray-600 line-clamp-2">{product.description}</p>
                
                {/* Price Range */}
                <div className="mt-3">
                  {product.variants.length > 0 ? (
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-gray-900">
                        ₹{Math.min(...product.variants.map(v => v.price)).toLocaleString()}
                      </span>
                      {Math.max(...product.variants.map(v => v.price)) > Math.min(...product.variants.map(v => v.price)) && (
                        <span className="text-sm text-gray-500">
                          - ₹{Math.max(...product.variants.map(v => v.price)).toLocaleString()}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-500">Price unavailable</span>
                  )}
                </div>

                {/* Available Colors */}
                {product.variants.length > 0 && (
                  <div className="mt-3 flex items-center gap-1">
                    <span className="text-xs text-gray-500">Colors:</span>
                    <div className="flex gap-1">
                      {Array.from(new Set(product.variants.map(v => v.color))).slice(0, 3).map((color) => (
                        <div
                          key={color}
                          className="h-4 w-4 rounded-full border border-gray-300"
                          style={{ backgroundColor: color.toLowerCase() }}
                          title={color}
                        />
                      ))}
                      {Array.from(new Set(product.variants.map(v => v.color))).length > 3 && (
                        <span className="text-xs text-gray-500">+{Array.from(new Set(product.variants.map(v => v.color))).length - 3}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
