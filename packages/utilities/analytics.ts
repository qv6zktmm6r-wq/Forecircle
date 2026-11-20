export type AnalyticsEvent =
  | "landing_page_view"
  | "signup_started"
  | "signup_completed"
  | "referral_used"
  | "round_created"
  | "round_joined"
  | "round_completed"
  | "golfer_followed"
  | "circle_joined"
  | "organizer_enabled"
  | "tournament_created"
  | "tournament_published"
  | "registration_received"
  | "event_completed"
  | "feature_request_created"
  | "feature_request_voted";
type Adapter = (
  event: AnalyticsEvent,
  properties: Record<string, string | number | boolean>,
) => void;
let adapter: Adapter | undefined;
export const analytics = {
  configure(next: Adapter) {
    adapter = next;
  },
  track(
    event: AnalyticsEvent,
    properties: Record<string, string | number | boolean> = {},
  ) {
    adapter?.(event, properties);
  },
};
