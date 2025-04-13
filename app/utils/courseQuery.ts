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
  preferenceScore?: number;
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
    prerequisites_met: true, // Default to true
  };
}

export async function queryCsCourses(
  query: string,
  completedCourses: string[],
  csLimit: number = 15
): Promise<{ csCourses: SearchResult[] }> {
  // Analyze the query first
  const analysis = await analyzeQuery(query);
  const { csStore } = await loadVectorStores();

  // Enhance query based on analysis
  let enhancedQuery = query;
  if (analysis.levelPreference) {
    enhancedQuery += ` ${analysis.levelPreference}`;
  }

  // Search CS courses
  const csResults = await csStore.similaritySearch(enhancedQuery, csLimit);
  const csCourses = csResults.map((result, index) => {
    const searchResult = transformDoc(result, index);
    // Only set prerequisites_met for CS courses
    if (prerequisiteMap[searchResult.course_id]) {
      searchResult.prerequisites_met = prerequisiteMap[searchResult.course_id](completedCourses);
    }

    // Calculate preference score based on similarity and difficulty match
    searchResult.preferenceScore = calculatePreferenceScore(searchResult, analysis.difficultyScore, index, csLimit);

    return searchResult;
  });

  // Sort results considering difficulty preference if GPA is available
  csCourses.sort((a, b) => {
    if (!isNaN(a.gpa) && !isNaN(b.gpa)) {
      // If user wants easier courses (low difficultyScore), prefer higher GPAs
      // If user wants harder courses (high difficultyScore), prefer lower GPAs
      return analysis.difficultyScore < 0.5
        ? b.gpa - a.gpa // Sort by descending GPA for easier preference
        : a.gpa - b.gpa; // Sort by ascending GPA for harder preference
    }
    return 0;
  });

  return {
    csCourses,
  };
}

function calculatePreferenceScore(course: SearchResult, difficultyPreference: number, searchRank: number, totalResults: number): number {
  const weights = {
    similarity: 0.6, // Weight for search ranking
    difficulty: 0.4, // Weight for difficulty match
  };

  // Normalize search ranking (0-1, where 1 is best match)
  const similarityScore = 1 - searchRank / totalResults;

  // Calculate difficulty match (0-1, where 1 is perfect match)
  const difficultyScore = course.gpa ? 1 - Math.abs(1 - course.gpa / 4.0 - difficultyPreference) : 0.5; // Default if GPA unknown

  return similarityScore * weights.similarity + difficultyScore * weights.difficulty;
}
