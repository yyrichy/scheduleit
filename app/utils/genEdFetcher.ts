import { GenEdRequirements } from "../types/schedule";
import { loadVectorStores } from "./modelTrainer";

const GEN_ED_CATEGORIES = ["DSHS", "DSHU", "DSNS", "DSNL", "DSSP", "DVCC", "DVUP", "SCIS"];

interface GenEdCourse {
  course_id: string;
  name: string;
  description: string;
  credits: number;
  gen_ed: string[];
  gpa?: number;
}

interface GenEdCategories {
  [key: string]: GenEdCourse[];
}

export interface GenEdProgress {
  completed: GenEdRequirements;
  remaining: GenEdRequirements;
  suggestedCourses: GenEdCourse[];
}

export async function findOptimalGenEds(requirements: GenEdRequirements, preferredGPA: number = 3.5): Promise<GenEdProgress> {
  const { genEdStore } = await loadVectorStores();
  const allDocs = await genEdStore.similaritySearch("", 1000);

  const genEdCourses = allDocs
    .map((doc) => ({
      course_id: doc.metadata.course_id,
      name: doc.metadata.name || "",
      description: doc.pageContent,
      credits: doc.metadata.credits,
      gen_ed: doc.metadata.gen_ed,
      gpa: parseFloat(doc.pageContent.match(/Average GPA: ([\d.]+)/)?.[1] || "NaN"),
    }))
    .sort((a, b) => {
      if (isNaN(a.gpa)) return 1;
      if (isNaN(b.gpa)) return -1;
      return b.gpa - a.gpa;
    });

  const categorizedCourses = GEN_ED_CATEGORIES.reduce(
    (acc, category) => ({
      ...acc,
      [category]: genEdCourses
        .filter((course) => course.gen_ed?.includes(category))
        .map((course) => ({
          ...course,
          description: `${course.description}\nFulfills: ${course.gen_ed?.join(", ")}`,
        })),
    }),
    {} as GenEdCategories
  );

  const completed: GenEdRequirements = {
    DSHS: 0,
    DSHU: 0,
    DSNS: 0,
    DSNL: 0,
    DSSP: 0,
    DVCC: 0,
    DVUP: 0,
    SCIS: 0,
  };

  const suggestedCourses: GenEdCourse[] = [];

  Object.entries(requirements).forEach(([category, required]) => {
    if (required > 0) {
      const availableCourses = categorizedCourses[category]
        .filter((course) => !isNaN(course.gpa) && !suggestedCourses.includes(course))
        .slice(0, required);

      suggestedCourses.push(...availableCourses);
      completed[category] = availableCourses.length;
    }
  });

  const remaining = Object.entries(requirements).reduce(
    (acc, [category, required]) => ({
      ...acc,
      [category]: Math.max(0, required - completed[category]),
    }),
    {} as GenEdRequirements
  );

  return { completed, remaining, suggestedCourses };
}
