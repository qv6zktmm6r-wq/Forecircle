export type RoundStatus =
  | "draft"
  | "open"
  | "full"
  | "scheduled"
  | "in_progress"
  | "completed"
  | "cancelled";
export type GolfStyle =
  | "Casual"
  | "Competitive"
  | "Beginner friendly"
  | "Networking"
  | "Practice"
  | "Social"
  | "Just for fun";
export interface Round {
  id: string;
  title: string;
  course: string;
  courseId?: string;
  area: string;
  when: string;
  time: string;
  holes: 9 | 18;
  spots: number;
  style: GolfStyle;
  host: string;
  initials: string;
  color: string;
  image: string;
  joined?: boolean;
  date?: string;
  notes?: string;
  createdByMe?: boolean;
}
export interface Circle {
  id: string;
  name: string;
  description: string;
  area: string;
  members: number;
  category: string;
  initials: string;
  image: string;
  color: string;
  joined?: boolean;
  createdByMe?: boolean;
}
export interface Tournament {
  id: string;
  name: string;
  course: string;
  courseId?: string;
  area: string;
  date: string;
  time: string;
  format: string;
  players: number;
  capacity: number;
  image: string;
  challenges: string[];
  registered?: boolean;
  createdByMe?: boolean;
}
export interface GolferProfile {
  name: string;
  username: string;
  area: string;
  handicap: string;
  style: string;
  organizer: boolean;
  avatarUrl: string;
  bio: string;
  skillLevel: string;
  handedness: string;
  roundLength: string;
  walkingRiding: string;
  preferredDays: string[];
  preferredTimes: string[];
  favoriteCourses: string[];
  openToRounds: boolean;
  organizerName: string;
  organizerBio: string;
  organizerLogoUrl: string;
  organizerWebsite: string;
  hostingFocus: string[];
}
export interface Idea {
  id: string;
  title: string;
  description: string;
  votes: number;
  status: "Under review" | "Planned" | "Building" | "Released";
  category: string;
  voted?: boolean;
}
export interface ChatMessage {
  id: string;
  text: string;
  mine: boolean;
  author: string;
  time: string;
}
