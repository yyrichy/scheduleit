interface PrereqMap {
  [courseId: string]: (completedCourses: string[]) => boolean;
}

/**
 * These prerequisite maps are based on UMD's Schedule of Classes
 * Need this because umd.io and PlanetTerp are missing lots of prerequisite information
 */

export const prerequisiteMap: PrereqMap = {
  CMSC131: (completedCourses) => completedCourses.includes("MATH140"),
  CMSC132: (completedCourses) => completedCourses.includes("CMSC131") && completedCourses.includes("MATH141"),
  CMSC216: (completedCourses) => completedCourses.includes("CMSC132"),
  CMSC250: (completedCourses) => completedCourses.includes("CMSC131") && completedCourses.includes("MATH141"),
  CMSC330: (completedCourses) => completedCourses.includes("CMSC216") && completedCourses.includes("CMSC250"),
  CMSC351: (completedCourses) => completedCourses.includes("CMSC250") && completedCourses.includes("MATH141"),
  CMSC411: (completedCourses) => completedCourses.includes("CMSC330") && completedCourses.includes("CMSC351"),
  CMSC412: (completedCourses) => completedCourses.includes("CMSC330") && completedCourses.includes("CMSC351"),
  CMSC414: (completedCourses) => completedCourses.includes("CMSC330") && completedCourses.includes("CMSC351"),
  CMSC417: (completedCourses) => completedCourses.includes("CMSC351"),
  CMSC420: (completedCourses) => completedCourses.includes("CMSC330") && completedCourses.includes("CMSC351"),
  CMSC421: (completedCourses) => completedCourses.includes("CMSC330") && completedCourses.includes("CMSC351"),
  CMSC422: (completedCourses) => completedCourses.includes("CMSC330") && completedCourses.includes("CMSC351"),
  CMSC423: (completedCourses) => completedCourses.includes("CMSC351"),
  CMSC424: (completedCourses) => completedCourses.includes("CMSC351"),
  CMSC425: (completedCourses) => completedCourses.includes("CMSC330") && completedCourses.includes("CMSC351"),
  CMSC426: (completedCourses) => completedCourses.includes("CMSC330") && completedCourses.includes("CMSC351"),
  CMSC430: (completedCourses) => completedCourses.includes("CMSC330") && completedCourses.includes("CMSC351"),
  CMSC433: (completedCourses) => completedCourses.includes("CMSC330"),
  CMSC434: (completedCourses) => completedCourses.includes("CMSC330") && completedCourses.includes("CMSC351"),
  CMSC435: (completedCourses) =>
    ["CMSC412", "CMSC417", "CMSC420", "CMSC430", "CMSC433"].some((course) => completedCourses.includes(course)),
  CMSC436: (completedCourses) => completedCourses.includes("CMSC330") && completedCourses.includes("CMSC351"),
  CMSC451: (completedCourses) => completedCourses.includes("CMSC351"),
  CMSC454: (completedCourses) => completedCourses.includes("CMSC330") && completedCourses.includes("CMSC351"),
  CMSC456: (completedCourses) => {
    const mathOptions1 = ["MATH240", "MATH341", "MATH461"];
    const mathOptions2 = ["MATH241", "MATH340"];
    const cmscOptions = ["CMSC106", "CMSC131"];

    return (
      mathOptions1.some((course) => completedCourses.includes(course)) &&
      mathOptions2.some((course) => completedCourses.includes(course)) &&
      cmscOptions.some((course) => completedCourses.includes(course)) &&
      completedCourses.includes("MATH246")
    );
  },
  CMSC460: (completedCourses) => {
    const mathOptions1 = ["MATH240", "MATH341", "MATH461"];
    const mathOptions2 = ["MATH241", "MATH340"];
    const cmscOptions = ["CMSC106", "CMSC131"];

    return (
      mathOptions1.some((course) => completedCourses.includes(course)) &&
      mathOptions2.some((course) => completedCourses.includes(course)) &&
      cmscOptions.some((course) => completedCourses.includes(course)) &&
      completedCourses.includes("MATH246")
    );
  },
  CMSC466: (completedCourses) => {
    const mathOptions1 = ["MATH240", "MATH241", "MATH410"];
    const cmscOptions = ["CMSC106", "CMSC131"];

    return (
      mathOptions1.some((course) => completedCourses.includes(course)) && cmscOptions.some((course) => completedCourses.includes(course))
    );
  },
  CMSC470: (completedCourses) => {
    const mathOptions = ["MATH240"];
    const cmscOptions = ["CMSC320", "CMSC330", "CMSC351"];

    return (
      mathOptions.some((course) => completedCourses.includes(course)) && cmscOptions.every((course) => completedCourses.includes(course))
    );
  },
  CMSC471: (completedCourses) => completedCourses.includes("CMSC330") && completedCourses.includes("CMSC351"),
  CMSC473: (completedCourses) => completedCourses.includes("CMSC421") || completedCourses.includes("CMSC422"),
  CMSC474: (completedCourses) => completedCourses.includes("CMSC330") && completedCourses.includes("CMSC351"),
  CMSC475: (completedCourses) => completedCourses.includes("MATH240") && completedCourses.includes("MATH241"),
  CMSC498B: (completedCourses) => completedCourses.includes("CMSC330") && completedCourses.includes("CMSC351"),
  CMSC498J: (completedCourses) => true,
  CMSC498K: (completedCourses) => true,
  CMSC498Z: (completedCourses) => true,
  CMSC499A: (completedCourses) => true,
};

