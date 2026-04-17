import { connectToDatabase } from "@/lib/db";
import Shoe from "@/models/Shoe";
import { ShoeEditorClient } from "@/components/checkout/ShoeEditorClient";

export default async function AdminShoeDetailPage({ params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const shoe = params.id === "new" ? null : await Shoe.findById(params.id).lean();

    return (
      <div>
        <h1 className="text-3xl font-semibold">{params.id === "new" ? "Create shoe" : "Edit shoe"}</h1>
        <div className="mt-6">
          <ShoeEditorClient shoe={shoe || undefined} />
        </div>
      </div>
    );
  } catch (error) {
    return <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error instanceof Error ? error.message : "Failed to load shoe editor"}</div>;
  }
}
