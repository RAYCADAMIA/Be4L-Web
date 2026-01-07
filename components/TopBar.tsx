import React from 'react';
import { Search, Bell, User, Timer, CheckSquare } from 'lucide-react';
import { dailyService } from '../services/dailyService';
import StreakBadge from './StreakBadge';
import { User as UserType } from '../types';

interface TopBarProps {
    visible: boolean;
    onOpenProfile: () => void;
    user: UserType;
    onLogoClick: () => void;
    onSearchClick: () => void;
    onNotificationsClick: () => void;
    onQuestListClick: () => void;
    onTimerZero?: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ visible, onOpenProfile, user, onLogoClick, onSearchClick, onNotificationsClick, onQuestListClick, onTimerZero }) => {
    const [timeLeft, setTimeLeft] = React.useState('');
    const [isCritical, setIsCritical] = React.useState(false);

    React.useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            const nextReset = dailyService.getNextResetTime();
            const diff = nextReset.getTime() - now.getTime();

            if (diff <= 1000 && onTimerZero) {
                // Avoid multiple calls by checking a very small window
                onTimerZero();
            }

            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setIsCritical(diff > 0 && diff <= 10000);

            // Format: 01:59
            return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        };

        setTimeLeft(calculateTimeLeft());
        const interval = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        return () => clearInterval(interval);
    }, [onTimerZero]);

    return (
        <div className={`absolute top-0 left-0 right-0 z-40 transition-transform duration-300 ease-in-out ${visible ? 'translate-y-0' : '-translate-y-full'}`}>
            <div className="bg-black/30 backdrop-blur-2xl px-6 py-3 pt-12 flex justify-between items-center border-b border-white/5 shadow-2xl relative">
                <div className="flex items-center gap-4">
                    <button onClick={onLogoClick} className="focus:outline-none">
                        <h1 className="text-xl font-black italic text-primary tracking-tighter cursor-pointer hover:opacity-80 transition-opacity drop-shadow-[0_0_8px_rgba(204,255,0,0.5)]">Be4L</h1>
                    </button>
                    <button onClick={onSearchClick} className="text-white/70 hover:text-primary transition-colors ml-1">
                        <Search size={20} />
                    </button>
                </div>

                {/* Aesthetic Countdown Timer - Centered in the bar */}
                <div className="absolute left-1/2 -translate-x-1/2 top-[58px] flex items-center gap-1.5 opacity-90 scale-90 md:scale-100">
                    <Timer size={14} className={isCritical ? "text-red-500" : "text-primary"} />
                    <span className={`text-[10px] font-black tracking-[0.2em] font-mono uppercase transition-colors duration-300 ${isCritical ? 'text-red-500 animate-pulse' : 'text-primary/90'}`}>
                        {timeLeft}
                    </span>
                </div>

                <div className="flex items-center gap-5">
                    <button onClick={onQuestListClick} className="text-white/70 hover:text-primary transition-colors">
                        <CheckSquare size={22} />
                    </button>
                    <button onClick={onNotificationsClick} className="relative text-white/70 hover:text-primary transition-colors">
                        <Bell size={22} />
                        <div className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full border-2 border-black" />
                    </button>
                    <button onClick={onOpenProfile} className="relative group">
                        <div className={`w-9 h-9 rounded-full overflow-hidden border border-white/10 group-hover:border-primary transition-all duration-300 ${!user.avatar_url && 'flex items-center justify-center bg-surface'}`}>
                            {user.avatar_url ? (
                                <img src={user.avatar_url} className="w-full h-full object-cover" alt="Profile" />
                            ) : (
                                <User size={16} className="text-gray-400 group-hover:text-primary transition-colors" />
                            )}
                        </div>
                        {/* Streak Badge Centered Bottom */}
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-black px-1 rounded-full border border-gray-800 scale-[0.65] whitespace-nowrap z-10">
                            <StreakBadge count={user.streak_count} size="sm" active={(() => {
                                if (!user.last_posted_date) return false;
                                const today = new Date();
                                const last = new Date(user.last_posted_date);
                                return today.toDateString() === last.toDateString();
                            })()} />
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TopBar;
