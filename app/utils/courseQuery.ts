import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";

export async function queryCourses(query: string, k: number = 5) {
  const embeddings = new HuggingFaceInferenceEmbeddings({
    model: "sentence-transformers/all-MiniLM-L6-v2",
    apiKey: process.env.HUGGINGFACE_API_KEY,
  });

  const vectorStore = await FaissStore.load("course_vectors", embeddings);
  const results = await vectorStore.similaritySearch(query, k);
  
  return results.map(doc => ({
    course_id: doc.metadata.course_id,
    content: doc.pageContent,
    credits: doc.metadata.credits,
    prerequisites: doc.metadata.prerequisites
  }));
}