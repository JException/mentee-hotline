import { NextResponse } from "next/server";
import connectToDB from "@/src/lib/db";
import User from "@/src/models/User";
import Message from "@/src/models/Message";

export async function GET() {
  await connectToDB();

  try {
    // ⚠️ WARNING: This wipes the database clean for a fresh start
    await User.deleteMany({});
    await Message.deleteMany({});

    // 1. Create the Mentor (You)
    const mentor = await User.create({
      name: "Mentor Justine",
      email: "mentor@thesis.com",
      role: "mentor",
      group: 0, // 0 = Mentor (Access to all)
    });

    // 2. Create 11 Groups automatically
    const groups = [];
    for (let i = 1; i <= 11; i++) {
      const groupUser = await User.create({
        name: `Group ${i} Representative`,
        email: `group${i}@thesis.com`,
        role: "mentee",
        group: i,
      });
      groups.push(groupUser);
    }

    return NextResponse.json({
      message: "✅ Database Reset & Seeded for 11 Groups!",
      mentorId: mentor._id,
      groups: groups.map(g => ({ groupNumber: g.group, id: g._id })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}