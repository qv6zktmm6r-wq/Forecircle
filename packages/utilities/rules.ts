import type { RoundStatus } from "../types";
const transitions: Record<RoundStatus, RoundStatus[]> = {
  draft: ["open", "cancelled"],
  open: ["full", "scheduled", "cancelled"],
  full: ["open", "scheduled", "cancelled"],
  scheduled: ["in_progress", "cancelled"],
  in_progress: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};
export function canTransition(from: RoundStatus, to: RoundStatus) {
  return transitions[from].includes(to);
}
export function registrationOutcome(
  capacity: number,
  confirmed: number,
  waitlistEnabled: boolean,
): "confirmed" | "waitlisted" | "closed" {
  if (!Number.isInteger(capacity) || capacity < 1 || confirmed < 0)
    throw new Error("Invalid capacity");
  return confirmed < capacity
    ? "confirmed"
    : waitlistEnabled
      ? "waitlisted"
      : "closed";
}
export function organizerRating(reviews: number[], minimum = 3): number | null {
  return reviews.length < minimum
    ? null
    : Math.round((reviews.reduce((a, b) => a + b, 0) / reviews.length) * 10) /
        10;
}
export function toggleVote(
  voters: ReadonlySet<string>,
  golfer: string,
): Set<string> {
  const next = new Set(voters);
  if (next.has(golfer)) next.delete(golfer);
  else next.add(golfer);
  return next;
}
export function mayManageCircle(role: string) {
  return role === "founder" || role === "admin";
}
