'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { WeeklySchedule } from '../components/WeeklySchedule';
import { Schedule } from '../types/schedule';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../components/ui/carousel";
import Link from 'next/link';
import { Heart, X } from "lucide-react";
import React from "react";

export default function SchedulesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  useEffect(() => {
    try {
      // First try to get schedules from URL parameters
      const schedulesParam = searchParams.get('schedules');
      if (schedulesParam) {
        const parsedSchedules = JSON.parse(decodeURIComponent(schedulesParam));
        setSchedules(parsedSchedules);
        return;
      }

      // If no URL parameters, try localStorage
      const storedSchedules = localStorage.getItem('generatedSchedules');
      if (storedSchedules) {
        setSchedules(JSON.parse(storedSchedules));
      }
    } catch (error) {
      console.error('Error loading schedules:', error);
    }
  }, [searchParams]);

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
      <div className="flex items-center mb-8">
        <button
          onClick={() => router.back()}
          className="absolute px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-white rounded-lg border shadow-sm hover:shadow-md transition-all"
        >
          ← Back to Search
        </button>
        <h1 className="text-3xl font-bold w-full text-center">Your Schedule Matches</h1>
      </div>
      
      <div className="relative">
        <Carousel className="w-full max-w-4xl mx-auto">
          <CarouselContent>
            {schedules.map((schedule, index) => (
              <CarouselItem key={index}>
                <Card className="mx-4">
                  <CardHeader className="bg-muted/50">
                    <CardTitle className="flex items-center justify-between">
                      <span>Schedule {index + 1} - {schedule.totalCredits} credits</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-sm">
                          Match: {(schedule.totalScore * 100).toFixed(1)}%
                        </Badge>
                        <Link
                          href={`/schedules/edit/${index}`}
                          className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                        >
                          Edit Schedule
                        </Link>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <WeeklySchedule sections={schedule.sections} />
                    <div className="mt-6 space-y-4">
                      {schedule.courses.map((course, courseIndex) => {
                        const section = schedule.sections[courseIndex];
                        return (
                          <details key={course.course_id} className="border-t pt-4">
                            <summary className="font-medium text-lg flex items-center justify-between cursor-pointer hover:opacity-80">
                              <span>{course.course_id}</span>
                              <Badge variant="outline">Section {section.section_id}</Badge>
                            </summary>
                            <div className="mt-4">
                              <p className="text-muted-foreground">{course.content}</p>
                              <div className="mt-2 text-sm">
                                <p className="font-medium">Instructors: {section.instructors.join(", ") || "TBA"}</p>
                                <div className="mt-1">
                                  <p className="font-medium">Meetings:</p>
                                  {section.meetings.map((meeting, idx) => (
                                    <p key={idx} className="ml-4">
                                      {meeting.days ? (
                                        <>
                                          <span className="font-medium">{meeting.days}:</span> {meeting.start_time} - {meeting.end_time}
                                          <span className="text-muted-foreground ml-2">
                                            ({meeting.building} {meeting.room}){meeting.classtype && ` - ${meeting.classtype}`}
                                          </span>
                                        </>
                                      ) : (
                                        <span className="font-medium">Online</span>
                                      )}
                                    </p>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </details>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex h-12 w-12 bg-white border-red-200 text-red-600 hover:bg-red-100">
            <X className="h-8 w-8" />
          </CarouselPrevious>
          <CarouselNext className="hidden md:flex h-12 w-12 bg-white border-red-200 text-red-600 hover:bg-red-100">
            <Heart className="h-8 w-8" />
          </CarouselNext>
        </Carousel>
        <div className="mt-4 text-center text-sm text-muted-foreground">
          Swipe or use arrow keys to view more schedules
        </div>
      </div>
    </div>
  );
}