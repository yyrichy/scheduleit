'use client';

import { useSearchParams } from 'next/navigation';
import { WeeklySchedule } from '../components/WeeklySchedule';
import { Schedule } from '../types/schedule';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export default function SchedulesPage() {
  const searchParams = useSearchParams();
  const schedulesParam = searchParams.get('schedules');
  
  let schedules: Schedule[] = [];
  
  try {
    if (schedulesParam) {
      schedules = JSON.parse(decodeURIComponent(schedulesParam));
    }
  } catch (error) {
    console.error('Error parsing schedules:', error);
  }

  if (!schedules.length) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">No Schedules Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              No valid schedules were generated. Please try again with different criteria.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Generated Schedules</h1>
      <div className="relative">
        <Carousel className="w-full max-w-4xl mx-auto">
          <CarouselContent>
            {schedules.map((schedule, index) => (
              <CarouselItem key={index}>
                <Card className="mx-4">
                  <CardHeader className="bg-muted/50">
                    <CardTitle className="flex items-center justify-between">
                      <span>Schedule {index + 1} - {schedule.totalCredits} credits</span>
                      <Badge variant="secondary" className="text-sm">
                        Match: {(schedule.totalScore * 100).toFixed(1)}%
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <WeeklySchedule sections={schedule.sections} />
                    <div className="mt-6 space-y-4">
                      {schedule.courses.map((course, courseIndex) => {
                        const section = schedule.sections[courseIndex];
                        return (
                          <div key={course.course_id} className="border-t pt-4">
                            <h3 className="font-medium text-lg flex items-center justify-between">
                              {course.course_id}
                              <Badge variant="outline">Section {section.section_id}</Badge>
                            </h3>
                            <p className="text-muted-foreground mt-1">{course.content}</p>
                            <div className="mt-2 text-sm">
                              <p className="font-medium">
                                Instructors: {section.instructors.join(', ') || 'TBA'}
                              </p>
                              <div className="mt-1">
                                <p className="font-medium">Meetings:</p>
                                {section.meetings.map((meeting, idx) => (
                                  <p key={idx} className="ml-4">
                                    <span className="font-medium">{meeting.days}:</span>{' '}
                                    {meeting.start_time} - {meeting.end_time}
                                    <span className="text-muted-foreground ml-2">
                                      ({meeting.building} {meeting.room})
                                      {meeting.classtype && ` - ${meeting.classtype}`}
                                    </span>
                                  </p>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex" />
          <CarouselNext className="hidden md:flex" />
        </Carousel>
        <div className="mt-4 text-center text-sm text-muted-foreground">
          Swipe or use arrow keys to view more schedules
        </div>
      </div>
    </div>
  );
}