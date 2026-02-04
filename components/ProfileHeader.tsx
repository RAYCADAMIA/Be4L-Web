import React from 'react';
import { User, Settings, Mail, Camera, Activity, LayoutDashboard, MoreVertical, ChevronLeft, MapPin, BadgeCheck, Star, LogOut, Trash2 } from 'lucide-react';
import { User as UserType } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface ProfileHeaderProps {
    user: UserType;
    isMe: boolean;
    isOwner?: boolean;
    onBack: () => void;
    onSettings?: () => void;
    onFollow?: () => void;
    onMessage?: () => void;
    onEditProfile?: () => void;
    onAddPost?: () => void;
    onManagePage?: () => void;
    onAvatarClick?: () => void;
    onLogout?: () => void;
    isFollowing?: boolean;
    onMore?: () => void;
    locationText?: string;
    onShowFollowers?: () => void;
    onShowFollowing?: () => void;
    onShowAuraStats?: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
    user,
    isMe,
    isOwner,
    onBack,
    onSettings,
    onFollow,
    onMessage,
    onEditProfile,
    onAddPost,
    onManagePage,
    onAvatarClick,
    onLogout,
    isFollowing,
    onMore,
    locationText,
    onShowFollowers,
    onShowFollowing,
    onShowAuraStats
}) => {
    const [showSettingsMenu, setShowSettingsMenu] = React.useState(false);
    const [showCoverModal, setShowCoverModal] = React.useState(false);

    return (
        <div className="relative w-full bg-deep-black text-white mb-8">
            <div className="max-w-4xl mx-auto px-4 pt-4">
                <div className="relative">
                    <div
                        className="relative h-44 md:h-52 w-full bg-zinc-900 overflow-hidden rounded-[2rem] border border-white/5 cursor-pointer"
                        onClick={() => setShowCoverModal(true)}
                    >
                        {user.cover_url ? (
                            <img src={user.cover_url} className="w-full h-full object-cover opacity-90" alt="cover" />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-zinc-800 via-zinc-900 to-black" />
                        )}
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-deep-black/60 via-transparent to-transparent" />
                    </div>

                    {/* Navbar Actions (Floating on Cover) - Moved outside overflow-hidden */}
                    <div className="absolute top-4 left-4 z-20">
                        <button onClick={onBack} className="p-2.5 bg-black/40 backdrop-blur-xl rounded-full text-white border border-white/10 hover:bg-black/60 transition-all active:scale-95">
                            <ChevronLeft size={20} />
                        </button>
                    </div>
                    <div className="absolute top-4 right-4 z-30 flex gap-2">
                        {isMe ? (
                            <div className="relative">
                                <button
                                    onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                                    className={`p-2.5 backdrop-blur-xl rounded-full text-white border border-white/10 transition-all active:scale-95 ${showSettingsMenu ? 'bg-electric-teal text-black border-electric-teal' : 'bg-black/40 hover:bg-black/60'}`}
                                >
                                    <Settings size={20} />
                                </button>

                                {/* Settings Dropdown */}
                                <AnimatePresence>
                                    {showSettingsMenu && (
                                        <>
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="fixed inset-0 z-40 bg-transparent"
                                                onClick={() => setShowSettingsMenu(false)}
                                            />
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95, y: 10, x: 20 }}
                                                animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                                                exit={{ opacity: 0, scale: 0.95, y: 10, x: 20 }}
                                                className="absolute top-full right-0 mt-3 w-64 bg-[#0A0A0A]/95 backdrop-blur-3xl border border-white/10 rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50 p-2"
                                            >
                                                <button
                                                    onClick={() => {
                                                        onEditProfile?.();
                                                        setShowSettingsMenu(false);
                                                    }}
                                                    className="w-full px-6 py-4 text-left text-white/90 hover:bg-white/5 transition-colors flex items-center gap-3 group rounded-2xl"
                                                >
                                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-electric-teal/20 group-hover:text-electric-teal transition-colors">
                                                        <Settings size={16} />
                                                    </div>
                                                    <span className="text-sm font-black uppercase tracking-widest">Edit Profile</span>
                                                </button>

                                                <div className="h-px bg-white/5 mx-4 my-1" />

                                                <button
                                                    onClick={() => {
                                                        onLogout?.();
                                                        setShowSettingsMenu(false);
                                                    }}
                                                    className="w-full px-6 py-4 text-left text-white/90 hover:bg-white/5 transition-colors flex items-center gap-3 group rounded-2xl"
                                                >
                                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-red-500/20 group-hover:text-red-500 transition-colors">
                                                        <LogOut size={16} />
                                                    </div>
                                                    <span className="text-sm font-black uppercase tracking-widest">Log Out</span>
                                                </button>

                                                <button
                                                    onClick={() => {
                                                        if (onMore) onMore();
                                                        setShowSettingsMenu(false);
                                                    }}
                                                    className="w-full px-6 py-4 text-left text-red-500 hover:bg-red-500/10 transition-colors flex items-center gap-3 group rounded-2xl"
                                                >
                                                    <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-colors">
                                                        <Trash2 size={16} />
                                                    </div>
                                                    <span className="text-sm font-black uppercase tracking-widest">Delete Account</span>
                                                </button>
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <button onClick={onMore} className="p-2.5 bg-black/40 backdrop-blur-xl rounded-full text-white border border-white/10 hover:bg-black/60 transition-all active:scale-95">
                                <MoreVertical size={20} />
                            </button>
                        )}
                    </div>
                </div>

                {/* 2. Identity Block (Avatar Overlap Centered) */}
                <div className="relative flex flex-col items-center text-center px-4">
                    {/* Avatar Row */}
                    <div className="-mt-12 md:-mt-16 mb-4 z-10">
                        <div
                            className="relative w-24 h-24 md:w-32 md:h-32 rounded-full border-[4px] md:border-[6px] border-deep-black bg-zinc-800 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] cursor-pointer hover:scale-105 transition-transform duration-500"
                            onClick={isMe ? onAvatarClick : undefined}
                        >
                            {user.avatar_url ? (
                                <img src={user.avatar_url} className="w-full h-full object-cover" alt="avatar" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-white/20">
                                    <User size={32} className="md:w-[48px]" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Info Block */}
                    <div className="flex flex-col items-center gap-1 mb-4">
                        <h1 className="text-2xl md:text-5xl font-black italic tracking-tighter leading-none flex items-center justify-center gap-2">
                            <span className="animate-liquid-text">
                                {user.is_operator ? (user.name || user.username) : (user.name || 'Explorer')}
                            </span>
                            {user.is_operator && <BadgeCheck size={20} className="text-electric-teal fill-electric-teal/20 md:w-[28px]" />}
                        </h1>
                        <p className="text-electric-teal/60 text-base md:text-xl tracking-tight font-black italic">
                            <span className="animate-liquid-text">
                                @{user.username}
                            </span>
                        </p>

                        {/* 3. Brand Location (New Request) */}
                        {(user.is_operator || locationText) && (
                            <div className="flex items-center gap-1 text-gray-500 font-bold text-[10px] uppercase tracking-widest mt-0.5">
                                <MapPin size={10} className="text-electric-teal/50" />
                                {locationText || 'Davao City'}
                            </div>
                        )}

                        {/* Bio (Centered) */}
                        {user.bio && (
                            <p className="text-gray-400 text-sm md:text-base leading-relaxed mt-4 max-w-lg font-medium">
                                {user.bio}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center justify-center gap-6 text-[10px] md:text-xs font-black uppercase tracking-widest text-gray-500 mb-8 w-full">
                        <div
                            className="flex flex-col items-center cursor-pointer hover:opacity-70 transition-opacity"
                            onClick={onShowFollowers}
                        >
                            <span className="text-white text-lg md:text-xl leading-none mb-1">{user.followers_count?.toLocaleString() || 0}</span>
                            <span>Followers</span>
                        </div>
                        <div className="w-px h-8 bg-white/5" />
                        <div
                            className="flex flex-col items-center cursor-pointer hover:opacity-70 transition-opacity"
                            onClick={onShowFollowing}
                        >
                            <span className="text-white text-lg md:text-xl leading-none mb-1">{user.following_count?.toLocaleString() || 0}</span>
                            <span>Following</span>
                        </div>
                        <div className="w-px h-8 bg-white/5" />
                        <div
                            className="flex flex-col items-center cursor-pointer hover:opacity-70 transition-opacity"
                            onClick={onShowAuraStats}
                        >
                            <span className="text-electric-teal text-lg md:text-xl leading-none mb-1 flex items-center gap-1">
                                <Activity size={16} className="fill-current" />
                                {Math.round((user.aura?.score || user.reliability_score || 4.8) * 100).toLocaleString()}
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Aura Points</span>
                        </div>
                    </div>

                    {/* Action Bar (Refined for centering) */}
                    <div className="flex flex-col gap-3 w-full max-w-sm mb-4">
                        <div className="grid grid-cols-2 gap-3">
                            {isMe ? (
                                <>
                                    {user.is_operator ? (
                                        <button
                                            onClick={onAddPost}
                                            className="flex-1 px-6 py-3.5 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] transition-all active:scale-95 shadow-[0_10px_30px_rgba(255,255,255,0.1)]"
                                        >
                                            Add Post
                                        </button>
                                    ) : (
                                        <button
                                            onClick={onEditProfile}
                                            className="flex-1 px-6 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95"
                                        >
                                            Edit Profile
                                        </button>
                                    )}

                                    {user.is_operator ? (
                                        <button
                                            onClick={onManagePage}
                                            className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-electric-teal/10 border border-electric-teal/30 text-electric-teal rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-electric-teal/20 transition-all active:scale-95"
                                        >
                                            <LayoutDashboard size={14} />
                                            Manage
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => window.location.href = '/app/quests/create'}
                                            className="flex-1 px-6 py-3.5 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] transition-all active:scale-95 shadow-xl"
                                        >
                                            Create Quest
                                        </button>
                                    )}
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={onFollow}
                                        className={`flex-1 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 ${isFollowing ? 'bg-white/5 text-white border border-white/10' : 'bg-white text-black hover:scale-[1.02]'}`}
                                    >
                                        {isFollowing ? 'Following' : 'Follow'}
                                    </button>
                                    <button
                                        onClick={onMessage}
                                        className="flex items-center justify-center px-6 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white hover:bg-white/10 transition-all active:scale-95"
                                    >
                                        <Mail size={18} />
                                    </button>
                                </>
                            )}
                        </div>

                    </div>
                </div>
            </div>

            {/* Cover Photo Modal */}
            <AnimatePresence>
                {showCoverModal && (
                    <div
                        className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-6 animate-in fade-in duration-300"
                        onClick={() => setShowCoverModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl border border-white/10"
                        >
                            <img
                                src={user.cover_url || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32'}
                                className="w-full h-auto max-h-[80vh] object-contain"
                                alt="full cover"
                            />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProfileHeader;
