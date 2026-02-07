
export interface AuraTransaction {
  id: string;
  user_id: string;
  amount: number;
  reason: string;
  quest_id?: string;
  source: 'SYSTEM' | 'USER_REVIEW' | 'QUEST_COMPLETE';
  created_at: string;
}

export interface DailyTask {
  id: string;
  text: string;
  completed: boolean;
}

export enum QuestParticipantStatus {
  REQUESTED = 'REQUESTED',
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
}

// PARTNER POST SYSTEM (New)
export interface PartnerPost {
  id: string;
  operator_id: string;
  operator: Operator; // Expanded
  caption: string;
  media_urls: string[]; // Up to 5
  tagged_item_id?: string;
  tagged_item?: DibsItem; // "Shop Now" link

  // Interactions (Separate from Lore)
  likes_count: number;
  comments_count: number;
  created_at: string;
}

export interface User {
  id: string;
  handle: string; // @username
  username: string; // Alias for handle (Legacy/UI compatibility)
  name: string;
  mobile?: string;
  email?: string;
  birthdate?: string; // ISO Date YYYY-MM-DD
  avatar_url: string;
  bio: string;

  // STRICT SPECS: Aura System
  aura: {
    score: number;        // Cumulative reliability score
    trend: number;        // Rolling trend direction
    last_updated_at: string;
  };

  level: number;       // Computed from system events
  reliability_score: number; // Alias or same as aura.score (internal)

  // Legacy / Presentation
  life_exp: number;
  life_streak: number;
  streak_count: number; // Daily consistency
  last_posted_date?: string;
  last_window_id?: string;

  preferences?: {
    tags?: string[];
    distance?: number;
    time_windows?: string[];
  };

  // UI Helpers
  quest_count?: number;
  followers_count?: number;
  following_count?: number;
  cover_url?: string;
  is_operator?: boolean; // v3.0
  is_admin?: boolean;
  onboarding_completed?: boolean;
  is_new_user?: boolean;
  is_guest?: boolean;
}

// 0. LORE SYSTEM DEFINITION (LOCK)
// Lore is the immutable memory layer created only by Capture.
export interface LoreEntry {
  id: string; // lore_id
  user_id: string; // author_id
  user?: User;    // Expanded author
  quest_id?: string; // LINKING TO QUEST

  // Media (Immutable)
  media_type: 'image' | 'video';
  front_media_url: string;
  back_media_url: string; // Dual cam
  duration?: number;      // Video only

  // Time (Authoritative)
  created_at: string;     // Server time
  captured_at: string;    // Device time - THE TRUTH for Feed & Replay

  // Location
  location: {
    lat: number;
    lng: number;
    place_name?: string;
    accuracy?: number;
  };
  location_coords?: { latitude: number; longitude: number }; // Legacy alias
  location_name?: string; // Legacy alias

  // Context
  music_context?: {
    spotify_track_id?: string;
    track_name: string;
    artist: string;
    playback_position?: number;
  };
  music_track?: string; // Legacy alias
  music_start_time?: number; // Legacy alias

  caption?: string;
  tags?: string[];
  tagged_users?: User[];
  quest?: Quest;

  // Visibility (Strict)
  visibility: 'public' | 'friends' | 'private';
  privacy?: 'public' | 'friends' | 'private'; // Alias

  // State
  state: 'active'; // Invariant: Once created, never archived, just windowed.

  // Interactions
  reaction_count: number;
  comment_count: number;
  reactions?: Reaction[];

  // LEGACY ALIAS (To avoid breaking everything immediately, mapped to new fields)
  front_image_url?: string;
  back_image_url?: string;
}

// Alias for backward compat until full refactor
export type Capture = LoreEntry;

export interface Reaction {
  id: string;
  user_id?: string;
  user?: User;
  reaction_type?: string; // 'timestamp' | 'emoji'
  reacted_at?: string;

  // Legacy UI compat
  image_url?: string;
  timestamp?: string; // formatted string
}

// QUEST SYSTEM (LOCKED)
export enum QuestType {
  CANON = 'canon',
  SPONTY = 'sponty',
  RANDOM = 'random'
}

export enum QuestStatus {
  DRAFT = 'draft',
  DISCOVERABLE = 'discoverable',
  LOBBY = 'lobby',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  OPEN = 'discoverable', // Alias
  FULL = 'active'        // Alias
}

export enum QuestVisibilityScope {
  PUBLIC = 'public',
  FRIENDS = 'friends'
}

export enum QuestTimingIntent {
  NOW = 'now', // Spontaneous / Happens Right Now
  SCHEDULED = 'scheduled', // Classic planned event
  FLEXIBLE = 'flexible' // Pick a date + Window (Morning, Evening, etc.)
}

export interface Quest {
  id: string;
  host_id: string; // lead_id
  host?: User;

  // Intent & Mode
  mode: QuestType;
  timing_intent?: QuestTimingIntent;
  source: 'USER_CREATED' | 'SYSTEM_GENERATED' | 'CANON_ESCALATED';

  // Core Info
  title: string;
  description: string;
  category: string;
  activity: string;

  // Time
  start_time: string;
  end_time?: string;
  duration?: number;

  // Location
  location: {
    lat: number;
    lng: number;
    place_name: string;
    address_full?: string;
  };

  // Visibility & Access
  visibility_scope: QuestVisibilityScope;
  capacity?: number; // null = unlimited
  approval_required: boolean;
  join_mode: 'LOCKED' | 'OPEN_ACTIVE';

  // State
  status: QuestStatus;
  participants: User[]; // Full profile objects for UI
  participant_ids: string[]; // ID list
  ready_ids?: string[]; // IDs of participants who are ready

