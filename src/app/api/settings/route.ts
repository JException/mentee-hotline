import { NextResponse } from "next/server";
import connectToDB from "../../../lib/db"; 
import User from "../../../models/User";

export async function PATCH(req: Request) {
  try {
    await connectToDB();
    
    const body = await req.json();
    const { userId, newName, newKey } = body;

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Use $set to strictly update only the fields we want. 
    // This prevents Mongoose from trying to validate other fields like 'email'.
    const updated = await User.findByIdAndUpdate(
      userId, 
      { 
        $set: { 
          name: newName, 
          accessKey: newKey 
        } 
      }, 
      { 
        new: true, 
        runValidators: false // Bypasses unique email checks for this specific update
      }
    );

    if (!updated) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Settings API Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}