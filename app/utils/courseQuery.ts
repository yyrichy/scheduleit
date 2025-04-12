import { GoogleGenerativeAI } from "@google/generative-ai";
import { loadVectorStore } from "./modelTrainer";

interface PreferenceAnalysis {
  difficultyScore: number;
  levelPreference?: string;
  topicFocus?: string[];
  reasoning: string;
}

async function analyzeQuery(query: string): Promise<PreferenceAnalysis> {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `Analyze this course search query: "${query}"
You must respond with a raw JSON object (no markdown, no backticks) containing:
{
  "difficultyScore": number between 0-1 (0=easiest),
  "levelPreference": "1xx" or "2xx" or "3xx" or "4xx" or null,
  "topicFocus": string array of topics,
  "reasoning": "brief explanation"
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean the response of any markdown or code block syntax
    const cleanJson = text.replace(/```json\n?|\n?```/g, "").trim();

    try {
      return JSON.parse(cleanJson);
    } catch (parseError) {
      console.error("Failed to parse cleaned response:", cleanJson);
      throw parseError;
    }
  } catch (error) {
    console.warn("Using fallback analysis due to:", error);

    // Fallback analysis remains the same
    const difficultyPatterns = {
      easy: /\b(easy|simple|basic|beginner|light|introductory)\b/i,
      hard: /\b(hard|difficult|challenging|advanced|complex)\b/i,
      notEasy: /\b(not|don'?t|no).{0,20}\b(easy|simple|basic)\b/i,
      notHard: /\b(not|don'?t|no).{0,20}\b(hard|difficult|challenging)\b/i,
    };

    let difficultyScore = 0.5;
    if (difficultyPatterns.notEasy.test(query)) difficultyScore = 0.7;
    else if (difficultyPatterns.notHard.test(query)) difficultyScore = 0.3;
    else if (difficultyPatterns.easy.test(query)) difficultyScore = 0.2;
    else if (difficultyPatterns.hard.test(query)) difficultyScore = 0.8;

    const levelMatch = query.match(/\b([1-4]00|[1-4]xx)\b/i);
    const levelPreference = levelMatch ? levelMatch[0].replace("00", "xx").toLowerCase() : undefined;

    return {
      difficultyScore,
      levelPreference,
      topicFocus: [],
      reasoning: "pattern matching fallback",
    };
  }
}

export async function queryCourses(query: string, k: number = 5) {
  const vectorStore = await loadVectorStore();
  console.log("🔍 ...");
  const preferences = await analyzeQuery(query);
  console.log("📊 Analyzed preferences:", preferences);

  const results = await vectorStore.similaritySearch(query, k * 2);

  // Sort results based on AI analysis
  const sortedResults = results
    .map((doc) => {
      const gpaMatch = doc.pageContent.match(/Average GPA: ([\d.]+)/);
      const actualGpa = gpaMatch ? parseFloat(gpaMatch[1]) : null;
      const calculationGpa = actualGpa || 2.5; // Use 2.5 for difficulty calculation when GPA is missing
      const courseLevel = doc.metadata?.course_id.match(/\d/)?.[0] || "0";

      let score = 0;
      const difficultyMatch = 1 - Math.abs((4.0 - calculationGpa) / 4.0 - preferences.difficultyScore);
      score += difficultyMatch;

      if (preferences.levelPreference) {
        const levelMatch = preferences.levelPreference.startsWith(courseLevel) ? 1 : 0;
        score += levelMatch;
      }

      return { doc, score };
    })
    .sort((a, b) => b.score - a.score)
    .map(({ doc }) => doc)
    .slice(0, k);

  return sortedResults.map((doc) => ({
    course_id: doc.metadata?.course_id,
    content: doc.pageContent,
    credits: doc.metadata?.credits,
    prerequisites: doc.metadata?.prerequisites,
    gpa: parseFloat(doc.pageContent.match(/Average GPA: ([\d.]+)/)?.[1] || "NaN"), // Display NaN when GPA is missing
  }));
}
