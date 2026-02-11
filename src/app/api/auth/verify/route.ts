import { NextResponse } from "next/server";
import connectToDB from "../../../../lib/db";
import User from "../../../../models/User";

export async function GET(req: Request) {
  try {
    await connectToDB();
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");

    if (!code) return NextResponse.json({ error: "No code" }, { status: 400 });

    // Find the user (Mentor or Mentee) with this exact accessKey
    const user = await User.findOne({ accessKey: code });

    if (!user) {
      return NextResponse.json({ error: "Invalid code" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}