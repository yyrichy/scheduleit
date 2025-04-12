import { NextResponse } from "next/server";
import { queryCourses } from "@/app/utils/courseQuery";

export async function POST(req: Request) {
  try {
    const { query, limit = 5 } = await req.json();
    const results = await queryCourses(query, limit);
    return NextResponse.json({ results });
  } catch (error) {
    return NextResponse.json({ error: "Failed to query courses" }, { status: 500 });
  }
}
