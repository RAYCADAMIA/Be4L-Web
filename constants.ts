
import { User, Capture, Quest, QuestStatus, QuestType, Message, Reaction } from './types';

export const COLORS = {
  PRIMARY: '#CCFF00',
  BLACK: '#000000',
  SURFACE: '#1A1A1A',
  CARD: '#121212',
  WHITE: '#FFFFFF',
};

export const MOCK_USER: User = {
  id: 'u1',
  username: 'life_enthusiast',
  name: 'Alex Rivera',
  mobile: '09123456789',
  email: 'alex@example.com',
  avatar_url: 'https://picsum.photos/100/100?random=1',
  streak_count: 42,
  last_posted_date: '2025-12-30T10:30:00+08:00', // Posted yesterday morning
  quest_count: 12,
  friends_count: 90,
  following_count: 150,
  bio: 'Chasing sunsets and side quests.',
};

export const OTHER_USERS: User[] = [
  { id: 'u2', username: 'sarah_j', name: 'Sarah Jenkins', avatar_url: 'https://picsum.photos/100/100?random=2', streak_count: 105, bio: 'Always moving.' },
  { id: 'u3', username: 'mike_runs', name: 'Mike Ross', avatar_url: 'https://picsum.photos/100/100?random=5', streak_count: 5, bio: 'Marathon training.' },
  { id: 'u4', username: 'dave_climbs', name: 'Dave Miller', avatar_url: 'https://picsum.photos/100/100?random=8', streak_count: 12, bio: 'Climb higher.' },
  { id: 'u5', username: 'pickle_king', name: 'Roger F.', avatar_url: 'https://picsum.photos/100/100?random=9', streak_count: 110, bio: 'Pickleball is life.' },
  { id: 'u6', username: 'art_anna', name: 'Anna K.', avatar_url: 'https://picsum.photos/100/100?random=10', streak_count: 3, bio: 'Painting the town.' },
  { id: 'u7', username: 'bella_sky', name: 'Bella Luna', avatar_url: 'https://picsum.photos/100/100?random=11', streak_count: 24, bio: 'Moonlight dreamer.' },
  { id: 'u8', username: 'the_grill_master', name: 'Chris P.', avatar_url: 'https://picsum.photos/100/100?random=12', streak_count: 15, bio: 'BBQ and chill.' },
  { id: 'u9', username: 'daisy_days', name: 'Daisy D.', avatar_url: 'https://picsum.photos/100/100?random=13', streak_count: 8, bio: 'Sunshine state of mind.' },
  { id: 'u10', username: 'ethan_quest', name: 'Ethan Hunt', avatar_url: 'https://picsum.photos/100/100?random=14', streak_count: 50, bio: 'Mission: Possible.' },
  { id: 'u11', username: 'fiona_fit', name: 'Fiona G.', avatar_url: 'https://picsum.photos/100/100?random=15', streak_count: 30, bio: 'Pushing limits.' },
];

const MOCK_REACTIONS: Reaction[] = [
  { id: 'r1', user: OTHER_USERS[0], image_url: 'https://picsum.photos/100/100?random=20', timestamp: '2m' },
  { id: 'r2', user: OTHER_USERS[1], image_url: 'https://picsum.photos/100/100?random=21', timestamp: '5m' },
  { id: 'r3', user: OTHER_USERS[2], image_url: 'https://picsum.photos/100/100?random=22', timestamp: '10m' },
  { id: 'r4', user: MOCK_USER, image_url: 'https://picsum.photos/100/100?random=23', timestamp: '15m' },
  { id: 'r5', user: OTHER_USERS[3], image_url: 'https://picsum.photos/100/100?random=24', timestamp: '20m' },
  { id: 'r6', user: OTHER_USERS[4], image_url: 'https://picsum.photos/100/100?random=25', timestamp: '30m' },
];

