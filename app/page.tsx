"use client";

import React from "react";
import CourseSearch from './components/CourseSearch';

export default function Home() {
  return (
    <div className="min-h-screen bg-red-50">
      <div className="container mx-auto py-16 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h1 className="text-5xl font-bold text-red-800">TestudoMatch 🐢</h1>
          <p className="text-xl text-red-600">Find your perfect class schedule match at UMD. Swipe right on courses not people</p>
          <CourseSearch />
        </div>
      </div>
    </div>
  );
}
