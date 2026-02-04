import React from 'react';
import { Search, Bell, User, CheckSquare } from 'lucide-react';
import { DailyCountdown } from './ui/AestheticComponents';
import { motion, AnimatePresence } from 'framer-motion';
import { dailyService } from '../services/dailyService';
import { supabaseService } from '../services/supabaseService';
import StreakBadge from './StreakBadge';
import { User as UserType } from '../types';

interface TopBarProps {
    visible?: boolean;
    translateY?: number;
    onOpenProfile: () => void;
    user: UserType;
    onLogoClick: () => void;
    onSearchClick: () => void;
    onNotificationsClick: () => void;
    onQuestListClick: () => void;
    onTimerZero?: () => void;
    onReset?: () => void;
    hasUserPostedToday: boolean;
}

const TopBar: React.FC<TopBarProps> = ({ visible = true, translateY = 0, onOpenProfile, user, onLogoClick, onSearchClick, onNotificationsClick, onQuestListClick, onTimerZero, onReset, hasUserPostedToday }) => {


    // Calculate transform and opacity logic
    const activeTranslate = translateY !== 0 ? translateY : (visible ? 0 : -110);

    // Smooth opacity: if translateY is used, fade as it moves. Otherwise binary fade.
    const opacity = translateY !== 0
        ? Math.max(0, 1 - Math.abs(translateY) / 100)
        : (visible ? 1 : 0);

    return (
        <motion.div
            initial={false}
            animate={{
                y: activeTranslate,
                opacity: opacity,
            }}
            transition={{
                type: 'spring',
                damping: 30,
                stiffness: 300,
                opacity: { duration: 0.2 }
            }}
            style={{
                pointerEvents: visible || (translateY !== 0 && Math.abs(translateY) < 50) ? 'auto' : 'none'
            }}
            className="absolute top-0 left-0 right-0 z-40"
        >
            <div className="bg-deep-black/30 backdrop-blur-2xl px-6 pt-[15px] pb-[15px] flex justify-between items-center border-b border-transparent shadow-2xl relative">
                <div className="flex items-center gap-4">
                    <button onClick={onLogoClick} className="focus:outline-none flex items-center gap-2">
                        <h1 className="text-xl font-black tracking-tighter cursor-pointer hover:opacity-80 transition-opacity animate-liquid-text italic">Be4L</h1>
                        <span className="text-[10px] font-black bg-white/5 px-1.5 py-0.5 rounded border border-white/10 animate-liquid-text">BETA</span>
                    </button>
                    <button onClick={onSearchClick} className="text-primary-text/70 hover:text-primary transition-colors ml-1">
                        <Search size={20} />
                    </button>
                </div>

                {/* Aesthetic Countdown Timer - Centered in the bar */}
                <DailyCountdown
                    onTimerZero={onTimerZero}
                    className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 opacity-90 scale-90 md:scale-100"
                />

                <div className="flex items-center gap-5">
                    <button onClick={onQuestListClick} className="text-primary-text/70 hover:text-primary transition-colors">
                        <CheckSquare size={22} />
                    </button>
                    <button onClick={onNotificationsClick} className="relative text-primary-text/70 hover:text-primary transition-colors">
                        <Bell size={22} />
                        <div className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full border-2 border-deep-black" />
                    </button>
                    <button onClick={onOpenProfile} className="relative group">
                        <div className={`w-9 h-9 rounded-full overflow-hidden border border-white/[0.05] group-hover:border-primary transition-all duration-300 ${(!user.avatar_url || user.avatar_url === '') && 'flex items-center justify-center bg-surface'}`}>
                            {user.avatar_url && user.avatar_url !== '' ? (
                                <img src={user.avatar_url} className="w-full h-full object-cover" alt="Profile" />
                            ) : (
                                <User size={16} className="text-gray-400 group-hover:text-primary transition-colors" />
                            )}
                        </div>
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 scale-[0.6] whitespace-nowrap z-10">
                            <StreakBadge
                                count={supabaseService.profiles.computeDisplayStreak(user)}
                                size="sm"
                                active={user.last_window_id === dailyService.getWindowId(new Date())}
                            />
                        </div>
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default TopBar;
