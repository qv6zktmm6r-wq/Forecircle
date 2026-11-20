import test from "node:test";
import assert from "node:assert/strict";
import {
  golferProfileSchema,
  restoreGolferProfile,
  photoFileError,
  profileDefaults,
  MAX_PHOTO_BYTES,
} from "../packages/utilities/profile";
const legacy = {
  name: "Demo Golfer",
  username: "demo_golfer",
  area: "Temecula, CA",
  handicap: "14",
  style: "Social",
  organizer: true,
};
const profile = { ...profileDefaults, ...legacy };
test("legacy profiles gain optional fields without losing golfer or organizer identity", () => {
  const upgraded = restoreGolferProfile(legacy, profile);
  assert.equal(upgraded.name, legacy.name);
  assert.equal(upgraded.organizer, true);
  assert.equal(upgraded.avatarUrl, "");
  assert.deepEqual(upgraded.preferredDays, []);
});
test("invalid saved identity cannot inject arbitrary image URLs", () => {
  assert.equal(
    restoreGolferProfile(
      { ...profile, avatarUrl: "https://example.com/tracker" },
      profile,
    ),
    profile,
  );
  assert.equal(
    golferProfileSchema.safeParse({
      ...profile,
      avatarUrl: "data:image/svg+xml,<svg/>",
    }).success,
    false,
  );
});
test("organizer links reject script URLs, HTTP and embedded credentials", () => {
  for (const organizerWebsite of [
    "javascript:alert(1)",
    "http://club.example",
    "https://user:pass@club.example",
  ]) {
    assert.equal(
      golferProfileSchema.safeParse({ ...profile, organizerWebsite }).success,
      false,
    );
  }
  assert.equal(
    golferProfileSchema.safeParse({
      ...profile,
      organizerWebsite: "https://club.example/events",
    }).success,
    true,
  );
});
test("optional handicap stays optional; out-of-range values and duplicate availability fail", () => {
  assert.equal(
    golferProfileSchema.parse({ ...profile, handicap: "" }).handicap,
    "",
  );
  assert.equal(
    golferProfileSchema.safeParse({ ...profile, handicap: "55" }).success,
    false,
  );
  assert.equal(
    golferProfileSchema.safeParse({ ...profile, preferredDays: ["Sat", "Sat"] })
      .success,
    false,
  );
  assert.equal(
    golferProfileSchema.safeParse({ ...profile, bio: "a".repeat(401) }).success,
    false,
  );
  assert.equal(
    golferProfileSchema.safeParse({
      ...profile,
      favoriteCourses: ["One", "Two", "Three", "Four"],
    }).success,
    false,
  );
});
test("image selection checks size, MIME and file signature before decoding", () => {
  const png = Uint8Array.from([137, 80, 78, 71, 13, 10, 26, 10]);
  assert.equal(photoFileError("image/png", 100, png), null);
  assert.equal(
    photoFileError("image/jpeg", 100, Uint8Array.from([255, 216, 255])),
    null,
  );
  assert.equal(
    photoFileError("image/webp", 100, new TextEncoder().encode("RIFF0000WEBP")),
    null,
  );
  assert.notEqual(photoFileError("image/png", MAX_PHOTO_BYTES + 1, png), null);
  assert.notEqual(
    photoFileError("image/png", 100, new TextEncoder().encode("<svg></svg>")),
    null,
  );
  assert.notEqual(photoFileError("image/jpeg", 100, png), null);
  assert.notEqual(photoFileError("image/heic", 100, png), null);
  assert.notEqual(photoFileError("image/png", 0, png), null);
});
test("profile input cannot introduce verification or admin authority", () => {
  const parsed = golferProfileSchema.parse({
    ...profile,
    organizerVerified: true,
    isAdmin: true,
  });
  assert.equal("organizerVerified" in parsed, false);
  assert.equal("isAdmin" in parsed, false);
});
