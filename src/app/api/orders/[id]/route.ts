import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/api-response";
import { connectToDatabase } from "@/lib/db";
import Order from "@/models/Order";
import { sendShippingNotificationEmail } from "@/lib/mailer";
import mongoose from "mongoose";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  const isAdmin = (session?.user as any)?.role === "admin";
  
  if (!userId) return apiError("Unauthorized", 401);

  await connectToDatabase();
  
  // Admin can see all orders, users can only see their own
  const query = isAdmin ? { _id: params.id } : { _id: params.id, userId };
  const order = await Order.findOne(query)
    .populate('userId', 'name email')
    .populate('addressId')
    .lean();
    
  if (!order) return apiError("Order not found", 404);
  return apiSuccess(order);
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "admin") {
    return apiError("Unauthorized", 401);
  }

  try {
    const body = await request.json();
    const { status, trackingNumber, courierPartner } = body;

    await connectToDatabase();

    const order = await Order.findById(params.id);
    if (!order) {
      return apiError("Order not found", 404);
    }

    // Store the previous status to check for changes
    const previousStatus = order.status;

    // Validate status transitions
    const validStatuses = ["pending", "paid", "failed", "shipped", "delivered"];
    if (status && !validStatuses.includes(status)) {
      return apiError("Invalid status", 422);
    }

    // Update allowed fields
    if (status) order.status = status;
    if (trackingNumber !== undefined) order.trackingNumber = trackingNumber;
    if (courierPartner !== undefined) order.courierPartner = courierPartner;

    await order.save();

    // Check if status changed to "shipped" and send notification
    if (previousStatus !== "shipped" && order.status === "shipped" && order.trackingNumber && order.courierPartner) {
      try {
        // Fetch user details for email
        const User = mongoose.models.User;
        const user = await User.findById(order.userId).select('name email');
        
        if (user && user.email) {
          // Send shipping notification email (non-blocking)
          sendShippingNotificationEmail(
            user.email,
            user.name || 'Customer',
            order._id.toString(),
            order.trackingNumber,
            order.courierPartner
          ).catch(emailError => {
            console.error('Failed to send shipping notification email:', emailError);
          });
        }
      } catch (emailError) {
        console.error('Error preparing shipping notification email:', emailError);
        // Don't fail the order update if email fails
      }
    }

    return apiSuccess(order, "Order updated successfully");
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to update order", 500);
  }
}
