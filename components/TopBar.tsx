import React from 'react';
import { Search, Bell, User } from 'lucide-react';
import StreakBadge from './StreakBadge';
import { User as UserType } from '../types';

interface TopBarProps {
    visible: boolean;
    onOpenProfile: () => void;
    user: UserType;
    onLogoClick: () => void;
    onSearchClick: () => void;
    onNotificationsClick: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ visible, onOpenProfile, user, onLogoClick, onSearchClick, onNotificationsClick }) => {
    return (
        <div className={`absolute top-0 left-0 right-0 z-40 transition-transform duration-300 ease-in-out ${visible ? 'translate-y-0' : '-translate-y-full'}`}>
            <div className="bg-black/20 backdrop-blur-2xl px-6 py-3 pt-12 flex justify-between items-center border-b border-primary/10 shadow-xl">
                <div className="flex items-center gap-4">
                    <button onClick={onLogoClick} className="focus:outline-none">
                        <h1 className="text-xl font-black italic text-primary tracking-tighter cursor-pointer hover:opacity-80 transition-opacity drop-shadow-[0_0_8px_rgba(204,255,0,0.5)]">Be4L</h1>
                    </button>
                    <button onClick={onSearchClick} className="text-white hover:text-primary transition-colors hover:drop-shadow-[0_0_8px_rgba(204,255,0,0.4)] ml-1">
                        <Search size={20} />
                    </button>
                </div>


                <div className="flex items-center gap-5">
                    <button onClick={onNotificationsClick} className="relative text-white hover:text-primary transition-colors">
                        <Bell size={22} />
                        <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-black" />
                    </button>
                    <button onClick={onOpenProfile} className="relative group">
                        <div className={`w-8 h-8 rounded-full overflow-hidden border border-white/20 group-hover:border-primary transition-colors ${!user.avatar_url && 'flex items-center justify-center bg-surface'}`}>
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
