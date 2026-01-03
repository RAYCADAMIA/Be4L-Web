# Data Scheme

This document outlines the core data models used in the Be4L application.

## User
Represents a platform user.
```typescript
interface User {
  id: string;
  username: string;     // Unique "Name4L"
  avatar_url: string;
  streak_count: number; // Gamification metric
  bio: string;
}
```

## Capture (Post)
Represents a dual-camera moment shared by a user.
```typescript
interface Capture {
  id: string;
  user_id: string;
  user: User;           // Expanded user object
  front_image_url: string;
  back_image_url: string;
  location_name: string;
  music_track?: string;
  music_start_time?: number;
  caption: string;
  created_at: string;   // ISO String
  tagged_users?: User[];
  privacy: 'public' | 'private';
  reaction_count?: number;
  comment_count?: number;
  reactions?: Reaction[];
}
```

## Quest
Represents an activity or event created by a user.
```typescript
enum QuestType {
  CASUAL = 'casual',
  COMPETITION = 'competition'
}

enum QuestStatus {
  OPEN = 'open',
  FULL = 'full',
  COMPLETED = 'completed'
}

interface Quest {
  id: string;
  host_id: string;
  host: User;
  type: QuestType;
  category: string;     // e.g., 'Pickleball', 'Cafe'
  title: string;
  description: string;
  start_time: string;
  max_participants: number;
  current_participants: number;
  status: QuestStatus;
  fee: number;          // 0 for free events
  is_public: boolean;
  location?: string;
  ideal_match_criteria?: string;
  participants?: User[];
}
```

## Message
Represents a chat message between users.
```typescript
interface Message {
  id: string;
  sender_id: string;
  content: string;
  timestamp: string;
  is_me: boolean;       // Helper for frontend rendering
  type?: 'text' | 'image' | 'quest_invite' | 'system';
  image_url?: string;
  quest_id?: string;    // For invite types
}
```

## Reaction
Represents a user reaction to a capture (typically an image/RealMoji).
```typescript
interface Reaction {
  id: string;
  user: User;
  image_url: string;
  timestamp: string;
}
```
