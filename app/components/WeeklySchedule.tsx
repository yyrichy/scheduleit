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
    switch (prefix) {
      // Cultural and Ethnic Studies
      case 'AAAS': return 'bg-rose-200';
      case 'AAST': return 'bg-pink-200';
      case 'AMST': return 'bg-purple-200';
      case 'USLT': return 'bg-fuchsia-200';
      case 'WGSS': return 'bg-violet-200';

      // Sciences
      case 'BCHM': return 'bg-blue-200';
      case 'BIOE': return 'bg-cyan-200';
      case 'BIOL': return 'bg-teal-200';
      case 'BSCI': return 'bg-emerald-200';
      case 'CHEM': return 'bg-green-200';
      case 'CMSC': return 'bg-sky-200';
      case 'PHYS': return 'bg-indigo-200';

      // Business and Economics
      case 'BMGT': return 'bg-amber-200';
      case 'BUSI': return 'bg-yellow-200';
      case 'ECON': return 'bg-orange-200';
      case 'BUAC': return 'bg-lime-200';
      case 'BUFN': return 'bg-green-200';

      // Social Sciences
      case 'ANTH': return 'bg-red-200';
      case 'BSOS': return 'bg-orange-200';
      case 'CCJS': return 'bg-amber-200';
      case 'GVPT': return 'bg-yellow-200';
      case 'PSYC': return 'bg-lime-200';
      case 'SOCY': return 'bg-emerald-200';

      // Engineering
      case 'ENAE': return 'bg-blue-200';
      case 'ENCE': return 'bg-sky-200';
      case 'ENEE': return 'bg-cyan-200';
      case 'ENES': return 'bg-teal-200';
      case 'ENME': return 'bg-emerald-200';

      // Arts and Humanities
      case 'ARTH': return 'bg-purple-200';
      case 'ARTT': return 'bg-fuchsia-200';
      case 'ENGL': return 'bg-violet-200';
      case 'HIST': return 'bg-indigo-200';
      case 'MUSC': return 'bg-slate-200';

      // Languages
      case 'CHIN': return 'bg-red-200';
      case 'FREN': return 'bg-blue-200';
      case 'GERM': return 'bg-yellow-200';
      case 'JAPN': return 'bg-pink-200';
      case 'SPAN': return 'bg-orange-200';

      // Other Common Departments
      case 'MATH': return 'bg-violet-200';
      case 'STAT': return 'bg-purple-200';
      case 'COMM': return 'bg-rose-200';
      case 'EDUC': return 'bg-sky-200';
      case 'KNES': return 'bg-emerald-200';
      case 'PHIL': return 'bg-slate-200';
      case 'PLCY': return 'bg-zinc-200';

      // Default for other departments
      default: return 'bg-gray-200';
    }
  };

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
            <div className="border-b border-r p-2 text-sm text-muted-foreground">
              {hour === 12 ? '12:00 PM' : hour > 12 ? `${hour-12}:00 PM` : `${hour}:00 AM`}
            </div>

            {days.map((day) => {
              const courses = getCoursesForTimeAndDay(hour, day);
              return (
                <div
                  key={`${day}-${hour}`}
                  className="border-b border-r p-2 relative min-h-[3rem]"
                >
                  {courses.map((course) => (
                    <div
                      key={course.section_id}
                      className={`absolute inset-1 rounded-md p-1 text-xs ${getBlockColor(course.course)}`}
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