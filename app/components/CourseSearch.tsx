'use client';

import React from "react";
import { useState } from "react";

interface SearchResult {
  course_id: string;
  content: string;
  credits: number;
  prerequisites: string[];
  gpa: number;
}

export default function CourseSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const searchCourses = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Search failed");
      }

      const data = await response.json();
      setResults(data.results);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      setError(`Search failed: ${errorMessage}`);
      console.error("Detailed error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-8">
        <div className="flex flex-col gap-4">
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

      <div className="space-y-6">
        {results.map((result) => (
          <div key={result.course_id} className="bg-white p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-900">{result.course_id}</h3>
              <div className="flex gap-2">
                <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">{result.credits} credits</span>
                <span
                  className={`text-sm px-2 py-1 rounded ${
                    result.gpa >= 3.5
                      ? "bg-green-100 text-green-800"
                      : result.gpa >= 3.0
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  Avg. GPA: {result.gpa.toFixed(2)}
                </span>
              </div>
            </div>
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-gray-700">{result.content}</div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <h4 className="font-semibold text-gray-700">Prerequisites:</h4>
              <p className="text-gray-600">{result.prerequisites?.length > 0 ? result.prerequisites.join(", ") : "None"}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}