import { Document } from "@langchain/core/documents";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { fetchCourseData } from "./dataCollector";
import fs from 'fs';
import path from 'path';

const STORE_PATH = path.join(process.cwd(), 'data', 'vectorstore.json');
let globalVectorStore: MemoryVectorStore | null = null;

export async function trainModel() {
  const embeddings = new HuggingFaceInferenceEmbeddings({
    model: "sentence-transformers/all-MiniLM-L6-v2",
    apiKey: process.env.HUGGINGFACE_API_KEY,
  });

  const courses = await fetchCourseData();
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

  globalVectorStore = await MemoryVectorStore.fromDocuments(documents, embeddings);
  
  // Save to disk
  const dataDir = path.dirname(STORE_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  const serializedData = {
    documents: documents.map(doc => ({
      pageContent: doc.pageContent,
      metadata: doc.metadata
    }))
  };
  
  fs.writeFileSync(STORE_PATH, JSON.stringify(serializedData, null, 2));
  console.log("✅ Vector store saved to disk with", documents.length, "courses");
  
  return { vectorStore: globalVectorStore };
}

export async function loadVectorStore() {
  if (globalVectorStore) return globalVectorStore;
  
  if (!fs.existsSync(STORE_PATH)) {
    throw new Error("Vector store not found. Please run training first.");
  }
  
  const embeddings = new HuggingFaceInferenceEmbeddings({
    model: "sentence-transformers/all-MiniLM-L6-v2",
    apiKey: process.env.HUGGINGFACE_API_KEY,
  });
  
  const data = JSON.parse(fs.readFileSync(STORE_PATH, 'utf-8'));
  const documents = data.documents.map((doc: { pageContent: any; metadata: any; }) => 
    new Document({
      pageContent: doc.pageContent,
      metadata: doc.metadata
    })
  );
  
  globalVectorStore = await MemoryVectorStore.fromDocuments(documents, embeddings);
  return globalVectorStore;
}

export function getVectorStore() {
  return globalVectorStore;
}
