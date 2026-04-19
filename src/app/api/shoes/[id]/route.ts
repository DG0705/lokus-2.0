import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api-response";
import { connectToDatabase } from "@/lib/db";
import Shoe from "@/models/Shoe";
import { shoeSchema } from "@/schemas/shoe.schema";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  await connectToDatabase();
  const shoe = await Shoe.findById(params.id).lean();
  if (!shoe) return apiError("Shoe not found", 404);
  return apiSuccess(shoe);
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "admin") return apiError("Unauthorized", 401);

  const body = await request.json();
  
  // Handle variant-specific updates for inline inventory management
  if (body.variants && Array.isArray(body.variants)) {
    // Validate variants structure
    for (const variant of body.variants) {
      if (!variant.sku || typeof variant.size !== 'number' || !variant.color || typeof variant.stock !== 'number' || typeof variant.price !== 'number') {
        return apiError("Invalid variant structure", 422);
      }
      if (variant.stock < 0) {
        return apiError("Stock cannot be negative", 422);
      }
      if (variant.price < 0) {
        return apiError("Price cannot be negative", 422);
      }
    }

    await connectToDatabase();
    const shoe = await Shoe.findById(params.id);
    if (!shoe) return apiError("Shoe not found", 404);

    // Update variants
    shoe.variants = body.variants;
    await shoe.save(); // This will trigger the pre-save middleware to update soldOut status
    return apiSuccess(shoe, "Variants updated successfully");
  }

  // Handle general shoe updates using schema validation
  const parsed = shoeSchema.partial().safeParse(body);
  if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Invalid payload", 422);

  await connectToDatabase();
  const shoe = await Shoe.findByIdAndUpdate(params.id, parsed.data, {
    new: true,
    runValidators: true,
  });
  if (!shoe) return apiError("Shoe not found", 404);
  await shoe.save();
  return apiSuccess(shoe, "Shoe updated");
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "admin") return apiError("Unauthorized", 401);

  await connectToDatabase();
  const deleted = await Shoe.findByIdAndDelete(params.id);
  if (!deleted) return apiError("Shoe not found", 404);
  return apiSuccess({ deleted: true }, "Shoe deleted");
}
