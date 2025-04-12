import { NextResponse } from "next/server";
import { queryCourses } from "@/utils/courseQuery";

export async function POST(req: Request) {
  try {
    const { query } = await req.json();
    console.log("🔍 Analyzing query:", query);

    // Pass genEdRequirements to queryCourses
    const { csCourses } = await queryCourses(query, 20, 5);

    return NextResponse.json({
      csCourses,
    });
  } catch (error: any) {
    console.error("❌ API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to query courses" },
      { status: 500 }
    );
  }
}
