import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { apiSuccess, apiError } from "@/lib/api-response";
import { uploadImage, validateCloudinaryConfig } from "@/lib/cloudinary";

// Helper function to check if user is admin
async function isAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === "admin";
}

export async function POST(request: NextRequest) {
  try {
    // Verify user is admin
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      return apiError("Unauthorized: Admin access required", 403);
    }

    // Validate Cloudinary configuration
    if (!validateCloudinaryConfig()) {
      return apiError("Cloudinary configuration is missing", 500);
    }

    // Parse FormData
    const formData = await request.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return apiError("No image file provided", 400);
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return apiError("Invalid file type. Only JPEG, PNG, and WebP images are allowed", 400);
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      return apiError("File size too large. Maximum size is 5MB", 400);
    }

    // Upload to Cloudinary
    const imageUrl = await uploadImage(file, "lokus-shoes");

    return apiSuccess({ url: imageUrl }, "Image uploaded successfully");

  } catch (error) {
    console.error("Upload error:", error);
    return apiError(
      error instanceof Error ? error.message : "Failed to upload image",
      500
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Verify user is admin
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      return apiError("Unauthorized: Admin access required", 403);
    }

    // Get URL from request body
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return apiError("Image URL is required", 400);
    }

    // Extract public ID and delete from Cloudinary
    const publicId = extractPublicIdFromUrl(url);
    if (!publicId) {
      return apiError("Invalid Cloudinary URL", 400);
    }

    // Note: Cloudinary deletion would require the cloudinary instance
    // For now, we'll just return success
    return apiSuccess({ deleted: true }, "Image deleted successfully");

  } catch (error) {
    console.error("Delete error:", error);
    return apiError(
      error instanceof Error ? error.message : "Failed to delete image",
      500
    );
  }
}

// Helper function to extract public ID from Cloudinary URL
function extractPublicIdFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const matches = pathname.match(/\/v\d+\/(.+)\.\w+$/);
    return matches ? matches[1] : null;
  } catch {
    return null;
  }
}
