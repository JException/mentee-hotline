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
  await connectToDB();
  try {
    const body = await req.json();
    console.log("1. PATCH received body:", body); // <--- DEBUG LOG

    const { ticketId, action } = body; 
    
    if (!ticketId) return NextResponse.json({ error: "Ticket ID missing" }, { status: 400 });

    let updateQuery = {};

    // SCENARIO A: Toggle Status
    if (action === "toggle_status") {
      const currentTicket = await Ticket.findById(ticketId);
      const newStatus = currentTicket.status === "OPEN" ? "RESOLVED" : "OPEN";
      updateQuery = { status: newStatus };
    } 
    // SCENARIO B: Add Reply
    else if (action === "add_reply") {
      const { reply } = body;
      console.log("2. Adding reply payload:", reply); // <--- DEBUG LOG
      
      // We use $push to add to the array
      updateQuery = { $push: { replies: reply } };
    }
    // SCENARIO C: Delete Reply
    else if (action === "delete_reply") {
      const { replyId } = body;
      updateQuery = { $pull: { replies: { _id: replyId } } };
    }

    console.log("3. Running Update with Query:", JSON.stringify(updateQuery)); // <--- DEBUG LOG

    const updatedTicket = await Ticket.findByIdAndUpdate(
      ticketId, 
      updateQuery, 
      { returnDocument: 'after' } // Replaces { new: true }
    ).populate("createdBy", "name");

    console.log("4. Update Result (Replies count):", updatedTicket?.replies?.length); // <--- DEBUG LOG

    if (!updatedTicket) {
        return NextResponse.json({ error: "Ticket not found or update failed" }, { status: 404 });
    }

    return NextResponse.json(updatedTicket);
  } catch (error: any) {
    console.error("SERVER ERROR:", error); // <--- DEBUG LOG
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