import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Zap, MessageCircle, UserPlus, UserMinus, MoreVertical, Trophy, MapPin, Calendar } from 'lucide-react';
import { User } from '../../types';
import { supabaseService } from '../../services/supabaseService';
import { EKGLoader } from '../ui/AestheticComponents';
import { useToast } from '../Toast';
import { useAuth } from '../../contexts/AuthContext';

interface ProfileOverlayProps {
    userId: string | null;
    onClose: () => void;
}

const ProfileOverlay: React.FC<ProfileOverlayProps> = ({ userId, onClose }) => {
    const { user: currentUser } = useAuth();
    const { showToast } = useToast();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);

    useEffect(() => {
        if (!userId) return;

        const loadProfile = async () => {
            setLoading(true);
            // Simulate fetching profile or use real service
            const { data } = await supabaseService.profiles.getProfile(userId);
            if (data) {
                setUser(data);
            } else {
                // Fallback for demo
                setUser({
                    id: userId,
                    username: 'User_' + userId.slice(0, 4),
                    avatar_url: `https://i.pravatar.cc/150?u=${userId}`,
                    aura: 1250,
                    level: 15,
                    bio: 'Quest hunter based in Davao. Always looking for the next big incursion.',
                    location: 'Davao City, PH'
                } as any);
            }
            setLoading(false);
        };
        loadProfile();
    }, [userId]);

    const handleFollow = () => {
        setIsFollowing(!isFollowing);
        showToast(isFollowing ? "Unfollowed" : "Following", "success");
    };

    const handleMessage = () => {
        showToast("Messaging not available in preview", "info");
    };

    if (!userId) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center pointer-events-none">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-md pointer-events-auto"
                />

                <motion.div
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="relative w-full max-w-lg md:max-w-md bg-deep-black border-t md:border border-white/10 md:rounded-[2.5rem] overflow-hidden shadow-2xl pointer-events-auto pb-10 md:pb-0"
                >
                    {loading ? (
                        <div className="h-[60vh] flex items-center justify-center"><EKGLoader /></div>
                    ) : user ? (
                        <>
                            {/* Banner Color */}
                            <div className="h-32 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent relative">
                                <button
                                    onClick={onClose}
                                    className="absolute top-6 right-6 p-2 rounded-full bg-black/40 border border-white/10 hover:bg-white/10 transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Profile Info */}
                            <div className="px-8 -mt-12 pb-8">
                                <div className="flex items-end justify-between mb-6">
                                    <div className="relative group">
                                        <img
                                            src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.username}`}
                                            className="w-24 h-24 rounded-3xl border-4 border-deep-black object-cover shadow-2xl"
                                            alt="avatar"
                                        />
                                        <div className="absolute -bottom-1 -right-1 p-2 bg-primary rounded-xl border-4 border-deep-black">
                                            <Shield size={16} className="text-black" />
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleFollow}
                                            className={`h-12 px-6 rounded-2xl flex items-center gap-2 font-black uppercase italic text-xs transition-all ${isFollowing ? 'bg-white/5 border border-white/10 text-gray-400' : 'bg-white text-black'}`}
                                        >
                                            {isFollowing ? <UserMinus size={16} /> : <UserPlus size={16} />}
                                            {isFollowing ? 'Following' : 'Follow'}
                                        </button>
                                        <button
                                            onClick={handleMessage}
                                            className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"
                                        >
                                            <MessageCircle size={20} />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">
                                        {user.username}
                                    </h2>
                                    <div className="flex items-center gap-2 text-gray-500 font-bold text-[10px] uppercase tracking-[0.2em]">
                                        <MapPin size={10} className="text-primary" />
                                        {user.location || 'Unknown Sector'}
                                    </div>
                                </div>

                                <div className="mt-6 p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-sm text-gray-400 leading-relaxed italic">
                                    "{user.bio || 'No status set.'}"
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 gap-3 mt-8">
                                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                            <Zap size={20} className="text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-600 uppercase">Aura Points</p>
                                            <p className="text-lg font-black italic">{user.aura || 0}</p>
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                                            <Trophy size={20} className="text-gray-400" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-600 uppercase">Quest Tier</p>
                                            <p className="text-lg font-black italic">LVL {user.level || 1}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Activity / Recent */}
                                <div className="mt-8">
                                    <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-600 mb-4 px-1">Recent Activity</h3>
                                    <div className="space-y-2">
                                        {[1, 2].map(i => (
                                            <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/[0.02] transition-all group cursor-pointer">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
                                                <div className="flex-1">
                                                    <p className="text-xs font-bold text-gray-300 uppercase italic">Completed Local Hunt</p>
                                                    <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">2 DAYS AGO</p>
                                                </div>
                                                <ChevronRight size={14} className="text-gray-800" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="p-20 text-center text-gray-600 uppercase font-black">User not found</div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

const ChevronRight = ({ size, className }: { size: number, className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="m9 18 6-6-6-6" />
    </svg>
);

export default ProfileOverlay;
