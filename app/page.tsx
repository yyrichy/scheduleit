"use client";

import React from "react";
import CourseSearch from './components/CourseSearch';

export default function Home() {
  return (
    <div className="min-h-screen bg-red-50">
      <div className="container mx-auto py-16 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h1 className="text-5xl font-bold text-red-800">
            Testudo Match 🐢
          </h1>
          <p className="text-xl text-red-600">
            Find your perfect class schedule match at UMD.
            We all know you aren't finding the other type of match anyways. 
          </p>
          <CourseSearch />
        </div>
      </div>
    </div>
  );
}
