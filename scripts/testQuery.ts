import { config } from "dotenv";
config();

import { trainModel } from "../app/utils/modelTrainer";
import { queryCsCourses } from "../app/utils/courseQuery";

async function testQueries() {
  console.log("🚀 Starting test queries...");

  // Initialize vector store
  console.log("Initializing vector store...");
  await trainModel();

  const testQueries = ["data structures", "machine learning courses", "programming fundamentals", "cybersecurity classes"];

  for (const query of testQueries) {
    console.log(`\n📝 Testing query: "${query}"`);
    try {
      const results = await queryCsCourses(query);
      console.log(`Found ${results.length} results:`);
      results.forEach((result) => {
        console.log(`\n🎓 ${result.course_id}`);
        console.log(result.content);
        console.log(`Prerequisites: ${result.prerequisites?.join(", ") || "None"}`);
      });
    } catch (error) {
      console.error("❌ Query failed:", error);
    }
  }
}

testQueries().catch(console.error);
