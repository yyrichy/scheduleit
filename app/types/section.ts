export interface Section {
  course: string;
  section_id: string;
  seats: string;
  open_seats: string;
  waitlist: string;
  instructors: string[];
  meetings: Meeting[];
}

export interface Meeting {
  days: string;
  start_time: string;
  end_time: string;
  building: string;
  room: string;
  classtype: string;
}

export interface Professor {
  name: string;
  average_rating: number;
}

export interface ScoredSection extends Section {
  professorRating: number;
  sectionScore: number;
}