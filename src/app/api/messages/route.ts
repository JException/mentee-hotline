import { NextResponse } from "next/server";
import Message from "@/src/models/Message";
import connectToDB from "@/src/lib/db";
export async function GET(req: Request) {
  await connectToDB();

  try {
    // Get the group number from the URL (e.g., /api/messages?group=5)
    const { searchParams } = new URL(req.url);
    const group = searchParams.get("group");

    if (!group) {
      return NextResponse.json({ error: "Group number required" }, { status: 400 });
    }

    // Only find messages belonging to THIS group
    const messages = await Message.find({ group: Number(group) })
      .sort({ createdAt: 1 })
      .populate("senderId", "name role");

    return NextResponse.json(messages);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await connectToDB();

  try {
    const body = await req.json();
    
    // Now we save the group number along with the message
    const newMessage = await Message.create({
      senderId: body.senderId,
      group: body.group, // 👈 New: Save the group!
      content: body.content,
    });

    await newMessage.populate("senderId", "name role");

    return NextResponse.json(newMessage, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}