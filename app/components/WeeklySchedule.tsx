import React from 'react';
import { Section } from '../types/section';
import { cn } from "@/lib/utils";

interface WeeklyScheduleProps {
  sections: Section[];
}

export function WeeklySchedule({ sections }: WeeklyScheduleProps) {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const hours = Array.from({ length: 14 }, (_, i) => i + 8); // 8 AM to 9 PM

  // Store course colors in a map for consistency within a session
  const courseColorMap = React.useRef(new Map<string, string>());

  const getBlockColor = (courseId: string) => {
    if (courseColorMap.current.has(courseId)) {
      return courseColorMap.current.get(courseId)!;
    }

    const colors = [
      "bg-red-200",
      "bg-pink-200",
      "bg-purple-200",
      "bg-indigo-200",
      "bg-blue-200",
      "bg-cyan-200",
      "bg-teal-200",
      "bg-emerald-200",
      "bg-green-200",
      "bg-lime-200",
      "bg-yellow-200",
      "bg-amber-200",
      "bg-orange-200",
      "bg-rose-200",
      "bg-fuchsia-200",
      "bg-violet-200",
      "bg-sky-200",
      "bg-slate-200",
      "bg-zinc-200",
    ];

    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    courseColorMap.current.set(courseId, randomColor);
    return randomColor;
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

  const getCoursesForDay = (day: string) => {
    const shortDay = day[0] + (day === "Thursday" ? "h" : "");
    return sections.filter((section) => section.meetings.some((meeting) => meeting.days.includes(shortDay)));
  };

  return (
    <div className="space-y-4">
      <div className="border rounded-lg overflow-hidden">
        <div className="grid grid-cols-6 text-sm">
          {/* Header remains the same */}

          {/* Time slots */}
          {hours.map((hour) => (
            <React.Fragment key={hour}>
              <div className="border-b border-r p-2 text-sm text-muted-foreground">
                {hour === 12 ? "12:00 PM" : hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 AM`}
              </div>

              {days.map((day) => {
                const courses = getCoursesForDay(day);
                return (
                  <div key={`${day}-${hour}`} className="border-b border-r p-2 relative min-h-[4rem]">
                    {courses.map((course) => {
                      const timing = course.meetings[0];
                      const startTime = parseTime(timing.start_time);
                      const endTime = parseTime(timing.end_time);

                      // Only render if this course starts in this hour
                      if (startTime.hour !== hour) return null;

                      const durationInHours = (endTime.hour * 60 + endTime.minutes - (startTime.hour * 60 + startTime.minutes)) / 60;
                      const offsetPercent = (startTime.minutes / 60) * 100;

                      return (
                        <div
                          key={course.section_id}
                          className={cn("absolute rounded-md p-1 text-xs overflow-hidden whitespace-nowrap", getBlockColor(course.course))}
                          style={{
                            top: `${offsetPercent}%`,
                            left: "4px",
                            right: "4px",
                            height: `${durationInHours * 100}%`,
                            minHeight: "2rem",
                            zIndex: 10,
                          }}
                          title={`${course.course}\n${timing.start_time} - ${timing.end_time}`}
                        >
                          <div className="font-medium text-ellipsis overflow-hidden">{course.course}</div>
                          <div className="text-muted-foreground text-[10px] text-ellipsis overflow-hidden">
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

      {/* Online/Asynchronous section remains the same */}
    </div>
  );
}