export const MOCK_CAPTURES: Capture[] = [
  // --- TODAY'S LORE ---
  {
    id: 't1',
    user_id: 'u2',
    user: OTHER_USERS[0],
    front_image_url: 'https://picsum.photos/150/200?random=3',
    back_image_url: 'https://picsum.photos/400/600?random=4',
    location_name: 'City Square',
    caption: 'Just dropped! ⚡',
    created_at: '2025-12-31T12:47:05+08:00',
    privacy: 'public',
    reaction_count: 3,
    comment_count: 0,
    reactions: MOCK_REACTIONS.slice(0, 3)
  },
  {
    id: 't2',
    user_id: 'u3',
    user: OTHER_USERS[1],
    front_image_url: 'https://picsum.photos/150/200?random=6',
    back_image_url: 'https://picsum.photos/400/600?random=7',
    location_name: 'Coffee Loft',
    music_track: 'Espresso - Sabrina Carpenter',
    caption: 'Beaut day for a brew.',
    created_at: '2025-12-31T12:47:30+08:00',
    privacy: 'public',
    reaction_count: 12,
    comment_count: 5,
    reactions: MOCK_REACTIONS.slice(1, 5)
  },
  {
    id: 't3',
    user_id: 'u5',
    user: OTHER_USERS[4],
    front_image_url: 'https://picsum.photos/150/200?random=60',
    back_image_url: 'https://picsum.photos/400/600?random=61',
    location_name: 'SuperSmasher Courts',
    caption: 'Pickleball finals! 🎾',
    created_at: '2025-12-31T13:15:00+08:00',
    privacy: 'public',
    reaction_count: 4,
    comment_count: 2,
    reactions: [MOCK_REACTIONS[0], MOCK_REACTIONS[2]]
  },
  {
    id: 't4',
    user_id: 'u6',
    user: OTHER_USERS[5],
    front_image_url: 'https://picsum.photos/150/200?random=62',
    back_image_url: 'https://picsum.photos/400/600?random=63',
    location_name: 'Modern Art Museum',
    caption: 'Lost in the colors.',
    created_at: '2025-12-31T13:45:00+08:00',
    privacy: 'private',
    reaction_count: 0,
    comment_count: 0
  },
  {
    id: 't5',
    user_id: 'u7',
    user: OTHER_USERS[6],
    front_image_url: 'https://picsum.photos/150/200?random=64',
    back_image_url: 'https://picsum.photos/400/600?random=65',
    location_name: 'Skyline Terrace',
    music_track: 'Sky Full of Stars - Coldplay',
    caption: 'Watching the city wake up.',
    created_at: '2025-12-31T14:10:00+08:00',
    privacy: 'public',
    reaction_count: 22,
    comment_count: 8,
    reactions: MOCK_REACTIONS.slice(0, 4)
  },
  {
    id: 't6',
    user_id: 'u8',
    user: OTHER_USERS[7],
    front_image_url: 'https://picsum.photos/150/200?random=66',
    back_image_url: 'https://picsum.photos/400/600?random=67',
    location_name: 'Backyard Grill',
    caption: 'Sunday tradition.',
    created_at: '2025-12-31T14:30:00+08:00',
    privacy: 'public',
    reaction_count: 0,
    comment_count: 0,
    tagged_users: [OTHER_USERS[0]]
  },

  // --- YESTERDAY'S LORE ---
  {
    id: 'y1',
    user_id: 'u4',
    user: OTHER_USERS[3],
    front_image_url: 'https://picsum.photos/150/200?random=30',
    back_image_url: 'https://picsum.photos/400/600?random=31',
    location_name: 'Yesterday Gym',
    caption: 'Grind never stops.',
    created_at: '2025-12-30T14:30:00+08:00',
    privacy: 'public',
    reaction_count: 8,
    comment_count: 2,
    reactions: [MOCK_REACTIONS[1], MOCK_REACTIONS[3], MOCK_REACTIONS[5]]
  },
  {
    id: 'y2',
    user_id: 'u9',
    user: OTHER_USERS[8],
    front_image_url: 'https://picsum.photos/150/200?random=40',
    back_image_url: 'https://picsum.photos/400/600?random=41',
    location_name: 'Botanical Garden',
    caption: 'Flowers are in bloom! 🌸',
    created_at: '2025-12-30T10:15:00+08:00',
    privacy: 'public',
    reaction_count: 15,
    comment_count: 3
  },
  {
    id: 'y3',
    user_id: 'u10',
    user: OTHER_USERS[9],
    front_image_url: 'https://picsum.photos/150/200?random=50',
    back_image_url: 'https://picsum.photos/400/600?random=51',
    location_name: 'Sunset Peak',
    caption: 'View from the top.',
    created_at: '2025-12-30T17:45:00+08:00',
    privacy: 'public',
    reaction_count: 45,
    comment_count: 12,
    reactions: MOCK_REACTIONS.slice(0, 5)
  },
  {
    id: 'y4',
    user_id: 'u11',
    user: OTHER_USERS[9],
    front_image_url: 'https://picsum.photos/150/200?random=52',
    back_image_url: 'https://picsum.photos/400/600?random=53',
    location_name: 'Boxing Ring',
    caption: 'Hard work pays off.',
    created_at: '2025-12-30T19:20:00+08:00',
    privacy: 'private',
    reaction_count: 2,
    comment_count: 0
  },
  {
    id: 'y5',
    user_id: 'u2',
    user: OTHER_USERS[0],
    front_image_url: 'https://picsum.photos/150/200?random=54',
    back_image_url: 'https://picsum.photos/400/600?random=55',
    location_name: 'Local Skatepark',
    music_track: 'Sk8er Boi - Avril Lavigne',
    caption: 'New trick learned! 🛹',
    created_at: '2025-12-30T15:00:00+08:00',
    privacy: 'public',
    reaction_count: 31,
    comment_count: 10,
    reactions: MOCK_REACTIONS.slice(2, 6)
  },
  {
    id: 'y6',
    user_id: 'u3',
    user: OTHER_USERS[1],
    front_image_url: 'https://picsum.photos/150/200?random=56',
    back_image_url: 'https://picsum.photos/400/600?random=57',
    location_name: 'Home Office',
    caption: 'Coding all night.',
    created_at: '2025-12-30T23:30:00+08:00',
    privacy: 'public',
    reaction_count: 1,
    comment_count: 0
  },

  // --- PAST LORE ---
  {
    id: 'p1',
    user_id: 'u4',
    user: OTHER_USERS[3],
    front_image_url: 'https://picsum.photos/150/200?random=70',
    back_image_url: 'https://picsum.photos/400/600?random=71',
    location_name: 'High Rocks',
    caption: 'First climb of the month.',
    created_at: '2025-12-28T09:00:00+08:00',
    privacy: 'public',
    reaction_count: 10,
    comment_count: 1
  },
  {
    id: 'p2',
    user_id: 'u5',
    user: OTHER_USERS[4],
    front_image_url: 'https://picsum.photos/150/200?random=72',
    back_image_url: 'https://picsum.photos/400/600?random=73',
    location_name: 'Beach Resort',
    caption: 'Sand and salt.',
    created_at: '2025-12-28T11:30:00+08:00',
    privacy: 'public',
    reaction_count: 18,
    comment_count: 4,
    reactions: [MOCK_REACTIONS[0], MOCK_REACTIONS[4]]
  },
  {
    id: 'p3',
    user_id: 'u6',
    user: OTHER_USERS[5],
    front_image_url: 'https://picsum.photos/150/200?random=74',
    back_image_url: 'https://picsum.photos/400/600?random=75',
    location_name: 'Art Studio',
    caption: 'Work in progress.',
    created_at: '2025-12-27T14:00:00+08:00',
    privacy: 'public',
    reaction_count: 5,
    comment_count: 1
  },
  {
    id: 'p4',
    user_id: 'u7',
    user: OTHER_USERS[6],
    front_image_url: 'https://picsum.photos/150/200?random=76',
    back_image_url: 'https://picsum.photos/400/600?random=77',
    location_name: 'Night Market',
    music_track: 'Nightcall - Kavinsky',
    caption: 'Late night snacks.',
    created_at: '2025-12-27T22:00:00+08:00',
    privacy: 'public',
    reaction_count: 14,
    comment_count: 2
  },
  {
    id: 'p5',
    user_id: 'u8',
    user: OTHER_USERS[7],
    front_image_url: 'https://picsum.photos/150/200?random=78',
    back_image_url: 'https://picsum.photos/400/600?random=79',
    location_name: 'Football Field',
    caption: 'Match day!',
    created_at: '2025-12-26T15:30:00+08:00',
    privacy: 'public',
    reaction_count: 28,
    comment_count: 6,
    reactions: MOCK_REACTIONS.slice(0, 3)
  },
  {
    id: 'p6',
    user_id: 'u9',
    user: OTHER_USERS[8],
    front_image_url: 'https://picsum.photos/150/200?random=80',
    back_image_url: 'https://picsum.photos/400/600?random=81',
    location_name: 'Library',
    caption: 'Finals week.',
    created_at: '2025-12-26T11:00:00+08:00',
    privacy: 'private',
    reaction_count: 0,
    comment_count: 0
  }
];

