import { NextResponse } from "next/server";
import { queryCourses, SearchResult } from "@/utils/courseQuery";

export async function POST(req: Request) {
  try {
    const { query, completedCourses } = await req.json();

    // Split query into topics
    const topics = query
      .toLowerCase()
      .split(/and|,|\+/)
      .map((t: string) => t.trim())
      .filter((t: string) => t.length > 0);

    let allResults: SearchResult[] = [];

    // Search for each topic separately
    for (const topic of topics) {
      const results = await queryCourses(topic, completedCourses);
      allResults.push(...results.csCourses); // Extract csCourses from results
    }

    // Remove duplicates and combine scores
    const combinedResults = allResults.reduce((acc: Record<string, SearchResult>, curr) => {
      if (!acc[curr.course_id]) {
        acc[curr.course_id] = curr;
      } else {
        // Combine preference scores if course appears in multiple topic searches
        acc[curr.course_id].preferenceScore = Math.max(acc[curr.course_id].preferenceScore || 0, curr.preferenceScore || 0);
      }
      return acc;
    }, {});

    // Convert back to array and sort
    const finalResults = Object.values(combinedResults).sort((a, b) => (b.preferenceScore || 0) - (a.preferenceScore || 0));

    return NextResponse.json({
      csCourses: finalResults.slice(0, 10),
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
