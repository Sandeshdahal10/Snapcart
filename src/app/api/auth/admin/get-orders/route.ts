import connectDb from "@/lib/db";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest){
  try {
    await connectDb();
  } catch (error) {
    
  }
}