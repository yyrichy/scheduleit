import React from 'react';
import { Section } from '../types/section';
import { cn } from "@/lib/utils";

interface WeeklyScheduleProps {
  sections: Section[];
}

export function WeeklySchedule({ sections }: WeeklyScheduleProps) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const hours = Array.from({ length: 14 }, (_, i) => i + 8); // 8 AM to 9 PM

  const parseTime = (timeStr: string) => {
    const [time, period] = timeStr.split(/(?=[AP]M)/i);
    const [hours, minutes] = time.split(':').map(Number);
    let hour = hours;
    
    if (period.toLowerCase() === 'pm' && hours !== 12) {
      hour += 12;
    } else if (period.toLowerCase() === 'am' && hours === 12) {
      hour = 0;
    }
    
    return { hour, minutes };
  };

  const getCoursesForTimeAndDay = (hour: number, day: string) => {
    const shortDay = day[0] + (day === 'Thursday' ? 'h' : '');
    return sections.filter(section => {
      return section.meetings.some(meeting => {
        if (!meeting.days.includes(shortDay)) return false;
        
        const startTime = parseTime(meeting.start_time);
        const endTime = parseTime(meeting.end_time);
        
        // Check if current hour falls within the course time
        if (startTime.hour <= hour && hour < endTime.hour) {
          return true;
        }
        
        // Handle edge case for courses ending exactly on the hour
        if (hour === endTime.hour && endTime.minutes === 0) {
          return false;
        }
        
        return false;
      });
    });
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="grid grid-cols-6 text-sm">
        {/* Header */}
        <div className="border-b bg-muted/50 p-2 text-center font-semibold">
          Time
        </div>
        {days.map((day) => (
          <div
            key={day}
            className="border-b bg-muted/50 p-2 text-center font-semibold"
          >
            {day}
          </div>
        ))}

        {/* Time slots */}
        {hours.map((hour) => (
          <React.Fragment key={hour}>
            {/* Time column */}
            <div className="border-b border-r p-2 text-sm text-muted-foreground">
              {hour === 12 ? '12:00 PM' : hour > 12 ? `${hour-12}:00 PM` : `${hour}:00 AM`}
            </div>

            {/* Day columns */}
            {days.map((day) => {
              const courses = getCoursesForTimeAndDay(hour, day);
              return (
                <div
                  key={`${day}-${hour}`}
                  className={cn(
                    "border-b border-r p-2 relative min-h-[3rem]",
                    courses.length > 0 && "bg-primary/10"
                  )}
                >
                  {courses.map((course) => (
                    <div
                      key={course.section_id}
                      className="absolute inset-1 rounded-md bg-primary/20 p-1 text-xs"
                    >
                      <div className="font-medium">{course.course}</div>
                      <div className="text-muted-foreground text-[10px]">
                        {course.meetings[0].start_time} - {course.meetings[0].end_time}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}