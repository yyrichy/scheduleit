'use client';

import React from "react";
import { useState } from 'react';

export default function CourseSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchCourses = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, limit: 5 }),
      });
      const data = await response.json();
      setResults(data.results);
    } catch (error) {
      console.error('Failed to search courses:', error);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search courses..."
          className="flex-1 p-2 border rounded"
        />
        <button
          onClick={searchCourses}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      <div className="space-y-4">
        {results.map((result: any) => (
          <div key={result.course_id} className="border p-4 rounded">
            <h3 className="font-bold">{result.course_id}</h3>
            <pre className="whitespace-pre-wrap text-sm mt-2">{result.content}</pre>
            <p className="mt-2">
              <span className="font-semibold">Prerequisites:</span>{' '}
              {result.prerequisites.join(', ') || 'None'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}