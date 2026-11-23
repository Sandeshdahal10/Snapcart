import connectDb from "@/lib/db";
import { requireRole } from "@/lib/requireRole";
import Grocery from "@/models/grocery.model";
import { NextResponse } from "next/server";

/** Admin: list all groceries, newest first. */
export async function GET() {
  try {
    const { error } = await requireRole("admin");
    if (error) return error;
    await connectDb();
    const groceries = await Grocery.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ groceries }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch groceries" },
      { status: 500 },
    );
  }
}
