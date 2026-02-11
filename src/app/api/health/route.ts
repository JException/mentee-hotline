import { NextResponse } from "next/server";
import connectToDB from "@/src/lib/db";

export async function GET() {
  try {
    await connectToDB();
    return NextResponse.json(
      { status: "ok", message: "Database connected successfully!" },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 }
    );
  }
}