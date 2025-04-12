import { GoogleGenerativeAI } from "@google/generative-ai";
import { loadVectorStores } from "./modelTrainer";
import { prerequisiteMap } from "./prerequisiteMap";

interface PreferenceAnalysis {
  difficultyScore: number;
  levelPreference?: string;
  reasoning: string;
}

async function analyzeQuery(query: string): Promise<PreferenceAnalysis> {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `Analyze this course search query: "${query}"
Consider CS major requirements at University of Maryland, College Park.
Return a JSON object with:
{
  "difficultyScore": number 0-1 (0=easiest),
  "levelPreference": "1xx"/"2xx"/"3xx"/"4xx"/null,
  "reasoning": "explanation"
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
      reasoning: "pattern matching fallback",
    };
  }
}

export interface SearchResult {
  course_id: string;
  content: string;
  credits: number;
  prerequisites: string;
  gpa: number;
  gen_ed?: string[];
  ranking: number;
  prerequisites_met: boolean;
}

export function transformDoc(doc: any, index: number): SearchResult {
  const gpaMatch = doc.pageContent.match(/Average GPA: ([\d.]+)/);
  return {
    course_id: doc.metadata.course_id,
    content: doc.pageContent,
    credits: doc.metadata.credits,
    prerequisites: doc.metadata.prerequisites || "", // Ensure string
    gpa: gpaMatch ? parseFloat(gpaMatch[1]) : NaN,
    gen_ed: doc.metadata.gen_ed,
    ranking: index + 1,
    prerequisites_met: true // Default to true
  };
}

export async function queryCourses(
  query: string,
  completedCourses: string[],
  csLimit: number = 5,
  genEdLimit: number = 5,
  genEdRequirements?: Record<string, number>
): Promise<{ csCourses: SearchResult[]; genEdCourses: Record<string, SearchResult[]> }> {
  const { csStore, genEdStore } = await loadVectorStores();

  // Search CS courses
  const csResults = await csStore.similaritySearch(query, csLimit);
  const csCourses = csResults.map((result, index) => {
    const searchResult = transformDoc(result, index);
    // Only set prerequisites_met for CS courses
    if (prerequisiteMap[searchResult.course_id]) {
      searchResult.prerequisites_met = prerequisiteMap[searchResult.course_id](completedCourses);
    }
    return searchResult;
  });

  // Initialize an object to hold Gen Ed results by category
  const genEdCourses: Record<string, SearchResult[]> = {};

  // Perform similarity search for each Gen Ed category separately
  if (genEdRequirements) {
    for (const [category, count] of Object.entries(genEdRequirements)) {
      if (count > 0) {
        const categoryResults = await genEdStore.similaritySearch(`${query} ${category}`, genEdLimit);
        genEdCourses[category] = categoryResults.map((result, index) => 
          transformDoc(result, index)
        );
      }
    }
  }

  return {
    csCourses,
    genEdCourses,
  };
}
