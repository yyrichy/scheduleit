import { NextResponse } from "next/server";
import { queryCourses } from "@/utils/courseQuery";
import { findOptimalGenEds } from "@/utils/genEdFetcher";

export async function POST(req: Request) {
  try {
    const { query, genEdRequirements } = await req.json();
    console.log("🔍 Analyzing query:", query);
    console.log("📚 Gen-Ed Requirements:", genEdRequirements);

    // Pass genEdRequirements to queryCourses
    const { csCourses, genEdCourses } = await queryCourses(query, 5, 5, genEdRequirements);

    return NextResponse.json({
      csCourses,
      genEdCourses,
      genEdProgress: {
        completed: genEdRequirements,
        remaining: genEdRequirements // This will be updated by the frontend based on selected courses
      }
    });
  } catch (error: any) {
    console.error("❌ API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to query courses" },
      { status: 500 }
    );
  }
}
