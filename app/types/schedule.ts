export interface GenEdRequirements {
  DSHS: number;
  DSHU: number;
  DSNS: number;
  DSNL: number;
  DSSP: number;
  DVCC: number;
  DVUP: number;
  SCIS: number;
}

export interface ScheduleRequirements {
  genEds: GenEdRequirements;
  totalCredits: number;
  preferredDifficulty: 'easy' | 'moderate' | 'challenging';
}