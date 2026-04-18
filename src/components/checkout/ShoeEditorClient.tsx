"use client";

import { useMemo, useState } from "react";
import { SHOE_CATEGORIES } from "@/lib/catalog-discovery";

type Variant = { sku: string; size: number; color: string; stock: number; price: number; image?: string };

export function ShoeEditorClient({ shoe }: { shoe?: any }) {
  const [brand, setBrand] = useState(shoe?.brand ?? "");
  const [name, setName] = useState(shoe?.name ?? "");
  const [slug, setSlug] = useState(shoe?.slug ?? "");
  const [description, setDescription] = useState(shoe?.description ?? "");
  const [category, setCategory] = useState(shoe?.category ?? "sneakers");
  const [featured, setFeatured] = useState(Boolean(shoe?.featured));
  const [images] = useState<string[]>(shoe?.images ?? []);
  const [variants, setVariants] = useState<Variant[]>(
    shoe?.variants?.map((variant: any) => ({
      sku: variant.sku,
      size: variant.size,
      color: variant.color,
      stock: variant.stock,
      price: variant.price,
      image: variant.image || "",
    })) ?? [{ sku: "SKU-001", size: 42, color: "Black", stock: 5, price: 9999, image: "" }],
  );
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  const totalStock = useMemo(() => variants.reduce((sum, variant) => sum + Number(variant.stock || 0), 0), [variants]);

  const upsert = async () => {
    setSaving(true);
    setMsg("");
    const payload = { brand, name, slug, description, category, featured, images, variants };
    const res = await fetch(shoe?._id ? `/api/shoes/${shoe._id}` : "/api/shoes", {
      method: shoe?._id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) return setMsg(data.message || "Save failed");
    setMsg("Saved successfully");
    if (!shoe?._id) window.location.href = `/admin/shoes/${data.data._id}`;
  };

  const setVariant = (idx: number, patch: Partial<Variant>) => {
    setVariants((prev) => prev.map((variant, index) => (index === idx ? { ...variant, ...patch } : variant)));
  };

  const addVariant = () =>
    setVariants((prev) => [...prev, { sku: `SKU-${prev.length + 1}`, size: 42, color: "Black", stock: 0, price: 9999, image: "" }]);

  const removeVariant = (idx: number) => setVariants((prev) => prev.filter((_, index) => index !== idx));

  return (
    <div className="space-y-5">
      {msg ? <div className="rounded-xl border border-[#D4C4B7] bg-white px-4 py-2 text-sm">{msg}</div> : null}

      <div className="grid gap-3 md:grid-cols-2">
        <input className="rounded-xl border border-[#D4C4B7] px-3 py-2" placeholder="Brand" value={brand} onChange={(event) => setBrand(event.target.value)} />
        <input className="rounded-xl border border-[#D4C4B7] px-3 py-2" placeholder="Name" value={name} onChange={(event) => setName(event.target.value)} />
        <input className="rounded-xl border border-[#D4C4B7] px-3 py-2" placeholder="Slug" value={slug} onChange={(event) => setSlug(event.target.value)} />
        <select className="rounded-xl border border-[#D4C4B7] px-3 py-2" value={category} onChange={(event) => setCategory(event.target.value)}>
          {SHOE_CATEGORIES.map((entry) => (
            <option key={entry} value={entry}>
              {entry}
            </option>
          ))}
        </select>
        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" checked={featured} onChange={(event) => setFeatured(event.target.checked)} />
          Featured
        </label>
      </div>

      <textarea
        className="min-h-28 w-full rounded-xl border border-[#D4C4B7] px-3 py-2"
        placeholder="Description"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
      />

      <div className="rounded-xl border border-[#D4C4B7] bg-white p-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-semibold">Variants & stock</h2>
          <span className="text-xs text-[#2C2B2B]/60">Total stock: {totalStock}</span>
        </div>

        <div className="space-y-3">
          {variants.map((variant, idx) => (
            <div key={idx} className="grid gap-2 rounded-lg border border-[#D4C4B7] p-3 md:grid-cols-6">
              <input className="rounded border px-2 py-1" value={variant.sku} onChange={(event) => setVariant(idx, { sku: event.target.value })} placeholder="SKU" />
              <input
                className="rounded border px-2 py-1"
                type="number"
                value={variant.size}
                onChange={(event) => setVariant(idx, { size: Number(event.target.value) })}
                placeholder="Size"
              />
              <input
                className="rounded border px-2 py-1"
                value={variant.color}
                onChange={(event) => setVariant(idx, { color: event.target.value })}
                placeholder="Color"
              />
              <input
                className="rounded border px-2 py-1"
                type="number"
                value={variant.stock}
                onChange={(event) => setVariant(idx, { stock: Number(event.target.value) })}
                placeholder="Stock"
              />
              <input
                className="rounded border px-2 py-1"
                type="number"
                value={variant.price}
                onChange={(event) => setVariant(idx, { price: Number(event.target.value) })}
                placeholder="Price (paise)"
              />
              <button className="rounded border border-red-200 px-2 py-1 text-red-600" onClick={() => removeVariant(idx)}>
                Remove
              </button>
            </div>
          ))}
        </div>

        <button className="mt-3 rounded-full border border-[#D4C4B7] px-4 py-1.5 text-sm" onClick={addVariant}>
          Add variant
        </button>
      </div>

      <button onClick={upsert} disabled={saving} className="rounded-full bg-[#2C2B2B] px-5 py-2 text-sm font-semibold text-white">
        {saving ? "Saving..." : "Save shoe"}
      </button>
    </div>
  );
}
