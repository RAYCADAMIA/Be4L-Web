
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
  { id: '1', type: 'personal', name: 'Sarah Cameron', lastMsg: 'See you at the Wreck?', time: '10:30 AM', unread: 2, avatar: 'https://tse2.mm.bing.net/th?q=Madelyn%20Cline%20Headshot&w=500&h=500&c=7' },
  { id: '2', type: 'personal', name: 'John B. Routledge', lastMsg: 'I found something in the marsh.', time: '9:45 AM', unread: 0, avatar: 'https://tse2.mm.bing.net/th?q=Chase%20Stokes%20Headshot&w=500&h=500&c=7' },
  { id: '3', type: 'personal', name: 'JJ Maybank', lastMsg: 'Bad idea? Probably.', time: 'Yesterday', unread: 0, avatar: 'https://tse2.mm.bing.net/th?q=Rudy%20Pankow%20Headshot&w=500&h=500&c=7' },
  { id: '4', type: 'group', name: 'The Pogues', lastMsg: 'Pope: We need a plan.', time: 'Yesterday', unread: 12, avatar: 'https://tse2.mm.bing.net/th?q=Outer%20Banks%20Cast%20Group&w=500&h=500&c=7' },
  { id: '5', type: 'personal', name: 'Kiara', lastMsg: 'Save the turtles! 🐢', time: 'Monday', unread: 0, avatar: 'https://tse2.mm.bing.net/th?q=Madison%20Bailey%20Headshot&w=500&h=500&c=7' },
  { id: '6', type: 'personal', name: 'Pope Heyward', lastMsg: 'Statistically speaking...', time: 'Monday', unread: 0, avatar: 'https://tse2.mm.bing.net/th?q=Jonathan%20Daviss%20Headshot&w=500&h=500&c=7' },
  { id: 'lobby_q1', type: 'lobby', context_type: 'QUEST', name: 'Treasure Hunt', lastMsg: 'John B: X marks the spot.', time: '9:15 AM', unread: 5, avatar: 'https://tse2.mm.bing.net/th?q=Outer%20Banks%20Map&w=500&h=500&c=7' },
  { id: 'lobby_q2', type: 'lobby', context_type: 'QUEST', name: 'Midsummer Party', lastMsg: 'Rafe: Who invited them?', time: 'Live', unread: 0, avatar: 'https://tse2.mm.bing.net/th?q=Outer%20Banks%20Party&w=500&h=500&c=7' },
  { id: 'lobby_q3', type: 'lobby', context_type: 'QUEST', name: 'Surf Competition', lastMsg: 'JJ: I am gonna win this.', time: '2:30 PM', unread: 1, avatar: 'https://tse2.mm.bing.net/th?q=Outer%20Banks%20Surfing&w=500&h=500&c=7' },
  { id: '10', type: 'personal', name: 'Rafe Cameron', lastMsg: 'Stay out of my way.', time: '11:20 AM', unread: 0, avatar: 'https://tse2.mm.bing.net/th?q=Drew%20Starkey%20Headshot&w=500&h=500&c=7' },
  { id: '11', type: 'personal', name: 'Cleo', lastMsg: 'Watch your back.', time: 'Yesterday', unread: 0, avatar: 'https://tse2.mm.bing.net/th?q=Carlacia%20Grant%20Headshot&w=500&h=500&c=7' },
  { id: '12', type: 'personal', name: 'Topper', lastMsg: 'Have you seen Sarah?', time: 'Sat', unread: 0, avatar: 'https://tse2.mm.bing.net/th?q=Austin%20North%20Headshot&w=500&h=500&c=7' },
  { id: '13', type: 'personal', name: 'Barry (Peeler)', lastMsg: 'Money first.', time: 'Fri', unread: 0, avatar: 'https://tse2.mm.bing.net/th?q=Nicholas%20Cirillo%20Headshot&w=500&h=500&c=7' }
];

