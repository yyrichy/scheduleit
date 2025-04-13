'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { WeeklySchedule } from '../../../components/WeeklySchedule';
import { Schedule } from '../../../types/schedule';
import { SearchResult } from '../../../utils/courseQuery';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function EditSchedulePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    const storedSchedules = localStorage.getItem('generatedSchedules');
    if (storedSchedules) {
      const schedules = JSON.parse(storedSchedules);
      setSchedule(schedules[parseInt(params.id)]);
    }
  }, [params.id]);

  const handleSearch = async () => {
    try {
      const response = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery }),
      });
      if (!response.ok) throw new Error("Search failed");
      const data = await response.json();
      setSearchResults(data.csCourses);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const handleRemoveCourse = (courseId: string) => {
    if (!schedule) return;
    
    const newSchedule = {
      ...schedule,
      courses: schedule.courses.filter(c => c.course_id !== courseId),
      sections: schedule.sections.filter(s => s.course !== courseId)
    };
    
    setSchedule(newSchedule);
    // Update localStorage
    const schedules = JSON.parse(localStorage.getItem('generatedSchedules') || '[]');
    schedules[parseInt(params.id)] = newSchedule;
    localStorage.setItem('generatedSchedules', JSON.stringify(schedules));
  };

  if (!schedule) return <div>Loading...</div>;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => router.back()}
          className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-white rounded-lg border shadow-sm hover:shadow-md transition-all"
        >
          ← Back
        </button>
        <h1 className="text-3xl font-bold">Edit Schedule</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <WeeklySchedule 
                sections={schedule.sections}
                editable={true}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch}>Search</Button>
              </div>
              
              <div className="mt-4 space-y-2">
                {searchResults.map((course) => (
                  <div key={course.course_id} className="p-2 border rounded hover:bg-muted">
                    <div className="font-medium">{course.course_id}</div>
                    <div className="text-sm text-muted-foreground">{course.content}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Current Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {schedule.courses.map((course) => (
                  <div key={course.course_id} className="flex items-center justify-between p-2 border rounded">
                    <span>{course.course_id}</span>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveCourse(course.course_id)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}