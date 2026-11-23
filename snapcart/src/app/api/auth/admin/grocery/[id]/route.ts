import uploadOnCloudinary from "@/lib/cloudinary";
import connectDb from "@/lib/db";
import { requireRole } from "@/lib/requireRole";
import Grocery from "@/models/grocery.model";
import { NextRequest, NextResponse } from "next/server";

/**
 * Admin: update a grocery.
 * Body (multipart/form-data): name, category, price, unit, and optionally a new image.
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { error } = await requireRole("admin");
    if (error) return error;
    await connectDb();
    const { id } = await params;
    const formData = await req.formData();

    const update: Record<string, string> = {};
    for (const field of ["name", "category", "price", "unit"]) {
      const value = formData.get(field);
      if (typeof value === "string" && value.trim() !== "") {
        update[field] = value.trim();
      }
    }
    const file = formData.get("image");
    if (file && typeof file !== "string" && file.size > 0) {
      const imageUrl = await uploadOnCloudinary(file);
      if (imageUrl) update.image = imageUrl;
    }

    const grocery = await Grocery.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });
    if (!grocery) {
      return NextResponse.json({ message: "Grocery not found" }, { status: 404 });
    }
    return NextResponse.json({ grocery }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: `Failed to update grocery ${error}` },
      { status: 500 },
    );
  }
}

/** Admin: delete a grocery. */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { error } = await requireRole("admin");
    if (error) return error;
    await connectDb();
    const { id } = await params;
    const grocery = await Grocery.findByIdAndDelete(id);
    if (!grocery) {
      return NextResponse.json({ message: "Grocery not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Grocery deleted" }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to delete grocery" },
      { status: 500 },
    );
  }
}
