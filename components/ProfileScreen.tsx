import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    ChevronLeft, Settings, User, Info, LogOut, Share2,
    MoreVertical, Grid, FileText, ImageIcon,
    Check, X, Camera, Phone, Mail, Globe, Shield,
    Bell, Trash2, Smartphone, HelpCircle, Star, QrCode, Copy, Download,
    UserPlus, Users, Search, Activity, Compass
} from 'lucide-react';
import { User as UserType, Capture, Quest, QuestStatus } from '../types';
import { supabaseService } from '../services/supabaseService';
import { EKGLoader, GradientButton } from './ui/AestheticComponents';
import StreakBadge from './StreakBadge';
import QuestCard from './QuestCard';
import { useToast } from './Toast';
import { COLORS, MOCK_USER, OTHER_USERS } from '../constants';
import { dailyService } from '../services/dailyService';

interface ProfileScreenProps {
    user: UserType;
    onBack: () => void;
    onLogout?: () => void;
    onOpenPostDetail?: (c: Capture) => void;
    onOpenQuest?: (q: Quest) => void;
    onOpenUser?: (u: UserType) => void;
    onProfileUpdate?: (updatedUser: UserType) => void;
    currentUserId?: string;
    theme?: 'dark' | 'light';
    onToggleTheme?: () => void;
    onOpenChat?: (id: string, name: string) => void;
    onNavigate?: (tab: 'HOME' | 'QUESTS' | 'CHATS' | 'BOOK' | 'SEARCH' | 'NOTIFICATIONS') => void;
}

type ProfileView = 'MAIN' | 'ACCOUNT' | 'SETTINGS' | 'ABOUT' | 'ADD_FRIENDS' | 'FRIENDS_LIST' | 'FOLLOWING_LIST';

