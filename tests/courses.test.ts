import test from "node:test";
import assert from "node:assert/strict";
import {
  courses,
  resolveCourse,
  searchCourses,
  distanceMiles,
  atCourse,
  restoreCommunity,
  courseDirections,
  curatedDirectory,
} from "../packages/courses/index";

test("canonical course IDs keep legacy spellings in one community", () => {
  assert.equal(
    resolveCourse("Redhawk Golf Club")?.id,
    resolveCourse("Redhawk Golf Course")?.id,
  );
  assert.equal(
    resolveCourse("CrossCreek Golf Club")?.id,
    resolveCourse("Cross Creek Golf Club")?.id,
  );
  for (const c of courses) {
    assert.equal(resolveCourse(c.id)?.id, c.id);
    assert.equal(resolveCourse(c.slug)?.id, c.id);
  }
  assert.equal(resolveCourse("Unknown golf course"), undefined);
});
test("search finds names, combined city/state and ZIP, with clear empty results", () => {
  assert.equal(searchCourses("menifee")[0]?.course.postalCode, "92584");
  assert.equal(
    searchCourses("Murrieta CA")[0]?.course.slug,
    "rancho-california",
  );
  assert.equal(searchCourses("92592").length, 3);
  assert.equal(searchCourses(" CrossCreek ")[0]?.course.slug, "cross-creek");
  assert.equal(searchCourses("99999").length, 0);
  assert.equal(searchCourses("murrieta 92584").length, 0);
});
test("radius is measured from the selected course, with a geographic distance check", () => {
  assert.equal(distanceMiles(courses[0], courses[0]), 0);
  // One degree of longitude at the equator is approximately 69.1 statute miles.
  assert.ok(
    Math.abs(
      distanceMiles(
        { latitude: 0, longitude: 0 },
        { latitude: 0, longitude: 1 },
      ) - 69.0934,
    ) < 0.01,
  );
  const nearby = searchCourses("", { origin: courses[0], radius: 10 });
  assert.equal(nearby[0].course.id, courses[0].id);
  assert.ok(!nearby.some((r) => r.course.slug === "menifee-lakes"));
  assert.equal(searchCourses("", { origin: courses[0], radius: 25 }).length, 6);
  assert.equal(searchCourses("", { radius: 25 }).length, 0);
});
test("activities match exact course identity rather than ambiguous substrings", () => {
  assert.ok(atCourse({ course: "Redhawk Golf Club" }, courses[1].id));
  assert.ok(
    !atCourse(
      { course: "Redhawk Golf Club", courseId: "unknown" },
      courses[1].id,
    ),
  );
  assert.ok(!atCourse({ course: "Temecula" }, courses[0].id));
  assert.ok(
    atCourse(
      { course: "Renamed record", courseId: courses[0].id },
      courses[0].id,
    ),
  );
});
test("community membership requires explicit IDs and restores safely without duplicates", () => {
  assert.deepEqual(
    restoreCommunity({ favoriteCourses: [courses[0].name] }).joinedCourseIds,
    [],
  );
  assert.deepEqual(
    restoreCommunity({
      joinedCourseIds: [courses[0].id, courses[0].id, "invalid", null],
      connectedGolferIds: ["sample-jamie", "sample-jamie", "random"],
    }),
    { joinedCourseIds: [courses[0].id], connectedGolferIds: ["sample-jamie"] },
  );
  assert.deepEqual(restoreCommunity(null), {
    joinedCourseIds: [],
    connectedGolferIds: [],
  });
});
test("directory source records are unique, source-backed, and usable without provider coupling", async () => {
  assert.equal(new Set(courses.map((c) => c.id)).size, courses.length);
  assert.equal(new Set(courses.map((c) => c.slug)).size, courses.length);
  for (const c of courses) {
    assert.match(
      c.id,
      /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/,
    );
    assert.match(c.sourceUrl, /^https:\/\//);
    assert.match(c.postalCode, /^\d{5}$/);
    assert.equal(
      new URL(courseDirections(c)).searchParams.get("destination"),
      `${c.name}, ${c.address}, ${c.city}, ${c.state} ${c.postalCode}`,
    );
    assert.equal((await curatedDirectory.get(c.id))?.name, c.name);
  }
  assert.equal(await curatedDirectory.get("unknown"), null);
});
