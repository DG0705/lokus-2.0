import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api-response";
import { connectToDatabase } from "@/lib/db";
import Address from "@/models/Address";
import { calculateShipping } from "@/lib/shipping-provider";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return apiError("Unauthorized", 401);

  try {
    const body = await request.json();
    const { addressId, cartTotal } = body;

    if (!addressId || typeof cartTotal !== 'number' || cartTotal < 0) {
      return apiError("Invalid request parameters", 422);
    }

    await connectToDatabase();

    // Fetch the address
    const address = await Address.findOne({ _id: addressId, userId });
    if (!address) {
      return apiError("Address not found", 404);
    }

    // Calculate shipping based on state and order value
    const shipping = calculateShipping(address.state, cartTotal);

    return apiSuccess({
      shipping,
      address: {
        fullName: address.fullName,
        state: address.state,
        city: address.city,
        postalCode: address.postalCode,
      },
      cartTotal,
      totalAmount: cartTotal + shipping.fee,
    });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to calculate shipping", 500);
  }
}
