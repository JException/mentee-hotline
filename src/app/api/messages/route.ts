import { NextResponse } from "next/server";
import connectToDB from "@/src/lib/db";
import Message from "@/src/models/Message"; // Ensure your Model path is correct

// GET: Fetch messages for a specific group
export async function GET(req: Request) {
  await connectToDB();
  const { searchParams } = new URL(req.url);
  const group = searchParams.get("group");

  if (!group) return NextResponse.json([], { status: 400 });

  const messages = await Message.find({ group: parseInt(group) })
    .populate("senderId", "name")
    .sort({ createdAt: 1 }); // Oldest to newest

  return NextResponse.json(messages);
}

// POST: Send a new message
export async function POST(req: Request) {
  await connectToDB();
  const { senderId, group, content } = await req.json();

  if (!senderId || !content) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const newMessage = await Message.create({ senderId, group, content });
  return NextResponse.json(newMessage);
}

// PATCH: Pin/Unpin a message
export async function PATCH(req: Request) {
  await connectToDB();
  const { messageId, isPinned } = await req.json();
  
  await Message.findByIdAndUpdate(messageId, { isPinned });
  return NextResponse.json({ success: true });
}

// DELETE: Clear chat history (THIS WAS MISSING)
export async function DELETE(req: Request) {
  try {
    await connectToDB();
    const { searchParams } = new URL(req.url);
    const group = searchParams.get("group");

    if (!group) {
      return NextResponse.json({ error: "Group ID required" }, { status: 400 });
    }

    // Delete all messages matching this group ID
    await Message.deleteMany({ group: parseInt(group) });

    return NextResponse.json({ success: true, message: `Group ${group} cleared.` });
  } catch (error) {
    console.error("Delete failed:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}