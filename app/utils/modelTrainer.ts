import { config } from "dotenv";
config();

import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/huggingface_transformers";
import { Document } from "@langchain/core/documents";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { fetchCourseData } from "./dataCollector.js";
import { HfInference } from "@huggingface/inference";

export async function trainModel() {
  // Verify API key and model access
  const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

  try {
    console.log("Verifying HuggingFace API access...");
    // Test the model access with a simple embedding
    await hf.featureExtraction({
      model: "sentence-transformers/all-MiniLM-L6-v2",
      inputs: "test",
    });
    console.log("✅ HuggingFace API access verified");
  } catch (error) {
    console.error("❌ HuggingFace API access failed:", error);
    console.log("Please verify your API key at: https://huggingface.co/settings/tokens");
    console.log("And ensure you have access to the model at: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2");
    throw error;
  }

  // Initialize the base model
  const model = new HuggingFaceTransformersEmbeddings({
    model: "microsoft/phi-2",
  });

  // Initialize embeddings
  const embeddings = new HuggingFaceInferenceEmbeddings({
    model: "sentence-transformers/all-MiniLM-L6-v2",
    apiKey: process.env.HUGGINGFACE_API_KEY,
  });

  // Fetch and process course data
  const courses = await fetchCourseData();

  // Create training documents
  const documents = courses.map(
    (course) =>
      new Document({
        pageContent: `
      Course: ${course.course_id}
      Name: ${course.name}
      Description: ${course.description}
      Credits: ${course.credits}
      Prerequisites: ${course.prerequisites.join(", ")}
      Average GPA: ${course.gpa_data.reduce((acc, curr) => acc + curr.average, 0) / course.gpa_data.length}
    `,
        metadata: {
          course_id: course.course_id,
          credits: course.credits,
          prerequisites: course.prerequisites,
        },
      })
  );

  // Create vector store
  const vectorStore = await FaissStore.fromDocuments(documents, embeddings);
  await vectorStore.save("course_vectors");

  return { model, vectorStore };
}
