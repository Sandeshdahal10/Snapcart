import connectDb from "@/lib/db";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest){
  try {
    await connectDb();
    const {userId,socketId}=await req.json();
    const user=await User.findByIdAndUpdate(userId,{socketId,isOnline:true},{new:true})
    if(!user){
      return NextResponse.json({message:"User not found"},{status:400})
    }
    return NextResponse.json({message:"Socket ID updated successfully"},{status:200})
  } catch (error) {
    return NextResponse.json({message:"Failed to update Socket ID"},{status:500})
  }
}