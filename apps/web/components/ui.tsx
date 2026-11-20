"use client";
import { useEffect, useRef, useId } from "react";
import Link from "next/link";
import {
  Flag,
  ArrowUpRight,
  X,
  MapPin,
  Clock,
  Users,
  ArrowRight,
} from "lucide-react";
import type { Round } from "@shared/types";
import { resolveCourse } from "@shared/courses";
import { brand } from "@shared/config/brand";
export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link
      href="/"
      className={`logo official-logo ${light ? "logo-light" : ""}`}
      aria-label="ForeCircle home"
    >
      <img
        className="brand-lockup"
        src={brand.logoPath}
        alt="ForeCircle — Meet. Play. Compete."
        width={2172}
        height={724}
      />
      <span className="brand-emblem" aria-hidden="true">
        <img src={brand.logoPath} alt="" />
      </span>
    </Link>
  );
}

export function Arrow() {
  return <ArrowUpRight size={17} />;
}
export function Avatar({
  initials,
  color = "#dbe4d4",
  size = "",
  src,
  alt = "Golfer profile photo",
}: {
  initials: string;
  color?: string;
  size?: string;
  src?: string;
  alt?: string;
}) {
  return (
    <span className={`avatar ${size}`} style={{ background: color }}>
      {src ? <img src={src} alt={alt} /> : initials}
    </span>
  );
}
export function Modal({
  children,
  title,
  onClose,
  wide = false,
}: {
  children: React.ReactNode;
  title: string;
  onClose: () => void;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    ref.current?.showModal();
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = old;
    };
  }, []);
  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      className={`modal ${wide ? "modal-wide" : ""}`}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-head">
        <h2 id={titleId}>{title}</h2>
        <button
          className="icon-button"
          onClick={onClose}
          aria-label="Close dialog"
        >
          <X size={20} />
        </button>
      </div>
      {children}
    </dialog>
  );
}
export function RoundCard({
  round,
  onOpen,
  onJoin,
  compact = false,
}: {
  round: Round;
  onOpen: () => void;
  onJoin?: () => void;
  compact?: boolean;
}) {
  return (
    <article className={`round-card ${compact ? "compact" : ""}`}>
      <button
        className="card-image-button"
        onClick={onOpen}
        aria-label={`View ${round.title}`}
      >
        <img
          src={round.image}
          alt="A green fairway framed by trees"
          loading="lazy"
        />
        <span className="image-label">
          <span className="live-dot" />
          {round.spots === 0
            ? "Foursome full"
            : round.spots === 1
              ? "Need one more"
              : `${round.spots} spots open`}
        </span>
        <span className="image-arrow">
          <ArrowUpRight size={18} />
        </span>
      </button>
      <div className="round-body">
        <div className="card-kicker">
          {round.when} <span>·</span> {round.time}
        </div>
        <button className="plain card-title" onClick={onOpen}>
          {round.title}
        </button>
        <p className="course-line">
          <MapPin size={13} />
          {round.course}
        </p>
        <div className="round-tags">
          <span>
            <Flag size={12} />
            {round.holes} holes
          </span>
          <span>{round.style}</span>
        </div>
        <div className="round-bottom">
          <div className="host">
            <Avatar initials={round.initials} color={round.color} />
            <span>
              Hosted by <b>{round.host}</b>
            </span>
          </div>
          <button
            className={round.joined ? "join-small joined" : "join-small"}
            onClick={onJoin || onOpen}
          >
            {round.joined ? "Joined" : "View round"}
            {!round.joined && <ArrowRight size={14} />}
          </button>
        </div>
      </div>
    </article>
  );
}
export function RoundDetail({
  round,
  onJoin,
  onClose,
}: {
  round: Round;
  onJoin?: () => void;
  onClose: () => void;
}) {
  return (
    <Modal title={round.title} onClose={onClose}>
      <img
        className="detail-image"
        src={round.image}
        alt="Golf course landscape"
      />
      <p className="eyebrow">OPEN ROUND · PREVIEW</p>
      <h3 className="detail-course">{round.course}</h3>
      <p className="muted">
        <MapPin size={15} /> {round.area}
      </p>
      <div className="detail-grid">
        <div>
          <Clock size={19} />
          <span>
            {round.when}
            <b>{round.time}</b>
          </span>
        </div>
        <div>
          <Flag size={19} />
          <span>
            Round length<b>{round.holes} holes</b>
          </span>
        </div>
        <div>
          <Users size={19} />
          <span>
            Open places<b>{round.spots} golfers</b>
          </span>
        </div>
        <div>
          <Avatar initials={round.initials} />
          <span>
            Your host<b>{round.host}</b>
          </span>
        </div>
      </div>
      <p>
        {round.notes ||
          "A friendly round with good company. All handicaps are welcome—bring your clubs and your best golf stories."}
      </p>
      {resolveCourse(round.courseId || round.course) && (
        <Link
          className="text-link"
          href={`/courses/${resolveCourse(round.courseId || round.course)!.slug}`}
        >
          Meet the course community <Users size={15} />
        </Link>
      )}
      <div className="notice">
        This is a sample round. Joining the preview does not reserve a tee time
        or contact a golfer.
      </div>
      {onJoin ? (
        <button className="button primary full" onClick={onJoin}>
          {round.joined ? "Leave preview round" : "Join preview round"}
          <ArrowRight size={17} />
        </button>
      ) : (
        <Link className="button primary full" href="/app/rounds">
          Explore rounds <ArrowRight size={17} />
        </Link>
      )}
    </Modal>
  );
}
