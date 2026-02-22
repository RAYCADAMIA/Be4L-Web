import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User as UserIcon, Search, UserPlus, UserCheck, Shield, Zap } from 'lucide-react';
import { User } from '../types';
import { supabaseService } from '../services/supabaseService';
import { useAuth } from '../contexts/AuthContext';

interface UserListModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string; // "Followers" | "Following"
    userId: string;
    type: 'followers' | 'following';
    onOpenProfile: (user: User) => void;
}

const UserListModal: React.FC<UserListModalProps> = ({
    isOpen,
    onClose,
    title,
    userId,
    type,
    onOpenProfile
}) => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { user: currentUser, updateUser } = useAuth();
    const [followStates, setFollowStates] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (isOpen && userId) {
            loadUsers();
        }
    }, [isOpen, userId, type]);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const list = type === 'followers'
                ? await supabaseService.profiles.getFollowersList(userId)
                : await supabaseService.profiles.getFollowingList(userId);
            setUsers(list);

            // Check follow status for each user in the list relative to current user
            if (currentUser) {
                const states: Record<string, boolean> = {};
                for (const u of list) {
                    if (u.id === currentUser.id) continue;
                    states[u.id] = await supabaseService.profiles.getFollowStatus(currentUser.id, u.id);
                }
                setFollowStates(states);
            }
        } catch (error) {
            console.error('Error loading users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFollowToggle = async (e: React.MouseEvent, targetUser: User) => {
        e.stopPropagation();
        if (!currentUser) {
            window.dispatchEvent(new Event('trigger-auth-modal'));
            return;
        }
        if (currentUser.id === targetUser.id) return;

        const isCurrentlyFollowing = followStates[targetUser.id];

        // Optimistic update
        setFollowStates(prev => ({ ...prev, [targetUser.id]: !isCurrentlyFollowing }));

        if (isCurrentlyFollowing) {
            const success = await supabaseService.profiles.unfollowUser(currentUser.id, targetUser.id);
            if (success) {
                updateUser({ following_count: Math.max(0, (currentUser.following_count || 0) - 1) });
            }
        } else {
            const success = await supabaseService.profiles.followUser(currentUser.id, targetUser.id);
            if (success) {
                updateUser({ following_count: (currentUser.following_count || 0) + 1 });
            }
        }
    };

    const filteredUsers = users.filter(u =>
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center px-4 pt-20 pb-24 md:pb-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-xl"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="bg-[#0A0A0A] border border-white/10 rounded-[2.5rem] w-full max-w-md h-full md:h-auto md:max-h-[80vh] relative z-10 shadow-3xl overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-b from-white/[0.02] to-transparent">
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-tighter text-white">{title}</h3>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-0.5">
                                    {users.length} {type === 'followers' ? 'people following' : 'people followed'}
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2.5 bg-white/5 hover:bg-white/10 rounded-full transition-all active:scale-95 border border-white/10"
                            >
                                <X size={20} className="text-gray-400" />
                            </button>
                        </div>

                        {/* Search Bar */}
                        <div className="px-6 py-4">
                            <div className="relative group">
                                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-electric-teal transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-electric-teal/50 transition-all font-medium placeholder:text-gray-600"
                                />
                            </div>
                        </div>

                        {/* User List */}
                        <div className="flex-1 overflow-y-auto px-4 pb-6 custom-scrollbar">
                            {loading ? (
                                <div className="space-y-3 py-4">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <div key={i} className="flex items-center gap-3 p-3 bg-white/[0.02] rounded-2xl border border-white/5 animate-pulse">
                                            <div className="w-12 h-12 rounded-full bg-white/5" />
                                            <div className="flex-1 space-y-2">
                                                <div className="h-4 w-24 bg-white/5 rounded" />
                                                <div className="h-3 w-16 bg-white/5 rounded" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : filteredUsers.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                                        <UserIcon size={32} className="text-gray-600" />
                                    </div>
                                    <h4 className="text-white font-bold text-lg">No one here yet</h4>
                                    <p className="text-gray-500 text-sm mt-2 font-medium">Try searching for other explorers</p>
                                </div>
                            ) : (
                                <div className="space-y-2 py-2">
                                    {filteredUsers.map(u => (
                                        <motion.div
                                            key={u.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            onClick={() => {
                                                onOpenProfile(u);
                                                onClose();
                                            }}
                                            className="flex items-center gap-3 p-3 bg-white/[0.02] hover:bg-white/[0.05] rounded-2xl border border-white/5 transiton-all group cursor-pointer active:scale-[0.98]"
                                        >
                                            <div className="relative">
                                                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-electric-teal/30 transition-all">
                                                    {u.avatar_url ? (
                                                        <img src={u.avatar_url} className="w-full h-full object-cover" alt={u.username} />
                                                    ) : (
                                                        <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                                                            <UserIcon size={20} className="text-white/20" />
                                                        </div>
                                                    )}
                                                </div>
                                                {u.is_operator && (
                                                    <div className="absolute -bottom-1 -right-1 bg-electric-teal text-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#0A0A0A]">
                                                        <Zap size={10} className="fill-current" />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-sm font-black text-white truncate max-w-[120px] uppercase tracking-tight">
                                                        {u.name || (u.username ? `Explorer ${u.username.slice(0, 4)}` : 'Explorer')}
                                                    </span>
                                                    {u.is_admin && (
                                                        <div className="p-0.5 bg-electric-teal/10 rounded text-electric-teal">
                                                            <Shield size={10} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] text-electric-teal/60 font-black uppercase tracking-tighter">@{u.username}</span>
                                                    <span className="text-[10px] text-gray-500 font-bold tracking-widest">• {u.aura_points || 0} Aura</span>
                                                </div>
                                            </div>

                                            {currentUser && currentUser.id !== u.id && (
                                                <button
                                                    onClick={(e) => handleFollowToggle(e, u)}
                                                    className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all active:scale-90 ${followStates[u.id]
                                                        ? 'bg-white/5 text-white border border-white/10'
                                                        : 'bg-white text-black hover:bg-electric-teal hover:border-electric-teal'
                                                        }`}
                                                >
                                                    {followStates[u.id] ? (
                                                        <span className="flex items-center gap-1.5"><UserCheck size={10} /> Following</span>
                                                    ) : (
                                                        <span className="flex items-center gap-1.5"><UserPlus size={10} /> Follow</span>
                                                    )}
                                                </button>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default UserListModal;
