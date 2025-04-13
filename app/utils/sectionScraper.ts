import fs from "fs/promises";
import path from "path";
import { existsSync } from "fs";

interface Section {
  course: string;
  section_id: string;
  seats: string;
  open_seats: string;
  waitlist: string;
  instructors: string[];
  meetings: Array<{
    days: string;
    start_time: string;
    end_time: string;
    building: string;
    room: string;
  }>;
}

const SECTIONS_STORE_PATH = path.join(process.cwd(), "data", "sections_store.json");
const CS_PATH = path.join(process.cwd(), "data", "cs.json");
const BATCH_SIZE = 50; // UMD.io allows up to 100 courses per request

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchSectionsForCourses(courseIds: string[]): Promise<Record<string, Section[]>> {
  try {
    const sectionMap: Record<string, Section[]> = {};
    const failedCourses: string[] = [];

    for (const courseId of courseIds) {
      console.log(`Fetching sections for course: ${courseId}`);

      try {
        const response = await fetch(`https://api.umd.io/v1/courses/sections?course_id=${courseId}`);
        if (!response.ok) {
          console.error(`Failed to fetch ${courseId} with status ${response.status}: ${response.statusText}`);
          failedCourses.push(courseId);
          continue;
        }

        const sections: Section[] = await response.json();
        console.log(`Retrieved ${sections.length} sections for ${courseId}`);

        if (sections.length > 0) {
          sectionMap[courseId] = sections;
        }
      } catch (courseError) {
        console.error(`Error processing course ${courseId}:`, courseError);
        failedCourses.push(courseId);
      }

      // Rate limiting - wait 500ms between requests
      await delay(500);
    }

    if (failedCourses.length > 0) {
      console.error(`\nFailed to fetch sections for ${failedCourses.length} courses:`);
      console.error(failedCourses.join(", "));
    }

    return sectionMap;
  } catch (error) {
    console.error("Fatal error fetching sections:", error);
    return {};
  }
}

async function getAllCourseIds(): Promise<string[]> {
  const courseIds = new Set<string>();

  // Read CS courses
  const csData = JSON.parse(await fs.readFile(CS_PATH, "utf-8"));
  csData.forEach((course: any) => courseIds.add(course.course_id));

  // Read GenEd courses from each category's store
  const GEN_ED_CATEGORIES = ["DSHS", "DSHU", "DSNS", "DSNL", "DSSP", "DVCC", "DVUP", "SCIS"];
  for (const category of GEN_ED_CATEGORIES) {
    const storePath = path.join(process.cwd(), "data", `${category.toLowerCase()}_vectorstore.json`);
    if (existsSync(storePath)) {
      const storeData = JSON.parse(await fs.readFile(storePath, "utf-8"));
      storeData.documents.forEach((doc: any) => {
        if (doc.metadata?.course_id) {
          courseIds.add(doc.metadata.course_id);
        }
      });
    }
  }

  return Array.from(courseIds);
}

export async function scrapeSections() {
  console.log("🚀 Starting section scraping...");

  try {
    const courseIds = await getAllCourseIds();
    console.log(`Found ${courseIds.length} unique courses to fetch sections for`);

    const sectionMap = await fetchSectionsForCourses(courseIds);

    // Save to file
    await fs.writeFile(SECTIONS_STORE_PATH, JSON.stringify(sectionMap, null, 2));

    console.log("✅ Section scraping completed!");
    console.log(`📊 Scraped sections for ${Object.keys(sectionMap).length} courses`);
  } catch (error) {
    console.error("❌ Section scraping failed:", error);
  }
}
