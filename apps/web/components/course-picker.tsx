"use client";
import { useId, useState } from "react";
import Link from "next/link";
import { Search, MapPin, Check, X } from "lucide-react";
import { courseAddress, resolveCourse, searchCourses } from "@shared/courses";

export function CoursePicker({
  value,
  onChange,
  label = "Choose a golf course",
  disabled = false,
}: {
  value: string;
  onChange: (id: string) => void;
  label?: string;
  disabled?: boolean;
}) {
  const id = useId();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const selected = resolveCourse(value);
  const results = searchCourses(query);
  return (
    <div className="course-picker">
      <label className="field-label" htmlFor={id}>
        {label}
      </label>
      {selected && !open ? (
        <div className="course-selection">
          <MapPin size={19} />
          <div>
            <b>{selected.name}</b>
            <small>{courseAddress(selected)}</small>
            <Link href={`/courses/${selected.slug}`} target="_blank">
              View course community
            </Link>
          </div>
          <button
            type="button"
            className="text-link"
            disabled={disabled}
            onClick={() => {
              setOpen(true);
              setQuery("");
            }}
          >
            Change
          </button>
        </div>
      ) : (
        <>
          <div className="course-search-input">
            <Search size={18} />
            <input
              id={id}
              value={query}
              disabled={disabled}
              placeholder="Course name, city, or ZIP code"
              autoComplete="off"
              aria-controls={`${id}-results`}
              aria-expanded={open}
              onFocus={() => setOpen(true)}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(true);
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  e.preventDefault();
                  setOpen(false);
                }
                if (e.key === "Enter") e.preventDefault();
              }}
            />
            {open && selected && (
              <button
                type="button"
                aria-label="Cancel course change"
                onClick={() => setOpen(false)}
              >
                <X size={17} />
              </button>
            )}
          </div>
          {open && (
            <div
              id={`${id}-results`}
              className="course-picker-results"
              aria-label="Matching courses"
            >
              {results.map(({ course }) => (
                <button
                  type="button"
                  key={course.id}
                  onClick={() => {
                    onChange(course.id);
                    setOpen(false);
                    setQuery("");
                  }}
                >
                  <MapPin size={16} />
                  <span>
                    <b>{course.name}</b>
                    <small>
                      {course.city}, {course.state} {course.postalCode}
                    </small>
                  </span>
                  {course.id === selected?.id && <Check size={16} />}
                </button>
              ))}
              {!results.length && (
                <p>
                  No courses found in our six-course launch directory. Try
                  Temecula, Murrieta, or Menifee.{" "}
                  <Link href="/courses/#suggest-course" target="_blank">
                    Suggest a course
                  </Link>
                </p>
              )}
            </div>
          )}
        </>
      )}
      {!selected && !open && (
        <small>Search and select a course to link its community.</small>
      )}
    </div>
  );
}
