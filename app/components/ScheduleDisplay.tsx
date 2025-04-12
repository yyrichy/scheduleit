import React from "react";
import { CourseRecommendation } from '../types';

interface Props {
  recommendations: CourseRecommendation | null;
}

export default function ScheduleDisplay({ recommendations }: Props) {
  if (!recommendations) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-gray-500 text-center">Enter your preferences to get course recommendations</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Recommended Schedule</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Recommended Courses</h3>
        <ul className="space-y-3">
          {recommendations.courseRecommendations.map((rec, i) => (
            <li key={i} className="border-b pb-2">
              <span className="font-medium">{rec.courseId}</span>
              <p className="text-sm text-gray-600">{rec.reasoning}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Technical Fit</h3>
        <p className="text-gray-700">{recommendations.technicalFit}</p>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-2">Career Path</h3>
        <p className="text-gray-700">{recommendations.careerPath}</p>
      </div>
    </div>
  );
}