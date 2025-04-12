import { GoogleGenerativeAI } from "@google/generative-ai";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { FaissStore } from "@langchain/community/vectorstores/faiss";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function createVectorStore() {
  const embeddings = new HuggingFaceInferenceEmbeddings({
    model: "sentence-transformers/all-MiniLM-L6-v2",
    apiKey: process.env.HUGGINGFACE_API_KEY,
  });

  const vectorStore = await FaissStore.load("course_vectors", embeddings);
  return vectorStore;
}

export async function queryModel(input: string) {
  try {
    const vectorStore = await createVectorStore();
    const similarDocs = await vectorStore.similaritySearch(input, 3);
    const context = similarDocs.map((doc) => doc.pageContent).join("\n");

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `
      You are a UMD CS course scheduling assistant.
      
      Relevant course information:
      ${context}
      
      User request: ${input}
      
      Return a JSON object with exactly this structure:
      {
        "courseRecommendations": [
          {
            "courseId": "CMSC420",
            "reasoning": "This course aligns with your interest in..."
          }
        ],
        "preferences": {
          "lightLoad": boolean,
          "preferHighGPA": boolean,
          "avoidEarlyMorning": boolean,
          "avoidEvenings": boolean
        },
        "technicalFit": "string explaining technical alignment",
        "careerPath": "string suggesting career specialization"
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Model query failed:", error);
    throw new Error("Failed to get course recommendations");
  }
}