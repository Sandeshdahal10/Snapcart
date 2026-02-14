import User from "@/models/user.model";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await User.findOne({ role: "admin" });
    if (user) {
      return NextResponse.json({ adminExist: true }, { status: 200 });
    } else {
      return NextResponse.json({ adminExist: false }, { status: 200 });
    }
  } catch (error) {
    return NextResponse.json(
      {
        message: `check for admin error ${error}`,
      },
      { status: 500 },
    );
  }
}
