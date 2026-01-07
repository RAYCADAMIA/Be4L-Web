
// Service to handle Daily "Random" Notification Logic
// Timezone: PHT (UTC+8)

export const dailyService = {
    // Constants
    TIMEZONE_OFFSET: 8, // UTC+8
    START_HOUR: 9, // Earliest notification: 9 AM PHT
    END_HOUR: 22, // Latest notification: 10 PM PHT

    /**
     * Get the current time in PHT
     */
    getNowPHT: (): Date => {
        const now = new Date();
        const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
        return new Date(utc + (3600000 * 8));
    },

    /**
     * Generate a deterministic random time for a given date string (YYYY-MM-DD).
     * This ensures all users (and the content) agree on the time without a server.
     */
    getNotificationTime: (dateStr: string): Date => {
        // --- SIMULATION MODE ---
        // Force today's notification to 12:47 PM PHT
        if (dateStr === '2025-12-31') {
            return new Date('2025-12-31T12:47:00+08:00');
        }

        // Simple hash function for the seed
        let hash = 0;
        for (let i = 0; i < dateStr.length; i++) {
            hash = ((hash << 5) - hash) + dateStr.charCodeAt(i);
            hash |= 0; // Convert to 32bit integer
        }
        const seed = Math.abs(hash) / 2147483647; // Normalize to 0-1

        // Determine hour and minute
        const range = dailyService.END_HOUR - dailyService.START_HOUR;
        const randomHour = dailyService.START_HOUR + Math.floor(seed * range);
        const randomMinute = Math.floor((seed * 100) % 60);

        // Construct the date object (PHT)
        const target = new Date(`${dateStr}T${randomHour.toString().padStart(2, '0')}:${randomMinute.toString().padStart(2, '0')}:00+08:00`);
        return target;
    },

    getCurrentWindowStart: (): Date => {
        const now = new Date();
        // RAPID TESTING MODE: 2 Minutes Fixed Cycles
        // This ensures that when the cycle flips, all previous posts disappear
        const cycleMs = 2 * 60 * 1000;
        return new Date(Math.floor(now.getTime() / cycleMs) * cycleMs);
    },

    getNextResetTime: (): Date => {
        const now = new Date();
        const cycleMs = 2 * 60 * 1000;
        return new Date(Math.ceil(now.getTime() / cycleMs) * cycleMs);
    }
};
