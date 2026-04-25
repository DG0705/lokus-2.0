import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Shoe from "@/models/Shoe";
import AdminShoesClient from "./AdminShoesClient";

export default async function AdminShoesPage() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "admin") redirect("/");

  try {
    await connectToDatabase();
    const shoes = await Shoe.find().sort({ createdAt: -1 }).lean();

    // Transform the data to match the client component interface
    const transformedShoes = shoes.map((shoe: any) => ({
      _id: shoe._id.toString(),
      name: shoe.name,
      brand: shoe.brand || "",
      category: shoe.category,
      description: shoe.description || "",
      images: shoe.images || [],
      soldOut: shoe.soldOut,
      featured: shoe.featured || false,
      variants: shoe.variants?.map((variant: any) => ({
        _id: variant._id?.toString() || `${shoe._id.toString()}-${variant.sku}`,
        sku: variant.sku,
        size: variant.size,
        color: variant.color,
        stock: variant.stock,
        price: variant.price,
        image: variant.image,
      })) || [],
    }));

    return <AdminShoesClient initialShoes={transformedShoes} />;
  } catch (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
        {error instanceof Error ? error.message : "Failed to load admin shoes"}
      </div>
    );
  }
}
