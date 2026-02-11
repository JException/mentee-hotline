import { NextResponse } from "next/server";
// Use relative paths to be safe
import connectToDB from "../../../lib/db"; 
import Ticket from "../../../models/Ticket";
import User from "@/src/models/User";

export async function GET(req: Request) {
  await connectToDB();
  const { searchParams } = new URL(req.url);
  const group = searchParams.get("group");

  try {
    // If a group is specified, only get tickets for that group
    const filter = group ? { group: Number(group) } : {};
    const tickets = await Ticket.find(filter).sort({ createdAt: -1 }).populate("createdBy", "name");
    return NextResponse.json(tickets);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await connectToDB();
  try {
    const body = await req.json();
    const newTicket = await Ticket.create(body);
    return NextResponse.json(newTicket, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// For updating status (e.g., marking as RESOLVED)
export async function PATCH(req: Request) {
  try {
    await connectToDB();
    const { userId, newName, newKey } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Prepare the update. We only update name and accessKey.
    // We do NOT touch the email field to avoid unique constraint errors.
    const updateData: any = {
      name: newName,
      accessKey: newKey
    };

    const updated = await User.findByIdAndUpdate(
      userId, 
      { $set: updateData }, // Use $set to be explicit
      { new: true, runValidators: false } // Disable validators briefly to bypass email checks
    );

    if (!updated) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Detailed Server Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  await connectToDB();
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await Ticket.findByIdAndDelete(id);
    return NextResponse.json({ message: "Ticket deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// For editing a ticket (Title and Description)
export async function PUT(req: Request) {
  await connectToDB();
  try {
    const { id, title, description, imageUrl } = await req.json();
    const updatedTicket = await Ticket.findByIdAndUpdate(
      id, 
      { title, description, imageUrl }, 
      { new: true }
    );
    return NextResponse.json(updatedTicket);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}