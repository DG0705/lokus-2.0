"use client";

import { useEffect, useState } from "react";

type Address = {
  _id: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
};

const empty = {
  fullName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
  isDefault: false,
};

export function AddressesClient() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/addresses", { cache: "no-store" });
    const data = await res.json();
    if (res.ok) setAddresses(data.data);
    else setMsg(data.message || "Failed to load addresses");
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const createAddress = async () => {
    setSaving(true);
    setMsg("");
    const res = await fetch("/api/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);

    if (!res.ok) return setMsg(data.message || "Create failed");
    setForm(empty);
    setMsg("Address added");
    await load();
  };

  const deleteAddress = async (id: string) => {
    const res = await fetch(`/api/addresses/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) return setMsg(data.message || "Delete failed");
    setMsg("Address deleted");
    await load();
  };

  return (
    <div className="space-y-6">
      {msg ? <div className="rounded-xl border border-[#D4C4B7] bg-white px-4 py-2 text-sm">{msg}</div> : null}

      <div className="grid gap-3 md:grid-cols-2">
        <input className="rounded-xl border border-[#D4C4B7] px-3 py-2" placeholder="Full name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
        <input className="rounded-xl border border-[#D4C4B7] px-3 py-2" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <input className="rounded-xl border border-[#D4C4B7] px-3 py-2 md:col-span-2" placeholder="Address line 1" value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} />
        <input className="rounded-xl border border-[#D4C4B7] px-3 py-2 md:col-span-2" placeholder="Address line 2" value={form.line2} onChange={(e) => setForm({ ...form, line2: e.target.value })} />
        <input className="rounded-xl border border-[#D4C4B7] px-3 py-2" placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
        <input className="rounded-xl border border-[#D4C4B7] px-3 py-2" placeholder="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
        <input className="rounded-xl border border-[#D4C4B7] px-3 py-2" placeholder="Postal code" value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} />
        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} />
          Set as default
        </label>
      </div>
      <button onClick={createAddress} disabled={saving} className="rounded-full bg-[#B58B6B] px-5 py-2 text-sm font-semibold text-white">
        {saving ? "Saving..." : "Add Address"}
      </button>

      <div className="space-y-3">
        {loading ? <p className="text-sm">Loading...</p> : null}
        {addresses.map((a) => (
          <div key={a._id} className="rounded-2xl border border-[#D4C4B7] bg-white p-4">
            <p className="font-medium">{a.fullName} {a.isDefault ? <span className="text-xs text-[#B58B6B]">(Default)</span> : null}</p>
            <p className="text-sm text-[#2C2B2B]/70">{a.line1}, {a.city}, {a.state} {a.postalCode}</p>
            <button className="mt-2 text-xs text-red-600" onClick={() => deleteAddress(a._id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
