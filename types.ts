
export interface User {
  id: string;
  username: string;
  name: string;
  mobile?: string;
  email?: string;
  avatar_url: string;
  streak_count: number;
  last_posted_date?: string;
  quest_count?: number;
  friends_count?: number;
  following_count?: number;
  bio: string;
}

export interface Reaction {
  id: string;
  user: User;
  image_url: string;
  timestamp: string;
}

export interface Capture {
  id: string;
  user_id: string;
  user: User;
  front_image_url: string;
  back_image_url: string;
  location_name: string;
  music_track?: string;
  music_start_time?: number; // Time in seconds where the song starts
  caption: string;
  created_at: string;
  tagged_users?: User[];
  privacy: 'public' | 'private';
  reaction_count?: number;
  comment_count?: number;
  reactions?: Reaction[];
  location_coords?: { latitude: number; longitude: number; }; // Lat/Lng for map
}

export enum QuestStatus {
  OPEN = 'open',
  FULL = 'full',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  IN_PROGRESS = 'in_progress'
}

export enum QuestType {
  CASUAL = 'casual',
  COMPETITION = 'competition'
}

export interface Quest {
  id: string;
  host_id: string;
  host: User;
  type: QuestType;
  category: string; // 'Pickleball', 'Cafe', etc.
  title: string;
  description: string;
  start_time: string;
  max_participants: number;
  current_participants: number;
  status: QuestStatus;
  fee: number;
  is_public: boolean;
  location?: string;
  ideal_match_criteria?: string;
  participants?: User[];
  activity?: string;
  ready_ids?: string[];
  kicked_ids?: string[];
}

export interface Message {
  id: string;
  sender_id: string;
  content: string;
  timestamp: string;
  is_me: boolean;
  type?: 'text' | 'image' | 'quest_invite' | 'system';
  image_url?: string;
  quest_id?: string;
}

export type CompetitionStatus = 'upcoming' | 'ongoing' | 'registration_open' | 'past';

export interface Competition {
  id: string;
  title: string;
  category: string; // 'Sports', 'Adventure', 'Social', 'Others'
  sub_category?: string; // 'Pickleball', 'Basketball'
  date_range: string;
  location: string;
  prize_pool: string;
  status: CompetitionStatus;
  image_url: string;
  description?: string;
  organizer?: string;
}
