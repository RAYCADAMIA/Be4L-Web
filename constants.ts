
import { User, Capture, Quest, QuestStatus, QuestType, EchoMessage, Reaction, QuestVisibilityScope, EchoType, Competition } from './types';

import { dailyService } from './services/dailyService';

const currentWindow = dailyService.getWindowId(new Date());
const prevWindow = (parseInt(currentWindow) - 1).toString();

export const COLORS = {
  PRIMARY: '#2DD4BF',
  BLACK: '#000000',
  SURFACE: '#1A1A1A',
  CARD: '#121212',
  WHITE: '#FFFFFF',
};

export const UNIVERSAL_CATEGORIES = ['All', 'Sports', 'Socials', 'Adventure', 'Travel', 'Train', 'Jobs', 'Others'];

// PRE-LAUNCH CONFIG
export const ALPHA_EVENT_ID = '0b6b0b6b-0b6b-0b6b-0b6b-0b6b0b6b0b6b'; // Replace with actual Event ID from Supabase

// Helper to generate aura
const mockAura = (score: number, trend: number) => ({
  score,
  trend,
  last_updated_at: new Date().toISOString()
});

export const MOCK_USER: User = {
  id: 'u1',
  handle: 'Badsiro',
  username: 'Badsiro',
  name: 'Badsiro',
  mobile: '09123456789',
  email: 'badsiro@example.com',
  avatar_url: 'https://picsum.photos/100/100?random=1',
  streak_count: 5,
  last_posted_date: new Date().toISOString(),
  last_window_id: prevWindow, // Perfect chain ready
  quest_count: 12,
  followers_count: 90,
  following_count: 150,
  bio: 'Chasing sunsets and side quests.',

  // STRICT SPECS
  aura: mockAura(2450, 102),
  reliability_score: 2450,
  level: 15,
  life_exp: 12500,
  life_streak: 5,
  cover_url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2070&auto=format&fit=crop',
  aura_history: [
    { id: 'ath1', amount: 50, reason: 'Quest Completed: Buda Run', source: 'QUEST_COMPLETE', created_at: new Date(Date.now() - 86400000).toISOString() },
    { id: 'ath2', amount: 20, reason: 'Positive Review from sarah_j', source: 'USER_REVIEW', created_at: new Date(Date.now() - 172800000).toISOString() },
    { id: 'ath3', amount: -15, reason: 'Late Arrival for Matcha Run', source: 'SYSTEM', created_at: new Date(Date.now() - 259200000).toISOString() }
  ]
};

export const MOCK_OPERATOR: User = {
  ...MOCK_USER,
  id: 'op1',
  handle: 'Skyline_Venue',
  username: 'Skyline Events',
  name: 'Skyline Events',
  is_operator: true,
  bio: 'The premier event space in Davao.',
  avatar_url: 'https://ui-avatars.com/api/?name=Skyline+Events&background=2DD4BF&color=000'
};

export const MOCK_ADMIN: User = {
  ...MOCK_USER,
  id: 'admin1',
  handle: 'System_Admin',
  username: 'SysAdmin',
  name: 'System Administrator',
  is_admin: true,
  bio: 'System Overseer.',
  avatar_url: 'https://ui-avatars.com/api/?name=Sys+Admin&background=000&color=2DD4BF'
};

