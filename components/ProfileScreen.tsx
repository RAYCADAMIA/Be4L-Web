import React, { useState, useEffect } from 'react';
import {
    ChevronLeft, Settings, User, Info, LogOut, Share2,
    MoreVertical, Grid, FileText, Image as ImageIcon,
    Check, X, Camera, Phone, Mail, Globe, Shield,
    Bell, Trash2, Smartphone, HelpCircle, Star, QrCode, Copy, Download,
    UserPlus, Users, Search
} from 'lucide-react';
import { User as UserType, Capture, Quest } from '../types';
import { supabaseService } from '../services/supabaseService';
import { EKGLoader } from './ui/AestheticComponents';
import StreakBadge from './StreakBadge';
import { useToast } from './Toast';
import { COLORS, MOCK_USER, OTHER_USERS } from '../constants';

interface ProfileScreenProps {
    user: UserType;
    onBack: () => void;
    onLogout?: () => void;
    onOpenPostDetail?: (c: Capture) => void;
    onOpenMyQuests?: () => void;
    onOpenUser?: (u: UserType) => void;
    onProfileUpdate?: (updatedUser: UserType) => void;
}

type ProfileView = 'MAIN' | 'ACCOUNT' | 'SETTINGS' | 'ABOUT' | 'ADD_FRIENDS' | 'FRIENDS_LIST' | 'FOLLOWING_LIST';

// ... (existing imports and interface)

