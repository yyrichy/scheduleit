import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const SECTIONS_STORE_PATH = path.join(process.cwd(), "data", "sections_store.json");

export async function GET() {
  try {
    const data = await fs.readFile(SECTIONS_STORE_PATH, "utf-8");
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    console.error("Error reading sections store:", error);
    return NextResponse.json({ error: "Failed to load sections" }, { status: 500 });
  }
}