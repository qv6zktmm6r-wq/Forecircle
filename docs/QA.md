# Verification evidence — November 7, 2026 Pacific

## Automated

- Production Next.js build: passed; 38 pre-rendered pages.
- Strict TypeScript: passed.
- `pnpm test`: 20 passed, 0 failed. Includes full SQL migration execution in local PGlite and role-boundary tests with mocked Supabase Auth.
- No hosted database/auth deployment was tested or changed.

## Browser observed

- Desktop homepage and branded layout visually reviewed.
- Built static export hydrates and responds. The Next dev preview did not hydrate correctly in this environment; final verification uses the production build.
- Three-step round creation: completed with a named preview round appearing in the round list.
- Join an existing round: joined state/count changed and its group appeared in Messages.
- Local message send: content appeared in the correct demo group conversation.
- Organizer Mode activation on mobile: event dashboard replaced activation state.
- Tournament mobile form and its invalid-date feedback: inspected. Browser native date-entry automation did not commit the supplied date; final submit remains a manual preview check.
- Phone viewport frames: no horizontal overflow at effective 360, 375, and 415 CSS px (375/390/430 outer iframe widths with native scrollbars). Native dialogs stay within the frame and scroll when needed.
- Tablet, laptop, wide desktop and additional share/Lab checks are added below as they complete.

## Remaining real-device and launch checks

iPhone Safari/Android Chrome native device testing, PWA installation/offline behavior, live email/signup/session refresh, hosted RLS advisors and multi-connection races, moderated secure live chat, uploads, actual event registrations and every production acceptance flow. The native mobile application has not been started.

## Additional browser observations

- Exact 768px tablet, 1024px laptop, and 1440px desktop viewport widths all had document scrollWidth equal to clientWidth (no horizontal overflow).
- Organizer Lab vote incremented 47 → 48, then returned to 47 on removal. A new named idea appeared in the list after saving.
- Public sample tournament share dialog produced the correct sample URL and a downloadable QR code.
- Local preview changes survived navigation between app routes. No communication left the preview.

## Golfer and organizer profiles — November 8, 2026

- Passed browser checks: JPEG upload/crop/zoom, PNG organizer-logo upload/reposition, save and reload persistence of both identities, displayed photo in profile/sidebar/header, SVG rejection, photo removal, cancellation preserving the saved logo, unsafe website-link validation, golf preference and favorite-course editing, and same-profile organizer details.
- Created a browser-only test Circle and confirmed it appears in the organizer's managed-Circles section and count. No hosted data was written.
- Chromium responsive frame checks: 375/390/430px outer widths (360/375/415px content widths) with no document overflow; small-phone editor fits and scrolls internally. These are browser layout checks, not physical iPhone/Android validation.
- Remaining manual/live checks: physical iPhone photo library/camera and Android picker; large-photo memory behavior on low-end devices; unavailable/quota-full browser storage; production upload permissions; multiple real golfer accounts; real public profiles. Native HEIC remains intentionally unsupported in this preview.
- Loaded tablet/laptop/wide-desktop profile frames also passed overflow checks at 768/1024/1440px outer widths (753/1009/1425px content widths). Final mobile form layout stacks identity fields on narrow phones.

## Course discovery/community preview — November 8, 2026

- Full automated suite: 32 passing tests, including 6 new course identity/search/distance/membership/adapter tests. Existing local SQL/RLS tests remained passing.
- Static Next.js build: 44 pre-rendered pages/routes, TypeScript compilation passing.
- Browser: ZIP `92584` returns Menifee Lakes only. Radius 10 miles from Temecula Creek returns 5 courses and excludes Menifee Lakes. Course links reach the correct hub.
- Community join + sample golfer My Circle add persisted after reload. Leave removed the golfer's own card. Favorite selection did not opt into a community.
- Created a preview round from Rancho California's hub, verified prefilled full address and canonical course, saved it, and observed it on that course's hub.
- Created a preview tournament from the same hub with future date; verified course identity retained on the filtered tournament list.
- Profile favorite picker found Menifee Lakes by ZIP and saved a link to the correct hub.
- Rendered directory, hub, profile, round wizard and tournament wizard checked at iframe viewport widths 375, 390, 430, 768, 1024 and 1280. Document widths stayed within viewport. A separate dialog-content check caught date/time input overflow at 375px; the fields were changed to stack below 600px and constrained with min-width:0.
- Real-device iPhone Safari/Android Chrome behavior and actual cross-account permissions still require verification after backend integration. These are browser checks of a static preview, not live production E2E tests.

- Final correction verified: tournament dialog at 375px had clientWidth=326 and scrollWidth=326, including the expanded course picker. Favorite course selection works on the phone form. Profile My Circle removal after leaving its course community was manually verified. Temporary QA harness excluded from deployment.
