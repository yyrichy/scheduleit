"use client";

import React from "react";
import CourseSearch from './components/CourseSearch';

export default function Home() {
  return (
    <main className="container mx-auto min-h-screen px-4 py-16 md:px-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
            UMD Course Search
          </h1>
          <p className="text-muted-foreground mx-auto max-w-[700px] text-lg">
            Find and explore University of Maryland courses easily.
          </p>
        </div>
        <CourseSearch />
      </div>
    </main>
  );
}