  // Rewards
  aura_reward: number;
  exp_reward: number;

  // v1.2 Signals
  signals?: {
    skill?: string[];
    vibe?: string[];
    physical?: string[];
    social?: string[];
  };
  aura_req?: number;

  // v1.3 Enhanced Details
  itinerary?: { time: string; description: string }[];
  checklist?: string[]; // Essentials
  vibe_signals?: string[]; // e.g. "Ladies Only"

  // Host Controls
  is_started_manually?: boolean;
  host_managed_attendance?: string[]; // IDs of verified attendees

  // Legacy / UI Helpers
  fee?: number;
  max_participants?: number; // Legacy alias for capacity
  is_public?: boolean; // map to visibility_scope
  current_participants?: number; // computed
  host_capture_url?: string;
  location_coords?: { latitude: number; longitude: number };
  location_name?: string;
}

// JOIN FLOW
export interface QuestRequest {
  id: string;
  quest_id: string;
  user_id: string;
  user?: User;
  message?: string;
  status: QuestParticipantStatus;
  decline_reason?: string; // Required if DECLINED
  created_at: string;
}

// ECHO SYSTEM (COORDINATION)
export enum EchoType {
  LOBBY = 'lobby',
  PERSONAL = 'personal'
}

export interface Echo {
  id: string;
  type: EchoType;
  participant_ids: string[];
  created_at: string;
  archived_at?: string | null;

  // Context Binding
  context_type?: 'QUEST' | 'SQUAD' | 'NONE';
  context_id?: string;

  // UI Helpers
  name?: string;     // For personal/squad chats
  last_message?: EchoMessage;
  unread_count?: number;
  avatar_url?: string;
}

export interface EchoMessage {
  id: string;
  echo_id: string;
  sender_id: string;
  content_type: 'text' | 'image' | 'system' | 'quest_invite';
  content: string;
  created_at: string;
  is_me?: boolean; // UI helper

  // Optional payloads
  image_url?: string;
  quest_id?: string;

  // Legacy Aliases
  timestamp?: string; // alias for created_at
  type?: 'text' | 'image' | 'system' | 'quest_invite'; // alias for content_type
}

// Global Alias for Legacy Chat Code
export type Message = EchoMessage;

// SQUAD SYSTEM
export interface Squad {
  id: string;
  name: string;
  created_by: string;
  member_ids: string[];
  echo_id: string; // Persistent chat
  created_at: string;
}

// DIBS SYSTEM (LOGISTICS) v3.0 Social Marketplace

export interface Operator {
  user_id: string; // PK, One-to-One with User
  business_name: string;
  slug: string; // Unique URL identifier
  bio: string;
  category: string; // 'venue' | 'event' | 'service' | 'food' | 'barber' etc
  cover_photo_url: string;
  logo_url: string; // Circular avatar
  location_text: string; // e.g. "Davao City"
  lat?: number;
  lng?: number;

  // Payment Info (Manual Verification)
  gcash_name?: string;
  gcash_number?: string;

  is_verified: boolean;

  // UI Helpers
  followers_count?: number;
  following_count?: number;
  rating?: number;
  is_following?: boolean;
  owner?: User; // Expanded user details
  gallery?: OperatorPhoto[];
}

export interface UserRelationship {
  id: string;
  follower_id: string; // User who follows
  following_id: string; // Operator/User being followed
  created_at: string;
}

export interface EventTier {
  id: string;
  name: string; // e.g. "Early Bird", "VIP"
  price: number;
  perks: string[]; // e.g. ["Free Drink", "Front Row"]
  capacity: number;
  available: number;
}

export type DibsType = 'PLACE' | 'EVENT';

export interface DibsItem {
  id: string;
  operator_id: string; // FK to Operator
  title: string;
  description: string;
  price: number; // Base price or starting price
  category: string; // Flexible string for filtering
  image_url: string;
  images?: string[]; // Multiple high-res posters/photos
  unit_label?: string; // e.g. "ticket", "pax", "hour"
  is_featured?: boolean;

  // New Fields for Places vs Events
  type: DibsType;
  event_date?: string; // ISO Date for Events
  event_location?: string; // Optional override for Operator location
  event_lat?: number;
  event_lng?: number;
  tiers?: EventTier[]; // For Events

  // Place operational fields
  opening_time?: string; // HH:mm
  closing_time?: string; // HH:mm
  slot_duration?: number; // minutes
  amenities?: string[];
  total_slots?: number;
  resources?: { id: string; name: string }[];
  is_active?: boolean;

  // Inventory
  available_slots: number;
}

export interface OperatorPhoto {
  id: string;
  operator_id: string;
  photo_url: string;
  caption?: string;
}

export interface DibsBooking {
  id: string;
  user_id: string;
  operator_id: string; // Denormalized for query perf
  item_id: string;
  item?: DibsItem;
  user?: User; // The buyer

  status: 'PENDING_PAYMENT' | 'PENDING_VERIFICATION' | 'CONFIRMED' | 'REDEEMED' | 'REJECTED';
  total_amount: number;
  payment_proof_url?: string; // Screenshot

  // Form Data
  quantity: number;
  booking_date: string; // ISO Date of the booking slot

  // New Fields
  booking_ref?: string;
  slot_times?: string[];
  extracted_ref?: string;
  tier_id?: string; // For Events

  created_at: string;
}

// DATA EXPORTS
export type CompetitionStatus = 'upcoming' | 'ongoing' | 'registration_open' | 'past';
export interface Competition {
  id: string;
  title: string;
  category: string;
  sub_category?: string;
  date_range: string;
  location: string;
  prize_pool: string;
  status: CompetitionStatus;
  image_url: string;
  description?: string;
  organizer?: string;
}
