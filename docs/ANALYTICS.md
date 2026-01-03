# Analytics Strategy

To ensure we build features that truly resonate with our "Minimize screen time, maximize life time" mission, we will track specific user interactions and engagement metrics.

## Key Metrics (KPIs)

### Engagement
- **Daily Active Users (DAU)**: Unique users opening the app daily.
- **Time Spent vs. Activity**: We want to optimize for *quality* time. High time spent on "Discovery" is good, but high time spent on "Doomscrolling" is bad.
- **Quest Participation Rate**: % of users who join at least one quest per week.

### Growth
- **Viral Coefficient**: Average number of new users invited per existing user (via "Add People" or Quest Invites).
- **Retention**: Day-1, Day-7, and Day-30 retention rates.

## Event Tracking

### 1. Quests
| Event Name | Properties | Description |
|Args|---|---|
| `quest_created` | `category`, `type`, `is_public` | User publishes a new quest. |
| `quest_joined` | `quest_id`, `host_id` | User joins an existing quest. |
| `quest_completed` | `quest_id`, `participant_count` | A quest reaches its completion state. |

### 2. Captures (Social)
| Event Name | Properties | Description |
|---|---|---|
| `capture_posted` | `has_music`, `has_location`, `tagged_count` | User posts a dual-camera moment. |
| `reaction_added` | `capture_id` | User reacts to a post. |

### 3. Booking
| Event Name | Properties | Description |
|---|---|---|
| `booking_viewed` | `venue_id` | User views a venue/event details. |
| `booking_initiated` | `venue_id` | User clicks "Book". |
| `booking_confirmed` | `venue_id`, `amount` | Successful transaction. |

### 4. Chat
| Event Name | Properties | Description |
|---|---|---|
| `message_sent` | `type` (text, image, invite) | User sends a message. |
| `invite_accepted` | `quest_id` | User accepts a quest invite via chat. |

## Implementation Plan
- **Phase 1**: Implement basic event logging for key actions (Post, Create Quest).
- **Phase 2**: Dashboard for visualizing retention and features usage.
- **Phase 3**: A/B testing for quest discovery algorithms.
