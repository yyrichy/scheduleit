"use client";

import { useState } from "react";
import PreferenceInput from "./components/PreferenceInput";
import ScheduleDisplay from "./components/ScheduleDisplay";
import { CourseRecommendation } from "./types";
import React from "react";
import CourseSearch from './components/CourseSearch';

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold text-center mb-8">UMD Course Search</h1>
      <CourseSearch />
    </main>
  );
}
