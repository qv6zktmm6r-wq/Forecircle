export const brand = {
  name: "ForeCircle",
  primaryDomain: "forecirclegolf.com",
  appDomain: "forecircle.app",
  tagline: "Meet. Play. Compete.",
  secondaryTagline: "Find your people. Play more golf.",
  supportEmail: null,
  logoPath: "/brand/forecircle-logo.png",
  termsUrl: "/terms",
  privacyUrl: "/privacy",
  colors: {
    forest: "#003D29",
    fairway: "#65B800",
    ivory: "#FFF8EE",
    sage: "#E8F0E8",
    sand: "#D7CBB8",
    charcoal: "#182C24",
    muted: "#53665B",
  },
  socialHandles: {},
  appLinks: { ios: null, android: null },
  company: { legalName: null },
  analyticsIds: {},
} as const;
export const features = {
  liveScoring: false,
  payments: false,
  leagues: false,
  verifiedOrganizers: false,
  coursePartnerships: false,
  nativeDeepLinks: false,
  communityLaunch: false,
  organizerBeta: false,
} as const;
export const configured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
);
