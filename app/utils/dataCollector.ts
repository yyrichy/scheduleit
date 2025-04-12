import axios from "axios";
import { prerequisiteMap } from "./prerequisiteMap.js";

interface Course {
  course_id: string;
  name: string;
  description: string;
  credits: number;
  prerequisites: string[];
  sections: {
    section_id: string;
    instructor: string;
    seats: number;
    meetings: {
      days: string;
      start_time: string;
      end_time: string;
      building: string;
      room: string;
      classtype: string;
    }[];
  }[];
  gpa_data: {
    average: number;
    professor: string;
  }[];
}

interface PlanetTerpCourse {
  department: string;
  course_number: number;
  title: string;
  description: string;
  credits: number;
  average_gpa: number;
  professors: string[];
}

export async function fetchCourseData(): Promise<Course[]> {
  const courses: Course[] = [];

  try {
    const [coursesResponse, planetTerpResponse] = await Promise.all([
      axios.get("https://api.umd.io/v1/courses?dept_id=CMSC&per_page=100"),
      axios.get<PlanetTerpCourse[]>("https://planetterp.com/api/v1/courses?department=CMSC&limit=100&reviews=true"),
    ]);

    // Filter out graduate courses
    const undergraduateCourses = coursesResponse.data.filter((course: any) => !course.course_id.match(/CMSC[6-8]\d\d/));

    // Filter PlanetTerp data for undergraduate courses
    const planetTerpData = new Map(
      planetTerpResponse.data
        .filter((course) => course.course_number < 600)
        .map((course: PlanetTerpCourse) => [
          `CMSC${course.course_number}`,
          {
            average_gpa: course.average_gpa || 0,
            professors: course.professors || [],
          },
        ])
    );

    for (const course of undergraduateCourses) {
      try {
        // Get sections data
        const sectionsResponse = await axios.get(`https://api.umd.io/v1/courses/sections?course_id=${course.course_id}`);

        const ptData = planetTerpData.get(course.course_id);
        const gpaData = (ptData?.professors || []).map((professor) => ({
          average: ptData?.average_gpa || 0,
          professor: professor,
        }));

        courses.push({
          course_id: course.course_id,
          name: course.name,
          description: course.description,
          credits: parseInt(course.credits),
          prerequisites: prerequisiteMap[course.course_id] || [],
          sections: sectionsResponse.data.map((section: any) => ({
            section_id: section.section_id,
            instructor: section.instructors[0] || "TBA",
            seats: parseInt(section.seats),
            meetings: section.meetings.map((meeting: any) => ({
              days: meeting.days,
              start_time: meeting.start_time,
              end_time: meeting.end_time,
              building: meeting.building,
              room: meeting.room,
              classtype: meeting.classtype || "",
            })),
          })),
          gpa_data: gpaData,
        });

        console.log(`Successfully processed ${course.course_id}`);
      } catch (error) {
        console.error(`Error processing ${course.course_id}:`, error);
      }
    }
  } catch (error) {
    console.error("Error fetching course list:", error);
  }

  console.log(`Successfully collected data for ${courses.length} courses`);
  return courses;
}
