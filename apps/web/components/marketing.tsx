"use client";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  MapPin,
  ChevronDown,
  Flag,
  Users,
  Trophy,
  Check,
  Menu,
  X,
  Plus,
  CalendarDays,
} from "lucide-react";
import { Logo, Avatar, RoundCard, RoundDetail } from "./ui";
import { demoRounds, demoCircles } from "./demo-data";
import { CinematicHero } from "./cinematic-hero";
import type { Round } from "@shared/types";
export function Marketing() {
  const [menu, setMenu] = useState(false),
    [filter, setFilter] = useState("All rounds"),
    [area, setArea] = useState("Inland Empire, CA"),
    [selected, setSelected] = useState<Round | null>(null);
  const rounds = demoRounds
    .filter(
      (r) =>
        (filter === "All rounds" ||
          r.when === filter ||
          (filter === "Need one more" && r.spots === 1)) &&
        (area === "Inland Empire, CA" || r.area.includes(area.split(",")[0])),
    )
    .slice(0, 3);
  return (
    <div className="marketing cinematic-marketing">
      <header className="site-header">
        <div className="header-inner">
          <Logo />
          <nav
            className={menu ? "main-nav open" : "main-nav"}
            aria-label="Main navigation"
            id="landing-navigation"
          >
            <Link href="/app/rounds" onClick={() => setMenu(false)}>
              Find a round
            </Link>
            <Link href="/courses" onClick={() => setMenu(false)}>
              Courses
            </Link>
            <Link href="/circles" onClick={() => setMenu(false)}>
              Circles
            </Link>
            <Link href="/tournaments" onClick={() => setMenu(false)}>
              Tournaments
            </Link>
            <a href="#organizers" onClick={() => setMenu(false)}>
              For organizers
            </a>
          </nav>
          <div className="header-actions">
            <Link className="login-link" href="/login">
              Log in
            </Link>
            <Link className="button primary small" href="/signup">
              Find your Circle <ArrowUpRight size={16} />
            </Link>
            <button
              className="mobile-menu icon-button"
              aria-label="Toggle navigation"
              aria-expanded={menu}
              aria-controls="landing-navigation"
              onClick={() => setMenu(!menu)}
            >
              {menu ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>
      <main>
        <CinematicHero />
        <div className="brand-strip">
          <span>More than a tee time.</span>
          <b>A reason to get out there.</b>
          <div />
          <span>
            <Users size={17} /> Find your people
          </span>
          <span>
            <Flag size={17} /> Play more golf
          </span>
          <span>
            <Trophy size={17} /> Make it a little competitive
          </span>
        </div>
        <section className="section-wrap discover" id="rounds">
          <div className="section-heading">
            <div>
              <div className="eyebrow">LESS PLANNING. MORE PLAYING.</div>
              <h2>There’s a round with your name on it.</h2>
              <p>
                Early birds, weekend regulars, and last-minute “anyone in?”
                golfers.
              </p>
            </div>
            <Link className="text-link" href="/app/rounds">
              Explore all rounds <ArrowUpRight size={17} />
            </Link>
          </div>
          <div className="discovery-toolbar">
            <div
              className="filter-tabs"
              role="group"
              aria-label="Filter rounds"
            >
              {[
                "All rounds",
                "Today",
                "Tomorrow",
                "This weekend",
                "Need one more",
              ].map((x) => (
                <button
                  key={x}
                  className={filter === x ? "active" : ""}
                  onClick={() => setFilter(x)}
                >
                  {x}
                </button>
              ))}
            </div>
            <label className="location-select">
              <MapPin size={16} />
              <select
                aria-label="Golf area"
                value={area}
                onChange={(e) => setArea(e.target.value)}
              >
                <option>Inland Empire, CA</option>
                <option>Temecula, CA</option>
                <option>Menifee, CA</option>
                <option>Corona, CA</option>
              </select>
              <ChevronDown size={14} />
            </label>
          </div>
          <div className="round-grid">
            {rounds.length ? (
              rounds.map((r) => (
                <RoundCard key={r.id} round={r} onOpen={() => setSelected(r)} />
              ))
            ) : (
              <div className="empty-state">
                <Flag />
                <h3>A new round starts with you.</h3>
                <p>No sample rounds match this area and time.</p>
                <Link className="button primary" href="/app/rounds">
                  Explore the community
                </Link>
              </div>
            )}
          </div>
          <p className="demo-caption">
            Explore the experience. Rounds shown here are examples, not live tee
            times.
          </p>
        </section>
        <section className="section-wrap how-section" id="how-it-works">
          <div className="section-heading">
            <div>
              <div className="eyebrow">YOUR GAME. YOUR PEOPLE.</div>
              <h2>
                Less “we should play.”
                <br />
                More “see you on the first tee.”
              </h2>
            </div>
            <p className="section-aside">
              A golf community built around actually getting out and playing.
              It’s that simple.
            </p>
          </div>
          <div className="how-grid">
            {[
              {
                n: "01",
                Icon: Users,
                title: "Find your Circle.",
                text: "Connect with golfers who play your way. Same area, same energy, all handicaps welcome.",
              },
              {
                n: "02",
                Icon: Flag,
                title: "Get a round going.",
                text: "Find an open spot or put the call out yourself. A quick nine or a whole Saturday—make it happen.",
              },
              {
                n: "03",
                Icon: Trophy,
                title: "Make a little history.",
                text: "Join a friendly scramble, start a tournament, and give your golf stories a leaderboard.",
              },
            ].map(({ n, Icon, title, text }) => (
              <div className="how-item" key={n}>
                <div className="how-top">
                  <span>{n}</span>
                  <Icon size={28} strokeWidth={1.3} />
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </section>
        <section className="circles-section">
          <div className="section-wrap">
            <div className="section-heading">
              <div>
                <div className="eyebrow">A CLUB WITHOUT THE CLUBHOUSE.</div>
                <h2>
                  Find a place to <em>belong.</em>
                </h2>
                <p>Your weekend crew. Your kind of competition. Your Circle.</p>
              </div>
              <Link className="text-link" href="/circles">
                Meet the Circles <ArrowUpRight size={17} />
              </Link>
            </div>
            <div className="circle-teasers">
              {demoCircles.slice(0, 3).map((c, i) => (
                <Link href={`/c/${c.id}`} className="circle-teaser" key={c.id}>
                  <div className="circle-teaser-image">
                    <img
                      src={c.image}
                      alt="Golf course scenery"
                      loading="lazy"
                    />
                    <span
                      className="circle-badge"
                      style={{ background: c.color }}
                    >
                      {i === 0 ? (
                        <Flag size={27} />
                      ) : i === 1 ? (
                        <span className="star-symbol">✦</span>
                      ) : (
                        <Users size={27} />
                      )}
                    </span>
                    <span className="circle-category">{c.category}</span>
                  </div>
                  <div className="circle-teaser-body">
                    <h3>{c.name}</h3>
                    <p>{c.description}</p>
                    <div>
                      <span>
                        <MapPin size={13} />
                        {c.area}
                      </span>
                      <ArrowUpRight size={19} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <p className="demo-caption">
              Sample Circles for your first look at ForeCircle.
            </p>
          </div>
        </section>
        <section className="section-wrap organizer-section" id="organizers">
          <div className="organizer-panel">
            <div className="organizer-copy">
              <div className="eyebrow">FOR THE “I’LL ORGANIZE IT” GOLFER.</div>
              <h2>
                Big plans.
                <br />
                Less group-text chaos.
              </h2>
              <p>
                Bring your people together. From a Saturday scramble to a
                community tournament, give every great golf day a home.
              </p>
              <ul>
                <li>
                  <Check size={16} /> One place for players, teams, and updates
                </li>
                <li>
                  <Check size={16} /> Your golfer profile. With Organizer Mode.
                </li>
                <li>
                  <Check size={16} /> Your ideas help shape what comes next
                </li>
              </ul>
              <Link className="button cream" href="/organizers">
                Explore Organizer Mode <ArrowUpRight size={18} />
              </Link>
            </div>
            <div className="organizer-visual">
              <div className="organizer-mini">
                <div className="mini-toolbar">
                  <span>
                    <Flag size={16} /> YOUR NEXT GREAT GOLF DAY
                  </span>
                  <span className="mini-pill">PREVIEW</span>
                </div>
                <h3>
                  Saturday Hackers
                  <br />
                  Scramble
                </h3>
                <p>
                  <MapPin size={13} /> Temecula Creek Golf Club
                </p>
                <div className="mini-stats">
                  <div>
                    <b>
                      24<span>/32</span>
                    </b>
                    <span>Golfers registered</span>
                  </div>
                  <div>
                    <b>6</b>
                    <span>Teams ready to play</span>
                  </div>
                </div>
                <div className="mini-progress">
                  <span />
                </div>
                <div className="mini-row">
                  <div>
                    <span className="mini-icon">
                      <Users size={16} />
                    </span>
                    <span>Players & teams</span>
                  </div>
                  <Check size={16} />
                </div>
                <div className="mini-row">
                  <div>
                    <span className="mini-icon">
                      <Trophy size={16} />
                    </span>
                    <span>A little friendly competition</span>
                  </div>
                  <span className="mini-count">3 challenges</span>
                </div>
                <div className="mini-announcement">
                  <span>📣</span>
                  <p>
                    <b>See you at the first tee!</b>Check-in opens at 7:00 AM.
                    Bring your A-game.
                  </p>
                </div>
              </div>
              <span className="organizer-note">
                You bring the people. We’ll bring the plan.
              </span>
            </div>
          </div>
        </section>
        <section className="final-cta section-wrap">
          <span className="eyebrow">THIS IS YOUR INVITATION.</span>
          <h2>
            Find your people.
            <br />
            <em>Play more golf.</em>
          </h2>
          <Link className="button primary" href="/app">
            Step inside ForeCircle <ArrowUpRight size={18} />
          </Link>
          <span className="cta-caption">Meet. Play. Compete.</span>
        </section>
      </main>
      <Footer />
      {selected && (
        <RoundDetail round={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
export function Footer() {
  return (
    <footer className="site-footer">
      <div className="section-wrap footer-top">
        <div>
          <Logo />
          <p>Good golf starts with good company.</p>
        </div>
        <div className="footer-links">
          <Link href="/how-it-works">How it works</Link>
          <Link href="/organizers">For organizers</Link>
          <Link href="/courses">Course communities</Link>
          <Link href="/about">Our story</Link>
          <Link href="/pricing">Membership</Link>
        </div>
      </div>
      <div className="section-wrap footer-bottom">
        <span>
          © {new Date().getFullYear()} ForeCircle. Meet. Play. Compete.
        </span>
        <div>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/community-standards">Community standards</Link>
        </div>
        <span className="footer-location">
          Made for the love of the game. <Flag size={13} />
        </span>
      </div>
    </footer>
  );
}
