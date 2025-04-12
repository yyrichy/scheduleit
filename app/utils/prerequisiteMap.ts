interface PrereqMap {
  [courseId: string]: (completedCourses: string[]) => boolean;
}

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