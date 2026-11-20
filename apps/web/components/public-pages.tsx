"use client";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowUpRight,
  Flag,
  MapPin,
  Users,
  Trophy,
  Share2,
  ArrowRight,
  Check,
} from "lucide-react";
import { Logo, RoundDetail } from "./ui";
import { Footer } from "./marketing";
import { demoCircles, demoTournaments } from "./demo-data";
import { TournamentCard } from "./dashboard";
import { ShareModal } from "./sharing";
export function PublicHeader() {
  return (
    <header className="public-page-header">
      <Logo />
      <Link className="button primary small" href="/app">
        Step inside <ArrowUpRight size={16} />
      </Link>
    </header>
  );
}
export function PublicListing({ kind }: { kind: "circles" | "tournaments" }) {
  const [search, setSearch] = useState("");
  const circles = demoCircles.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );
  const tournaments = demoTournaments.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <>
      <PublicHeader />
      <main>
        <div className="public-page-intro">
          <span className="eyebrow">
            {kind === "circles"
              ? "A CLUB WITHOUT THE CLUBHOUSE"
              : "A LITTLE FRIENDLY COMPETITION"}
          </span>
          <h1>
            {kind === "circles" ? (
              <>
                Your people.
                <br />
                Your game. <em>Your Circle.</em>
              </>
            ) : (
              <>
                Make a day of it.
                <br />
                <em>Make a memory.</em>
              </>
            )}
          </h1>
          <p>
            {kind === "circles"
              ? "From weekend regulars to first-time golfers. Find a community that feels like you."
              : "Team up, tee off, and give your golf stories a leaderboard. Explore what a ForeCircle tournament can look like."}
          </p>
        </div>
        <div className="public-list">
          <label className="search-field wide-search">
            <input
              aria-label={`Search ${kind}`}
              placeholder={`Find your ${kind === "circles" ? "Circle" : "tournament"}…`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
          <p className="demo-caption">
            A first look at ForeCircle · all communities and events below are
            examples.
          </p>
          {kind === "circles" ? (
            <div className="circle-teasers">
              {circles.map((c) => (
                <Link href={`/c/${c.id}`} className="circle-teaser" key={c.id}>
                  <div className="circle-teaser-image">
                    <img src={c.image} alt="Golf course scenery" />
                    <span
                      className="circle-badge"
                      style={{ background: c.color }}
                    >
                      {c.initials}
                    </span>
                    <span className="circle-category">{c.category}</span>
                  </div>
                  <div className="circle-teaser-body">
                    <h3>{c.name}</h3>
                    <p>{c.description}</p>
                    <div>
                      <span>
                        <MapPin size={14} />
                        {c.area}
                      </span>
                      <ArrowUpRight size={18} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="tournament-grid">
              {tournaments.map((t) => (
                <TournamentCard
                  key={t.id}
                  tournament={t}
                  onClick={() => window.location.assign(`/t/${t.id}/`)}
                />
              ))}
            </div>
          )}
          {(kind === "circles" ? circles.length : tournaments.length) === 0 && (
            <div className="empty-state">
              <Flag />
              <h3>No matches just yet.</h3>
              <p>Try another name. Your people are out here.</p>
              <button
                className="button primary small"
                onClick={() => setSearch("")}
              >
                Clear search
              </button>
            </div>
          )}
        </div>
        <div className="public-callout">
          <div>
            <h2>
              {kind === "circles"
                ? "Your golf club starts with you."
                : "Be the golfer who brings everyone together."}
            </h2>
            <p>One golfer profile. A whole community of possibilities.</p>
          </div>
          <Link className="button primary" href="/organizers">
            Explore Organizer Mode <ArrowUpRight size={17} />
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
export function PublicDetail({
  kind,
  id,
}: {
  kind: "circle" | "tournament";
  id: string;
}) {
  const [share, setShare] = useState(false);
  const c = demoCircles.find((c) => c.id === id);
  const t = demoTournaments.find((t) => t.id === id);
  const data = kind === "circle" ? c : t;
  if (!data) return null;
  const name = kind === "circle" ? c!.name : t!.name;
  return (
    <>
      <PublicHeader />
      <main className="detail-public">
        <img
          className="detail-public-cover"
          src={data.image}
          alt="Scenic golf course"
        />
        <div className="detail-public-content">
          <span className="eyebrow">
            {kind === "circle"
              ? "A FORECIRCLE GOLF COMMUNITY"
              : "A FORECIRCLE GOLF DAY"}{" "}
            · SAMPLE
          </span>
          <h1>{name}</h1>
          <p>
            <MapPin
              size={15}
              style={{ display: "inline", verticalAlign: "middle" }}
            />{" "}
            {data.area}
            {kind === "tournament" && ` · ${t!.course}`}
          </p>
          {kind === "circle" ? (
            <>
              <p style={{ marginTop: 20 }}>{c!.description}</p>
              <div className="detail-grid">
                <div>
                  <Users size={21} />
                  <span>
                    Community<b>{c!.members} demo members</b>
                  </span>
                </div>
                <div>
                  <Flag size={21} />
                  <span>
                    Our kind of golf<b>{c!.category}</b>
                  </span>
                </div>
              </div>
              <h3>Good people. Great rounds.</h3>
              <p style={{ marginTop: 15 }}>
                A space to meet your next playing partner, organize a weekend
                round, and keep the conversation going after the eighteenth.
              </p>
            </>
          ) : (
            <>
              <div className="detail-grid">
                <div>
                  <Trophy size={21} />
                  <span>
                    Format<b>{t!.format}</b>
                  </span>
                </div>
                <div>
                  <Flag size={21} />
                  <span>
                    Tee time
                    <b>
                      {t!.date} · {t!.time}
                    </b>
                  </span>
                </div>
                <div>
                  <Users size={21} />
                  <span>
                    Players
                    <b>
                      {t!.players} / {t!.capacity} sample golfers
                    </b>
                  </span>
                </div>
                <div>
                  <Check size={21} />
                  <span>
                    Availability
                    <b>{t!.capacity - t!.players} sample spots left</b>
                  </span>
                </div>
              </div>
              <h3>More ways to make it memorable.</h3>
              <div className="round-tags">
                {t!.challenges.map((x) => (
                  <span key={x}>
                    <Trophy size={13} />
                    {x}
                  </span>
                ))}
              </div>
              <p>
                A friendly day of golf with good company. Arrive 30 minutes
                before the start, bring your clubs, and enjoy the round. This
                example does not represent a real event at the named course.
              </p>
            </>
          )}
          <div className="notice">
            You’re exploring a sample {kind}. No real memberships,
            registrations, or course bookings are created here.
          </div>
          <div className="detail-public-buttons">
            <Link
              className="button primary"
              href={`/app/${kind === "circle" ? "circles" : "tournaments"}`}
            >
              {kind === "circle"
                ? "Explore Circle membership"
                : "Explore registration"}
              <ArrowRight size={17} />
            </Link>
            <button className="button secondary" onClick={() => setShare(true)}>
              <Share2 size={16} />
              Share & QR code
            </button>
          </div>
        </div>
        <span className="powered-by">
          Powered by ForeCircle · Meet. Play. Compete.
        </span>
      </main>
      <Footer />
      {share && (
        <ShareModal
          title={name}
          path={`/${kind === "circle" ? "c" : "t"}/${id}`}
          onClose={() => setShare(false)}
        />
      )}
    </>
  );
}
const content: Record<
  string,
  {
    eyebrow: string;
    title: string;
    intro: string;
    sections: { title: string; text: string }[];
  }
> = {
  organizers: {
    eyebrow: "FOR THE “I’LL ORGANIZE IT” GOLFER",
    title: "Big plans. Less group-text chaos.",
    intro:
      "A tournament starts with one person saying, “Let’s make it happen.” ForeCircle is being built for that person.",
    sections: [
      {
        title: "One golfer. More possibilities.",
        text: "Organizer Mode belongs to your existing golfer profile. Join other rounds, follow your friends, and organize your own golf days from the same place.",
      },
      {
        title: "A home for your golf day.",
        text: "Our roadmap brings registrations, teams, waitlists, announcements, and results together. The current preview lets you try creating a tournament and choosing side competitions. Live participant management is still in development.",
      },
      {
        title: "Your ideas belong in the plan.",
        text: "Organizer Lab is a place for practical ideas from the people running real golf events. Try the preview roadmap and voting experience, and help imagine what comes next.",
      },
    ],
  },
  "how-it-works": {
    eyebrow: "LESS PLANNING. MORE PLAYING.",
    title: "A good round starts with good people.",
    intro:
      "ForeCircle connects the golfer looking for a group, the organizer bringing everyone together, and the community that keeps coming back.",
    sections: [
      {
        title: "01 · Find your Circle.",
        text: "Discover golfers and communities around your general area. Match the kind of day you want: casual, social, competitive, or a friendly first round.",
      },
      {
        title: "02 · Get a round going.",
        text: "Find an open round or create one of your own. Choose when, where, and how many golfers you need. A quick nine or a full eighteen—make it your game.",
      },
      {
        title: "03 · Make a little history.",
        text: "Organize a scramble, enter a tournament, or become the person who makes the weekend golf tradition happen. The connection matters more than the score.",
      },
    ],
  },
  about: {
    eyebrow: "FOR THE LOVE OF THE GAME",
    title: "Golf is better together.",
    intro:
      "“I want to golf, but I need people to play with.” ForeCircle starts with that simple, familiar feeling.",
    sections: [
      {
        title: "A golf community without a gate.",
        text: "You should not need a country-club membership or an already-full group chat to find your people. ForeCircle gives open rounds, digital golf clubs, and community tournaments a shared home.",
      },
      {
        title: "The real world is the point.",
        text: "We care about rounds played, people met, and the golfer you invite back next weekend. The best part of the platform is what happens after you close it and head to the course.",
      },
      {
        title: "Meet. Play. Compete.",
        text: "Find your people. Play more golf. That is our north star, from the first web experience to the future iPhone and Android apps.",
      },
    ],
  },
  pricing: {
    eyebrow: "A PLACE FOR EVERY GOLFER",
    title: "The door is open.",
    intro:
      "Explore the ForeCircle preview at no cost. Launch pricing has not been finalized.",
    sections: [
      {
        title: "Golfer",
        text: "The plan is for an accessible, free community experience: meet golfers, find rounds, and become part of a Circle.",
      },
      {
        title: "Organizer Mode",
        text: "Entry-level organizing is planned to be free. Additional organizer and Circle tools may become paid options later. There are no subscriptions to purchase in this preview.",
      },
      {
        title: "Course partners",
        text: "Future partnerships may help courses bring communities together. No tee-time integrations, course-management systems, or partner subscriptions are available yet.",
      },
    ],
  },
  courses: {
    eyebrow: "FIND YOUR FAIRWAY",
    title: "Good golf starts somewhere.",
    intro:
      "Discover sample golf activity around the Inland Empire. ForeCircle is a social community, not a tee-time booking engine.",
    sections: [
      {
        title: "Temecula & Murrieta",
        text: "Our preview includes Temecula Creek, Redhawk, CrossCreek, and Rancho California as familiar meeting places for example rounds. These courses have not endorsed these demo events.",
      },
      {
        title: "Beyond your usual course",
        text: "The course directory is designed to grow independently of any proprietary booking provider. You control the general region you share; ForeCircle does not continuously track your location.",
      },
    ],
  },
  privacy: {
    eyebrow: "DRAFT · LEGAL REVIEW REQUIRED",
    title: "Your golf life. Your privacy.",
    intro:
      "This is a product privacy outline, not a final privacy policy. It must be reviewed before real community accounts launch.",
    sections: [
      {
        title: "This preview",
        text: "The clubhouse preview saves sample interactions in browser local storage. It does not send preview chats, book tee times, or create real event registrations. Reset preview clears those local interactions.",
      },
      {
        title: "Information we plan to use",
        text: "An account would use an email address and general golf profile. Discovery uses a selected city or region. Home addresses, private email addresses, and telephone numbers are not intended for public profiles.",
      },
      {
        title: "Controls before launch",
        text: "Live account deletion, data access requests, retention periods, processor disclosures, blocking, and reporting must be implemented and documented before production launch. Contact details for privacy requests are not yet finalized.",
      },
    ],
  },
  terms: {
    eyebrow: "DRAFT · LEGAL REVIEW REQUIRED",
    title: "The ground rules.",
    intro:
      "This is a non-final product outline. Legal terms, age eligibility, governing law, and organizer obligations must be reviewed before launch.",
    sections: [
      {
        title: "Preview availability",
        text: "The sample rounds, golfers, Circles, and tournaments are illustrative. Nothing in the preview reserves a tee time, confirms a real event, or collects a registration payment.",
      },
      {
        title: "Community participation",
        text: "Golfers and organizers will be expected to provide accurate event information, respect course rules, and treat others fairly. Course reservations and event arrangements will remain separate unless clearly stated otherwise.",
      },
      {
        title: "Competition, prizes, and payments",
        text: "The product does not offer unrestricted wagering, betting pools, or automated gambling payouts. Payments and commercial organizer tools remain disabled pending product, legal, and provider review.",
      },
    ],
  },
  "community-standards": {
    eyebrow: "GOOD COMPANY IS THE STANDARD",
    title: "Be someone people want to play with again.",
    intro: "A welcoming golf community starts with a few simple expectations.",
    sections: [
      {
        title: "Respect every golfer.",
        text: "All skill levels belong. Harassment, threats, discrimination, and degrading comments have no place in a ForeCircle round or conversation.",
      },
      {
        title: "Show up. Communicate.",
        text: "Keep your commitments, arrive ready to play, and tell your group promptly if plans change. Follow the host’s instructions and the golf course’s rules.",
      },
      {
        title: "Keep the community safe.",
        text: "Do not post another person’s private contact information, home address, or photos without appropriate permission. Blocking, reporting, and moderation tools are required before the live community launches.",
      },
    ],
  },
};
export function InfoPage({ slug }: { slug: string }) {
  const c = content[slug] || content.about;
  return (
    <>
      <PublicHeader />
      <main>
        <div className="public-page-intro">
          <span className="eyebrow">{c.eyebrow}</span>
          <h1>{c.title}</h1>
          <p>{c.intro}</p>
        </div>
        <article className="article-body">
          {c.sections.map((s) => (
            <section key={s.title}>
              <h2>{s.title}</h2>
              <p>{s.text}</p>
            </section>
          ))}
          {[
            "organizers",
            "how-it-works",
            "about",
            "pricing",
            "courses",
          ].includes(slug) && (
            <Link
              href={slug === "organizers" ? "/organizer" : "/app"}
              className="button primary"
              style={{ marginTop: 35 }}
            >
              Explore the preview <ArrowUpRight size={17} />
            </Link>
          )}
        </article>
      </main>
      <Footer />
    </>
  );
}
