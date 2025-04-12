import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState } from "react";

interface CourseTagsInputProps {
  value: string[];
  onChange: (value: string[]) => void;
}

// Get all courses from prerequisite map
const ALL_COURSES = [
  "CMSC131", "CMSC132", "CMSC216", "CMSC250", "CMSC330", "CMSC351", 
  "CMSC411", "CMSC412", "CMSC414", "CMSC417", "CMSC420", "CMSC421", 
  "CMSC422", "CMSC423", "CMSC424", "CMSC425", "CMSC426", "CMSC430", 
  "CMSC433", "CMSC434", "CMSC435", "CMSC436", "CMSC451", "CMSC454", 
  "CMSC456", "CMSC460", "CMSC466", "CMSC470", "CMSC471", "CMSC473", 
  "CMSC474", "CMSC475", "CMSC498B", "CMSC498J", "CMSC498K", "CMSC498Z", 
  "CMSC499A", "MATH140", "MATH141", "MATH240", "MATH241", "MATH246", 
  "MATH340", "MATH341", "MATH410", "MATH461"
];

export function CourseTagsInput({ value, onChange }: CourseTagsInputProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const handleAddCourse = (course: string) => {
    if (course && !value.includes(course)) {
      onChange([...value, course.toUpperCase()]);
      setInputValue("");
      setOpen(false);
    }
  };

  const handleRemoveCourse = (course: string) => {
    onChange(value.filter(c => c !== course));
  };

  const filteredCourses = ALL_COURSES.filter(course =>
    course.toLowerCase().includes(inputValue.toLowerCase()) &&
    !value.includes(course)
  );

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Input
            placeholder="Add completed courses"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && inputValue) {
                handleAddCourse(inputValue);
              }
            }}
          />
        </PopoverTrigger>
        <PopoverContent className="p-0" align="start">
          <Command>
            <CommandInput placeholder="Search courses..." />
            <CommandList>
              <CommandEmpty>No courses found.</CommandEmpty>
              <CommandGroup>
                {filteredCourses.map((course) => (
                  <CommandItem
                    key={course}
                    value={course}
                    onSelect={() => handleAddCourse(course)}
                  >
                    {course}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <div className="flex flex-wrap gap-2">
        {value.map((course) => (
          <div key={course} className="flex items-center bg-primary/10 px-2 py-1 rounded">
            <span className="text-sm">{course}</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 ml-2 hover:bg-transparent"
              onClick={() => handleRemoveCourse(course)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}