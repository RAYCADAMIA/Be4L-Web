import { MOCK_USER, MOCK_CAPTURES, MOCK_QUESTS, MOCK_MESSAGES } from '../constants';
import { User, Capture, Quest, Message, QuestStatus } from '../types';
import { dailyService } from './dailyService';

// Simulating API delays
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const TAKEN_USERNAMES = ['admin', 'test', 'sarah_j', 'mike_runs', 'dave_climbs', 'pickle_king', 'art_anna'];

// LocalStorage Keys
const STORAGE_KEYS = {
  USER: 'be4l_user_v1',
  CAPTURES: 'be4l_captures_v6',
  QUESTS: 'be4l_quests_v1',
  MESSAGES: 'be4l_messages_v1',
};

// Initialize Data from LocalStorage or Defaults
const loadData = <T>(key: string, defaultData: T): T => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultData;
  } catch (e) {
    console.error(`Failed to load ${key}`, e);
    return defaultData;
  }
};

const saveData = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Failed to save ${key}`, e);
  }
};

// In-memory store (synced with LS)
let currentUser = loadData<User>(STORAGE_KEYS.USER, MOCK_USER);
let currentCaptures = loadData<Capture[]>(STORAGE_KEYS.CAPTURES, MOCK_CAPTURES);
// Helper to fix mock dates (mock data has 'Today...' strings)
const fixMockDate = (dateStr: string): string => {
  const now = new Date();
  if (dateStr.includes('Today') || dateStr.includes('Tonight')) {
    return new Date().toISOString();
  }
  if (dateStr.includes('Tomorrow')) {
    const tmr = new Date(now);
    tmr.setDate(tmr.getDate() + 1);
    return tmr.toISOString();
  }
  return dateStr;
};

let currentQuests = loadData<Quest[]>(STORAGE_KEYS.QUESTS, MOCK_QUESTS.map(q => ({
  ...q,
  start_time: fixMockDate(q.start_time)
})));
// Messages are mocked static for now in chat service, can be persisted later if needed

// MOCK DATA for Chats
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


export const supabaseService = {
  auth: {
    sendOtp: async (phone: string): Promise<{ success: boolean }> => {
      await delay(1000);
      console.log(`OTP sent to ${phone}`);
      return { success: true };
    },
    verifyOtp: async (phone: string, otp: string): Promise<{ user: User | null }> => {
      await delay(1000);
      return { user: currentUser };
    },
    checkUsernameAvailability: async (username: string): Promise<boolean> => {
      await delay(800);
      if (TAKEN_USERNAMES.includes(username.toLowerCase().trim())) {
        return false;
      }
      return true;
    },
    updateProfile: async (userId: string, data: Partial<User>): Promise<boolean> => {
      await delay(1000);
      currentUser = { ...currentUser, ...data };
      saveData(STORAGE_KEYS.USER, currentUser);
      return true;
    },
    getCurrentUser: async (): Promise<User> => {
      // Check streak validity on load
      const now = new Date();
      const lastPosted = currentUser.last_posted_date ? new Date(currentUser.last_posted_date) : null;

      if (lastPosted) {
        // Calculate difference in days (ignoring time, strictly calendar days)
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const lastDate = new Date(lastPosted.getFullYear(), lastPosted.getMonth(), lastPosted.getDate());
        const diffTime = Math.abs(today.getTime() - lastDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > 1) {
          // Missed a day (or more) -> Reset streak
          // But only if we are past "yesterday"
          console.log(`Streak broken! Last posted: ${diffDays} days ago.`);
          currentUser = { ...currentUser, streak_count: 0 };
          saveData(STORAGE_KEYS.USER, currentUser);
        }
      } else {
        // Never posted
        if (currentUser.streak_count > 0) {
          currentUser = { ...currentUser, streak_count: 0 };
          saveData(STORAGE_KEYS.USER, currentUser);
        }
      }
      return currentUser;
    }
  },

  captures: {
    getFeed: async (): Promise<Capture[]> => {
      await delay(500);

      // Get the current daily window start
      const windowStart = dailyService.getCurrentWindowStart();
      console.log(`[DailyCapture] Active Window Start (PHT): ${windowStart.toLocaleString()}`);

      // Filter captures that are AFTER the window start
      const validCaptures = currentCaptures.filter(c => {
        const captureTime = new Date(c.created_at);
        return captureTime.getTime() >= windowStart.getTime();
      });

      return validCaptures.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    },
    getVault: async (userId: string): Promise<Capture[]> => {
      await delay(500);
      return currentCaptures.filter(c => c.user_id === userId);
    },
    postCapture: async (newCapture: Capture): Promise<boolean> => {
      await delay(1000);
      currentCaptures.unshift(newCapture);
      saveData(STORAGE_KEYS.CAPTURES, currentCaptures);

      // --- STREAK LOGIC UPDATE ---
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const lastPosted = currentUser.last_posted_date ? new Date(currentUser.last_posted_date) : null;

      let newStreak = currentUser.streak_count;

      if (!lastPosted) {
        // First post ever
        newStreak = 1;
      } else {
        const lastDate = new Date(lastPosted.getFullYear(), lastPosted.getMonth(), lastPosted.getDate());
        const diffTime = Math.abs(today.getTime() - lastDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
          // Posted again today - keep streak, don't increment
          console.log("Already posted today. Streak maintained.");
          // No change to count
        } else if (diffDays === 1) {
          // Posted yesterday - increment
          newStreak += 1;
          console.log("Streak incremented!");
        } else {
          // Missed days - reset to 1 (since they posted today)
          newStreak = 1;
          console.log("Streak reset to 1.");
        }
      }

      currentUser = {
        ...currentUser,
        streak_count: newStreak,
        last_posted_date: now.toISOString()
      };
      saveData(STORAGE_KEYS.USER, currentUser);

      return true;
    },
    updateCapture: async (id: string, data: Partial<Capture>): Promise<boolean> => {
      await delay(500);
      const index = currentCaptures.findIndex(c => c.id === id);
      if (index !== -1) {
        currentCaptures[index] = { ...currentCaptures[index], ...data };
        saveData(STORAGE_KEYS.CAPTURES, currentCaptures);
        return true;
      }
      return false;
    },
    deleteCapture: async (id: string): Promise<boolean> => {
      await delay(500);
      currentCaptures = currentCaptures.filter(c => c.id !== id);
      saveData(STORAGE_KEYS.CAPTURES, currentCaptures);
      return true;
    }
  },

  quests: {
    getQuests: async (category: string = 'All'): Promise<Quest[]> => {
      await delay(600);
      const now = new Date();

      // Auto-cancel logic simulation
      currentQuests.forEach(q => {
        // If start time is past and status is still OPEN (not full/completed/cancelled)
        const startTime = new Date(q.start_time);

        // Check if valid date and time has passed (Buffer of 2 hours)
        const ONE_HOUR = 60 * 60 * 1000;
        if (!isNaN(startTime.getTime()) && (startTime.getTime() + (2 * ONE_HOUR) < now.getTime()) && q.status === 'open') {
          // In a real backend, this would happen via a cron job or scheduled task
          q.status = QuestStatus.CANCELLED;
          console.log(`Auto-cancelled quest: ${q.title}`);
        }
      });
      saveData(STORAGE_KEYS.QUESTS, currentQuests); // Persist status updates

      // Sort: Upcoming (non-cancelled) first, by time
      const activeQuests = currentQuests.filter(q => q.status !== 'cancelled' && q.status !== 'completed' && q.status !== 'in_progress');
      const sorted = activeQuests.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

      if (category === 'All') return sorted;
      return sorted.filter(q => q.category === category);
    },
    getMyQuests: async (userId: string): Promise<Quest[]> => {
      await delay(600);
      // Return ALL quests where user is host or participant, regardless of status
      return currentQuests.filter(q =>
        q.host_id === userId || q.participants?.some(p => p.id === userId)
      ).sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime()); // Newest first default
    },
    joinQuest: async (questId: string, user: User): Promise<boolean> => {
      await delay(800);
      const index = currentQuests.findIndex(q => q.id === questId);
      if (index !== -1) {
        const quest = currentQuests[index];
        // Check if already joined
        if (quest.participants?.find(p => p.id === user.id)) return true;

        const updatedParticipants = [...(quest.participants || []), user];
        const updatedQuest = {
          ...quest,
          participants: updatedParticipants,
          current_participants: updatedParticipants.length,
          status: updatedParticipants.length >= quest.max_participants ? 'full' : quest.status
        };
        // @ts-ignore
        currentQuests[index] = updatedQuest;
        saveData(STORAGE_KEYS.QUESTS, currentQuests);
        return true;
      }
      return false;
    },
    createQuest: async (data: Partial<Quest>): Promise<boolean> => {
      await delay(1000);
      const newQuest: Quest = {
        id: `q-${Date.now()}`,
        host_id: currentUser.id,
        host: currentUser,
        current_participants: 1,
        max_participants: 5,
        status: 'open',
        type: 'Casual', // Default case, corrected by upper logic
        category: 'Social',
        title: 'New Quest',
        // Default start time to 1 hour from now to be safe
        start_time: new Date(Date.now() + 3600000).toISOString(),
        description: '',
        participants: [currentUser],
        fee: 0,
        is_public: true,
        ...data
      } as Quest;

      currentQuests.unshift(newQuest);
      saveData(STORAGE_KEYS.QUESTS, currentQuests);
      console.log('Quest created and saved', newQuest);
      return true;
    },
    updateQuest: async (questId: string, data: Partial<Quest>): Promise<boolean> => {
      await delay(800);
      const index = currentQuests.findIndex(q => q.id === questId);
      if (index !== -1) {
        currentQuests[index] = { ...currentQuests[index], ...data };
        saveData(STORAGE_KEYS.QUESTS, currentQuests);
        return true;
      }
      return false;
    },
    deleteQuest: async (questId: string): Promise<boolean> => {
      await delay(500);
      currentQuests = currentQuests.filter(q => q.id !== questId);
      saveData(STORAGE_KEYS.QUESTS, currentQuests);
      return true;
    },
    cancelQuest: async (questId: string, reason: string): Promise<boolean> => {
      await delay(500);
      const index = currentQuests.findIndex(q => q.id === questId);
      if (index !== -1) {
        currentQuests[index] = { ...currentQuests[index], status: QuestStatus.CANCELLED, description: `[CANCELLED: ${reason}] ${currentQuests[index].description}` };
        saveData(STORAGE_KEYS.QUESTS, currentQuests);
        return true;
      }
      return false;
    },
    kickParticipant: async (questId: string, userId: string): Promise<boolean> => {
      await delay(500);
      const index = currentQuests.findIndex(q => q.id === questId);
      if (index !== -1) {
        const quest = currentQuests[index];
        const updatedParticipants = quest.participants?.filter(p => p.id !== userId) || [];
        const updatedKicked = [...(quest.kicked_ids || []), userId];
        const updatedReady = quest.ready_ids?.filter(id => id !== userId) || [];

        currentQuests[index] = {
          ...quest,
          participants: updatedParticipants,
          current_participants: updatedParticipants.length,
          kicked_ids: updatedKicked,
          ready_ids: updatedReady,
          status: (quest.status === QuestStatus.FULL && updatedParticipants.length < quest.max_participants) ? QuestStatus.OPEN : quest.status
        };
        saveData(STORAGE_KEYS.QUESTS, currentQuests);
        return true;
      }
      return false;
    },
    toggleReadyStatus: async (questId: string, userId: string): Promise<boolean> => {
      await delay(300);
      const index = currentQuests.findIndex(q => q.id === questId);
      if (index !== -1) {
        const quest = currentQuests[index];
        const currentReady = quest.ready_ids || [];
        const isReady = currentReady.includes(userId);

        const newReady = isReady
          ? currentReady.filter(id => id !== userId)
          : [...currentReady, userId];

        currentQuests[index] = { ...quest, ready_ids: newReady };
        saveData(STORAGE_KEYS.QUESTS, currentQuests);
        return true;
      }
      return false;
    },
    proceedToQuest: async (questId: string): Promise<boolean> => {
      await delay(800);
      const index = currentQuests.findIndex(q => q.id === questId);
      if (index !== -1) {
        currentQuests[index] = { ...currentQuests[index], status: QuestStatus.IN_PROGRESS };
        saveData(STORAGE_KEYS.QUESTS, currentQuests);
        return true;
      }
      return false;
    }
  },

  chat: {
    getChats: async (): Promise<any[]> => {
      await delay(500);
      return MOCK_CHATS;
    },
    getMessages: async (chatId: string): Promise<Message[]> => {
      await delay(500);
      return MOCK_CHAT_MESSAGES[chatId] || [];
    },
    sendMessage: async (chatId: string, content: string, type: 'text' | 'image' | 'quest_invite' = 'text', additionalData?: any): Promise<Message> => {
      await delay(300);
      const newMessage: Message = {
        id: Math.random().toString(),
        sender_id: currentUser.id,
        content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        is_me: true,
        type,
        ...additionalData
      };
      // In a real app we would push this to the store
      if (!MOCK_CHAT_MESSAGES[chatId]) MOCK_CHAT_MESSAGES[chatId] = [];
      MOCK_CHAT_MESSAGES[chatId].push(newMessage);
      return newMessage;
    }
  }
};
