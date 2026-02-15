import { NextResponse } from "next/server";
// Keep your relative paths if that's how your folder structure is set up
import connectToDB from "../../../lib/db"; 
import User from "../../../models/User";

// GET: Fetch all users/groups
export async function GET() {
  try {
    await connectToDB();
    // Fetch all users, sorted by group number
    const users = await User.find({}).sort({ group: 1 });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch groups" }, { status: 500 });
  }
}

// POST: Create a new User or Group
export async function POST(req: Request) {
  try {
    await connectToDB();
    const body = await req.json();
    const { group, name, accessKey, _id } = body;

    // 1. Check if ID exists (if manually provided)
    if (_id) {
      const exists = await User.findById(_id);
      if (exists) {
        return NextResponse.json({ error: "User/Mentor ID already exists" }, { status: 400 });
      }
    }

    // 2. Check if Group Number already exists (Prevent duplicate groups)
    if (group) {
      const existingGroup = await User.findOne({ group: group });
      if (existingGroup) {
        return NextResponse.json(
          { error: `Group ${group} already exists. Please use a different number.` }, 
          { status: 400 }
        );
      }
    }

    // 3. Create the new User
    const newUser = await User.create({ _id, group, name, accessKey });
    return NextResponse.json(newUser);

  } catch (error: any) {
    console.error("Create failed:", error);
    return NextResponse.json({ error: error.message || "Failed to create user" }, { status: 500 });
  }
}

// PATCH: Update a group name OR access key
export async function PATCH(req: Request) {
  try {
    await connectToDB();
    const { groupId, newName, newKey } = await req.json();

    // Prepare update object dynamically
    const updateData: any = {};
    if (newName) updateData.name = newName;
    if (newKey) updateData.accessKey = newKey;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No changes provided" }, { status: 400 });
    }

    // Find by ID and update
    const updated = await User.findByIdAndUpdate(
      groupId, 
      updateData, 
      { new: true } // Return the updated document
    );

    if (!updated) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(updated);

  } catch (error: any) {
    console.error("Update failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}