const ProfileScreen: React.FC<ProfileScreenProps> = ({ user, onBack, onLogout, onOpenPostDetail, onOpenQuest, onOpenUser, onProfileUpdate, currentUserId, theme = 'dark', onToggleTheme, onOpenChat, onNavigate }) => {
    const isMe = user.id === currentUserId;
    const [view, setView] = useState<ProfileView>('MAIN');
    const [showMenu, setShowMenu] = useState(false);
    const [vault, setVault] = useState<any[]>([]);
    const [showQr, setShowQr] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showDiscardModal, setShowDiscardModal] = useState(false);
    const { showToast } = useToast();
    const [showPfpModal, setShowPfpModal] = useState(false);
    const [contentTab, setContentTab] = useState<'LORE' | 'QUESTS'>('LORE');
    const [userQuests, setUserQuests] = useState<Quest[]>([]);
    const [loadingQuests, setLoadingQuests] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
    const [isFollowLoading, setIsFollowLoading] = useState(false);

    // Edit Form State
    const [editForm, setEditForm] = useState({
        name: user.name || '',
        username: user.username || '',
        bio: user.bio || '',
        mobile: user.mobile || '',
        email: user.email || '',
        avatar_url: user.avatar_url || ''
    });

    const [usernameError, setUsernameError] = useState<string | null>(null);
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otp, setOtp] = useState('');
    const [otpTimer, setOtpTimer] = useState(0);
    const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

    const fileInputRef = React.useRef<HTMLInputElement>(null);

    useEffect(() => {
        supabaseService.captures.getVault(user.id).then(setVault);
        setLoadingQuests(true);
        supabaseService.quests.getMyQuests(user.id).then(res => {
            setUserQuests(res);
            setLoadingQuests(false);
        });
    }, [user.id]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (otpTimer > 0) {
            interval = setInterval(() => setOtpTimer(p => p - 1), 1000);
        }
        return () => clearInterval(interval);
    }, [otpTimer]);

    useEffect(() => {
        if (!isMe && currentUserId && user.id) {
            supabaseService.profiles.getFollowStatus(currentUserId, user.id).then(setIsFollowing);
        }
    }, [user.id, currentUserId, isMe]);

    const handleMessageClick = async () => {
        if (!currentUserId || !onOpenChat || !onNavigate) return;
        const targetEcho = await supabaseService.chat.getOrCreatePersonalChat(currentUserId, user.id, user.username);
        if (targetEcho) {
            onOpenChat(targetEcho.id, targetEcho.name);
            onNavigate('CHATS');
        }
    };

    const handleFollowToggle = async () => {
        if (!currentUserId || !user.id) return;
        setIsFollowLoading(true);
        try {
            if (isFollowing) {
                const success = await supabaseService.profiles.unfollowUser(currentUserId, user.id);
                if (success) setIsFollowing(false);
            } else {
                const success = await supabaseService.profiles.followUser(currentUserId, user.id);
                if (success) setIsFollowing(true);
            }
        } catch (e) {
            showToast("Follow action failed.", "error");
        }
        setIsFollowLoading(false);
    };

    const hasChanges = () => {
        return (
            editForm.name !== (user.name || '') ||
            editForm.username !== (user.username || '') ||
            editForm.bio !== (user.bio || '') ||
            editForm.mobile !== (user.mobile || '') ||
            editForm.email !== (user.email || '') ||
            editForm.avatar_url !== (user.avatar_url || '')
        );
    };

    const handleBackFromAccount = () => {
        if (hasChanges()) {
            setShowDiscardModal(true);
        } else {
            setView('MAIN');
        }
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditForm(prev => ({ ...prev, avatar_url: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUsernameBlur = async () => {
        const newUsername = editForm.username.trim();
        if (newUsername === user.username) {
            setUsernameError(null);
            return;
        }
        if (newUsername.length < 3) {
            setUsernameError("Username is too short.");
            return;
        }
        setIsCheckingUsername(true);
        const isAvailable = await supabaseService.auth.checkUsernameAvailability(newUsername);
        setIsCheckingUsername(false);
        if (!isAvailable) {
            setUsernameError("Username is already taken.");
        } else {
            setUsernameError(null);
        }
    };

    const executeSave = async () => {
        if (!user.id) return;
        const success = await supabaseService.auth.updateProfile(user.id, editForm);
        if (success) {
            showToast("Profile Updated!", 'success');
            onProfileUpdate?.({ ...user, ...editForm });
            setView('MAIN');
        } else {
            showToast("Update Failed.", 'error');
        }
    };

    const initiateSave = async () => {
        if (usernameError || isCheckingUsername) {
            showToast("Please fix username errors first.", 'error');
            return;
        }
        if (editForm.mobile !== user.mobile && editForm.mobile.trim().length > 0) {
            await supabaseService.auth.sendOtp(editForm.mobile);
            setOtpTimer(30);
            setShowOtpModal(true);
        } else {
            executeSave();
        }
    };

    const handleVerifyOtp = async () => {
        setIsVerifyingOtp(true);
        const { user: verifiedUser, error } = await supabaseService.auth.verifyOtp(editForm.mobile, otp);
        setIsVerifyingOtp(false);
        if (verifiedUser) {
            setShowOtpModal(false);
            executeSave();
        } else {
            showToast(error || "Invalid OTP", 'error');
        }
    };

    const handleDiscard = () => {
        setEditForm({
            name: user.name || '',
            username: user.username || '',
            bio: user.bio || '',
            mobile: user.mobile || '',
            email: user.email || '',
            avatar_url: user.avatar_url || ''
        });
        setUsernameError(null);
        setShowDiscardModal(false);
        setView('MAIN');
    };

    const renderHeader = (title: string, onBackAction = () => setView('MAIN'), action?: React.ReactNode) => (
        <div className="sticky top-0 bg-deep-black/95 backdrop-blur-md px-6 py-4 flex items-center gap-6 border-b border-transparent z-10">
            <button onClick={onBackAction}><ChevronLeft className="text-primary" /></button>
            <h2 className="text-xl font-black italic text-white uppercase">{title}</h2>
            <div className="flex-1" />
            {action}
        </div>
    );

    if (view === 'ACCOUNT') {
        return (
            <div className="flex-1 bg-deep-black h-full overflow-y-auto animate-in slide-in-from-right absolute inset-0 z-50 transition-all border-l border-white/[0.02]">
                {renderHeader("Account", handleBackFromAccount, <button onClick={initiateSave} className={`font-bold text-sm uppercase ${hasChanges() ? 'text-primary' : 'text-gray-600'}`}>Save</button>)}
                <div className="p-4 space-y-6">
                    <div className="flex justify-center mb-6">
                        <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                            {(editForm.avatar_url || user.avatar_url) ? (
                                <img src={editForm.avatar_url || user.avatar_url} className="w-24 h-24 rounded-full border border-white/[0.05] object-cover" />
                            ) : (
                                <div className="w-24 h-24 rounded-full border border-white/[0.05] bg-white/[0.03] flex items-center justify-center">
                                    <User size={40} className="text-gray-400" />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="text-white" size={20} />
                            </div>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs text-gray-500 font-bold uppercase ml-1">Name</label>
                            <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl px-4 py-3 flex items-center gap-3">
                                <User size={16} className="text-gray-500" />
                                <input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="bg-transparent w-full text-white font-bold outline-none placeholder-gray-700" placeholder="Your Name" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-gray-500 font-bold uppercase ml-1">Username</label>
                            <div className={`bg-white/5 border rounded-xl px-4 py-3 flex items-center gap-3 transition-colors ${usernameError ? 'border-red-500' : 'border-white/10'}`}>
                                <span className="text-gray-500 font-bold">@</span>
                                <input value={editForm.username} onChange={e => setEditForm({ ...editForm, username: e.target.value })} onBlur={handleUsernameBlur} className="bg-transparent w-full text-white font-bold outline-none placeholder-gray-700" placeholder="username" />
                                {isCheckingUsername && <EKGLoader size={24} showLabel={false} className="gap-0" />}
                            </div>
                            {usernameError && <p className="text-red-500 text-xs font-bold ml-1">{usernameError}</p>}
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-gray-500 font-bold uppercase ml-1">Bio</label>
                            <textarea value={editForm.bio} onChange={e => setEditForm({ ...editForm, bio: e.target.value })} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 w-full h-24 text-white font-medium outline-none placeholder-gray-700 resize-none" placeholder="Tell your story..." />
                        </div>
                    </div>
                </div>

                {showDiscardModal && (
                    <div className="absolute inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-200">
                        <div className="bg-card w-full max-w-sm rounded-3xl border border-white/10 p-6 flex flex-col items-center">
                            <h3 className="text-xl font-bold text-white mb-2">Unsaved Changes</h3>
                            <p className="text-gray-400 text-center text-sm mb-6">You have unsaved changes. Do you want to save them before leaving?</p>
                            <div className="flex gap-3 w-full">
                                <button onClick={handleDiscard} className="flex-1 py-3 bg-surface text-gray-300 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-white/10 transition-colors">Discard</button>
                                <button onClick={initiateSave} className="flex-1 py-3 bg-primary text-black rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-lime-400 transition-colors">Save</button>
                            </div>
                        </div>
                    </div>
                )}

                {showOtpModal && (
                    <div className="absolute inset-0 z-[70] bg-black/95 backdrop-blur-md flex items-center justify-center p-6 animate-in zoom-in-95 duration-200">
                        <div className="w-full max-w-sm flex flex-col items-center">
                            <h3 className="text-2xl font-black italic text-white uppercase mb-2">Verify Number</h3>
                            <p className="text-gray-400 text-sm text-center mb-8">Enter code sent to <span className="text-white font-bold">+63 {editForm.mobile}</span></p>
                            <div className="w-full bg-card border border-white/10 rounded-2xl p-4 mb-6">
                                <input autoFocus type="tel" maxLength={4} value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full bg-transparent text-center text-4xl font-black text-white tracking-[1em] outline-none" placeholder="0000" />
                            </div>
                            <button onClick={handleVerifyOtp} disabled={otp.length !== 4 || isVerifyingOtp} className={`w-full py-4 rounded-xl font-bold uppercase tracking-wider text-sm transition-all ${otp.length === 4 ? 'bg-primary text-black shadow-[0_0_20px_rgba(204,255,0,0.3)]' : 'bg-surface text-gray-500'}`}>
                                {isVerifyingOtp ? 'Verifying...' : 'Confirm Change'}
                            </button>
                            <button onClick={() => setShowOtpModal(false)} className="mt-6 text-gray-500 font-bold text-xs uppercase tracking-widest hover:text-white">Cancel</button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    if (view === 'SETTINGS') {
        return (
            <div className="flex-1 bg-deep-black h-full overflow-y-auto animate-in slide-in-from-right absolute inset-0 z-50 transition-all border-l border-white/5">
                {renderHeader("Settings")}
                <div className="p-4 space-y-6">
                    <div className="space-y-2">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Appearance</h3>
                        <div className="bg-card rounded-2xl overflow-hidden border border-white/5">
                            <div className="p-4 flex items-center justify-between cursor-pointer" onClick={onToggleTheme}>
                                <div className="flex items-center gap-3">
                                    <Globe size={18} className="text-primary" />
                                    <span className="text-white font-bold">{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
                                </div>
                                <div className={`w-12 h-7 rounded-full relative transition-colors duration-200 ${theme === 'dark' ? 'bg-primary' : 'bg-gray-400'}`}>
                                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all duration-200 ${theme === 'dark' ? 'right-1' : 'left-1'}`} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">App Features</h3>
                        <div className="bg-card rounded-2xl overflow-hidden border border-white/5">
                            <div className="p-4 border-b border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-3"><Bell size={18} className="text-white" /><span className="text-white font-bold">Notifications</span></div>
                                <div className="w-10 h-6 bg-primary rounded-full relative cursor-pointer"><div className="absolute right-1 top-1 w-4 h-4 bg-black rounded-full" /></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (view === 'ABOUT') {
        return (
            <div className="flex-1 bg-black/20 backdrop-blur-2xl h-full overflow-y-auto animate-in slide-in-from-right absolute inset-0 z-50 transition-all border-l border-white/5">
                {renderHeader("About")}
                <div className="p-4 space-y-4 text-center">
                    <h3 className="text-white font-bold">Be4L (Beta)</h3>
                    <p className="text-gray-500 text-sm">Version 0.6.0</p>
                </div>
            </div>
        );
    }

    if (view === 'ADD_FRIENDS') {
        return (
            <div className="flex-1 bg-black/20 backdrop-blur-2xl h-full overflow-y-auto animate-in slide-in-from-right absolute inset-0 z-50 transition-all border-l border-white/5">
                {renderHeader("Add People")}
                <div className="p-4">
                    <div className="bg-card border border-white/10 rounded-2xl p-4 flex items-center gap-3 mb-6">
                        <Search size={20} className="text-gray-500" />
                        <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Find friends..." className="bg-transparent text-white font-bold w-full outline-none placeholder-gray-600" />
                    </div>
                    <div className="space-y-4">
                        {OTHER_USERS.map(u => (
                            <div key={u.id} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <img src={u.avatar_url} className="w-12 h-12 rounded-full border border-white/5" />
                                    <div><h4 className="text-white font-bold">{u.name}</h4><p className="text-gray-500 text-xs">@{u.username}</p></div>
                                </div>
                                <button className="px-4 py-2 bg-primary text-black rounded-lg text-xs font-black uppercase hover:bg-lime-400">Add</button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (view === 'FRIENDS_LIST') {
        return (
            <div className="flex-1 bg-black/20 h-full overflow-y-auto animate-in slide-in-from-right absolute inset-0 z-50">
                {renderHeader("Friends")}
                <div className="p-4 space-y-4">
                    {OTHER_USERS.slice(0, 3).map(u => (
                        <div key={u.id} className="flex items-center justify-between bg-card p-3 rounded-xl border border-white/5">
                            <div className="flex items-center gap-3">
                                <img src={u.avatar_url} className="w-12 h-12 rounded-full" />
                                <div><h4 className="text-white font-bold">{u.name}</h4><p className="text-gray-500 text-xs">@{u.username}</p></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (view === 'FOLLOWING_LIST') {
        return (
            <div className="flex-1 bg-black/20 h-full overflow-y-auto animate-in slide-in-from-right absolute inset-0 z-50">
                {renderHeader("Following")}
                <div className="p-4 space-y-4">
                    {OTHER_USERS.slice(2, 6).map(u => (
                        <div key={u.id} className="flex items-center justify-between bg-card p-3 rounded-xl border border-white/5">
                            <div className="flex items-center gap-3">
                                <img src={u.avatar_url} className="w-12 h-12 rounded-full" />
                                <div><h4 className="text-white font-bold">{u.name}</h4><p className="text-gray-500 text-xs">@{u.username}</p></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto pb-32 relative animate-in slide-in-from-right duration-500 h-full bg-deep-black">
            <div className="relative h-[220px] w-full overflow-hidden">
                <div className="absolute inset-0 bg-zinc-900">
                    {user.cover_url ? <img src={user.cover_url} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-black opacity-50" />}
                    <div className="absolute inset-0 bg-gradient-to-t from-deep-black via-transparent to-black/20" />
                </div>
                <div className="absolute left-0 right-0 top-0 p-5 flex justify-between items-center z-20">
                    <button onClick={onBack} className="p-2.5 bg-black/40 backdrop-blur-xl rounded-full text-white border border-white/10"><ChevronLeft size={20} /></button>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setView('ADD_FRIENDS')} className="p-2.5 bg-black/40 backdrop-blur-xl rounded-full text-white border border-white/10"><UserPlus size={18} /></button>
                        {isMe && (
                            <div className="relative">
                                <button onClick={() => setShowMenu(!showMenu)} className="p-2.5 bg-black/40 backdrop-blur-xl rounded-full text-white border border-white/10"><MoreVertical size={18} /></button>
                                {showMenu && (
                                    <>
                                        <div className="absolute inset-0 z-40" onClick={() => setShowMenu(false)} />
                                        <div className="absolute right-0 top-12 w-48 bg-card border border-white/10 rounded-xl shadow-2xl z-50 p-1 flex flex-col">
                                            <button onClick={() => { setView('ACCOUNT'); setShowMenu(false); }} className="px-3 py-3 rounded-lg hover:bg-white/5 text-left text-white font-bold text-sm">Account</button>
                                            <button onClick={() => { setView('SETTINGS'); setShowMenu(false); }} className="px-3 py-3 rounded-lg hover:bg-white/5 text-left text-white font-bold text-sm">Settings</button>
                                            <div className="h-[1px] bg-white/5 my-1" />
                                            <button onClick={() => { onLogout?.(); setShowMenu(false); }} className="px-3 py-3 rounded-lg hover:bg-red-500/10 text-left text-red-500 font-bold text-sm">Log Out</button>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="px-6 -mt-16 relative z-10 flex flex-col items-center">
                <div className="relative mb-4">
                    <div className="relative w-32 h-32 p-1 bg-deep-black rounded-full overflow-hidden cursor-pointer shadow-2xl group" onClick={() => setShowPfpModal(true)}>
                        <div className="w-full h-full rounded-full overflow-hidden border-2 border-primary/30 group-hover:border-primary transition-colors">
                            {user.avatar_url ? <img src={user.avatar_url} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-zinc-900 flex items-center justify-center"><User size={48} className="text-white/20" /></div>}
                        </div>
                    </div>
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 z-20">
                        <StreakBadge count={supabaseService.profiles.computeDisplayStreak(user)} active={user.last_window_id === dailyService.getWindowId(new Date())} />
                    </div>
                </div>
                <div className="text-center mb-5">
                    <h1 className="text-2xl font-black italic text-white tracking-tight leading-none">{user.name || user.username}</h1>
                    <p className="text-xs font-bold text-primary tracking-widest opacity-80 mt-1">@{user.username}</p>
                </div>
                {user.bio && <p className="text-white/40 text-[11px] max-w-[280px] text-center leading-relaxed mb-6 font-medium">{user.bio}</p>}
                <div className="w-full max-w-[320px] bg-white/[0.03] border border-white/[0.05] rounded-[24px] overflow-hidden backdrop-blur-xl mb-5 shadow-2xl flex h-16">
                    <div className="flex-1 flex flex-col justify-center px-4 border-r border-white/5 text-center">
                        <div className="flex items-baseline justify-center gap-1.5"><span className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Lvl</span><span className="text-2xl font-black italic text-white">{user.level || 1}</span></div>
                    </div>
                    <div className="flex-1 flex flex-col justify-center px-4 text-center">
                        <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mb-1">Aura</span>
                        <div className="flex items-baseline justify-center gap-1.5"><span className="text-2xl font-black italic text-primary">{(user.aura?.score || user.reliability_score || 0).toLocaleString()}</span></div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2 px-6 mb-6">
                <button onClick={() => setView('FRIENDS_LIST')} className="flex flex-col items-center justify-center py-2.5 px-4 rounded-xl bg-white/[0.02] border border-white/5"><span className="text-lg font-black text-white italic">{(user.followers_count || 0).toLocaleString()}</span><span className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em]">Followers</span></button>
                <button onClick={() => setView('FOLLOWING_LIST')} className="flex flex-col items-center justify-center py-2.5 px-4 rounded-xl bg-white/[0.02] border border-white/5"><span className="text-lg font-black text-white italic">{(user.following_count || 0).toLocaleString()}</span><span className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em]">Following</span></button>
            </div>

            <div className="flex gap-2.5 px-6 w-full max-w-[400px] mx-auto mb-10">
                {isMe ? <button onClick={() => setView('ACCOUNT')} className="flex-1 py-4 bg-primary rounded-2xl shadow-lg flex items-center justify-center"><span className="text-xs font-black uppercase text-black">Edit Profile</span></button> : <button onClick={handleFollowToggle} className={`flex-1 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest ${isFollowing ? 'bg-white/10 text-white/80' : 'bg-primary text-black'}`}>{isFollowing ? 'Following' : 'Follow'}</button>}
            </div>

            <div className="px-6">
                <div className="flex p-1 bg-white/[0.02] border border-white/[0.05] rounded-full mb-8 max-w-[280px] mx-auto">
                    <button onClick={() => setContentTab('LORE')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full ${contentTab === 'LORE' ? 'bg-primary text-black' : 'text-white/40'}`}><Activity size={14} /><span className="text-[10px] uppercase">Lore</span></button>
                    <button onClick={() => setContentTab('QUESTS')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full ${contentTab === 'QUESTS' ? 'bg-primary text-black' : 'text-white/40'}`}><Compass size={14} /><span className="text-[10px] uppercase">Quests</span></button>
                </div>
                {contentTab === 'LORE' ? (
                    <div className="grid grid-cols-3 gap-2.5 pb-10">
                        {vault.map((item, idx) => (
                            <div key={idx} className="aspect-[3/4.5] rounded-2xl overflow-hidden relative group cursor-pointer" onClick={() => onOpenPostDetail?.(item)}>
                                <img src={item.back_image_url || undefined} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                <div className="absolute bottom-3 left-3 text-[10px] font-black text-white uppercase">{new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-4 pb-10">
                        {userQuests.map(q => <QuestCard key={q.id} quest={q} currentUser={user} onJoin={() => { }} onOpenDetail={() => onOpenQuest?.(q)} />)}
                    </div>
                )}
            </div>

            {showQr && <div className="absolute inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-6" onClick={() => setShowQr(false)}><div className="bg-card w-full max-w-sm rounded-[2rem] p-6 flex flex-col items-center relative" onClick={e => e.stopPropagation()}><QrCode size={180} className="text-white" /><button onClick={() => setShowQr(false)} className="mt-8 text-primary font-bold">CLOSE</button></div></div>}
            {showPfpModal && <div className="absolute inset-0 z-[70] bg-black/95 flex items-center justify-center p-6" onClick={() => setShowPfpModal(false)}><img src={user.avatar_url} className="w-72 h-72 rounded-full object-cover border-4 border-primary" /></div>}
        </div>
    );
};

export default ProfileScreen;
