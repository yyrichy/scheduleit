import { SearchResult } from "@/utils/courseQuery";
import { ScoredSection } from "./section";

export interface GenEdRequirements {
  DSHS: number;
  DSHU: number;
  DSNS: number;
  DSNL: number;
  DSSP: number;
  DVCC: number;
  DVUP: number;
  SCIS: number;
}

export interface ScheduleRequirements {
  genEds: GenEdRequirements;
  totalCredits: number;
  preferredDifficulty: 'easy' | 'moderate' | 'challenging';
}

export interface SearchResults {
  csCourses: SearchResult[];
  genEdCourses: Record<string, SearchResult[]>;
  genEdProgress: {
    completed: GenEdRequirements;
    remaining: GenEdRequirements;
  };
}

export interface Schedule {
  courses: {
    course_id: string;
    content: string;
    credits: number;
    prerequisites: string;
    gpa: number;
    gen_ed?: string[];
    ranking: number;
    prerequisites_met: boolean;
    preferenceScore?: number;
  }[];
  sections: ScoredSection[];
  totalScore: number;
  totalCredits: number;
}