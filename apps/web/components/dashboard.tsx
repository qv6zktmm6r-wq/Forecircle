"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import {
  Home,
  Flag,
  Users,
  Trophy,
  MessageCircle,
  Bell,
  User,
  LayoutDashboard,
  FlaskConical,
  ArrowUpRight,
  ArrowRight,
  Plus,
  Search,
  MapPin,
  CalendarDays,
  ChevronRight,
  Check,
  CheckCheck,
  Send,
  Settings,
  LogOut,
  Menu,
  X,
  ThumbsUp,
  Share2,
  Shield,
  Heart,
  Clock,
  SlidersHorizontal,
  ChevronDown,
} from "lucide-react";
import { Logo, Avatar, Modal, RoundCard, RoundDetail } from "./ui";
import {
  demoRounds,
  demoCircles,
  demoTournaments,
  demoIdeas,
  demoProfile,
} from "./demo-data";
import type {
  Round,
  Circle,
  Tournament,
  Idea,
  GolferProfile,
  ChatMessage,
} from "@shared/types";
import { roundSchema, messageSchema } from "@shared/validation";
import { ShareModal } from "./sharing";
import { previewId } from "@shared/utilities/preview-id";
import { restoreGolferProfile } from "@shared/utilities/profile";
import {
  GolferProfilePage,
  EditGolferProfile,
  type ProfileTab,
} from "./golfer-profile";
import { CoursePicker } from "./course-picker";
import {
  courses,
  resolveCourse,
  atCourse,
  courseCommunityKey,
  courseMembershipEvent,
} from "@shared/courses";
type View =
  | "home"
  | "rounds"
  | "circles"
  | "tournaments"
  | "messages"
  | "notifications"
  | "profile"
  | "organizer"
  | "events"
  | "lab"
  | "admin";
