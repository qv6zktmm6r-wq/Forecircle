/** Curated launch-area directory. Provider-independent IDs are shared by every workflow. */
export interface GolfCourse {
  id: string;
  slug: string;
  name: string;
  aliases: string[];
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  latitude: number;
  longitude: number;
  website: string;
  phone: string;
  sourceUrl: string;
  coordinateSource: string;
  checkedAt: string;
}
const common = { state: "CA", country: "US", checkedAt: "2026-11-08" };
export const courses: GolfCourse[] = [
  {
    ...common,
    id: "fc000000-0000-4000-8000-000000000001",
    slug: "temecula-creek",
    name: "Temecula Creek Golf Club",
    aliases: ["Temecula Creek Inn", "Temecula Creek Inn Golf Course"],
    address: "44501 Rainbow Canyon Road",
    city: "Temecula",
    postalCode: "92592",
    latitude: 33.468416,
    longitude: -117.133199,
    website: "https://www.temeculacreekgolf.com/",
    phone: "844-290-7372",
    sourceUrl: "https://www.temeculacreekgolf.com/contact",
    coordinateSource:
      "https://www.where2golf.com/usa-california-nevada/temecula-creek-inn-golf-course/",
  },
  {
    ...common,
    id: "fc000000-0000-4000-8000-000000000002",
    slug: "redhawk",
    name: "Redhawk Golf Course",
    aliases: ["Redhawk Golf Club"],
    address: "45100 Redhawk Parkway",
    city: "Temecula",
    postalCode: "92592",
    latitude: 33.468059,
    longitude: -117.092773,
    website: "https://redhawkgolfcourse.com/",
    phone: "951-302-3850",
    sourceUrl: "https://redhawkgolfcourse.com/contact/",
    coordinateSource: "https://redhawkgolfcourse.com/contact/",
  },
  {
    ...common,
    id: "fc000000-0000-4000-8000-000000000003",
    slug: "cross-creek",
    name: "Cross Creek Golf Club",
    aliases: ["CrossCreek Golf Club"],
    address: "43860 Glen Meadows Road",
    city: "Temecula",
    postalCode: "92590",
    latitude: 33.4942,
    longitude: -117.228169,
    website: "https://www.crosscreekgolfclub.com/",
    phone: "951-506-3402",
    sourceUrl: "https://www.crosscreekgolfclub.com/contact/contact-us",
    coordinateSource: "https://www.crosscreekgolfclub.com/contact/contact-us",
  },
  {
    ...common,
    id: "fc000000-0000-4000-8000-000000000004",
    slug: "menifee-lakes",
    name: "Menifee Lakes Country Club",
    aliases: ["Menifee Lakes"],
    address: "29875 Menifee Lakes Drive",
    city: "Menifee",
    postalCode: "92584",
    latitude: 33.6891886,
    longitude: -117.1614215,
    website: "https://www.menifeelakesgolf.com/",
    phone: "951-672-4824",
    sourceUrl: "https://www.menifeelakesgolf.com/",
    coordinateSource:
      "https://www.topozone.com/california/riverside-ca/locale/menifee-lakes-country-club/",
  },
  {
    ...common,
    id: "fc000000-0000-4000-8000-000000000005",
    slug: "rancho-california",
    name: "The Golf Club at Rancho California",
    aliases: ["Rancho California Golf Club"],
    address: "39500 Robert Trent Jones Parkway",
    city: "Murrieta",
    postalCode: "92563",
    latitude: 33.562592,
    longitude: -117.145111,
    website: "https://thegolfclubatranchocalifornia.com/",
    phone: "951-677-7446",
    sourceUrl: "https://thegolfclubatranchocalifornia.com/contact/",
    coordinateSource:
      "https://freegolftracker.com/courses/The-Golf-Club-at-Rancho-California_1089.htm",
  },
  {
    ...common,
    id: "fc000000-0000-4000-8000-000000000006",
    slug: "journey-at-pechanga",
    name: "Journey at Pechanga",
    aliases: ["Pechanga Golf"],
    address: "45000 Pechanga Parkway",
    city: "Temecula",
    postalCode: "92592",
    latitude: 33.45315,
    longitude: -117.10645,
    website: "https://www.pechanga.com/indulge/journey",
    phone: "951-770-8210",
    sourceUrl: "https://www.pechanga.com/indulge/journey",
    coordinateSource: "https://mapcarta.com/W80912008",
  },
];
const normalize = (value: string) =>
  value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
