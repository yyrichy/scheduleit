import { NextResponse } from "next/server";
import { queryCourses } from "@/utils/courseQuery";

export async function POST(req: Request) {
  try {
    const { query, limit = 5 } = await req.json();
    console.log("🔍 Analyzing query:", query);

    const results = await queryCourses(query, limit);
    console.log("✅ Found results:", results.length);

    return NextResponse.json({ results });
  } catch (error: any) {
    console.error("❌ API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to query courses" },
      { status: 500 }
    );
  }
}