export const OTHER_USERS: User[] = [
  { id: 'u2', handle: 'sarah_j', username: 'sarah_j', name: 'Sarah Jenkins', avatar_url: 'https://picsum.photos/100/100?random=2', streak_count: 105, last_window_id: currentWindow, bio: 'Always moving. Marathoner. Coffee enthusiast. Davao-based explorer.', aura: mockAura(3200, 150), reliability_score: 3200, life_exp: 18000, level: 22, life_streak: 45, followers_count: 500, following_count: 200, cover_url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=2074&auto=format&fit=crop', aura_history: [{ id: 'h1', amount: 100, reason: 'Marathon Finisher', source: 'QUEST_COMPLETE', created_at: new Date().toISOString() }] },
  { id: 'u3', handle: 'mike_runs', username: 'mike_runs', name: 'Mike Ross', avatar_url: 'https://picsum.photos/100/100?random=5', streak_count: 5, last_window_id: prevWindow, bio: 'Marathon training & recovery. Just here for the vibes.', aura: mockAura(1100, -25), reliability_score: 1100, life_exp: 4200, level: 8, life_streak: 5, followers_count: 120, following_count: 80, cover_url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2071&auto=format&fit=crop', aura_history: [] },
  { id: 'u4', handle: 'dave_climbs', username: 'dave_climbs', name: 'Dave Miller', avatar_url: 'https://picsum.photos/100/100?random=8', streak_count: 12, last_window_id: currentWindow, bio: 'Climb higher. Adventure is out there.', aura: mockAura(1850, 42), reliability_score: 1850, life_exp: 9500, level: 12, life_streak: 12, followers_count: 300, following_count: 150, cover_url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070&auto=format&fit=crop', aura_history: [] },
  { id: 'u5', handle: 'pickle_king', username: 'pickle_king', name: 'Roger F.', avatar_url: 'https://picsum.photos/100/100?random=9', streak_count: 110, last_window_id: currentWindow, bio: 'Pickleball is life. Professional dinker. Join me at SuperSmasher!', aura: mockAura(4500, 205), reliability_score: 4500, life_exp: 25000, level: 30, life_streak: 110, followers_count: 1500, following_count: 300, cover_url: 'https://images.unsplash.com/photo-1541746972996-4e0b0f43e02a?q=80&w=2070&auto=format&fit=crop', aura_history: [] },
  { id: 'u10', handle: 'ethan_hunt', username: 'ethan_hunt', name: 'Ethan Hunt', avatar_url: 'https://picsum.photos/100/100?random=14', streak_count: 50, bio: 'Mission: Possible. Davao City. Adventure seeker.', aura: mockAura(5200, 310), reliability_score: 5200, life_exp: 35000, level: 42, life_streak: 50, followers_count: 2500, following_count: 10, cover_url: 'https://images.unsplash.com/photo-1516214104703-d870798883c5?auto=format&fit=crop&q=80&w=200', aura_history: [] },
];


const MOCK_REACTIONS: Reaction[] = [
  { id: 'r1', user_id: 'u2', user: OTHER_USERS[0], image_url: 'https://picsum.photos/100/100?random=20', timestamp: '2m', reaction_type: 'fire', reacted_at: new Date().toISOString() },
  { id: 'r2', user_id: 'u3', user: OTHER_USERS[1], image_url: 'https://picsum.photos/100/100?random=21', timestamp: '5m', reaction_type: 'heart', reacted_at: new Date().toISOString() },
  { id: 'r3', user_id: 'u4', user: OTHER_USERS[2], image_url: 'https://picsum.photos/100/100?random=22', timestamp: '10m', reaction_type: 'muscle', reacted_at: new Date().toISOString() },
  { id: 'r4', user_id: 'u1', user: MOCK_USER, image_url: 'https://picsum.photos/100/100?random=23', timestamp: '15m', reaction_type: 'fire', reacted_at: new Date().toISOString() },
  { id: 'r5', user_id: 'u5', user: OTHER_USERS[3], image_url: 'https://picsum.photos/100/100?random=24', timestamp: '20m', reaction_type: 'cool', reacted_at: new Date().toISOString() },
  { id: 'r6', user_id: 'u6', user: OTHER_USERS[4], image_url: 'https://picsum.photos/100/100?random=25', timestamp: '30m', reaction_type: 'shock', reacted_at: new Date().toISOString() },
];

export const MOCK_CAPTURES: Capture[] = [
  // --- TODAY'S LORE ---
  {
    id: 't1',
    user_id: 'u2',
    user: OTHER_USERS[0],
    media_type: 'image',
    front_media_url: 'https://picsum.photos/150/200?random=3',
    back_media_url: 'https://picsum.photos/400/600?random=4',
    front_image_url: 'https://picsum.photos/150/200?random=3',
    back_image_url: 'https://picsum.photos/400/600?random=4',
    location: { lat: 0, lng: 0, place_name: 'City Square' },
    location_name: 'City Square',
    caption: 'Just dropped! ⚡',
    created_at: '2025-12-31T12:47:05+08:00',
    captured_at: '2025-12-31T12:47:05+08:00',
    visibility: 'public',
    state: 'active',
    reaction_count: 3,
    comment_count: 0,
    reactions: MOCK_REACTIONS.slice(0, 3)
  },
  {
    id: 't2',
    user_id: 'u3',
    user: OTHER_USERS[1],
    media_type: 'image',
    front_media_url: 'https://picsum.photos/150/200?random=6',
    back_media_url: 'https://picsum.photos/400/600?random=7',
    front_image_url: 'https://picsum.photos/150/200?random=6',
    back_image_url: 'https://picsum.photos/400/600?random=7',
    location: { lat: 0, lng: 0, place_name: 'Coffee Loft' },
    location_name: 'Coffee Loft',
    music_context: { track_name: 'Espresso', artist: 'Sabrina Carpenter' },
    music_track: 'Espresso - Sabrina Carpenter',
    caption: 'Beaut day for a brew.',
    created_at: '2025-12-31T12:47:30+08:00',
    captured_at: '2025-12-31T12:47:30+08:00',
    visibility: 'public',
    state: 'active',
    reaction_count: 12,
    comment_count: 5,
    reactions: MOCK_REACTIONS.slice(1, 5)
  },
  {
    id: 't3',
    user_id: 'u5',
    user: OTHER_USERS[4],
    media_type: 'image',
    front_media_url: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=200',
    back_media_url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&q=80&w=200',
    front_image_url: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=200',
    back_image_url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&q=80&w=200',
    location: { lat: 0, lng: 0, place_name: 'SuperSmasher Pickleball' },
    location_name: 'SuperSmasher Pickleball',
    caption: 'Pickleball finals! 🎾',
    created_at: '2025-12-31T13:15:00+08:00',
    captured_at: '2025-12-31T13:15:00+08:00',
    visibility: 'public',
    state: 'active',
    reaction_count: 4,
    comment_count: 2,
    reactions: [MOCK_REACTIONS[0], MOCK_REACTIONS[2]]
  },
  {
    id: 't4',
    user_id: 'u6',
    user: OTHER_USERS[5],
    media_type: 'image',
    front_media_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=200',
    back_media_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=200',
    front_image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=200',
    back_image_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=200',
    location: { lat: 0, lng: 0, place_name: 'Quinspot Fitness' },
    location_name: 'Quinspot Fitness',
    caption: 'Quinspot morning grind.',
    created_at: '2025-12-31T13:45:00+08:00',
    captured_at: '2025-12-31T13:45:00+08:00',
    visibility: 'private',
    state: 'active',
    reaction_count: 0,
    comment_count: 0
  },
  {
    id: 't5',
    user_id: 'u7',
    user: OTHER_USERS[6],
    media_type: 'image',
    front_media_url: 'https://picsum.photos/150/200?random=64',
    back_media_url: 'https://picsum.photos/400/600?random=65',
    front_image_url: 'https://picsum.photos/150/200?random=64',
    back_image_url: 'https://picsum.photos/400/600?random=65',
    location: { lat: 0, lng: 0, place_name: 'Cloud29 Rooftop' },
    location_name: 'Cloud29 Rooftop',
    music_context: { track_name: 'Sky Full of Stars', artist: 'Coldplay' },
    music_track: 'Sky Full of Stars - Coldplay',
    caption: 'Watching the city wake up.',
    created_at: '2025-12-31T14:10:00+08:00',
    captured_at: '2025-12-31T14:10:00+08:00',
    visibility: 'public',
    state: 'active',
    reaction_count: 22,
    comment_count: 8,
    reactions: MOCK_REACTIONS.slice(0, 4)
  },
  {
    id: 't6',
    user_id: 'u8',
    user: OTHER_USERS[7],
    media_type: 'image',
    front_media_url: 'https://picsum.photos/150/200?random=66',
    back_media_url: 'https://picsum.photos/400/600?random=67',
    front_image_url: 'https://picsum.photos/150/200?random=66',
    back_image_url: 'https://picsum.photos/400/600?random=67',
    location: { lat: 0, lng: 0, place_name: 'Azuela Cove' },
    location_name: 'Azuela Cove',
    caption: 'Post-run vibes at Azuela.',
    created_at: '2025-12-31T14:30:00+08:00',
    captured_at: '2025-12-31T14:30:00+08:00',
    visibility: 'public',
    state: 'active',
    reaction_count: 0,
    comment_count: 0
  },

  // --- PAST LORE ---
  {
    id: 'p1',
    user_id: 'u4',
    user: OTHER_USERS[3],
    media_type: 'image',
    front_media_url: 'https://picsum.photos/150/200?random=70',
    back_media_url: 'https://picsum.photos/400/600?random=71',
    front_image_url: 'https://picsum.photos/150/200?random=70',
    back_image_url: 'https://picsum.photos/400/600?random=71',
    location: { lat: 0, lng: 0, place_name: 'Coloseo Streetball' },
    location_name: 'Coloseo Streetball',
    caption: 'Sunday pickup games.',
    created_at: '2025-12-28T09:00:00+08:00',
    captured_at: '2025-12-28T09:00:00+08:00',
    visibility: 'public',
    state: 'active',
    reaction_count: 10,
    comment_count: 1
  }
];

// Helper for Quests
const mockLocation = (name: string) => ({ lat: 0, lng: 0, place_name: name, address_full: 'Davao City' });

export const MOCK_QUESTS: Quest[] = [
  {
    id: 'q1',
    host_id: 'u4',
    host: OTHER_USERS[2],
    mode: QuestType.CANON,
    source: 'USER_CREATED',
    category: 'Sports',
    title: 'Davao Pickleball Open',
    description: 'Competitive pickleball matches at SuperSmasher. All skill levels welcome!',
    start_time: 'Today, 5:00 PM',
    max_participants: 8,
    current_participants: 4,
    status: QuestStatus.DISCOVERABLE,
    visibility_scope: QuestVisibilityScope.PUBLIC,
    join_mode: 'OPEN_ACTIVE',
    approval_required: false,
    fee: 0,
    is_public: true,
    activity: 'Pickleball',
    aura_reward: 50,
    exp_reward: 200,
    participants: [OTHER_USERS[2], OTHER_USERS[0], OTHER_USERS[1], OTHER_USERS[3]],
    participant_ids: ['u4', 'u2', 'u2', 'u4'], // Mock IDs
    location: mockLocation('SuperSmasher Pickleball')
  },
  {
    id: 'q2',
    host_id: 'u5',
    host: OTHER_USERS[4],
    mode: QuestType.CANON,
    source: 'USER_CREATED',
    category: 'Sports',
    title: 'Ballbreakers Invite',
    description: 'High-stakes basketball run at Homecourt. Only real ones.',
    start_time: 'Tomorrow, 6:00 PM',
    max_participants: 10,
    current_participants: 6,
    status: QuestStatus.DISCOVERABLE,
    visibility_scope: QuestVisibilityScope.PUBLIC,
    join_mode: 'LOCKED',
    approval_required: true,
    fee: 50,
    is_public: true,
    activity: 'Basketball',
    aura_reward: 80,
    exp_reward: 400,
    participants: [OTHER_USERS[4], OTHER_USERS[7]],
    participant_ids: ['u5', 'u8'],
    location: mockLocation('Homecourt Davao')
  },
  {
    id: 'q3',
    host_id: 'u6',
    host: OTHER_USERS[5],
    mode: QuestType.CANON,
    source: 'USER_CREATED',
    category: 'Social',
    title: 'Matcha Run @ Obrero',
    description: 'Escaping boredom with a matcha run in Obrero. Casual vibes.',
    start_time: 'Today, 3:00 PM',
    max_participants: 12,
    current_participants: 6,
    status: QuestStatus.DISCOVERABLE,
    visibility_scope: QuestVisibilityScope.PUBLIC,
    join_mode: 'OPEN_ACTIVE',
    approval_required: false,
    fee: 0,
    is_public: true,
    activity: 'Social',
    aura_reward: 30,
    exp_reward: 150,
    participants: [OTHER_USERS[5], OTHER_USERS[8], OTHER_USERS[9]],
    participant_ids: ['u6', 'u9', 'u10'],
    location: mockLocation('The Matcha Spot')
  }
];

export const MOCK_MESSAGES: EchoMessage[] = [
  { id: 'm1', echo_id: 'e1', sender_id: 'u2', content: 'Yo, that Buda run looked sick!', created_at: '10:05 AM', is_me: false, content_type: 'text' },
  { id: 'm2', echo_id: 'e1', sender_id: 'u1', content: 'Yeah it was awesome! You should come next time.', created_at: '10:06 AM', is_me: true, content_type: 'text' },
  { id: 'm3', echo_id: 'e1', sender_id: 'u2', content: 'Definitely down. When are you going again?', created_at: '10:07 AM', is_me: false, content_type: 'text' },
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
    title: 'Buda Endurance Trail',
    category: 'Adventures',
    sub_category: 'Trail Running',
    date_range: 'Dec 10-12',
    location: 'Buda, Davao del Sur',
    prize_pool: '₱75,000',
    status: 'upcoming',
    image_url: 'https://images.unsplash.com/photo-1516214104703-d870798883c5?auto=format&fit=crop&q=80&w=600',
    description: 'Survival run through the foggy trails of Buda.',
    organizer: 'Budda Adventures'
  },
  {
    id: 'comp4',
    title: 'Coastline Dash',
    category: 'Sports',
    sub_category: 'Running',
    date_range: 'Oct 30',
    location: 'Davao Coastal Road',
    prize_pool: '₱20,000',
    status: 'registration_open',
    image_url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=600',
    description: 'Night run along the scenic coastal road.',
    organizer: 'Davao Runners'
  },
  {
    id: 'comp5',
    title: 'Barista Throwdown',
    category: 'Social',
    sub_category: 'Coffee',
    date_range: 'Nov 5',
    location: 'Steep Coffee - Obrero',
    prize_pool: '₱15,000',
    status: 'upcoming',
    image_url: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&q=80&w=600',
    description: 'Latte art battle for the best pourers in town.',
    organizer: 'Davao Coffee Guild'
  },
  {
    id: 'comp6',
    title: 'Ironman 70.3 Azuela Prep',
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
    location: 'Metro Fitness',
    prize_pool: '₱10,000',
    status: 'ongoing',
    image_url: 'https://images.unsplash.com/photo-1517963879466-cd11fa952643?auto=format&fit=crop&q=80&w=600',
    description: 'Inter-box competition.',
    organizer: 'CFM'
  }
];

// MOCK PARTNER POSTS
export const MOCK_PARTNER_POSTS: import('./types').PartnerPost[] = [
  {
    id: 'pp1',
    operator_id: 'op1', // Skyline Events
    operator: {
      ...MOCK_OPERATOR,
    } as any,
    caption: 'Big weekend ahead! 🏀 The Ballbreakers Invitational starts tomorrow. Who you got? #DavaoHoops #SkylineEvents',
    media_urls: ['https://images.unsplash.com/photo-1546519638-68e109498ffc', 'https://images.unsplash.com/photo-1504450758481-7338eba7524a'],
    likes_count: 142,
    comments_count: 24,
    created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
  },
  {
    id: 'pp2',
    operator_id: 'op1',
    operator: { ...MOCK_OPERATOR } as any,
    caption: 'New VIP lounge is open! 🥂 Book your private space now.',
    media_urls: ['https://images.unsplash.com/photo-1561002417-195a3b7d1884'],
    tagged_item_id: 'item_vip', // Mock ID
    tagged_item: {
      id: 'item_vip',
      operator_id: 'op1',
      title: 'VIP Lounge Access',
      price: 2500,
      image_url: 'https://images.unsplash.com/photo-1561002417-195a3b7d1884',
      category: 'event',
      description: 'Exclusive access',
      available_slots: 5,
      total_slots: 10,
      is_active: true
    },
    likes_count: 89,
    comments_count: 5,
    created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
  }
];

// MOCK PLACES (For Discovery)
export const MOCK_PLACES: any[] = [
  {
    ...MOCK_OPERATOR,
    id: 'op1',
    items: [
      { id: 'i1', operator_id: 'op1', title: 'Private Court Rental', price: 1500, category: 'Venue', image_url: 'https://images.unsplash.com/photo-1541746972996-4e0b0f43e02a', unit_label: 'hour', type: 'PLACE', available_slots: 5 },
      { id: 'i2', operator_id: 'op1', title: 'Pickleball Pro Coaching', price: 2500, category: 'Service', image_url: 'https://images.unsplash.com/photo-1626245550578-8ae7f6368d49', unit_label: 'session', type: 'PLACE', available_slots: 2 }
    ]
  },
  {
    id: 'op2',
    user_id: 'op2',
    business_name: 'Davao Coffee Guild',
    logo_url: 'https://images.unsplash.com/photo-1511920170033-f8396924c348',
    category: 'Cafe',
    items: [
      { id: 'i3', operator_id: 'op2', title: 'Barista Workshop', price: 500, category: 'Event', image_url: 'https://images.unsplash.com/photo-1511920170033-f8396924c348', unit_label: 'pax', type: 'EVENT', event_date: new Date(Date.now() + 86400000).toISOString(), available_slots: 10 }
    ]
  },
  {
    id: 'op3',
    user_id: 'op3',
    business_name: 'SuperSmasher',
    logo_url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc',
    category: 'Sports',
    items: [
      { id: 'i4', operator_id: 'op3', title: 'Night League Registration', price: 3000, category: 'Competition', image_url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc', unit_label: 'team', type: 'EVENT', available_slots: 8 }
    ]
  }
];

export const MOCK_AURA_TRANSACTIONS: any[] = [
  { id: '1', amount: 30, reason: 'Quest Completed: Morning Run', source: 'QUEST_COMPLETE', created_at: '2024-03-20T10:00:00Z' },
  { id: '2', amount: 15, reason: 'Great Communication', source: 'USER_REVIEW', created_at: '2024-03-19T15:30:00Z' },
  { id: '3', amount: -10, reason: 'Late Arrival', source: 'SYSTEM', created_at: '2024-03-18T09:00:00Z' }
];
