interface PrereqMap {
  [courseId: string]: string[];
}

export const prerequisiteMap: PrereqMap = {
  "CMSC131": ["MATH140"],
  "CMSC132": ["CMSC131", "MATH141"],
  "CMSC216": ["CMSC132"],
  "CMSC250": ["CMSC131", "MATH141"],
  "CMSC330": ["CMSC216", "CMSC250"],
  "CMSC351": ["CMSC250", "MATH141"],
  "CMSC411": ["CMSC330", "CMSC351"],
  "CMSC412": ["CMSC330", "CMSC351"],
  "CMSC414": ["CMSC330", "CMSC351"],
  "CMSC417": ["CMSC351"],
  "CMSC420": ["CMSC330", "CMSC351"],
  "CMSC421": ["CMSC330", "CMSC351"],
  "CMSC422": ["CMSC330", "CMSC351"],
  "CMSC423": ["CMSC351"],
  "CMSC424": ["CMSC351"],
  "CMSC426": ["CMSC330", "CMSC351"],
  "CMSC430": ["CMSC330", "CMSC351"],
  "CMSC433": ["CMSC330", "CMSC351"],
  "CMSC434": ["CMSC330", "CMSC351"],
  "CMSC435": ["CMSC330", "CMSC351"],
  "CMSC436": ["CMSC330", "CMSC351"],
  // Add more mappings as needed
};