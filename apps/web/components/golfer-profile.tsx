"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  Camera,
  Check,
  Flag,
  Globe,
  MapPin,
  Pencil,
  Plus,
  Trophy,
  Users,
  X,
  CalendarDays,
  Clock,
} from "lucide-react";
import { Avatar, Modal } from "./ui";
import type { Circle, GolferProfile, Round, Tournament } from "@shared/types";
import {
  golferProfileSchema,
  hostingOptions,
  initials,
  photoFileError,
  playingDays,
  playingTimes,
} from "@shared/utilities/profile";

import { CoursePicker } from "./course-picker";
import { MyCourseCommunities } from "./course-community";
import { resolveCourse } from "@shared/courses";
export type ProfileTab = "About you" | "Your golf" | "Organizer";

function PhotoPicker({
  value,
  onChange,
  label,
  onBusy,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  onBusy: (v: boolean) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const request = useRef(0);
  const [source, setSource] = useState<{
    image: HTMLImageElement;
    url: string;
  } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [horizontal, setHorizontal] = useState(0);
  const [vertical, setVertical] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(
    () => () => {
      request.current++;
    },
    [],
  );
  useEffect(
    () => () => {
      if (source) URL.revokeObjectURL(source.url);
    },
    [source],
  );
  useEffect(() => {
    if (!source || !canvas.current) return;
    const context = canvas.current.getContext("2d");
    if (!context) {
      setError("Photo editing is unavailable in this browser.");
      return;
    }
    const image = source.image;
    const side = Math.min(image.naturalWidth, image.naturalHeight) / zoom;
    const sx = ((image.naturalWidth - side) * (horizontal + 100)) / 200;
    const sy = ((image.naturalHeight - side) * (vertical + 100)) / 200;
    context.fillStyle = "#FFF8EE";
    context.fillRect(0, 0, 512, 512);
    context.drawImage(image, sx, sy, side, side, 0, 0, 512, 512);
  }, [source, zoom, horizontal, vertical]);
  async function select(file: File | undefined) {
    if (!file) return;
    const current = ++request.current;
    setLoading(true);
    onBusy(true);
    setError("");
    let objectUrl = "";
    try {
      const issue = photoFileError(
        file.type,
        file.size,
        new Uint8Array(await file.slice(0, 12).arrayBuffer()),
      );
      if (issue) throw new Error(issue);
      objectUrl = URL.createObjectURL(file);
      const image = new Image();
      image.src = objectUrl;
      await image.decode();
      if (image.naturalWidth * image.naturalHeight > 40_000_000)
        throw new Error(
          "This photo is too large to edit. Choose a smaller copy.",
        );
      if (current !== request.current) {
        URL.revokeObjectURL(objectUrl);
        return;
      }
      setZoom(1);
      setHorizontal(0);
      setVertical(0);
      setSource({ image, url: objectUrl });
    } catch (err) {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
      if (current === request.current) {
        setError(
          err instanceof Error &&
            err.message !== "The source image cannot be decoded."
            ? err.message
            : "This photo could not be opened. Try a different JPG or PNG.",
        );
        onBusy(Boolean(source));
      }
    } finally {
      if (current === request.current) setLoading(false);
    }
  }
  function cancelCrop() {
    request.current++;
    setLoading(false);
    setSource(null);
    setError("");
    onBusy(false);
  }
  return (
    <div className="photo-picker">
      <div className="photo-picker-row">
        <Avatar
          initials={label === "Profile photo" ? "FC" : "CL"}
          src={value}
          alt={label}
          size="large"
        />
        <div className="photo-picker-copy">
          <b>{label}</b>
          <small>JPG, PNG or WebP · Up to 8 MB</small>
          <div className="photo-picker-actions">
            <button
              type="button"
              className="button secondary small"
              disabled={loading}
              onClick={() => input.current?.click()}
            >
              <Camera size={15} />
              {value ? "Change" : "Add photo"}
            </button>
            {value && (
              <button
                type="button"
                className="text-link"
                onClick={() => {
                  cancelCrop();
                  onChange("");
                }}
              >
                Remove
              </button>
            )}
          </div>
        </div>
      </div>
      <input
        ref={input}
        tabIndex={-1}
        aria-label={`Upload ${label.toLowerCase()}`}
        className="visually-hidden"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(e) => {
          void select(e.target.files?.[0]);
          e.currentTarget.value = "";
        }}
      />
      {loading && <p role="status">Opening your photo…</p>}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {source && (
        <div className="photo-cropper">
          <p>Frame your {label === "Profile photo" ? "photo" : "logo"}</p>
          <canvas
            ref={canvas}
            width={512}
            height={512}
            aria-label={`${label} crop preview`}
          />
          <label>
            Zoom
            <input
              type="range"
              min="1"
              max="3"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
            />
          </label>
          <label>
            Move left / right
            <input
              type="range"
              min="-100"
              max="100"
              value={horizontal}
              onChange={(e) => setHorizontal(Number(e.target.value))}
            />
          </label>
          <label>
            Move up / down
            <input
              type="range"
              min="-100"
              max="100"
              value={vertical}
              onChange={(e) => setVertical(Number(e.target.value))}
            />
          </label>
          <div className="photo-picker-actions">
            <button
              type="button"
              className="button primary small"
              disabled={loading}
              onClick={() => {
                if (!canvas.current) return;
                try {
                  let data = canvas.current.toDataURL("image/jpeg", 0.86);
                  if (data.length > 400_000)
                    data = canvas.current.toDataURL("image/jpeg", 0.65);
                  if (data.length > 400_000) throw new Error();
                  onChange(data);
                  cancelCrop();
                } catch {
                  setError(
                    "Could not prepare this photo. Try a smaller image.",
                  );
                }
              }}
            >
              <Check size={16} /> Use photo
            </button>
            <button
              className="button secondary small"
              type="button"
              onClick={cancelCrop}
            >
              Cancel crop
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Choices({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: readonly string[];
  selected: string[];
  onChange: (v: string[]) => void;
}) {
  return (
    <fieldset className="profile-choices">
      <legend>{label}</legend>
      <div>
        {options.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={selected.includes(option)}
            onClick={() =>
              onChange(
                selected.includes(option)
                  ? selected.filter((v) => v !== option)
                  : [...selected, option],
              )
            }
          >
            {option}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
export function EditGolferProfile({
  profile,
  initialTab = "About you",
  onClose,
  onSave,
}: {
  profile: GolferProfile;
  initialTab?: ProfileTab;
  onClose: () => void;
  onSave: (profile: GolferProfile) => string | null;
}) {
  const [draft, setDraft] = useState(profile);
  const [tab, setTab] = useState<ProfileTab>(initialTab);
  const [error, setError] = useState("");
  const [photoBusy, setPhotoBusy] = useState(false);
  const [logoBusy, setLogoBusy] = useState(false);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const set = <K extends keyof GolferProfile>(
    name: K,
    value: GolferProfile[K],
  ) => setDraft((p) => ({ ...p, [name]: value }));
  function addCourse(id: string) {
    const selected = resolveCourse(id);
    if (!selected) {
      setError("Select a course from the directory.");
      return;
    }
    if (
      draft.favoriteCourses.some((c) => resolveCourse(c)?.id === selected.id)
    ) {
      setError("That course is already on your profile.");
      return;
    }
    if (draft.favoriteCourses.length >= 3) return;
    set("favoriteCourses", [...draft.favoriteCourses, selected.name]);
    setError("");
  }
  const busy = photoBusy || logoBusy;
  return (
    <Modal title="Make your profile yours." onClose={onClose} wide>
      <p className="profile-edit-note">
        Your photo, your game, your people. Changes are saved only in this
        browser’s preview.
      </p>
      <div className="profile-editor-tabs" aria-label="Profile sections">
        {(["About you", "Your golf", "Organizer"] as const).map((item) => (
          <button
            type="button"
            key={item}
            aria-pressed={tab === item}
            disabled={busy && tab !== item}
            onClick={() => {
              setTab(item);
              setError("");
            }}
          >
            {item}
          </button>
        ))}
      </div>
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          if (busy) return;
          const result = golferProfileSchema.safeParse(draft);
          if (!result.success) {
            const issue = result.error.issues[0];
            const field = String(issue.path[0]);
            setTab(
              field.startsWith("organizer") || field === "hostingFocus"
                ? "Organizer"
                : ["name", "username", "area", "bio", "avatarUrl"].includes(
                      field,
                    )
                  ? "About you"
                  : "Your golf",
            );
            setError(
              `${field === "username" ? "Username: use 3–24 lowercase letters, numbers, or underscores." : issue.message}`,
            );
            setTimeout(() => errorRef.current?.focus(), 0);
            return;
          }
          const issue = onSave(result.data);
          if (issue) {
            setError(issue);
            setTimeout(() => errorRef.current?.focus(), 0);
          }
        }}
      >
        {error && (
          <p ref={errorRef} tabIndex={-1} className="form-error" role="alert">
            {error}
          </p>
        )}
        {tab === "About you" && (
          <>
            <PhotoPicker
              value={draft.avatarUrl}
              onChange={(v) => set("avatarUrl", v)}
              label="Profile photo"
              onBusy={setPhotoBusy}
            />
            <div className="form-two">
              <label className="field-label">
                Display name
                <input
                  autoComplete="name"
                  maxLength={60}
                  value={draft.name}
                  onChange={(e) => set("name", e.target.value)}
                  required
                />
              </label>
              <label className="field-label">
                Username
                <input
                  autoCapitalize="none"
                  autoComplete="off"
                  maxLength={24}
                  value={draft.username}
                  onChange={(e) =>
                    set("username", e.target.value.toLowerCase())
                  }
                  required
                />
                <small>3–24 letters, numbers or underscores.</small>
              </label>
            </div>
            <label className="field-label">
              General area
              <input
                value={draft.area}
                maxLength={100}
                placeholder="Temecula, CA"
                onChange={(e) => set("area", e.target.value)}
                required
              />
              <small>
                City or region only. Keep your home address private.
              </small>
            </label>
            <label className="field-label">
              A little about you
              <textarea
                value={draft.bio}
                maxLength={400}
                placeholder="Early tee times, good company, and a little friendly competition…"
                onChange={(e) => set("bio", e.target.value)}
              />
              <small>
                {draft.bio.length}/400 · What makes a good golf day for you?
              </small>
            </label>
            <label className="profile-check">
              <input
                type="checkbox"
                checked={draft.openToRounds}
                onChange={(e) => set("openToRounds", e.target.checked)}
              />
              <span>
                <b>Open to a round</b>
                <small>Show that you’re interested in meeting golfers.</small>
              </span>
            </label>
          </>
        )}
        {tab === "Your golf" && (
          <>
            <p className="profile-edit-note">
              Everything here is optional. Beginners belong here too.
            </p>
            <div className="form-two">
              <label className="field-label">
                Handicap
                <input
                  type="number"
                  min={-10}
                  max={54}
                  step="0.1"
                  value={draft.handicap}
                  placeholder="Not established"
                  onChange={(e) => set("handicap", e.target.value)}
                />
              </label>
              <label className="field-label">
                Skill level
                <select
                  value={draft.skillLevel}
                  onChange={(e) => set("skillLevel", e.target.value)}
                >
                  <option value="">Prefer not to say</option>
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </label>
            </div>
            <div className="form-two">
              <label className="field-label">
                Playing style
                <select
                  value={draft.style}
                  onChange={(e) => set("style", e.target.value)}
                >
                  {["Social", "Casual", "Competitive", "Beginner friendly"].map(
                    (v) => (
                      <option key={v}>{v}</option>
                    ),
                  )}
                </select>
              </label>
              <label className="field-label">
                Handedness
                <select
                  value={draft.handedness}
                  onChange={(e) => set("handedness", e.target.value)}
                >
                  <option value="">Prefer not to say</option>
                  <option>Right-handed</option>
                  <option>Left-handed</option>
                </select>
              </label>
            </div>
            <div className="form-two">
              <label className="field-label">
                Round length
                <select
                  value={draft.roundLength}
                  onChange={(e) => set("roundLength", e.target.value)}
                >
                  <option>9 holes</option>
                  <option>18 holes</option>
                  <option>Either</option>
                </select>
              </label>
              <label className="field-label">
                Walk or ride?
                <select
                  value={draft.walkingRiding}
                  onChange={(e) => set("walkingRiding", e.target.value)}
                >
                  <option>Walk</option>
                  <option>Ride</option>
                  <option>Either</option>
                </select>
              </label>
            </div>
            <Choices
              label="Usual playing days"
              options={playingDays}
              selected={draft.preferredDays}
              onChange={(v) => set("preferredDays", v)}
            />
            <Choices
              label="Favorite tee times"
              options={playingTimes}
              selected={draft.preferredTimes}
              onChange={(v) => set("preferredTimes", v)}
            />
            <div className="favorite-course-add">
              <CoursePicker
                value=""
                onChange={addCourse}
                label="Favorite courses"
                disabled={draft.favoriteCourses.length >= 3}
              />
              <p className="profile-edit-note">
                Choose up to three from the directory. Selecting a favorite does
                not automatically join its community.
              </p>
            </div>
            <div className="course-chips">
              {draft.favoriteCourses.map((c) => (
                <span key={c}>
                  {c}
                  <button
                    type="button"
                    aria-label={`Remove ${c}`}
                    onClick={() =>
                      set(
                        "favoriteCourses",
                        draft.favoriteCourses.filter((v) => v !== c),
                      )
                    }
                  >
                    <X size={15} />
                  </button>
                </span>
              ))}
            </div>
          </>
        )}
        {tab === "Organizer" && (
          <>
            {!draft.organizer ? (
              <div className="organizer-editor-empty">
                <Flag size={30} />
                <h3>Bring your golf people together.</h3>
                <p>
                  Organizer Mode adds hosting tools and an organizer section to
                  this same golfer profile.
                </p>
                <button
                  type="button"
                  className="button primary"
                  onClick={() => set("organizer", true)}
                >
                  Activate preview Organizer Mode <ArrowUpRight size={17} />
                </button>
              </div>
            ) : (
              <>
                <div className="notice">
                  This is your organizer identity within your golfer profile.
                  Club details here do not create a separate account or verify
                  an organization.
                </div>
                <PhotoPicker
                  value={draft.organizerLogoUrl}
                  onChange={(v) => set("organizerLogoUrl", v)}
                  label="Club or organization logo"
                  onBusy={setLogoBusy}
                />
                <label className="field-label">
                  Club or organization name (optional)
                  <input
                    value={draft.organizerName}
                    maxLength={80}
                    placeholder="Weekend Fairway Club"
                    onChange={(e) => set("organizerName", e.target.value)}
                  />
                  <small>Leave blank to host under your name.</small>
                </label>
                <label className="field-label">
                  Your hosting story
                  <textarea
                    value={draft.organizerBio}
                    maxLength={600}
                    placeholder="Tell golfers what you organize and what they can expect."
                    onChange={(e) => set("organizerBio", e.target.value)}
                  />
                  <small>{draft.organizerBio.length}/600</small>
                </label>
                <Choices
                  label="What do you organize?"
                  options={hostingOptions}
                  selected={draft.hostingFocus}
                  onChange={(v) => set("hostingFocus", v)}
                />
                <label className="field-label">
                  Club website (optional)
                  <input
                    type="url"
                    inputMode="url"
                    autoCapitalize="none"
                    maxLength={240}
                    value={draft.organizerWebsite}
                    placeholder="https://yourclub.com"
                    onChange={(e) => set("organizerWebsite", e.target.value)}
                  />
                </label>
              </>
            )}
          </>
        )}
        <div className="profile-editor-footer">
          <span>
            {busy
              ? "Use or cancel your photo crop before saving."
              : "Saved on this browser. Not published to other golfers."}
          </span>
          <button className="button primary" disabled={busy} type="submit">
            Save profile <Check size={17} />
          </button>
        </div>
      </form>
    </Modal>
  );
}

export function GolferProfilePage({
  profile,
  rounds,
  circles,
  tournaments,
  onEdit,
  onActivate,
  onRound,
  onCircle,
  onTournament,
}: {
  profile: GolferProfile;
  rounds: Round[];
  circles: Circle[];
  tournaments: Tournament[];
  onEdit: (tab: ProfileTab) => void;
  onActivate: () => void;
  onRound: (round: Round) => void;
  onCircle: (circle: Circle) => void;
  onTournament: (tournament: Tournament) => void;
}) {
  const [section, setSection] = useState("Golfer");
  const hostedRounds = rounds.filter((r) => r.createdByMe);
  const hostedEvents = tournaments.filter((t) => t.createdByMe);
  const managedCircles = circles.filter((c) => c.createdByMe);
  const joinedCircles = circles.filter((c) => c.joined);
  return (
    <div className="identity-page">
      <section className="profile-panel identity-hero">
        <div className="profile-cover">
          <span>MEET. PLAY. COMPETE.</span>
        </div>
        <div className="profile-content">
          <div className="profile-main">
            <button
              className="identity-photo"
              aria-label="Edit profile photo"
              onClick={() => onEdit("About you")}
            >
              <Avatar
                initials={initials(profile.name)}
                src={profile.avatarUrl}
                alt={`${profile.name}'s profile photo`}
                size="large"
              />
              <span>
                <Camera size={16} />
              </span>
            </button>
            <button
              className="button secondary small"
              onClick={() => onEdit("About you")}
            >
              <Pencil size={14} />
              Edit profile
            </button>
          </div>
          <div className="identity-name">
            <div>
              <h2>{profile.name}</h2>
              <span className="username">@{profile.username}</span>
            </div>
            {profile.openToRounds && (
              <span className="available-tag">
                <span />
                Open to a round
              </span>
            )}
          </div>
          <p className="identity-area">
            <MapPin size={15} />
            {profile.area}
            <span>Preview golfer</span>
          </p>
          {profile.bio ? (
            <p className="identity-bio">{profile.bio}</p>
          ) : (
            <button
              className="text-link identity-bio"
              onClick={() => onEdit("About you")}
            >
              Add a little about yourself <Plus size={14} />
            </button>
          )}
          <div className="profile-tags">
            <span>
              <Flag size={13} />
              {profile.handicap
                ? `${profile.handicap} handicap`
                : "Handicap not established"}
            </span>
            <span>{profile.style} golfer</span>
            {profile.skillLevel && <span>{profile.skillLevel}</span>}
            {profile.organizer && (
              <span>
                <Users size={13} />
                Organizer Mode
              </span>
            )}
          </div>
          <div className="profile-stats">
            <div>
              <b>{rounds.filter((r) => r.joined).length}</b>
              <span>Rounds joined</span>
            </div>
            <div>
              <b>{tournaments.filter((t) => t.registered).length}</b>
              <span>Tournaments joined</span>
            </div>
            <div>
              <b>{joinedCircles.length}</b>
              <span>Circles</span>
            </div>
            <small>Preview activity</small>
          </div>
        </div>
      </section>
      <div className="identity-tabs" aria-label="View profile section">
        {["Golfer", "Organizer"].map((v) => (
          <button
            key={v}
            aria-pressed={section === v}
            onClick={() => setSection(v)}
          >
            {v === "Golfer" ? <Flag size={17} /> : <Users size={17} />} {v}
          </button>
        ))}
      </div>
      {section === "Golfer" ? (
        <div className="identity-grid">
          <MyCourseCommunities />
          <section className="panel identity-card">
            <div className="identity-card-head">
              <h3>My kind of golf</h3>
              <button
                className="icon-button"
                aria-label="Edit golf preferences"
                onClick={() => onEdit("Your golf")}
              >
                <Pencil size={16} />
              </button>
            </div>
            <dl className="golf-preferences">
              <div>
                <dt>Round length</dt>
                <dd>
                  {profile.roundLength === "Either"
                    ? "9 or 18 holes"
                    : profile.roundLength}
                </dd>
              </div>
              <div>
                <dt>Getting around</dt>
                <dd>
                  {profile.walkingRiding === "Either"
                    ? "Walk or ride"
                    : profile.walkingRiding}
                </dd>
              </div>
              <div>
                <dt>Playing style</dt>
                <dd>{profile.style}</dd>
              </div>
              <div>
                <dt>Handedness</dt>
                <dd>{profile.handedness || "Not added"}</dd>
              </div>
            </dl>
            <div className="availability-block">
              <h4>
                <CalendarDays size={16} /> Usually up for a round
              </h4>
              <div className="availability-days">
                {playingDays.map((d) => (
                  <span
                    key={d}
                    className={
                      profile.preferredDays.includes(d) ? "selected" : ""
                    }
                    aria-label={`${d}${profile.preferredDays.includes(d) ? ": usually available" : ": not selected"}`}
                  >
                    {d}
                  </span>
                ))}
              </div>
              <p>
                <Clock size={15} />
                {profile.preferredTimes.join(" · ") || "Tee times are flexible"}
              </p>
              <small>Preferences, not a booked tee time.</small>
            </div>
          </section>
          <section className="panel identity-card">
            <div className="identity-card-head">
              <h3>Favorite fairways</h3>
              <button
                className="icon-button"
                aria-label="Edit favorite courses"
                onClick={() => onEdit("Your golf")}
              >
                <Pencil size={16} />
              </button>
            </div>
            {profile.favoriteCourses.length ? (
              <div className="favorite-course-list">
                {profile.favoriteCourses.map((c, i) => (
                  <div key={c}>
                    <span>{String(i + 1).padStart(2, "0")}</span>
                    <div>
                      <Flag size={18} />
                      <b>
                        {resolveCourse(c) ? (
                          <Link href={`/courses/${resolveCourse(c)!.slug}`}>
                            {resolveCourse(c)!.name} <ArrowUpRight size={13} />
                          </Link>
                        ) : (
                          c
                        )}
                      </b>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="identity-empty">
                <Flag size={28} />
                <p>Where do you love to play?</p>
                <button
                  className="text-link"
                  onClick={() => onEdit("Your golf")}
                >
                  Add your favorite courses <Plus size={14} />
                </button>
              </div>
            )}
            <div className="identity-tip">
              A familiar course. A few new faces.
              <br />
              That’s a good place to start.
            </div>
          </section>
          <section className="panel identity-card identity-full">
            <div className="identity-card-head">
              <h3>My Circles</h3>
              <Link className="text-link" href="/app/circles">
                Explore Circles <ArrowUpRight size={15} />
              </Link>
            </div>
            {joinedCircles.length ? (
              <div className="profile-circle-list">
                {joinedCircles.map((c) => (
                  <button key={c.id} onClick={() => onCircle(c)}>
                    <Avatar initials={c.initials} color={c.color} />
                    <span>
                      <b>{c.name}</b>
                      <small>{c.area}</small>
                    </span>
                    <ArrowUpRight size={16} />
                  </button>
                ))}
              </div>
            ) : (
              <p className="identity-empty-copy">
                Your golf community starts with a Circle. Join one to see it
                here.
              </p>
            )}
          </section>
        </div>
      ) : (
        <section className="panel identity-card organizer-identity">
          {!profile.organizer ? (
            <div className="organizer-profile-invite">
              <Flag size={32} />
              <h3>Your next great golf day starts with you.</h3>
              <p>
                Host as yourself or add your club’s name and logo. You’re still
                the same golfer, with a few more ways to bring people together.
              </p>
              <button className="button primary" onClick={onActivate}>
                Explore Organizer Mode <ArrowUpRight size={17} />
              </button>
            </div>
          ) : (
            <>
              <div className="organizer-identity-header">
                <Avatar
                  initials={initials(profile.organizerName || profile.name)}
                  src={profile.organizerLogoUrl}
                  alt="Club or organization logo"
                  size="large"
                />
                <div>
                  <span className="eyebrow">ORGANIZER PROFILE</span>
                  <h3>{profile.organizerName || profile.name}</h3>
                  <p>
                    Hosted by {profile.name} · {profile.area}
                  </p>
                </div>
                <button
                  className="button secondary small"
                  onClick={() => onEdit("Organizer")}
                >
                  <Pencil size={14} />
                  Edit organizer
                </button>
              </div>
              <p className="organizer-story">
                {profile.organizerBio ||
                  "Tell golfers what you love to organize and what makes your events feel like your community."}
              </p>
              <div className="profile-tags">
                {profile.hostingFocus.map((v) => (
                  <span key={v}>{v}</span>
                ))}
              </div>
              {profile.organizerWebsite && (
                <a
                  className="text-link organizer-website"
                  href={profile.organizerWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Globe size={16} />
                  Visit club website <ArrowUpRight size={15} />
                </a>
              )}
              <div className="organizer-profile-metrics">
                <div>
                  <b>{hostedRounds.length + hostedEvents.length}</b>
                  <span>Preview events created</span>
                </div>
                <div>
                  <b>{managedCircles.length}</b>
                  <span>Circles started</span>
                </div>
                <p>
                  Reputation grows with real events.
                  <br />
                  <small>
                    Ratings and verification aren’t available in this preview.
                  </small>
                </p>
              </div>
              <div className="identity-card-head">
                <h3>What I’m putting together</h3>
                <Link className="text-link" href="/organizer/events">
                  Manage events <ArrowUpRight size={15} />
                </Link>
              </div>
              {hostedRounds.length + hostedEvents.length > 0 ? (
                <div className="profile-hosted-list">
                  {hostedRounds.map((r) => (
                    <button key={r.id} onClick={() => onRound(r)}>
                      <Flag size={20} />
                      <span>
                        <b>{r.title}</b>
                        <small>
                          {r.course} · {r.when}
                        </small>
                      </span>
                      <ArrowUpRight size={17} />
                    </button>
                  ))}
                  {hostedEvents.map((t) => (
                    <button key={t.id} onClick={() => onTournament(t)}>
                      <Trophy size={20} />
                      <span>
                        <b>{t.name}</b>
                        <small>
                          {t.course} · {t.date}
                        </small>
                      </span>
                      <ArrowUpRight size={17} />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="identity-empty">
                  <Trophy size={28} />
                  <p>Your hosting story starts here.</p>
                  <Link
                    className="button secondary small"
                    href="/organizer/events"
                  >
                    Create your first event <Plus size={15} />
                  </Link>
                </div>
              )}
              {managedCircles.length > 0 && (
                <>
                  <h3>Circles I manage</h3>
                  <div className="profile-circle-list">
                    {managedCircles.map((c) => (
                      <button key={c.id} onClick={() => onCircle(c)}>
                        <Avatar initials={c.initials} color={c.color} />
                        <span>
                          <b>{c.name}</b>
                          <small>{c.area}</small>
                        </span>
                        <ArrowUpRight size={16} />
                      </button>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </section>
      )}
      <p className="identity-local-note">
        Profile preview · Your photo and details stay in this browser. They are
        not yet shared with other golfers.
      </p>
    </div>
  );
}
