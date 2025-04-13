import { NextResponse } from "next/server";
import { loadSectionsStore } from "../../utils/sectionLoader";

export async function GET() {
  try {
    const data = await loadSectionsStore();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error reading sections store:", error);
    return NextResponse.json({ error: "Failed to load sections" }, { status: 500 });
  }
}