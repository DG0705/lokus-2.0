"use client";

import { useState } from "react";
import Link from "next/link";
import { Edit, Save, X, Package, AlertCircle } from "lucide-react";

interface Variant {
  _id: string;
  sku: string;
  size: number;
  color: string;
  stock: number;
  price: number;
  image?: string;
}

interface Shoe {
  _id: string;
  name: string;
  category: string;
  soldOut: boolean;
  variants: Variant[];
}

interface AdminShoesClientProps {
  initialShoes: Shoe[];
}

export default function AdminShoesClient({ initialShoes }: AdminShoesClientProps) {
  const [shoes, setShoes] = useState<Shoe[]>(initialShoes);
  const [editingShoes, setEditingShoes] = useState<Set<string>>(new Set());
  const [savingShoes, setSavingShoes] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const toggleEditMode = (shoeId: string) => {
    const newEditingShoes = new Set(editingShoes);
    if (newEditingShoes.has(shoeId)) {
      newEditingShoes.delete(shoeId);
    } else {
      newEditingShoes.add(shoeId);
    }
    setEditingShoes(newEditingShoes);
    setError(null);
  };

  const updateVariantStock = (shoeId: string, variantId: string, newStock: number) => {
    setShoes(prevShoes => 
      prevShoes.map(shoe => {
        if (shoe._id === shoeId) {
          const updatedVariants = shoe.variants.map(variant =>
            variant._id === variantId ? { ...variant, stock: newStock } : variant
          );
          
          // Update soldOut status based on all variants stock
          const allOutOfStock = updatedVariants.every(v => v.stock <= 0);
          
          return {
            ...shoe,
            variants: updatedVariants,
            soldOut: allOutOfStock
          };
        }
        return shoe;
      })
    );
  };

  const saveShoeVariants = async (shoeId: string) => {
    const shoe = shoes.find(s => s._id === shoeId);
    if (!shoe) return;

    setSavingShoes(prev => new Set(prev).add(shoeId));
    setError(null);

    try {
      const response = await fetch(`/api/shoes/${shoeId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          variants: shoe.variants
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update shoe');
      }

      // Update shoe with the latest data from server
      setShoes(prevShoes =>
        prevShoes.map(s =>
          s._id === shoeId ? { ...s, ...data.data } : s
        )
      );

      // Exit edit mode
      toggleEditMode(shoeId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes');
    } finally {
      setSavingShoes(prev => {
        const newSet = new Set(prev);
        newSet.delete(shoeId);
        return newSet;
      });
    }
  };

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Manage shoes</h1>
        <Link href="/admin/shoes/new" className="rounded-full bg-[#2C2B2B] px-4 py-2 text-sm font-semibold text-white">
          New shoe
        </Link>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        </div>
      )}

      <div className="space-y-6">
        {shoes.map((shoe) => {
          const isEditing = editingShoes.has(shoe._id);
          const isSaving = savingShoes.has(shoe._id);

          return (
            <div key={shoe._id} className="rounded-2xl border border-[#D4C4B7] bg-white overflow-hidden">
              {/* Shoe Header */}
              <div className="p-4 border-b border-[#D4C4B7]">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="font-medium text-lg">{shoe.name}</h3>
                    <p className="text-sm text-[#2C2B2B]/60">
                      {shoe.category} · {shoe.variants.length} variants · 
                      <span className={`ml-1 ${shoe.soldOut ? 'text-red-600 font-medium' : 'text-green-600'}`}>
                        {shoe.soldOut ? 'Sold out' : 'In stock'}
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => saveShoeVariants(shoe._id)}
                          disabled={isSaving}
                          className="flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Save className="h-4 w-4" />
                          {isSaving ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={() => toggleEditMode(shoe._id)}
                          className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          <X className="h-4 w-4" />
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleEditMode(shoe._id)}
                          className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
                        >
                          <Package className="h-4 w-4" />
                          Quick Edit
                        </button>
                        <Link
                          className="flex items-center gap-1 rounded-lg border border-[#B58B6B] px-3 py-1.5 text-sm font-medium text-[#B58B6B] hover:bg-[#B58B6B]/10"
                          href={`/admin/shoes/${shoe._id}`}
                        >
                          <Edit className="h-4 w-4" />
                          Full Edit
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Variants Table */}
              <div className="p-4">
                {shoe.variants.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No variants available</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 px-3 font-medium text-gray-700">SKU</th>
                          <th className="text-left py-2 px-3 font-medium text-gray-700">Size</th>
                          <th className="text-left py-2 px-3 font-medium text-gray-700">Color</th>
                          <th className="text-left py-2 px-3 font-medium text-gray-700">Price</th>
                          <th className="text-left py-2 px-3 font-medium text-gray-700">Stock</th>
                        </tr>
                      </thead>
                      <tbody>
                        {shoe.variants.map((variant) => (
                          <tr key={variant._id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-2 px-3 font-mono text-xs">{variant.sku}</td>
                            <td className="py-2 px-3">{variant.size}</td>
                            <td className="py-2 px-3">
                              <div className="flex items-center gap-2">
                                <div
                                  className="h-4 w-4 rounded-full border border-gray-300"
                                  style={{ backgroundColor: variant.color.toLowerCase() }}
                                  title={variant.color}
                                />
                                <span className="capitalize">{variant.color}</span>
                              </div>
                            </td>
                            <td className="py-2 px-3">₹{variant.price.toLocaleString()}</td>
                            <td className="py-2 px-3">
                              {isEditing ? (
                                <input
                                  type="number"
                                  min="0"
                                  value={variant.stock}
                                  onChange={(e) => {
                                    const newStock = Math.max(0, parseInt(e.target.value) || 0);
                                    updateVariantStock(shoe._id, variant._id, newStock);
                                  }}
                                  className="w-20 rounded-lg border border-gray-300 px-2 py-1 text-center focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                              ) : (
                                <span className={`font-medium ${
                                  variant.stock === 0 ? 'text-red-600' : 
                                  variant.stock < 5 ? 'text-orange-600' : 'text-green-600'
                                }`}>
                                  {variant.stock}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {shoes.length === 0 && (
          <div className="text-center py-8">
            <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-sm text-[#2C2B2B]/70">No shoes yet. Create one to start.</p>
          </div>
        )}
      </div>
    </div>
  );
}
