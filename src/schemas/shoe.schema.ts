import { z } from "zod";
import { SHOE_CATEGORIES } from "@/lib/catalog-discovery";

export const variantSchema = z.object({
  sku: z.string().min(3),
  size: z.number().min(1),
  color: z.string().min(2),
  stock: z.number().int().min(0),
  price: z.number().int().min(0),
  image: z.string().url().optional().or(z.literal("")),
});

export const shoeSchema = z.object({
  brand: z.string().trim().max(80).optional().default(""),
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().min(10),
  category: z.enum(SHOE_CATEGORIES),
  images: z.array(z.string().url()).default([]),
  variants: z.array(variantSchema).min(1),
  featured: z.boolean().optional().default(false),
});
