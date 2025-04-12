export interface CourseRecommendation {
  courseRecommendations: {
    courseId: string;
    reasoning: string;
  }[];
  preferences: {
    lightLoad: boolean;
    preferHighGPA: boolean;
    avoidEarlyMorning: boolean;
    avoidEvenings: boolean;
  };
  technicalFit: string;
  careerPath: string;
}

export interface Course {
  courseId: string;
  name: string;
  description: string;
  credits: number;
  prerequisites: string[];
  averageGPA: number;
}

export interface PlanetTerpCourse {
  department: string;
  course_number: number; // ex 436
  title: string; // ex Programming Handheld Systems
  description: string;
  credits: number;
  average_gpa: number;
  professors: string[];
  name: string; // ex CMSC436
}