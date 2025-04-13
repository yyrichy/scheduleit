import React from 'react';
import { Section } from '../types/section';
import { cn } from "@/lib/utils";

interface WeeklyScheduleProps {
  sections: Section[];
}

export function WeeklySchedule({ sections }: WeeklyScheduleProps) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const hours = Array.from({ length: 14 }, (_, i) => i + 8); // 8 AM to 9 PM

  const getBlockColor = (courseId: string) => {
    const prefix = courseId.split(/[0-9]/)[0];
    
    // Generate a consistent "random" color based on the prefix
    let hash = 0;
    for (let i = 0; i < prefix.length; i++) {
      hash = prefix.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Use modulo to select from available Tailwind colors
    const colors = [
      'bg-red-200', 'bg-pink-200', 'bg-purple-200', 'bg-indigo-200', 
      'bg-blue-200', 'bg-cyan-200', 'bg-teal-200', 'bg-emerald-200',
      'bg-green-200', 'bg-lime-200', 'bg-yellow-200', 'bg-amber-200',
      'bg-orange-200', 'bg-rose-200', 'bg-fuchsia-200', 'bg-violet-200',
      'bg-sky-200', 'bg-slate-200', 'bg-zinc-200'
    ];
    
    return colors[Math.abs(hash) % colors.length];
  };

  const parseTime = (timeStr: string) => {
    const [time, period] = timeStr.split(/(?=[AP]M)/i);
    const [hours, minutes] = time.split(":").map(Number);
    let hour = hours;

    // For PM times, add 12 to convert to 24-hour format (except for 12 PM)
    if (period.toLowerCase() === "pm" && hours !== 12) {
      hour += 12;
    } else if (period.toLowerCase() === "am" && hours === 12) {
      hour = 0;
    }

    return { hour, minutes };
  };

  const getCoursesForTimeAndDay = (hour: number, day: string) => {
    const shortDay = day[0] + (day === "Thursday" ? "h" : "");
    return sections.filter((section) => {
      return section.meetings.some((meeting) => {
        if (!meeting.days.includes(shortDay)) return false;

        const startTime = parseTime(meeting.start_time);
        const endTime = parseTime(meeting.end_time);

        // Convert everything to minutes for easier comparison
        const currentTimeInMinutes = hour * 60;
        const startTimeInMinutes = startTime.hour * 60 + startTime.minutes;
        const endTimeInMinutes = endTime.hour * 60 + endTime.minutes;

        return currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes < endTimeInMinutes;
      });
    });
  };

  return (
    <div className="space-y-4">
      <div className="border rounded-lg overflow-hidden">
        <div className="grid grid-cols-6 text-sm">
          {/* Header */}
          <div className="border-b bg-muted/50 p-2 text-center font-semibold">Time</div>
          {days.map((day) => (
            <div key={day} className="border-b bg-muted/50 p-2 text-center font-semibold">
              {day}
            </div>
          ))}

          {/* Time slots */}
          {hours.map((hour) => (
            <React.Fragment key={hour}>
              <div className="border-b border-r p-2 text-sm text-muted-foreground">
                {hour === 12 ? "12:00 PM" : hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 AM`}
              </div>

              {days.map((day) => {
                const courses = getCoursesForTimeAndDay(hour, day);
                return (
                  <div key={`${day}-${hour}`} className="border-b border-r p-2 relative min-h-[4rem]">
                    {courses.map((course) => {
                      const timing = course.meetings[0];
                      const startTime = parseTime(timing.start_time);
                      const endTime = parseTime(timing.end_time);
                      const durationInHours = (endTime.hour * 60 + endTime.minutes - (startTime.hour * 60 + startTime.minutes)) / 60;
                      const offsetPercent = (startTime.minutes / 60) * 100;

                      return (
                        <div
                          key={course.section_id}
                          className={cn("absolute rounded-md p-1 text-xs", getBlockColor(course.course))}
                          style={{
                            top: `${offsetPercent}%`,
                            left: "4px",
                            right: "4px",
                            height: `${durationInHours * 100}%`,
                            minHeight: "2rem",
                            zIndex: 10,
                          }}
                        >
                          <div className="font-medium">{course.course}</div>
                          <div className="text-muted-foreground text-[10px]">
                            {timing.start_time} - {timing.end_time}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Online/Asynchronous Courses Section */}
      {sections.some((section) => !section.meetings.length || section.meetings.every((m) => !m.days)) && (
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2">Online/Asynchronous Courses</h3>
          <div className="space-y-2">
            {sections
              .filter((section) => !section.meetings.length || section.meetings.every((m) => !m.days))
              .map((course) => (
                <div key={course.section_id} className={`${getBlockColor(course.course)} rounded-md p-2`}>
                  <div className="font-medium">{course.course}</div>
                  <div className="text-xs text-muted-foreground">Online/Asynchronous</div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}