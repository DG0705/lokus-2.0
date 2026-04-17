import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api-response";
import { connectToDatabase } from "@/lib/db";
import Address from "@/models/Address";

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return apiError("Unauthorized", 401);

  await connectToDatabase();
  const deleted = await Address.findOneAndDelete({ _id: params.id, userId });
  if (!deleted) return apiError("Address not found", 404);
  return apiSuccess({ deleted: true }, "Address deleted");
}
