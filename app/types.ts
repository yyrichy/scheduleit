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