import { NextResponse } from "next/server";
import { Schedule } from "../../types/schedule";
import { SearchResult } from "@/utils/courseQuery";
import { checkScheduleConflicts, getScoredSections } from "../../utils/sectionUtils";
import { loadSectionsStore } from "../../utils/sectionLoader";

// Cache for storing generated schedules
const scheduleCache = new Map<string, Schedule[]>();

export async function POST(req: Request) {
  const { csCourses, otherCourses, targetCredits, completedCourses } = await req.json();

  // Generate cache key based on input parameters
  const cacheKey = JSON.stringify({ csCourses, otherCourses, targetCredits, completedCourses });

  // Check cache first
  if (scheduleCache.has(cacheKey)) {
    return NextResponse.json(scheduleCache.get(cacheKey));
  }

  const schedules = await generateSchedulesOptimized(csCourses, otherCourses, targetCredits);

  // Store in cache
  scheduleCache.set(cacheKey, schedules);

  return NextResponse.json(schedules);
}

async function generateSchedulesOptimized(
  csCourses: SearchResult[],
  otherCourses: SearchResult[],
  targetCredits: number
): Promise<Schedule[]> {
  // Sort CS courses by their ranking (highest first)
  csCourses.sort((a, b) => (b.ranking || 0) - (a.ranking || 0));

  console.log("Starting schedule generation with:", {
    csCourses: csCourses.length,
    otherCourses: otherCourses.length,
    targetCredits,
  });

  const schedules: Schedule[] = [];
  const courseSectionsMap = new Map();

  try {
    // Pre-fetch all sections
    console.log("Fetching sections for all courses...");
    await Promise.all(
      [...csCourses, ...otherCourses].map(async (course) => {
        const sections = await getScoredSections(course);
        console.log(`Fetched ${sections.length} sections for ${course.course_id}`);
        if (sections.length > 0) {
          courseSectionsMap.set(course.course_id, sections);
        }
      })
    );

    // Filter out courses with no sections
    csCourses = csCourses.filter((course) => courseSectionsMap.has(course.course_id));
    otherCourses = otherCourses.filter((course) => courseSectionsMap.has(course.course_id));

    console.log(`Courses with sections: CS=${csCourses.length}, Other=${otherCourses.length}`);

    // Initialize DP array with empty schedule
    const dp: Schedule[][] = Array.from({ length: targetCredits + 4 }, () => []);
    dp[0] = [
      {
        courses: [],
        sections: [],
        totalCredits: 0,
        totalScore: 0,
      },
    ];

    // Process top CS courses first
    console.log("Processing top CS courses...");
    const topCSCourses = csCourses.slice(0, Math.min(5, csCourses.length)); // Consider top 5 CS courses
    for (const course of topCSCourses) {
      const credits = Number(course.credits) || 0;
      console.log(`Processing top CS course ${course.course_id} (${credits} credits)`);

      for (let i = targetCredits + 3; i >= credits; i--) {
        if (dp[i - credits].length > 0) {
          // In the top CS courses processing section
          const newSchedules = dp[i - credits].flatMap((schedule) => {
            return courseSectionsMap
              .get(course.course_id)
              .map((section) => {
                if (!checkScheduleConflicts([...schedule.sections, section])) {
                  return {
                    ...schedule,
                    courses: [...schedule.courses, course],
                    sections: [...schedule.sections, section],
                    totalCredits: schedule.totalCredits + credits,
                    // Remove csCourseCount from here
                  };
                }
                return null;
              })
              .filter(Boolean);
          });

          dp[i] = [...dp[i], ...newSchedules];
        }
      }
    }

    // Process other courses
    console.log("Processing other courses...");
    for (const course of otherCourses) {
      const credits = Number(course.credits) || 0;
      console.log(`Processing course ${course.course_id} (${credits} credits)`);

      for (let i = targetCredits + 3; i >= credits; i--) {
        if (dp[i - credits].length > 0) {
          const newSchedules = dp[i - credits].flatMap((schedule) => {
            return courseSectionsMap
              .get(course.course_id)
              .map((section) => {
                if (!checkScheduleConflicts([...schedule.sections, section])) {
                  return {
                    ...schedule,
                    courses: [...schedule.courses, course],
                    sections: [...schedule.sections, section],
                    totalCredits: schedule.totalCredits + credits,
                  };
                }
                return null;
              })
              .filter(Boolean);
          });

          dp[i] = [...dp[i], ...newSchedules];
        }
      }
    }

    // Get all valid schedules within credit range
    console.log("Compiling final schedules...");
    for (let i = targetCredits - 3; i <= targetCredits + 3; i++) {
      if (dp[i].length > 0) {
        console.log(`Found ${dp[i].length} schedules with ${i} credits`);
        schedules.push(...dp[i]);
      }
    }

    // Score and sort schedules
    const scoredSchedules = schedules
      .map((schedule) => ({
        ...schedule,
        totalScore: calculateScheduleScore(schedule),
      }))
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, 5);

    console.log("Schedule generation complete. Found:", scoredSchedules.length);
    return scoredSchedules;
  } catch (error) {
    console.error("Error during schedule generation:", error);
    return [];
  }
}

// Modified scoring function
function calculateScheduleScore(schedule: Schedule): number {
  const uniqueGenEds = new Set(schedule.courses.flatMap((course) => course.gen_ed || []));
  const diversityScore = uniqueGenEds.size / schedule.courses.length;

  const sectionScore = schedule.sections.reduce((sum, section) => sum + section.sectionScore, 0) / schedule.sections.length;

  // Compute CS course count dynamically
  const csCourseCount = schedule.courses.filter((course) => course.course_id.startsWith("CMSC")).length;
  const csCourseBonus = csCourseCount >= 2 ? 0.2 : 0;

  return sectionScore * 0.7 + diversityScore * 0.1 + csCourseBonus;
}
