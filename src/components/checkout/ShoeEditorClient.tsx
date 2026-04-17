"use client";

import { useMemo, useState } from "react";

type Variant = { sku: string; size: number; color: string; stock: number; price: number; image?: string };

export function ShoeEditorClient({ shoe }: { shoe?: any }) {
  const [name, setName] = useState(shoe?.name ?? "");
  const [slug, setSlug] = useState(shoe?.slug ?? "");
  const [description, setDescription] = useState(shoe?.description ?? "");
  const [category, setCategory] = useState(shoe?.category ?? "sneakers");
  const [featured, setFeatured] = useState(Boolean(shoe?.featured));
  const [images] = useState<string[]>(shoe?.images ?? []);
  const [variants, setVariants] = useState<Variant[]>(
    shoe?.variants?.map((v: any) => ({ sku: v.sku, size: v.size, color: v.color, stock: v.stock, price: v.price, image: v.image || "" })) ?? [
      { sku: "SKU-001", size: 42, color: "Black", stock: 5, price: 9999, image: "" },
    ],
  );
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  const totalStock = useMemo(() => variants.reduce((sum, v) => sum + Number(v.stock || 0), 0), [variants]);

  const upsert = async () => {
    setSaving(true);
    setMsg("");
    const payload = { name, slug, description, category, featured, images, variants };
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
    setVariants((prev) => prev.map((v, i) => (i === idx ? { ...v, ...patch } : v)));
  };

  const addVariant = () => setVariants((prev) => [...prev, { sku: `SKU-${prev.length + 1}`, size: 42, color: "Black", stock: 0, price: 9999, image: "" }]);
  const removeVariant = (idx: number) => setVariants((prev) => prev.filter((_, i) => i !== idx));

  return (
    <div className="space-y-5">
      {msg ? <div className="rounded-xl border border-[#D4C4B7] bg-white px-4 py-2 text-sm">{msg}</div> : null}
      <div className="grid gap-3 md:grid-cols-2">
        <input className="rounded-xl border border-[#D4C4B7] px-3 py-2" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="rounded-xl border border-[#D4C4B7] px-3 py-2" placeholder="Slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
        <select className="rounded-xl border border-[#D4C4B7] px-3 py-2" value={category} onChange={(e) => setCategory(e.target.value)}>
          {["sneakers", "boots", "heels", "sandals", "loafers", "sports"].map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />Featured</label>
      </div>
      <textarea className="min-h-28 w-full rounded-xl border border-[#D4C4B7] px-3 py-2" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />

      <div className="rounded-xl border border-[#D4C4B7] bg-white p-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-semibold">Variants & stock</h2>
          <span className="text-xs text-[#2C2B2B]/60">Total stock: {totalStock}</span>
        </div>
        <div className="space-y-3">
          {variants.map((v, idx) => (
            <div key={idx} className="grid gap-2 rounded-lg border border-[#D4C4B7] p-3 md:grid-cols-6">
              <input className="rounded border px-2 py-1" value={v.sku} onChange={(e) => setVariant(idx, { sku: e.target.value })} placeholder="SKU" />
              <input className="rounded border px-2 py-1" type="number" value={v.size} onChange={(e) => setVariant(idx, { size: Number(e.target.value) })} placeholder="Size" />
              <input className="rounded border px-2 py-1" value={v.color} onChange={(e) => setVariant(idx, { color: e.target.value })} placeholder="Color" />
              <input className="rounded border px-2 py-1" type="number" value={v.stock} onChange={(e) => setVariant(idx, { stock: Number(e.target.value) })} placeholder="Stock" />
              <input className="rounded border px-2 py-1" type="number" value={v.price} onChange={(e) => setVariant(idx, { price: Number(e.target.value) })} placeholder="Price(paise)" />
              <button className="rounded border border-red-200 px-2 py-1 text-red-600" onClick={() => removeVariant(idx)}>Remove</button>
            </div>
          ))}
        </div>
        <button className="mt-3 rounded-full border border-[#D4C4B7] px-4 py-1.5 text-sm" onClick={addVariant}>Add variant</button>
      </div>

      <button onClick={upsert} disabled={saving} className="rounded-full bg-[#2C2B2B] px-5 py-2 text-sm font-semibold text-white">
        {saving ? "Saving..." : "Save shoe"}
      </button>
    </div>
  );
}