export const MOCK_QUESTS: Quest[] = [
  {
    id: 'q1',
    host_id: 'u4',
    host: {
      id: 'u4',
      username: 'dave_climbs',
      name: 'Dave Miller',
      avatar_url: 'https://picsum.photos/100/100?random=8',
      streak_count: 12,
      bio: 'Climb higher.',
    },
    type: QuestType.CASUAL,
    category: 'Adventures',
    title: 'Sunset Bouldering Session',
    description: 'Heading to the crag for a chill session. Beginners welcome! Bring your own shoes if you have them.',
    start_time: 'Today, 6:00 PM',
    max_participants: 5,
    current_participants: 2,
    status: QuestStatus.OPEN,
    fee: 0,
    is_public: true,
    activity: 'Bouldering'
  },
  {
    id: 'q2',
    host_id: 'u5',
    host: {
      id: 'u5',
      username: 'pickle_king',
      name: 'Roger F.',
      avatar_url: 'https://picsum.photos/100/100?random=9',
      streak_count: 110,
      bio: 'Pickleball is life.',
    },
    type: QuestType.COMPETITION,
    category: 'Sports',
    title: '2v2 Pickleball Tournament',
    description: 'Serious players only. Winner takes the pot. $10 entry per person.',
    start_time: 'Tomorrow, 10:00 AM',
    max_participants: 8,
    current_participants: 7,
    status: QuestStatus.OPEN,
    fee: 10,
    is_public: true,
    activity: 'Pickleball'
  },
  {
    id: 'q3',
    host_id: 'u6',
    host: {
      id: 'u6',
      username: 'art_anna',
      name: 'Anna K.',
      avatar_url: 'https://picsum.photos/100/100?random=10',
      streak_count: 3,
      bio: 'Painting the town.',
    },
    type: QuestType.CASUAL,
    category: 'Social',
    title: 'Midnight Gallery Hop',
    description: 'Checking out the new exhibit at the Modern.',
    start_time: 'Tonight, 9:00 PM',
    max_participants: 10,
    current_participants: 10,
    status: QuestStatus.FULL,
    fee: 0,
    is_public: true,
    activity: 'Art'
  },
];