export function resolveCourse(value?: string): GolfCourse | undefined {
  if (!value) return undefined;
  const needle = normalize(value);
  return courses.find((c) =>
    [c.id, c.slug, c.name, ...c.aliases].some((v) => normalize(v) === needle),
  );
}
export interface GeoPoint {
  latitude: number;
  longitude: number;
}
export function distanceMiles(a: GeoPoint, b: GeoPoint): number {
  const rad = (v: number) => (v * Math.PI) / 180;
  const h =
    Math.sin(rad(b.latitude - a.latitude) / 2) ** 2 +
    Math.cos(rad(a.latitude)) *
      Math.cos(rad(b.latitude)) *
      Math.sin(rad(b.longitude - a.longitude) / 2) ** 2;
  return 3958.7613 * 2 * Math.asin(Math.sqrt(Math.min(1, Math.max(0, h))));
}
export function searchCourses(
  query: string,
  options: { origin?: GeoPoint; radius?: number } = {},
) {
  const terms = query.trim().split(/\s+/).filter(Boolean).map(normalize);
  return courses
    .map((course) => ({
      course,
      distance: options.origin
        ? distanceMiles(options.origin, course)
        : undefined,
    }))
    .filter(({ course, distance }) => {
      const haystack = normalize(
        [
          course.name,
          ...course.aliases,
          course.city,
          course.state,
          course.postalCode,
        ].join(" "),
      );
      return (
        terms.every((term) => haystack.includes(term)) &&
        (options.radius === undefined ||
          (distance !== undefined && distance <= options.radius))
      );
    })
    .sort((a, b) =>
      options.origin
        ? (a.distance ?? Infinity) - (b.distance ?? Infinity)
        : a.course.name.localeCompare(b.course.name),
    );
}
export function courseAddress(course: GolfCourse) {
  return `${course.address}, ${course.city}, ${course.state} ${course.postalCode}`;
}
export function courseDirections(course: GolfCourse) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${course.name}, ${courseAddress(course)}`)}`;
}
export function atCourse(
  activity: { course: string; courseId?: string },
  courseId: string,
) {
  // An explicit ID wins. Unknown IDs must never silently resolve to a different course.
  return activity.courseId
    ? activity.courseId === courseId
    : resolveCourse(activity.course)?.id === courseId;
}
/** API boundary for a future Supabase adapter; no provider client belongs in a view. */
export interface CourseDirectory {
  search(query: string): Promise<GolfCourse[]>;
  get(id: string): Promise<GolfCourse | null>;
}
export const curatedDirectory: CourseDirectory = {
  async search(query) {
    return searchCourses(query).map((r) => r.course);
  },
  async get(id) {
    return courses.find((c) => c.id === id) ?? null;
  },
};
export const courseMembershipEvent = "forecircle-course-membership-changed";
export const courseCommunityKey = "forecircle-course-communities-v1";
export interface CourseCommunityPreview {
  joinedCourseIds: string[];
  connectedGolferIds: string[];
}
export function restoreCommunity(value: unknown): CourseCommunityPreview {
  const input =
    value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {};
  return {
    joinedCourseIds: Array.isArray(input.joinedCourseIds)
      ? [
          ...new Set(
            input.joinedCourseIds.filter(
              (v): v is string =>
                typeof v === "string" && courses.some((c) => c.id === v),
            ),
          ),
        ]
      : [],
    connectedGolferIds: Array.isArray(input.connectedGolferIds)
      ? [
          ...new Set(
            input.connectedGolferIds.filter(
              (v): v is string =>
                typeof v === "string" &&
                /^sample-(jamie|taylor|casey)$/.test(v),
            ),
          ),
        ]
      : [],
  };
}
