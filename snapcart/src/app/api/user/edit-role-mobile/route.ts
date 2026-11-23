import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const { role, mobile } = await req.json();
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }
    if (!["user", "deliveryBoy", "admin"].includes(role)) {
      return NextResponse.json({ message: "Invalid role" }, { status: 400 });
    }
    if (!/^\d{10}$/.test(String(mobile ?? ""))) {
      return NextResponse.json({ message: "Mobile must be 10 digits" }, { status: 400 });
    }
    // Only one admin: once an admin exists, nobody else can pick that role
    if (role === "admin") {
      const existingAdmin = await User.findOne({ role: "admin" });
      if (existingAdmin && existingAdmin.email !== session.user.email) {
        return NextResponse.json({ message: "An admin already exists" }, { status: 403 });
      }
    }
    const user = await User.findOneAndUpdate(
      { email: session?.user?.email },
      {
        role,
        mobile,
      },
      { new: true }
    );
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 400 });
    }
    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: `edit role and mobile error ${error}` },
      { status: 500 }
    );
  }
}
