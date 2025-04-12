import { Document } from "langchain/document";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import fs from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const CS_STORE_PATH = path.join(process.cwd(), "data", "cs_vectorstore.json");
const GENED_STORE_PATH = path.join(process.cwd(), "data", "gened_vectorstore.json");
let globalCSVectorStore: MemoryVectorStore | null = null;
let globalGenEdVectorStore: MemoryVectorStore | null = null;

const GEN_ED_CATEGORIES = ["DSHS", "DSHU", "DSNS", "DSNL", "DSSP", "DVCC", "DVUP", "SCIS"];

async function fetchCSCourses(): Promise<Document[]> {
  try {
    const response = await fetch("https://api.umd.io/v1/courses?dept_id=CMSC");
    const courses = await response.json();

    return courses.map(
      (course: any) =>
        new Document({
          pageContent: `${course.name}\n${course.description}\nAverage GPA: ${course.average_gpa || "N/A"}`,
          metadata: {
            course_id: course.course_id,
            credits: course.credits,
            prerequisites: course.prerequisites || [],
            type: "cs",
            name: course.name,
          },
          id: course.course_id,
        })
    );
  } catch (error) {
    console.error("Failed to fetch CS courses:", error);
    return [];
  }
}

async function fetchGenEdCourses(category: string): Promise<any[]> {
  try {
    const response = await fetch(`https://api.umd.io/v1/courses?gen_ed=${category}`);
    const courses = await response.json();
    return courses;
  } catch (error) {
    console.error(`Failed to fetch ${category} courses:`, error);
    return [];
  }
}

async function saveVectorStore(store: MemoryVectorStore, storePath: string) {
  const data = {
    documents: store.memoryVectors.map((vec) => ({
      pageContent: vec.content,
      metadata: vec.metadata,
    })),
  };
  await fs.mkdir(path.dirname(storePath), { recursive: true });
  await fs.writeFile(storePath, JSON.stringify(data));
}

export async function trainModel() {
  console.log("🚀 Starting model training...");

  if (!process.env.HUGGINGFACE_API_KEY) {
    throw new Error("HUGGINGFACE_API_KEY is not set");
  }

  const embeddings = new HuggingFaceInferenceEmbeddings({
    model: "sentence-transformers/all-MiniLM-L6-v2",
    apiKey: process.env.HUGGINGFACE_API_KEY,
  });

  // Train CS courses
  console.log("💻 Training CS courses...");
  const csDocs = await fetchCSCourses();
  const csVectorStore = await MemoryVectorStore.fromDocuments(csDocs, embeddings);
  await saveVectorStore(csVectorStore, CS_STORE_PATH);

  // Train GenEd courses
  console.log("📚 Training GenEd courses...");
  const genEdDocs = await fetchAllGenEdCourses();
  const genEdVectorStore = await MemoryVectorStore.fromDocuments(genEdDocs, embeddings);
  await saveVectorStore(genEdVectorStore, GENED_STORE_PATH);

  console.log("✅ Training completed!");
}

export async function loadVectorStores() {
  if (globalCSVectorStore && globalGenEdVectorStore) {
    return { csStore: globalCSVectorStore, genEdStore: globalGenEdVectorStore };
  }

  const embeddings = new HuggingFaceInferenceEmbeddings({
    model: "sentence-transformers/all-MiniLM-L6-v2",
    apiKey: process.env.HUGGINGFACE_API_KEY,
  });

  // Load CS store
  if (!existsSync(CS_STORE_PATH)) {
    throw new Error("CS vector store not found. Please run training first.");
  }
  const csData = JSON.parse(await fs.readFile(CS_STORE_PATH, "utf-8"));
  const csDocs = csData.documents.map((doc: any) => new Document(doc));
  globalCSVectorStore = await MemoryVectorStore.fromDocuments(csDocs, embeddings);

  // Load GenEd store
  if (!existsSync(GENED_STORE_PATH)) {
    throw new Error("GenEd vector store not found. Please run training first.");
  }
  const genEdData = JSON.parse(await fs.readFile(GENED_STORE_PATH, "utf-8"));
  const genEdDocs = genEdData.documents.map((doc: any) => new Document(doc));
  globalGenEdVectorStore = await MemoryVectorStore.fromDocuments(genEdDocs, embeddings);

  return { csStore: globalCSVectorStore, genEdStore: globalGenEdVectorStore };
}

export async function fetchAllGenEdCourses(): Promise<Document[]> {
  const genEdDocs: Document[] = [];
  for (const category of GEN_ED_CATEGORIES) {
    console.log(`Fetching ${category} courses...`);
    const courses = await fetchGenEdCourses(category);

    for (const course of courses) {
      const content = `${course.name}\n${course.description}\nAverage GPA: ${course.average_gpa || "N/A"}`;
      genEdDocs.push(
        new Document({
          pageContent: content,
          metadata: {
            course_id: course.course_id,
            credits: course.credits,
            prerequisites: course.prerequisites || [],
            gen_ed: course.gen_ed,
            name: course.name,
            type: "gen_ed",
          },
          id: course.course_id,
        })
      );
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  return genEdDocs;
}

// Remove these functions as they're no longer needed
// export async function loadVectorStore() {
//   if (globalVectorStore) return globalVectorStore;
//
//   if (!existsSync(STORE_PATH)) {
//     throw new Error("Vector store not found. Please run training first.");
//   }
//
//   const embeddings = new HuggingFaceInferenceEmbeddings({
//     model: "sentence-transformers/all-MiniLM-L6-v2",
//     apiKey: process.env.HUGGINGFACE_API_KEY,
//   });
//
//   const fileContent = await fs.readFile(STORE_PATH, "utf-8");
//   const data = JSON.parse(fileContent);
//   const documents = data.documents.map(
//     (doc: { pageContent: any; metadata: any }) =>
//       new Document({
//         pageContent: doc.pageContent,
//         metadata: doc.metadata,
//       })
//   );
//
//   globalVectorStore = await MemoryVectorStore.fromDocuments(documents, embeddings);
//   return globalVectorStore;
// }
// export function getVectorStore() {
//   return globalVectorStore;
// }
