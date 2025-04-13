'use client';

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { WeeklySchedule } from "../../../components/WeeklySchedule";
import { Schedule } from "../../../types/schedule";
import { SearchResult } from "../../../utils/courseQuery";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Section } from "@/types/section";
import { X } from "lucide-react";

export default function EditSchedulePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<SearchResult | null>(null);
  const [sections, setSections] = useState<Section[]>([]);

  useEffect(() => {
    const storedSchedules = localStorage.getItem("generatedSchedules");
    if (storedSchedules) {
      const schedules = JSON.parse(storedSchedules);
      setSchedule(schedules[parseInt(resolvedParams.id)]);
    }
  }, [resolvedParams.id]);

  const handleSearch = async () => {
    try {
      // Validate input format (e.g., "CMSC", "STAT")
      const deptId = searchQuery.trim().toUpperCase();
      if (deptId.length < 2) {
        return;
      }

      const response = await fetch(`https://api.umd.io/v1/courses?dept_id=${deptId}`);
      if (!response.ok) throw new Error("Search failed");
      const data = await response.json();

      // Transform the API response to match our SearchResult type
      const transformedResults: SearchResult[] = data.map((course: any) => ({
        course_id: course.course_id,
        content: `${course.name} - ${course.description}`,
        credits: parseInt(course.credits),
        prerequisites: course.relationships?.prereqs || "",
      }));

      setSearchResults(transformedResults);
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  const formatMeetings = (meetings: any[]) => {
    return meetings.map((meeting) => ({
      days: meeting.days,
      start_time: formatTime(meeting.start_time),
      end_time: formatTime(meeting.end_time),
      building: meeting.building || "",
      room: meeting.room || "",
      classtype: meeting.classtype || "",
    }));
  };

  const formatTime = (time: string) => {
    if (!time) return "12:00PM";

    // Check if time already includes AM/PM
    const isPM = time.toLowerCase().includes("pm");
    const isAM = time.toLowerCase().includes("am");

    // Remove AM/PM and trim
    const cleanTime = time
      .toLowerCase()
      .replace(/(am|pm)/, "")
      .trim();
    const [hours, minutes] = cleanTime.split(":");
    let hour = parseInt(hours);

    // If time already had PM and hour is not 12, add 12 to convert to 24-hour
    if (isPM && hour !== 12) {
      hour += 12;
    }
    // If time had AM and hour is 12, set to 0
    if (isAM && hour === 12) {
      hour = 0;
    }

    // Convert back to 12-hour format
    const period = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;

    return `${formattedHour}:${minutes}${period}`;
  };

  const handleAddCourse = async (course: SearchResult) => {
    if (!schedule) return;

    try {
      // Fetch sections for the selected course
      const response = await fetch(`https://api.umd.io/v1/courses/sections?course_id=${course.course_id}`);
      if (!response.ok) throw new Error("Failed to fetch sections");
      const sectionsData = await response.json();

      // Transform sections data to match our Section type
      const newSection = {
        course: course.course_id,
        section_id: sectionsData[0].section_id,
        seats: sectionsData[0].seats || "0",
        open_seats: sectionsData[0].open_seats || "0",
        waitlist: sectionsData[0].waitlist || "0",
        instructors: sectionsData[0].instructors,
        meetings: formatMeetings(sectionsData[0].meetings),
      };

      const newSchedule = {
        ...schedule,
        courses: [
          ...schedule.courses,
          {
            course_id: course.course_id,
            content: course.content,
            credits: course.credits,
            prerequisites: course.prerequisites,
          },
        ],
        sections: [...schedule.sections, newSection],
      };

      // Log for debugging
      console.log("New section being added:", newSection);
      console.log("Updated schedule:", newSchedule);

      setSchedule(newSchedule);
      const schedules = JSON.parse(localStorage.getItem("generatedSchedules") || "[]");
      schedules[parseInt(params.id)] = newSchedule;
      localStorage.setItem("generatedSchedules", JSON.stringify(schedules));

      setSearchResults([]);
      setSearchQuery("");
    } catch (error) {
      console.error("Error adding course:", error);
    }
  };

  const handleRemoveCourse = (courseId: string) => {
    if (!schedule) return;

    const newSchedule = {
      ...schedule,
      courses: schedule.courses.filter((c) => c.course_id !== courseId),
      sections: schedule.sections.filter((s) => s.course !== courseId),
    };

    setSchedule(newSchedule);
    // Update localStorage
    const schedules = JSON.parse(localStorage.getItem("generatedSchedules") || "[]");
    schedules[parseInt(params.id)] = newSchedule;
    localStorage.setItem("generatedSchedules", JSON.stringify(schedules));
  };

  const handleCourseSelect = async (course: SearchResult) => {
    try {
      const response = await fetch(`https://api.umd.io/v1/courses/sections?course_id=${course.course_id}`);
      if (!response.ok) throw new Error("Failed to fetch sections");
      const sectionsData = await response.json();
      setSections(sectionsData);
      setSelectedCourse(course);
    } catch (error) {
      console.error("Error fetching sections:", error);
    }
  };

  const handleAddSection = async (section: any) => {
    if (!schedule || !selectedCourse) return;

    // Transform the section data to match our Section type
    const newSection = {
      course: selectedCourse.course_id,
      section_id: section.section_id,
      seats: section.seats || "0",
      open_seats: section.open_seats || "0",
      waitlist: section.waitlist || "0",
      instructors: section.instructors || [],
      meetings: section.meetings.map((meeting: any) => {
        return {
          days: meeting.days,
          start_time: formatTime(meeting.start_time),
          end_time: formatTime(meeting.end_time),
          building: meeting.building || "",
          room: meeting.room || "",
          classtype: meeting.classtype || "",
        };
      }),
    };

    // Log the section data to verify format
    console.log("Adding section:", newSection);

    const newSchedule = {
      ...schedule,
      courses: [
        ...schedule.courses,
        {
          course_id: selectedCourse.course_id,
          content: selectedCourse.content,
          credits: selectedCourse.credits,
          prerequisites: selectedCourse.prerequisites,
          gpa: 0,
          ranking: 0,
          prerequisites_met: true,
        },
      ],
      sections: [...schedule.sections, newSection],
      totalScore: schedule.totalScore || 0,
      totalCredits: (schedule.totalCredits || 0) + selectedCourse.credits,
    };

    // Update state and localStorage
    setSchedule(newSchedule);
    const schedules = JSON.parse(localStorage.getItem("generatedSchedules") || "[]");
    schedules[parseInt(params.id)] = newSchedule;
    localStorage.setItem("generatedSchedules", JSON.stringify(schedules));

    // Clear selection
    setSelectedCourse(null);
    setSections([]);
    setSearchResults([]);
    setSearchQuery("");
  };

  if (!schedule) return <div>Loading...</div>;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => router.back()}
          className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-white rounded-lg border shadow-sm hover:shadow-md transition-all"
        >
          ← Back
        </button>
        <h1 className="text-3xl font-bold">Edit Schedule</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <WeeklySchedule
                sections={schedule.sections}
                key={JSON.stringify(schedule.sections)} // Force re-render on section changes
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter department (e.g., CMSC)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                <Button onClick={handleSearch}>Search</Button>
              </div>

              <div className="mt-4 space-y-2">
                {selectedCourse ? (
                  <>
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium">Sections for {selectedCourse.course_id}</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedCourse(null);
                          setSections([]);
                        }}
                      >
                        Back to Courses
                      </Button>
                    </div>
                    {sections.map((section) => (
                      <div
                        key={section.section_id}
                        className="p-2 border rounded hover:bg-muted cursor-pointer"
                        onClick={() => handleAddSection(section)}
                      >
                        <div className="font-medium">Section {section.section_id}</div>
                        <div className="text-sm">{section.instructors.join(", ") || "TBA"}</div>
                        {section.meetings.map((meeting, idx) => (
                          <div key={idx} className="text-xs text-muted-foreground">
                            {meeting.days}: {meeting.start_time} - {meeting.end_time}
                            <br />
                            {meeting.building} {meeting.room}
                          </div>
                        ))}
                      </div>
                    ))}
                  </>
                ) : (
                  searchResults.map((course) => (
                    <div
                      key={course.course_id}
                      className="p-2 border rounded hover:bg-muted cursor-pointer"
                      onClick={() => handleCourseSelect(course)}
                    >
                      <div className="font-medium">{course.course_id}</div>
                      <div className="text-sm text-muted-foreground">{course.content}</div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Current Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {schedule.courses.map((course) => (
                  <div key={course.course_id} className="flex items-center justify-between p-2 border rounded">
                    <span>{course.course_id}</span>
                    <button
                      onClick={() => handleRemoveCourse(course.course_id)}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-full transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}