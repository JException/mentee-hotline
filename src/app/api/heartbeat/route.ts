import { NextResponse } from "next/server";
import connectToDB from "@/src/lib/db";
import User from "@/src/models/User";

// Helper function to calculate counts (Reused by both GET and POST)
async function getOnlineCounts() {
  // Count users active in the last 60 seconds
  const oneMinuteAgo = new Date(Date.now() - 60 * 1000);

  const activeUsers = await User.aggregate([
    { 
      $match: { 
        role: "mentee", // Only count students
        lastActiveAt: { $gt: oneMinuteAgo } // 👇 MUST use lastActiveAt (same as POST)
      } 
    },
    { 
      $group: { 
        _id: "$group", // Group by group number
        count: { $sum: 1 } 
      } 
    }
  ]);

  // Convert to simple object: { 1: 5, 2: 3 }
  const counts: Record<number, number> = {};
  activeUsers.forEach((item: any) => {
    if (item._id) counts[item._id] = item.count;
  });
  
  return counts;
}

export async function POST(req: Request) {
  await connectToDB();
  
  try {
    const body = await req.json();
    const { userId } = body;

    // 1. UPDATE: Mark this user as "Online Now"
    if (userId) {
      await User.findByIdAndUpdate(userId, { lastActiveAt: new Date() });
    }

    // 2. RETURN COUNTS directly in the heartbeat response
    const onlineCounts = await getOnlineCounts();
    return NextResponse.json(onlineCounts);

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  await connectToDB();
  try {
    // Just return the counts so the frontend doesn't have to calculate them
    const onlineCounts = await getOnlineCounts();
    return NextResponse.json(onlineCounts);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}