"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  MapPin,
  Flag,
  Users,
  Trophy,
  Search,
  Navigation,
  Globe,
  Phone,
  Check,
  Plus,
  ChevronLeft,
  CalendarDays,
  Heart,
} from "lucide-react";
import {
  courses,
  searchCourses,
  resolveCourse,
  courseAddress,
  courseDirections,
  atCourse,
  courseCommunityKey,
  courseMembershipEvent,
  restoreCommunity,
  type GolfCourse,
  type CourseCommunityPreview,
} from "@shared/courses";
import { restoreGolferProfile, initials } from "@shared/utilities/profile";
import type { GolferProfile, Round, Tournament } from "@shared/types";
import { Logo, Avatar } from "./ui";
import { Footer } from "./marketing";
import { demoProfile, demoRounds, demoTournaments } from "./demo-data";

function CourseHeader() {
  return (
    <header className="public-page-header course-public-header">
      <Logo />
      <nav aria-label="Course navigation">
        <Link href="/courses">Find a course</Link>
        <Link className="button primary small" href="/app">
          My clubhouse <ArrowUpRight size={16} />
        </Link>
      </nav>
    </header>
  );
}
function useCourseMembership() {
  const [membership, setMembership] = useState<CourseCommunityPreview>(
    restoreCommunity(null),
  );
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    function restore() {
      try {
        const raw = localStorage.getItem(courseCommunityKey);
        setMembership(restoreCommunity(raw ? JSON.parse(raw) : null));
      } catch {
        setNotice("Course preferences could not be loaded in this browser.");
      }
      setReady(true);
    }
    restore();
    window.addEventListener("storage", restore);
    window.addEventListener(courseMembershipEvent, restore);
    return () => {
      window.removeEventListener("storage", restore);
      window.removeEventListener(courseMembershipEvent, restore);
    };
  }, []);
  function save(next: CourseCommunityPreview, message: string) {
    try {
      localStorage.setItem(courseCommunityKey, JSON.stringify(next));
      setMembership(next);
      window.dispatchEvent(new Event(courseMembershipEvent));
      setNotice(message);
    } catch {
      setNotice(
        "Your change could not be saved. Check browser storage and try again.",
      );
    }
  }
  return { membership, ready, notice, save };
}
export function MyCourseCommunities() {
  const { membership, ready, notice, save } = useCourseMembership();
  const joined = courses.filter((c) =>
    membership.joinedCourseIds.includes(c.id),
  );
  return (
    <section className="panel identity-card identity-full my-course-communities">
      <div className="identity-card-head">
        <h3>My course communities</h3>
        <Link className="text-link" href="/courses">
          Explore courses <ArrowUpRight size={15} />
        </Link>
      </div>
      <p>
        Places you choose to play. Membership never indicates your current
        location.
      </p>
      {!ready ? (
        <p>Loading your courses…</p>
      ) : joined.length ? (
        <div className="my-course-links">
          {joined.map((c) => (
            <Link href={`/courses/${c.slug}`} key={c.id}>
              <Flag size={18} />
              <span>
                <b>{c.name}</b>
                <small>
                  {c.city}, {c.state}
                </small>
              </span>
              <ArrowRight size={16} />
            </Link>
          ))}
        </div>
      ) : (
        <p className="muted">
          Pick a course and join its community to start meeting your kind of
          golf people.
        </p>
      )}
      {membership.connectedGolferIds.length > 0 && (
        <div className="preview-my-circle">
          <h4>
            My Circle <small>Preview golfers</small>
          </h4>
          {sampleGolfers
            .filter((g) => membership.connectedGolferIds.includes(g.id))
            .map((g) => (
              <div key={g.id}>
                <Avatar initials={g.initials} />
                <span>
                  <b>{g.name}</b>
                  <small>Fictional sample golfer</small>
                </span>
                <button
                  type="button"
                  className="text-link"
                  onClick={() =>
                    save(
                      {
                        ...membership,
                        connectedGolferIds:
                          membership.connectedGolferIds.filter(
                            (id) => id !== g.id,
                          ),
                      },
                      `${g.name} was removed from your preview My Circle.`,
                    )
                  }
                >
                  Remove
                </button>
              </div>
            ))}
        </div>
      )}
      {notice && <p role="status">{notice}</p>}
    </section>
  );
}
export function CourseDirectoryPage() {
  const [query, setQuery] = useState("");
  const [originId, setOriginId] = useState("");
  const [radius, setRadius] = useState("all");
  const [mine, setMine] = useState(false);
  const { membership, ready, notice } = useCourseMembership();
  const origin = resolveCourse(originId);
  const found = searchCourses(query, {
    origin,
    radius: origin && radius !== "all" ? Number(radius) : undefined,
  }).filter(
    ({ course }) => !mine || membership.joinedCourseIds.includes(course.id),
  );
  return (
    <>
      <CourseHeader />
      <main className="course-directory">
        <section className="course-directory-hero section-wrap">
          <div>
            <span className="eyebrow">FAMILIAR FAIRWAYS. NEW FRIENDS.</span>
            <h1>
              Pick your course.
              <br />
              <em>Find your people.</em>
            </h1>
            <p>
              Your next golf crew might love the same course you do. Find a
              course, explore its community, and get a round going.
            </p>
          </div>
          <div className="course-hero-art" aria-hidden="true">
            <div className="course-rings">
              <Flag size={70} strokeWidth={1} />
            </div>
            <span>
              THE COURSE BRINGS
              <br />
              US TOGETHER.
            </span>
          </div>
        </section>
        <section
          className="section-wrap course-directory-content"
          aria-label="Course directory"
        >
          <div className="course-search-panel">
            <label className="field-label" htmlFor="directory-search">
              Where do you want to play?
            </label>
            <div className="course-search-input">
              <Search size={20} />
              <input
                id="directory-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search course name, city, or ZIP code"
              />
            </div>
            <div className="course-directory-filters">
              <label>
                Search near
                <select
                  aria-label="Distance starting point"
                  value={originId}
                  onChange={(e) => setOriginId(e.target.value)}
                >
                  <option value="">No distance filter</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Distance
                <select
                  aria-label="Distance radius"
                  disabled={!origin}
                  value={radius}
                  onChange={(e) => setRadius(e.target.value)}
                >
                  <option value="all">Any distance</option>
                  <option value="10">Within 10 miles</option>
                  <option value="25">Within 25 miles</option>
                  <option value="50">Within 50 miles</option>
                </select>
              </label>
              <button
                className={`course-mine-button ${mine ? "selected" : ""}`}
                aria-pressed={mine}
                disabled={!ready}
                onClick={() => setMine(!mine)}
              >
                <Heart size={17} />
                {mine ? "My communities" : "Show my communities"}
              </button>
            </div>
            <p className="course-search-help">
              {origin
                ? `Approximate straight-line miles from ${origin.name}, not driving distance.`
                : "Start with a name, city, or exact ZIP. Choose a course above to search within 10, 25, or 50 miles."}
            </p>
          </div>
          <div className="course-results-heading">
            <div>
              <span className="eyebrow">YOUR LOCAL GOLF COMMUNITY</span>
              <h2>
                {mine ? "Your familiar fairways" : "Find your home course"}
              </h2>
            </div>
            <span role="status">
              {found.length} {found.length === 1 ? "course" : "courses"}
            </span>
          </div>
          <p className="course-launch-note">
            Starting in Temecula, Murrieta, and Menifee · six real course
            listings. Community members and golf activity are preview examples.
          </p>
          {notice && <p role="status">{notice}</p>}
          <div className="course-directory-grid">
            {found.map(({ course: c, distance }) => (
              <article className="course-directory-card" key={c.id}>
                <div className="course-card-top">
                  <span className="course-flag">
                    <Flag size={24} />
                  </span>
                  <span>{c.city.toUpperCase()}</span>
                  {membership.joinedCourseIds.includes(c.id) && (
                    <span className="course-joined-label">
                      <Check size={13} /> Joined
                    </span>
                  )}
                </div>
                <h3>
                  <Link href={`/courses/${c.slug}`}>{c.name}</Link>
                </h3>
                <p>
                  <MapPin size={15} />
                  {c.address}
                  <br />
                  {c.city}, {c.state} {c.postalCode}
                </p>
                {distance !== undefined && (
                  <span className="course-distance">
                    About {distance.toFixed(1)} miles from selected course
                  </span>
                )}
                <div className="course-card-bottom">
                  <span>
                    <Users size={16} /> Meet the course community
                  </span>
                  <Link
                    href={`/courses/${c.slug}`}
                    aria-label={`Explore ${c.name}`}
                  >
                    <ArrowUpRight size={23} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
          {!found.length && (
            <div className="empty-state">
              <Flag />
              <h3>
                {mine
                  ? "Your course community starts here."
                  : "No matching courses yet."}
              </h3>
              <p>
                {mine
                  ? "Join a course community to keep it here."
                  : "Try a nearby city, another ZIP, or a wider radius. Our launch directory currently covers six courses."}
              </p>
              <button
                className="button primary small"
                onClick={() => {
                  setQuery("");
                  setOriginId("");
                  setRadius("all");
                  setMine(false);
                }}
              >
                Show all courses
              </button>
            </div>
          )}
          <div className="course-how">
            <div>
              <span>01</span>
              <h3>Pick a course</h3>
              <p>Your favorite fairway, or somewhere new.</p>
            </div>
            <div>
              <span>02</span>
              <h3>Meet the golfers</h3>
              <p>Join the community of people who choose to play there.</p>
            </div>
            <div>
              <span>03</span>
              <h3>Make a golf day</h3>
              <p>Find an open round or invite a few golfers to yours.</p>
            </div>
          </div>
          <CourseSuggestion />
        </section>
      </main>
      <Footer />
    </>
  );
}
function CourseSuggestion() {
  const [name, setName] = useState("");
  const [area, setArea] = useState("");
  const [message, setMessage] = useState("");
  return (
    <section id="suggest-course" className="course-suggest">
      <div>
        <span className="eyebrow">GROW THE COURSE LIST</span>
        <h2>Missing your favorite?</h2>
        <p>
          Save a course suggestion in this browser. Suggestions will need review
          before joining the directory. They are not sent to ForeCircle in this
          preview.
        </p>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim().length < 3 || area.trim().length < 2) {
            setMessage("Add a course name and city or ZIP.");
            return;
          }
          try {
            const raw: unknown = JSON.parse(
              localStorage.getItem("forecircle-course-suggestions-v1") || "[]",
            );
            const saved = Array.isArray(raw) ? raw.slice(-19) : [];
            localStorage.setItem(
              "forecircle-course-suggestions-v1",
              JSON.stringify([
                ...saved,
                {
                  name: name.trim(),
                  area: area.trim(),
                  createdAt: new Date().toISOString(),
                },
              ]),
            );
            setMessage(
              `Saved “${name.trim()}” in this browser. It has not been submitted or added to the directory.`,
            );
            setName("");
            setArea("");
          } catch {
            setMessage(
              "Could not save your suggestion. Check browser storage and try again.",
            );
          }
        }}
      >
        <label className="field-label">
          Course name
          <input
            required
            minLength={3}
            maxLength={150}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label className="field-label">
          City or ZIP code
          <input
            required
            minLength={2}
            maxLength={100}
            value={area}
            onChange={(e) => setArea(e.target.value)}
          />
        </label>
        <button className="button primary small" type="submit">
          Save preview suggestion <Plus size={16} />
        </button>
        <p role="status">{message}</p>
      </form>
    </section>
  );
}
const sampleGolfers = [
  {
    id: "sample-jamie",
    name: "Jamie Reed",
    initials: "JR",
    bio: "Nine holes after work. Always up for an easygoing round.",
    style: "Beginner friendly",
    days: "Weekday afternoons",
    handicap: "Learning",
    courseIds: [courses[0].id, courses[1].id, courses[5].id],
  },
  {
    id: "sample-taylor",
    name: "Taylor Stone",
    initials: "TS",
    bio: "Weekend golfer. Good company matters more than my score.",
    style: "Social",
    days: "Weekend mornings",
    handicap: "18 handicap",
    courseIds: [courses[0].id, courses[2].id, courses[4].id],
  },
  {
    id: "sample-casey",
    name: "Casey Drew",
    initials: "CD",
    bio: "Early tee times and a little friendly competition.",
    style: "Competitive",
    days: "Saturday mornings",
    handicap: "12 handicap",
    courseIds: [courses[1].id, courses[3].id, courses[4].id],
  },
];
export function CourseCommunity({ course: c }: { course: GolfCourse }) {
  const { membership, ready, notice, save } = useCourseMembership();
  const [tab, setTab] = useState<"Rounds" | "Tournaments" | "Golfers">(
    "Rounds",
  );
  const [profile, setProfile] = useState<GolferProfile>(demoProfile);
  const [rounds, setRounds] = useState<Round[]>(demoRounds);
  const [tournaments, setTournaments] = useState<Tournament[]>(demoTournaments);
  const [loadError, setLoadError] = useState("");
  useEffect(() => {
    try {
      const raw = localStorage.getItem("forecircle-preview-v1");
      if (raw) {
        const data = JSON.parse(raw) as {
          profile?: unknown;
          rounds?: Round[];
          tournaments?: Tournament[];
        };
        setProfile(restoreGolferProfile(data.profile, demoProfile));
        if (Array.isArray(data.rounds))
          setRounds(
            data.rounds.filter(
              (r) =>
                r && typeof r.id === "string" && typeof r.course === "string",
            ),
          );
        if (Array.isArray(data.tournaments))
          setTournaments(
            data.tournaments.filter(
              (t) =>
                t && typeof t.id === "string" && typeof t.course === "string",
            ),
          );
      }
    } catch {
      setLoadError(
        "Your saved activity could not be loaded. Showing sample activity.",
      );
    }
  }, []);
  const joined = membership.joinedCourseIds.includes(c.id);
  const courseRounds = rounds.filter((r) => atCourse(r, c.id));
  const courseTournaments = tournaments.filter((t) => atCourse(t, c.id));
  const golfers = sampleGolfers.filter((g) => g.courseIds.includes(c.id));
  const roundPath = `/app/rounds?course=${c.id}`;
  const tournamentPath = `/app/tournaments?course=${c.id}`;
  return (
    <>
      <CourseHeader />
      <main className="course-hub">
        <section className="course-hub-hero">
          <div className="section-wrap">
            <Link href="/courses" className="course-back">
              <ChevronLeft size={16} /> All courses
            </Link>
            <div className="course-hub-title">
              <div>
                <span className="eyebrow">THE FORECIRCLE COURSE COMMUNITY</span>
                <h1>{c.name}</h1>
                <p>
                  <MapPin size={17} />
                  {c.city}, {c.state} · {c.postalCode}
                </p>
              </div>
              <span className="course-hub-emblem" aria-hidden="true">
                <Flag size={62} strokeWidth={1} />
              </span>
            </div>
            <div className="course-hub-action-row">
              <p>
                Same course. New connections.
                <br />
                <span>Meet golfers who choose to play here.</span>
              </p>
              <button
                className={`button ${joined ? "secondary" : "primary"}`}
                disabled={!ready}
                onClick={() =>
                  save(
                    {
                      ...membership,
                      joinedCourseIds: joined
                        ? membership.joinedCourseIds.filter((id) => id !== c.id)
                        : [...membership.joinedCourseIds, c.id],
                    },
                    joined
                      ? "You left this course community in your preview."
                      : "You joined this course community in your preview. Your choice is saved only in this browser.",
                  )
                }
              >
                {joined ? <Check size={18} /> : <Plus size={18} />}
                {joined ? "Leave course community" : "Join course community"}
              </button>
            </div>
          </div>
        </section>
        <div className="section-wrap course-hub-layout">
          <div className="course-hub-main">
            <div className="course-community-note">
              <Users size={21} />
              <div>
                <b>Your choice, your community.</b>
                <p>
                  Joining means you’re interested in playing here. It never
                  shows that you’re at the course. This is a ForeCircle
                  community, separate from course membership.
                </p>
              </div>
            </div>
            <p className="course-preview-banner">
              Private preview · golfers and activities below are examples. Your
              changes stay in this browser; no invitations, tee times, or real
              connections are created.
            </p>
            <p role="status" className="course-save-notice">
              {notice || loadError}
            </p>
            <div className="course-hub-tabs" aria-label="Course activity">
              {(["Rounds", "Tournaments", "Golfers"] as const).map((t) => (
                <button
                  key={t}
                  aria-pressed={tab === t}
                  onClick={() => setTab(t)}
                >
                  {t === "Rounds" ? (
                    <Flag size={16} />
                  ) : t === "Tournaments" ? (
                    <Trophy size={16} />
                  ) : (
                    <Users size={16} />
                  )}{" "}
                  {t}
                  <span>
                    {t === "Rounds"
                      ? courseRounds.length
                      : t === "Tournaments"
                        ? courseTournaments.length
                        : golfers.length + (joined ? 1 : 0)}
                  </span>
                </button>
              ))}
            </div>
            {tab === "Rounds" && (
              <section className="course-activity-section">
                <div className="course-section-head">
                  <div>
                    <h2>Who wants to golf here?</h2>
                    <p>Find a spot in a preview round, or get yours going.</p>
                  </div>
                  <Link
                    className="button primary small"
                    href={`${roundPath}&create=1`}
                  >
                    <Plus size={16} />
                    Post a round
                  </Link>
                </div>
                {courseRounds.map((r) => (
                  <article key={r.id} className="course-activity-card">
                    <div className="course-date-icon">
                      <Flag size={24} />
                      <small>{r.holes} HOLES</small>
                    </div>
                    <div>
                      <span className="course-activity-label">
                        {r.createdByMe ? "YOUR PREVIEW ROUND" : "SAMPLE ROUND"}
                      </span>
                      <h3>{r.title}</h3>
                      <p>
                        {r.when} · {r.time} · {r.style}
                      </p>
                      <small>
                        Hosted by {r.host} ·{" "}
                        {r.spots ? `${r.spots} spots left` : "Foursome full"}
                      </small>
                    </div>
                    <Link
                      href={`${roundPath}&round=${encodeURIComponent(r.id)}`}
                      className="button secondary small"
                    >
                      View round <ArrowRight size={15} />
                    </Link>
                  </article>
                ))}
                {!courseRounds.length && (
                  <CourseEmpty
                    text="Be the first to get a round going here."
                    href={`${roundPath}&create=1`}
                    label="Post a round"
                  />
                )}
              </section>
            )}
            {tab === "Tournaments" && (
              <section className="course-activity-section">
                <div className="course-section-head">
                  <div>
                    <h2>Make a day of it.</h2>
                    <p>Friendly competition at a familiar course.</p>
                  </div>
                  <Link
                    className="button primary small"
                    href={`${tournamentPath}&create=1`}
                  >
                    <Plus size={16} />
                    Organize here
                  </Link>
                </div>
                {courseTournaments.map((t) => (
                  <article key={t.id} className="course-activity-card">
                    <div className="course-date-icon">
                      <Trophy size={24} />
                      <small>{t.date}</small>
                    </div>
                    <div>
                      <span className="course-activity-label">
                        {t.createdByMe
                          ? "YOUR PREVIEW EVENT"
                          : "SAMPLE TOURNAMENT"}
                      </span>
                      <h3>{t.name}</h3>
                      <p>
                        {t.format} · {t.time}
                      </p>
                      <small>
                        {Math.max(0, t.capacity - t.players)} spots available
                      </small>
                    </div>
                    <Link
                      href={`${tournamentPath}&tournament=${encodeURIComponent(t.id)}`}
                      className="button secondary small"
                    >
                      View event <ArrowRight size={15} />
                    </Link>
                  </article>
                ))}
                {!courseTournaments.length && (
                  <CourseEmpty
                    text="Bring a little friendly competition to this course."
                    href={`${tournamentPath}&create=1`}
                    label="Organize a tournament"
                  />
                )}
              </section>
            )}
            {tab === "Golfers" && (
              <section className="course-activity-section">
                <div className="course-section-head">
                  <div>
                    <h2>Find your kind of golf people.</h2>
                    <p>
                      Opt-in course members, never a list of people currently
                      here.
                    </p>
                  </div>
                </div>
                <div className="course-golfer-grid">
                  {joined && (
                    <article className="course-golfer-card">
                      <Avatar
                        initials={initials(profile.name)}
                        src={profile.avatarUrl}
                        size="large"
                      />
                      <span className="course-activity-label">
                        YOU · PREVIEW MEMBER
                      </span>
                      <h3>{profile.name}</h3>
                      <p>
                        {profile.bio || "Ready for a round with good company."}
                      </p>
                      <div className="course-golfer-tags">
                        <span>{profile.style}</span>
                        {profile.handicap && (
                          <span>{profile.handicap} handicap</span>
                        )}
                      </div>
                      <Link href="/app/profile" className="text-link">
                        Your golfer profile <ArrowUpRight size={15} />
                      </Link>
                    </article>
                  )}
                  {golfers.map((g) => {
                    const connected = membership.connectedGolferIds.includes(
                      g.id,
                    );
                    return (
                      <article className="course-golfer-card" key={g.id}>
                        <Avatar initials={g.initials} size="large" />
                        <span className="course-activity-label">
                          FICTIONAL SAMPLE GOLFER
                        </span>
                        <h3>{g.name}</h3>
                        <p>{g.bio}</p>
                        <div className="course-golfer-tags">
                          <span>{g.style}</span>
                          <span>{g.handicap}</span>
                        </div>
                        <small>
                          <CalendarDays size={14} />
                          {g.days}
                        </small>
                        <button
                          className="button secondary small"
                          disabled={!ready || (!joined && !connected)}
                          aria-pressed={connected}
                          onClick={() =>
                            save(
                              {
                                ...membership,
                                connectedGolferIds: connected
                                  ? membership.connectedGolferIds.filter(
                                      (id) => id !== g.id,
                                    )
                                  : [...membership.connectedGolferIds, g.id],
                              },
                              connected
                                ? `${g.name} was removed from your preview My Circle.`
                                : `${g.name} was added to your preview My Circle. No real connection request was sent.`,
                            )
                          }
                        >
                          {connected ? <Check size={15} /> : <Plus size={15} />}{" "}
                          {connected
                            ? "In My Circle — remove"
                            : "Add to My Circle"}
                        </button>
                      </article>
                    );
                  })}
                </div>
                {!joined && (
                  <p className="course-opt-in-hint">
                    Join this course community above to try connecting with
                    sample golfers.
                  </p>
                )}
              </section>
            )}
          </div>
          <aside className="course-hub-aside">
            <section className="course-location-card">
              <span className="eyebrow">THE PLACE TO PLAY</span>
              <h2>Meet you on the green.</h2>
              <p>
                <MapPin size={18} />
                <span>
                  {c.address}
                  <br />
                  {c.city}, {c.state} {c.postalCode}
                </span>
              </p>
              <a
                className="button primary full small"
                href={courseDirections(c)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Navigation size={16} />
                Get directions
              </a>
              <a href={c.website} target="_blank" rel="noopener noreferrer">
                <Globe size={16} />
                Official course website <ArrowUpRight size={14} />
              </a>
              <a href={`tel:+1${c.phone.replace(/\D/g, "")}`}>
                <Phone size={16} />
                {c.phone}
              </a>
              <small>
                Confirm access, tee times, and arrival instructions directly
                with the course. ForeCircle does not book tee times.
              </small>
              <details>
                <summary>Listing sources & details</summary>
                <p>
                  Address/contact information checked Nov 8, 2026. These
                  listings do not imply course endorsement.
                </p>
                <a href={c.sourceUrl} target="_blank" rel="noopener noreferrer">
                  Official information
                </a>
                <a
                  href={c.coordinateSource}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Approximate map point source
                </a>
                {c.slug === "journey-at-pechanga" && (
                  <p>
                    Map point: © OpenStreetMap contributors, via Mapcarta.
                    Address is the resort’s published address; confirm the golf
                    arrival entrance.
                  </p>
                )}
                <Link href="/courses/#suggest-course">
                  Suggest a correction
                </Link>
              </details>
            </section>
            <section className="course-invite-card">
              <Flag size={24} />
              <h3>A favorite course deserves a good crew.</h3>
              <p>
                Post an open round here and make room for a new golf friend.
              </p>
              <Link href={`${roundPath}&create=1`}>
                I want to golf <ArrowRight size={17} />
              </Link>
            </section>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}
function CourseEmpty({
  text,
  href,
  label,
}: {
  text: string;
  href: string;
  label: string;
}) {
  return (
    <div className="empty-state">
      <Flag />
      <h3>No preview activity yet.</h3>
      <p>{text}</p>
      <Link className="button primary small" href={href}>
        {label}
        <ArrowRight size={16} />
      </Link>
    </div>
  );
}