const ProfileScreen: React.FC<ProfileScreenProps> = ({ user, onBack, onLogout, onOpenPostDetail, onOpenMyQuests, onOpenUser, onProfileUpdate }) => {
    const isMe = user.id === MOCK_USER.id;
    const [view, setView] = useState<ProfileView>('MAIN');
    const [showMenu, setShowMenu] = useState(false);
    const [vault, setVault] = useState<any[]>([]);
    const [showQr, setShowQr] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showDiscardModal, setShowDiscardModal] = useState(false);
    const { showToast } = useToast();
    const [showPfpModal, setShowPfpModal] = useState(false);

    // Edit Form State
    const [editForm, setEditForm] = useState({
        name: user.name || '',
        username: user.username || '',
        bio: user.bio || '',
        mobile: user.mobile || '',
        email: user.email || '',
        avatar_url: user.avatar_url || ''
    });

    // Validation & Verification State
    const [usernameError, setUsernameError] = useState<string | null>(null);
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);

    // OTP State
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otp, setOtp] = useState('');
    const [otpTimer, setOtpTimer] = useState(0);
    const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

    const fileInputRef = React.useRef<HTMLInputElement>(null);

    useEffect(() => {
        supabaseService.captures.getVault(user.id).then(setVault);
    }, [user.id]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (otpTimer > 0) {
            interval = setInterval(() => setOtpTimer(p => p - 1), 1000);
        }
        return () => clearInterval(interval);
    }, [otpTimer]);

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

    // --- Avatar Handling ---
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

    // --- Username Validation ---
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

    // --- Save Logic with Mobile Verification ---
    const initiateSave = async () => {
        // 1. Check Username Block
        if (usernameError || isCheckingUsername) {
            showToast("Please fix username errors first.", 'error');
            return;
        }

        // 2. Check Mobile Change
        if (editForm.mobile !== user.mobile && editForm.mobile.trim().length > 0) {
            // Initiate OTP
            await supabaseService.auth.sendOtp(editForm.mobile);
            setOtpTimer(30);
            setShowOtpModal(true);
        } else {
            // No mobile change, proceed to save
            executeSave();
        }
    };

    const handleVerifyOtp = async () => {
        setIsVerifyingOtp(true);
        // In a real app we would verify against the NEW number
        const res = await supabaseService.auth.verifyOtp(editForm.mobile, otp);
        setIsVerifyingOtp(false);

        if (res.user) {
            setShowOtpModal(false);
            executeSave();
        } else {
            showToast("Invalid OTP. Please try again.", 'error');
        }
    };

    const executeSave = async () => {
        const updatedUser = { ...user, ...editForm };
        await supabaseService.auth.updateProfile(user.id, editForm);
        onProfileUpdate?.(updatedUser);
        setView('MAIN');
        setShowDiscardModal(false);
        setOtp('');
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

    // --- Sub-Screens ---

    const renderHeader = (title: string, onBackAction = () => setView('MAIN'), action?: React.ReactNode) => (
        <div className="sticky top-0 bg-black/95 backdrop-blur-md px-6 py-4 flex items-center gap-6 border-b border-white/5 z-10">
            <button onClick={onBackAction}><ChevronLeft className="text-white" /></button>
            <h2 className="text-xl font-black italic text-white uppercase">{title}</h2>
            <div className="flex-1" />
            {action}
        </div>
    );

    if (view === 'ACCOUNT') {
        return (
            <div className="flex-1 bg-black/20 backdrop-blur-2xl h-full overflow-y-auto animate-in slide-in-from-right absolute inset-0 z-50 transition-all border-l border-white/5">
                {renderHeader("Account", handleBackFromAccount, <button onClick={initiateSave} className={`font-bold text-sm uppercase ${hasChanges() ? 'text-primary' : 'text-gray-600'}`}>Save</button>)}
                <div className="p-4 space-y-6">
                    <div className="flex justify-center mb-6">
                        <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                            {(editForm.avatar_url || user.avatar_url) ? (
                                <img src={editForm.avatar_url || user.avatar_url} className="w-24 h-24 rounded-full border-2 border-white/10 object-cover" />
                            ) : (
                                <div className="w-24 h-24 rounded-full border-2 border-white/10 bg-surface flex items-center justify-center">
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
                            <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center gap-3">
                                <User size={16} className="text-gray-500" />
                                <input
                                    value={editForm.name}
                                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                    className="bg-transparent w-full text-white font-bold outline-none placeholder-gray-700"
                                    placeholder="Your Name"
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-gray-500 font-bold uppercase ml-1">Username</label>
                            <div className={`bg-white/5 border rounded-xl px-4 py-3 flex items-center gap-3 transition-colors ${usernameError ? 'border-red-500' : 'border-white/10'}`}>
                                <span className="text-gray-500 font-bold">@</span>
                                <input
                                    value={editForm.username}
                                    onChange={e => setEditForm({ ...editForm, username: e.target.value })}
                                    onBlur={handleUsernameBlur}
                                    className="bg-transparent w-full text-white font-bold outline-none placeholder-gray-700"
                                    placeholder="username"
                                />
                                {isCheckingUsername && <EKGLoader size={24} showLabel={false} className="gap-0" />}
                            </div>
                            {usernameError && <p className="text-red-500 text-xs font-bold ml-1">{usernameError}</p>}
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-gray-500 font-bold uppercase ml-1">Bio</label>
                            <textarea
                                value={editForm.bio}
                                onChange={e => setEditForm({ ...editForm, bio: e.target.value })}
                                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 w-full h-24 text-white font-medium outline-none placeholder-gray-700 resize-none"
                                placeholder="Tell your story..."
                            />
                        </div>
                        <div className="pt-4 border-t border-white/5">
                            <h3 className="text-white font-bold mb-4">Private Info</h3>
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-500 font-bold uppercase ml-1">Mobile</label>
                                    <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center gap-3">
                                        <Phone size={16} className="text-gray-500" />
                                        <input
                                            value={editForm.mobile}
                                            onChange={e => setEditForm({ ...editForm, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                                            className="bg-transparent w-full text-white font-bold outline-none placeholder-gray-700"
                                            placeholder="912 345 6789"
                                            prefix="+63"
                                        />
                                    </div>
                                    <p className="text-[10px] text-gray-600 ml-1">Changing this requires OTP verification.</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-500 font-bold uppercase ml-1">Email</label>
                                    <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center gap-3">
                                        <Mail size={16} className="text-gray-500" />
                                        <input
                                            value={editForm.email}
                                            onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                                            className="bg-transparent w-full text-white font-bold outline-none placeholder-gray-700"
                                            placeholder="Add email for recovery"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Discard Changes Modal */}
                {showDiscardModal && (
                    <div className="absolute inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-200">
                        <div className="bg-card w-full max-w-sm rounded-3xl border border-white/10 p-6 flex flex-col items-center">
                            <h3 className="text-xl font-bold text-white mb-2">Unsaved Changes</h3>
                            <p className="text-gray-400 text-center text-sm mb-6">You have unsaved changes. Do you want to save them before leaving?</p>
                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={handleDiscard}
                                    className="flex-1 py-3 bg-surface text-gray-300 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-white/10 transition-colors"
                                >
                                    Discard
                                </button>
                                <button
                                    onClick={initiateSave}
                                    className="flex-1 py-3 bg-primary text-black rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-lime-400 transition-colors"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* OTP Validation Modal */}
                {showOtpModal && (
                    <div className="absolute inset-0 z-[70] bg-black/95 backdrop-blur-md flex items-center justify-center p-6 animate-in zoom-in-95 duration-200">
                        <div className="w-full max-w-sm flex flex-col items-center">
                            <h3 className="text-2xl font-black italic text-white uppercase mb-2">Verify Number</h3>
                            <p className="text-gray-400 text-sm text-center mb-8">Enter the code sent to <span className="text-white font-bold">+63 {editForm.mobile}</span> to confirm this change.</p>

                            <div className="w-full bg-card border border-white/10 rounded-2xl p-4 mb-6">
                                <input
                                    autoFocus
                                    type="tel"
                                    maxLength={4}
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="w-full bg-transparent text-center text-4xl font-black text-white tracking-[1em] outline-none"
                                    placeholder="0000"
                                />
                            </div>

                            <button onClick={handleVerifyOtp} disabled={otp.length !== 4 || isVerifyingOtp} className={`w-full py-4 rounded-xl font-bold uppercase tracking-wider text-sm transition-all ${otp.length === 4 ? 'bg-primary text-black shadow-[0_0_20px_rgba(204,255,0,0.3)]' : 'bg-surface text-gray-500'}`}>
                                {isVerifyingOtp ? 'Verifying...' : 'Confirm Change'}
                            </button>

                            <button onClick={() => setShowOtpModal(false)} className="mt-6 text-gray-500 font-bold text-xs uppercase tracking-widest hover:text-white">
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    if (view === 'SETTINGS') {
        return (
            <div className="flex-1 bg-black/20 backdrop-blur-2xl h-full overflow-y-auto animate-in slide-in-from-right absolute inset-0 z-50 transition-all border-l border-white/5">
                {renderHeader("Settings")}
                <div className="p-4 space-y-6">
                    <div className="space-y-2">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">App Features</h3>
                        <div className="bg-card rounded-2xl overflow-hidden border border-white/5">
                            <div className="p-4 border-b border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Bell size={18} className="text-white" />
                                    <span className="text-white font-bold">Notifications</span>
                                </div>
                                <div className="w-10 h-6 bg-primary rounded-full relative cursor-pointer"><div className="absolute right-1 top-1 w-4 h-4 bg-black rounded-full" /></div>
                            </div>
                            <div className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Smartphone size={18} className="text-white" />
                                    <span className="text-white font-bold">Audio & Haptics</span>
                                </div>
                                <ChevronLeft className="rotate-180 text-gray-500" size={16} />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Privacy & Data</h3>
                        <div className="bg-card rounded-2xl overflow-hidden border border-white/5">
                            <div className="p-4 border-b border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Shield size={18} className="text-white" />
                                    <span className="text-white font-bold">Privacy Policy</span>
                                </div>
                                <ChevronLeft className="rotate-180 text-gray-500" size={16} />
                            </div>
                            <div className="p-4 border-b border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <FileText size={18} className="text-white" />
                                    <span className="text-white font-bold">Terms & Conditions</span>
                                </div>
                                <ChevronLeft className="rotate-180 text-gray-500" size={16} />
                            </div>
                            <div className="p-4 flex items-center justify-between cursor-pointer active:bg-white/5" onClick={() => showToast("Cache Cleared", 'info')}>
                                <div className="flex items-center gap-3">
                                    <Trash2 size={18} className="text-white" />
                                    <span className="text-white font-bold">Clear Cache</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl border border-red-500/20 bg-red-500/10 flex items-center gap-3 text-red-500 font-bold justify-center mt-8 cursor-pointer active:scale-95 transition-transform" onClick={() => showToast("Deleting account flow...", 'info')}>
                        <Trash2 size={18} />
                        Delete Account
                    </div>
                </div>
            </div>
        );
    }

    if (view === 'ABOUT') {
        return (
            <div className="flex-1 bg-black/20 backdrop-blur-2xl h-full overflow-y-auto animate-in slide-in-from-right absolute inset-0 z-50 transition-all border-l border-white/5">
                {renderHeader("About")}
                <div className="p-4 space-y-4">
                    <div className="bg-card rounded-2xl overflow-hidden border border-white/5">
                        <div className="p-4 border-b border-white/5 flex items-center justify-between cursor-pointer" onClick={() => setShowQr(true)}>
                            <div className="flex items-center gap-3">
                                <Share2 size={18} className="text-white" />
                                <span className="text-white font-bold">Share Account</span>
                            </div>
                            <ChevronLeft className="rotate-180 text-gray-500" size={16} />
                        </div>
                        <div className="p-4 border-b border-white/5 flex items-center justify-between cursor-pointer" onClick={() => showToast("Rate us feature coming soon!", 'info')}>
                            <div className="flex items-center gap-3">
                                <Star size={18} className="text-white" />
                                <span className="text-white font-bold">Rate Be4L</span>
                            </div>
                            <ChevronLeft className="rotate-180 text-gray-500" size={16} />
                        </div>
                        <div className="p-4 border-b border-white/5 flex items-center justify-between cursor-pointer">
                            <div className="flex items-center gap-3">
                                <HelpCircle size={18} className="text-white" />
                                <span className="text-white font-bold">Help & Support</span>
                            </div>
                            <ChevronLeft className="rotate-180 text-gray-500" size={16} />
                        </div>
                        <div className="p-4 flex items-center justify-between cursor-pointer">
                            <div className="flex items-center gap-3">
                                <Info size={18} className="text-white" />
                                <span className="text-white font-bold">About Be4L</span>
                            </div>
                            <ChevronLeft className="rotate-180 text-gray-500" size={16} />
                        </div>
                    </div>
                    <div className="text-center mt-10">
                        <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest">Version 0.6.0 (Beta)</p>
                        <p className="text-gray-700 text-[9px] mt-1">Made with ❤️ for Life</p>
                    </div>
                </div>
            </div>
        )
    }

    if (view === 'ADD_FRIENDS') {
        return (
            <div className="flex-1 bg-black/20 backdrop-blur-2xl h-full overflow-y-auto animate-in slide-in-from-right absolute inset-0 z-50 transition-all border-l border-white/5">
                {renderHeader("Add People")}
                <div className="p-4">
                    <div className="bg-card border border-white/10 rounded-2xl p-4 flex items-center gap-3 mb-6">
                        <Search size={20} className="text-gray-500" />
                        <input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Find friends..."
                            className="bg-transparent text-white font-bold w-full outline-none placeholder-gray-600"
                        />
                    </div>

                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Suggestions</h3>
                    <div className="space-y-4">
                        {OTHER_USERS.map(u => (
                            <div key={u.id} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <img src={u.avatar_url} className="w-12 h-12 rounded-full border border-white/5" />
                                    <div>
                                        <h4 className="text-white font-bold">{u.name || u.username}</h4>
                                        <p className="text-gray-500 text-xs">@{u.username}</p>
                                    </div>
                                </div>
                                <button className="px-4 py-2 bg-primary text-black rounded-lg text-xs font-black uppercase tracking-wider hover:bg-lime-400">Add</button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    if (view === 'FRIENDS_LIST') {
        return (
            <div className="flex-1 bg-black/20 backdrop-blur-2xl h-full overflow-y-auto animate-in slide-in-from-right absolute inset-0 z-50 transition-all border-l border-white/5">
                {renderHeader("Friends")}
                <div className="p-4 space-y-4">
                    {OTHER_USERS.slice(0, 2).map(u => (
                        <div key={u.id} className="flex items-center justify-between bg-card p-3 rounded-xl border border-white/5">
                            <div className="flex items-center gap-3">
                                <img src={u.avatar_url} className="w-12 h-12 rounded-full" />
                                <div>
                                    <h4 className="text-white font-bold">{u.name || u.username}</h4>
                                    <p className="text-gray-500 text-xs">@{u.username}</p>
                                </div>
                            </div>
                            <button className="p-2 bg-white/5 rounded-lg text-gray-400 hover:text-white"><MoreVertical size={16} /></button>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    if (view === 'FOLLOWING_LIST') {
        return (
            <div className="flex-1 bg-black/20 backdrop-blur-2xl h-full overflow-y-auto animate-in slide-in-from-right absolute inset-0 z-50 transition-all border-l border-white/5">
                {renderHeader("Following")}
                <div className="p-4 space-y-4">
                    {OTHER_USERS.map(u => (
                        <div key={u.id} className="flex items-center justify-between bg-card p-3 rounded-xl border border-white/5">
                            <div className="flex items-center gap-3">
                                <img src={u.avatar_url} className="w-12 h-12 rounded-full" />
                                <div>
                                    <h4 className="text-white font-bold">{u.name || u.username}</h4>
                                    <p className="text-gray-500 text-xs">@{u.username}</p>
                                </div>
                            </div>
                            <button className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-xs font-bold text-gray-300">Following</button>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="flex-1 overflow-y-auto pb-24 relative animate-in slide-in-from-right duration-200 h-full">
            {/* Top Bar */}
            <div className="absolute left-0 right-0 top-0 p-6 pt-12 flex justify-between items-center z-10">
                <button
                    onClick={onBack}
                    className="p-2 bg-black/40 backdrop-blur-md rounded-full text-white border border-white/10"
                >
                    <ChevronLeft size={24} />
                </button>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowQr(true)}
                        className="p-2 bg-black/40 backdrop-blur-md rounded-full text-white border border-white/10"
                    >
                        <QrCode size={20} />
                    </button>
                    <button
                        onClick={() => setView('ADD_FRIENDS')}
                        className="p-2 bg-black/40 backdrop-blur-md rounded-full text-white border border-white/10"
                    >
                        <UserPlus size={20} />
                    </button>
                    {isMe && (
                        <div className="relative">
                            <button
                                onClick={() => setShowMenu(!showMenu)}
                                className="p-2 bg-black/40 backdrop-blur-md rounded-full text-white border border-white/10"
                            >
                                <MoreVertical size={20} />
                            </button>

                            {/* 3 Dots Menu */}
                            {showMenu && (
                                <>
                                    <div className="absolute inset-0 z-40" onClick={() => setShowMenu(false)} />
                                    <div className="absolute right-0 top-12 w-48 bg-card border border-white/10 rounded-xl shadow-2xl z-50 p-1 flex flex-col animate-in fade-in zoom-in-95 duration-100">
                                        <button onClick={() => { setView('ACCOUNT'); setShowMenu(false); }} className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white/5 text-left transition-colors">
                                            <User size={16} className="text-white" />
                                            <span className="text-sm font-bold text-white">Account</span>
                                        </button>
                                        <button onClick={() => { setView('SETTINGS'); setShowMenu(false); }} className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white/5 text-left transition-colors">
                                            <Settings size={16} className="text-white" />
                                            <span className="text-sm font-bold text-white">Settings</span>
                                        </button>
                                        <button onClick={() => { setView('ABOUT'); setShowMenu(false); }} className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white/5 text-left transition-colors">
                                            <Info size={16} className="text-white" />
                                            <span className="text-sm font-bold text-white">About</span>
                                        </button>
                                        <div className="h-[1px] bg-white/5 my-1" />
                                        <button onClick={() => { onLogout?.(); setShowMenu(false); }} className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-red-500/10 text-left transition-colors text-red-500">
                                            <LogOut size={16} />
                                            <span className="text-sm font-bold">Log Out</span>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Profile Header */}
            <div className="pt-24 pb-8 flex flex-col items-center relative">
                <div className="relative mb-6 group">
                    {/* Gradient border effect */}
                    <div className="absolute -inset-1 bg-gradient-to-tr from-primary to-emerald-400 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative w-28 h-28 p-[2px] bg-black rounded-full overflow-hidden cursor-pointer" onClick={() => setShowPfpModal(true)}>
                        {user.avatar_url ? (
                            <img src={user.avatar_url} alt="Profile" className="w-full h-full rounded-full object-cover" />
                        ) : (
                            <div className="w-full h-full rounded-full bg-surface flex items-center justify-center">
                                <User size={48} className="text-gray-400" />
                            </div>
                        )}
                    </div>
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-black px-1.5 py-0.5 rounded-full border border-gray-800 scale-90 z-10 shadow-lg">
                        <StreakBadge count={user.streak_count} active={(() => {
                            if (!user.last_posted_date) return false;
                            const today = new Date();
                            const last = new Date(user.last_posted_date);
                            return today.toDateString() === last.toDateString();
                        })()} />
                    </div>
                </div>

                <div className="text-center space-y-0.5 mb-6 px-6">
                    <h1 className="text-xl font-black italic text-white tracking-tight">{user.name || user.username}</h1>
                    {user.name && <p className="text-xs font-bold text-gray-500">@{user.username}</p>}
                    <p className="text-gray-400 text-sm max-w-[250px] mx-auto mt-2 leading-relaxed">{user.bio}</p>
                </div>

                {/* Stats */}
                <div className="flex gap-8 mt-2 w-full justify-center px-6">
                    <button onClick={() => setView('FRIENDS_LIST')} className="flex flex-col items-center flex-1 active:scale-95 transition-transform">
                        <span className="text-lg font-black text-white">{user.friends_count || 0}</span>
                        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-1">Friends</span>
                    </button>
                    <div className="flex bg-white/5 w-[1px] h-10 rounded-full" />
                    <button onClick={() => setView('FOLLOWING_LIST')} className="flex flex-col items-center flex-1 active:scale-95 transition-transform">
                        <span className="text-lg font-black text-white">{user.following_count || 0}</span>
                        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-1">Following</span>
                    </button>
                    <div className="flex bg-white/5 w-[1px] h-10 rounded-full" />
                    <button onClick={onOpenMyQuests} className="flex flex-col items-center flex-1 active:scale-95 transition-transform">
                        <span className="text-lg font-black text-white">{user.quest_count || 0}</span>
                        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-1">Quests</span>
                    </button>
                </div>

                {/* Edit Button */}
                {isMe && (
                    <button onClick={() => setView('ACCOUNT')} className="mt-8 py-3 px-8 bg-white/5 border border-white/10 rounded-xl w-[200px] text-xs font-black uppercase tracking-widest hover:bg-white/10 active:scale-95 transition-all">
                        Edit Profile
                    </button>
                )}
            </div>

            {/* Content Tabs */}
            <div className="px-4">
                <div className="flex items-center gap-2 mb-4">
                    <ImageIcon size={16} className="text-primary" />
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">Your Lore</h3>
                </div>

                {/* Memories Grid */}
                <div className="grid grid-cols-3 gap-1 rounded-2xl overflow-hidden">
                    {vault.map((item, idx) => (
                        <div key={idx} className="aspect-[3/4] bg-gray-900 relative group overflow-hidden cursor-pointer" onClick={() => onOpenPostDetail?.(item)}>
                            <img src={item.back_image_url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            {/* Timestamp overlay */}
                            <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                                <p className="text-[9px] font-bold text-white uppercase">Just Now</p>
                            </div>
                            {/* PIP */}
                            <div className="absolute top-2 left-2 w-8 h-10 border border-black/20 rounded overflow-hidden shadow-lg"><img src={item.front_image_url} className="w-full h-full object-cover" /></div>
                        </div>
                    ))}
                    {vault.length === 0 && (
                        <div className="col-span-3 py-12 flex flex-col items-center justify-center text-gray-600 border border-white/5 rounded-2xl bg-white/5">
                            <Camera size={32} className="mb-2 opacity-50" />
                            <p className="text-xs font-bold uppercase tracking-widest">No Lore yet</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Safe Area Bottom Space */}
            <div className="h-24" />

            {/* QR Code Modal */}
            {showQr && (
                <div className="absolute inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-200" onClick={() => setShowQr(false)}>
                    <div className="bg-card w-full max-w-sm rounded-3xl border border-white/10 p-6 flex flex-col items-center relative" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setShowQr(false)} className="absolute top-4 right-4 p-2 bg-surface rounded-full text-white"><X size={16} /></button>

                        <div className="mt-4 mb-2 relative">
                            <div className="absolute -inset-4 bg-gradient-to-br from-primary via-blue-500 to-purple-500 rounded-[2rem] blur-lg opacity-50"></div>
                            <div className="bg-white p-4 rounded-2xl relative">
                                {/* Use an icon as placeholder for real QR */}
                                <QrCode size={180} className="text-black" />
                            </div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-black rounded-full flex items-center justify-center border-4 border-white">
                                <img src={user.avatar_url} className="w-full h-full rounded-full object-cover" />
                            </div>
                        </div>

                        <h2 className="text-2xl font-black italic text-white mt-6">@{user.username}</h2>
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-8">Scan to join my quest</p>

                        <div className="w-full flex gap-3">
                            <button className="flex-1 py-3 bg-white text-black rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-primary transition-colors">
                                <Download size={16} /> Save
                            </button>
                            <button className="flex-1 py-3 bg-surface text-white border border-white/10 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-white/10 transition-colors" onClick={() => { navigator.clipboard.writeText(`https://be4l.app/${user.username}`); showToast("Link Copied!", 'success'); }}>
                                <Copy size={16} /> Link
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* PFP View Modal */}
            {showPfpModal && (
                <div className="absolute inset-0 z-[70] bg-black/95 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-200" onClick={() => setShowPfpModal(false)}>
                    <button onClick={() => setShowPfpModal(false)} className="absolute top-6 right-6 p-2 bg-white/10 rounded-full text-white hover:bg-white/20 z-50">
                        <X size={24} />
                    </button>

                    <div className="relative w-full max-w-sm aspect-square rounded-full overflow-hidden border-4 border-white/10 shadow-2xl p-1 bg-black" onClick={e => e.stopPropagation()}>
                        {user.avatar_url ? (
                            <img src={user.avatar_url} className="w-full h-full rounded-full object-cover" />
                        ) : (
                            <div className="w-full h-full rounded-full bg-surface flex items-center justify-center">
                                <User size={120} className="text-gray-400" />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileScreen;
