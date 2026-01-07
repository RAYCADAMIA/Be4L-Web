
import { supabase } from '../utils/supabaseClient';
import { User, Capture, Quest, Message, QuestStatus } from '../types';
import { dailyService } from './dailyService';
import { MOCK_USER, MOCK_CAPTURES, MOCK_QUESTS, OTHER_USERS, POSITIVE_QUOTES } from '../constants'; // Fallback

// Keep MOCK_CHATS for now as Chat isn't migrated
export const MOCK_CHATS = [
  { id: '1', name: 'Sarah J', lastMsg: 'See you tomorrow!', time: '10:30 AM', unread: 2, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200' },
  { id: '2', name: 'Pickleball Crew', lastMsg: 'Mike joined the quest.', time: '9:15 AM', unread: 0, avatar: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=200' },
  { id: '3', name: 'Dave Climbs', lastMsg: 'Sent a photo.', time: 'Yesterday', unread: 0, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200' },
];

export const MOCK_CHAT_MESSAGES: Record<string, Message[]> = {
  '1': [
    { id: 'm1', sender_id: 'sarah_j', content: 'Hey! Are we still on for the run?', timestamp: '10:25 AM', is_me: false, type: 'text' },
    { id: 'm2', sender_id: 'me', content: 'Yes! Definitely.', timestamp: '10:28 AM', is_me: true, type: 'text' },
    { id: 'm3', sender_id: 'sarah_j', content: 'See you tomorrow!', timestamp: '10:30 AM', is_me: false, type: 'text' },
  ],
  '2': [
    { id: 'm4', sender_id: 'pickle_king', content: 'Anyone up for a game at 5?', timestamp: '8:00 AM', is_me: false, type: 'text' },
    { id: 'm5', sender_id: 'system', content: 'Quest Invite: Weekend Pickleball Smackdown', timestamp: '9:00 AM', is_me: false, type: 'quest_invite', quest_id: 'q-123' },
    { id: 'm6', sender_id: 'system', content: 'Mike joined the quest.', timestamp: '9:15 AM', is_me: false, type: 'system' }
  ],
  '3': [
    { id: 'm7', sender_id: 'dave_climbs', content: 'Look at this view!', timestamp: 'Yesterday', is_me: false, type: 'image', image_url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=600' }
  ]
};

// Local fallback for session-only persistence if DB is unreachable or auth is missing
let localCaptures: Capture[] = [];

export const supabaseService = {
  auth: {
    sendOtp: async (phone: string): Promise<{ success: boolean; error?: string }> => {
      // Format phone to E.164 (Assuming +63 based on UI)
      const formattedPhone = phone.startsWith('+') ? phone : `+63${phone}`;

      console.log(`Sending OTP to ${formattedPhone}...`);

      const { error } = await supabase.auth.signInWithOtp({ phone: formattedPhone });

      if (error) {
        console.error("❌ Supabase Auth Error:", error.message);
        // If it's a configuration issue (provider disabled), we still return success 
        // to allow the user to use the '0000' dev bypass on the next screen.
        if (error.message.includes("provider_disabled") || error.message.includes("not found")) {
          console.warn("⚠️ Phone provider not configured in Supabase. Using mock flow fallback.");
          return { success: true };
        }
        return { success: false, error: error.message };
      }

      return { success: true };
    },

    verifyOtp: async (phone: string, otp: string): Promise<{ user: User | null; error?: string }> => {
      // DEV BYPASS: If OTP is '0000' or any 4-digit code if we want to be less strict
      if (otp === '0000') {
        console.warn("🛠️ Dev Mode: Bypassing verification with '0000'");
        // We ensure we have a profile record for this mock user if possible
        return { user: MOCK_USER as User };
      }

      const formattedPhone = phone.startsWith('+') ? phone : `+63${phone}`;

      try {
        const { data, error } = await supabase.auth.verifyOtp({
          phone: formattedPhone,
          token: otp,
          type: 'sms',
        });

        if (error) {
          console.error("❌ Supabase Auth Error:", error.message);

          if (error.message.toLowerCase().includes("anonymous") || error.message.toLowerCase().includes("disabled")) {
            return {
              user: null,
              error: "Auth Service Blocked: Please enable 'Anonymous Sign-ins' and 'Phone' in your Supabase Dashboard (Authentication -> Providers)."
            };
          }

          return { user: null, error: error.message };
        }

        if (data.session && data.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (profile) return { user: { ...profile, email: data.user.email } as User };

          const newUserProfile = {
            id: data.user.id,
            username: `user_${data.user.id.slice(0, 5)}`,
            name: phone,
            avatar_url: `https://ui-avatars.com/api/?name=${phone}&background=CCFF00&color=000`,
            streak_count: 0,
          };

          await supabase.from('profiles').insert(newUserProfile);
          return { user: { ...newUserProfile, email: data.user.email } as User };
        }
      } catch (err: any) {
        console.error("❌ Verify OTP Crash:", err.message);
        return { user: null, error: "Connection Error. Try code '0000' for dev bypass." };
      }

      return { user: null, error: "Verification failed. Check the code or use '0000' for dev mode." };
    },

    checkUsernameAvailability: async (username: string): Promise<boolean> => {
      const { data } = await supabase.from('profiles').select('username').eq('username', username).single();
      return !data;
    },

    updateProfile: async (userId: string, data: Partial<User>): Promise<boolean> => {
      const { error } = await supabase.from('profiles').update(data).eq('id', userId);
      return !error;
    },

    getCurrentUser: async (): Promise<User | null> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      return profile ? { ...profile, email: user.email } as User : null;
    },
  },

  captures: {
    getFeed: async (): Promise<Capture[]> => {
      try {
        const windowStart = dailyService.getCurrentWindowStart();

        const { data, error } = await supabase
          .from('captures')
          .select(`*, user:profiles(*)`)
          .gte('created_at', windowStart.toISOString())
          .order('created_at', { ascending: false });

        const remoteData = (data || []) as Capture[];
        // Merge local captures that fall within the window
        const filteredLocal = localCaptures.filter(c => new Date(c.created_at) >= windowStart);

        // --- GENERATE MOCK POSTS FOR PULSE FEED ---
        // Dynamically create posts that fit within the current cycle window
        const mockPosts: Capture[] = [];
        const now = new Date();
        const cycleDuration = now.getTime() - windowStart.getTime();

        // Generate 15-20 posts
        const numMocks = 18;

        for (let i = 0; i < numMocks; i++) {
          // Random User
          const user = OTHER_USERS[i % OTHER_USERS.length];

          // Random Time within the CURRENT cycle
          // (windowStart) + random offset up to (now - windowStart)
          const randomOffset = Math.floor(Math.random() * cycleDuration);
          const postTime = new Date(windowStart.getTime() + randomOffset);

          // High Interaction Counts (15+)
          const reactions = Math.floor(Math.random() * 35) + 15; // 15 to 50
          const comments = Math.floor(Math.random() * 8);

          mockPosts.push({
            id: `mock-${i}-${windowStart.getTime()}`,
            user_id: user.id,
            user: user,
            front_image_url: `https://picsum.photos/150/200?random=${i * 10 + 1}`,
            back_image_url: `https://picsum.photos/400/600?random=${i * 10 + 2}`,
            location_name: ['Downtown', 'The Void', 'Cyber Cafe', 'Neon District', 'Metro Station', 'Sky Lounge'][i % 6],
            caption: POSITIVE_QUOTES[i % POSITIVE_QUOTES.length],
            created_at: postTime.toISOString(),
            privacy: 'public',
            reaction_count: reactions,
            comment_count: comments,
            reactions: [], // Ideally populate this but count shows on UI
            music_track: i % 3 === 0 ? ['Espresso', 'Birds of a Feather', 'Lunch'][i % 3] : undefined
          });
        }

        return [...filteredLocal, ...remoteData, ...mockPosts].sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      } catch (err) {
        console.error("❌ Unexpected Feed Error:", err);
        return localCaptures;
      }
    },

    getAllFeed: async (): Promise<Capture[]> => {
      // Lore Feed (All Time)
      const { data, error } = await supabase
        .from('captures')
        .select(`*, user:profiles(*)`)
        .order('created_at', { ascending: false });

      if (error) return [];
      return data as Capture[];
    },

    getVault: async (userId: string): Promise<Capture[]> => {
      const { data, error } = await supabase
        .from('captures')
        .select(`*, user:profiles(*)`)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      const remoteData = (data || []) as Capture[];
      const localData = localCaptures.filter(c => c.user_id === userId);

      return [...localData, ...remoteData].sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    },

    postCapture: async (newCapture: Capture): Promise<{ success: boolean; error?: string }> => {
      try {
        let { data: { user: authUser } } = await supabase.auth.getUser();

        if (!authUser) {
          console.warn("⚠️ No active session. Posting to Local Memory only.");
          localCaptures.unshift({
            ...newCapture,
            created_at: new Date().toISOString()
          });
          return { success: true };
        }

        // Explicitly pick ONLY columns that exist in the DB schema
        const payload = {
          user_id: authUser.id,
          front_image_url: newCapture.front_image_url,
          back_image_url: newCapture.back_image_url,
          location_name: newCapture.location_name,
          location_lat: newCapture.location_coords?.latitude,
          location_lng: newCapture.location_coords?.longitude,
          music_track: newCapture.music_track,
          music_start_time: newCapture.music_start_time,
          caption: newCapture.caption,
          privacy: newCapture.privacy || 'public'
          // REMOVED manual created_at to let DB default now() handle it accurately
        };

        console.log("🚀 Posting Capture to Supabase:", payload);

        // Insert Capture
        const { error } = await supabase.from('captures').insert(payload);

        if (error) {
          console.error("❌ Supabase Insert Error:", error.message, error.details);
          return { success: false, error: `${error.message}. ${error.details || ''}`.trim() };
        }

        console.log("✅ Capture Posted Successfully!");

        // Update Profile Stats (last_posted_date) using the DB generated time if possible
        const now = new Date().toISOString();
        await supabase.from('profiles').update({
          last_posted_date: now
        }).eq('id', authUser.id);

        return { success: true };
      } catch (err: any) {
        console.error("❌ Unexpected Post Error:", err);
        return { success: false, error: err.message || "Unknown error occurred" };
      }
    },

    updateCapture: async (id: string, data: Partial<Capture>): Promise<boolean> => {
      const { error } = await supabase.from('captures').update(data).eq('id', id);
      return !error;
    },

    deleteCapture: async (id: string): Promise<boolean> => {
      const { error } = await supabase.from('captures').delete().eq('id', id);
      return !error;
    }
  },

  quests: {
    getQuests: async (category: string = 'All'): Promise<Quest[]> => {
      let query = supabase.from('quests').select(`*, host:profiles(*)`);

      if (category !== 'All') {
        query = query.eq('category', category);
      }

      const { data, error } = await query.order('start_time', { ascending: true });
      if (error) {
        console.error("Quest Fetch Error", error);
        return [];
      }
      return data as Quest[];
    },

    getMyQuests: async (userId: string): Promise<Quest[]> => {
      // Complex query needed for "My Quests" (Created OR Joined)
      // Ignoring complicated join logic for now, implementing "Created By Me" first
      const { data, error } = await supabase
        .from('quests')
        .select(`*, host:profiles(*)`)
        .eq('created_by', userId);

      return (data as Quest[]) || [];
    },

    joinQuest: async (questId: string, user: User): Promise<boolean> => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return false;

      const { error } = await supabase.from('user_quests').insert({
        user_id: authUser.id,
        quest_id: questId,
        status: 'IN_PROGRESS'
      });
      return !error;
    },

    createQuest: async (data: Partial<Quest>): Promise<boolean> => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        console.error("No auth user for createQuest");
        return false;
      }

      // Exclude UI-only fields
      const { host, participants, ...dbData } = data as any;

      const { error } = await supabase.from('quests').insert({
        ...dbData,
        created_by: authUser.id,
        status: 'ACTIVE',
        created_at: new Date().toISOString()
      });

      if (error) console.error(error);
      return !error;
    },

    updateQuest: async (questId: string, data: Partial<Quest>): Promise<boolean> => {
      const { error } = await supabase.from('quests').update(data).eq('id', questId);
      return !error;
    },

    deleteQuest: async (questId: string): Promise<boolean> => {
      const { error } = await supabase.from('quests').delete().eq('id', questId);
      return !error;
    },

    cancelQuest: async (questId: string, reason: string): Promise<boolean> => {
      const { error } = await supabase.from('quests').update({ status: 'CANCELLED', description: `[CANCELLED: ${reason}]` }).eq('id', questId);
      return !error;
    },

    kickParticipant: async (questId: string, userId: string): Promise<boolean> => {
      // Need to delete from user_quests
      const { error } = await supabase.from('user_quests').delete().match({ quest_id: questId, user_id: userId });
      return !error;
    },

    toggleReadyStatus: async (questId: string, userId: string): Promise<boolean> => {
      // Mock impl for now as schema support for 'ready' needs update
      return true;
    },

    proceedToQuest: async (questId: string): Promise<boolean> => {
      const { error } = await supabase.from('quests').update({ status: 'IN_PROGRESS' }).eq('id', questId);
      return !error;
    },
  },

  chat: {
    // Kept as Mock for Phase 3
    getChats: async (): Promise<any[]> => {
      return MOCK_CHATS;
    },
    getMessages: async (chatId: string): Promise<Message[]> => {
      return MOCK_CHAT_MESSAGES[chatId] || [];
    },
    sendMessage: async (chatId: string, content: string, type: 'text' | 'image' | 'quest_invite' = 'text', additionalData?: any): Promise<Message> => {
      const newMessage: Message = {
        id: Math.random().toString(),
        sender_id: 'me', // Generic 'me' for mock
        content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        is_me: true,
        type,
        ...additionalData
      };
      if (!MOCK_CHAT_MESSAGES[chatId]) MOCK_CHAT_MESSAGES[chatId] = [];
      MOCK_CHAT_MESSAGES[chatId].push(newMessage);
      return newMessage;
    }
  }
};
