import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api-response";
import { connectToDatabase } from "@/lib/db";
import Address from "@/models/Address";
import { addressSchema } from "@/schemas/address.schema";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return apiError("Unauthorized", 401);

  await connectToDatabase();
  const addresses = await Address.find({ userId }).sort({ isDefault: -1 }).lean();
  return apiSuccess(addresses);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return apiError("Unauthorized", 401);

  const body = await request.json();
  const parsed = addressSchema.safeParse(body);
  if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Invalid payload", 422);

  await connectToDatabase();
  const address = await Address.create({ ...parsed.data, userId });
  return apiSuccess(address, "Address saved", { status: 201 });
}
