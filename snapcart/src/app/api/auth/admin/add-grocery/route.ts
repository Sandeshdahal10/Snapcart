import { requireRole } from "@/lib/requireRole";
import uploadOnCloudinary from "@/lib/cloudinary";
import connectDb from "@/lib/db";
import Grocery from "@/models/grocery.model";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {

  try {
    await connectDb();
    const { error } = await requireRole("admin");
    if (error) return error;
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const category = formData.get("category") as string;
    const price = formData.get("price") as string;
    const unit = formData.get("unit") as string;
    const file = formData.get("image");
    if (!name?.trim() || !category || !price || !unit) {
      return NextResponse.json(
        { message: "Name, category, price and unit are required" },
        { status: 400 }
      );
    }
    if (isNaN(Number(price)) || Number(price) <= 0) {
      return NextResponse.json(
        { message: "Price must be a positive number" },
        { status: 400 }
      );
    }
    if (!file || typeof file === "string" || file.size === 0) {
      return NextResponse.json(
        { message: "Product image is required" },
        { status: 400 }
      );
    }
    let imageUrl: string | null = null;
    try {
      imageUrl = await uploadOnCloudinary(file);
    } catch (uploadError) {
      console.log("Cloudinary upload error:", uploadError);
    }
    if (!imageUrl) {
      return NextResponse.json(
        { message: "Image upload failed. Check your Cloudinary settings." },
        { status: 502 }
      );
    }
    const grocery = await Grocery.create({
      name,
      category,
      price,
      unit,
      image: imageUrl,
    });
    return NextResponse.json(
      {
        grocery,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return NextResponse.json(
      {
        message: "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}
