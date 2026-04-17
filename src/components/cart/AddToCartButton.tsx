"use client";

import { useMemo, useState } from "react";
import { useCart } from "@/hooks/useCart";

export function AddToCartButton({ product }: { product: any }) {
  const [variantId, setVariantId] = useState(product.variants?.[0]?._id?.toString() ?? "");
  const { addItem, openCart } = useCart();

  const selected = useMemo(
    () => product.variants?.find((v: any) => v._id.toString() === variantId) ?? product.variants?.[0],
    [product.variants, variantId],
  );

  if (!selected) return null;

  const handleAdd = () => {
    const result = addItem({
      shoeId: product._id.toString(),
      variantId: selected._id.toString(),
      name: product.name,
      price: selected.price,
      quantity: 1,
      size: selected.size,
      color: selected.color,
      image: selected.image || product.images?.[0] || "/shoe-placeholder.svg",
      availableStock: selected.stock,
    });

    if (!result.ok) return alert(result.message);
    openCart();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {product.variants.map((v: any) => (
          <button
            key={v._id.toString()}
            onClick={() => setVariantId(v._id.toString())}
            className={`rounded-full border px-4 py-2 text-sm ${v._id.toString() === selected._id.toString() ? "border-[#B58B6B] bg-[#F4ECE6]" : "border-[#D4C4B7] bg-white"}`}
          >
            {v.color} / EU {v.size} ({v.stock})
          </button>
        ))}
      </div>
      <button
        onClick={handleAdd}
        disabled={selected.stock === 0}
        className="rounded-full bg-[#2C2B2B] px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {selected.stock > 0 ? "Add to Cart" : "Sold Out"}
      </button>
    </div>
  );
}
