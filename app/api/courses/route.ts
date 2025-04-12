import { NextResponse } from "next/server";
import { queryCourses } from "@/utils/courseQuery";

export async function POST(req: Request) {
  try {
    const { query, completedCourses = [] } = await req.json();
    
    const results = await queryCourses(query, completedCourses);
    return NextResponse.json(results);
  } catch (error: any) {
    console.error("❌ API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to query courses" }, { status: 500 });
  }
}
