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
