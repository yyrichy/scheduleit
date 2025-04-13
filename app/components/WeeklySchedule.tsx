import React from 'react';
import { Section } from '../types/section';

interface WeeklyScheduleProps {
  sections: Section[];
}

export function WeeklySchedule({ sections }: WeeklyScheduleProps) {
  const days = ['M', 'T', 'W', 'Th', 'F'];
  const timeSlots = Array.from({ length: 28 }, (_, i) => i + 16); // 8:00 AM to 9:00 PM

  const getCoursesForTimeAndDay = (time: number, day: string) => {
    return sections.filter(section => {
      return section.meetings.some(meeting => {
        const [startH, startM] = meeting.start_time.split(':').map(Number);
        const [endH, endM] = meeting.end_time.split(':').map(Number);
        const slotTime = Math.floor(time / 2) + (time % 2 ? ':30' : ':00');
        return meeting.days.includes(day) && 
               `${startH}:${startM.toString().padStart(2, '0')}` <= slotTime &&
               `${endH}:${endM.toString().padStart(2, '0')}` > slotTime;
      });
    });
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="grid grid-cols-6 bg-gray-100">
        <div className="p-2 border-r">Time</div>
        {days.map(day => (
          <div key={day} className="p-2 border-r text-center font-semibold">
            {day}
          </div>
        ))}
      </div>
      {timeSlots.map(time => (
        <div key={time} className="grid grid-cols-6">
          <div className="p-2 border-r border-b text-sm">
            {Math.floor(time/2)}:{time%2 ? '30' : '00'}
          </div>
          {days.map(day => {
            const courses = getCoursesForTimeAndDay(time, day);
            return (
              <div key={day} className="p-2 border-r border-b">
                {courses.map(course => (
                  <div key={course.section_id} className="text-xs bg-blue-100 p-1 rounded">
                    {course.course}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}