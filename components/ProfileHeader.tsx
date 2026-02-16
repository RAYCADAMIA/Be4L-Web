import React from 'react';
import { User, Settings, Mail, Camera, Activity, LayoutDashboard, MoreVertical, ChevronLeft, MapPin, BadgeCheck, Star, LogOut, Trash2, Shield, HelpCircle, Info, Sparkles, Share2, Copy, X } from 'lucide-react';
import { User as UserType } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
// import { BrandAccessModal } from './Dibs/BrandAccessModal';
const BrandAccessModal = React.lazy(() => import('./Dibs/BrandAccessModal').then(module => ({ default: module.BrandAccessModal })));

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
    onProfileUpdate?: (user: UserType) => void;
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
    onShowAuraStats,
    onProfileUpdate
}) => {
    const [showSettingsMenu, setShowSettingsMenu] = React.useState(false);
    const [showBrandModal, setShowBrandModal] = React.useState(false);
    const [showShareModal, setShowShareModal] = React.useState(false);
    const [showAuraModal, setShowAuraModal] = React.useState(false);
    const [copied, setCopied] = React.useState(false);

    return (
        <div className="relative w-full bg-transparent text-white mb-4">
            <div className="max-w-4xl mx-auto px-4 pt-10 md:pt-8">
                {/* Brand Access Modal */}
                <React.Suspense fallback={null}>
                    <BrandAccessModal
                        isOpen={showBrandModal}
                        onClose={() => setShowBrandModal(false)}
                        onSuccess={() => {
                            if (onProfileUpdate) {
                                onProfileUpdate({ ...user, is_operator: true });
                            }
                            // Force window reload to ensure all contexts refresh if needed, or rely on callback
                            window.location.reload();
                        }}
                    />
                </React.Suspense>


                {/* 2. Identity Block (Avatar Overlap Centered) */}
                <div className="relative flex flex-col items-center text-center px-4">
                    {/* Floating Navigation Controls (Sitting below global header) */}
                    <div className="absolute top-4 md:top-6 left-0 right-0 flex items-center justify-between z-30 px-4">
                        {/* Return Button */}
                        <button onClick={onBack} className="p-3 bg-white/5 backdrop-blur-xl rounded-full text-white border border-white/10 hover:bg-white/10 transition-all active:scale-95 shadow-xl">
                            <ChevronLeft size={24} />
                        </button>

                        {/* Settings/Share Buttons */}
                        <div className="flex gap-2">
                            {isMe ? (
                                <div className="flex gap-2">
                                    {/* Share Button */}
                                    <button
                                        onClick={() => setShowShareModal(true)}
                                        className="p-3 bg-white/5 backdrop-blur-xl rounded-full text-white border border-white/10 hover:bg-white/10 transition-all active:scale-95 shadow-xl"
                                    >
                                        <Share2 size={24} />
                                    </button>

                                    <div className="relative">
                                        <button
                                            onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                                            className={`p-3 backdrop-blur-xl rounded-full text-white border border-white/10 transition-all active:scale-95 ${showSettingsMenu ? 'bg-electric-teal text-black border-electric-teal' : 'bg-white/5 hover:bg-white/10'}`}
                                        >
                                            <Settings size={24} />
                                        </button>

                                        {/* Settings Dropdown */}
                                        <AnimatePresence>
                                            {showSettingsMenu && (
                                                <>
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0.95, y: 10, x: 20 }}
                                                        animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                                                        exit={{ opacity: 0, scale: 0.95, y: 10, x: 20 }}
                                                        className="absolute top-full right-0 mt-3 w-64 bg-deep-black/95 backdrop-blur-3xl border border-white/10 rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50 p-3"
                                                    >
                                                        <div className="px-4 py-2 mb-2">
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Settings</p>
                                                        </div>

                                                        <button
                                                            onClick={() => {
                                                                onEditProfile?.();
                                                                setShowSettingsMenu(false);
                                                            }}
                                                            className="w-full px-4 py-3 text-left text-white/90 hover:bg-white/5 transition-colors flex items-center gap-4 group rounded-2xl"
                                                        >
                                                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-electric-teal/20 group-hover:text-electric-teal transition-colors">
                                                                <User size={16} />
                                                            </div>
                                                            <div>
                                                                <span className="text-xs font-bold block">Account</span>
                                                                <span className="text-[9px] text-gray-500 font-medium">Edit details via Profile</span>
                                                            </div>
                                                        </button>

                                                        <button
                                                            onClick={() => {
                                                                if (user.is_operator) {
                                                                    onManagePage?.();
                                                                } else {
                                                                    setShowBrandModal(true);
                                                                }
                                                                setShowSettingsMenu(false);
                                                            }}
                                                            className="w-full px-4 py-3 text-left text-white/90 hover:bg-white/5 transition-colors flex items-center gap-4 group rounded-2xl"
                                                        >
                                                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-electric-teal/20 group-hover:text-electric-teal transition-colors">
                                                                {user.is_operator ? <LayoutDashboard size={16} /> : <Sparkles size={16} />}
                                                            </div>
                                                            <div>
                                                                <span className="text-xs font-bold block">{user.is_operator ? 'Manage Brand' : 'Switch to Brand'}</span>
                                                                <span className="text-[9px] text-gray-500 font-medium">{user.is_operator ? 'Access Dashboard' : 'Enter Access Code'}</span>
                                                            </div>
                                                        </button>

                                                        <div className="h-px bg-white/5 mx-4 my-2" />

                                                        <button className="w-full px-4 py-3 text-left text-white/90 hover:bg-white/5 transition-colors flex items-center gap-4 group rounded-2xl">
                                                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:text-white transition-colors">
                                                                <HelpCircle size={16} />
                                                            </div>
                                                            <span className="text-xs font-bold">Help & Support</span>
                                                        </button>

                                                        <button className="w-full px-4 py-3 text-left text-white/90 hover:bg-white/5 transition-colors flex items-center gap-4 group rounded-2xl">
                                                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:text-white transition-colors">
                                                                <Shield size={16} />
                                                            </div>
                                                            <span className="text-xs font-bold">Privacy Center</span>
                                                        </button>

                                                        <button className="w-full px-4 py-3 text-left text-white/90 hover:bg-white/5 transition-colors flex items-center gap-4 group rounded-2xl">
                                                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:text-white transition-colors">
                                                                <Info size={16} />
                                                            </div>
                                                            <span className="text-xs font-bold">About Be4L</span>
                                                        </button>

                                                        <div className="h-px bg-white/5 mx-4 my-2" />

                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onLogout?.();
                                                                setShowSettingsMenu(false);
                                                            }}
                                                            className="w-full px-4 py-3 text-left text-red-500 hover:bg-red-500/20 transition-all flex items-center gap-4 group rounded-2xl active:scale-95 mt-1"
                                                        >
                                                            <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-all shadow-sm">
                                                                <LogOut size={16} />
                                                            </div>
                                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] group-hover:text-red-400 transition-colors">Log Out</span>
                                                        </button>

                                                        <div className="text-[9px] text-center text-gray-700 py-2 font-mono uppercase tracking-widest opacity-50">
                                                            v3.0.0 (Operator)
                                                        </div>
                                                    </motion.div>
                                                </>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setShowShareModal(true)}
                                        className="p-3 bg-white/5 backdrop-blur-xl rounded-full text-white border border-white/10 hover:bg-white/10 transition-all active:scale-95 shadow-xl"
                                    >
                                        <Share2 size={24} />
                                    </button>
                                    <button onClick={onMore} className="p-3 bg-white/5 backdrop-blur-xl rounded-full text-white border border-white/10 hover:bg-white/10 transition-all active:scale-95 shadow-xl">
                                        <MoreVertical size={24} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* PFP Circle - Tightened spacing for better flow */}
                    <div className="mt-4 md:mt-6 mb-6 z-10 transition-all duration-500">
                        <div
                            className="relative w-28 h-28 md:w-40 md:h-40 rounded-full border-[4px] md:border-[8px] border-zinc-950/50 bg-zinc-900 overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-500"
                            onClick={isMe ? onAvatarClick : undefined}
                        >
                            {user.avatar_url ? (
                                <img src={user.avatar_url} className="w-full h-full object-cover" alt="avatar" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-white/20">
                                    <User size={40} className="md:w-[64px]" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Info Block */}
                    <div className="flex flex-col items-center gap-1 mb-4">
                        <h1 className="text-3xl md:text-6xl font-black tracking-tighter leading-none flex items-center justify-center gap-3">
                            <span className="text-gradient-static">
                                {user.is_operator ? (user.name || user.username) : (user.name || 'Explorer')}
                            </span>
                            {user.is_operator && <BadgeCheck size={24} className="text-electric-teal fill-electric-teal/20 md:w-[36px]" />}
                        </h1>
                        <p className="text-electric-teal/60 text-lg md:text-2xl tracking-tight font-black mt-1">
                            <span className="text-gradient-static">
                                @{user.username}
                            </span>
                        </p>

                        {/* 3. Brand Location */}
                        {(user.is_operator || locationText) && (
                            <div className="flex items-center gap-1 text-gray-500 font-bold text-xs uppercase tracking-widest mt-2 bg-white/5 px-4 py-1.5 rounded-full border border-white/5">
                                <MapPin size={12} className="text-electric-teal/50" />
                                {locationText || 'Davao City'}
                            </div>
                        )}

                        {/* Bio (Centered) */}
                        {user.bio && (
                            <p className="text-gray-400 text-sm md:text-lg leading-relaxed mt-6 max-w-xl font-medium px-4">
                                {user.bio}
                            </p>
                        )}
                    </div>
                </div>

                {/* Share Modal */}
                <AnimatePresence>
                    {showShareModal && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-black/80 backdrop-blur-2xl"
                                onClick={() => setShowShareModal(false)}
                            />
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                className="bg-[#0A0A0A] border border-white/10 rounded-[3rem] w-full max-w-sm relative z-10 shadow-3xl overflow-hidden p-8 text-center"
                            >
                                <button
                                    onClick={() => setShowShareModal(false)}
                                    className="absolute top-6 right-6 p-2 hover:bg-white/5 rounded-full transition-colors"
                                >
                                    <X size={20} className="text-gray-500" />
                                </button>

                                <div className="mb-8">
                                    <div className="w-16 h-16 bg-electric-teal/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <Share2 size={32} className="text-electric-teal" />
                                    </div>
                                    <h3 className="text-xl font-black uppercase tracking-tighter text-white">Share Profile</h3>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-1">Let others find your lore</p>
                                </div>

                                {/* QR Code */}
                                <div className="bg-white p-4 rounded-3xl mb-8 mx-auto w-fit shadow-[0_0_50px_rgba(45,212,191,0.2)]">
                                    <img
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(window.location.origin + '/app/' + user.username)}`}
                                        alt="QR Code"
                                        className="w-48 h-48"
                                    />
                                </div>

                                {/* Link Copy Section */}
                                <div className="space-y-4">
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                            <Share2 size={14} className="text-gray-500" />
                                        </div>
                                        <input
                                            type="text"
                                            readOnly
                                            value={`${window.location.origin}/app/${user.username}`}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-xs text-white/50 focus:outline-none focus:border-electric-teal/50 transition-all font-medium"
                                        />
                                    </div>

                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(`${window.location.origin}/app/${user.username}`);
                                            setCopied(true);
                                            setTimeout(() => setCopied(false), 2000);
                                        }}
                                        className="w-full py-4 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-electric-teal transition-all active:scale-95 flex items-center justify-center gap-3"
                                    >
                                        {copied ? (
                                            <>
                                                <BadgeCheck size={16} />
                                                Copied Link
                                            </>
                                        ) : (
                                            <>
                                                <Copy size={16} />
                                                Copy Profile Link
                                            </>
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Aura Stats Modal */}
                <AnimatePresence>
                    {showAuraModal && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-black/80 backdrop-blur-2xl"
                                onClick={() => setShowAuraModal(false)}
                            />
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                className="bg-[#0A0A0A] border border-white/10 rounded-[3rem] w-full max-w-sm relative z-10 shadow-3xl overflow-hidden p-8"
                            >
                                <button
                                    onClick={() => setShowAuraModal(false)}
                                    className="absolute top-6 right-6 p-2 hover:bg-white/5 rounded-full transition-colors"
                                >
                                    <X size={20} className="text-gray-500" />
                                </button>

                                <div className="text-center mb-8">
                                    <div className="w-16 h-16 bg-electric-teal/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Activity size={32} className="text-electric-teal" />
                                    </div>
                                    <h3 className="text-xl font-black uppercase tracking-tighter text-white">Your Aura</h3>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-1">Social Reliability Score</p>
                                </div>

                                <div className="space-y-6">
                                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                                        <p className="text-xs text-gray-400 leading-relaxed text-center italic">
                                            "Aura represents your social reliability and ecosystem standing. Earn points by hosting successful quests, staying active, and being a trusted member of the community."
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-white/30 px-1">Recent Gains</h4>
                                        <div className="space-y-2">
                                            {[
                                                { label: 'Quest Hosted', points: '+50', date: '2h ago' },
                                                { label: 'Daily Streak', points: '+10', date: '5h ago' },
                                                { label: 'Early Arrival', points: '+25', date: 'Yesterday' }
                                            ].map((item, i) => (
                                                <div key={i} className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-bold text-white uppercase">{item.label}</span>
                                                        <span className="text-[8px] text-gray-600 font-medium">{item.date}</span>
                                                    </div>
                                                    <span className="text-xs font-black text-electric-teal">{item.points}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setShowAuraModal(false)}
                                    className="w-full mt-8 py-4 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-electric-teal transition-all active:scale-95"
                                >
                                    Got it
                                </button>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                <div className="flex items-center justify-center gap-8 text-[10px] md:text-xs font-black uppercase tracking-widest text-gray-500 mb-10 w-full">
                    <div
                        className="flex flex-col items-center cursor-pointer hover:opacity-70 transition-opacity"
                        onClick={onShowFollowers}
                    >
                        <span className="text-white text-xl md:text-2xl leading-none mb-1">{user.followers_count?.toLocaleString() || 0}</span>
                        <span>Followers</span>
                    </div>
                    <div className="w-px h-10 bg-white/5" />
                    <div
                        className="flex flex-col items-center cursor-pointer hover:opacity-70 transition-opacity"
                        onClick={onShowFollowing}
                    >
                        <span className="text-white text-xl md:text-2xl leading-none mb-1">{user.following_count?.toLocaleString() || 0}</span>
                        <span>Following</span>
                    </div>
                    <div className="w-px h-10 bg-white/5" />
                    <button
                        className="flex flex-col items-center cursor-pointer hover:opacity-70 transition-opacity group"
                        onClick={() => setShowAuraModal(true)}
                    >
                        <span className="text-electric-teal text-xl md:text-2xl leading-none mb-1 flex items-center gap-1 group-hover:scale-110 transition-transform">
                            <Activity size={20} className="fill-current" />
                            {(user.aura_points || 0).toLocaleString()}
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Aura</span>
                    </button>
                </div>

                {/* Action Bar (Refined for centering) */}
                <div className="flex flex-col gap-3 w-full max-w-sm mb-4 mx-auto">
                    <div className="grid grid-cols-2 gap-3">
                        {isMe ? (
                            <>
                                {user.is_operator ? (
                                    <button
                                        onClick={onAddPost}
                                        className="flex-1 px-6 py-4 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] transition-all active:scale-95 shadow-[0_10px_30px_rgba(255,255,255,0.1)]"
                                    >
                                        Add Post
                                    </button>
                                ) : (
                                    <button
                                        onClick={onEditProfile}
                                        className="flex-1 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95"
                                    >
                                        Edit Profile
                                    </button>
                                )}

                                {user.is_operator ? (
                                    <button
                                        onClick={onManagePage}
                                        className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-electric-teal/10 border border-electric-teal/30 text-electric-teal rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-electric-teal/20 transition-all active:scale-95"
                                    >
                                        <LayoutDashboard size={14} />
                                        Manage
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => window.location.href = '/app/quests/create'}
                                        className="flex-1 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95 shadow-xl"
                                    >
                                        Create Quest
                                    </button>
                                )}
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={onFollow}
                                    className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 ${isFollowing ? 'bg-white/5 text-white border border-white/10' : 'bg-white text-black hover:scale-[1.02]'}`}
                                >
                                    {isFollowing ? 'Following' : 'Follow'}
                                </button>
                                <button
                                    onClick={onMessage}
                                    className="flex items-center justify-center px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white hover:bg-white/10 transition-all active:scale-95"
                                >
                                    <Mail size={18} />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileHeader;
