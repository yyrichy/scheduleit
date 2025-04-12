import { NextResponse } from "next/server";
import fetch from "node-fetch";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from "@langchain/openai"; // Import OpenAIEmbeddings
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { transformDoc } from "@/utils/courseQuery";

export async function POST(req: Request) {
  try {
    const { category, query } = await req.json();
    const response = await fetch(`https://api.umd.io/v1/courses?gen_ed=${category}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch courses: ${response.statusText}`);
    }
    const courses = await response.json();
    if (!courses || !Array.isArray(courses)) {
      throw new Error("Invalid course data received");
    }

    const embeddings = new HuggingFaceInferenceEmbeddings({
      model: "sentence-transformers/all-MiniLM-L6-v2",
      apiKey: process.env.HUGGINGFACE_API_KEY,
    });

    // Create a new MemoryVectorStore instance with embeddings
    const vectorStore = new MemoryVectorStore(embeddings);

    // Add courses to the vector store
    const documents = courses.map((course) => ({
      pageContent: `${course.name}\n${course.description}\nAverage GPA: ${course.average_gpa || "N/A"}`, // Include more relevant information
      metadata: {
        course_id: course.course_id,
        gen_ed: course.gen_ed,
        name: course.name,
        credits: course.credits,
        prerequisites: course.prerequisites || [],
      },
    }));

    await vectorStore.addDocuments(documents);

    const results = await vectorStore.similaritySearch(query, 5);
    console.log("returning", results.map(transformDoc));
    return NextResponse.json(results.map(transformDoc));
  } catch (error: any) {
    console.error("❌ API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to query Gen Ed courses" }, { status: 500 });
  }
}
