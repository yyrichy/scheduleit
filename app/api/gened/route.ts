import { NextResponse } from "next/server";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { transformDoc } from "@/utils/courseQuery";
import fs from "fs/promises";
import path from "path";
import { Document } from "langchain/document";

const GEN_ED_STORE_PATHS = {
  DSHS: path.join(process.cwd(), "data", "dshs_vectorstore.json"),
  DSHU: path.join(process.cwd(), "data", "dshu_vectorstore.json"),
  DSNS: path.join(process.cwd(), "data", "dsns_vectorstore.json"),
  DSNL: path.join(process.cwd(), "data", "dsnl_vectorstore.json"),
  DSSP: path.join(process.cwd(), "data", "dssp_vectorstore.json"),
  DVCC: path.join(process.cwd(), "data", "dvcc_vectorstore.json"),
  DVUP: path.join(process.cwd(), "data", "dvup_vectorstore.json"),
  SCIS: path.join(process.cwd(), "data", "scis_vectorstore.json"),
};

export async function POST(req: Request) {
  try {
    const { category, query } = await req.json();

    if (!process.env.HUGGINGFACE_API_KEY) {
      throw new Error("HUGGINGFACE_API_KEY is not set");
    }

    const embeddings = new HuggingFaceInferenceEmbeddings({
      model: "sentence-transformers/all-MiniLM-L6-v2",
      apiKey: process.env.HUGGINGFACE_API_KEY,
    });

    // Load the vector store for the requested category
    const storePath = GEN_ED_STORE_PATHS[category];
    const storeData = JSON.parse(await fs.readFile(storePath, "utf-8"));

    const documents = storeData.documents.map((doc: any) => new Document(doc));
    const vectorStore = await MemoryVectorStore.fromDocuments(documents, embeddings);

    const results = await vectorStore.similaritySearch(query, 5);
    return NextResponse.json(results.map(transformDoc));
  } catch (error: any) {
    console.error("❌ API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to query Gen Ed courses" }, { status: 500 });
  }
}
