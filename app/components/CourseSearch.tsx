'use client';

import React from "react";
import { useState } from "react";
import RequirementsSelector from "./RequirementsSelector";
import { GenEdRequirements } from "../types/schedule";
import { SearchResult } from "../utils/courseQuery";
import { CourseTagsInput } from "./CourseTagsInput";
import { checkScheduleConflicts, getScoredSections } from "../utils/sectionUtils";
import { ScoredSection } from "../types/section";
import { WeeklySchedule } from "./WeeklySchedule";

interface SearchResults {
  csCourses: SearchResult[];
  genEdCourses: Record<string, SearchResult[]>;
  genEdProgress: {
    completed: GenEdRequirements;
    remaining: GenEdRequirements;
  };
}

export default function CourseSearch() {
  const [query, setQuery] = useState("");
  const [completedCourses, setCompletedCourses] = useState<string[]>([]);
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false); // Add this line
  const [results, setResults] = useState<SearchResults>({
    csCourses: [],
    genEdCourses: {},
    genEdProgress: {
      completed: {
        DSHS: 0,
        DSHU: 0,
        DSNS: 0,
        DSNL: 0,
        DSSP: 0,
        DVCC: 0,
        DVUP: 0,
        SCIS: 0,
      },
      remaining: {
        DSHS: 0,
        DSHU: 0,
        DSNS: 0,
        DSNL: 0,
        DSSP: 0,
        DVCC: 0,
        DVUP: 0,
        SCIS: 0,
      },
    },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [genEdRequirements, setGenEdRequirements] = useState<GenEdRequirements>({
    DSHS: 0,
    DSHU: 0,
    DSNS: 0,
    DSNL: 0,
    DSSP: 0,
    DVCC: 0,
    DVUP: 0,
    SCIS: 0,
  });

  const searchGenEdCourses = async () => {
    const genEdResults: Record<string, SearchResult[]> = {};

    for (const [category, count] of Object.entries(genEdRequirements)) {
      if (count > 0) {
        try {
          const response = await fetch("/api/gened", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ category, query }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Gen Ed search failed");
          }

          const data = await response.json();
          genEdResults[category] = data;
        } catch (err) {
          console.error(`Failed to fetch Gen Ed courses for ${category}:`, err);
        }
      }
    }

    setResults((prevResults) => ({
      ...prevResults,
      genEdCourses: genEdResults,
    }));
  };

  // Modify the searchCourses function to call searchGenEdCourses
  const searchCourses = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, completedCourses }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Search failed");
      }

      const data = await response.json();
      setResults((prevResults) => ({
        ...prevResults,
        csCourses: data.csCourses,
      }));

      await searchGenEdCourses(); // Call the new Gen Ed search function
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      setError(`Search failed: ${errorMessage}`);
      console.error("Detailed error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Add this function to filter courses
  const filterAvailableCourses = (courses: SearchResult[]) => {
    if (!showOnlyAvailable) return courses;
    return courses.filter((course) => course.prerequisites_met);
  };

  // Add these new state variables with the existing ones
  const [creditRange, setCreditRange] = useState([12, 15]); // Default range

  // Update the Schedule interface to match SearchResult type
  interface Schedule {
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

  // Update the state declaration
  const [generatedSchedules, setGeneratedSchedules] = useState<Schedule[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Add this function to generate schedules
  // Replace the creditRange state with a single targetCredits state
  const [targetCredits, setTargetCredits] = useState(8); // Default 15 credits

  // Modify the generateSchedules function
  const generateSchedules = async () => {
    console.log("Generating schedules..."); // Add this log statement to check if the function is cal
    setIsGenerating(true);
    setError("");
    try {
      const allCourses = [...results.csCourses];
      Object.values(results.genEdCourses).forEach((courses) => {
        allCourses.push(...courses);
      });

      const availableCourses = showOnlyAvailable ? allCourses.filter((course) => course.prerequisites_met) : allCourses;

      const schedules: Schedule[] = [];

      // In the generateSchedules function
      const generateCombinations = async (
        courses: SearchResult[],
        currentSchedule: SearchResult[],
        currentCredits: number,
        startIndex: number
      ) => {
        // More flexible credit check (within 3 credits of target)
        if (currentCredits >= targetCredits - 3 && currentCredits <= targetCredits + 3) {
          try {
            console.log(
              "Found potential schedule:",
              currentSchedule.map((c) => c.course_id)
            );
            const sectionPromises = currentSchedule.map((course) => getScoredSections(course));
            const courseSections = await Promise.all(sectionPromises);

            if (courseSections.every((sections) => sections.length > 0)) {
              const bestSections = courseSections.map((sections) => sections[0]);

              // Log section availability
              console.log(
                "Sections found:",
                bestSections.map((s) => s.section_id)
              );

              if (!checkScheduleConflicts(bestSections)) {
                console.log("Valid schedule found!");
                const totalScore = bestSections.reduce((sum, section) => sum + section.sectionScore, 0) / bestSections.length;
                schedules.push({
                  courses: currentSchedule,
                  sections: bestSections,
                  totalScore,
                  totalCredits: currentCredits,
                });
              } else {
                console.log("Schedule had time conflicts");
              }
            } else {
              console.log("Some courses had no available sections");
            }
          } catch (error) {
            console.error("Error processing schedule:", error);
          }
        }

        // Continue searching if we haven't found enough schedules
        if (schedules.length < 5) {
          for (let i = startIndex; i < courses.length; i++) {
            const course = courses[i];
            const newCredits = currentCredits + (Number(course.credits) || 0);

            // More flexible upper credit limit
            if (newCredits <= targetCredits + 3) {
              await generateCombinations(courses, [...currentSchedule, course], newCredits, i + 1);
            }
          }
        }
      };

      // Add logging before starting combination generation
      console.log(
        "Starting schedule generation with courses:",
        availableCourses.map((c) => ({
          id: c.course_id,
          credits: c.credits,
        }))
      );
      await generateCombinations(availableCourses, [], 0, 0);

      // Sort schedules by total score and take top 5
      const sortedSchedules = schedules.sort((a, b) => b.totalScore - a.totalScore).slice(0, 5);
      console.log("Generated schedules:", sortedSchedules);
      setGeneratedSchedules(sortedSchedules);
    } catch (error) {
      setError("Failed to generate schedules: " + (error as Error).message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Update the schedule display section
  {
    generatedSchedules.length > 0 && (
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4">Possible Schedules</h3>
        <div className="space-y-8">
          {generatedSchedules.map((schedule, index) => (
            <div key={index} className="p-4 border rounded-lg">
              <h4 className="font-medium mb-4">
                Schedule {index + 1} - {schedule.totalCredits} credits (Score: {(schedule.totalScore * 100).toFixed(1)}%)
              </h4>
              <WeeklySchedule sections={schedule.sections} />
              <div className="mt-4 space-y-2">
                {schedule.courses.map((course, courseIndex) => {
                  const section = schedule.sections[courseIndex];
                  return (
                    <div key={course.course_id} className="text-sm">
                      <div className="font-medium">
                        {course.course_id} - Section {section.section_id}
                      </div>
                      <div className="text-gray-600 ml-4">
                        <div>Instructors: {section.instructors.join(", ") || "TBA"}</div>
                        <div>Meetings:</div>
                        {section.meetings.map((meeting, idx) => (
                          <div key={idx} className="ml-4">
                            {meeting.days}: {meeting.start_time} - {meeting.end_time}
                            <span className="text-gray-500 ml-2">
                              ({meeting.building} {meeting.room}){meeting.classtype && ` - ${meeting.classtype}`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Update the generate button to show loading state
  <button
    onClick={generateSchedules}
    disabled={isGenerating}
    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400"
  >
    {isGenerating ? "Generating..." : "Generate Schedules"}
  </button>;

  // Replace the credit range UI with a single slider
  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Search Section */}
      <div className="mb-12">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && searchCourses()}
          placeholder="Try: 'Show me easy programming classes' or 'I want challenging 400-level courses'"
          className="w-full p-4 text-lg border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 mb-4"
        />
        <button
          onClick={searchCourses}
          disabled={loading}
          className="w-full px-6 py-4 bg-blue-500 text-white text-lg rounded-lg hover:bg-blue-600 disabled:bg-gray-400 shadow-sm"
        >
          {loading ? "Searching..." : "Search"}
        </button>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>

      {/* Collapsible Sections */}
      <div className="space-y-4 mb-8">
        {/* Completed Courses Section */}
        <details className="bg-white rounded-lg shadow-sm">
          <summary className="p-4 font-semibold cursor-pointer hover:bg-gray-50">Completed Courses</summary>
          <div className="p-4 border-t">
            <p className="text-sm text-gray-600 mb-4">Enter the courses you've already completed (e.g., CMSC131, MATH140):</p>
            <CourseTagsInput value={completedCourses} onChange={setCompletedCourses} />
            <div className="mt-4 flex items-center gap-2">
              <input
                type="checkbox"
                id="showAvailable"
                checked={showOnlyAvailable}
                onChange={(e) => setShowOnlyAvailable(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <label htmlFor="showAvailable" className="text-sm text-gray-700">
                Show only available CMSC courses based on prerequisites
              </label>
            </div>
          </div>
        </details>

        {/* Gen-Ed Requirements Section */}
        <details className="bg-white rounded-lg shadow-sm">
          <summary className="p-4 font-semibold cursor-pointer hover:bg-gray-50">General Education Requirements</summary>
          <div className="p-4 border-t">
            <RequirementsSelector onRequirementsChange={setGenEdRequirements} />

            {/* Gen-Ed Progress */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Progress</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(results.genEdProgress.remaining).map(([category, remaining]) => (
                  <div key={category} className="bg-gray-50 p-3 rounded">
                    <h4 className="font-medium">{category}</h4>
                    <p className="text-sm">
                      {results.genEdProgress.completed[category]} / {results.genEdProgress.completed[category] + remaining} completed
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </details>
      </div>

      {/* Results Sections */}
      <div className="space-y-8">
        {/* Modified CS Courses Section */}
        <div>
          <h2 className="text-xl font-bold mb-4">Computer Science Courses</h2>
          <div className="space-y-4">
            {filterAvailableCourses(results.csCourses).map((result) => (
              <CourseCard key={result.course_id} result={result} />
            ))}
          </div>
        </div>

        {/* Gen-Ed Courses Section */}
        <div>
          <h2 className="text-xl font-bold mb-4">Recommended Gen-Ed Courses</h2>
          <div className="space-y-4">
            {Object.entries(results.genEdCourses).map(([category, courses]) => (
              <div key={category}>
                <h3 className="text-lg font-semibold mb-4">{category}</h3>
                <div className="space-y-4">
                  {courses.map((course) => (
                    <CourseCard key={course.course_id} result={course} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add this after the search button */}
      <div className="mb-8 p-4 bg-white rounded-lg shadow-sm">
        <h2 className="text-xl font-bold mb-4">Schedule Generator</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Target Credits: {targetCredits}</label>
            <input
              type="range"
              min="12"
              max="20"
              value={targetCredits}
              onChange={(e) => setTargetCredits(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <button onClick={generateSchedules} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
            Generate Schedules
          </button>
        </div>

        {/* Display generated schedules */}
        {generatedSchedules.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Possible Schedules</h3>
            <div className="space-y-6">
              {generatedSchedules.map((schedule, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">
                    Schedule {index + 1} - {schedule.courses.reduce((sum, course) => sum + (Number(course.credits) || 0), 0)} credits
                  </h4>
                  <div className="grid gap-2">
                    {schedule.courses.map((course, courseIndex) => {
                      const section = schedule.sections[courseIndex];
                      return (
                        <div key={course.course_id} className="border-b pb-2">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">
                              {course.course_id} (Section {section.number})
                            </span>
                            <span>{course.credits} credits</span>
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {section.meetings.map((meeting, idx) => (
                              <div key={idx}>
                                {meeting.days} {meeting.start_time}-{meeting.end_time}
                                <span className="text-gray-500">
                                  ({meeting.building} {meeting.room}){meeting.classtype && ` - ${meeting.classtype}`}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <WeeklySchedule sections={schedule.sections} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ... rest of your existing code ... */}
    </div>
  );
}

// Extract CourseCard to a separate component for reusability
function CourseCard({ result }: { result: SearchResult }) {
  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-gray-900">{result.course_id}</h3>
        <div className="flex gap-2">
          <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">{result.credits} credits</span>
          <span
            className={`text-sm px-2 py-1 rounded ${
              result.gpa != null && !isNaN(result.gpa)
                ? result.gpa >= 3.2
                  ? "bg-green-100 text-green-800"
                  : result.gpa >= 3.0
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            Avg. GPA: {result.gpa != null && !isNaN(result.gpa) ? result.gpa.toFixed(2) : "N/A"}
          </span>
        </div>
      </div>
      <div className="prose prose-sm max-w-none">
        <div className="whitespace-pre-wrap text-gray-700">{result.content}</div>
      </div>
      <div className="mt-4 pt-4 border-t">
        <h4 className="font-semibold text-gray-700">Prerequisites:</h4>
        <p className="text-gray-600">{result.prerequisites?.length > 0 ? result.prerequisites : "None"}</p>
      </div>
      <div className="mt-4 pt-4 border-t">
        <h4 className="font-semibold text-gray-700">Gen Ed:</h4>
        <p className="text-gray-600">{result.gen_ed?.join(", ")}</p>
      </div>
    </div>
  );
}