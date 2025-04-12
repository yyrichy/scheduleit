interface CourseTag {
  tag: string;
  courses: string[];
  keywords: string[];
}

export const courseTags: CourseTag[] = [
  {
    tag: "algorithms",
    courses: ["CMSC351", "CMSC420", "CMSC451"],
    keywords: ["algorithms", "data structures", "advanced data structures"]
  },
  {
    tag: "ai",
    courses: ["CMSC421", "CMSC422"],
    keywords: ["artificial intelligence", "ai", "machine learning"]
  },
  {
    tag: "databases",
    courses: ["CMSC424"],
    keywords: ["database", "sql", "data management"]
  },
  {
    tag: "systems",
    courses: ["CMSC412", "CMSC414", "CMSC417"],
    keywords: ["operating systems", "networks", "distributed systems"]
  }
  // Add more mappings as needed
];

export function getCoursesFromTags(tags: string[]): string[] {
  const courses = new Set<string>();
  
  tags.forEach(tag => {
    const matchingTags = courseTags.filter(ct => 
      ct.tag === tag.toLowerCase() || 
      ct.keywords.some(k => k === tag.toLowerCase())
    );
    
    matchingTags.forEach(mt => {
      mt.courses.forEach(course => courses.add(course));
    });
  });

  return Array.from(courses);
}