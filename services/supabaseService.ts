
import { supabase } from '../utils/supabaseClient';
import { User, Capture, Quest, Message, QuestStatus, QuestType, QuestParticipantStatus, QuestVisibilityScope } from '../types';
import { dailyService } from './dailyService';
import { MOCK_USER, MOCK_ADMIN, MOCK_OPERATOR, MOCK_CAPTURES, MOCK_QUESTS, OTHER_USERS, POSITIVE_QUOTES } from '../constants';

const isValidUUID = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

const computeDisplayStreak = (profile: any): number => {
  if (!profile.last_window_id) return 0;
  const currentWindowId = parseInt(dailyService.getWindowId(new Date()));
  const lastWindowId = parseInt(profile.last_window_id);
  if (currentWindowId - lastWindowId > 1) return 0;
  return profile.streak_count || 0;
};

const syncStreak = async (profile: any): Promise<any> => {
  if (!profile) return profile;
  const displayValue = computeDisplayStreak(profile);
  const dbStreak = profile.streak_count || 0;
  if (dbStreak > 0 && displayValue === 0) {
    if (isValidUUID(profile.id)) {
      try {
        const { data: updated } = await supabase
          .from('profiles')
          .update({ streak_count: 0, life_streak: 0, last_window_id: null })
          .eq('id', profile.id)
          .select().single();
        if (updated) return updated;
      } catch (e) {
        console.error("Streak sync failed", e);
      }
    }
    return { ...profile, streak_count: 0, life_streak: 0 };
  }
  return profile;
};

const awardQuestRewardsImpl = async (userId: string, auraAmount: number, expAmount: number): Promise<boolean> => {
  try {
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (!profile) return false;
    let newExp = (profile.life_exp || 0) + expAmount;
    let newLevel = profile.level || 1;
    while (newExp >= newLevel * 1000) { newLevel += 1; }
    const newAuraScore = (profile.aura_points || 0) + auraAmount;
    const { error } = await supabase.from('profiles').update({ life_exp: newExp, level: newLevel, aura_points: newAuraScore }).eq('id', userId);
    return !error;
  } catch (e) { return false; }
};

export const MOCK_CHATS = [
  { id: 'u2', type: 'personal', name: 'Sarah Cameron', lastMsg: 'See you at the Wreck?', time: '10:30 AM', unread: 2, avatar: OTHER_USERS[0].avatar_url },
  { id: 'u3', type: 'personal', name: 'John B. Routledge', lastMsg: 'I found something in the marsh.', time: '9:45 AM', unread: 0, avatar: OTHER_USERS[1].avatar_url },
  { id: 'u4', type: 'personal', name: 'JJ Maybank', lastMsg: 'Bad idea? Probably.', time: 'Yesterday', unread: 0, avatar: OTHER_USERS[2].avatar_url },
  { id: '4', type: 'group', name: 'The Pogues', lastMsg: 'Pope: We need a plan.', time: 'Yesterday', unread: 12, avatar: 'https://tse2.mm.bing.net/th?q=Outer%20Banks%20Cast%20Group&w=500&h=500&c=7' },
  { id: 'u5', type: 'personal', name: 'Kiara Carrera', lastMsg: 'Save the turtles! 🐢', time: 'Monday', unread: 0, avatar: OTHER_USERS[3].avatar_url },
  { id: 'u6', type: 'personal', name: 'Pope Heyward', lastMsg: 'Statistically speaking...', time: 'Monday', unread: 0, avatar: OTHER_USERS[4].avatar_url },
  { id: 'lobby_q1', type: 'lobby', context_type: 'QUEST', name: 'Treasure Hunt', lastMsg: 'John B: X marks the spot.', time: '9:15 AM', unread: 5, avatar: 'https://tse2.mm.bing.net/th?q=Outer%20Banks%20Map&w=500&h=500&c=7' },
  { id: 'lobby_q2', type: 'lobby', context_type: 'QUEST', name: 'Midsummer Party', lastMsg: 'Rafe: Who invited them?', time: 'Live', unread: 0, avatar: 'https://tse2.mm.bing.net/th?q=Outer%20Banks%20Party&w=500&h=500&c=7' },
  { id: 'lobby_q3', type: 'lobby', context_type: 'QUEST', name: 'Surf Competition', lastMsg: 'JJ: I am gonna win this.', time: '2:30 PM', unread: 1, avatar: 'https://tse2.mm.bing.net/th?q=Outer%20Banks%20Surfing&w=500&h=500&c=7' },
  { id: 'u7', type: 'personal', name: 'Rafe Cameron', lastMsg: 'Stay out of my way.', time: '11:20 AM', unread: 0, avatar: OTHER_USERS[5].avatar_url },
  { id: 'u8', type: 'personal', name: 'Cleo', lastMsg: 'Watch your back.', time: 'Yesterday', unread: 0, avatar: OTHER_USERS[6].avatar_url },
  { id: 'u9', type: 'personal', name: 'Topper Thornton', lastMsg: 'Have you seen Sarah?', time: 'Sat', unread: 0, avatar: OTHER_USERS[7].avatar_url },
  { id: 'u10', type: 'personal', name: 'Barry', lastMsg: 'Money first.', time: 'Fri', unread: 0, avatar: OTHER_USERS[8].avatar_url }
];