interface PreviewState {
  rounds: Round[];
  circles: Circle[];
  tournaments: Tournament[];
  ideas: Idea[];
  profile: GolferProfile;
  messages: Record<string, ChatMessage[]>;
  read: boolean;
}
const key = "forecircle-preview-v1";
const initial: PreviewState = {
  rounds: demoRounds,
  circles: demoCircles,
  tournaments: demoTournaments,
  ideas: demoIdeas,
  profile: demoProfile,
  messages: {},
  read: false,
};
const navigation = [
  { id: "home", label: "Home", Icon: Home, path: "/app" },
  { id: "rounds", label: "Find a round", Icon: Flag, path: "/app/rounds" },
  {
    id: "courses",
    label: "Course communities",
    Icon: MapPin,
    path: "/courses",
  },
  { id: "circles", label: "Circles", Icon: Users, path: "/app/circles" },
  {
    id: "tournaments",
    label: "Tournaments",
    Icon: Trophy,
    path: "/app/tournaments",
  },
  {
    id: "messages",
    label: "Messages",
    Icon: MessageCircle,
    path: "/app/messages",
  },
  {
    id: "notifications",
    label: "Notifications",
    Icon: Bell,
    path: "/app/notifications",
  },
  { id: "profile", label: "My profile", Icon: User, path: "/app/profile" },
];
const titles: Record<View, string> = {
  home: "Your next round starts here.",
  rounds: "Good company is a tee time away.",
  circles: "Find your kind of golf people.",
  tournaments: "A little friendly competition.",
  messages: "Keep the conversation going.",
  notifications: "You’re in the loop.",
  profile: "Your golf identity.",
  organizer: "Bring golfers together.",
  events: "Your next great golf day.",
  lab: "Better golf. Built together.",
  admin: "Platform control center.",
};
export function Dashboard({ view = "home" }: { view?: View }) {
  const [state, setState] = useState<PreviewState>(initial),
    [ready, setReady] = useState(false),
    [search, setSearch] = useState(""),
    [filter, setFilter] = useState("All rounds"),
    [area, setArea] = useState("Inland Empire"),
    [mobile, setMobile] = useState(false),
    [toast, setToast] = useState(""),
    [modal, setModal] = useState<
      | "round"
      | "circle"
      | "tournament"
      | "idea"
      | "profile"
      | "organizer"
      | null
    >(null),
    [round, setRound] = useState<Round | null>(null),
    [circle, setCircle] = useState<Circle | null>(null),
    [tournament, setTournament] = useState<Tournament | null>(null),
    [share, setShare] = useState<{ title: string; path: string } | null>(null),
    [labFilter, setLabFilter] = useState("All ideas"),
    [chat, setChat] = useState("Clubhouse lounge"),
    [message, setMessage] = useState(""),
    [privacy, setPrivacy] = useState("Circle members"),
    [chatIssue, setChatIssue] = useState(""),
    [profileTab, setProfileTab] = useState<ProfileTab>("About you");
  const [courseFilter, setCourseFilter] = useState("");
  const pendingTournament = useRef(false);
  const queryApplied = useRef(false);
  useEffect(() => {
    if (!ready || queryApplied.current) return;
    queryApplied.current = true;
    const params = new URLSearchParams(window.location.search);
    const selectedCourse = resolveCourse(params.get("course") || "");
    if (selectedCourse) setCourseFilter(selectedCourse.id);
    if (params.get("create") === "1") {
      if (view === "rounds") setModal("round");
      if (view === "tournaments") {
        pendingTournament.current = true;
        setModal(state.profile.organizer ? "tournament" : "organizer");
      }
    } else {
      if (view === "rounds")
        setRound(
          state.rounds.find((r) => r.id === params.get("round")) || null,
        );
      if (view === "tournaments")
        setTournament(
          state.tournaments.find((t) => t.id === params.get("tournament")) ||
            null,
        );
    }
  }, [ready, view, state.profile.organizer, state.rounds, state.tournaments]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw) as PreviewState;
        if (
          Array.isArray(parsed.rounds) &&
          Array.isArray(parsed.circles) &&
          Array.isArray(parsed.tournaments) &&
          Array.isArray(parsed.ideas) &&
          parsed.profile &&
          parsed.messages
        )
          setState({
            ...parsed,
            profile: restoreGolferProfile(parsed.profile, demoProfile),
          });
      }
    } catch {}
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) {
      try {
        localStorage.setItem(key, JSON.stringify(state));
      } catch {
        setToast(
          "This browser cannot save preview changes. They will last for this visit.",
        );
      }
    }
  }, [state, ready]);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(""), 4500);
    return () => clearTimeout(id);
  }, [toast]);
  function notify(s: string) {
    setToast(s);
  }
  function joinRound(r: Round) {
    const joined = !r.joined;
    setState((s) => ({
      ...s,
      rounds: s.rounds.map((x) =>
        x.id === r.id
          ? { ...x, joined, spots: x.spots + (joined ? -1 : 1) }
          : x,
      ),
    }));
    setRound(null);
    notify(
      joined
        ? "You joined the preview round. Find its group in Messages."
        : "You left the preview round.",
    );
  }
  function joinCircle(c: Circle) {
    setState((s) => ({
      ...s,
      circles: s.circles.map((x) =>
        x.id === c.id
          ? {
              ...x,
              joined: !x.joined,
              members: x.members + (x.joined ? -1 : 1),
            }
          : x,
      ),
    }));
    setCircle(null);
    notify(
      c.joined
        ? "You left the preview Circle."
        : "Welcome to your new preview Circle.",
    );
  }
  function register(t: Tournament) {
    setState((s) => ({
      ...s,
      tournaments: s.tournaments.map((x) =>
        x.id === t.id
          ? {
              ...x,
              registered: !x.registered,
              players: x.players + (x.registered ? -1 : 1),
            }
          : x,
      ),
    }));
    setTournament(null);
    notify(
      t.registered
        ? "Preview registration cancelled."
        : "You’re registered in the preview. No real booking was made.",
    );
  }
  const shownRounds = state.rounds.filter(
    (r) =>
      (!courseFilter || atCourse(r, courseFilter)) &&
      (filter === "All rounds" ||
        r.when === filter ||
        (filter === "Need one more" && r.spots === 1) ||
        (filter === "My rounds" && r.joined)) &&
      (area === "Inland Empire" || r.area.includes(area)) &&
      `${r.title} ${r.course} ${r.area}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  const shownCircles = state.circles.filter((c) =>
    `${c.name} ${c.category} ${c.area}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  const shownTournaments = state.tournaments.filter(
    (t) =>
      (!courseFilter || atCourse(t, courseFilter)) &&
      `${t.name} ${t.course} ${t.format}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  const chats = [
    "Clubhouse lounge",
    ...state.rounds.filter((r) => r.joined).map((r) => r.title),
    ...state.circles.filter((c) => c.joined).map((c) => c.name),
    ...state.tournaments.filter((t) => t.registered).map((t) => t.name),
  ];
  const chatMessages = state.messages[chat] || [];
  const joinedRounds = state.rounds.filter((r) => r.joined);
  function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    const result = messageSchema.safeParse({ text: message });
    if (!result.success) {
      setChatIssue("Write a message between 1 and 2,000 characters.");
      return;
    }
    setState((s) => ({
      ...s,
      messages: {
        ...s.messages,
        [chat]: [
          ...(s.messages[chat] || []),
          {
            id: previewId(),
            text: result.data.text,
            mine: true,
            author: s.profile.name,
            time: new Date().toLocaleTimeString([], {
              hour: "numeric",
              minute: "2-digit",
            }),
          },
        ],
      },
    }));
    setMessage("");
    setChatIssue("");
  }
  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobile ? "sidebar-open" : ""}`}>
        <div className="sidebar-logo">
          <Logo />
          <button
            className="icon-button mobile-menu"
            aria-label="Close navigation"
            onClick={() => setMobile(false)}
          >
            <X size={18} />
          </button>
        </div>
        <div className="sidebar-caption">YOUR GOLF COMMUNITY</div>
        <nav aria-label="App navigation">
          {navigation.map(({ id, label, Icon, path }) => (
            <Link key={id} href={path} className={view === id ? "active" : ""}>
              <Icon size={18} />
              <span>{label}</span>
              {id === "messages" && chats.length > 1 && (
                <span className="nav-count">{chats.length - 1}</span>
              )}
              {id === "notifications" && !state.read && (
                <span className="notification-dot" />
              )}
            </Link>
          ))}
        </nav>
        <div className="sidebar-organizer">
          <span className="sidebar-caption">A LITTLE MORE IN YOUR BAG</span>
          {state.profile.organizer ? (
            <nav>
              <Link
                className={view === "organizer" ? "active" : ""}
                href="/organizer"
              >
                <LayoutDashboard size={18} />
                Organizer dashboard
              </Link>
              <Link
                className={view === "events" ? "active" : ""}
                href="/organizer/events"
              >
                <CalendarDays size={18} />
                My events
              </Link>
              <Link
                className={view === "lab" ? "active" : ""}
                href="/organizer/lab"
              >
                <FlaskConical size={18} />
                Organizer Lab
              </Link>
            </nav>
          ) : (
            <button
              className="activate-organizer"
              onClick={() => setModal("organizer")}
            >
              <span className="organizer-icon">
                <Flag size={20} />
              </span>
              <b>Be the one who makes it happen.</b>
              <p>Put your next golf day together with Organizer Mode.</p>
              <span>
                Explore Organizer Mode <ArrowUpRight size={14} />
              </span>
            </button>
          )}
        </div>
        <div className="sidebar-bottom">
          <Link href="/app/profile" className="sidebar-person">
            <Avatar
              initials={state.profile.name
                .split(" ")
                .map((x) => x[0])
                .slice(0, 2)
                .join("")}
              src={state.profile.avatarUrl}
              alt={`${state.profile.name}'s profile photo`}
              color="#d4dfc9"
            />
            <div>
              <b>{state.profile.name}</b>
              <span>Golfer {state.profile.organizer ? "· Organizer" : ""}</span>
            </div>
            <ChevronRight size={15} />
          </Link>
          <Link className="back-site" href="/">
            Back to ForeCircle <ArrowUpRight size={12} />
          </Link>
        </div>
      </aside>
      {mobile && (
        <button
          className="sidebar-backdrop"
          aria-label="Close navigation"
          onClick={() => setMobile(false)}
        />
      )}
      <div className="app-main">
        <header className="app-topbar">
          <div className="mobile-app-logo">
            <button
              className="icon-button"
              onClick={() => setMobile(true)}
              aria-label="Open navigation"
            >
              <Menu size={20} />
            </button>
            <Logo />
          </div>
          <div className="app-breadcrumb">
            Your clubhouse <ChevronRight size={12} />
            <span>
              {view === "home"
                ? "Home"
                : view === "lab"
                  ? "Organizer Lab"
                  : view[0].toUpperCase() + view.slice(1)}
            </span>
          </div>
          <div className="app-top-actions">
            <span>
              <MapPin size={14} />
              {state.profile.area}
            </span>
            <Link
              href="/app/notifications"
              className="icon-button"
              aria-label="Notifications"
            >
              <Bell size={18} />
            </Link>
            <Link href="/app/profile">
              <Avatar
                initials={state.profile.name.slice(0, 2).toUpperCase()}
                src={state.profile.avatarUrl}
                alt={`${state.profile.name}'s profile photo`}
              />
            </Link>
          </div>
        </header>
        <div className="preview-banner">
          <span>
            <span className="live-dot" />
            <b>Welcome to the clubhouse preview.</b> Try it out—your changes
            stay in this browser.
          </span>
          <button
            onClick={() => {
              if (confirm("Reset all preview changes in this browser?")) {
                try {
                  localStorage.removeItem(courseCommunityKey);
                  localStorage.removeItem("forecircle-course-suggestions-v1");
                  window.dispatchEvent(new Event(courseMembershipEvent));
                } catch {}
                setState(initial);
                setCourseFilter("");
                setSearch("");
                notify("Your preview has been reset.");
              }
            }}
          >
            Reset preview
          </button>
        </div>
        <main className="dashboard-main">
          <div className="dashboard-heading">
            <div>
              <span className="eyebrow">
                {view === "home"
                  ? `GOOD TO SEE YOU, ${state.profile.name.split(" ")[0].toUpperCase()}`
                  : view === "lab"
                    ? "THE ORGANIZER LAB"
                    : "MEET. PLAY. COMPETE."}
              </span>
              <h1>{titles[view]}</h1>
              <p>
                {view === "home"
                  ? "More rounds. New friends. A little friendly competition."
                  : view === "rounds"
                    ? "A quick nine or a whole day out. Find something that fits."
                    : view === "circles"
                      ? "A golf club doesn’t need a clubhouse. It just needs good people."
                      : view === "lab"
                        ? "The next great ForeCircle feature could be your idea."
                        : "Every great golf day starts with a little connection."}
              </p>
            </div>
            {["home", "rounds"].includes(view) && (
              <button
                className="button primary"
                onClick={() => setModal("round")}
              >
                <Flag size={17} /> I want to golf <Plus size={17} />
              </button>
            )}
            {view === "circles" && (
              <button
                className="button primary"
                onClick={() =>
                  setModal(state.profile.organizer ? "circle" : "organizer")
                }
              >
                <Plus size={17} /> Start a Circle
              </button>
            )}
            {["tournaments", "organizer", "events"].includes(view) && (
              <button
                className="button primary"
                onClick={() =>
                  setModal(state.profile.organizer ? "tournament" : "organizer")
                }
              >
                <Plus size={17} /> Create tournament
              </button>
            )}
            {view === "lab" && (
              <button
                className="button primary"
                onClick={() =>
                  setModal(state.profile.organizer ? "idea" : "organizer")
                }
              >
                <Plus size={17} /> Share an idea
              </button>
            )}
          </div>
          {resolveCourse(courseFilter) && (
            <div className="course-filter-banner">
              <span>
                <MapPin size={16} />
                <b>{resolveCourse(courseFilter)!.name}</b>
              </span>
              <div>
                <Link href={`/courses/${resolveCourse(courseFilter)!.slug}`}>
                  Course community
                </Link>
                <button
                  className="text-link"
                  onClick={() => setCourseFilter("")}
                >
                  Show all courses <X size={14} />
                </button>
              </div>
            </div>
          )}
          {view === "home" && (
            <>
              <section className="app-hero">
                <div>
                  <span className="eyebrow">YOUR NEXT GREAT GOLF DAY</span>
                  <h2>
                    The course is calling.
                    <br />
                    Who’s coming with you?
                  </h2>
                  <p>Find an open round or get your own group going.</p>
                  <button
                    className="button cream small"
                    onClick={() => setModal("round")}
                  >
                    Let’s get a round going <ArrowUpRight size={17} />
                  </button>
                </div>
                <span className="app-hero-label">
                  <MapPin size={13} /> Find your fairway
                </span>
              </section>
              <div className="dashboard-section-title">
                <h2>Find your next round</h2>
                <Link href="/app/rounds" className="text-link">
                  All rounds <ArrowUpRight size={15} />
                </Link>
              </div>
              <div className="filter-tabs home-filters">
                {[
                  "All rounds",
                  "Today",
                  "Tomorrow",
                  "This weekend",
                  "Need one more",
                ].map((f) => (
                  <button
                    key={f}
                    className={filter === f ? "active" : ""}
                    onClick={() => setFilter(f)}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <div className="round-grid">
                {shownRounds.slice(0, 3).map((r) => (
                  <RoundCard key={r.id} round={r} onOpen={() => setRound(r)} />
                ))}
              </div>
              <div className="dashboard-two">
                <section>
                  <div className="dashboard-section-title">
                    <h2>Your Circles</h2>
                    <Link className="text-link" href="/app/circles">
                      Explore <ArrowUpRight size={15} />
                    </Link>
                  </div>
                  <div className="panel">
                    {state.circles.filter((c) => c.joined).length ? (
                      state.circles
                        .filter((c) => c.joined)
                        .map((c) => (
                          <button
                            className="list-row"
                            key={c.id}
                            onClick={() => setCircle(c)}
                          >
                            <span
                              className="circle-initials"
                              style={{ background: c.color }}
                            >
                              {c.initials}
                            </span>
                            <span>
                              <b>{c.name}</b>
                              <small>
                                {c.members} demo golfers · {c.area}
                              </small>
                            </span>
                            <ChevronRight size={17} />
                          </button>
                        ))
                    ) : (
                      <div className="small-empty">
                        <Users size={26} />
                        <h3>Your people are out here.</h3>
                        <p>Join a Circle to find your next regular crew.</p>
                        <Link href="/app/circles" className="text-link">
                          Find a Circle <ArrowRight size={15} />
                        </Link>
                      </div>
                    )}
                  </div>
                </section>
                <section>
                  <div className="dashboard-section-title">
                    <h2>On your calendar</h2>
                    <CalendarDays size={18} />
                  </div>
                  <div className="panel">
                    {joinedRounds.length ? (
                      joinedRounds.map((r) => (
                        <button
                          className="list-row"
                          key={r.id}
                          onClick={() => setRound(r)}
                        >
                          <span className="date-square">
                            <Flag size={20} />
                          </span>
                          <span>
                            <b>{r.title}</b>
                            <small>
                              {r.when} · {r.time}
                            </small>
                          </span>
                          <ChevronRight size={17} />
                        </button>
                      ))
                    ) : (
                      <div className="small-empty">
                        <CalendarDays size={26} />
                        <h3>Make room for a little golf.</h3>
                        <p>
                          Join a preview round and it will appear right here.
                        </p>
                        <Link href="/app/rounds" className="text-link">
                          Find a round <ArrowRight size={15} />
                        </Link>
                      </div>
                    )}
                  </div>
                </section>
              </div>
            </>
          )}
          {view === "rounds" && (
            <>
              <div className="app-filters">
                <label className="search-field">
                  <Search size={17} />
                  <input
                    placeholder="Search rounds or courses"
                    aria-label="Search rounds"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </label>
                <label className="select-field">
                  <MapPin size={15} />
                  <select
                    aria-label="Area"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                  >
                    {[
                      "Inland Empire",
                      "Temecula",
                      "Menifee",
                      "Corona",
                      "Murrieta",
                    ].map((a) => (
                      <option key={a}>{a}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} />
                </label>
              </div>
              <div className="filter-tabs spaced">
                {[
                  "All rounds",
                  "Today",
                  "Tomorrow",
                  "This weekend",
                  "Need one more",
                  "My rounds",
                ].map((f) => (
                  <button
                    className={filter === f ? "active" : ""}
                    onClick={() => setFilter(f)}
                    key={f}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <div className="round-grid">
                {shownRounds.map((r) => (
                  <RoundCard key={r.id} round={r} onOpen={() => setRound(r)} />
                ))}
                {!shownRounds.length && (
                  <Empty
                    title="No rounds just yet."
                    text="Try another filter or start a round of your own."
                    action="Create a round"
                    onClick={() => setModal("round")}
                  />
                )}
              </div>
            </>
          )}
          {view === "circles" && (
            <>
              <SearchBox
                value={search}
                onChange={setSearch}
                placeholder="Search Circles, interests, or areas"
              />
              <div className="circle-teasers app-circle-grid">
                {shownCircles.map((c) => (
                  <article className="circle-teaser" key={c.id}>
                    <button
                      className="circle-image-button"
                      onClick={() => setCircle(c)}
                      aria-label={`View ${c.name}`}
                    >
                      <div className="circle-teaser-image">
                        <img src={c.image} alt="Golf course landscape" />
                        <span
                          className="circle-badge"
                          style={{ background: c.color }}
                        >
                          <span>{c.initials}</span>
                        </span>
                        <span className="circle-category">{c.category}</span>
                      </div>
                    </button>
                    <div className="circle-teaser-body">
                      <h3>
                        <button className="plain" onClick={() => setCircle(c)}>
                          {c.name}
                        </button>
                      </h3>
                      <p>{c.description}</p>
                      <div>
                        <span>
                          <Users size={14} />
                          {c.members} demo golfers
                        </span>
                        <button
                          className="join-small"
                          onClick={() => joinCircle(c)}
                        >
                          {c.joined ? (
                            <>
                              <Check size={14} />
                              Joined
                            </>
                          ) : (
                            <>
                              Join Circle <Plus size={14} />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
              {!shownCircles.length && (
                <Empty
                  title="There’s room for your Circle."
                  text="Try a different search or start a community."
                  action="Start a Circle"
                  onClick={() =>
                    setModal(state.profile.organizer ? "circle" : "organizer")
                  }
                />
              )}
            </>
          )}
          {view === "tournaments" && (
            <>
              <SearchBox
                value={search}
                onChange={setSearch}
                placeholder="Search tournaments, formats, or courses"
              />
              <div className="tournament-grid">
                {shownTournaments.map((t) => (
                  <TournamentCard
                    key={t.id}
                    tournament={t}
                    onClick={() => setTournament(t)}
                  />
                ))}
              </div>
              {!shownTournaments.length && (
                <Empty
                  title="No tournaments match."
                  text="Try another course or format."
                  action="Clear search"
                  onClick={() => setSearch("")}
                />
              )}
            </>
          )}
          {view === "messages" && (
            <div className="messenger">
              <aside className="chat-list">
                <div className="chat-list-heading">
                  <h3>Your conversations</h3>
                  <span>{chats.length}</span>
                </div>
                {chats.map((c, i) => (
                  <button
                    key={c}
                    onClick={() => setChat(c)}
                    className={chat === c ? "active" : ""}
                  >
                    <span className="chat-avatar">
                      {i === 0 ? <Flag size={20} /> : <Users size={20} />}
                    </span>
                    <span>
                      <b>{c}</b>
                      <small>
                        {state.messages[c]?.at(-1)?.text ||
                          "Say hello to your crew"}
                      </small>
                    </span>
                  </button>
                ))}
              </aside>
              <section className="chat-window">
                <div className="chat-header">
                  <span className="chat-avatar">
                    <Users size={20} />
                  </span>
                  <div>
                    <h3>{chat}</h3>
                    <small>
                      Preview conversation · messages stay on this device
                    </small>
                  </div>
                  <button
                    className="icon-button"
                    aria-label="Conversation privacy"
                    onClick={() =>
                      setChatIssue(
                        "This demo conversation has no real recipients. Live messaging and reporting will be enabled after the backend is connected.",
                      )
                    }
                  >
                    <Shield size={17} />
                  </button>
                </div>
                <div className="chat-body">
                  <div className="chat-day">THE START OF A GOOD GOLF STORY</div>
                  <div className="chat-welcome">
                    <Flag size={24} />
                    <p>A round starts with a hello.</p>
                    <span>
                      Use this space to try the conversation experience.
                      <br />
                      No messages are sent to other people.
                    </span>
                  </div>
                  {chatMessages.map((m) => (
                    <div className="message-bubble" key={m.id}>
                      <p>{m.text}</p>
                      <span>
                        {m.time} <CheckCheck size={12} />
                      </span>
                    </div>
                  ))}
                </div>
                {chatIssue && (
                  <p className="form-error" role="status">
                    {chatIssue}
                  </p>
                )}
                <form className="message-compose" onSubmit={sendMessage}>
                  <input
                    aria-label="Message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="A little hello goes a long way…"
                    maxLength={2000}
                  />
                  <button
                    className="send-button"
                    type="submit"
                    aria-label="Send preview message"
                    disabled={!message.trim()}
                  >
                    <Send size={18} />
                  </button>
                </form>
              </section>
            </div>
          )}
          {view === "notifications" && (
            <div className="panel notification-panel">
              <div className="panel-heading">
                <h3>Your latest updates</h3>
                <button
                  className="text-link"
                  onClick={() => {
                    setState((s) => ({ ...s, read: true }));
                    notify("All preview notifications marked as read.");
                  }}
                >
                  <CheckCheck size={16} />
                  Mark all as read
                </button>
              </div>
              {[
                {
                  Icon: Flag,
                  title: "Welcome to ForeCircle",
                  text: "Your next great golf day starts with good company. Take a look around.",
                  time: "Just now",
                },
                {
                  Icon: Users,
                  title: "Your people are out here",
                  text: "Explore sample Circles around the Inland Empire.",
                  time: "Getting started",
                },
                {
                  Icon: FlaskConical,
                  title: "Built with organizers, for organizers",
                  text: "Activate Organizer Mode to try the Organizer Lab.",
                  time: "A little inspiration",
                },
              ].map(({ Icon, title, text, time }) => (
                <div
                  className={`notification-row ${state.read ? "read" : ""}`}
                  key={title}
                >
                  <span className="chat-avatar">
                    <Icon size={20} />
                  </span>
                  <div>
                    <b>{title}</b>
                    <p>{text}</p>
                    <small>{time} · Preview</small>
                  </div>
                  {!state.read && <span className="notification-dot" />}
                </div>
              ))}
            </div>
          )}
          {view === "profile" && (
            <>
              <GolferProfilePage
                profile={state.profile}
                rounds={state.rounds}
                circles={state.circles}
                tournaments={state.tournaments}
                onEdit={(tab) => {
                  setProfileTab(tab);
                  setModal("profile");
                }}
                onActivate={() => {
                  setProfileTab("Organizer");
                  setModal("profile");
                }}
                onRound={setRound}
                onCircle={setCircle}
                onTournament={setTournament}
              />
              <div className="dashboard-two">
                <section className="panel settings-panel">
                  <h3>Make golf your own</h3>
                  <p>Your profile stays yours when you organize.</p>
                  <div className="settings-row">
                    <span>
                      <b>Organizer Mode</b>
                      <small>
                        Create tournaments, start Circles, and share ideas.
                      </small>
                    </span>
                    <button
                      role="switch"
                      aria-checked={state.profile.organizer}
                      aria-label="Organizer Mode"
                      className={`toggle ${state.profile.organizer ? "on" : ""}`}
                      onClick={() => {
                        setState((s) => ({
                          ...s,
                          profile: {
                            ...s.profile,
                            organizer: !s.profile.organizer,
                          },
                        }));
                        notify("Organizer Mode updated for your preview.");
                      }}
                    >
                      <span />
                    </button>
                  </div>
                </section>
                <section className="panel settings-panel">
                  <h3>Privacy comes first</h3>
                  <p>Your exact home address never belongs on your profile.</p>
                  <label className="field-label">
                    Who can message me?
                    <select
                      value={privacy}
                      onChange={(e) => {
                        setPrivacy(e.target.value);
                        notify(
                          "Preference preview updated. Live privacy controls are not connected yet.",
                        );
                      }}
                    >
                      <option>Circle members</option>
                      <option>People I follow</option>
                      <option>Everyone</option>
                    </select>
                  </label>
                  <small className="muted">
                    This control previews your future account settings.
                  </small>
                </section>
              </div>
            </>
          )}
          {["organizer", "events"].includes(view) &&
            (!state.profile.organizer ? (
              <Empty
                title="You’re already a golfer. Now bring people together."
                text="Organizer Mode adds tools to this same profile—your community comes with you."
                action="Activate preview Organizer Mode"
                onClick={() => setModal("organizer")}
              />
            ) : (
              <>
                <div className="metric-grid">
                  {[
                    {
                      label: "Preview events",
                      n: state.tournaments.length,
                      Icon: Trophy,
                    },
                    {
                      label: "Demo registrations",
                      n: state.tournaments.reduce((a, t) => a + t.players, 0),
                      Icon: Users,
                    },
                    {
                      label: "Circles joined",
                      n: state.circles.filter((c) => c.joined).length,
                      Icon: Flag,
                    },
                    {
                      label: "Ideas in the Lab",
                      n: state.ideas.length,
                      Icon: FlaskConical,
                    },
                  ].map(({ label, n, Icon }) => (
                    <div className="metric" key={label}>
                      <div>
                        <span>{label}</span>
                        <Icon size={18} />
                      </div>
                      <b>{n}</b>
                      <small>Illustrative preview data</small>
                    </div>
                  ))}
                </div>
                <div className="dashboard-section-title">
                  <h2>Your event playbook</h2>
                  <span className="muted">All events below are examples</span>
                </div>
                <div className="panel organizer-table">
                  <div className="table-row table-header">
                    <span>EVENT</span>
                    <span>FORMAT</span>
                    <span>PLAYERS</span>
                    <span />
                  </div>
                  {state.tournaments.map((t) => (
                    <div className="table-row" key={t.id}>
                      <div className="event-cell">
                        <span className="date-square">
                          <b>{t.date.split(" ")[1]}</b>
                          <small>{t.date.split(" ")[0]}</small>
                        </span>
                        <span>
                          <b>{t.name}</b>
                          <small>{t.course}</small>
                        </span>
                      </div>
                      <span>{t.format}</span>
                      <span>
                        {t.players} / {t.capacity}
                      </span>
                      <button
                        className="text-link"
                        onClick={() => setTournament(t)}
                      >
                        View <ArrowUpRight size={15} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="lab-callout">
                  <FlaskConical size={29} />
                  <div>
                    <h3>What would make organizing easier?</h3>
                    <p>Tell us what should be in your next toolkit.</p>
                  </div>
                  <Link
                    href="/organizer/lab"
                    className="button secondary small"
                  >
                    Enter the Lab <ArrowUpRight size={16} />
                  </Link>
                </div>
              </>
            ))}
          {view === "lab" && (
            <>
              <div className="lab-intro">
                <FlaskConical size={26} />
                <p>
                  Big ideas start with the people on the course. Explore the
                  sample roadmap, vote, and try submitting an idea.
                </p>
                <span>PREVIEW ROADMAP</span>
              </div>
              <div className="filter-tabs spaced">
                {[
                  "All ideas",
                  "Under review",
                  "Planned",
                  "Building",
                  "Released",
                ].map((f) => (
                  <button
                    className={labFilter === f ? "active" : ""}
                    key={f}
                    onClick={() => setLabFilter(f)}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <div className="ideas-list">
                {state.ideas
                  .filter(
                    (i) => labFilter === "All ideas" || i.status === labFilter,
                  )
                  .sort((a, b) => b.votes - a.votes)
                  .map((i) => (
                    <article className="idea-row" key={i.id}>
                      <button
                        className={`vote-button ${i.voted ? "voted" : ""}`}
                        aria-label={`${i.voted ? "Remove vote for" : "Vote for"} ${i.title}`}
                        onClick={() => {
                          if (!state.profile.organizer) {
                            setModal("organizer");
                            return;
                          }
                          setState((s) => ({
                            ...s,
                            ideas: s.ideas.map((x) =>
                              x.id === i.id
                                ? {
                                    ...x,
                                    voted: !x.voted,
                                    votes: x.votes + (x.voted ? -1 : 1),
                                  }
                                : x,
                            ),
                          }));
                        }}
                      >
                        <ThumbsUp size={16} />
                        <b>{i.votes}</b>
                      </button>
                      <div>
                        <div className="idea-meta">
                          <span>{i.category}</span>
                          <span
                            className={`status-pill status-${i.status.replace(" ", "-").toLowerCase()}`}
                          >
                            {i.status}
                          </span>
                        </div>
                        <h3>{i.title}</h3>
                        <p>{i.description}</p>
                        <small>{i.votes} demo organizers want this</small>
                      </div>
                    </article>
                  ))}
                {!state.ideas.filter(
                  (i) => labFilter === "All ideas" || i.status === labFilter,
                ).length && (
                  <Empty
                    title="The next chapter is still ahead."
                    text="No preview ideas in this stage. Browse the other roadmap stages."
                    action="View all ideas"
                    onClick={() => setLabFilter("All ideas")}
                  />
                )}
              </div>
            </>
          )}
          {view === "admin" && (
            <Empty
              title="Admin access is not enabled."
              text="The production control center requires a verified platform role and a connected backend. No admin privileges are granted in this preview."
              action="Back to your clubhouse"
              onClick={() => window.location.assign("/app/")}
            />
          )}
          <p className="app-footnote">
            FORECIRCLE · MEET. PLAY. COMPETE.{" "}
            <span>Community preview · no live bookings or messages</span>
          </p>
        </main>
      </div>
      <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
        {navigation
          .filter((n) =>
            ["home", "rounds", "circles", "tournaments", "messages"].includes(
              n.id,
            ),
          )
          .map(({ id, Icon, label, path }) => (
            <Link key={id} href={path} className={view === id ? "active" : ""}>
              <Icon size={19} />
              <span>{id === "rounds" ? "Rounds" : label}</span>
            </Link>
          ))}
      </nav>
      {toast && (
        <div className="toast" role="status">
          <Check size={18} />
          {toast}
        </div>
      )}
      {round && (
        <RoundDetail
          round={round}
          onClose={() => setRound(null)}
          onJoin={() => joinRound(round)}
        />
      )}
      {circle && (
        <Modal title={circle.name} onClose={() => setCircle(null)}>
          <img
            className="detail-image"
            src={circle.image}
            alt="Golf course landscape"
          />
          <p className="eyebrow">YOUR DIGITAL GOLF CLUB · PREVIEW</p>
          <p className="modal-description">{circle.description}</p>
          <p className="muted">
            <MapPin size={14} /> {circle.area} · {circle.members} demo members
          </p>
          <div className="notice">
            Sample community. Joining adds this Circle to your local preview and
            opens a demo group conversation.
          </div>
          <button
            className="button primary full"
            onClick={() => joinCircle(circle)}
          >
            {circle.joined ? "Leave preview Circle" : "Join preview Circle"}
            <Users size={17} />
          </button>
        </Modal>
      )}
      {tournament && (
        <Modal title={tournament.name} onClose={() => setTournament(null)}>
          <img
            className="detail-image"
            src={tournament.image}
            alt="Golf fairway"
          />
          <p className="eyebrow">{tournament.format} · PREVIEW EVENT</p>
          <h3 className="detail-course">{tournament.course}</h3>
          {resolveCourse(tournament.courseId || tournament.course) && (
            <Link
              className="text-link"
              href={`/courses/${resolveCourse(tournament.courseId || tournament.course)!.slug}`}
            >
              Meet the course community <Users size={15} />
            </Link>
          )}
          <p className="muted">
            {tournament.date} · {tournament.time} · {tournament.area}
          </p>
          <div className="event-capacity">
            <Users size={18} />
            <b>{tournament.capacity - tournament.players} spots left</b>
            <span>
              {tournament.players}/{tournament.capacity} golfers
            </span>
          </div>
          <h4>A little friendly competition</h4>
          <div className="round-tags">
            {tournament.challenges.map((c) => (
              <span key={c}>
                <Trophy size={12} />
                {c}
              </span>
            ))}
          </div>
          <div className="notice">
            This is an example tournament. Registration does not reserve a tee
            time or charge you. No wagering or payout pools.
          </div>
          <button
            className="button primary full"
            onClick={() => register(tournament)}
          >
            {tournament.registered
              ? "Cancel preview registration"
              : "Register in preview"}
            <ArrowRight size={17} />
          </button>
          {demoTournaments.some((t) => t.id === tournament.id) && (
            <button
              className="button secondary full"
              onClick={() =>
                setShare({
                  title: tournament.name,
                  path: `/t/${tournament.id}`,
                })
              }
            >
              <Share2 size={16} />
              Share preview event
            </button>
          )}
        </Modal>
      )}
      {modal === "organizer" && (
        <Modal
          title="Same golfer. Bigger plans."
          onClose={() => setModal(null)}
        >
          <div className="organizer-modal-icon">
            <Flag size={34} />
          </div>
          <p className="modal-description">
            Organizer Mode gives your golfer profile a few more tools. You still
            join rounds, follow your people, and play your game.
          </p>
          <ul className="feature-list">
            <li>
              <Check size={17} />
              Create tournaments and Circles
            </li>
            <li>
              <Check size={17} />
              Explore the organizer dashboard
            </li>
            <li>
              <Check size={17} />
              Help shape ForeCircle in the Organizer Lab
            </li>
          </ul>
          <div className="notice">
            You’re activating the preview. Real event management opens when the
            live community launches.
          </div>
          <button
            className="button primary full"
            onClick={() => {
              setState((s) => ({
                ...s,
                profile: { ...s.profile, organizer: true },
              }));
              setModal(pendingTournament.current ? "tournament" : null);
              pendingTournament.current = false;
              notify(
                "Organizer Mode is on. Your golfer profile stays right here.",
              );
            }}
          >
            Activate preview Organizer Mode <ArrowUpRight size={17} />
          </button>
        </Modal>
      )}
      {modal === "round" && (
        <RoundWizard
          initialCourseId={courseFilter}
          onClose={() => setModal(null)}
          onCreate={(r) => {
            if (courseFilter) setCourseFilter(r.courseId || "");
            setSearch("");
            setArea("Inland Empire");
            setState((s) => ({
              ...s,
              rounds: [{ ...r, createdByMe: true }, ...s.rounds],
            }));
            setModal(null);
            setFilter("All rounds");
            notify(
              "Your round is in the preview. It has not been published to other golfers.",
            );
          }}
          host={state.profile.name}
        />
      )}
      {modal === "circle" && (
        <CreateCircle
          onClose={() => setModal(null)}
          onCreate={(c) => {
            setState((s) => ({
              ...s,
              circles: [{ ...c, createdByMe: true }, ...s.circles],
            }));
            setModal(null);
            notify("Your new Circle is saved in this browser’s preview.");
          }}
        />
      )}
      {modal === "tournament" && (
        <CreateTournament
          initialCourseId={courseFilter}
          onClose={() => setModal(null)}
          onCreate={(t) => {
            if (courseFilter) setCourseFilter(t.courseId || "");
            setSearch("");
            setState((s) => ({
              ...s,
              tournaments: [{ ...t, createdByMe: true }, ...s.tournaments],
            }));
            setModal(null);
            notify(
              "Tournament created in your preview. Public publishing is not enabled.",
            );
          }}
        />
      )}
      {modal === "idea" && (
        <CreateIdea
          onClose={() => setModal(null)}
          onCreate={(i) => {
            setState((s) => ({ ...s, ideas: [i, ...s.ideas] }));
            setLabFilter("All ideas");
            setModal(null);
            notify(
              "Your idea is saved in the preview. It has not been submitted to the team.",
            );
          }}
        />
      )}
      {modal === "profile" && (
        <EditGolferProfile
          initialTab={profileTab}
          profile={state.profile}
          onClose={() => setModal(null)}
          onSave={(p) => {
            const next = { ...state, profile: p };
            try {
              localStorage.setItem(key, JSON.stringify(next));
            } catch {
              return "This browser could not save your profile. Free up browser storage or remove the photo and try again.";
            }
            setState(next);
            setModal(null);
            notify("Your profile is saved in this browser’s preview.");
            return null;
          }}
        />
      )}
      {share && (
        <ShareModal
          title={share.title}
          path={share.path}
          onClose={() => setShare(null)}
        />
      )}
    </div>
  );
}
function SearchBox({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (s: string) => void;
  placeholder: string;
}) {
  return (
    <label className="search-field wide-search">
      <Search size={17} />
      <input
        aria-label={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {value && (
        <button aria-label="Clear search" onClick={() => onChange("")}>
          <X size={15} />
        </button>
      )}
    </label>
  );
}
function Empty({
  title,
  text,
  action,
  onClick,
}: {
  title: string;
  text: string;
  action: string;
  onClick: () => void;
}) {
  return (
    <div className="empty-state">
      <Flag size={29} />
      <h3>{title}</h3>
      <p>{text}</p>
      <button className="button primary small" onClick={onClick}>
        {action}
        <ArrowRight size={15} />
      </button>
    </div>
  );
}
export function TournamentCard({
  tournament: t,
  onClick,
}: {
  tournament: Tournament;
  onClick: () => void;
}) {
  return (
    <article className="tournament-card">
      <button
        className="tournament-image"
        onClick={onClick}
        aria-label={`View ${t.name}`}
      >
        <img src={t.image} alt="A scenic golf course" />
        <span className="date-square">
          <b>{t.date.split(" ")[1]}</b>
          <small>{t.date.split(" ")[0]}</small>
        </span>
        <span className="image-label">{t.format}</span>
      </button>
      <div className="tournament-content">
        <span className="eyebrow">A LITTLE FRIENDLY COMPETITION</span>
        <h3>
          <button className="plain" onClick={onClick}>
            {t.name}
          </button>
        </h3>
        <p>
          <MapPin size={13} />
          {t.course}
        </p>
        <div className="round-tags">
          {t.challenges.slice(0, 2).map((c) => (
            <span key={c}>
              <Trophy size={11} />
              {c}
            </span>
          ))}
        </div>
        <div className="tournament-footer">
          <span>
            <Users size={14} />
            {t.capacity - t.players} spots left
          </span>
          <button className="join-small" onClick={onClick}>
            {t.registered ? "Registered" : "View tournament"}
            <ArrowUpRight size={15} />
          </button>
        </div>
      </div>
    </article>
  );
}
function RoundWizard({
  onClose,
  onCreate,
  host,
  initialCourseId,
}: {
  initialCourseId?: string;
  onClose: () => void;
  onCreate: (r: Round) => void;
  host: string;
}) {
  const [step, setStep] = useState(1),
    [when, setWhen] = useState("Tomorrow"),
    [date, setDate] = useState(""),
    [courseId, setCourseId] = useState(initialCourseId || courses[0].id),
    [time, setTime] = useState("8:40 AM"),
    [holes, setHoles] = useState<9 | 18>(18),
    [spots, setSpots] = useState(2),
    [style, setStyle] = useState<Round["style"]>("Casual"),
    [title, setTitle] = useState("A round with good company"),
    [notes, setNotes] = useState(""),
    [error, setError] = useState("");
  const selectedCourse = resolveCourse(courseId);
  const course = selectedCourse?.name || "";
  const today = new Date().toLocaleDateString("en-CA");
  function publish() {
    let d = new Date();
    if (when === "Tomorrow") d.setDate(d.getDate() + 1);
    if (when === "This weekend")
      d.setDate(d.getDate() + ((6 - d.getDay() + 7) % 7));
    const selectedDate =
      when === "Choose date" ? date : d.toLocaleDateString("en-CA");
    const result = roundSchema.safeParse({
      title,
      course,
      date: selectedDate,
      time,
      holes,
      spots,
      notes,
    });
    if (!result.success || !selectedCourse) {
      setError("Add a title, course, date, and time to get your round going.");
      return;
    }
    if (selectedDate < today) {
      setError("Choose today or a future date.");
      return;
    }
    onCreate({
      id: previewId(),
      title: result.data.title,
      course,
      courseId: selectedCourse.id,
      area: `${selectedCourse.city}, ${selectedCourse.state}`,
      when:
        when === "Choose date"
          ? new Date(date + "T12:00:00").toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })
          : when,
      time,
      holes,
      spots,
      style,
      host: host.split(" ")[0],
      initials: host
        .split(" ")
        .map((x) => x[0])
        .slice(0, 2)
        .join(""),
      color: "#d6e2d5",
      image: "/images/hero.jpg",
      joined: true,
      date: selectedDate,
      notes,
    });
  }
  return (
    <Modal title="Let’s get a round going." onClose={onClose}>
      <div className="wizard-progress">
        {["When & where", "Your kind of round", "Ready to play"].map((x, i) => (
          <span className={step >= i + 1 ? "active" : ""} key={x}>
            <b>{i + 1}</b>
            {x}
          </span>
        ))}
      </div>
      {step === 1 && (
        <>
          <h3 className="form-section-title">When are you thinking?</h3>
          <div className="choice-grid">
            {["Today", "Tomorrow", "This weekend", "Choose date"].map((w) => (
              <button
                className={when === w ? "selected" : ""}
                onClick={() => setWhen(w)}
                key={w}
              >
                {w}
              </button>
            ))}
          </div>
          {when === "Choose date" && (
            <label className="field-label">
              Pick a date
              <input
                type="date"
                value={date}
                min={today}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>
          )}
          <CoursePicker
            value={courseId}
            onChange={setCourseId}
            label="Where are we playing?"
          />
          <label className="field-label">
            What time?
            <select value={time} onChange={(e) => setTime(e.target.value)}>
              {[
                "7:00 AM",
                "8:40 AM",
                "9:00 AM",
                "10:00 AM",
                "12:00 PM",
                "2:30 PM",
                "3:20 PM",
              ].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
        </>
      )}
      {step === 2 && (
        <>
          <h3 className="form-section-title">Make it your kind of golf.</h3>
          <label className="field-label">Round length</label>
          <div className="choice-grid">
            {([9, 18] as const).map((n) => (
              <button
                className={holes === n ? "selected" : ""}
                key={n}
                onClick={() => setHoles(n)}
              >
                {n} holes
              </button>
            ))}
          </div>
          <label className="field-label">How many golfers do you need?</label>
          <div className="choice-grid three">
            {[1, 2, 3].map((n) => (
              <button
                className={spots === n ? "selected" : ""}
                key={n}
                onClick={() => setSpots(n)}
              >
                {n} {n === 1 ? "golfer" : "golfers"}
              </button>
            ))}
          </div>
          <label className="field-label">
            The vibe
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value as Round["style"])}
            >
              {[
                "Casual",
                "Competitive",
                "Beginner friendly",
                "Networking",
                "Practice",
                "Social",
                "Just for fun",
              ].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
        </>
      )}
      {step === 3 && (
        <>
          <label className="field-label">
            Give your round a name
            <input
              value={title}
              maxLength={100}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>
          <label className="field-label">
            Anything your crew should know? <span>Optional</span>
            <textarea
              placeholder="Walking, riding, or grabbing a bite after?"
              value={notes}
              maxLength={1000}
              onChange={(e) => setNotes(e.target.value)}
            />
          </label>
          <div className="round-summary">
            <Flag size={24} />
            <div>
              <b>{course}</b>
              <p>
                {when} · {time} · {holes} holes
              </p>
              <span>
                {spots} spots · {style}
              </span>
            </div>
          </div>
          <div className="notice">
            Preview only. This round stays in your browser and does not book a
            tee time.
          </div>
        </>
      )}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <div className="wizard-actions">
        {step > 1 ? (
          <button
            className="button secondary"
            onClick={() => {
              setStep(step - 1);
              setError("");
            }}
          >
            Back
          </button>
        ) : (
          <button className="text-link" onClick={onClose}>
            Maybe later
          </button>
        )}
        <button
          className="button primary"
          onClick={() => {
            if (
              step === 1 &&
              when === "Choose date" &&
              (!date || date < today)
            ) {
              setError("Choose today or a future date.");
              return;
            }
            setError("");
            step < 3 ? setStep(step + 1) : publish();
          }}
        >
          {step === 3 ? "Create preview round" : "Keep going"}
          <ArrowRight size={16} />
        </button>
      </div>
    </Modal>
  );
}
function CreateCircle({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (c: Circle) => void;
}) {
  const [error, setError] = useState("");
  return (
    <Modal title="Your club starts here." onClose={onClose}>
      <p className="muted">
        Good people. A shared love of golf. That’s a Circle.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const d = new FormData(e.currentTarget);
          const name = String(d.get("name")).trim();
          if (name.length < 3) {
            setError("Give your Circle a name with at least 3 characters.");
            return;
          }
          onCreate({
            id: previewId(),
            name,
            description: String(d.get("description")).trim(),
            area: String(d.get("area")),
            category: String(d.get("category")),
            members: 1,
            initials: name
              .split(" ")
              .map((x) => x[0])
              .slice(0, 2)
              .join("")
              .toUpperCase(),
            image: "/images/course-2.jpg",
            color: "#385f4a",
            joined: true,
          });
        }}
      >
        <label className="field-label">
          Circle name
          <input
            name="name"
            placeholder="The Sunday Regulars"
            required
            minLength={3}
            maxLength={80}
          />
        </label>
        <label className="field-label">
          What brings your people together?
          <textarea
            name="description"
            placeholder="Tell golfers a little about your crew."
            required
            maxLength={500}
          />
        </label>
        <label className="field-label">
          General area
          <input
            name="area"
            defaultValue="Inland Empire, CA"
            required
            maxLength={100}
          />
        </label>
        <label className="field-label">
          Your kind of Circle
          <select name="category">
            <option>Social golf</option>
            <option>Beginner friendly</option>
            <option>Weekend regulars</option>
            <option>Community</option>
            <option>Competitive</option>
          </select>
        </label>
        <div className="notice">
          Your preview Circle is saved only in this browser.
        </div>
        {error && <p className="form-error">{error}</p>}
        <button type="submit" className="button primary full">
          Create preview Circle <ArrowRight size={17} />
        </button>
      </form>
    </Modal>
  );
}
function CreateTournament({
  onClose,
  onCreate,
  initialCourseId,
}: {
  initialCourseId?: string;
  onClose: () => void;
  onCreate: (t: Tournament) => void;
}) {
  const [challenges, setChallenges] = useState([
      "Closest to pin",
      "Longest drive",
    ]),
    [step, setStep] = useState(1),
    [name, setName] = useState(""),
    [courseId, setCourseId] = useState(initialCourseId || courses[0].id),
    [date, setDate] = useState(""),
    [time, setTime] = useState("08:00"),
    [format, setFormat] = useState("4-Man Scramble"),
    [capacity, setCapacity] = useState(32),
    [error, setError] = useState("");
  const selectedCourse = resolveCourse(courseId);
  return (
    <Modal title="A great golf day starts here." onClose={onClose}>
      <div className="wizard-progress">
        <span className="active">
          <b>1</b>The basics
        </span>
        <span className={step === 2 ? "active" : ""}>
          <b>2</b>The fun stuff
        </span>
      </div>
      {step === 1 ? (
        <>
          <label className="field-label">
            Tournament name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              placeholder="Saturday Hackers Scramble"
            />
          </label>
          <CoursePicker
            value={courseId}
            onChange={setCourseId}
            label="Tournament course"
          />
          <div className="form-two">
            <label className="field-label">
              Date
              <input
                type="date"
                value={date}
                min={new Date().toLocaleDateString("en-CA")}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>
            <label className="field-label">
              Start time
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </label>
          </div>
          <div className="form-two">
            <label className="field-label">
              Format
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
              >
                {[
                  "Stroke Play",
                  "Match Play",
                  "Scramble",
                  "2-Man Scramble",
                  "4-Man Scramble",
                  "Best Ball",
                  "Stableford",
                  "Team vs Team",
                  "Ryder Cup Style",
                  "Charity Tournament",
                  "Custom",
                ].map((f) => (
                  <option key={f}>{f}</option>
                ))}
              </select>
            </label>
            <label className="field-label">
              Player capacity
              <input
                type="number"
                value={capacity}
                min={2}
                max={200}
                onChange={(e) => setCapacity(Number(e.target.value))}
              />
            </label>
          </div>
        </>
      ) : (
        <>
          <h3 className="form-section-title">
            Give them something to talk about.
          </h3>
          <p className="muted">
            Choose your side competitions. No wagering or automated payouts.
          </p>
          <div className="challenge-options">
            {[
              "Closest to pin",
              "Longest drive",
              "Most birdies",
              "Longest putt",
              "Low gross",
              "Low net",
              "Beat the organizer",
            ].map((c) => (
              <label key={c}>
                <input
                  type="checkbox"
                  checked={challenges.includes(c)}
                  onChange={() =>
                    setChallenges(
                      challenges.includes(c)
                        ? challenges.filter((x) => x !== c)
                        : [...challenges, c],
                    )
                  }
                />
                {c}
              </label>
            ))}
          </div>
          <div className="round-summary">
            <Trophy size={27} />
            <div>
              <b>{name}</b>
              <p>
                {format} · {capacity} golfers
              </p>
              <span>
                {date} · {time}
              </span>
            </div>
          </div>
          <div className="notice">
            This creates a local preview event. Live registrations, participant
            management, and public publishing are not connected yet.
          </div>
        </>
      )}
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      <div className="wizard-actions">
        <button
          className="button secondary"
          onClick={() => (step === 1 ? onClose() : setStep(1))}
        >
          {step === 1 ? "Cancel" : "Back"}
        </button>
        <button
          className="button primary"
          onClick={() => {
            if (
              name.trim().length < 3 ||
              !selectedCourse ||
              !date ||
              date < new Date().toLocaleDateString("en-CA") ||
              !time ||
              capacity < 2 ||
              capacity > 200 ||
              !Number.isInteger(capacity)
            ) {
              setError(
                "Add a name, course, future date, time, and a capacity from 2 to 200.",
              );
              return;
            }
            setError("");
            if (step === 1) {
              setStep(2);
              return;
            }
            const d = new Date(date + "T12:00:00");
            onCreate({
              id: previewId(),
              name: name.trim(),
              course: selectedCourse.name,
              courseId: selectedCourse.id,
              area: `${selectedCourse.city}, ${selectedCourse.state}`,
              date: d
                .toLocaleDateString("en-US", { month: "short", day: "2-digit" })
                .toUpperCase(),
              time: new Date(date + "T" + time).toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
              }),
              format,
              players: 0,
              capacity,
              image: "/images/course-3.jpg",
              challenges,
            });
          }}
        >
          {step === 1 ? "Keep going" : "Create preview event"}
          <ArrowRight size={16} />
        </button>
      </div>
    </Modal>
  );
}
function CreateIdea({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (i: Idea) => void;
}) {
  return (
    <Modal title="What would make golf better?" onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const d = new FormData(e.currentTarget);
          onCreate({
            id: previewId(),
            title: String(d.get("title")).trim(),
            description: String(d.get("description")).trim(),
            category: String(d.get("category")),
            votes: 1,
            voted: true,
            status: "Under review",
          });
        }}
      >
        <label className="field-label">
          Give your idea a name
          <input
            name="title"
            placeholder="A better way to…"
            required
            minLength={5}
            maxLength={120}
          />
        </label>
        <label className="field-label">
          What problem would it solve?
          <textarea
            name="description"
            placeholder="Tell us about the moment you wished this existed."
            required
            minLength={15}
            maxLength={2000}
          />
        </label>
        <label className="field-label">
          Category
          <select name="category">
            {[
              "Tournament",
              "Registration",
              "Scoring",
              "Circles",
              "Chat",
              "Payments",
              "Marketing",
              "Course Management",
              "Organizer Tools",
              "Other",
            ].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
        <div className="notice">
          This is a preview submission. Your idea stays in this browser until
          live community features launch.
        </div>
        <button className="button primary full">
          Save preview idea <ArrowRight size={17} />
        </button>
      </form>
    </Modal>
  );
}
