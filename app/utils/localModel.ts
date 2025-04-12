// lib/langchain.ts
import { HuggingFaceInference } from "@langchain/community/llms/hf";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { FaissStore } from "@langchain/community/vectorstores/faiss";

// Loads model and vector store
export async function createModel() {
  const model = new HuggingFaceInference({
    model: "microsoft/phi-2", // make sure this is hosted on HF Inference
    apiKey: process.env.HUGGINGFACE_API_KEY, // required for hosted inference
  });

  const embeddings = new HuggingFaceInferenceEmbeddings({
    model: "sentence-transformers/all-MiniLM-L6-v2",
    apiKey: process.env.HUGGINGFACE_API_KEY,
  });

  const vectorStore = await FaissStore.load("course_vectors", embeddings);

  return { model, vectorStore };
}

// Accepts user input and returns model output
export async function queryModel(input: string) {
  const { model, vectorStore } = await createModel();

  const similarDocs = await vectorStore.similaritySearch(input, 3);

  const context = similarDocs.map((doc) => doc.pageContent).join("\n");

  const response = await model.call(
    `Context:\n${context}\n\nUser query: ${input}\n\nRespond in JSON with courseRecommendations and preferences.`
  );

  return response;
}
