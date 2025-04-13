'use client';

import { useSearchParams } from 'next/navigation';
import { WeeklySchedule } from '../components/WeeklySchedule';
import { Schedule } from "@/types/schedule";

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
      <div className="max-w-4xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">No Schedules Found</h1>
        <p>No valid schedules were generated. Please try again with different criteria.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Generated Schedules</h1>
      <div className="space-y-8">
        {schedules.map((schedule, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">
              Schedule {index + 1} - {schedule.totalCredits} credits 
              <span className="text-gray-600 ml-2">
                (Schedule Match: {(schedule.totalScore * 100).toFixed(1)}%)
              </span>
            </h2>
            <WeeklySchedule sections={schedule.sections} />
            <div className="mt-6 space-y-4">
              {schedule.courses.map((course, courseIndex) => {
                const section = schedule.sections[courseIndex];
                return (
                  <div key={course.course_id} className="border-t pt-4">
                    <h3 className="font-medium text-lg">
                      {course.course_id} - Section {section.section_id}
                    </h3>
                    <p className="text-gray-600 mt-1">{course.content}</p>
                    <div className="mt-2 text-sm text-gray-700">
                      <p>Instructors: {section.instructors.join(', ') || 'TBA'}</p>
                      <div className="mt-1">
                        <p className="font-medium">Meetings:</p>
                        {section.meetings.map((meeting, idx) => (
                          <p key={idx} className="ml-4">
                            {meeting.days}: {meeting.start_time} - {meeting.end_time}
                            <span className="text-gray-500 ml-2">
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
          </div>
        ))}
      </div>
    </div>
  );
}