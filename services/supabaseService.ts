
import { supabase } from '../utils/supabaseClient';
import { User, Capture, Quest, Message, QuestStatus, QuestType, QuestParticipantStatus } from '../types';
import { dailyService } from './dailyService';
import { MOCK_USER, MOCK_CAPTURES, MOCK_QUESTS, OTHER_USERS, POSITIVE_QUOTES } from '../constants';

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
    const newAuraScore = (profile.aura?.score || profile.reliability_score || 0) + auraAmount;
    const newAura = { ...profile.aura, score: newAuraScore, last_updated_at: new Date().toISOString() };
    const { error } = await supabase.from('profiles').update({ life_exp: newExp, level: newLevel, aura: newAura, reliability_score: newAuraScore }).eq('id', userId);
    return !error;
  } catch (e) { return false; }
};

export const MOCK_CHATS = [
  { id: '1', type: 'personal', name: 'Sarah J', lastMsg: 'See you tomorrow!', time: '10:30 AM', unread: 2, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200' },
  { id: '2', type: 'personal', name: 'Mike Ross', lastMsg: 'Did you see the game?', time: '9:45 AM', unread: 0, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200' },
  { id: '3', type: 'personal', name: 'Chloe Kim', lastMsg: 'The photos look insane!', time: 'Yesterday', unread: 0, avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200' },
  { id: '4', type: 'group', name: 'Davao Pickleball Squad', lastMsg: 'Alex: Who is bringing the balls?', time: 'Yesterday', unread: 12, avatar: 'https://images.unsplash.com/photo-1599586120429-48281b6f0ece?auto=format&fit=crop&q=80&w=200' },
  { id: '5', type: 'personal', name: 'Marcus', lastMsg: 'Just reached the summit!', time: 'Monday', unread: 0, avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200' },
  { id: '6', type: 'personal', name: 'Elena', lastMsg: 'Check out this lore capture.', time: 'Monday', unread: 0, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200' },
  { id: 'lobby_q1', type: 'lobby', context_type: 'QUEST', name: 'Sunset Bouldering', lastMsg: 'Dave: Who has extra chalk?', time: '9:15 AM', unread: 5, avatar: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=200' },
  { id: 'lobby_q2', type: 'lobby', context_type: 'QUEST', name: 'Midnight Run - Roxas', lastMsg: 'Syncing pulses...', time: 'Live', unread: 0, avatar: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&q=80&w=200' },
  { id: 'lobby_q3', type: 'lobby', context_type: 'QUEST', name: 'Cafe Matcha Hunt', lastMsg: 'Jen: Found the hidden spot!', time: '2:30 PM', unread: 1, avatar: 'https://images.unsplash.com/photo-1541167760496-162955ed8a9f?auto=format&fit=crop&q=80&w=200' },
  { id: '10', type: 'personal', name: 'Sam Rivera', lastMsg: 'Let me know when you arrive.', time: '11:20 AM', unread: 0, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200' },
  { id: '11', type: 'personal', name: 'Jade', lastMsg: 'Can we move the meetup?', time: 'Yesterday', unread: 0, avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200' },
  { id: '12', type: 'group', name: 'Street Food Hunters', lastMsg: 'Isaw is life guys.', time: 'Sat', unread: 0, avatar: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=200' },
  { id: '13', type: 'personal', name: 'Professor X', lastMsg: 'The simulation is ready.', time: 'Fri', unread: 0, avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200' }
];

const localMockMessages: Record<string, Message[]> = {
  '1': [
    { id: 'm1', echo_id: '1', sender_id: 'sarah_j', content: 'Hey! Are we still on for the run?', timestamp: '10:25 AM', created_at: '2025-12-31T10:25:00Z', is_me: false, type: 'text', content_type: 'text' },
    { id: 'm2', echo_id: '1', sender_id: 'me', content: 'Yes! Definitely.', timestamp: '10:28 AM', created_at: '2025-12-31T10:28:00Z', is_me: true, type: 'text', content_type: 'text' }
  ],
  '2': [
    { id: 'm3', echo_id: '2', sender_id: 'mike', content: 'Did you see the game last night?', timestamp: '9:40 AM', created_at: '2025-12-31T09:40:00Z', is_me: false, type: 'text', content_type: 'text' },
    { id: 'm4', echo_id: '2', sender_id: 'me', content: 'Yeah, that buzzer beater was insane!!', timestamp: '9:45 AM', created_at: '2025-12-31T09:45:00Z', is_me: true, type: 'text', content_type: 'text' }
  ],
  'lobby_q1': [
    { id: 'm5', echo_id: 'lobby_q1', sender_id: 'dave', content: 'Who has extra chalk?', timestamp: '9:10 AM', created_at: '2025-12-31T09:10:00Z', is_me: false, type: 'text', content_type: 'text' },
    { id: 'm6', echo_id: 'lobby_q1', sender_id: 'sarah', content: 'I have some in my bag. See you at the wall!', timestamp: '9:12 AM', created_at: '2025-12-31T09:12:00Z', is_me: false, type: 'text', content_type: 'text' },
    { id: 'm7', echo_id: 'lobby_q1', sender_id: 'me', content: 'On my way!', timestamp: '9:15 AM', created_at: '2025-12-31T09:15:00Z', is_me: true, type: 'text', content_type: 'text' }
  ],
  '4': [
    { id: 'm8', echo_id: '4', sender_id: 'alex', content: 'Who is bringing the balls?', timestamp: 'Yesterday', created_at: '2025-12-30T10:00:00Z', is_me: false, type: 'text', content_type: 'text' },
    { id: 'm9', echo_id: '4', sender_id: 'chris', content: 'I got 4 new ones.', timestamp: 'Yesterday', created_at: '2025-12-30T10:05:00Z', is_me: false, type: 'text', content_type: 'text' }
  ]
};

// Helper for local persistence in mock mode
const loadFromStorage = (key: string, defaultValue: any[]) => {
  if (typeof window === 'undefined') return defaultValue;
  const saved = localStorage.getItem(key);
  try {
    return saved ? JSON.parse(saved) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
};

const saveToStorage = (key: string, value: any[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

let localCaptures: Capture[] = loadFromStorage('be4l_local_captures', []);
let localBookings: any[] = loadFromStorage('be4l_local_bookings', []);
let localItems: any[] = loadFromStorage('be4l_local_items', []);

export const supabaseService = {
  auth: {
    sendOtp: async (phone: string): Promise<{ success: boolean; error?: string }> => {
      const cleanPhone = phone.replace(/\D/g, '');
      const formattedPhone = phone.startsWith('+') ? phone : `+63${cleanPhone}`;
      const { error } = await supabase.auth.signInWithOtp({ phone: formattedPhone });
      if (error && (error.message.includes("provider_disabled") || error.message.includes("not found"))) return { success: true };
      return error ? { success: false, error: error.message } : { success: true };
    },
    verifyOtp: async (phone: string, otp: string): Promise<{ user: User | null; error?: string }> => {
      if (otp.trim() === '0000') return { user: MOCK_USER as User };
      const formattedPhone = phone.startsWith('+') ? phone : `+63${phone.replace(/\D/g, '')}`;
      const { data, error } = await supabase.auth.verifyOtp({ phone: formattedPhone, token: otp.trim(), type: 'sms' });
      if (error) return { user: null, error: error.message };
      if (data.user) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
        if (profile) return { user: { ...profile, email: data.user.email } as User };
        const newUser: any = { id: data.user.id, username: `user_${data.user.id.slice(0, 5)}`, name: phone, avatar_url: `https://ui-avatars.com/api/?name=${phone}`, streak_count: 0, aura: { score: 1000, trend: 0, last_updated_at: new Date().toISOString() }, reliability_score: 1000, life_exp: 0, level: 1, life_streak: 0, bio: 'Joined Be4L!' };
        await supabase.from('profiles').insert(newUser);
        return { user: { ...newUser, email: data.user.email } as User };
      }
      return { user: null, error: "Verification failed." };
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
      if (!profile) return null;
      const synced = await syncStreak(profile);
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
    signOut: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    }
  },
  profiles: {
    getProfile: async (id: string) => {
      if (!isValidUUID(id)) return { data: null };
      const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
      return { data, error };
    },
    computeDisplayStreak,
    syncStreak,
    followUser: async (f: string, t: string) => {
      const { error } = await supabase.from('follows').insert({ follower_id: f, following_id: t });
      if (!error) { await supabase.rpc('increment_following', { user_id: f }); await supabase.rpc('increment_followers', { user_id: t }); return true; }
      return error.code === '23505';
    },
    unfollowUser: async (f: string, t: string) => {
      const { error } = await supabase.from('follows').delete().match({ follower_id: f, following_id: t });
      if (!error) { await supabase.rpc('decrement_following', { user_id: f }); await supabase.rpc('decrement_followers', { user_id: t }); return true; }
      return false;
    },
    getFollowStatus: async (f: string, t: string) => {
      const { data } = await supabase.from('follows').select('*').match({ follower_id: f, following_id: t }).single();
      return !!data;
    },
    awardQuestRewards: awardQuestRewardsImpl,
    updateUserAura: async (uid: string, d: number) => awardQuestRewardsImpl(uid, d, 0)
  },
  captures: {
    getFeed: async (type: 'discover' | 'friends' = 'discover', uid?: string): Promise<Capture[]> => {
      try {
        const { data: { user: au } } = await supabase.auth.getUser();
        const cid = uid || au?.id || MOCK_USER.id;
        const ws = dailyService.getCurrentWindowStart();
        const { data } = await supabase.from('captures').select(`*, user:profiles(*), quest:quests(*)`).gte('created_at', ws.toISOString());
        let all = [...((data || []) as Capture[]), ...localCaptures].filter(c => new Date(c.captured_at || c.created_at) >= ws);
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
        const filtered = all.filter(c => {
          if (c.visibility === 'private' && c.user_id !== cid) return false;
          if (type === 'discover') return c.visibility === 'public';
          return true;
        });
        return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      } catch (e) { return localCaptures; }
    },
    getVault: async (uid: string) => {
      if (!isValidUUID(uid)) return localCaptures.filter(c => c.user_id === uid);
      const { data } = await supabase.from('captures').select(`*, user:profiles(*)`).eq('user_id', uid).order('created_at', { ascending: false });
      return (data || []) as Capture[];
    },
    getRecallCaptures: async (uid: string) => supabaseService.captures.getVault(uid),
    getFriendIds: async (uid: string) => ['u2', 'u3', 'u4'],
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
    getQuestById: async (id: string) => {
      if (!isValidUUID(id)) return { data: null };
      const { data, error } = await supabase.from('quests').select(`*, host:profiles!host_id(*)`).eq('id', id).single();
      if (data) {
        return { data: { ...data, mode: data.type, capacity: data.max_participants } };
      }
      return { data: null, error };
    },
    getQuests: async (cat: string = 'All') => {
      let q = supabase.from('quests').select(`*, host:profiles!host_id(*)`).eq('status', QuestStatus.DISCOVERABLE);
      if (cat !== 'All') q = q.eq('category', cat);
      const { data } = await q.order('start_time', { ascending: true });
      return (data || []).map((i: any) => ({ ...i, mode: i.type, capacity: i.max_participants }));
    },
    getMyQuests: async (uid: string) => {
      const { data } = await supabase.from('quests').select(`*, host:profiles(*)`).eq('host_id', uid);
      return (data || []).map((i: any) => ({ ...i, mode: i.type, capacity: i.max_participants }));
    },
    requestToJoin: async (qid: string, uid?: string, approval: boolean = true) => {
      const { data: { user: au } } = await supabase.auth.getUser();
      const id = uid || au?.id;
      if (!id || !isValidUUID(qid) || !isValidUUID(id)) return true;
      const { error } = await supabase.from('user_quests').insert({ user_id: id, quest_id: qid, status: approval ? QuestParticipantStatus.REQUESTED : QuestParticipantStatus.ACCEPTED });
      return !error;
    },
    async getOrCreateSquadChat(qid: string, name: string, pids: string[]) {
      return supabaseService.chat.getOrCreateQuestLobby(qid, name, pids);
    },
    createQuest: async (d: any) => {
      const { data: { user: au } } = await supabase.auth.getUser();
      const hid = au?.id || d.host_id;
      if (!hid) return { success: false };
      const { data: nq, error } = await supabase.from('quests').insert({ ...d, host_id: hid, created_by: hid, status: QuestStatus.DISCOVERABLE }).select().single();
      if (nq) await supabase.from('echoes').insert({ type: 'lobby', context_type: 'QUEST', context_id: nq.id, name: nq.title, participant_ids: [hid] });
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
      const { data } = await supabase.from('echoes').select('*').contains('participant_ids', [id]).order('created_at', { ascending: false });
      return (data || []).map((e: any) => ({ id: e.id, type: e.type, name: e.name || 'Chat', lastMsg: 'Tap to view', time: new Date(e.created_at).toLocaleTimeString() }));
    },
    async getOrCreateQuestLobby(qid: string, name: string, pids: string[]) {
      if (!isValidUUID(qid)) return { id: `lobby-${qid}`, name: `LOBBY: ${name}` };
      const { data } = await supabase.from('echoes').select('*').match({ type: 'lobby', context_id: qid }).single();
      if (data) return { id: data.id, name: data.name };
      const { data: ne } = await supabase.from('echoes').insert({ type: 'lobby', context_id: qid, context_type: 'QUEST', participant_ids: pids, name }).select().single();
      return ne ? { id: ne.id, name: ne.name } : null;
    },
    getOrCreatePersonalChat: async (a: string, b: string, n: string) => {
      if (!isValidUUID(a) || !isValidUUID(b)) return { id: `m-${a}-${b}`, name: n };
      const { data } = await supabase.from('echoes').select('*').eq('type', 'personal').contains('participant_ids', [a, b]);
      if (data?.[0]) return { id: data[0].id, name: n };
      const { data: ne } = await supabase.from('echoes').insert({ type: 'personal', participant_ids: [a, b], name: n }).select().single();
      return ne ? { id: ne.id, name: n } : null;
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
        return newMsg;
      }
      if (!au) return null;
      const { data } = await supabase.from('echo_messages').insert({ echo_id: id, sender_id: au.id, content: c, type: t, ...p }).select().single();
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
    getOperators: async (): Promise<any[]> => {
      try {
        const { data } = await supabase.from('operators').select('*');
        if (data && data.length > 0) return data;
      } catch (e) { }
      const ALL_STATIC = [
        { user_id: 'op1', business_name: 'Downtown Pickleball', slug: 'downtown-pb', category: 'venue', cover_photo_url: 'https://images.unsplash.com/photo-1626245550578-8ae7f6368d49?auto=format&fit=crop&q=80&w=1000', logo_url: 'https://ui-avatars.com/api/?name=Downtown+PB&background=random', bio: 'Premier courts in the heart of the city.', location_text: 'Obrero, Davao City', gcash_name: 'Downtown PB Inc', gcash_number: '0917-123-4567', followers_count: 1250, is_verified: true, rating: 4.9 },
        { user_id: 'op2', business_name: 'Neon Nights Run Club', slug: 'neon-run', category: 'event', cover_photo_url: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&q=60&w=800', logo_url: 'https://ui-avatars.com/api/?name=Neon+Run', bio: 'Davao largest community run.', location_text: 'Coastal Road', gcash_name: 'Neon Events', gcash_number: '0918-987-6543', followers_count: 890, is_verified: true, rating: 4.7 },
        { user_id: 'op3', business_name: 'Smasher Sports Center', slug: 'smasher-sports', category: 'competition', cover_photo_url: 'https://images.unsplash.com/photo-1541250848049-b4f71413cc30?auto=format&fit=crop&q=60&w=800', logo_url: 'https://ui-avatars.com/api/?name=Smasher+Sports', bio: 'The hub for elite competitions.', location_text: 'San Jose, Davao City', gcash_name: 'Smasher Corp', gcash_number: '0919-000-1111', followers_count: 3200, is_verified: true, rating: 4.8 },
        { user_id: 'op4', business_name: 'The Matcha Club', slug: 'matcha-club', category: 'food', cover_photo_url: 'https://images.unsplash.com/photo-1515442261905-ccfbdccd1741?auto=format&fit=crop&q=60&w=800', logo_url: 'https://ui-avatars.com/api/?name=Matcha+Club', bio: 'Refuel after the grind.', location_text: 'Jacinto St, Davao City', gcash_name: 'Matcha Club', gcash_number: '0920-222-3333', followers_count: 540, is_verified: true, rating: 4.9 },
        { user_id: 'op5', business_name: 'Peak Performance Gym', slug: 'peak-performance', category: 'venue', cover_photo_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=1000', logo_url: 'https://ui-avatars.com/api/?name=Peak+Gym', bio: 'Modern training facility with premium equipment.', location_text: 'Lanang, Davao City', gcash_name: 'Peak Gym Ph', gcash_number: '0917-555-0001', followers_count: 2100, is_verified: true, rating: 4.8 },
        { user_id: 'op6', business_name: 'Coastal Padel Club', slug: 'coastal-padel', category: 'venue', cover_photo_url: 'https://images.unsplash.com/photo-1626245550578-8ae7f6368d49?auto=format&fit=crop&q=80&w=1000', logo_url: 'https://ui-avatars.com/api/?name=Coastal+Padel', bio: 'Davao\'s first dedicated padel courts.', location_text: 'Davao Global Township', gcash_name: 'CPAD Davao', gcash_number: '0918-444-1111', followers_count: 1560, is_verified: true, rating: 4.9 },
        { user_id: 'op7', business_name: 'The Coffee Collective', slug: 'coffee-collective', category: 'food', cover_photo_url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=1000', logo_url: 'https://ui-avatars.com/api/?name=Coffee+Coll', bio: 'Artisanal coffee and community workspace.', location_text: 'Bangkal, Davao City', gcash_name: 'COCO Davao', gcash_number: '0919-777-8888', followers_count: 1200, is_verified: true, rating: 4.7 },
        { user_id: 'op8', business_name: 'Davao E-Sports Arena', slug: 'davao-esports', category: 'competition', cover_photo_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1000', logo_url: 'https://ui-avatars.com/api/?name=DVO+ESports', bio: 'Top-tier gaming setups and regular tournaments.', location_text: 'Torres St, Davao City', gcash_name: 'DVO E-Sports', gcash_number: '0920-555-6666', followers_count: 4500, is_verified: true, rating: 4.6 },
        { user_id: 'op9', business_name: 'Zenith Yoga Studio', slug: 'zenith-yoga', category: 'venue', cover_photo_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=1000', logo_url: 'https://ui-avatars.com/api/?name=Zenith+Yoga', bio: 'Clarity, strength, and mindfulness.', location_text: 'Buhangin, Davao City', gcash_name: 'Zenith Studio', gcash_number: '0921-888-9999', followers_count: 820, is_verified: true, rating: 5.0 },
        { user_id: 'op10', business_name: 'The Burger Joint', slug: 'burger-joint', category: 'food', cover_photo_url: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&q=80&w=1000', logo_url: 'https://ui-avatars.com/api/?name=Burger+Joint', bio: 'Juicy patties and house-made sauces.', location_text: 'Damosa Complex', gcash_name: 'TBJ Davao', gcash_number: '0922-111-2222', followers_count: 1800, is_verified: true, rating: 4.5 },
        { user_id: 'op11', business_name: 'Ultimate Frisbee League', slug: 'dvo-ultimate', category: 'event', cover_photo_url: 'https://images.unsplash.com/photo-1551815155-2766ec07c744?auto=format&fit=crop&q=80&w=1000', logo_url: 'https://ui-avatars.com/api/?name=DVO+Ultimate', bio: 'Join the fastest growing field sport.', location_text: 'Tionko Football Field', gcash_name: 'DVO Ultimate', gcash_number: '0923-333-4444', followers_count: 670, is_verified: true, rating: 4.8 },
        { user_id: 'op12', business_name: 'Aura Wellness', slug: 'aura-wellness', category: 'venue', cover_photo_url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=1000', logo_url: 'https://ui-avatars.com/api/?name=Aura+Well', bio: 'Holistic health and spa treatments.', location_text: 'Azuela Cove', gcash_name: 'Aura Spa Inc', gcash_number: '0924-555-6666', followers_count: 940, is_verified: true, rating: 4.9 }
      ];

      // Dynamically add operators from localItems who aren't in the static list
      const localOpIds = [...new Set(localItems.map(i => i.operator_id))];
      const dynamicOps = localOpIds
        .filter(oid => !ALL_STATIC.some(s => s.user_id === oid))
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

      return [...ALL_STATIC, ...dynamicOps];
    },
    getOperatorBySlug: async (slug: string) => {
      const ops = await supabaseService.dibs.getOperators();
      const op = ops.find(o => o.slug === slug);
      if (!op) return null;
      return { ...op, owner: { id: op.user_id, name: op.business_name, avatar_url: op.logo_url }, gallery: [{ photo_url: op.cover_photo_url }] };
    },
    getAllItems: async (): Promise<any[]> => {
      try {
        const { data } = await supabase.from('dibs_items').select('*');
        if (data && data.length > 0) return data;
      } catch (e) { }

      const STATIC_ITEMS = [
        { id: 'i1', operator_id: 'op1', title: 'Court Rental', description: 'Full access to standard court.', price: 200, category: 'Court', image_url: 'https://images.unsplash.com/photo-1626245550578-8ae7f6368d49', images: ['https://images.unsplash.com/photo-1626245550578-8ae7f6368d49', 'https://images.unsplash.com/photo-1599586120429-48281b6f0ece', 'https://images.unsplash.com/photo-1541250848049-b4f71413cc30'], unit_label: 'hour', type: 'PLACE', available_slots: 2, opening_time: '06:00', closing_time: '23:00', slot_duration: 60, resources: [{ id: 'c1', name: 'Court 1' }, { id: 'c2', name: 'Court 2' }], is_active: true },
        { id: 'i2', operator_id: 'op2', title: 'Neon Night Run', description: 'Join the city\'s biggest night run!', price: 150, category: 'Event', image_url: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8', images: ['https://images.unsplash.com/photo-1476480862126-209bfaa8edc8', 'https://images.unsplash.com/photo-1551815155-2766ec07c744'], unit_label: 'ticket', type: 'EVENT', event_date: '2025-12-15T20:00:00', event_location: 'Coastal Road', tiers: [{ id: 't1', name: 'Standard', price: 150, capacity: 100, available: 45 }], is_active: true },
        { id: 'i3', operator_id: 'op3', title: 'Davao Open 2025', description: 'The ultimate pickleball tournament.', price: 500, category: 'Competition', image_url: 'https://images.unsplash.com/photo-1541250848049-b4f71413cc30', unit_label: 'entry', type: 'EVENT', event_date: '2025-11-20T08:00:00', event_location: 'Smasher Sports Center', tiers: [{ id: 't1', name: 'Open Category', price: 500, capacity: 64, available: 12 }], is_active: true },
        { id: 'i4', operator_id: 'op5', title: 'Gym Day Pass', description: 'Unrestricted access to all equipment.', price: 350, category: 'Gym', image_url: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&q=80&w=800', unit_label: 'day', type: 'PLACE', is_active: true },
        { id: 'i5', operator_id: 'op6', title: 'Match Slot (90m)', description: 'Reserve a glass-walled padel court.', price: 1200, category: 'Padel', image_url: 'https://images.unsplash.com/photo-1626245550578-8ae7f6368d49', unit_label: 'slot', type: 'PLACE', is_active: true },
        { id: 'i6', operator_id: 'op8', title: 'Valorant Cup DVO', description: 'Official regional qualifying match.', price: 200, category: 'Gaming', image_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e', unit_label: 'entry', type: 'EVENT', event_location: 'DVO E-Sports Arena', is_active: true },
        { id: 'i7', operator_id: 'op4', title: 'Ceremonial Matcha', description: 'Whisped to perfection by artisans.', price: 185, category: 'Cafe', image_url: 'https://images.unsplash.com/photo-1515442261905-ccfbdccd1741', unit_label: 'serv', type: 'PLACE', is_active: true },
        { id: 'i8', operator_id: 'op7', title: 'Cold Brew Flight', description: 'Sample 3 of our signature origins.', price: 280, category: 'Cafe', image_url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085', unit_label: 'flight', type: 'PLACE', is_active: true },
        { id: 'i9', operator_id: 'op9', title: 'Morning Flow', description: 'Gentle vinyasa for all skill levels.', price: 300, category: 'Wellness', image_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b', unit_label: 'session', type: 'PLACE', is_active: true },
        { id: 'i10', operator_id: 'op10', title: 'Truffle Umami Burger', description: 'Wagyu beef with truffle aioli.', price: 420, category: 'Food', image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd', unit_label: 'order', type: 'PLACE', is_active: true },
        { id: 'i11', operator_id: 'op11', title: 'League Summer Pass', description: 'All-inclusive season access.', price: 800, category: 'Sports', image_url: 'https://images.unsplash.com/photo-1551815155-2766ec07c744', unit_label: 'season', type: 'EVENT', is_active: true },
        { id: 'i12', operator_id: 'op12', title: 'Deep Tissue Relief', description: '60 minutes of intensive recovery.', price: 950, category: 'Wellness', image_url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef', unit_label: 'session', type: 'PLACE', is_active: true },
        { id: 'i13', operator_id: 'op1', title: 'VIP Court Lounge', description: 'Private lounge access with refreshments.', price: 1500, category: 'Luxury', image_url: 'https://images.unsplash.com/photo-1571260899304-425eee4c7efc', images: ['https://images.unsplash.com/photo-1571260899304-425eee4c7efc', 'https://images.unsplash.com/photo-1509042239860-f550ce710b93'], unit_label: 'hour', type: 'PLACE', is_active: true }
      ];

      return [...STATIC_ITEMS, ...localItems];
    },
    getItems: async (operatorId: string): Promise<any[]> => {
      try {
        const { data } = await supabase.from('dibs_items').select('*').eq('operator_id', operatorId);
        if (data && data.length > 0) return data;
      } catch (e) { }
      const ALL_ITEMS = [
        {
          id: 'i1',
          operator_id: 'op1',
          title: 'Court Rental',
          description: 'Full access to standard court. Select your preferred court below.',
          price: 200,
          category: 'Court',
          image_url: 'https://images.unsplash.com/photo-1626245550578-8ae7f6368d49',
          unit_label: 'hour',
          type: 'PLACE',
          available_slots: 2,
          opening_time: '06:00',
          closing_time: '23:00',
          slot_duration: 60,
          resources: [
            { id: 'c1', name: 'Court 1' },
            { id: 'c2', name: 'Court 2' }
          ],
          is_active: true
        },
        {
          id: 'i3',
          operator_id: 'op2',
          title: 'Neon Night Run',
          description: 'Join the city\'s biggest night run event! Music, lights, and running.',
          price: 150,
          category: 'Event',
          image_url: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8',
          unit_label: 'ticket',
          type: 'EVENT',
          event_date: '2025-12-15T20:00:00',
          event_location: 'Coastal Road, Davao City',
          tiers: [
            { id: 't1', name: 'Early Bird', price: 150, perks: ['Race Bib', 'Glow Stick'], capacity: 100, available: 45 },
            { id: 't2', name: 'Standard', price: 250, perks: ['Race Bib', 'Shirt', 'Medal'], capacity: 200, available: 150 },
            { id: 't3', name: 'VIP', price: 500, perks: ['All Access', 'VIP Lounge', 'Priority Start'], capacity: 50, available: 10 }
          ],
          is_active: true
        }
      ];
      const items = [...ALL_ITEMS.filter(i => i.operator_id === operatorId), ...localItems.filter(i => i.operator_id === operatorId)];
      return items;
    },
    addItem: async (data: any) => {
      const newItem = { id: `item-${Date.now()}`, is_active: true, created_at: new Date().toISOString(), ...data };
      localItems.push(newItem);
      saveToStorage('be4l_local_items', localItems);
      return { success: true, item: newItem };
    },
    updateItem: async (id: string, data: any) => {
      const idx = localItems.findIndex(i => i.id === id);
      if (idx !== -1) {
        localItems[idx] = { ...localItems[idx], ...data };
        saveToStorage('be4l_local_items', localItems);
        return { success: true };
      }
      return { success: false };
    },
    deleteItem: async (id: string) => {
      localItems = localItems.filter(i => i.id !== id);
      saveToStorage('be4l_local_items', localItems);
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
      await new Promise(r => setTimeout(r, 2000));
      return { verified: true, confidence: 0.95, extracted_ref: `REF-${Math.floor(Math.random() * 1000000)}` };
    },
    getOperatorBookings: async (operatorId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      const oid = operatorId || user?.id || 'op1';
      return [...localBookings.filter(b => b.operator_id === oid), { id: 'b1', item_id: 'i1', user_id: 'u2', status: 'PENDING_VERIFICATION', quantity: 1, total_amount: 350, created_at: new Date().toISOString(), user: { name: 'Sarah J' }, item: { title: 'Court Rental' }, booking_ref: 'DIB-9XJ2' }];
    },
    updateBookingStatus: async (id: string, s: string) => true,
    followOperator: async (id: string) => true,
    unfollowOperator: async (id: string) => true,
    redeemBooking: async (ref: string) => {
      const b = localBookings.find(bk => bk.booking_ref === ref);
      if (b) b.status = 'RECLAIMED';
      return true;
    }
  }
};
