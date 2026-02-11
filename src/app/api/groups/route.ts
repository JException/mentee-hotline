import { NextResponse } from "next/server";
// Use relative paths to ensure the server finds the files
import connectToDB from "../../../lib/db"; 
import User from "../../../models/User";

export async function GET() {
  await connectToDB();
  
  // FETCH ALL: We need both "mentee" (groups) and "mentor" roles
  // so the Settings page can find the Mentor profile.
  const users = await User.find({}).sort({ group: 1 });
  
  return NextResponse.json(users);
}

export async function POST(req: Request) {
  try {
    await connectToDB();
    const body = await req.json();

    // Check if a user with this specific ID already exists
    if (body._id) {
      const exists = await User.findById(body._id);
      if (exists) {
        return NextResponse.json({ error: "User/Mentor already exists" }, { status: 400 });
      }
    }

    // Create the new User (Mentor or Group)
    const newUser = await User.create(body);
    return NextResponse.json(newUser);
  } catch (error) {
    console.error("Create failed:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
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