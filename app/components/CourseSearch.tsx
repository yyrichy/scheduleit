'use client';

import React from "react";
import { useState } from "react";
import { useRouter } from 'next/navigation';
import { Heart } from "lucide-react"; // Add this import
import RequirementsSelector from "./RequirementsSelector";
import { GenEdRequirements, Schedule, SearchResults } from "../types/schedule";
import { SearchResult } from "../utils/courseQuery";
import { CourseTagsInput } from "./CourseTagsInput";
import { checkScheduleConflicts, getScoredSections } from "../utils/sectionUtils";
import { ScoredSection } from "../types/section";
import { WeeklySchedule } from "./WeeklySchedule";

export default function CourseSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [completedCourses, setCompletedCourses] = useState<string[]>([]);
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);
  const [targetCredits, setTargetCredits] = useState(15);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<SearchResults>({
    csCourses: [],
    genEdCourses: {},
    genEdProgress: {
      completed: {
        DSHS: 0, DSHU: 0, DSNS: 0, DSNL: 0,
        DSSP: 0, DVCC: 0, DVUP: 0, SCIS: 0,
      },
      remaining: {
        DSHS: 0, DSHU: 0, DSNS: 0, DSNL: 0,
        DSSP: 0, DVCC: 0, DVUP: 0, SCIS: 0,
      },
    },
  });
  const [genEdRequirements, setGenEdRequirements] = useState<GenEdRequirements>({
    DSHS: 0, DSHU: 0, DSNS: 0, DSNL: 0,
    DSSP: 0, DVCC: 0, DVUP: 0, SCIS: 0,
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
          if (!response.ok) throw new Error("Gen Ed search failed");
          genEdResults[category] = await response.json();
        } catch (err) {
          console.error(`Failed to fetch Gen Ed courses for ${category}:`, err);
        }
      }
    }
    setResults(prev => ({ ...prev, genEdCourses: genEdResults }));
  };

  const searchCourses = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/cs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, completedCourses }),
      });
      if (!response.ok) throw new Error("Search failed");
      const data = await response.json();
      setResults(prev => ({ ...prev, csCourses: data.csCourses }));
      await searchGenEdCourses();
    } catch (err) {
      setError(`Search failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const filterAvailableCourses = (courses: SearchResult[]) => {
    return showOnlyAvailable ? courses.filter(course => course.prerequisites_met) : courses;
  };

  const generateSchedules = async () => {
    setIsGenerating(true);
    setError("");
    try {
      const allCourses = [
        ...results.csCourses,
        ...Object.values(results.genEdCourses)
          .flat()
          .map((course) => ({
            ...course,
            gen_ed: Array.isArray(course.gen_ed) ? course.gen_ed : [course.gen_ed],
            credits: typeof course.credits === "string" ? parseInt(course.credits) : course.credits,
          })),
      ];

      const availableCourses = showOnlyAvailable ? allCourses.filter((course) => course.prerequisites_met) : allCourses;

      const courseSectionsMap = new Map();
      await Promise.all(
        availableCourses.map(async (course) => {
          const sections = await getScoredSections(course);
          courseSectionsMap.set(course.course_id, sections);
        })
      );

      const schedules: Schedule[] = [];

      const generateCombinations = async (
        courses: SearchResult[],
        currentSchedule: SearchResult[],
        currentCredits: number,
        startIndex: number,
        usedGenEds: Set<string> = new Set()
      ) => {
        if (currentCredits >= targetCredits - 2 && currentCredits <= targetCredits + 2) {
          const sections = currentSchedule.map((course) => courseSectionsMap.get(course.course_id)[0]).filter(Boolean);

          if (sections.length === currentSchedule.length && !checkScheduleConflicts(sections)) {
            // Calculate diversity score based on unique gen eds
            const uniqueGenEds = new Set(currentSchedule.flatMap((course) => course.gen_ed || []));
            const diversityScore = uniqueGenEds.size / (currentSchedule.length || 1);

            const totalScore =
              (sections.reduce((sum, section) => sum + section.sectionScore, 0) / sections.length) * 0.8 + diversityScore * 0.2;

            schedules.push({
              courses: currentSchedule,
              sections,
              totalScore,
              totalCredits: currentCredits,
            });
          }
        }

        for (let i = startIndex; i < courses.length; i++) {
          const course = courses[i];
          const newCredits = currentCredits + (Number(course.credits) || 0);

          // Skip if this course's gen eds are already used in this schedule
          if (course.gen_ed && course.gen_ed.some((ge) => usedGenEds.has(ge))) continue;

          if (newCredits <= targetCredits + 2) {
            const newUsedGenEds = new Set(usedGenEds);
            if (course.gen_ed) {
              course.gen_ed.forEach((ge) => newUsedGenEds.add(ge));
            }
            await generateCombinations(courses, [...currentSchedule, course], newCredits, i + 1, newUsedGenEds);
          }
        }

        // Periodically sort and limit schedules
        if (schedules.length > 10) {
          schedules.sort((a, b) => b.totalScore - a.totalScore);
          schedules.length = 5;
        }
      };

      await generateCombinations(availableCourses, [], 0, 0);

      const sortedSchedules = schedules.sort((a, b) => b.totalScore - a.totalScore).slice(0, 5);

      localStorage.setItem("generatedSchedules", JSON.stringify(sortedSchedules));
      router.push("/schedules");
    } catch (error) {
      setError("Failed to generate schedules: " + (error as Error).message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-12">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && searchCourses()}
          placeholder="What kind of classes are you looking for? 😊"
          className="w-full p-4 text-lg border border-red-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-red-400 focus:border-red-400 bg-white/80 text-red-800 placeholder:text-red-300"
        />
        <button
          onClick={searchCourses}
          disabled={loading}
          className="w-full px-6 py-4 mt-4 bg-gradient-to-r from-red-600 to-red-800 text-white text-lg rounded-full hover:opacity-90 disabled:opacity-50 shadow-lg transition-all duration-200 font-semibold"
        >
          {loading ? "Searching for your match..." : "Find My Match 💝"}
        </button>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>

      <div className="space-y-4 mb-8">
        <details className="bg-white rounded-xl shadow-sm border border-red-100">
          <summary className="p-4 font-semibold cursor-pointer hover:bg-red-50 text-red-800 rounded-xl">
            Your Course History 📚
          </summary>
          <div className="p-4 border-t border-red-100">
            <p className="text-sm text-red-600 mb-4">
              Tell us about your academic journey so far:
            </p>
            <CourseTagsInput value={completedCourses} onChange={setCompletedCourses} />
            <div className="mt-4 flex items-center gap-2">
              <input
                type="checkbox"
                id="showAvailable"
                checked={showOnlyAvailable}
                onChange={(e) => setShowOnlyAvailable(e.target.checked)}
                className="h-4 w-4 rounded border-red-300 text-red-600 focus:ring-red-500"
              />
              <label htmlFor="showAvailable" className="text-sm text-red-700">
                Show available matches only
              </label>
            </div>
          </div>
        </details>

        <details className="bg-white rounded-lg shadow-sm">
          <summary className="p-4 font-semibold cursor-pointer hover:bg-gray-50">
            Completed Courses
          </summary>
          <div className="p-4 border-t">
            <p className="text-sm text-gray-600 mb-4">
              Enter the courses you've already completed (e.g., CMSC131, MATH140):
            </p>
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

        <details className="bg-white rounded-lg shadow-sm">
          <summary className="p-4 font-semibold cursor-pointer hover:bg-gray-50">
            General Education Requirements
          </summary>
          <div className="p-4 border-t">
            <RequirementsSelector onRequirementsChange={setGenEdRequirements} />
          </div>
        </details>
      </div>

      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-bold mb-4">Computer Science Courses</h2>
          <div className="space-y-4">
            {filterAvailableCourses(results.csCourses).map((result) => (
              <CourseCard key={result.course_id} result={result} />
            ))}
          </div>
        </div>

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

      <div className="mb-8 p-4 bg-white rounded-lg shadow-sm">
        <h2 className="text-xl font-bold mb-4">Schedule Generator</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-red-700 mb-2">
              Desired Credits: {targetCredits}
            </label>
            <input
              type="range"
              min="8"
              max="20"
              value={targetCredits}
              onChange={(e) => setTargetCredits(Number(e.target.value))}
              className="w-full accent-red-600"
            />
          </div>
          <button
            onClick={generateSchedules}
            disabled={isGenerating}
            className="w-full px-6 py-4 bg-gradient-to-r from-red-600 to-red-800 text-white text-lg rounded-full hover:opacity-90 disabled:opacity-50 shadow-lg transition-all duration-200 font-semibold flex items-center justify-center gap-2"
          >
            <Heart className="w-5 h-5" />
            {isGenerating ? "Finding your matches..." : "Generate My Matches"}
          </button>
        </div>
      </div>
    </div>
  );
}

function CourseCard({ result }: { result: SearchResult }) {
  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-gray-900">{result.course_id}</h3>
        <div className="flex gap-2">
          <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
            {result.credits} credits
          </span>
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
        <p className="text-gray-600">
          {result.prerequisites?.length > 0 ? result.prerequisites : "None"}
        </p>
      </div>
      <div className="mt-4 pt-4 border-t">
        <h4 className="font-semibold text-gray-700">Gen Ed:</h4>
        <p className="text-gray-600">{result.gen_ed?.join(", ")}</p>
      </div>
    </div>
  );
}