"use client";

import { useState } from "react";
import { Edit, Save, X, Package, AlertCircle, Plus, Trash2, Image as ImageIcon } from "lucide-react";
import ImageUploader from "@/components/admin/ImageUploader";
import { SHOE_CATEGORIES } from "@/lib/catalog-discovery";
import Image from "next/image";

interface Variant {
  _id?: string;
  sku: string;
  size: number;
  color: string;
  stock: number;
  price: number;
  image?: string;
}

interface Shoe {
  _id?: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  images: string[];
  variants: Variant[];
  soldOut?: boolean;
  featured?: boolean;
}

interface AdminShoesClientProps {
  initialShoes: Shoe[];
}

export default function AdminShoesClient({ initialShoes }: AdminShoesClientProps) {
  const [shoes, setShoes] = useState<Shoe[]>(initialShoes);
  const [editingShoes, setEditingShoes] = useState<Set<string>>(new Set());
  const [savingShoes, setSavingShoes] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingShoe, setEditingShoe] = useState<Shoe | null>(null);
  const [saving, setSaving] = useState(false);

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

  const openProductModal = (shoe?: Shoe) => {
    if (shoe) {
      setEditingShoe({ ...shoe });
    } else {
      setEditingShoe({
        name: "",
        brand: "",
        category: SHOE_CATEGORIES[0],
        description: "",
        images: [],
        variants: [
          {
            sku: "",
            size: 7,
            color: "",
            stock: 0,
            price: 0,
          }
        ],
        featured: false,
      });
    }
    setShowProductModal(true);
    setError(null);
  };

  const closeProductModal = () => {
    setShowProductModal(false);
    setEditingShoe(null);
    setError(null);
  };

  const updateShoeField = (field: keyof Shoe, value: any) => {
    if (!editingShoe) return;
    setEditingShoe({ ...editingShoe, [field]: value });
  };

  const addVariant = () => {
    if (!editingShoe) return;
    const newVariant: Variant = {
      sku: "",
      size: 7,
      color: "",
      stock: 0,
      price: 0,
    };
    setEditingShoe({
      ...editingShoe,
      variants: [...editingShoe.variants, newVariant],
    });
  };

  const updateVariant = (index: number, field: keyof Variant, value: any) => {
    if (!editingShoe) return;
    const updatedVariants = [...editingShoe.variants];
    updatedVariants[index] = { ...updatedVariants[index], [field]: value };
    setEditingShoe({ ...editingShoe, variants: updatedVariants });
  };

  const removeVariant = (index: number) => {
    if (!editingShoe || editingShoe.variants.length <= 1) return;
    const updatedVariants = editingShoe.variants.filter((_, i) => i !== index);
    setEditingShoe({ ...editingShoe, variants: updatedVariants });
  };

  const saveProduct = async () => {
    if (!editingShoe) return;

    // Basic validation
    if (!editingShoe.name.trim()) {
      setError("Product name is required");
      return;
    }
    if (!editingShoe.description.trim()) {
      setError("Description is required");
      return;
    }
    if (editingShoe.variants.length === 0) {
      setError("At least one variant is required");
      return;
    }

    // Validate variants
    for (const variant of editingShoe.variants) {
      if (!variant.sku.trim() || !variant.color.trim() || variant.price <= 0 || variant.stock < 0) {
        setError("Please fill all variant fields correctly");
        return;
      }
    }

    setSaving(true);
    setError(null);

    try {
      const url = editingShoe._id ? `/api/shoes/${editingShoe._id}` : "/api/shoes";
      const method = editingShoe._id ? "PATCH" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editingShoe),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save product");
      }

      if (editingShoe._id) {
        // Update existing shoe
        setShoes(prevShoes =>
          prevShoes.map(s => s._id === editingShoe._id ? { ...s, ...data.data } : s)
        );
      } else {
        // Add new shoe
        setShoes(prevShoes => [...prevShoes, data.data]);
      }

      closeProductModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Manage shoes</h1>
        <button
          onClick={() => openProductModal()}
          className="flex items-center gap-2 rounded-full bg-[#2C2B2B] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2C2B2B]/90"
        >
          <Plus className="h-4 w-4" />
          New shoe
        </button>
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
          if (!shoe._id) return null;
          const shoeId = shoe._id;
          const isEditing = editingShoes.has(shoeId);
          const isSaving = savingShoes.has(shoeId);
          const primaryImage = shoe.images?.[0];

          return (
            <div key={shoeId} className="rounded-2xl border border-[#D4C4B7] bg-white overflow-hidden">
              {/* Shoe Header */}
              <div className="p-4 border-b border-[#D4C4B7]">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {/* Primary Image */}
                    <div className="flex-shrink-0">
                      {primaryImage ? (
                        <Image
                          src={primaryImage}
                          alt={shoe.name}
                          width={64}
                          height={64}
                          className="h-16 w-16 object-cover rounded-lg border border-gray-200"
                        />
                      ) : (
                        <div className="h-16 w-16 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                          <ImageIcon className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">{shoe.name}</h3>
                      <p className="text-sm text-[#2C2B2B]/60">
                        {shoe.category} · {shoe.variants.length} variants · 
                        <span className={`ml-1 ${shoe.soldOut ? 'text-red-600 font-medium' : 'text-green-600'}`}>
                          {shoe.soldOut ? 'Sold out' : 'In stock'}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => saveShoeVariants(shoeId)}
                          disabled={isSaving}
                          className="flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Save className="h-4 w-4" />
                          {isSaving ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={() => toggleEditMode(shoeId)}
                          className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          <X className="h-4 w-4" />
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleEditMode(shoeId)}
                          className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
                        >
                          <Package className="h-4 w-4" />
                          Quick Edit
                        </button>
                        <button
                          onClick={() => openProductModal(shoe)}
                          className="flex items-center gap-1 rounded-lg border border-[#B58B6B] px-3 py-1.5 text-sm font-medium text-[#B58B6B] hover:bg-[#B58B6B]/10"
                        >
                          <Edit className="h-4 w-4" />
                          Full Edit
                        </button>
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
                                    if (variant._id) {
                                      updateVariantStock(shoeId, variant._id, newStock);
                                    }
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

        {/* Product Form Modal */}
        {showProductModal && editingShoe && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto m-4">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold text-gray-900">
                    {editingShoe._id ? "Edit Product" : "Create New Product"}
                  </h2>
                  <button
                    onClick={closeProductModal}
                    className="rounded-lg p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      value={editingShoe.name}
                      onChange={(e) => updateShoeField("name", e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Enter product name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Brand
                    </label>
                    <input
                      type="text"
                      value={editingShoe.brand}
                      onChange={(e) => updateShoeField("brand", e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Enter brand name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={editingShoe.category}
                    onChange={(e) => updateShoeField("category", e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {SHOE_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={editingShoe.description}
                    onChange={(e) => updateShoeField("description", e.target.value)}
                    rows={4}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Enter product description"
                  />
                </div>

                {/* Images */}
                <ImageUploader
                  images={editingShoe.images}
                  onImagesChange={(images) => updateShoeField("images", images)}
                />

                {/* Variants */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Product Variants</h3>
                    <button
                      onClick={addVariant}
                      className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4" />
                      Add Variant
                    </button>
                  </div>

                  <div className="space-y-4">
                    {editingShoe.variants.map((variant, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                            <input
                              type="text"
                              value={variant.sku}
                              onChange={(e) => updateVariant(index, "sku", e.target.value)}
                              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                              placeholder="SKU"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                            <input
                              type="number"
                              min="1"
                              max="15"
                              value={variant.size}
                              onChange={(e) => updateVariant(index, "size", parseInt(e.target.value))}
                              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                              placeholder="Size"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                            <input
                              type="text"
                              value={variant.color}
                              onChange={(e) => updateVariant(index, "color", e.target.value)}
                              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                              placeholder="Color"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                            <input
                              type="number"
                              min="0"
                              value={variant.price}
                              onChange={(e) => updateVariant(index, "price", parseInt(e.target.value))}
                              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                              placeholder="Price"
                            />
                          </div>
                          <div className="flex items-end gap-2">
                            <div className="flex-1">
                              <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                              <input
                                type="number"
                                min="0"
                                value={variant.stock}
                                onChange={(e) => updateVariant(index, "stock", parseInt(e.target.value))}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="Stock"
                              />
                            </div>
                            {editingShoe.variants.length > 1 && (
                              <button
                                onClick={() => removeVariant(index)}
                                className="mt-6 p-2 text-red-600 hover:bg-red-50 rounded-lg"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Featured Toggle */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={editingShoe.featured || false}
                    onChange={(e) => updateShoeField("featured", e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="featured" className="ml-2 text-sm text-gray-700">
                    Featured product
                  </label>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
                <div className="flex items-center justify-end gap-4">
                  <button
                    onClick={closeProductModal}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveProduct}
                    disabled={saving}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? "Saving..." : editingShoe._id ? "Update Product" : "Create Product"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