export const MOCK_MESSAGES: Message[] = [
  { id: 'm1', sender_id: 'u2', content: 'Yo, that skate sesh looked sick!', timestamp: '10:05 AM', is_me: false },
  { id: 'm2', sender_id: 'u1', content: 'Yeah it was awesome! You should come next time.', timestamp: '10:06 AM', is_me: true },
  { id: 'm3', sender_id: 'u2', content: 'Definitely down. When are you going again?', timestamp: '10:07 AM', is_me: false },
];

export const POSITIVE_QUOTES = [
  "live. LIVE",
  "love life",
  "hold it",
  "always choose life",
  "life over matters",
  "the world is yours",
  "less screen time",
  "min screen time, max life time",
  "always be for life",
  "side quest for life"
];

import { Competition } from './types';

export const MOCK_COMPETITIONS: Competition[] = [
  {
    id: 'comp1',
    title: 'Davao Open Pickleball',
    category: 'Sports',
    sub_category: 'Pickleball',
    date_range: 'Oct 24-26',
    location: 'SuperSmasher',
    prize_pool: '₱50,000',
    status: 'registration_open',
    image_url: 'https://images.unsplash.com/photo-1626245550578-8ae7f6368d49?auto=format&fit=crop&q=80&w=600',
    description: 'The biggest pickleball event in the city.',
    organizer: 'Davao Pickleball Club'
  },
  {
    id: 'comp2',
    title: 'Kadayawan Basketball League',
    category: 'Sports',
    sub_category: 'Basketball',
    date_range: 'Nov 1-15',
    location: 'Almendras Gym',
    prize_pool: '₱100,000',
    status: 'ongoing',
    image_url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&q=80&w=600',
    description: 'City-wide collegiate basketball showdown.',
    organizer: 'City Sports Office'
  },
  {
    id: 'comp3',
    title: 'Mt. Apo Boulder Challenge',
    category: 'Adventures',
    sub_category: 'Skyrunning',
    date_range: 'Dec 10-12',
    location: 'Sta. Cruz, Davao del Sur',
    prize_pool: '₱75,000',
    status: 'upcoming',
    image_url: 'https://images.unsplash.com/photo-1516214104703-d870798883c5?auto=format&fit=crop&q=80&w=600',
    description: 'Race to the peak of the highest mountain in the Philippines.',
    organizer: 'Dept of Tourism'
  },
  {
    id: 'comp4',
    title: 'Code in the Dark',
    category: 'Others',
    sub_category: 'Coding',
    date_range: 'Oct 30',
    location: 'Devcon Davao',
    prize_pool: '₱20,000',
    status: 'registration_open',
    image_url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=600',
    description: 'Front-end development competition. No previews allowed.',
    organizer: 'Davao JS'
  },
  {
    id: 'comp5',
    title: 'Barista Throwdown',
    category: 'Social',
    sub_category: 'Coffee',
    date_range: 'Nov 5',
    location: 'Coffee & Woods',
    prize_pool: '₱15,000',
    status: 'upcoming',
    image_url: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&q=80&w=600',
    description: 'Latte art battle for the best pourers in town.',
    organizer: 'Davao Coffee Guild'
  },
  {
    id: 'comp6',
    title: 'Ironman 70.3 Training Camp',
    category: 'Train',
    sub_category: 'Triathlon',
    date_range: 'Jan 15-20',
    location: 'Azuela Cove',
    prize_pool: 'Merch',
    status: 'registration_open',
    image_url: 'https://images.unsplash.com/photo-1559599076-9c61d8e1b77c?auto=format&fit=crop&q=80&w=600',
    description: 'Official training camp for the upcoming Ironman 70.3.',
    organizer: 'Sunrise Events'
  },
  {
    id: 'comp7',
    title: 'Cosplay Clash',
    category: 'Social',
    sub_category: 'Cosplay',
    date_range: 'Oct 31',
    location: 'SM Lanang',
    prize_pool: '₱30,000',
    status: 'upcoming',
    image_url: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?auto=format&fit=crop&q=80&w=600',
    description: 'Halloween costume competition.',
    organizer: 'Ambox'
  },
  {
    id: 'comp8',
    title: 'Crossfit Throwdown',
    category: 'Train',
    sub_category: 'Crossfit',
    date_range: 'Nov 20',
    location: 'Crossfit Madayaw',
    prize_pool: '₱10,000',
    status: 'ongoing',
    image_url: 'https://images.unsplash.com/photo-1517963879466-cd11fa952643?auto=format&fit=crop&q=80&w=600',
    description: 'Inter-box competition.',
    organizer: 'CFM'
  }
];