const localMockMessages: Record<string, Message[]> = {
  '1': [
    { id: 'm1', echo_id: '1', sender_id: 'sarah_c', content: 'Hey! Are we going to the Wreck later?', timestamp: '10:25 AM', created_at: '2025-12-31T10:25:00Z', is_me: false, type: 'text', content_type: 'text' },
    { id: 'm2', echo_id: '1', sender_id: 'me', content: 'Yeah, I will meet you there.', timestamp: '10:28 AM', created_at: '2025-12-31T10:28:00Z', is_me: true, type: 'text', content_type: 'text' }
  ],
  '2': [
    { id: 'm3', echo_id: '2', sender_id: 'john_b', content: 'Did you see the Royal Merchant manifest?', timestamp: '9:40 AM', created_at: '2025-12-31T09:40:00Z', is_me: false, type: 'text', content_type: 'text' },
    { id: 'm4', echo_id: '2', sender_id: 'me', content: 'That is insane!!', timestamp: '9:45 AM', created_at: '2025-12-31T09:45:00Z', is_me: true, type: 'text', content_type: 'text' }
  ],
  'lobby_q1': [
    { id: 'm5', echo_id: 'lobby_q1', sender_id: 'john_b', content: 'X marks the spot.', timestamp: '9:10 AM', created_at: '2025-12-31T09:10:00Z', is_me: false, type: 'text', content_type: 'text' },
    { id: 'm6', echo_id: 'lobby_q1', sender_id: 'pope', content: 'We need to be careful.', timestamp: '9:12 AM', created_at: '2025-12-31T09:12:00Z', is_me: false, type: 'text', content_type: 'text' },
    { id: 'm7', echo_id: 'lobby_q1', sender_id: 'me', content: 'I am ready.', timestamp: '9:15 AM', created_at: '2025-12-31T09:15:00Z', is_me: true, type: 'text', content_type: 'text' }
  ],
  '4': [
    { id: 'm8', echo_id: '4', sender_id: 'pope', content: 'We need a plan.', timestamp: 'Yesterday', created_at: '2025-12-30T10:00:00Z', is_me: false, type: 'text', content_type: 'text' },
    { id: 'm9', echo_id: '4', sender_id: 'jj', content: 'I say we just go for it.', timestamp: 'Yesterday', created_at: '2025-12-30T10:05:00Z', is_me: false, type: 'text', content_type: 'text' }
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
      // Clean up phone format
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
        { user_id: 'op1', business_name: '&Friends', slug: 'and-friends', category: 'event', cover_photo_url: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=1000', logo_url: '/brands/and_friends.png', bio: 'Lifestyle & Events. Spreading vibes across Manila & Davao.', location_text: 'Manila / Davao', gcash_name: 'And Friends Inc', gcash_number: '0917-111-2222', followers_count: 5400, is_verified: true, rating: 5.0 },
        { user_id: 'op2', business_name: 'SuperSmasher', slug: 'supersmasher', category: 'venue', cover_photo_url: 'https://images.unsplash.com/photo-1626245550578-8ae7f6368d49?q=80&w=1000', logo_url: '/brands/supersmasher.png', bio: 'Premier Pickleball destination in Davao. Smash your limits.', location_text: 'Lanang, Davao City', gcash_name: 'SuperSmasher Ph', gcash_number: '0917-222-3333', followers_count: 2100, is_verified: true, rating: 4.8 },
        { user_id: 'op3', business_name: 'Psyched', slug: 'psyched', category: 'event', cover_photo_url: 'https://images.unsplash.com/photo-1514525253361-bee1a1bb441f?q=80&w=1000', logo_url: '/brands/psyched.png', bio: 'Davao\'s wildest house parties and underground sessions.', location_text: 'Davao City', gcash_name: 'Psyched Events', gcash_number: '0917-333-4444', followers_count: 3200, is_verified: true, rating: 4.9 },
        { user_id: 'op4', business_name: 'Secret Society', slug: 'secretsoc', category: 'event', cover_photo_url: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?q=80&w=1000', logo_url: '/brands/secretsoc.png', bio: 'Exclusive events for the elite. Silence is golden.', location_text: 'Davao City', gcash_name: 'Secret Soc', gcash_number: '0917-444-5555', followers_count: 1560, is_verified: true, rating: 4.7 },
        { user_id: 'op5', business_name: 'Pickletown', slug: 'pickletown', category: 'venue', cover_photo_url: 'https://images.unsplash.com/photo-1599586120429-48281b6f0ece?q=80&w=1000', logo_url: '/brands/pickletown.png', bio: 'Your neighborhood pickleball community. Play, dink, repeat.', location_text: 'Obrero, Davao City', gcash_name: 'Pickletown Davao', gcash_number: '0917-555-6666', followers_count: 1250, is_verified: true, rating: 4.9 },
        { user_id: 'op6', business_name: 'Homecourt', slug: 'homecourt', category: 'venue', cover_photo_url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1000', logo_url: '/brands/homecourt.png', bio: 'The heart of Davao basketball. Where legends are born.', location_text: 'Torres, Davao City', gcash_name: 'Homecourt Ph', gcash_number: '0917-666-7777', followers_count: 4500, is_verified: true, rating: 4.8 },
        { user_id: 'op7', business_name: 'Quinspot', slug: 'quinspot', category: 'venue', cover_photo_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000', logo_url: '/brands/quinspot.png', bio: 'Fitness, Billiards, and community. Your daily grind spot.', location_text: 'Bajada, Davao City', gcash_name: 'Quinspot Ph', gcash_number: '0917-777-8888', followers_count: 2100, is_verified: true, rating: 4.8 },
        { user_id: 'op8', business_name: 'SM Bowling Center', slug: 'sm-bowling', category: 'venue', cover_photo_url: 'https://images.unsplash.com/photo-1538510114873-1d3a41e9c93a?q=80&w=1000', logo_url: '/brands/sm_bowling.png', bio: 'Ultimate leisure destination. Bowling, Archery, and Pool.', location_text: 'SM Lanang, Davao City', gcash_name: 'SM Leisure', gcash_number: '0917-888-9999', followers_count: 8900, is_verified: true, rating: 4.6 }
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
        { id: 'i1', operator_id: 'op1', title: 'Summer EDC Manila', description: 'The ultimate summer electronic dance festival by &Friends.', price: 2500, category: 'Event', image_url: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3', unit_label: 'ticket', type: 'EVENT', event_date: '2025-03-20', event_location: 'Manila', is_active: true },
        { id: 'i2', operator_id: 'op2', title: 'Pickleball Courts', description: 'Reserve a professional pickleball court.', price: 300, category: 'Court', image_url: 'https://images.unsplash.com/photo-1626245550578-8ae7f6368d49', unit_label: 'hour', type: 'PLACE', available_slots: 4, is_active: true },
        { id: 'i3', operator_id: 'op3', title: 'Hearts On Fire HP', description: 'Psyched House Party: Hearts On Fire Edition.', price: 500, category: 'Event', image_url: 'https://images.unsplash.com/photo-1514525253361-bee1a1bb441f', unit_label: 'entry', type: 'EVENT', event_date: '2025-02-14', is_active: true },
        { id: 'i4', operator_id: 'op4', title: '2nd Chance to Cupid', description: 'Secret Society: 2nd Chance to Cupid event.', price: 1000, category: 'Event', image_url: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67', unit_label: 'entry', type: 'EVENT', event_date: '2025-02-21', is_active: true },
        { id: 'i5', operator_id: 'op5', title: 'Pickleball Courts', description: 'Community pickleball action at Pickletown.', price: 250, category: 'Court', image_url: 'https://images.unsplash.com/photo-1599586120429-48281b6f0ece', unit_label: 'hour', type: 'PLACE', is_active: true },
        { id: 'i6', operator_id: 'op6', title: 'Basketball Court', description: 'Full court rental for competitive play.', price: 1500, category: 'Court', image_url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc', unit_label: 'hour', type: 'PLACE', is_active: true },
        { id: 'i7', operator_id: 'op7', title: 'Pool Table', description: 'Quality billiards table at Quinspot.', price: 150, category: 'Table', image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48', unit_label: 'hour', type: 'PLACE', is_active: true },
        { id: 'i8', operator_id: 'op8', title: 'Bowling Lanes', description: 'World-class bowling experience at SM.', price: 500, category: 'Lane', image_url: 'https://images.unsplash.com/photo-1538510114873-1d3a41e9c93a', unit_label: 'game', type: 'PLACE', is_active: true },
        { id: 'i9', operator_id: 'op8', title: 'Archery', description: 'Test your aim at the SM Archery range.', price: 350, category: 'Target', image_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb', unit_label: 'session', type: 'PLACE', is_active: true },
        { id: 'i10', operator_id: 'op8', title: 'Pool Table', description: 'Leisure billiards at SM Bowling Center.', price: 200, category: 'Table', image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd', unit_label: 'hour', type: 'PLACE', is_active: true }
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