// Helper for local persistence in mock mode
const loadFromStorage = (key: string, defaultValue: any) => {
  if (typeof window === 'undefined') return defaultValue;
  const saved = localStorage.getItem(key);
  try {
    return saved ? JSON.parse(saved) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
};

const saveToStorage = (key: string, value: any) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

let localMockMessages: Record<string, Message[]> = loadFromStorage('be4l_local_messages', {
  'u2': [
    { id: 'm1', echo_id: 'u2', sender_id: 'u2', content: 'Hey! Are we going to the Wreck later?', timestamp: '10:25 AM', created_at: '2025-12-31T10:25:00Z', is_me: false, type: 'text', content_type: 'text' },
    { id: 'm2', echo_id: 'u2', sender_id: 'me', content: 'Yeah, I will meet you there.', timestamp: '10:28 AM', created_at: '2025-12-31T10:28:00Z', is_me: true, type: 'text', content_type: 'text' }
  ],
  'u3': [
    { id: 'm3', echo_id: 'u3', sender_id: 'u3', content: 'Did you see the Royal Merchant manifest?', timestamp: '9:40 AM', created_at: '2025-12-31T09:40:00Z', is_me: false, type: 'text', content_type: 'text' },
    { id: 'm4', echo_id: 'u3', sender_id: 'me', content: 'That is insane!!', timestamp: '9:45 AM', created_at: '2025-12-31T09:45:00Z', is_me: true, type: 'text', content_type: 'text' }
  ],
  'lobby_q1': [
    { id: 'm5', echo_id: 'lobby_q1', sender_id: 'u3', content: 'X marks the spot.', timestamp: '9:10 AM', created_at: '2025-12-31T09:10:00Z', is_me: false, type: 'text', content_type: 'text' },
    { id: 'm6', echo_id: 'lobby_q1', sender_id: 'u3', content: 'We need to be careful.', timestamp: '9:12 AM', created_at: '2025-12-31T09:12:00Z', is_me: false, type: 'text', content_type: 'text' },
    { id: 'm7', echo_id: 'lobby_q1', sender_id: 'me', content: 'I am ready.', timestamp: '9:15 AM', created_at: '2025-12-31T09:15:00Z', is_me: true, type: 'text', content_type: 'text' }
  ],
  'u4': [
    { id: 'm8', echo_id: 'u4', sender_id: 'u3', content: 'We need a plan.', timestamp: 'Yesterday', created_at: '2025-12-30T10:00:00Z', is_me: false, type: 'text', content_type: 'text' },
    { id: 'm9', echo_id: 'u4', sender_id: 'u5', content: 'I say we just go for it.', timestamp: 'Yesterday', created_at: '2025-12-30T10:05:00Z', is_me: false, type: 'text', content_type: 'text' }
  ]
});

let localCaptures: Capture[] = loadFromStorage('be4l_local_captures', []);
let localBookings: any[] = loadFromStorage('be4l_local_bookings', []);
let localItems: any[] = loadFromStorage('be4l_local_items', []);

// Cache for social proof logic
const friendsCache: Record<string, string[]> = {};
const friendsRequestCache: Record<string, Promise<string[]>> = {};

// --- STATIC DATA FOR FALLBACKS ---
const STATIC_OPERATORS = [
  { user_id: 'op11', business_name: 'Aero-Lux Aviation', slug: 'aerolux-aviation', category: 'event', cover_photo_url: '/aerolux_aviation_cover_1774608977304.png', logo_url: '/aerolux_aviation_logo_1774609105518.png', bio: 'Premium aerial tours and helicopter charters in Davao. See the city like never before.', location_text: 'Davao City', followers_count: 850, is_verified: true, rating: 5.0 },
  { user_id: 'op12', business_name: 'Lakewood', slug: 'lakewood', category: 'venue', cover_photo_url: '/lakewood_cover_1774608997372.png', logo_url: '/lakewood_logo_1774609122442.png', bio: 'Wakeboard, eat, and vibe. The coolest spot in Deca Mintal.', location_text: 'Deca Mintal, Davao City', followers_count: 2400, is_verified: true, rating: 4.8 },
  { user_id: 'op13', business_name: 'The Fog', slug: 'the-fog', category: 'venue', cover_photo_url: '/the_fog_cafe_cover_1774609019588.png', logo_url: '/the_fog_cafe_logo_1774609142144.png', bio: 'Minimalist coffee experience with a foggy, premium aesthetic.', location_text: 'Davao City', followers_count: 5200, is_verified: true, rating: 4.9 },
  { user_id: 'op14', business_name: 'Paddle & Dive Adventure', slug: 'paddle-dive', category: 'event', cover_photo_url: '/paddle_dive_adventure_cover_1774609043088.png', logo_url: '/paddle_dive_adventure_logo_1774609160383.png', bio: 'Explore the hidden gems of Waniban Island with our paddle and diving gear.', location_text: 'Waniban Island, Mati', followers_count: 1800, is_verified: true, rating: 5.0 },
  { user_id: 'op15', business_name: 'Kabayo Pilipinas', slug: 'kabayo-pilipinas', category: 'venue', cover_photo_url: '/kabayo_pilipinas_cover_1774609065900.png', logo_url: '/kabayo_pilipinas_logo_1774609182515.png', bio: 'Tradition meets adventure. Horseback riding trails with Taal views.', location_text: 'Tagaytay', followers_count: 3200, is_verified: true, rating: 4.7 },
  { user_id: 'op16', business_name: 'Saddie Dream Stables', slug: 'saddie-dream', category: 'venue', cover_photo_url: '/saddie_dream_stables_cover_1774609087944.png', logo_url: '/saddie_dream_stables_logo_1774609200625.png', bio: 'Where horse-riding dreams come true in the hills of Bukidnon.', location_text: 'Damilag, Bukidnon', followers_count: 1100, is_verified: true, rating: 5.0 },
  { user_id: 'op10', business_name: 'Bukidnon Paragliding Experience', slug: 'bukidnon-paragliding', category: 'venue', cover_photo_url: '/bukidnon_paragliding_cover_1774608552455.png', logo_url: '/bukidnon_paragliding_logo_1774608580266.png', bio: 'The best paragliding experience in the heart of Bukidnon. Fly with the clouds.', location_text: 'Valencia City, Bukidnon', followers_count: 1200, is_verified: true, rating: 5.0 },
  { user_id: 'op1', business_name: '&Friends', slug: 'and-friends', category: 'event', cover_photo_url: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=1000', logo_url: '/brands/and_friends.png', bio: 'Bringing together the best music and even better company.', location_text: 'Manila / Davao', followers_count: 5400, is_verified: true, rating: 5.0 },
  { user_id: 'op2', business_name: 'SuperSmasher', slug: 'supersmasher', category: 'venue', cover_photo_url: 'https://images.unsplash.com/photo-1626245550578-8ae7f6368d49?q=80&w=1000', logo_url: '/brands/supersmasher.png', bio: 'Premier Pickleball destination in Davao. Smash your limits.', location_text: 'Lanang, Davao City', followers_count: 2100, is_verified: true, rating: 4.8 },
  { user_id: 'op3', business_name: 'Psyched', slug: 'psyched', category: 'event', cover_photo_url: 'https://images.unsplash.com/photo-1514525253361-bee1a1bb441f?q=80&w=1000', logo_url: '/brands/psyched.png', bio: 'Davao\'s wildest house parties and underground sessions.', location_text: 'Davao City', followers_count: 3200, is_verified: true, rating: 4.9 },
  { user_id: 'op4', business_name: 'Secret Society', slug: 'secretsoc', category: 'event', cover_photo_url: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?q=80&w=1000', logo_url: '/brands/secretsoc.png', bio: 'Exclusive events for the elite. Silence is golden.', location_text: 'Davao City', followers_count: 1560, is_verified: true, rating: 4.7 },
  { user_id: 'op5', business_name: 'Pickletown', slug: 'pickletown', category: 'venue', cover_photo_url: 'https://images.unsplash.com/photo-1599586120429-48281b6f0ece?q=80&w=1000', logo_url: '/brands/pickletown.png', bio: 'Your neighborhood pickleball community. Play, dink, repeat.', location_text: 'Obrero, Davao City', followers_count: 1250, is_verified: true, rating: 4.9 },
  { user_id: 'op6', business_name: 'Homecourt', slug: 'homecourt', category: 'venue', cover_photo_url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1000', logo_url: '/brands/homecourt.png', bio: 'The heart of Davao basketball. Where legends are born.', location_text: 'Torres, Davao City', followers_count: 4500, is_verified: true, rating: 4.8 },
  { user_id: 'op7', business_name: 'Quinspot', slug: 'quinspot', category: 'venue', cover_photo_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000', logo_url: '/brands/quinspot.png', bio: 'Fitness, Billiards, and community. Your daily grind spot.', location_text: 'Bajada, Davao City', followers_count: 2100, is_verified: true, rating: 4.8 },
  { user_id: 'op8', business_name: 'SM Bowling Center', slug: 'sm-bowling', category: 'venue', cover_photo_url: 'https://images.unsplash.com/photo-1538510114873-1d3a41e9c93a?q=80&w=1000', logo_url: '/brands/sm_bowling.png', bio: 'Ultimate leisure destination. Bowling, Archery, and Pool.', location_text: 'SM Lanang, Davao City', followers_count: 8900, is_verified: true, rating: 4.6 },
  { user_id: 'op9', business_name: 'Cloud29', slug: 'cloud29', category: 'event', cover_photo_url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1000', logo_url: 'https://ui-avatars.com/api/?name=Cloud+29&background=6366f1&color=fff', bio: 'High-altitude house parties. Elevate your nightlife experience.', location_text: 'Davao City', followers_count: 4200, is_verified: true, rating: 5.0 },
  { user_id: 'op-samal-freedive', business_name: 'Samal Freedive', slug: 'samal-freedive', category: 'event', cover_photo_url: '/samal_freedive_course.png', logo_url: '/samal_freedive_logo.png', bio: 'Master the depths. Premier freediving school in Samal Island. Learn to breath-hold and explore the blue.', location_text: 'Samal, Davao del Norte', followers_count: 3200, is_verified: true, rating: 5.0 }
];

const STATIC_DIB_ITEMS = [
  { id: 'i13', operator_id: 'op11', title: 'Davao City Aerial Tour', description: 'See Davao City from the sky.', price: 15000, category: 'Adventure', image_url: '/aerolux_aviation_cover_1774608977304.png', unit_label: 'session', type: 'EVENT' },
  { id: 'i14', operator_id: 'op12', title: 'Wakeboard Session', description: '4-hour pass for wakeboarding in Deca Mintal.', price: 500, category: 'Sports', image_url: '/lakewood_cover_1774608997372.png', unit_label: 'pax', type: 'EVENT' },
  { id: 'i15', operator_id: 'op13', title: 'Coffee & Pastry Set', description: 'Signature fog-brew with a croissant.', price: 350, category: 'Cafe', image_url: '/the_fog_cafe_cover_1774609019588.png', unit_label: 'set', type: 'EVENT' },
  { id: 'i16', operator_id: 'op14', title: 'Waniban Day Tour', description: 'Paddle board and snorkeling package.', price: 1500, category: 'Adventure', image_url: '/paddle_dive_adventure_cover_1774609043088.png', unit_label: 'pax', type: 'EVENT' },
  { id: 'i17', operator_id: 'op15', title: 'Taal View Trail Ride', description: '1-hour horseback trail ride with Taal views.', price: 800, category: 'Adventure', image_url: '/kabayo_pilipinas_cover_1774609065900.png', unit_label: 'hour', type: 'EVENT' },
  { id: 'i18', operator_id: 'op16', title: 'Damilag Hills Trail Ride', description: 'Ride through the scenic hills of Damilag.', price: 700, category: 'Adventure', image_url: '/saddie_dream_stables_cover_1774609087944.png', unit_label: 'hour', type: 'EVENT' },
  { id: 'i12', operator_id: 'op10', title: 'Tandem Paragliding Session', description: 'Experience the thrill of flight over Bukidnon. Tandem flight with certified pilots.', price: 3500, category: 'Adventure', image_url: '/bukidnon_paragliding_item_paragliding_session_1774608602080.png', unit_label: 'pax', type: 'EVENT' },
  { id: 'i1', operator_id: 'op1', title: 'Summer EDC Manila', description: 'The ultimate summer electronic dance festival by &Friends.', price: 3750, category: 'Event', image_url: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3', unit_label: 'ticket', type: 'EVENT' },
  { id: 'i2', operator_id: 'op2', title: 'Pickleball Courts', description: 'Reserve a professional pickleball court.', price: 300, category: 'Court', image_url: 'https://images.unsplash.com/photo-1626245550578-8ae7f6368d49', unit_label: 'hour', type: 'PLACE' },
  { id: 'i3', operator_id: 'op3', title: 'Hearts On Fire HP', description: 'Psyched House Party: Hearts On Fire Edition.', price: 500, category: 'Event', image_url: 'https://images.unsplash.com/photo-1514525253361-bee1a1bb441f', unit_label: 'entry', type: 'EVENT' },
  { id: 'i4', operator_id: 'op4', title: '2nd Chance to Cupid', description: 'Secret Society: 2nd Chance to Cupid event.', price: 1000, category: 'Event', image_url: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67', unit_label: 'entry', type: 'EVENT' },
  { id: 'i11', operator_id: 'op9', title: 'Second Chance To Cupid', description: 'A valentines masquerade house party. Find your match.', price: 500, category: 'Event', image_url: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3', unit_label: 'ticket', type: 'EVENT' },
  { id: 'i-samal-freedive-course', operator_id: 'op-samal-freedive', title: 'Intro to Freediving', description: 'Master the basics of freediving in the clear waters of Samal Island.', price: 3500, category: 'Course', image_url: '/samal_freedive_course.png', unit_label: 'pax', type: 'EVENT' }
];

export const supabaseService = {
  supabase,
  auth: {
    getUser: () => supabase.auth.getUser(),
    getToken: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session?.access_token || null;
    },
    sendOtp: async (phone: string): Promise<{ success: boolean; error?: string }> => {
      const cleanPhone = phone.replace(/\D/g, '');
      const formattedPhone = phone.startsWith('+') ? phone : `+63${cleanPhone}`;
      const { error } = await supabase.auth.signInWithOtp({ phone: formattedPhone });
      if (error && (error.message.includes("provider_disabled") || error.message.includes("not found"))) return { success: true };
      return error ? { success: false, error: error.message } : { success: true };
    },
    verifyOtp: async (phone: string, otp: string): Promise<{ user: User | null; error?: string }> => {
      // Clean up phone format
      const formattedPhone = phone.startsWith('+') ? phone : `+63${phone.replace(/\D/g, '')}`;
      const { data, error } = await supabase.auth.verifyOtp({ phone: formattedPhone, token: otp.trim(), type: 'sms' });
      if (error) return { user: null, error: error.message };
      if (data.user) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
        if (profile) return { user: { ...profile, email: data.user.email } as User };
        const newUser: any = {
          id: data.user.id,
          username: `user_${data.user.id.slice(0, 5)}`,
          name: phone,
          avatar_url: `https://ui-avatars.com/api/?name=${phone}`,
          streak_count: 0,
          aura_points: 1000,
          tour_completed: false,
          life_exp: 0,
          level: 1,
          life_streak: 0,
          bio: 'Joined Be4L!'
        };
        await supabase.from('profiles').insert(newUser);
        return { user: { ...newUser, email: data.user.email } as User };
      }
      return { user: null, error: "Verification failed." };
    },
    sendEmailOtp: async (email: string): Promise<{ success: boolean; error?: string }> => {
      const { error } = await supabase.auth.signInWithOtp({ email });
      return error ? { success: false, error: error.message } : { success: true };
    },
    verifyEmailOtp: async (email: string, otp: string): Promise<{ user: User | null; error?: string }> => {
      const { data, error } = await supabase.auth.verifyOtp({ email, token: otp, type: 'email' });
      if (error) return { user: null, error: error.message };
      if (data.user) {
        return await supabaseService.auth.getCurrentUser().then(user => ({ user, error: undefined }));
      }
      return { user: null, error: "Verification failed" };
    },
    updatePassword: async (password: string): Promise<{ success: boolean; error?: string }> => {
      const { error } = await supabase.auth.updateUser({ password });
      return error ? { success: false, error: error.message } : { success: true };
    },
    checkUsernameAvailability: async (username: string): Promise<boolean> => {
      const { data } = await supabase.from('profiles').select('username').eq('username', username).single();
      return !data;
    },
    getEmailByUsername: async (username: string): Promise<string | null> => {
      const { data } = await supabase.from('profiles').select('email').eq('username', username).single();
      return data?.email || null;
    },
    updateProfile: async (userId: string, data: Partial<User>): Promise<boolean> => {
      const { error } = await supabase.from('profiles').update(data).eq('id', userId);
      return !error;
    },
    claimBrandAccess: async (code: string): Promise<{ success: boolean; error?: string }> => {
      try {
        const cleanCode = code.trim();
        if (cleanCode.toLowerCase() !== 'begonia') {
          return { success: false, error: 'Invalid or Expired Access Code' };
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, error: 'User not logged in' };

        const { error } = await supabase.from('profiles').update({ is_operator: true }).eq('id', user.id);
        if (error) throw error;

        return { success: true };
      } catch (e: any) {
        return { success: false, error: e.message || 'Verification failed' };
      }
    },
    getCurrentUser: async (): Promise<User | null> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (!profile) return null;
      let synced = await syncStreak(profile);
      // Ensure initial aura points for legacy users if needed
      if ((synced.aura_points || 0) === 0 && !synced.tour_completed) {
        synced.aura_points = 1000;
        await supabase.from('profiles').update({ aura_points: 1000 }).eq('id', user.id);
      }
      return { ...synced, email: user.email } as User;
    },
    signInWithEmail: async (email: string, pass: string) => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (error) throw error;
      if (!data.user) return null;
      return await supabaseService.auth.getCurrentUser();
    },
    signUpWithEmail: async (email: string, pass: string, username: string) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: { data: { username } }
      });
      if (error) throw error;
      return data;
    },
    signInWithGoogle: async () => {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin }
      });
      if (error) throw error;
    },
    signInAsGuest: async () => {
      // For mvp, we use a mock guest user if anonymous auth isn't configured
      // In production, this would call supabase.auth.signInAnonymously()
      const guestId = `guest_${Math.random().toString(36).slice(2, 9)}`;
      const guestUser: any = {
        id: guestId,
        username: `guest_${guestId.slice(6)}`,
        name: 'Guest Explorer',
        avatar_url: `https://ui-avatars.com/api/?name=Guest+Explorer&background=random`,
        streak_count: 0,
        aura_points: 500,
        tour_completed: true,
        onboarding_completed: true,
        life_exp: 0,
        level: 1,
        life_streak: 0,
        is_guest: true
      };

      // We don't try to persist guest to DB, just return for context
      return guestUser;
    },
    signOut: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    }
  },
  profiles: {
    getProfile: async (id: string) => {
      if (!id) return { data: null };

      // Priority 1: Check mock users if ID is not a UUID or starts with 'u' or is a legacy number
      const isMockId = !isValidUUID(id) || id.startsWith('u') || /^\d+$/.test(id);

      if (isMockId) {
        // Direct match check (e.g., 'u2', 'u3', 'guest_1234')
        const mock = [...OTHER_USERS, MOCK_USER, MOCK_ADMIN, MOCK_OPERATOR].find(u => u.id === id);
        if (mock) return { data: mock, error: null };

        // Handle numeric legacy mock IDs
        const legacyMap: Record<string, string> = { '1': 'u2', '2': 'u3', '3': 'u4', '5': 'u6', '6': 'u7' };
        if (legacyMap[id]) {
          const legacyMock = OTHER_USERS.find(u => u.id === legacyMap[id]);
          if (legacyMock) return { data: legacyMock, error: null };
        }

        return { data: null, error: { message: `Profile not found for ID: ${id}` } };
      }

      const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
      return { data, error };
    },
    computeDisplayStreak,
    syncStreak,
    followUser: async (f: string, t: string) => {
      if (!isValidUUID(f) || !isValidUUID(t)) return true;
      const { error } = await supabase.from('follows').insert({ follower_id: f, following_id: t, type: 'user' });
      if (!error) {
        await supabase.rpc('increment_following', { user_id: f });
        await supabase.rpc('increment_followers', { user_id: t });
        return true;
      }
      return error.code === '23505';
    },
    unfollowUser: async (f: string, t: string) => {
      if (!isValidUUID(f) || !isValidUUID(t)) return true;
      const { error } = await supabase.from('follows').delete().match({ follower_id: f, following_id: t, type: 'user' });
      if (!error) {
        await supabase.rpc('decrement_following', { user_id: f });
        await supabase.rpc('decrement_followers', { user_id: t });
        return true;
      }
      return false;
    },
    getFollowStatus: async (f: string, t: string) => {
      if (!isValidUUID(f) || !isValidUUID(t)) return false;
      const { data } = await supabase.from('follows').select('*').match({ follower_id: f, following_id: t, type: 'user' }).single();
      return !!data;
    },
    getMutualFollows: async (uid: string): Promise<string[]> => {
      if (friendsCache[uid]) return friendsCache[uid];
      if (friendsRequestCache[uid]) return friendsRequestCache[uid]; // Return in-flight promise

      if (!isValidUUID(uid)) return ['u2', 'u3', 'u4'];

      const fetchFriends = async () => {
        try {
          // Get who I follow
          const { data: following } = await supabase.from('follows').select('following_id').eq('follower_id', uid);
          const followingIds = (following || []).map(f => f.following_id);

          if (followingIds.length === 0) {
            friendsCache[uid] = [];
            return [];
          }

          // Get who follows me back from that list
          const { data: friends } = await supabase.from('follows')
            .select('follower_id')
            .eq('following_id', uid)
            .in('follower_id', followingIds);

          const result = (friends || []).map(f => f.follower_id);
          friendsCache[uid] = result;
          return result;
        } catch (e) {
          console.error("Failed to fetch friends", e);
          return [];
        } finally {
          delete friendsRequestCache[uid];
        }
      };

      friendsRequestCache[uid] = fetchFriends();
      return friendsRequestCache[uid];
    },
    awardQuestRewards: awardQuestRewardsImpl,
    updateUserAura: async (uid: string, d: number) => awardQuestRewardsImpl(uid, d, 0),
    completeTour: async (uid: string) => {
      // Use awardQuestRewardsImpl to increment aura by 100
      const { data: profile } = await supabase.from('profiles').select('aura_points').eq('id', uid).single();
      const currentAura = profile?.aura_points || 0;
      const { error } = await supabase.from('profiles').update({
        tour_completed: true,
        aura_points: currentAura + 100
      }).eq('id', uid);
      return !error;
    },
    getFollowersList: async (uid: string): Promise<User[]> => {
      if (!isValidUUID(uid)) return OTHER_USERS.slice(0, 3);
      const { data } = await supabase
        .from('follows')
        .select('follower:profiles!follower_id(*)')
        .eq('following_id', uid)
        .eq('type', 'user')
        .order('created_at', { ascending: false });
      return ((data || []).map((d: any) => d.follower).filter(Boolean)) as User[];
    },
    getFollowingList: async (uid: string): Promise<User[]> => {
      if (!isValidUUID(uid)) return OTHER_USERS.slice(0, 2);
      const { data } = await supabase
        .from('follows')
        .select('profile:profiles!following_id(*)')
        .eq('follower_id', uid)
        .eq('type', 'user')
        .order('created_at', { ascending: false });
      return ((data || []).map((d: any) => d.profile).filter(Boolean)) as User[];
    },
    getFollowingIds: async (uid: string): Promise<string[]> => {
      if (!isValidUUID(uid)) return ['u2', 'u3'];
      const { data } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', uid)
        .eq('type', 'user');
      return (data || []).map(f => f.following_id);
    },
    searchUsers: async (query: string): Promise<User[]> => {
      console.log("[SearchUsers] Query:", query);
      if (!query || query.length < 1) return [];
      const q = query.toLowerCase();

      let dbUsers: User[] = [];
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .or(`username.ilike.%${query}%,name.ilike.%${query}%,handle.ilike.%${query}%`)
          .limit(20);

        if (error) {
          console.error("[SearchUsers] DB Error:", error);
        } else {
          dbUsers = (data || []) as User[];
          console.log("[SearchUsers] DB Results:", dbUsers.length);
        }
      } catch (e) {
        console.error("[SearchUsers] Exception:", e);
      }

      const mockUsers = [...OTHER_USERS, MOCK_USER, MOCK_ADMIN, MOCK_OPERATOR].filter(u =>
        (u.username || '').toLowerCase().includes(q) ||
        (u.name || '').toLowerCase().includes(q) ||
        (u.handle || '').toLowerCase().includes(q)
      );

      // Merge and unique
      const all = [...dbUsers];
      mockUsers.forEach(m => {
        if (!all.find(u => u.id === m.id)) all.push(m);
      });
      console.log("[SearchUsers] Total:", all.length);
      return all;
    }
  },
  captures: {
    getFeed: async (type: 'discover' | 'friends' = 'discover', uid?: string): Promise<Capture[]> => {
      try {
        const { data: { user: au } } = await supabase.auth.getUser();
        const cid = uid || au?.id || MOCK_USER.id;
        const ws = dailyService.getCurrentWindowStart();

        // Fetch real captures
        const { data } = await supabase.from('captures').select(`*, user:profiles(*), quest:quests(*)`).gte('created_at', ws.toISOString());
        let all = [...((data || []) as Capture[]), ...localCaptures].filter(c => new Date(c.captured_at || c.created_at) >= ws);

        // Add mock content for variety if empty (Legacy/Demo support)
        if (all.length < 5) {
          OTHER_USERS.slice(0, 5).forEach((u, i) => {
            if (!all.find(c => c.user_id === u.id)) {
              all.push({
                id: `m-${u.id}-${i}`, user_id: u.id, user: u,
                front_media_url: `https://picsum.photos/150/200?random=${i}`, back_media_url: `https://picsum.photos/400/600?random=${i + 10}`,
                media_type: 'image', location: { lat: 0, lng: 0, place_name: 'Davao City' },
                caption: POSITIVE_QUOTES[i % POSITIVE_QUOTES.length],
                created_at: ws.toISOString(), captured_at: ws.toISOString(),
                visibility: 'public', state: 'active', reaction_count: 0, comment_count: 0
              });
            }
          });
        }

        // Handle Friendship Gates
        const friends = (type === 'friends' || all.some(c => c.visibility === 'friends'))
          ? await supabaseService.profiles.getMutualFollows(cid)
          : [];

        const filtered = all.filter(c => {
          // Self always sees own
          if (c.user_id === cid) return true;

          // Private is only for self (handled above)
          if (c.visibility === 'private') return false;

          // Friends only: check if mutuals
          if (c.visibility === 'friends') {
            return friends.includes(c.user_id);
          }

          // Discover mode: only public
          if (type === 'discover') return c.visibility === 'public';

          // Friends feed mode: only from people I follow (or mutuals specifically if preferred)
          // For Be4L, 'friends feed' usually means people you are mutuals with
          if (type === 'friends') return friends.includes(c.user_id);

          return c.visibility === 'public';
        });

        return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      } catch (e) {
        console.error("Feed fetch error:", e);
        return localCaptures;
      }
    },
    getVault: async (uid: string) => {
      if (!isValidUUID(uid)) return localCaptures.filter(c => c.user_id === uid);
      const { data } = await supabase.from('captures').select(`*, user:profiles(*)`).eq('user_id', uid).order('created_at', { ascending: false });
      return (data || []) as Capture[];
    },
    getRecallCaptures: async (uid: string) => supabaseService.captures.getVault(uid),
    getFriendIds: async (uid: string) => supabaseService.profiles.getMutualFollows(uid),
    updateCapture: async (cid: string, data: any) => {
      const { error } = await supabase.from('captures').update(data).eq('id', cid);
      return !error;
    },
    deleteCapture: async (cid: string) => {
      const { error } = await supabase.from('captures').delete().eq('id', cid);
      return !error;
    },
    postCapture: async (c: Capture) => {
      localCaptures.unshift(c);
      saveToStorage('be4l_local_captures', localCaptures);
      const { data: { user: au } } = await supabase.auth.getUser();
      const wid = dailyService.getWindowId(new Date());
      const nowTs = new Date().toISOString();
      if (!au) return { success: true, localUpdate: { last_posted_date: nowTs, last_window_id: wid } };
      const { error } = await supabase.from('captures').insert({ user_id: au.id, front_media_url: c.front_media_url, back_media_url: c.back_media_url, media_type: c.media_type, location: c.location, caption: c.caption, visibility: c.visibility, captured_at: c.captured_at || nowTs });
      if (error) return { success: false, error: error.message };
      const { data: p } = await supabase.from('profiles').select('*').eq('id', au.id).single();
      if (p) {
        let s = p.streak_count || 0;
        if (p.last_window_id !== wid) { s = (p.last_window_id && dailyService.isImmediateSuccessor(wid, p.last_window_id)) ? s + 1 : 1; }
        await supabase.from('profiles').update({ last_window_id: wid, streak_count: s, life_streak: s, last_posted_date: nowTs }).eq('id', au.id);
      }
      return { success: true };
    }
  },
  quests: {
    getQuestParticipants: async (qid: string) => {
      if (!isValidUUID(qid)) return [];
      const { data, error } = await supabase.from('user_quests')
        .select('user_id, status, user:profiles(*)')
        .eq('quest_id', qid)
        .in('status', [QuestParticipantStatus.ACCEPTED, QuestParticipantStatus.REQUESTED]);

      if (error) {
        console.error(`[SupabaseService] getQuestParticipants error for ${qid}:`, error);
        return [];
      }

      // Filter for valid rows and map to participant objects
      const participants = (data || [])
        .filter((p: any) => p.user_id && isValidUUID(p.user_id))
        .map((p: any) => ({
          ...p.user,
          id: p.user_id,
          participant_status: p.status
        }));

      console.log(`[SupabaseService] Participants for ${qid}:`, participants.length);
      return participants;
    },
    getMyQuests: async (uid: string) => {
      const { data } = await supabase.from('quests').select(`*, host:profiles(*), user_quests(user_id, status)`).eq('host_id', uid).order('created_at', { ascending: false });
      return (data || []).map((i: any) => ({
        ...i,
        mode: i.type,
        capacity: i.max_participants,
        participant_ids: i.user_quests?.map((uq: any) => uq.user_id) || []
      }));
    },
    getQuests: async (cat: string = 'All') => {
      const { data: { user: au } } = await supabase.auth.getUser();
      const cid = au?.id;

      let query = supabase.from('quests').select(`*, host:profiles!host_id(*), user_quests(user_id, status)`)
        .eq('status', QuestStatus.DISCOVERABLE);

      if (cat !== 'All') query = query.eq('category', cat);

      const { data } = await query.order('created_at', { ascending: false });
      const rawQuests = data || [];

      // If no auth user, only show public quests
      if (!cid) {
        return rawQuests.filter(q => q.visibility_scope !== 'friends').map((i: any) => ({
          ...i,
          mode: i.type,
          capacity: i.max_participants,
          approval_required: i.requires_approval,
          participant_ids: i.user_quests?.map((uq: any) => uq.user_id) || [],
          current_participants: i.user_quests?.filter((uq: any) => uq.status === QuestParticipantStatus.ACCEPTED).length || 0
        }));
      }

      // Fetch relationships for filtering
      const [friends, following] = await Promise.all([
        supabaseService.profiles.getMutualFollows(cid),
        supabaseService.profiles.getFollowingIds(cid)
      ]);

      return rawQuests.map((i: any) => ({
        ...i,
        mode: i.type,
        capacity: i.max_participants,
        approval_required: i.requires_approval,
        participant_ids: i.user_quests?.map((uq: any) => uq.user_id) || [],
        current_participants: i.user_quests?.filter((uq: any) => uq.status === QuestParticipantStatus.ACCEPTED).length || 0
      })).filter((q: any) => {
        if (q.host_id === cid) return true; // Host always sees their own

        if (q.visibility_scope === QuestVisibilityScope.FRIENDS) {
          return friends.includes(q.host_id);
        }
        if (q.visibility_scope === QuestVisibilityScope.FOLLOWERS) {
          return following.includes(q.host_id);
        }
        return true;
      });
    },
    getJoinedQuests: async (uid: string) => {
      if (!isValidUUID(uid)) return [];
      const { data } = await supabase.from('user_quests')
        .select(`
          status,
          quest:quests (
            *,
            host:profiles!host_id(*),
            user_quests (
              user_id,
              status
            )
          )
        `)
        .eq('user_id', uid)
        .neq('status', QuestParticipantStatus.DECLINED); // Don't show declined ones

      return (data || []).filter((d: any) => d.quest).map((d: any) => {
        const q = d.quest;
        return {
          ...q,
          participant_status: d.status,
          mode: q.type,
          capacity: q.max_participants,
          approval_required: q.requires_approval,
          participant_ids: q.user_quests?.map((uq: any) => uq.user_id) || [],
          current_participants: q.user_quests?.filter((uq: any) => uq.status === QuestParticipantStatus.ACCEPTED).length || 0
        };
      });
    },
    getQuestById: async (id: string) => {
      // 1. Check for static mock quests (featured ones)
      const mockResult = MOCK_QUESTS.find(q => q.id === id);
      if (mockResult) {
        return {
          data: {
            ...mockResult,
            mode: mockResult.mode || (mockResult as any).type,
            capacity: mockResult.capacity || mockResult.max_participants,
            participant_ids: mockResult.participant_ids || [],
            current_participants: mockResult.current_participants || 0
          }
        };
      }

      // 2. Check for dynamically generated guest IDs (from QuestGenerator)
      if (id.startsWith('gen-')) {
        return {
          data: {
            id,
            title: "Field Deployment",
            description: "A spontaneous mission detected in your sector. Join to see the signal.",
            mode: QuestType.SPONTY,
            status: QuestStatus.DISCOVERABLE,
            category: "Adventures",
            start_time: new Date().toISOString(),
            capacity: 12,
            current_participants: 1,
            participant_ids: [],
            location: { lat: 7.0707, lng: 125.6087, place_name: 'Davao City' },
            host: OTHER_USERS[1]
          }
        };
      }

      // 3. Real Database UUIDs
      if (!isValidUUID(id)) return { data: null };
      const { data, error } = await supabase.from('quests').select(`*, host:profiles!host_id(*), user_quests(user_id, status)`).eq('id', id).single();
      const { data: lobby } = await supabase.from('echoes').select('id').match({ type: 'lobby', context_id: id }).single();

      if (data) {
        return {
          data: {
            ...data,
            mode: data.type,
            capacity: data.capacity || data.max_participants,
            approval_required: data.requires_approval,
            lobby_id: lobby?.id,
            participant_ids: data.user_quests?.filter((uq: any) => uq.status === QuestParticipantStatus.ACCEPTED).map((uq: any) => uq.user_id) || [],
            requested_ids: data.user_quests?.filter((uq: any) => uq.status === QuestParticipantStatus.REQUESTED).map((uq: any) => uq.user_id) || [],
            current_participants: data.user_quests?.filter((uq: any) => uq.status === QuestParticipantStatus.ACCEPTED).length || 0
          }
        };
      }
      return { data: null, error };
    },
    requestToJoin: async (qid: string, uid?: string, approval: boolean = true) => {
      const { data: { user: au } } = await supabase.auth.getUser();
      const id = uid || au?.id;
      if (!id || !isValidUUID(qid) || !isValidUUID(id)) return true;

      // Always require approval unless explicitly set to false in DB
      const requiresApproval = approval !== false;
      const status = requiresApproval ? QuestParticipantStatus.REQUESTED : QuestParticipantStatus.ACCEPTED;
      const { error } = await supabase.from('user_quests').insert({ user_id: id, quest_id: qid, status });

      if (error) {
        // If it's a unique violation, they already requested/joined
        if (error.code === '23505') return true;
        console.error("Failed to join quest:", error);
        return false;
      }

      if (requiresApproval) {
        // Notify host
        const { data: q } = await supabase.from('quests').select('host_id, title').eq('id', qid).single();
        if (q && q.host_id !== id) {
          const chat = await supabaseService.chat.getOrCreatePersonalChat(id, q.host_id, q.title);
          if (chat) {
            await supabaseService.chat.sendMessage(chat.id, `🚨 QUEST SIGNAL: I've requested to join "${q.title}". Review my request in mission details.`, 'text');
          }

          await supabaseService.notifications.createNotification({
            user_id: q.host_id,
            type: 'QUEST_REQUEST',
            title: 'New Quest Request',
            content: `Someone wants to join your mission: ${q.title}`,
            target_id: qid
          });
        }
      }
      return true;
    },
    updateParticipantStatus: async (qid: string, uid: string, status: QuestParticipantStatus, reasoning?: string) => {
      const { data: { user: au } } = await supabase.auth.getUser();
      if (!isValidUUID(qid) || !isValidUUID(uid) || !au) return false;

      console.log(`[SupabaseService] Updating status to ${status} for quest ${qid}, user ${uid}...`);
      const { data, error } = await supabase.from('user_quests')
        .update({ status })
        .match({ quest_id: qid, user_id: uid })
        .select();

      if (error || !data || data.length === 0) {
        console.error(`[SupabaseService] Update FAILED for quest ${qid}, user ${uid}. Data:`, data, "Error:", error);
        return false;
      }
      console.log(`[SupabaseService] Update SUCCESS:`, data[0]);

      const { data: quest } = await supabase.from('quests').select('title, host_id').eq('id', qid).single();
      const { data: profile } = await supabase.from('profiles').select('name').eq('id', uid).single();

      if (quest) {
        if (status === QuestParticipantStatus.ACCEPTED) {
          // If accepted, ensure host & participant are in the lobby
          const lobby = await supabaseService.chat.getOrCreateQuestLobby(qid, quest.title, [quest.host_id, uid]);

          if (lobby && profile) {
            await supabaseService.chat.sendMessage(lobby.id, `[System] SIGNAL ESTABLISHED: ${profile.name} has joined the mission.`, 'text');
          }

          // Notify user via chat
          const chat = await supabaseService.chat.getOrCreatePersonalChat(au.id, uid, quest.title);
          if (chat) {
            await supabaseService.chat.sendMessage(chat.id, `✅ MISSION ACCEPTED: You've been cleared for "${quest.title}". Note: ${reasoning || 'Accepted'}`, 'text');
          }

          // Notify user via notifications
          await supabaseService.notifications.createNotification({
            user_id: uid,
            type: 'QUEST_ACCEPTED',
            title: 'Mission Accepted',
            content: `You've been cleared for "${quest.title}". ${reasoning ? `Note: ${reasoning}` : ''}`,
            target_id: qid,
            metadata: { reasoning }
          });
        } else if (status === QuestParticipantStatus.DECLINED) {
          // Notify user via chat
          const chat = await supabaseService.chat.getOrCreatePersonalChat(au.id, uid, quest.title);
          if (chat) {
            await supabaseService.chat.sendMessage(chat.id, `❌ MISSION UPDATE: Your request for "${quest.title}" was declined. Reason: ${reasoning || 'No reason specified.'}`, 'text');
          }

          // Notify user via notifications
          await supabaseService.notifications.createNotification({
            user_id: uid,
            type: 'QUEST_DECLINED',
            title: 'Request Declined',
            content: `Your request for "${quest.title}" was declined. ${reasoning ? `Reason: ${reasoning}` : ''}`,
            target_id: qid,
            metadata: { reasoning }
          });
        }
      }
      return true;
    },
    removeQuestParticipant: async (qid: string, uid: string) => {
      if (!isValidUUID(qid) || !isValidUUID(uid)) return false;

      console.log(`[SupabaseService] Removing participant ${uid} from quest ${qid}...`);
      // 1. Remove from user_quests record
      const { error } = await supabase.from('user_quests').delete().match({ quest_id: qid, user_id: uid });

      if (error) {
        console.error(`[SupabaseService] Remove FAILED:`, error);
        return false;
      }

      // 2. Remove from lobby participant_ids & send signal
      const { data: lobby } = await supabase.from('echoes').select('id, participant_ids').match({ type: 'lobby', context_id: qid }).single();
      if (lobby && lobby.participant_ids?.includes(uid)) {
        const { data: profile } = await supabase.from('profiles').select('name').eq('id', uid).single();
        if (profile) {
          await supabaseService.chat.sendMessage(lobby.id, `[System] ${profile.name} left the quest`, 'text');
        }

        const newPids = lobby.participant_ids.filter((p: string) => p !== uid);
        await supabase.from('echoes').update({ participant_ids: newPids }).eq('id', lobby.id);
      }

      console.log(`[SupabaseService] Remove SUCCESS.`);
      return true;
    },
    leaveQuest: async (qid: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !isValidUUID(qid)) return false;
      return supabaseService.quests.removeQuestParticipant(qid, user.id);
    },
    async getOrCreateSquadChat(qid: string, name: string, pids: string[]) {
      return supabaseService.chat.getOrCreateQuestLobby(qid, name, pids);
    },
    createQuest: async (d: any) => {
      // 1. Get truly authenticated user from Supabase
      const { data: { user: au } } = await supabase.auth.getUser();

      // 2. Resolve host ID - strict UUID check for real DB insert
      const hid = au?.id || d.host_id;

      if (!hid) {
        return { success: false, error: "Authentication required." };
      }

      // If it's a mock user ID (starts with 'u'), handle locally or return error for real DB
      if (!isValidUUID(hid)) {
        if (!au) return { success: false, error: "Please sign in to post quests." };
      }

      // sanitize payload to match DB schema strictly
      const cleanData: any = {
        title: d.title,
        description: d.description,
        category: d.category,
        activity: d.activity,
        start_time: d.start_time,
        end_time: d.end_time,
        location: d.location, // JSONB
        max_participants: d.max_participants,
        requires_approval: d.requires_approval,
        type: d.type,
        status: QuestStatus.DISCOVERABLE,
        aura_reward: d.aura_reward,
        exp_reward: d.exp_reward,
        host_id: hid,
        created_by: hid,
        is_public: d.visibility_scope === 'public' || d.is_public === true,
        visibility_scope: d.visibility_scope || 'public',
        itinerary: d.itinerary,
        checklist: d.checklist,
        vibe_signals: d.vibe_signals
      };

      const { data: nq, error } = await supabase.from('quests')
        .insert(cleanData)
        .select()
        .single();

      if (nq) {
        // Add host to user_quests automatically
        await supabase.from('user_quests').insert({
          user_id: hid,
          quest_id: nq.id,
          status: QuestParticipantStatus.ACCEPTED
        });

        // Add to chat lobby
        await supabaseService.chat.getOrCreateQuestLobby(nq.id, nq.title, [hid]);
      }
      return error ? { success: false, error: error.message } : { success: true, questId: nq.id };
    },
    finishQuest: async (qid: string) => {
      if (!isValidUUID(qid)) return { success: true };
      const { error } = await supabase.from('quests').update({ status: QuestStatus.COMPLETED }).eq('id', qid);
      if (error) return { success: false };

      // Award rewards - get participants
      const { data: participants } = await supabase.from('user_quests').select('user_id').eq('quest_id', qid).eq('status', QuestParticipantStatus.ACCEPTED);
      const { data: quest } = await supabase.from('quests').select('host_id').eq('id', qid).single();

      const allToAward = [...(participants?.map(p => p.user_id) || [])];
      if (quest?.host_id) allToAward.push(quest.host_id);

      // Bulk awarding would be better, but we have a small helper for now
      for (const uid of [...new Set(allToAward)]) {
        await awardQuestRewardsImpl(uid, 150, 200);
      }

      return { success: true };
    },
    startQuest: async (qid: string) => {
      if (!isValidUUID(qid)) return { success: true };
      const { error } = await supabase.from('quests').update({ status: QuestStatus.ACTIVE }).eq('id', qid);
      return !error;
    },
    cancelQuest: async (qid: string) => {
      if (!isValidUUID(qid)) return { success: true };
      // Instead of deleting, mark as cancelled so it shows in history
      const { error } = await supabase.from('quests').update({ status: QuestStatus.CANCELLED }).eq('id', qid);
      return !error;
    },
    searchQuests: async (query: string): Promise<Quest[]> => {
      if (!query || query.length < 1) return [];
      const q = query.toLowerCase();

      let dbQuests: Quest[] = [];
      try {
        const { data, error } = await supabase
          .from('quests')
          .select(`*, host:profiles!host_id(*), user_quests(user_id, status)`)
          .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
          .limit(10);

        if (error) {
          console.error("Supabase quest search error:", error);
        } else {
          dbQuests = (data || []).map((i: any) => ({
            ...i,
            mode: i.type,
            capacity: i.max_participants,
            participant_ids: i.user_quests?.map((uq: any) => uq.user_id) || [],
            current_participants: i.user_quests?.filter((uq: any) => uq.status === QuestParticipantStatus.ACCEPTED).length || 0
          })) as Quest[];
        }
      } catch (e) {
        console.error("Search quests exception:", e);
      }

      const mockQuests = MOCK_QUESTS.filter(quest =>
        quest.title.toLowerCase().includes(q) ||
        quest.description.toLowerCase().includes(q)
      );

      const all = [...dbQuests];
      mockQuests.forEach(m => {
        if (!all.find(u => u.id === m.id)) all.push(m);
      });

      return all;
    }
  },
  chat: {
    getChats: async (uid?: string) => {
      const { data: { user: au } } = await supabase.auth.getUser();
      const id = uid || au?.id;
      if (!id) return [];
      if (!isValidUUID(id)) {
        const echoes = MOCK_CHATS.filter(c => c.type === 'personal');
        return echoes.map((e: any) => ({ ...e, lastMsg: 'Tap to view', time: e.time || '10:30 AM' }));
      }
      const { data } = await supabase.from('echoes')
        .select('*, echo_messages(content, created_at, type)')
        .contains('participant_ids', JSON.stringify([id]))
        .order('created_at', { foreignTable: 'echo_messages', ascending: false })
        .limit(1, { foreignTable: 'echo_messages' })
        .order('created_at', { ascending: false });

      let seenGlobal = false;
      let seenCity = false;
      let results: any[] = [];

      // Keep the oldest global/city lobbies as the primary ones
      const sortedByCreated = [...(data || [])].sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

      for (const e of sortedByCreated) {
        if (e.type === 'GLOBAL') {
          if (seenGlobal) {
            // Silently delete duplicates
            supabase.from('echoes').delete().eq('id', e.id).then();
            continue;
          }
          seenGlobal = true;
        }
        if (e.type === 'CITY') {
          if (seenCity) {
            supabase.from('echoes').delete().eq('id', e.id).then();
            continue;
          }
          seenCity = true;
        }

        const latestMsg = e.echo_messages?.[0];

        // Hide empty personal DMs until a message is sent
        if (['personal', 'DM'].includes(e.type) && !latestMsg) {
          continue;
        }

        const msgTime = latestMsg?.created_at || e.created_at;
        const msgPreview = latestMsg?.content ?
          (latestMsg.type === 'image' ? 'Sent an image' :
            latestMsg.type === 'system' ? latestMsg.content :
              latestMsg.content.substring(0, 60))
          : 'No messages yet';

        results.push({
          id: e.id,
          type: e.type,
          context_type: e.context_type,
          context_id: e.context_id,
          name: e.name || 'Chat',
          lastMsg: msgPreview,
          time: new Date(msgTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sortTime: new Date(msgTime).getTime(),
          unread: 0,
          avatar: e.avatar || (e.type === 'GLOBAL' ? 'https://cdn-icons-png.flaticon.com/512/921/921591.png' :
            e.type === 'CITY' ? `https://ui-avatars.com/api/?name=${encodeURIComponent(e.name)}&background=random` :
              e.type === 'BRAND' ? `/logo.png` :
                e.type === 'lobby' ? 'https://cdn-icons-png.flaticon.com/512/2354/2354573.png' : undefined)
        });
      }

      // Inject local mock personal chats from local memory
      const localKeys = Object.keys(localMockMessages).filter(k => k.startsWith(`m-${id}-`) || (k.startsWith('m-') && k.endsWith(`-${id}`)));
      for (const k of localKeys) {
        const msgs = localMockMessages[k] || [];
        if (msgs.length === 0) continue;
        const latestMsg = msgs[msgs.length - 1];

        // Extract the target's ID to find their mock profile
        const parts = k.split('-');
        let otherId = parts[1];
        if (otherId === id && parts.length > 2) otherId = parts[2];

        // Ensure we don't accidentally duplicate if it snuck in
        if (results.find(r => r.id === k)) continue;

        const otherUser = OTHER_USERS.find(u => u.id === otherId) || MOCK_OPERATOR;
        const name = otherUser ? otherUser.name : `Mock User`;
        const avatar = otherUser ? otherUser.avatar_url : undefined;

        results.push({
          id: k,
          type: 'personal',
          name,
          lastMsg: latestMsg.content || 'Draft',
          time: latestMsg.timestamp || 'Just now',
          sortTime: new Date(latestMsg.created_at || Date.now()).getTime(),
          unread: 0,
          avatar
        });
      }

      // Re-sort results by recent activity for the UI
      results.sort((a, b) => b.sortTime - a.sortTime);

      // Ensure Global is present for everyone
      if (!results.find(r => r.type === 'GLOBAL')) {
        const global = await supabaseService.chat.getGlobalChat();
        if (global) {
          results.unshift({
            ...global,
            type: 'GLOBAL',
            lastMsg: 'Welcome to Be4L Global!',
            time: 'Live',
            unread: 0,
            avatar: 'https://cdn-icons-png.flaticon.com/512/921/921591.png'
          });
          // Auto-join persistence (silently)
          await supabase.from('echoes').update({
            participant_ids: Array.from(new Set([...(global.participant_ids || []), id]))
          }).eq('id', global.id);
        }
      }

      return results;
    },
    joinCityChat: async (cityId: string) => {
      const { data, error } = await supabase.rpc('join_city_chat', { city_chat_id: cityId });
      if (error) return { success: false, error: error.message };
      return data; // Returns { success: true } or { success: false, error: '...' }
    },
    getGlobalChat: async () => {
      // Fetch the single global chat gracefully
      let { data } = await supabase.from('echoes').select('*').eq('type', 'GLOBAL').limit(1);
      if (data && data.length > 0) {
        return data[0];
      }
      // Create it if it doesn't exist
      const { data: newGlobal } = await supabase.from('echoes')
        .insert({ type: 'GLOBAL', name: 'GLOBAL LOBBY', participant_ids: [] })
        .select()
        .single();
      return newGlobal ? { id: newGlobal.id, name: newGlobal.name } : null;
    },
    async getOrCreateQuestLobby(qid: string, name: string, pids: string[]) {
      if (!isValidUUID(qid)) return { id: `lobby-${qid}`, name: `LOBBY: ${name}` };
      const { data } = await supabase.from('echoes').select('*').match({ type: 'lobby', context_id: qid }).single();
      if (data) {
        // Merge participants
        const existingPids = data.participant_ids || [];
        const newPids = Array.from(new Set([...existingPids, ...pids]));
        if (newPids.length > existingPids.length) {
          await supabase.from('echoes').update({ participant_ids: newPids }).eq('id', data.id);
        }
        return { id: data.id, name: data.name };
      }
      const { data: ne, error: insertError } = await supabase.from('echoes').insert({
        type: 'lobby',
        context_id: qid,
        context_type: 'QUEST',
        participant_ids: pids,
        name
      }).select().single();

      if (insertError) {
        console.error("[SupabaseService] Failed to create quest lobby:", insertError);
      }

      return ne ? { id: ne.id, name: ne.name } : null;
    },
    getOrCreatePersonalChat: async (a: string, b: string, n: string) => {
      if (!isValidUUID(a) || !isValidUUID(b)) return { id: `m-${a}-${b}`, name: n };
      const { data } = await supabase.from('echoes').select('*').eq('type', 'personal').contains('participant_ids', JSON.stringify([a, b]));
      if (data?.[0]) return { id: data[0].id, name: n };
      const { data: ne, error } = await supabase.from('echoes').insert({ type: 'personal', participant_ids: [a, b], name: n }).select().single();
      if (error) console.error("[SupabaseService] Failed to create personal chat:", error);
      return ne ? { id: ne.id, name: n } : null;
    },
    createGroup: async (creatorId: string, groupName: string) => {
      if (!isValidUUID(creatorId)) return { data: null, error: 'Invalid User' };
      const { data, error } = await supabase.from('echoes')
        .insert({
          type: 'SQUAD',
          name: groupName,
          participant_ids: [creatorId]
        })
        .select()
        .single();
      return { data, error };
    },
    getMessages: async (id: string) => {
      if (!isValidUUID(id)) return localMockMessages[id] || [];
      const { data } = await supabase.from('echo_messages').select('*').eq('echo_id', id).order('created_at', { ascending: true });
      const { data: { user: au } } = await supabase.auth.getUser();
      return (data || []).map((m: any) => ({ ...m, sender_id: m.sender_id === au?.id ? 'me' : m.sender_id, is_me: m.sender_id === au?.id, timestamp: new Date(m.created_at).toLocaleTimeString() }));
    },
    sendMessage: async (id: string, c: string, t: any = 'text', p?: any) => {
      const { data: { user: au } } = await supabase.auth.getUser();
      if (!isValidUUID(id)) {
        const newMsg = { id: `m-${Date.now()}`, echo_id: id, sender_id: 'me', content: c, is_me: true, created_at: new Date().toISOString(), timestamp: new Date().toLocaleTimeString(), type: t, ...p } as any;
        if (!localMockMessages[id]) localMockMessages[id] = [];
        localMockMessages[id].push(newMsg);
        saveToStorage('be4l_local_messages', localMockMessages);
        if (typeof window !== 'undefined') window.dispatchEvent(new Event('local-chat-update'));
        return newMsg;
      }
      if (!au) return null;
      const { data, error } = await supabase.from('echo_messages').insert({ echo_id: id, sender_id: au.id, content: c, type: t, ...p }).select().single();
      if (error) console.error("[SupabaseService] Failed to send message:", error);
      return data;
    },
    subscribeToEcho: (id: string, cb: (m: any) => void) => {
      if (!isValidUUID(id)) return { unsubscribe: () => { } };
      return supabase.channel(`echo-${id}`).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'echo_messages', filter: `echo_id=eq.${id}` }, (p) => {
        const m = p.new as any;
        supabase.auth.getUser().then(({ data: { user } }) => cb({ ...m, sender_id: m.sender_id === user?.id ? 'me' : m.sender_id, is_me: m.sender_id === user?.id }));
      }).subscribe();
    }
  },
  dibs: {
    provisionBrandDraft: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, error: 'Not authenticated' };

      const { data: profile } = await supabase.from('profiles').select('name, avatar_url').eq('id', user.id).single();

      const newDraft = {
        user_id: user.id,
        business_name: profile?.name || 'My Brand',
        slug: `brand-${user.id.slice(0, 8)}`,
        category: 'venue',
        status: 'onboarding',
        logo_url: profile?.avatar_url || '',
      };

      const { error } = await supabase.from('operators').upsert(newDraft);
      if (error) console.error('[provisionBrandDraft] Error:', error);
      return { success: !error, error: error?.message };
    },
    updateOnboardingStep: async (data: Partial<import('../types').Operator>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, error: 'Not authenticated' };

      const { error } = await supabase.from('operators').update(data).eq('user_id', user.id);
      return { success: !error, error: error?.message };
    },
    publishBrand: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, error: 'Not authenticated' };

      const { error } = await supabase.from('operators').update({ status: 'live' }).eq('user_id', user.id);
      return { success: !error, error: error?.message };
    },
    resetBrandStatus: async () => {
      console.log('[resetBrandStatus] Checking user...');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, error: 'Not authenticated' };
      console.log('[resetBrandStatus] User found:', user.id);

      // 1. Set is_operator to false in profiles
      const { error: profileError } = await supabase.from('profiles').update({ is_operator: false }).eq('id', user.id);
      if (profileError) console.error('[resetBrandStatus] Profile update failed:', profileError);

      // 2. Delete the operator entry
      const { error: operatorError } = await supabase.from('operators').delete().eq('user_id', user.id);
      if (operatorError) console.error('[resetBrandStatus] Operator delete failed:', operatorError);

      return { success: !profileError && !operatorError, error: profileError?.message || operatorError?.message };
    },
    getOperators: async (): Promise<any[]> => {
      let dbOps: any[] = [];
      try {
        const { data, error } = await supabase.from('operators').select('*');
        if (data) dbOps = data;
        if (error) console.error('[getOperators] DB Error:', error);
      } catch (e) {
        console.error('[getOperators] Try catch error:', e);
      }

      const ALL_STATIC = STATIC_OPERATORS;

      // Dynamically add operators from localItems who aren't in the static list or DB
      const localOpIds = [...new Set(localItems.map(i => i.operator_id))];
      const dynamicOps = localOpIds
        .filter(oid => !ALL_STATIC.some(s => s.user_id === oid) && !dbOps.some(d => d.user_id === oid))
        .map(oid => ({
          user_id: oid,
          business_name: `Operator ${oid.slice(-4)}`,
          slug: `op-${oid.slice(-4)}`,
          category: 'venue',
          cover_photo_url: 'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?q=80&w=1000',
          logo_url: `https://ui-avatars.com/api/?name=${oid}&background=random`,
          bio: 'Newly commissioned space on Be4L.',
          location_text: 'Davao City',
          is_verified: false,
          rating: 5.0
        }));

      return [...dbOps, ...ALL_STATIC, ...dynamicOps];
    },
    getOperatorBySlug: async (slug: string) => {
      const ops = await supabaseService.dibs.getOperators();
      const op = ops.find(o => o.slug === slug);
      if (!op) return null;
      return { ...op, owner: { id: op.user_id, name: op.business_name, avatar_url: op.logo_url }, gallery: [{ photo_url: op.cover_photo_url }] };
    },
    getAllItems: async (): Promise<any[]> => {
      let dbItems: any[] = [];
      try {
        const { data } = await supabase.from('dibs_items').select('*');
        if (data) dbItems = data;
      } catch (e) {
        console.error("Failed to fetch all items from DB", e);
      }

      const STATIC_ITEMS = STATIC_DIB_ITEMS;
      
      // Merge results, prioritizing DB items by ID
      const all = [...dbItems];
      [...STATIC_ITEMS, ...localItems].forEach(m => {
        if (!all.find(i => i.id === m.id)) all.push(m);
      });
      
      return all;
    },
    searchItems: async (query: string): Promise<any[]> => {
      if (!query) return [];
      const q = query.toLowerCase();

      let dbItems: any[] = [];
      try {
        const { data } = await supabase
          .from('dibs_items')
          .select('*')
          .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
          .limit(10);
        dbItems = data || [];
      } catch (e) { }

      const mockItems = STATIC_DIB_ITEMS.filter(item =>
        item.title.toLowerCase().includes(q) ||
        (item.description || '').toLowerCase().includes(q)
      );

      const all = [...dbItems];
      mockItems.forEach(m => {
        if (!all.find(i => i.id === m.id)) all.push(m);
      });
      return all;
    },
    searchOperators: async (query: string): Promise<any[]> => {
      if (!query) return [];
      const q = query.toLowerCase();

      let dbOps: any[] = [];
      try {
        const { data } = await supabase
          .from('operators')
          .select('*')
          .or(`business_name.ilike.%${query}%,bio.ilike.%${query}%`)
          .limit(10);
        dbOps = data || [];
      } catch (e) { }

      const mockOps = STATIC_OPERATORS.filter(op =>
        op.business_name.toLowerCase().includes(q) ||
        (op.bio || '').toLowerCase().includes(q)
      );

      const all = [...dbOps];
      mockOps.forEach(m => {
        if (!all.find(o => o.user_id === m.user_id)) all.push(m as any);
      });
      return all;
    },
    getItems: async (operatorId: string): Promise<any[]> => {
      let dbItems: any[] = [];
      try {
        const { data } = await supabase.from('dibs_items').select('*').eq('operator_id', operatorId);
        if (data) dbItems = data;
      } catch (e) {
        console.error("Failed to fetch operator items", e);
      }
      
      const ALL_STATIC = STATIC_DIB_ITEMS;
      const combined = [...dbItems];
      
      // Add local/static items that match operatorId if not already present
      [...ALL_STATIC, ...localItems]
        .filter(i => i.operator_id === operatorId)
        .forEach(m => {
          if (!combined.find(i => i.id === m.id)) combined.push(m);
        });
        
      return combined;
    },
    addItem: async (data: any) => {
      // 0. Prepare local copy for optimistic UI (optional, but keep for fallback)
      const localId = `item-${Date.now()}`;
      const newItem = { id: localId, is_active: true, created_at: new Date().toISOString(), ...data };

      // 1. Persist to DB
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        // 2. Ensure Operator profile exists in DB
        const { data: existingOp, error: opCheckError } = await supabase
          .from('operators')
          .select('user_id')
          .eq('user_id', user.id)
          .single();

        if (opCheckError && opCheckError.code !== 'PGRST116') {
          console.error("Operator check error:", opCheckError);
        }

        if (!existingOp) {
          console.log("Creating operator stub for sync...");
          const brandName = user.user_metadata?.business_name || user.user_metadata?.full_name || 'New Brand';
          const { error: insError } = await supabase.from('operators').insert({
            user_id: user.id,
            business_name: brandName,
            slug: brandName.toLowerCase().replace(/\s+/g, '-') + '-' + user.id.slice(0, 5),
            status: 'active',
            category: data.category || 'venue'
          });
          if (insError) console.error("Could not create operator stub:", insError);
        }

        // 3. Insert the Item
        const { data: dbData, error } = await supabase.from('dibs_items').insert({
          operator_id: user.id, // Force item to belong to current user
          title: data.title,
          description: data.description,
          price: data.price,
          category: data.category,
          type: data.type,
          image_url: data.image_url,
          unit_label: data.unit_label,
          event_date: data.event_date,
          event_location: data.event_location,
          event_lat: data.event_lat,
          event_lng: data.event_lng,
          tiers: data.tiers,
          opening_time: data.opening_time,
          closing_time: data.closing_time,
          slot_duration: data.slot_duration,
          amenities: data.amenities,
          resources: data.resources,
          is_active: data.is_active ?? true,
          metadata: { ...(data.metadata || {}), sync_status: 'synced_to_cloud', original_local_id: localId }
        }).select().single();

        if (error) throw error;
        
        // Success: Update local storage with full cloud data
        localItems.push(dbData);
        saveToStorage('be4l_local_items', localItems);
        
        return { success: true, item: dbData };
      } catch (e) {
        console.error("Supabase addItem hard failure:", e);
        // Last resort fallback
        localItems.push(newItem);
        saveToStorage('be4l_local_items', localItems);
        return { success: true, item: newItem, warning: "Stored locally. Cloud sync failed." };
      }
    },
    updateItem: async (id: string, data: any) => {
      // Update local
      const idx = localItems.findIndex(i => i.id === id);
      if (idx !== -1) {
        localItems[idx] = { ...localItems[idx], ...data };
        saveToStorage('be4l_local_items', localItems);
      }

      // Update DB
      try {
        // Only attempt DB update for UUIDs
        if (id.includes('-') && id.length > 20) {
           const { error } = await supabase.from('dibs_items').update({
            ...data,
            metadata: { ...(data.metadata || {}), last_sync: new Date().toISOString() }
          }).eq('id', id);
          if (error) throw error;
        }
      } catch (e) {
        console.error("Supabase updateItem failed", e);
      }
      return { success: true };
    },
    deleteItem: async (id: string) => {
      // Remove from local
      localItems = localItems.filter(i => i.id !== id);
      saveToStorage('be4l_local_items', localItems);

      // Remove from DB if UUID
      if (id.length > 20) {
        try {
          const { error } = await supabase.from('dibs_items').delete().eq('id', id);
          if (error) throw error;
        } catch (e) {
          console.error("Supabase deleteItem failed", e);
        }
      }
      return { success: true };
    },

    getMyBookings: async (userId?: string): Promise<any[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      const uid = userId || user?.id;

      let dbBookings: any[] = [];
      if (uid && isValidUUID(uid)) {
        try {
          const { data } = await supabase.from('dibs_bookings').select('*').eq('user_id', uid).order('created_at', { ascending: false });
          if (data) dbBookings = data.map(b => ({ ...b, item: { title: b.item_id }, operator: { business_name: b.operator_id } }));
        } catch (e) { }
      }

      const defaults = [
        { id: 'bk-u1', item_id: 'i1', operator_id: 'op1', status: 'CONFIRMED', quantity: 1, total_amount: 200, booking_date: '2024-02-02', booking_ref: 'DIB-8X2', item: { title: 'Court Rental' }, operator: { business_name: 'Downtown Pickleball' } }
      ];
      return [...dbBookings, ...localBookings.filter(b => b.user_id === (uid || 'guest')), ...defaults];
    },
    createBooking: async (data: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      const nb = {
        id: `bk-${Date.now()}`,
        status: 'PENDING_VERIFICATION',
        user_id: user?.id || 'guest',
        created_at: new Date().toISOString(),
        ...data,
        user: { name: user?.user_metadata?.name || 'Guest', username: user?.user_metadata?.username || 'guest' }
      };

      // Local fallback
      localBookings.unshift(nb);
      saveToStorage('be4l_local_bookings', localBookings);

      // DB persistence if logged in
      if (user && isValidUUID(user.id)) {
        try {
          const { error } = await supabase.from('dibs_bookings').insert({
            user_id: user.id,
            item_id: data.item_id,
            operator_id: data.operator_id,
            quantity: data.quantity,
            booking_date: data.booking_date,
            total_amount: data.total_amount,
            payment_method: data.payment_method,
            payment_proof_url: data.payment_proof_url,
            status: 'PENDING_VERIFICATION',
            booking_ref: data.booking_ref || `DIB-${Math.random().toString(36).substring(7).toUpperCase()}`,
            tier_id: data.tier_id,
            metadata: data.metadata,
            slot_times: data.slot_times,
            extracted_ref: data.extracted_ref
          });
          if (error) console.error("DB Booking failed", error);
        } catch (e) {
          console.error("DB Booking exception", e);
        }
      }

      return { success: true, bookingId: nb.id, status: nb.status };
    },
    verifyPaymentProof: async (imageUrl: string) => {
      // Logic for AI Validation & Scam Prevention
      // 1. OCR Extraction (Mocked)
      const extractedRef = `REF-${Math.floor(Math.random() * 1000000)}`;
      const extractedAmount = 0; // In real life, we extract this
      
      await new Promise(r => setTimeout(r, 1500));
      
      // 2. Duplicate Check (Prevent reusing same receipt)
      const isDuplicate = localBookings.some(b => b.extracted_ref === extractedRef);
      
      // 3. Return report for Operator review
      return { 
        verified: !isDuplicate, 
        confidence: isDuplicate ? 0.1 : 0.98, 
        extracted_ref: extractedRef,
        message: isDuplicate ? "POSSIBLE SCAM: Reference number already exists in records." : "System clear. No duplicates found."
      };
    },
    getOperatorBookings: async (operatorId?: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      const oid = operatorId || user?.id;
      if (!oid) return [];

      let dbBookings: any[] = [];
      try {
        const { data } = await supabase.from('dibs_bookings')
          .select(`*, profiles(name, username, avatar_url), dibs_items(title)`)
          .eq('operator_id', oid)
          .order('created_at', { ascending: false });
        if (data) dbBookings = data.map((b: any) => ({
          ...b,
          user: b.profiles,
          item: b.dibs_items
        }));
      } catch (e) { }

      // Filter local bookings for this operator
      const local = localBookings.filter(b => b.operator_id === oid);
      
      const all = [...dbBookings, ...local];
      // Quick dedupe if needed
      return all;
    },
    getOperatorStats: async (operatorId?: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      const oid = operatorId || user?.id;
      if (!oid) return { revenue: 0, bookings: 0, pending: 0, followers: 0 };

      const items = await supabaseService.dibs.getItems(oid);
      const bookings = await supabaseService.dibs.getOperatorBookings(oid);
      
      const revenue = bookings
        .filter(b => b.status === 'CONFIRMED' || b.status === 'RECLAIMED')
        .reduce((sum, b) => sum + (b.total_amount || 0), 0);
      
      const pending = bookings.filter(b => b.status === 'PENDING_VERIFICATION' || b.status === 'PENDING_PAYMENT').length;
      
      // For followers, we check the follows table for type='operator' and following_id=oid
      let followers = 0;
      try {
        const { count } = await supabase.from('follows')
          .select('*', { count: 'exact', head: true })
          .match({ following_id: oid, type: 'operator' });
        followers = count || 0;
      } catch (e) { }

      return {
        revenue,
        bookings: bookings.length,
        pending,
        followers: followers || 1250 // Fallback for demo
      };
    },
    updateBookingStatus: async (id: string, s: string) => {
      // Update local first
      const idx = localBookings.findIndex(b => b.id === id);
      if (idx !== -1) {
        localBookings[idx].status = s as any;
        saveToStorage('be4l_local_bookings', localBookings);
      }

      // Update DB if UUID
      if (isValidUUID(id)) {
        const { error } = await supabase.from('dibs_bookings').update({ status: s }).eq('id', id);
        return !error;
      }
      return true;
    },
    followOperator: async (id: string) => {
      const { data: { user: au } } = await supabase.auth.getUser();
      if (!au || !isValidUUID(id) || !isValidUUID(au.id)) return false;
      const { error } = await supabase.from('follows').insert({
        follower_id: au.id,
        following_id: id,
        type: 'operator'
      });
      if (!error) {
        await supabase.rpc('increment_following', { user_id: au.id });

        // Auto-join Brand Chat
        const { data: op } = await supabase.from('operators').select('business_name, logo_url').eq('user_id', id).single();
        if (op) {
          const { data: brandChat } = await supabase.from('echoes').select('*').match({ type: 'BRAND', context_id: id }).single();
          if (brandChat) {
            const newPids = Array.from(new Set([...(brandChat.participant_ids || []), au.id]));
            await supabase.from('echoes').update({ participant_ids: newPids }).eq('id', brandChat.id);
          } else {
            await supabase.from('echoes').insert({
              type: 'BRAND',
              name: op.business_name,
              context_id: id,
              context_type: 'OPERATOR',
              participant_ids: [au.id],
              avatar: op.logo_url
            });
          }
        }
      }
      return !error || error.code === '23505';
    },
    unfollowOperator: async (id: string) => {
      const { data: { user: au } } = await supabase.auth.getUser();
      if (!au || !isValidUUID(id) || !isValidUUID(au.id)) return false;
      const { error } = await supabase.from('follows').delete()
        .match({ follower_id: au.id, following_id: id, type: 'operator' });
      if (!error) {
        await supabase.rpc('decrement_following', { user_id: au.id });
      }
      return !error;
    },
    getOperatorFollowStatus: async (id: string) => {
      const { data: { user: au } } = await supabase.auth.getUser();
      if (!au || !isValidUUID(id) || !isValidUUID(au.id)) return false;
      const { data } = await supabase.from('follows').select('id')
        .match({ follower_id: au.id, following_id: id, type: 'operator' }).single();
      return !!data;
    },
    redeemBooking: async (ref: string) => {
      const b = localBookings.find(bk => bk.booking_ref === ref);
      if (b) b.status = 'RECLAIMED';
      return true;
    },
    createManualBlock: async (operatorId: string, itemId: string, quantity: number, notes: string, bookingDate: string, slots: { date: string, time: string }[]) => {
      const nb = {
        id: `blk-${Date.now()}`,
        status: 'BLOCKED',
        user_id: operatorId, // Owner blocking their own slot
        operator_id: operatorId,
        item_id: itemId,
        quantity: quantity,
        total_amount: 0,
        booking_date: bookingDate,
        slot_times: slots,
        created_at: new Date().toISOString(),
        metadata: { notes },
        user: { name: 'Manual Block', username: 'operator' },
        item: { title: 'Blocked Slot' }
      };
      localBookings.unshift(nb);
      saveToStorage('be4l_local_bookings', localBookings);
      return { success: true };
    }
  },
  partner: {
    getPosts: async (operatorId?: string): Promise<import('../types').PartnerPost[]> => {
      try {
        let query = supabase.from('partner_posts').select(`*, operators(*), dibs_items(*)`);
        if (operatorId) query = query.eq('operator_id', operatorId);
        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) {
          // If table doesn't exist (404/PGRST116), throw to trigger fallback
          if (error.code === 'PGRST116' || error.message.includes('not found')) throw error;
          console.error("Partner posts fetch error:", error);
        }
        if (data && data.length > 0) return data.map((p: any) => ({
          ...p,
          operator: p.operators,
          tagged_item: p.dibs_items
        })) as any;
      } catch (e) {
        console.warn("Supabase partner_posts table might be missing, falling back to mock data.");
      }

      // Fallback to Mock + Local
      const localPosts = loadFromStorage('be4l_local_partner_posts', []);
      const mockPosts = (await import('../constants')).MOCK_PARTNER_POSTS;
      const all = [...localPosts, ...mockPosts];

      if (operatorId) {
        return all.filter(p => p.operator_id === operatorId);
      }
      return all.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    },
    createPost: async (postData: any): Promise<{ success: boolean; data?: any; error?: string }> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { success: false, error: 'Not authenticated' };

      const newPost = {
        id: `pp-${Date.now()}`,
        operator_id: postData.operator_id || user.id,
        caption: postData.caption,
        media_urls: postData.media_urls || [postData.image_url],
        tagged_item_id: postData.tagged_item_id,
        likes_count: 0,
        comments_count: 0,
        created_at: new Date().toISOString()
      };

      // Try Supabase first
      const { data, error } = await supabase.from('partner_posts').insert(newPost).select().single();

      // Always update local for immediate feedback
      const localPosts = loadFromStorage('be4l_local_partner_posts', []);
      localPosts.unshift(data || newPost);
      saveToStorage('be4l_local_partner_posts', localPosts);

      return { success: !error, data: data || newPost, error: error?.message };
    },
    likePost: async (postId: string): Promise<boolean> => {
      // Mock like for now
      return true;
    }
  },
  notifications: {
    getNotifications: async (): Promise<any[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          actor:profiles!notifications_actor_id_fkey(name, avatar_url)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      return error ? [] : data;
    },
    createNotification: async (notif: { user_id: string; type: string; title: string; content: string; target_id?: string; metadata?: any }): Promise<boolean> => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from('notifications').insert({
        ...notif,
        actor_id: user?.id
      });
      return !error;
    },
    markAsRead: async (id: string): Promise<boolean> => {
      const { error } = await supabase.from('notifications').update({ read: true }).eq('id', id);
      return !error;
    },
    markAllAsRead: async (): Promise<boolean> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;
      const { error } = await supabase.from('notifications').update({ read: true }).eq('user_id', user.id);
      return !error;
    }
  },
  search: {
    globalSearch: async (query: string) => {
      console.log("[GlobalSearch] Query:", query);
      if (!query || query.length < 2) return { quests: [], brands: [], people: [], items: [] };

      // Individual search wrappers to prevent one failure from killing the whole search
      const safeSearch = async (fn: () => Promise<any[]>, label: string) => {
        try {
          return await fn();
        } catch (e) {
          console.error(`[GlobalSearch] ${label} search failed:`, e);
          return [];
        }
      };

      const [quests, people, brands, items] = await Promise.all([
        safeSearch(() => supabaseService.quests.searchQuests(query), 'Quests'),
        safeSearch(() => supabaseService.profiles.searchUsers(query), 'People'),
        safeSearch(() => supabaseService.dibs.searchOperators(query), 'Brands'),
        safeSearch(() => supabaseService.dibs.searchItems(query), 'Items')
      ]);

      const results = {
        quests: (quests || []).slice(0, 5),
        people: (people || []).filter(p => !brands.some((b: any) => (b.user_id || b.id) === p.id)).slice(0, 5),
        brands: (brands || []).slice(0, 5),
        items: (items || []).slice(0, 5)
      };

      console.log("[GlobalSearch] Final Results:", results);
      return results;
    },
    getFeaturedContent: async () => {
      const [allBrands, allQuests, topPeople, allItems] = await Promise.all([
        supabaseService.dibs.getOperators(),
        supabaseService.quests.getQuests(),
        supabase.from('profiles').select('*').order('aura_points', { ascending: false }).limit(5),
        supabaseService.dibs.getAllItems()
      ]);

      return {
        brands: allBrands.slice(0, 6), // Top 6 brands (3 rows × 2 cols)
        quests: allQuests.slice(0, 6), // 6 Hot quests (3 rows × 2 cols)
        people: (topPeople.data || []).slice(0, 4), // Top 4 aura people
        items: allItems.slice(0, 6) // Top 6 hot items (3 rows × 2 cols)
      };
    }
  }
};

export async function addLandingPageEmail(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('landing_signups')
      .insert([{ email, source: 'landing_page' }])
      .select()

    if (error) {
      console.error('Error saving landing page email:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    console.error('Unexpected error saving email:', err)
    return { success: false, error: 'Failed to save email' }
  }
}
