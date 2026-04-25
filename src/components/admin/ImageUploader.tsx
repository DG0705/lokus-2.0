"use client";

import { useState, useRef } from "react";
import { ImagePlus, XCircle, Upload } from "lucide-react";
import Image from "next/image";

interface ImageSlot {
  id: string;
  label: string;
  url: string | null;
}

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

const defaultSlots: ImageSlot[] = [
  { id: "main", label: "Main/Front", url: null },
  { id: "side", label: "Side", url: null },
  { id: "back", label: "Back", url: null },
  { id: "top", label: "Top", url: null },
  { id: "sole", label: "Sole", url: null },
  { id: "extra", label: "Extra", url: null },
];

export default function ImageUploader({ images, onChange, maxImages = 6 }: ImageUploaderProps) {
  const [uploading, setUploading] = useState<string | null>(null);
  const [draggedSlot, setDraggedSlot] = useState<string | null>(null);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  // Initialize slots with existing images
  const [slots, setSlots] = useState<ImageSlot[]>(() => {
    const initializedSlots = defaultSlots.map((slot, index) => ({
      ...slot,
      url: images[index] || null,
    }));
    return initializedSlots;
  });

  const handleFileSelect = async (slotId: string, file: File) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      alert("Invalid file type. Only JPEG, PNG, and WebP images are allowed.");
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert("File size too large. Maximum size is 5MB.");
      return;
    }

    setUploading(slotId);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        const updatedSlots = slots.map(slot =>
          slot.id === slotId ? { ...slot, url: result.data.url } : slot
        );
        setSlots(updatedSlots);
        
        // Update parent component with new images array
        const newImages = updatedSlots
          .filter(slot => slot.url)
          .map(slot => slot.url!);
        onChange(newImages);
      } else {
        alert(result.message || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(null);
    }
  };

  const handleDrop = (e: React.DragEvent, slotId: string) => {
    e.preventDefault();
    setDraggedSlot(null);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(slotId, files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent, slotId: string) => {
    e.preventDefault();
    setDraggedSlot(slotId);
  };

  const handleDragLeave = () => {
    setDraggedSlot(null);
  };

  const removeImage = (slotId: string) => {
    const updatedSlots = slots.map(slot =>
      slot.id === slotId ? { ...slot, url: null } : slot
    );
    setSlots(updatedSlots);
    
    // Update parent component
    const newImages = updatedSlots
      .filter(slot => slot.url)
      .map(slot => slot.url!);
    onChange(newImages);
  };

  const triggerFileInput = (slotId: string) => {
    fileInputRefs.current[slotId]?.click();
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Product Images</h3>
      <p className="text-sm text-gray-600">
        Upload images for different views of the product. Maximum {maxImages} images.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {slots.slice(0, maxImages).map((slot) => (
          <div
            key={slot.id}
            className={`relative group border-2 border-dashed rounded-lg overflow-hidden transition-all duration-200 ${
              draggedSlot === slot.id
                ? "border-blue-500 bg-blue-50"
                : slot.url
                ? "border-gray-300 bg-white"
                : "border-gray-300 bg-gray-50 hover:border-gray-400"
            }`}
            onDrop={(e) => handleDrop(e, slot.id)}
            onDragOver={(e) => handleDragOver(e, slot.id)}
            onDragLeave={handleDragLeave}
          >
            {/* Hidden file input */}
            <input
              ref={(el) => {
          fileInputRefs.current[slot.id] = el;
        }}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(slot.id, file);
              }}
            />

            {/* Image preview or upload prompt */}
            {slot.url ? (
              <div className="aspect-square relative">
                <Image
                  src={slot.url}
                  alt={slot.label}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-200 flex items-center justify-center">
                  <button
                    onClick={() => removeImage(slot.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2">
                  <p className="text-xs text-center">{slot.label}</p>
                </div>
              </div>
            ) : (
              <div
                className="aspect-square flex flex-col items-center justify-center cursor-pointer p-4"
                onClick={() => triggerFileInput(slot.id)}
              >
                {uploading === slot.id ? (
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="text-xs text-gray-600 mt-2">Uploading...</p>
                  </div>
                ) : (
                  <>
                    <ImagePlus className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-xs text-gray-600 text-center">{slot.label}</p>
                    <p className="text-xs text-gray-400 mt-1">Click or drag</p>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Upload instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <Upload className="w-4 h-4 text-blue-600 mt-0.5" />
          <div className="text-xs text-blue-800">
            <p className="font-medium mb-1">Upload Instructions:</p>
            <ul className="space-y-1">
              <li>• Supported formats: JPEG, PNG, WebP</li>
              <li>• Maximum file size: 5MB</li>
              <li>• Images will be automatically optimized</li>
              <li>• Main/Front view is required for product listing</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
