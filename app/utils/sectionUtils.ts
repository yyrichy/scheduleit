import fs from "fs/promises";
import path from "path";
import { Section, Professor, ScoredSection } from "../types/section";
import { SearchResult } from "./courseQuery";

// Add professor rating cache at the top with sections cache
let sectionsCache: Record<string, Section[]> | null = null;
let professorRatingCache: Record<string, number> = {};

async function loadSectionsStore() {
  if (!sectionsCache) {
    const response = await fetch("/api/sections");
    if (!response.ok) {
      throw new Error("Failed to load sections data");
    }
    sectionsCache = await response.json();
  }
  return sectionsCache;
}

export async function fetchSections(courseId: string): Promise<Section[]> {
  try {
    const sectionsStore = await loadSectionsStore();
    const sections = sectionsStore ? sectionsStore[courseId] || [] : [];
    return sections.filter((section) => parseInt(section.open_seats) > 0);
  } catch (error) {
    console.error(`Error fetching sections for ${courseId}:`, error);
    return [];
  }
}

export async function fetchProfessorRating(name: string): Promise<number> {
  // Check cache first
  if (name in professorRatingCache) {
    return professorRatingCache[name];
  }

  try {
    const response = await fetch(`https://planetterp.com/api/v1/professor?name=${encodeURIComponent(name)}`);
    const professor: Professor = await response.json();
    const rating = professor.average_rating || 4.5;

    // Store in cache
    professorRatingCache[name] = rating;
    return rating;
  } catch (error) {
    console.error(`Error fetching professor rating for ${name}:`, error);
    // Cache the failed attempt to prevent repeated failed requests
    professorRatingCache[name] = 0;
    return 0;
  }
}

export async function getScoredSections(course: SearchResult): Promise<ScoredSection[]> {
  const sections = await fetchSections(course.course_id);
  const scoredSections: ScoredSection[] = [];

  for (const section of sections) {
    let avgProfessorRating = 0;
    let ratingCount = 0;

    // Get ratings for all instructors
    for (const instructor of section.instructors) {
      const rating = await fetchProfessorRating(instructor);
      if (rating > 0) {
        avgProfessorRating += rating;
        ratingCount++;
      }
    }

    const professorRating = ratingCount > 0 ? avgProfessorRating / ratingCount : 0;
    const sectionScore = calculateSectionScore(professorRating, course.preferenceScore || 0);

    scoredSections.push({
      ...section,
      professorRating,
      sectionScore,
    });
  }

  return scoredSections.sort((a, b) => b.sectionScore - a.sectionScore);
}

function calculateSectionScore(professorRating: number, coursePreference: number): number {
  const weights = {
    professorRating: 0.4,
    coursePreference: 0.6,
  };

  return (professorRating / 5) * weights.professorRating + coursePreference * weights.coursePreference;
}

// Add this function
function hasTimeConflict(section1: Section, section2: Section): boolean {
  for (const meeting1 of section1.meetings) {
    for (const meeting2 of section2.meetings) {
      // Check if days overlap
      const days1 = meeting1.days.split("");
      const days2 = meeting2.days.split("");
      const commonDays = days1.filter((day) => days2.includes(day));

      if (commonDays.length > 0) {
        // Convert times to minutes for easier comparison
        const [start1H, start1M] = meeting1.start_time.split(":").map(Number);
        const [end1H, end1M] = meeting1.end_time.split(":").map(Number);
        const [start2H, start2M] = meeting2.start_time.split(":").map(Number);
        const [end2H, end2M] = meeting2.end_time.split(":").map(Number);

        const start1 = start1H * 60 + start1M;
        const end1 = end1H * 60 + end1M;
        const start2 = start2H * 60 + start2M;
        const end2 = end2H * 60 + end2M;

        // Check if times overlap
        if (!(end1 <= start2 || end2 <= start1)) {
          return true;
        }
      }
    }
  }
  return false;
}

// Add this to your existing getScoredSections function
export function checkScheduleConflicts(sections: Section[]): boolean {
  for (let i = 0; i < sections.length; i++) {
    for (let j = i + 1; j < sections.length; j++) {
      if (hasTimeConflict(sections[i], sections[j])) {
        return true;
      }
    }
  }
  return false;
}
