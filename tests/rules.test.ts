import test from "node:test";
import assert from "node:assert/strict";
import {
  canTransition,
  registrationOutcome,
  organizerRating,
  toggleVote,
  mayManageCircle,
} from "../packages/utilities/rules";
import {
  profileSchema,
  roundSchema,
  messageSchema,
} from "../packages/validation";
test("full rounds waitlist, closed registrations reject excess golfers", () => {
  assert.equal(registrationOutcome(4, 4, true), "waitlisted");
  assert.equal(registrationOutcome(4, 4, false), "closed");
  assert.equal(registrationOutcome(4, 3, true), "confirmed");
  assert.throws(() => registrationOutcome(0, 0, true));
});
test("completed/cancelled rounds cannot be reopened", () => {
  assert.equal(canTransition("completed", "open"), false);
  assert.equal(canTransition("cancelled", "open"), false);
  assert.equal(canTransition("open", "full"), true);
});
test("organizer ratings require three reviews", () => {
  assert.equal(organizerRating([5, 1]), null);
  assert.equal(organizerRating([5, 5, 4]), 4.7);
});
test("voting is unique and can be reversed", () => {
  const voters = toggleVote(new Set(), "golfer");
  assert.equal(voters.size, 1);
  assert.equal(toggleVote(voters, "golfer").size, 0);
  assert.equal(voters.size, 1);
});
test("members and event organizers cannot administer Circles", () => {
  assert.equal(mayManageCircle("member"), false);
  assert.equal(mayManageCircle("organizer"), false);
  assert.equal(mayManageCircle("admin"), true);
});
test("profile validation rejects unsafe usernames and out-of-range handicap", () => {
  assert.equal(
    profileSchema.safeParse({
      display_name: "Demo Golfer",
      username: "<script>",
      general_region: "Temecula",
      handicap: 55,
      golf_style: "Casual",
    }).success,
    false,
  );
});
test("rounds cannot request a fifth player", () => {
  assert.equal(
    roundSchema.safeParse({
      title: "Demo round",
      course: "Demo course",
      date: "2027-01-01",
      time: "8:00",
      holes: 18,
      spots: 4,
      notes: "",
    }).success,
    false,
  );
});
test("blank or oversized messages are rejected", () => {
  assert.equal(messageSchema.safeParse({ text: "  " }).success, false);
  assert.equal(
    messageSchema.safeParse({ text: "a".repeat(2001) }).success,
    false,
  );
});