export const prerequisiteMapString: Record<string, string> = {
  CMSC131: "Must complete MATH140 with a minimum grade of C-",
  CMSC132: "Must complete CMSC131 and MATH141 with a minimum grade of C-",
  CMSC216: "Must complete CMSC132 with a minimum grade of C-",
  CMSC250: "Must complete CMSC131 and MATH141 with a minimum grade of C-",
  CMSC330: "Must complete CMSC216 and CMSC250 with a minimum grade of C-",
  CMSC351: "Must complete CMSC250 and MATH141 with a minimum grade of C-",
  CMSC411: "Must complete CMSC330 and CMSC351 with a minimum grade of C-",
  CMSC412: "Must complete CMSC330 and CMSC351 with a minimum grade of C-",
  CMSC414: "Must complete CMSC330 and CMSC351 with a minimum grade of C-",
  CMSC417: "Must complete CMSC351 with a minimum grade of C-",
  CMSC420: "Must complete CMSC330 and CMSC351 with a minimum grade of C-",
  CMSC421: "Must complete CMSC330 and CMSC351 with a minimum grade of C-",
  CMSC422: "Must complete CMSC330 and CMSC351 with a minimum grade of C-",
  CMSC423: "Must complete CMSC351 with a minimum grade of C-",
  CMSC424: "Must complete CMSC351 with a minimum grade of C-",
  CMSC425: "Must complete CMSC330 and CMSC351 with a minimum grade of C-",
  CMSC426: "Must complete CMSC330 and CMSC351 with a minimum grade of C-",
  CMSC430: "Must complete CMSC330 and CMSC351 with a minimum grade of C-",
  CMSC433: "Must complete CMSC330 with a minimum grade of C-",
  CMSC434: "Must complete CMSC330 and CMSC351 with a minimum grade of C-",
  CMSC435: "Must complete one of: CMSC412, CMSC417, CMSC420, CMSC430, or CMSC433 with a minimum grade of C-",
  CMSC436: "Must complete CMSC330 and CMSC351 with a minimum grade of C-",
  CMSC451: "Must complete CMSC351 with a minimum grade of C-",
  CMSC454: "Must complete CMSC330 and CMSC351 with a minimum grade of C-",
  CMSC456: "Must complete: 1 course from (MATH240, MATH341, MATH461), 1 course from (MATH241, MATH340), 1 course from (CMSC106, CMSC131), and MATH246, all with a minimum grade of C-",
  CMSC460: "Must complete: 1 course from (MATH240, MATH341, MATH461), 1 course from (MATH241, MATH340), 1 course from (CMSC106, CMSC131), and MATH246, all with a minimum grade of C-",
  CMSC466: "Must complete: 1 course from (MATH240, MATH241, MATH410) and 1 course from (CMSC106, CMSC131), all with a minimum grade of C-",
  CMSC470: "Must complete MATH240, CMSC320, CMSC330, and CMSC351 with a minimum grade of C-",
  CMSC471: "Must complete CMSC330 and CMSC351 with a minimum grade of C-",
  CMSC473: "Must complete either CMSC421 or CMSC422 with a minimum grade of C-",
  CMSC474: "Must complete CMSC330 and CMSC351 with a minimum grade of C-",
  CMSC475: "Must complete MATH240 and MATH241 with a minimum grade of C-",
  CMSC498B: "Must complete CMSC330 and CMSC351 with a minimum grade of C-",
  CMSC498J: "No prerequisites",
  CMSC498K: "No prerequisites",
  CMSC498Z: "No prerequisites",
  CMSC499A: "No prerequisites",
};