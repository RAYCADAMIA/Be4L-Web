
import { DailyTask } from '../types';

// Service to handle Daily Logic (Strict V1 Spec)
// Timezone: Local Device Time (Feed uses device time for strict sync)

// TOGGLE THIS FOR DEV MODE (2-minute cycles) vs PROD (Midnight reset)
export const DEV_MODE = true;

const STORAGE_KEY = 'be4l_daily_quests';

export const dailyService = {
    // Constants
    START_HOUR: 9,
    END_HOUR: 22,

    /**
     * Get the current time
     */
    getNow: (): Date => {
        return new Date();
    },

    /**
     * Get the start of the current "Day" (or Cycle in Dev Mode)
     * V1 Spec: Strictly 00:00:00 Local Time for Production
     */
    getCurrentWindowStart: (): Date => {
        const now = new Date();

        if (DEV_MODE) {
            // RAPID TESTING: 2 Minutes Fixed Cycles
            const cycleMs = 2 * 60 * 1000;
            return new Date(Math.floor(now.getTime() / cycleMs) * cycleMs);
        } else {
            // PRODUCTION: Local Midnight
            const midnight = new Date(now);
            midnight.setHours(0, 0, 0, 0);
            return midnight;
        }
    },

    /**
     * Get the next reset time
     * V1 Spec: Strictly 00:00:00 NEXT DAY for Production
     */
    getNextResetTime: (): Date => {
        const now = new Date();

        if (DEV_MODE) {
            const cycleMs = 2 * 60 * 1000;
            return new Date(Math.ceil(now.getTime() / cycleMs) * cycleMs);
        } else {
            // PRODUCTION: Next Midnight
            const nextMidnight = new Date(now);
            nextMidnight.setDate(now.getDate() + 1);
            nextMidnight.setHours(0, 0, 0, 0);
            return nextMidnight;
        }
    },

    /**
     * Get the duration of a cycle in MS
     */
    getCycleDuration: (): number => {
        return DEV_MODE ? (2 * 60 * 1000) : (24 * 60 * 60 * 1000);
    },

    /**
     * Get the start of the previous window
     */
    getPreviousWindowStart: (): Date => {
        const currentStart = dailyService.getCurrentWindowStart();
        return new Date(currentStart.getTime() - dailyService.getCycleDuration());
    },

    /**
     * Get a unique ID for a window based on a timestamp
     */
    getWindowId: (date: Date): string => {
        const duration = dailyService.getCycleDuration();
        return Math.floor(date.getTime() / duration).toString();
    },

    /**
     * Check if one window ID is the immediate successor of another
     */
    isImmediateSuccessor: (currentId: string, lastId: string): boolean => {
        const current = parseInt(currentId);
        const last = parseInt(lastId);
        return current === last + 1;
    },

    /**
     * Generate a deterministic random time for notification
     */
    getNotificationTime: (dateStr: string): Date => {
        // --- SIMULATION MODE ---
        // Force today's notification to 12:47 PM PHT if needed
        if (dateStr === '2025-12-31') {
            return new Date('2025-12-31T12:47:00+08:00');
        }

        let hash = 0;
        for (let i = 0; i < dateStr.length; i++) {
            hash = ((hash << 5) - hash) + dateStr.charCodeAt(i);
            hash |= 0;
        }
        const seed = Math.abs(hash) / 2147483647;

        const range = dailyService.END_HOUR - dailyService.START_HOUR;
        const randomHour = dailyService.START_HOUR + Math.floor(seed * range);
        const randomMinute = Math.floor((seed * 100) % 60);

        // This constructs it in local time roughly
        const target = new Date(dateStr);
        target.setHours(randomHour, randomMinute, 0, 0);
        return target;
    },

    // --- Side Quest Tasks (Daily Log Refactor) ---

    getTasks: (): DailyTask[] => {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : [
            { id: '1', text: 'Drink 2L Water', completed: false },
            { id: '2', text: 'Touch Grass', completed: true },
        ];
    },

    setTasks: (tasks: DailyTask[]) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    },

    addTask: (text: string): DailyTask => {
        const tasks = dailyService.getTasks();
        const newTask: DailyTask = {
            id: Date.now().toString(),
            text,
            completed: false
        };
        dailyService.setTasks([newTask, ...tasks]);
        return newTask;
    },

    toggleTask: (id: string) => {
        const tasks = dailyService.getTasks();
        const newTasks = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
        dailyService.setTasks(newTasks);
    },

    deleteTask: (id: string) => {
        const tasks = dailyService.getTasks();
        const newTasks = tasks.filter(t => t.id !== id);
        dailyService.setTasks(newTasks);
    },

    hasTask: (text: string): boolean => {
        const tasks = dailyService.getTasks();
        return tasks.some(t => t.text.toLowerCase() === text.toLowerCase());
    }
};
