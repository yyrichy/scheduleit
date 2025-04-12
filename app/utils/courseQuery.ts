import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { loadVectorStore } from "./modelTrainer";

type CourseResult = {
  course_id?: string;
  content: string;
  credits?: number;
  prerequisites?: string[];
};

export async function queryCourses(query: string, k: number = 5): Promise<CourseResult[]> {
  const vectorStore = await loadVectorStore();
  const results = await vectorStore.similaritySearch(query, k);

  return results.map((doc) => ({
    course_id: doc.metadata?.course_id,
    content: doc.pageContent,
    credits: doc.metadata?.credits,
    prerequisites: doc.metadata?.prerequisites,
  }));
}
