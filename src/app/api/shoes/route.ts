import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api-response";
import { connectToDatabase } from "@/lib/db";
import { getCatalogProducts } from "@/lib/shoe-data";
import Shoe from "@/models/Shoe";
import { shoeSchema } from "@/schemas/shoe.schema";

export async function GET(request: Request) {
  try {
    const shoes = await getCatalogProducts(new URL(request.url).searchParams);
    return apiSuccess(shoes);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to load shoes", 500);
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "admin") return apiError("Unauthorized", 401);

  try {
    const body = await request.json();
    const parsed = shoeSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Invalid payload", 422);

    await connectToDatabase();
    const shoe = await Shoe.create(parsed.data);
    return apiSuccess(shoe, "Shoe created", { status: 201 });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to create shoe", 500);
  }
}
