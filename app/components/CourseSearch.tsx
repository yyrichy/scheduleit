'use client';

import React from "react";
import { useState } from "react";
import RequirementsSelector from "./RequirementsSelector";
import { GenEdRequirements } from "../types/schedule";
import { SearchResult } from "../utils/courseQuery";
import { CourseTagsInput } from "./CourseTagsInput";

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
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);  // Add this line
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

  console.log("results ", results);

  // Add this function to filter courses
  const filterAvailableCourses = (courses: SearchResult[]) => {
    if (!showOnlyAvailable) return courses;
    return courses.filter(course => course.prerequisites_met);
  };

  // Modify the return statement where you render CS courses
  return (
    <div className="max-w-4xl mx-auto p-4">
      <RequirementsSelector onRequirementsChange={setGenEdRequirements} />

      <div className="mb-8">
        <div className="flex flex-col gap-4">
          <CourseTagsInput value={completedCourses} onChange={setCompletedCourses} />
          
          {/* Add this checkbox */}
          <div className="flex items-center gap-2">
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

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && searchCourses()}
            placeholder="Try: 'Show me easy programming classes' or 'I want challenging 400-level courses'"
            className="p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={searchCourses}
            disabled={loading}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 shadow-sm"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Gen-Ed Progress</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(results.genEdProgress.remaining).map(([category, remaining]) => (
            <div key={category} className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-semibold">{category}</h3>
              <p className="text-sm">
                {results.genEdProgress.completed[category]} / {results.genEdProgress.completed[category] + remaining} completed
              </p>
            </div>
          ))}
        </div>
      </div>

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
                ? result.gpa >= 3.5
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