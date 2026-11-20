import { z } from "zod";
import type { GolferProfile } from "../types";
import { profileSchema } from "../validation";

export const playingDays = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
] as const;
export const playingTimes = [
  "Early morning",
  "Morning",
  "Midday",
  "Afternoon",
  "Evening",
] as const;
export const hostingOptions = [
  "Social rounds",
  "Beginner golf",
  "Tournaments",
  "Charity events",
  "Competitive golf",
  "Networking",
] as const;
export const profileDefaults = {
  avatarUrl: "",
  bio: "",
  skillLevel: "",
  handedness: "",
  roundLength: "Either",
  walkingRiding: "Either",
  preferredDays: [],
  preferredTimes: [],
  favoriteCourses: [],
  openToRounds: false,
  organizerName: "",
  organizerBio: "",
  organizerLogoUrl: "",
  organizerWebsite: "",
  hostingFocus: [],
};
const localPhoto = z
  .string()
  .max(400_000, "Choose a smaller photo.")
  .refine(
    (v) => !v || /^data:image\/jpeg;base64,[A-Za-z0-9+/]+=*$/.test(v),
    "Select a photo using the photo picker.",
  );
const unique = (v: string[]) => new Set(v).size === v.length;
export const golferProfileSchema = z.object({
  name: profileSchema.shape.display_name,
  username: profileSchema.shape.username,
  area: profileSchema.shape.general_region,
  handicap: z
    .string()
    .trim()
    .refine(
      (v) =>
        !v ||
        (Number.isFinite(Number(v)) && Number(v) >= -10 && Number(v) <= 54),
      "Handicap must be between -10 and 54, or blank.",
    ),
  style: profileSchema.shape.golf_style,
  organizer: z.boolean(),
  avatarUrl: localPhoto.default(""),
  bio: z.string().trim().max(400).default(""),
  skillLevel: z.enum(["", "Beginner", "Intermediate", "Advanced"]).default(""),
  handedness: z.enum(["", "Right-handed", "Left-handed"]).default(""),
  roundLength: z.enum(["9 holes", "18 holes", "Either"]).default("Either"),
  walkingRiding: z.enum(["Walk", "Ride", "Either"]).default("Either"),
  preferredDays: z.array(z.enum(playingDays)).max(7).refine(unique).default([]),
  preferredTimes: z
    .array(z.enum(playingTimes))
    .max(5)
    .refine(unique)
    .default([]),
  favoriteCourses: z
    .array(z.string().trim().min(2).max(100))
    .max(3)
    .default([]),
  openToRounds: z.boolean().default(false),
  organizerName: z.string().trim().max(80).default(""),
  organizerBio: z.string().trim().max(600).default(""),
  organizerLogoUrl: localPhoto.default(""),
  organizerWebsite: z
    .string()
    .trim()
    .max(240)
    .refine((v) => {
      if (!v) return true;
      try {
        const u = new URL(v);
        return u.protocol === "https:" && !u.username && !u.password;
      } catch {
        return false;
      }
    }, "Use a complete https:// website address without login details.")
    .default(""),
  hostingFocus: z
    .array(z.enum(hostingOptions))
    .max(6)
    .refine(unique)
    .default([]),
});

/** Upgrade older browser previews without discarding their account identity. */
export function restoreGolferProfile(
  input: unknown,
  fallback: GolferProfile,
): GolferProfile {
  const parsed = golferProfileSchema.safeParse(input);
  return parsed.success ? parsed.data : fallback;
}
export function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((v) => v[0])
    .join("")
    .toUpperCase();
}
export const MAX_PHOTO_BYTES = 8 * 1024 * 1024;
export function photoFileError(
  type: string,
  size: number,
  bytes: Uint8Array,
): string | null {
  if (!size || size > MAX_PHOTO_BYTES)
    return "Choose a photo smaller than 8 MB.";
  const jpeg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  const png = [137, 80, 78, 71, 13, 10, 26, 10].every((b, i) => bytes[i] === b);
  const webp =
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
  if (
    !(
      (type === "image/jpeg" && jpeg) ||
      (type === "image/png" && png) ||
      (type === "image/webp" && webp)
    )
  )
    return "Choose a JPG, PNG, or WebP photo. For HEIC photos, export or share a JPG first.";
  return null;
}
