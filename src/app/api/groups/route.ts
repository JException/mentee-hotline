import { NextResponse } from "next/server";
// Use relative paths to ensure the server finds the files
import connectToDB from "../../../lib/db"; 
import User from "../../../models/User";


// Get all group names
export async function GET() {
  await connectToDB();
  const groups = await User.find({ role: "mentee" }).sort({ group: 1 });
  return NextResponse.json(groups);
}

// Update a group name
export async function PATCH(req: Request) {
  await connectToDB();
  try {
    const { groupId, newName } = await req.json();
    const updated = await User.findByIdAndUpdate(groupId, { name: newName }, { new: true });
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}