import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ToastProvider, useToast } from './components/Toast';
import { Home, Compass, PlusSquare, Map as MapIcon, User, Search, Camera, Send, X, ArrowRight, Grid, Image as ImageIcon, Trophy, Swords, UserPlus, ChevronLeft, ChevronDown, ChevronUp, Phone, AtSign, FileText, Upload, Check, Minus, Plus, MessageCircle, Bell, Music, MapPin, Zap, RefreshCw, Flashlight, Mic, Tag, Calendar, DollarSign, Lock, Globe, Users, Clock, MapPinOff, MoreHorizontal, Share2, Smile, Reply, Edit2, Play, Pause, ExternalLink, Flag, Trash2, History as HistoryIcon, MoreVertical, Heart, MessageSquare, Ticket, Activity } from 'lucide-react';
import { User as UserType, Capture, Reaction, Quest, QuestStatus, QuestType, Competition } from './types';
import { supabaseService } from './services/supabaseService';
import { COLORS, MOCK_USER, OTHER_USERS, POSITIVE_QUOTES, MOCK_COMPETITIONS } from './constants';
import DualCameraPost from './components/DualCameraPost';
import TopBar from './components/TopBar';
import QuestCard from './components/QuestCard';
import CompetitionCard from './components/CompetitionCard';
import StreakBadge from './components/StreakBadge';
import QuestDetailsScreen from './components/QuestDetailsScreen';
import CompetitionDetailsScreen from './components/CompetitionDetailsScreen';
import CreateQuestScreen from './components/CreateQuestScreen';
import QuestMap from './components/Quest/QuestMap';
import QuestGeneratorUI from './components/Quest/QuestGeneratorUI';
import QuestsScreen from './components/QuestsScreen';
import BookScreen from './components/BookScreen';
import PostDetailScreen from './components/PostDetailScreen';
import ChatListScreen from './components/Chat/ChatListScreen';
import ChatDetailScreen from './components/Chat/ChatDetailScreen';
import ProfileScreen from './components/ProfileScreen';
import { audioService } from './services/audioService';
import { AestheticAppBackground, GradientButton, FeedPlaceholder, GlassCard, GlowText, EKGLoader, HeartbeatTransition, DailyCountdown, MissionTimeline, FloatingTabs } from './components/ui/AestheticComponents';
import SearchScreen from './components/SearchScreen';
import NotificationsScreen from './components/NotificationsScreen';
import NotFoundScreen from './components/NotFoundScreen';
import { dailyService } from './services/dailyService';
import DualCameraView from './components/DualCameraView';
import CameraFlow from './components/CameraFlow';
import { generateRandomQuests } from './utils/questGenerator';
import DailyQuestListModal from './components/DailyQuestListModal';
import LandingPage from './components/LandingPage';

// --- Constants ---



// --- Components ---

const ImageCropper = ({ imageSrc, onCancel, onComplete }: { imageSrc: string, onCancel: () => void, onComplete: (croppedUrl: string) => void }) => {
    const [zoom, setZoom] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [baseScale, setBaseScale] = useState(1);
    const lastPos = useRef({ x: 0, y: 0 });
    const imgRef = useRef<HTMLImageElement>(null);

    const VIEWPORT_SIZE = 280;

    const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const { naturalWidth, naturalHeight } = e.currentTarget;
        const scale = Math.max(VIEWPORT_SIZE / naturalWidth, VIEWPORT_SIZE / naturalHeight);
        setBaseScale(scale);
    };

    const handlePointerDown = (e: React.PointerEvent) => {
        setIsDragging(true);
        lastPos.current = { x: e.clientX, y: e.clientY };
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDragging) return;
        const dx = e.clientX - lastPos.current.x;
        const dy = e.clientY - lastPos.current.y;
        setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
        lastPos.current = { x: e.clientX, y: e.clientY };
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        setIsDragging(false);
        if (e.target instanceof HTMLElement) {
            try { (e.target as HTMLElement).releasePointerCapture(e.pointerId); } catch (err) { }
        }
    };

    const handleCrop = () => {
        const canvas = document.createElement('canvas');
        canvas.width = VIEWPORT_SIZE;
        canvas.height = VIEWPORT_SIZE;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const img = new Image();
        img.src = imageSrc;
        img.onload = () => {
            const scale = Math.max(VIEWPORT_SIZE / img.naturalWidth, VIEWPORT_SIZE / img.naturalHeight);

            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, VIEWPORT_SIZE, VIEWPORT_SIZE);

            ctx.translate(VIEWPORT_SIZE / 2, VIEWPORT_SIZE / 2);
            ctx.translate(offset.x, offset.y);
            ctx.scale(scale * zoom, scale * zoom);
            ctx.translate(-img.naturalWidth / 2, -img.naturalHeight / 2);

            ctx.drawImage(img, 0, 0);

            onComplete(canvas.toDataURL('image/jpeg', 0.9));
        };
    };

    return (
        <div className="absolute inset-0 z-[60] bg-black flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="w-full max-w-sm flex flex-col items-center">
                <h3 className="text-white font-black text-2xl mb-8 italic tracking-tighter uppercase">Adjust Photo</h3>
                <div
                    className="relative bg-black border-2 border-primary overflow-hidden touch-none cursor-move shadow-[0_0_30px_rgba(204,255,0,0.1)]"
                    style={{ width: VIEWPORT_SIZE, height: VIEWPORT_SIZE, borderRadius: '50%' }}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerLeave={handlePointerUp}
                >
                    <img
                        ref={imgRef}
                        src={imageSrc}
                        onLoad={onImageLoad}
                        className="absolute max-w-none origin-center pointer-events-none select-none"
                        style={{
                            left: '50%',
                            top: '50%',
                            transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) scale(${baseScale * zoom})`
                        }}
                        draggable={false}
                        alt="Crop preview"
                    />
                </div>
                <div className="w-full mt-10 space-y-8">
                    <div className="flex items-center gap-4 bg-card px-4 py-3 rounded-2xl border border-white/10">
                        <Minus size={16} className="text-gray-500" />
                        <input
                            type="range"
                            min="1"
                            max="3"
                            step="0.05"
                            value={zoom}
                            onChange={(e) => setZoom(parseFloat(e.target.value))}
                            className="flex-1 accent-primary h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                        />
                        <Plus size={16} className="text-gray-500" />
                    </div>
                    <div className="flex gap-4">
                        <button onClick={onCancel} className="flex-1 py-4 rounded-xl font-bold bg-surface text-gray-400 border border-white/5 hover:bg-gray-800 transition-colors uppercase tracking-widest text-xs">
                            Cancel
                        </button>
                        <button onClick={handleCrop} className="flex-1 py-4 rounded-xl font-bold bg-primary text-black shadow-[0_0_20px_rgba(204,255,0,0.4)] hover:bg-lime-400 transition-colors uppercase tracking-widest text-xs flex items-center justify-center gap-2">
                            <Check size={16} strokeWidth={3} /> Save Photo
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

const SplashScreen: React.FC<{ onComplete: (user: UserType) => void }> = ({ onComplete }) => {
    const [step, setStep] = useState<'SPLASH' | 'FEATURES' | 'PHONE' | 'OTP' | 'SETUP'>('SPLASH');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [username, setUsername] = useState('');
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [editingImage, setEditingImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [resendTimer, setResendTimer] = useState(0);
    const [splashFadingOut, setSplashFadingOut] = useState(false);
    const [isFlatline, setIsFlatline] = useState(false);
    const { showToast } = useToast();

    const isPhoneValid = phone.length === 10;
    const isOtpValid = otp.length === 4;

    useEffect(() => {
        if (step === 'SPLASH') {
            const flatlineTimer = setTimeout(() => setIsFlatline(true), 8000);
            const fadeOutTimer = setTimeout(() => setSplashFadingOut(true), 9000);
            const timer = setTimeout(() => setStep('FEATURES'), 10500);
            return () => {
                clearTimeout(timer);
                clearTimeout(fadeOutTimer);
                clearTimeout(flatlineTimer);
            };
        }
    }, [step]);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (resendTimer > 0) {
            interval = setInterval(() => {
                setResendTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [resendTimer]);

    const [realUserId, setRealUserId] = useState<string | null>(null);

    const handleSendCode = async () => {
        if (!isPhoneValid) return;
        setIsLoading(true);
        await supabaseService.auth.sendOtp(phone);
        setIsLoading(false);
        setStep('OTP');
        setResendTimer(30);
    };

    const handleResendCode = async () => {
        if (resendTimer > 0) return;
        setIsLoading(true);
        await supabaseService.auth.sendOtp(phone);
        setIsLoading(false);
        setResendTimer(30);
    };

    const handleVerify = async () => {
        if (!isOtpValid) return;
        setIsLoading(true);
        const res = await supabaseService.auth.verifyOtp(phone, otp);
        setIsLoading(false);
        if (res.user) {
            setRealUserId(res.user.id);
            setStep('SETUP');
        } else {
            showToast(res.error || "Authentication failed. Try again.", 'error');
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditingImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCompleteSetup = async (specificAvatarUrl?: string) => {
        setErrorMsg('');
        if (!username.trim() || !realUserId) return;
        setIsLoading(true);
        const isAvailable = await supabaseService.auth.checkUsernameAvailability(username);
        if (!isAvailable) {
            setIsLoading(false);
            setErrorMsg("This Be4L name is already taken. Try another.");
            return;
        }

        const finalAvatarUrl = specificAvatarUrl || avatarPreview || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'U')}&background=18181b&color=fff&bold=true`;

        await supabaseService.auth.updateProfile(realUserId, {
            username,
            name,
            bio,
            avatar_url: finalAvatarUrl
        });
        setIsLoading(false);
        onComplete({
            id: realUserId,
            username,
            name,
            bio,
            avatar_url: finalAvatarUrl,
            streak_count: 0
        });
    };

    if (editingImage) {
        return (
            <ImageCropper
                imageSrc={editingImage}
                onCancel={() => {
                    setEditingImage(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                onComplete={(croppedUrl) => {
                    setAvatarPreview(croppedUrl);
                    setEditingImage(null);
                }}
            />
        );
    }

    if (step === 'SPLASH') {
        return (
            <div className={`absolute inset-0 flex flex-col items-center justify-center p-6 bg-transparent z-[100] transition-opacity duration-1000 ease-in-out ${splashFadingOut ? 'opacity-0' : 'opacity-100'} animate-in fade-in duration-1000`}>
                <div className={`flex flex-col items-center justify-center w-full max-w-xs ${!isFlatline ? 'animate-heartbeat' : ''}`}>
                    <div className={`absolute w-48 h-48 bg-primary/10 blur-[80px] rounded-full pointer-events-none transition-opacity duration-1000 ${isFlatline ? 'opacity-0' : 'opacity-100'}`} />
                    <div className={`relative flex items-center justify-center px-8 py-4 bg-black/40 backdrop-blur-3xl rounded-3xl transition-all duration-1000 border ${isFlatline ? 'border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.1)]' : 'border-white/5 shadow-2xl'} mb-12`}>
                        <h1 className={`text-5xl font-black italic tracking-tighter transition-all duration-1000 ${isFlatline ? 'text-gray-600 opacity-50' : 'text-primary'}`} style={{ textShadow: isFlatline ? 'none' : '0 0 20px rgba(204, 255, 0, 0.3)' }}>
                            Be4L
                        </h1>
                    </div>
                    <div className="relative flex flex-col items-center">
                        <svg width="160" height="40" viewBox="0 0 200 40" className="drop-shadow-[0_0_10px_rgba(204,255,0,0.4)]">
                            <path
                                d="M 0 20 L 20 20 L 22 5 L 25 35 L 28 20 L 65 20 L 67 5 L 70 35 L 73 20 L 95 20 C 95 18, 98 18, 100 20 C 102 22, 105 22, 105 20 C 105 18, 102 18, 100 20 C 98 22, 95 22, 95 20 L 122 20 L 124 5 L 127 35 L 130 20 L 165 20 L 167 5 L 170 35 L 173 20 L 200 20"
                                fill="none"
                                stroke={isFlatline ? "rgba(239,68,68,0.2)" : "rgba(204,255,0,0.05)"}
                                strokeWidth="2"
                                strokeLinecap="round"
                            />
                            <path
                                d="M 0 20 L 20 20 L 22 5 L 25 35 L 28 20 L 65 20 L 67 5 L 70 35 L 73 20 L 95 20 C 95 18, 98 18, 100 20 C 102 22, 105 22, 105 20 C 105 18, 102 18, 100 20 C 98 22, 95 22, 95 20 L 122 20 L 124 5 L 127 35 L 130 20 L 165 20 L 167 5 L 170 35 L 173 20 L 200 20"
                                fill="none"
                                stroke={isFlatline ? "#ef4444" : "#CCFF00"}
                                strokeWidth="3"
                                strokeLinecap="round"
                                className={isFlatline ? "animate-flatline-lore" : "animate-ekg-sync"}
                            />
                        </svg>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full animate-in fade-in duration-500">
            {step === 'FEATURES' && (
                <div className="p-6 flex flex-col justify-between h-full safe-area-bottom">
                    <div className="mt-8 flex flex-col items-center w-full">
                        <h1 className="text-5xl font-black italic text-primary mb-2" style={{ textShadow: '0 0 20px rgba(204, 255, 0, 0.3)' }}>Be4L</h1>
                        <p className="text-white/40 text-[9px] tracking-[0.2em] uppercase font-bold text-center w-full">always for life</p>
                    </div>

                    <div className="flex-1 flex flex-col justify-center space-y-3 my-8 overflow-y-auto no-scrollbar">
                        {[
                            { icon: <Grid size={20} className="text-primary" />, title: "POST LORE", desc: "Share real-world activities as they happen and collect memories." },
                            { icon: <Swords size={20} className="text-primary" />, title: "FIND AND JOIN SIDE QUESTS", desc: "Sports, adventures, flea markets, parties, etc." },
                            { icon: <UserPlus size={20} className="text-primary" />, title: "ADD PEOPLE", desc: "Discover friends or make new friends." },
                            { icon: <Trophy size={20} className="text-primary" />, title: "FIND AND JOIN COMPETITIONS", desc: "Discover tournaments, marathons, etc. — prized or just for fun." },
                            { icon: <MapIcon size={20} className="text-primary" />, title: "BOOK ANYTHING", desc: "Book anything from courts and venues to tickets, hotels, and more." },
                        ].map((f, i) => (
                            <GlassCard key={i} className="p-4 flex items-center gap-4 border border-primary/10 hover:border-primary/40 group transition-all duration-300">
                                <div className="p-3 bg-primary/10 rounded-2xl shrink-0 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                                    {f.icon}
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-[11px] uppercase italic tracking-wider">{f.title}</h3>
                                    <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">{f.desc}</p>
                                </div>
                            </GlassCard>
                        ))}
                    </div>

                    <div className="mt-6 mb-8 flex flex-col gap-3">
                        <GradientButton onClick={() => setStep('PHONE')} fullWidth>
                            Get Started
                        </GradientButton>
                        <button
                            onClick={() => onComplete(MOCK_USER)}
                            className="w-full py-4 text-[10px] font-black uppercase tracking-[0.3em] text-white/30 hover:text-white/60 transition-colors"
                        >
                            Skip for now (Dev Mode)
                        </button>
                    </div>
                </div>
            )}

            {step === 'PHONE' && (
                <div className="p-6 flex flex-col h-full safe-area-bottom">
                    <div className="mt-4 mb-8">
                        <button onClick={() => setStep('FEATURES')} className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white/70 hover:text-white mb-6 border border-white/10 transition-colors">
                            <ChevronLeft size={24} />
                        </button>
                        <GlowText size="lg" className="uppercase mb-2">Real ones only</GlowText>
                        <p className="text-gray-400 text-sm font-medium">Drop the celly so we know it’s you.</p>
                    </div>
                    <div className="flex-1">
                        <GlassCard className="p-5 flex items-center gap-4 bg-black/60 border-primary/20">
                            <div className="flex items-center gap-2 border-r border-white/10 pr-5">
                                <Phone size={20} className="text-primary" />
                                <span className="text-white font-black">+63</span>
                            </div>
                            <input type="tel" autoFocus value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="967 123 4567" className="bg-transparent text-white font-black text-2xl w-full outline-none placeholder-white/20 tracking-widest" />
                        </GlassCard>
                    </div>
                    <div className="mt-6 mb-8">
                        <GradientButton onClick={handleSendCode} disabled={isLoading || !isPhoneValid} fullWidth>
                            {isLoading ? 'Sending...' : 'Continue'}
                        </GradientButton>
                    </div>
                </div>
            )}

            {step === 'OTP' && (
                <div className="p-6 flex flex-col h-full safe-area-bottom">
                    <div className="mt-4 mb-8">
                        <button onClick={() => setStep('PHONE')} className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white/70 hover:text-white mb-6 border border-white/10 transition-colors">
                            <ChevronLeft size={24} />
                        </button>
                        <GlowText size="lg" className="uppercase mb-2">Check the pings</GlowText>
                        <p className="text-gray-400 text-sm font-medium italic">Sent to +63 {phone}</p>
                    </div>
                    <div className="flex-1 flex flex-col items-center justify-center -mt-20">
                        <div className="relative w-full flex justify-center mb-8">
                            <div className="flex gap-4">
                                {[0, 1, 2, 3].map((idx) => (
                                    <GlassCard key={idx} className={`w-14 h-18 rounded-2xl border-2 flex items-center justify-center text-3xl font-black transition-all ${otp.length === idx ? 'border-primary bg-primary/5 scale-110 shadow-lg' : otp[idx] ? 'border-primary text-primary bg-primary/5' : 'border-white/10 text-gray-700 bg-white/5'}`}>
                                        {otp[idx] || "•"}
                                    </GlassCard>
                                ))}
                            </div>
                            <input type="tel" maxLength={4} autoFocus value={otp} onChange={(e) => setOtp(e.target.value.slice(0, 4))} className="absolute inset-0 opacity-0 cursor-text" />
                        </div>
                        <button onClick={handleResendCode} disabled={resendTimer > 0 || isLoading} className={`text-xs font-black uppercase tracking-widest mt-4 ${resendTimer > 0 ? 'text-white/20' : 'text-primary'}`}>
                            {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Run it back."}
                        </button>
                    </div>
                    <div className="mt-6 mb-8 flex flex-col gap-3">
                        <GradientButton onClick={handleVerify} disabled={isLoading || !isOtpValid} fullWidth>
                            {isLoading ? 'Verifying...' : 'Verify OTP'}
                        </GradientButton>
                        <button
                            onClick={() => onComplete(MOCK_USER)}
                            className="w-full py-4 text-[10px] font-black uppercase tracking-[0.3em] text-white/30 hover:text-white/60 transition-colors"
                        >
                            Skip for now (Dev Mode)
                        </button>
                    </div>
                </div>
            )}

            {step === 'SETUP' && (
                <div className="p-6 flex flex-col h-full safe-area-bottom">
                    <div className="mt-4 mb-8">
                        <GlowText size="lg" className="uppercase mb-2">who r u?</GlowText>
                        <p className="text-gray-400 text-sm font-medium">Create your identity in the void.</p>
                    </div>
                    <div className="flex-1 flex flex-col gap-6 overflow-y-auto no-scrollbar">
                        <div className="flex justify-center py-2">
                            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*" />
                                <div className={`w-28 h-28 rounded-full bg-surface border-2 flex items-center justify-center overflow-hidden transition-all duration-300 ${avatarPreview ? 'border-primary' : 'border-primary/20 group-hover:border-primary'}`}>
                                    {avatarPreview ? <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" /> : <User size={48} className="text-white/20" />}
                                </div>
                                <div className="absolute -bottom-1 right-1 bg-primary p-2 rounded-full text-black shadow-lg border-4 border-black">
                                    <PlusSquare size={16} strokeWidth={3} />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Full Name</label>
                                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Satoshi Nakamoto" className="bg-white/5 border border-white/10 rounded-2xl p-4 w-full text-white font-bold outline-none focus:border-primary/50 transition-all placeholder-white/5" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Username</label>
                                <div className={`bg-white/5 border rounded-2xl p-4 flex items-center transition-all ${errorMsg ? 'border-red-500' : 'border-white/10 focus-within:border-primary/50'}`}>
                                    <span className="text-gray-600 mr-1 font-bold">@</span>
                                    <input type="text" value={username} onChange={(e) => { setUsername(e.target.value); setErrorMsg(''); }} placeholder="badsiro4l" className="bg-transparent text-white font-bold w-full outline-none placeholder-white/5" />
                                </div>
                                {errorMsg && <p className="text-red-500 text-[10px] font-bold ml-2">{errorMsg}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Bio</label>
                                <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="What's the vibe?" className="bg-white/5 border border-white/10 rounded-2xl p-4 w-full h-24 text-white font-medium outline-none resize-none focus:border-primary/50 transition-all placeholder-white/5" maxLength={150} />
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 mb-8">
                        <GradientButton onClick={() => handleCompleteSetup()} disabled={isLoading || !username.trim() || !name.trim()} fullWidth>
                            {isLoading ? 'Creating Profile...' : 'LFG'}
                        </GradientButton>
                    </div>
                </div>
            )}
        </div>
    );
};

// CameraFlow moved to components/CameraFlow.tsx









const LoreFeed: React.FC<{
    onOpenProfile: () => void,
    onOpenPostDetail: (c: Capture) => void,
    onUserClick: (u: UserType) => void,
    refreshTrigger: number,
    currentUser: UserType,
    onNavigate: (tab: 'HOME' | 'QUESTS' | 'CHATS' | 'BOOK' | 'SEARCH' | 'NOTIFICATIONS') => void,
    onLaunchCamera: () => void,
    hasUserPostedToday: boolean,
    onOpenQuestList: () => void,
    onReset?: () => void,
    forceLoading?: boolean
}> = ({ onOpenProfile, onOpenPostDetail, onUserClick, refreshTrigger, currentUser, onNavigate, onLaunchCamera, hasUserPostedToday, onOpenQuestList, onReset, forceLoading }) => {
    const [activeFeed, setActiveFeed] = useState<'discover' | 'friends'>('discover');
    const [captures, setCaptures] = useState<any[]>([]);
    const [recallCaptures, setRecallCaptures] = useState<Capture[]>([]);
    const [loading, setLoading] = useState(true);
    const [isPreparing, setIsPreparing] = useState(false);
    // Scroll Logic for Sync Top Bar
    const [topBarY, setTopBarY] = useState(0);
    const lastScrollY = useRef(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const lastClickTimeRef = useRef(0);

    const [showGrid, setShowGrid] = useState(false);
    const [pullDistance, setPullDistance] = useState(0);
    const touchY = useRef(0);
    const touchStartX = useRef(0);
    const touchStartY = useRef(0);

    const handlePointerDown = (e: React.PointerEvent) => {
        touchStartX.current = e.clientX;
        touchStartY.current = e.clientY;
        if (containerRef.current?.scrollTop === 0) {
            touchY.current = e.clientY;
        } else {
            touchY.current = 0;
        }
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (touchY.current === 0) return;
        const deltaY = e.clientY - touchY.current;

        if (!showGrid && (containerRef.current?.scrollTop || 0) <= 0) {
            setPullDistance(Math.max(0, deltaY));
        }
    };

    const handleWheel = (e: React.WheelEvent) => {
        if (containerRef.current?.scrollTop === 0 && e.deltaY < -50 && !showGrid) {
            setShowGrid(true);
            if (window.navigator.vibrate) window.navigator.vibrate(10);
        }
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        if (pullDistance > 220) {
            setShowGrid(true);
            if (window.navigator.vibrate) window.navigator.vibrate(15);
        }
        setPullDistance(0);
        touchY.current = 0;

        const deltaX = e.clientX - touchStartX.current;
        const deltaY = e.clientY - touchStartY.current;

        // Horizontal swipe: move distance > 50 and must be more horizontal than vertical
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
            if (deltaX > 50 && activeFeed === 'friends') {
                handleFeedSwitch('discover');
            } else if (deltaX < -50 && activeFeed === 'discover') {
                handleFeedSwitch('friends');
            }
        }
    };

    const handleLogoClick = () => {
        const now = Date.now();
        if (now - lastClickTimeRef.current < 300) {
            onNavigate('HOME');
        } else {
            containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
        }
        lastClickTimeRef.current = now;
    };

    const handleScroll = () => {
        const currentScrollY = containerRef.current?.scrollTop || 0;
        const delta = currentScrollY - lastScrollY.current;

        if (currentScrollY > 10) {
            setTopBarY(prev => {
                const newY = prev - delta;
                return Math.max(-80, Math.min(0, newY)); // Cap at top bar height (~80px)
            });
        } else {
            setTopBarY(0);
        }

        lastScrollY.current = currentScrollY;
    };

    const fetchFeedData = async () => {
        setLoading(true);
        try {
            const feedData = await supabaseService.captures.getFeed(activeFeed, currentUser.id);
            setCaptures(feedData);

            const recallData = await supabaseService.captures.getRecallCaptures(currentUser.id);
            setRecallCaptures(recallData);
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    useEffect(() => {
        fetchFeedData();
    }, [refreshTrigger, currentUser.last_posted_date, activeFeed]);

    const isLoading = loading || forceLoading;

    const handleFeedSwitch = (type: 'discover' | 'friends') => {
        if (activeFeed === type) return;
        setActiveFeed(type);
        // Haptic
        if (window.navigator.vibrate) window.navigator.vibrate(5);
    };

    return (
        <div className="relative flex-1 h-full w-full flex flex-col overflow-hidden bg-deep-black">
            {/* Top Bar - Absolute Overlay */}
            <TopBar
                translateY={topBarY}
                onOpenProfile={onOpenProfile}
                user={currentUser}
                onLogoClick={handleLogoClick}
                onSearchClick={() => onNavigate('SEARCH')}
                onNotificationsClick={() => onNavigate('NOTIFICATIONS')}
                onQuestListClick={onOpenQuestList}
                onTimerZero={onReset}
                hasUserPostedToday={hasUserPostedToday}
            />

            {/* SECONDARY HEADER - TABS (Fixed behavior under TopBar) */}
            {!showGrid && (
                <motion.div
                    animate={{ y: topBarY }}
                    transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                    className="absolute top-[80px] left-0 right-0 z-40 flex items-center justify-center pt-2 pointer-events-none"
                >
                    <FloatingTabs
                        activeTab={activeFeed}
                        onChange={(val) => handleFeedSwitch(val as 'discover' | 'friends')}
                        tabs={[
                            { label: 'Discover', value: 'discover' },
                            { label: 'Friends', value: 'friends' }
                        ]}
                    />
                </motion.div>
            )}

            {/* Overscroll Indicators Overlay - Fixed position outside screen transition */}
            <AnimatePresence>
                {pullDistance > 20 && !showGrid && (
                    <motion.div
                        key="pull-indicator-feed"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            y: Math.min(pullDistance * 0.25, 40) // Responsive y-offset
                        }}
                        exit={{ opacity: 0, scale: 0.8, y: -20 }}
                        className="absolute top-[140px] left-0 right-0 z-[60] flex flex-col items-center pointer-events-none"
                    >
                        <div className="bg-black/90 backdrop-blur-2xl px-6 py-3 rounded-full border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.6)] flex items-center gap-3">
                            <motion.div
                                animate={{ y: pullDistance > 220 ? 4 : 0 }}
                                transition={{ repeat: Infinity, duration: 0.8, repeatType: 'reverse' }}
                            >
                                <ChevronDown size={14} className={pullDistance > 220 ? 'text-primary' : 'text-white/40'} />
                            </motion.div>
                            <span className={`text-[10px] font-black uppercase tracking-[0.4em] transition-colors duration-300 ${pullDistance > 220 ? 'text-primary' : 'text-white/40'}`}>
                                {pullDistance > 220 ? 'Release for Recall' : 'Pull for Recall'}
                            </span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {!showGrid ? (
                    <motion.div
                        key="lore-feed"
                        initial={{ opacity: 0, y: window.innerHeight }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: window.innerHeight }}
                        transition={{ type: 'spring', damping: 28, stiffness: 220 }}
                        ref={containerRef}
                        onScroll={handleScroll}
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        onWheel={handleWheel}
                        className="flex-1 h-full overflow-y-auto pb-14 pt-[150px] px-4 no-scrollbar flex flex-col lore-feed-container"
                    >
                        <HeartbeatTransition loading={isLoading}>
                            <div className="flex-1 flex flex-col min-h-full">
                                {captures.length === 0 ? (
                                    <FeedPlaceholder
                                        title="Be the First"
                                        description="No Lore has been shared yet. Start the chain!"
                                        icon={<Camera size={40} />}
                                        buttonLabel="Post Lore"
                                        onAction={onLaunchCamera}
                                    />
                                ) : (
                                    <div className="space-y-4">
                                        {captures.map(c => (
                                            <DualCameraPost
                                                key={c.id}
                                                capture={c}
                                                onOpenDetail={onOpenPostDetail}
                                                onUserClick={onUserClick}
                                                currentUser={currentUser}
                                                isLocked={!hasUserPostedToday}
                                                onUnlock={onLaunchCamera}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </HeartbeatTransition>
                    </motion.div>
                ) : (
                    <RecallGridView
                        key="recall-view-container" // Key for proper AnimatePresence handling
                        captures={recallCaptures}
                        onOpenDetail={onOpenPostDetail}
                        onClose={() => setShowGrid(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

const RecallGridView: React.FC<{
    captures: Capture[],
    onOpenDetail: (c: Capture) => void,
    onClose: () => void
}> = ({ captures, onOpenDetail, onClose }) => {
    const [pullDist, setPullDist] = useState(0);
    const touchY = useRef(0);
    const scrollRef = useRef<HTMLDivElement>(null);

    const handlePointerDown = (e: React.PointerEvent) => {
        touchY.current = e.clientY;
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (touchY.current === 0) return;
        const deltaY = e.clientY - touchY.current;

        const isAtTop = scrollRef.current ? scrollRef.current.scrollTop <= 0 : true;
        const isAtBottom = scrollRef.current
            ? Math.ceil(scrollRef.current.scrollTop + scrollRef.current.clientHeight) >= scrollRef.current.scrollHeight - 10
            : true;

        if (isAtTop && deltaY > 0) {
            setPullDist(deltaY);
        } else if (isAtBottom && deltaY < 0) {
            setPullDist(deltaY);
        } else {
            setPullDist(0);
        }
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        if ((pullDist > 220 && (scrollRef.current?.scrollTop || 0) <= 0) ||
            (pullDist < -220 && Math.ceil((scrollRef.current?.scrollTop || 0) + (scrollRef.current?.clientHeight || 0)) >= (scrollRef.current?.scrollHeight || 0) - 10)) {
            onClose();
            if (window.navigator.vibrate) window.navigator.vibrate(15);
        }
        touchY.current = 0;
        setPullDist(0);
    };

    const handleWheel = (e: React.WheelEvent) => {
        if (!scrollRef.current) return;
        const isAtTop = scrollRef.current.scrollTop <= 0;
        const isAtBottom = Math.ceil(scrollRef.current.scrollTop + scrollRef.current.clientHeight) >= scrollRef.current.scrollHeight - 10;

        if ((isAtTop && e.deltaY < -80) || (isAtBottom && e.deltaY > 80)) {
            onClose();
            if (window.navigator.vibrate) window.navigator.vibrate(10);
        }
    };

    return (
        <motion.div
            key="recall-view"
            initial={{ opacity: 0, y: -window.innerHeight }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -window.innerHeight }}
            transition={{ type: 'spring', damping: 28, stiffness: 220, mass: 1 }}
            ref={scrollRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onWheel={handleWheel}
            className="absolute inset-0 z-[55] bg-deep-black flex flex-col pt-6 no-scrollbar overflow-y-auto select-none"
        >
            <AnimatePresence>
                {Math.abs(pullDist) > 30 && (
                    <motion.div
                        key="pull-indicator-recall"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            y: pullDist > 0 ? Math.min(pullDist * 0.25, 40) : Math.max(pullDist * 0.25, -40)
                        }}
                        exit={{ opacity: 0, scale: 0.8, y: pullDist > 0 ? -20 : 20 }}
                        className={`absolute left-0 right-0 z-[60] flex justify-center pointer-events-none ${pullDist > 0 ? 'top-14' : 'bottom-24'}`}
                    >
                        <div className="bg-black/90 backdrop-blur-2xl px-6 py-3 rounded-full border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.6)] flex items-center gap-3">
                            {pullDist > 0 ? (
                                <ChevronDown size={14} className={pullDist > 220 ? 'text-primary' : 'text-white/40'} />
                            ) : (
                                <ChevronUp size={14} className={pullDist < -220 ? 'text-primary' : 'text-white/40'} />
                            )}
                            <span className={`text-[10px] font-black uppercase tracking-[0.4em] transition-colors ${Math.abs(pullDist) > 220 ? 'text-primary' : 'text-white/40'}`}>
                                {Math.abs(pullDist) > 220 ? 'Release for Feed' : pullDist > 0 ? 'Pull for Feed' : 'Push for Feed'}
                            </span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Recall Header */}
            <div className="px-5 mb-6 flex items-center justify-between">
                <button
                    onClick={onClose}
                    className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 active:text-white transition-colors"
                >
                    <ChevronLeft size={20} />
                </button>

                <div className="flex flex-col items-center">
                    <h2 className="text-lg font-black italic text-white/90 uppercase tracking-[0.2em]">Recall</h2>
                    <div className="flex items-center gap-1.5 opacity-60">
                        <span className="text-[8px] font-black text-primary uppercase tracking-widest">{captures.length} Lore</span>
                        <div className="w-0.5 h-0.5 rounded-full bg-white/40" />
                        <span className="text-[8px] font-black text-white/60 uppercase tracking-widest">Today</span>
                    </div>
                </div>

                <div className="w-10" />
            </div>

            {/* Recall Grid */}
            <div className="px-1 flex-1">
                {captures.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2 px-2 pb-10">
                        {captures.sort((a, b) => new Date(a.captured_at || a.created_at).getTime() - new Date(b.captured_at || b.created_at).getTime()).map((c, i) => (
                            <motion.button
                                key={c.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.03, type: 'spring', stiffness: 300, damping: 25 }}
                                onClick={() => onOpenDetail(c)}
                                className="aspect-[3/4] bg-white/5 relative overflow-hidden group active:scale-95 transition-transform rounded-xl border border-white/5"
                            >
                                {c.media_type === 'video' ? (
                                    <video
                                        src={c.back_media_url || c.back_image_url}
                                        autoPlay
                                        loop
                                        muted
                                        playsInline
                                        className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105"
                                    />
                                ) : (
                                    <img
                                        src={c.back_media_url || c.back_image_url}
                                        className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500 group-hover:scale-110"
                                        alt="Recall Moment"
                                    />
                                )}

                                {/* Dual Cam PIP Overlay */}
                                <div className="absolute top-2 left-2 w-[30%] aspect-[3/4] rounded-lg border border-white/20 bg-black/40 backdrop-blur-sm overflow-hidden shadow-xl z-20 group-hover:scale-105 transition-transform duration-500">
                                    {c.front_media_url?.includes('.mp4') || c.front_media_url?.startsWith('blob:') ? (
                                        <video src={c.front_media_url} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                                    ) : (
                                        <img src={c.front_media_url || c.front_image_url} className="w-full h-full object-cover" />
                                    )}
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                                <div className="absolute bottom-2 left-2 flex items-center gap-1">
                                    {c.media_type === 'video' && <Play size={10} className="text-white/60 fill-current" />}
                                    <span className="text-[9px] font-black text-white italic tracking-tight uppercase">
                                        {new Date(c.captured_at || c.created_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                                    </span>
                                </div>
                            </motion.button>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-40 text-center px-12">
                        <div className="w-20 h-20 bg-white/[0.03] border border-white/[0.05] rounded-3xl flex items-center justify-center mb-6">
                            <HistoryIcon size={28} className="text-white/10" />
                        </div>
                        <h3 className="text-white/40 font-black uppercase text-xs tracking-[0.3em]">No Lore Today</h3>
                    </div>
                )}
            </div>

            {/* Dismiss Hint Removed as per request */}
            <div className="py-8" />
        </motion.div>
    );
};


// --- Refactored & New Components ---



const ActionScreen: React.FC<{ onClose: () => void, onLaunchCamera: () => void, onLaunchQuest: () => void }> = ({ onClose, onLaunchCamera, onLaunchQuest }) => {
    return (
        <div
            className="absolute inset-0 z-[60] bg-deep-black/60 backdrop-blur-md flex flex-col items-center justify-end pb-24 animate-in fade-in duration-200"
            onClick={onClose}
        >
            <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="absolute top-12 right-6 p-2 bg-black/40 backdrop-blur-md rounded-full text-white border border-white/10"><X size={24} /></button>

            <div
                className="flex items-center justify-center gap-12 w-full mb-8"
            >


                <button
                    onClick={(e) => { e.stopPropagation(); onLaunchQuest(); onClose(); }}
                    className="flex flex-col items-center gap-3 group"
                >
                    <div className="w-14 h-14 rounded-full bg-surface/90 backdrop-blur-sm border border-white/10 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all shadow-[0_0_15px_rgba(204,255,0,0.3)]">
                        <Zap size={24} className="text-primary group-hover:text-black" />
                    </div>
                    <span className="font-bold text-xs text-white drop-shadow-md">Drop Quest</span>
                </button>
            </div>
        </div>
    );
};


// --- Main App Orchestrator ---

function MainContent() {
    const { showToast } = useToast();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    // Initialize currentUser with null or empty, to be set by SplashScreen or Auth
    const [currentUser, setCurrentUser] = useState<UserType>(MOCK_USER);

    const fetchUser = async (isInitial = false) => {
        const user = await supabaseService.auth.getCurrentUser();
        // If we have a real user (not just the mock fallback), mark as authenticated
        if (user && user.username) {
            setCurrentUser(user);
            setIsAuthenticated(true);
        } else if (isInitial) {
            // Keep MOCK_USER as fallback for non-auth users but don't set isAuthenticated
            // so they are forced to the SplashScreen if they try to interact
            setCurrentUser(MOCK_USER);
            setIsAuthenticated(false);
        }
    };

    // Initial Data Fetch & Streak Check
    useEffect(() => {
        fetchUser(true);
    }, []);

    const [currentTab, setCurrentTab] = useState<'LANDING' | 'HOME' | 'QUESTS' | 'CHATS' | 'BOOK' | 'SEARCH' | 'NOTIFICATIONS' | 'PROFILE'>('LANDING');
    const [showActionModal, setShowActionModal] = useState(false);
    const [activeFlow, setActiveFlow] = useState<'NONE' | 'CAMERA' | 'QUEST' | 'CHAT_CAMERA'>('NONE');
    const [refreshFeed, setRefreshFeed] = useState(0);

    // --- MOCK STREAK SYNC (for Dev Mode / Non-Auth users) ---
    useEffect(() => {
        if (!isAuthenticated && currentUser.id === 'u1') {
            const windowStart = dailyService.getCurrentWindowStart();
            const prevWindowStart = dailyService.getPreviousWindowStart();
            const lastPosted = currentUser.last_posted_date ? new Date(currentUser.last_posted_date) : null;

            // If mock user missed the previous window, reset to 0 locally
            if (!lastPosted || lastPosted < prevWindowStart) {
                if (currentUser.life_streak !== 0 || currentUser.streak_count !== 0) {
                    console.log("[MOCK STREAK] Resetting to 0 (Window Missed)");
                    setCurrentUser(prev => ({ ...prev, life_streak: 0, streak_count: 0 }));
                }
            }
        }
    }, [isAuthenticated, refreshFeed]);

    // Theme Logic
    const [theme, setTheme] = useState<'dark' | 'light'>(() => {
        const saved = localStorage.getItem('be4l_theme');
        return (saved as 'dark' | 'light') || 'dark';
    });

    useEffect(() => {
        localStorage.setItem('be4l_theme', theme);
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

    // Post Detail State
    const [selectedPost, setSelectedPost] = useState<Capture | null>(null);

    // Viewed User State (For viewing others or myself)
    const [viewingUser, setViewingUser] = useState<UserType | null>(null);

    // Quest Interaction State
    const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
    const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null);

    const [activeChat, setActiveChat] = useState<{ id: string, name: string } | null>(null);
    const [previousTab, setPreviousTab] = useState<'HOME' | 'QUESTS' | 'CHATS' | 'BOOK' | 'SEARCH' | 'NOTIFICATIONS' | 'PROFILE'>('HOME');
    const [showQuestList, setShowQuestList] = useState(false);

    const [isWindowResetting, setIsWindowResetting] = useState(false);

    const handleFeedReset = async () => {
        setIsWindowResetting(true);
        // Step 2: 2-Second Strategic Buffer
        setTimeout(async () => {
            setRefreshFeed(prev => prev + 1);
            await fetchUser(); // Sync streak and user stats immediately
            setIsWindowResetting(false);
            showToast("Lore Cycle Refreshed. Glow Up. ✨", 'success');
        }, 2000);
    };
    const windowStart = dailyService.getCurrentWindowStart();
    const hasUserPostedToday = currentUser.last_posted_date && (new Date(currentUser.last_posted_date).getTime() >= windowStart.getTime());



    const handleOpenProfile = () => {
        // Viewing my own profile via tab or header
        setViewingUser(currentUser);
        setPreviousTab(currentTab);
        setCurrentTab('PROFILE');
    };

    const handleUserClick = (user: UserType) => {
        setViewingUser(user);
        setPreviousTab(currentTab);
        setCurrentTab('PROFILE');
    };

    const handleDeletePost = () => {
        setSelectedPost(null);
        setRefreshFeed(prev => prev + 1);
    };

    // Callback when a new quest is created (switch to Quests tab and refresh if needed)
    const handleQuestCreated = async (id: string, title: string) => {
        setActiveFlow('NONE');

        // Find or Create the Lobby to get its real ID
        const lobby = await supabaseService.chat.getOrCreateQuestLobby(id, title, [currentUser.id]);
        if (lobby) {
            setActiveChat({ id: lobby.id, name: lobby.name });
            setCurrentTab('CHATS');
        } else {
            setCurrentTab('QUESTS');
        }

        setRefreshFeed(prev => prev + 1);
    };

    // Nav Helpers

    const handleNav = (tab: 'LANDING' | 'HOME' | 'QUESTS' | 'CHATS' | 'BOOK' | 'SEARCH' | 'NOTIFICATIONS' | 'PROFILE') => {
        if (tab === 'SEARCH' || tab === 'NOTIFICATIONS') {
            setPreviousTab(currentTab);
        }
        setViewingUser(null);
        setCurrentTab(tab);
    }

    const renderScreen = () => {
        switch (currentTab) {
            case 'LANDING': return <LandingPage onEnter={() => handleNav('QUESTS')} />;
            case 'HOME': return <LoreFeed
                onOpenProfile={handleOpenProfile}
                onOpenPostDetail={setSelectedPost}
                onUserClick={handleUserClick}
                refreshTrigger={refreshFeed}
                currentUser={currentUser}
                onNavigate={handleNav}
                onLaunchCamera={() => setActiveFlow('CAMERA')}
                hasUserPostedToday={hasUserPostedToday}
                onOpenQuestList={() => setShowQuestList(true)}
                onReset={handleFeedReset}
                forceLoading={isWindowResetting}
            />;
            case 'QUESTS': return (
                <QuestsScreen
                    onOpenQuest={setSelectedQuest}
                    onOpenCompetition={setSelectedCompetition}
                    onOpenMyQuests={() => handleNav('PROFILE')}
                    onOpenProfile={handleOpenProfile}
                    currentUser={currentUser}
                    onNavigate={handleNav}
                    onReset={handleFeedReset}
                    onOpenQuestList={() => setShowQuestList(true)}
                    onLaunchQuest={() => setActiveFlow('QUEST')}
                    refreshTrigger={refreshFeed}
                    hasUserPostedToday={hasUserPostedToday}
                    onTimerZero={handleFeedReset}
                />
            );
            case 'CHATS':
                if (activeChat) {
                    return (
                        <ChatDetailScreen
                            chatId={activeChat.id}
                            chatName={activeChat.name}
                            onBack={() => setActiveChat(null)}
                            onLaunchCamera={() => setActiveFlow('CHAT_CAMERA')}
                        />
                    );
                }
                return <ChatListScreen onOpenChat={(id, name) => setActiveChat({ id, name })} onOpenProfile={handleOpenProfile} currentUser={currentUser} onNavigate={handleNav} />;
            case 'BOOK': return <BookScreen onOpenProfile={handleOpenProfile} currentUser={currentUser} onNavigate={handleNav} />;
            case 'SEARCH': return <SearchScreen
                onClose={() => setCurrentTab(previousTab)}
                onOpenPost={(p) => {
                    setCurrentTab('HOME'); // Go home to show modal over feed? Or maintain stack. usually modal over feed.
                    setSelectedPost(p);
                }}
                onOpenQuest={(q) => {
                    setCurrentTab('QUESTS'); // Go to Quests to show detail?
                    setSelectedQuest(q);
                }}
                onOpenProfile={handleUserClick}
            />;
            case 'NOTIFICATIONS': return <NotificationsScreen
                onClose={() => setCurrentTab(previousTab)}
                onOpenPost={(p) => { setCurrentTab('HOME'); setSelectedPost(p); }}
                onOpenQuest={(q) => { setCurrentTab('QUESTS'); setSelectedQuest(q); }}
            />;
            case 'PROFILE': return (
                viewingUser ? (
                    <ProfileScreen
                        user={viewingUser}
                        currentUserId={currentUser.id}
                        theme={theme}
                        onToggleTheme={toggleTheme}
                        onBack={() => {
                            setViewingUser(null);
                            setCurrentTab(previousTab);
                        }}
                        onLogout={() => { setViewingUser(null); setIsAuthenticated(false); }}
                        onOpenPostDetail={setSelectedPost}
                        onOpenQuest={setSelectedQuest}
                        onOpenUser={handleUserClick}
                        onProfileUpdate={(updatedUser) => {
                            if (updatedUser.id === currentUser.id) {
                                setCurrentUser(updatedUser);
                            }
                            setViewingUser(updatedUser);
                        }}
                        onOpenChat={(id, name) => setActiveChat({ id, name })}
                        onNavigate={handleNav}
                    />
                ) : <NotFoundScreen onHome={() => handleNav('HOME')} onBack={() => handleNav('HOME')} />
            );
            default: return <NotFoundScreen onHome={() => handleNav('HOME')} onBack={() => handleNav('HOME')} />;
        }
    };


    return (
        <AestheticAppBackground className="relative w-full max-w-md mx-auto h-[100dvh] shadow-2xl overflow-hidden">
            {!isAuthenticated ? (
                <SplashScreen onComplete={(user) => {
                    // Merge with defaults if needed
                    setCurrentUser(prev => ({ ...prev, ...user }));
                    setIsAuthenticated(true);
                }} />
            ) : (
                <>
                    {/* Main Content Area */}
                    {renderScreen()}


                    {selectedPost && (
                        <PostDetailScreen
                            capture={selectedPost}
                            onClose={() => setSelectedPost(null)}
                            onDelete={handleDeletePost}
                            onUpdate={() => setRefreshFeed(prev => prev + 1)}
                            currentUser={currentUser}
                            isLocked={!hasUserPostedToday}
                            onUnlock={() => { setSelectedPost(null); setActiveFlow('CAMERA'); }}
                        />
                    )}

                    {selectedQuest && (
                        <QuestDetailsScreen
                            quest={selectedQuest}
                            currentUser={currentUser}
                            onClose={() => setSelectedQuest(null)}
                            onJoin={async () => {
                                if (selectedQuest.id.startsWith('mock-') || selectedQuest.id.startsWith('gen-')) {
                                    showToast("Hunt Joined! (Simulated)", 'success');

                                    // Simulate Quest > Echo bridge for mock data
                                    const mockChatId = selectedQuest.id.startsWith('gen-') ? 'lobby_q1' : '1';
                                    setActiveChat({ id: mockChatId, name: `Lobby: ${selectedQuest.title}` });
                                    handleNav('CHATS');

                                    setSelectedQuest(null);
                                    return;
                                }
                                const success = await supabaseService.quests.requestToJoin(selectedQuest.id, currentUser.id, selectedQuest.approval_required);
                                if (success) {
                                    showToast(selectedQuest.approval_required ? "Hunt Requested! 📡" : "Hunt Started! Entering Comms... ⚡", 'success');

                                    // If instant join, we might want to automatically open the chat?
                                    if (!selectedQuest.approval_required) {
                                        const allMemberIds = Array.from(new Set([selectedQuest.host_id, currentUser.id, ...(selectedQuest.participant_ids || [])]));
                                        const targetEcho = allMemberIds.length > 2
                                            ? await supabaseService.chat.getOrCreateQuestLobby(selectedQuest.id, `Lobby: ${selectedQuest.title}`, allMemberIds)
                                            : await supabaseService.chat.getOrCreatePersonalChat(currentUser.id, selectedQuest.host_id, selectedQuest.host?.username || 'Host');

                                        if (targetEcho) {
                                            setActiveChat({ id: targetEcho.id, name: targetEcho.name });
                                            handleNav('CHATS');
                                        }
                                    }
                                    setSelectedQuest(null);
                                } else {
                                    showToast("Hunt Fumbled. Try Again.", 'error');
                                }
                            }}
                            onNavigate={handleNav}
                            onOpenChat={(id, name) => setActiveChat({ id, name })}
                        />
                    )}

                    {selectedCompetition && (
                        <CompetitionDetailsScreen onClose={() => setSelectedCompetition(null)} competition={selectedCompetition} />
                    )}


                    {showActionModal && (
                        <ActionScreen
                            onClose={() => setShowActionModal(false)}
                            onLaunchCamera={() => setActiveFlow('CAMERA')}
                            onLaunchQuest={() => setActiveFlow('QUEST')}
                        />
                    )}

                    {/* Normal Feed Camera */}
                    {activeFlow === 'CAMERA' && (
                        <CameraFlow
                            onClose={() => setActiveFlow('NONE')}
                            onPost={() => {
                                setRefreshFeed(prev => prev + 1);
                                setCurrentTab('HOME');
                                // Consolidate State Updates: Streak + Unlock
                                setCurrentUser(prev => {
                                    const now = new Date();
                                    const currentWindowId = dailyService.getWindowId(now);
                                    const lastWindowId = prev.last_window_id;
                                    let newStreak = prev.streak_count || 0;

                                    if (currentWindowId === lastWindowId) {
                                        // Case A: Already Posted
                                    } else if (!lastWindowId || dailyService.isImmediateSuccessor(currentWindowId, lastWindowId)) {
                                        // Case B: Perfect Chain
                                        newStreak += 1;
                                    } else {
                                        // Case C: Broken Chain
                                        newStreak = 1;
                                    }

                                    return {
                                        ...prev,
                                        last_posted_date: now.toISOString(),
                                        last_window_id: currentWindowId,
                                        streak_count: newStreak,
                                        life_streak: newStreak
                                    };
                                });

                                fetchUser();

                                // Scroll to top to see the new post (after a small delay to allow feed to update)
                                setTimeout(() => {
                                    const feedContainer = document.querySelector('.lore-feed-container');
                                    if (feedContainer) feedContainer.scrollTo({ top: 0, behavior: 'smooth' });
                                }, 500);
                            }}
                            currentUser={currentUser}
                        />
                    )}

                    {/* Chat Camera - Sends back to active chat */}
                    {activeFlow === 'CHAT_CAMERA' && (
                        <CameraFlow
                            currentUser={currentUser}
                            onClose={() => setActiveFlow('NONE')}
                            onCapture={(url) => {
                                if (activeChat) {
                                    supabaseService.chat.sendMessage(activeChat.id, '', 'image', { image_url: url });
                                }
                                setActiveFlow('NONE');
                            }}
                        />
                    )}

                    {activeFlow === 'QUEST' && (
                        <CreateQuestScreen
                            onClose={() => setActiveFlow('NONE')}
                            onQuestCreated={handleQuestCreated}
                            currentUser={currentUser}
                        />
                    )}

                    <div className="absolute bottom-0 w-full bg-deep-black/90 backdrop-blur-2xl border-t border-transparent px-6 pt-[15px] pb-[15px] flex justify-between items-center z-50">


                        <button onClick={() => handleNav('QUESTS')} className={`flex flex-col items-center gap-1 transition-colors ${currentTab === 'QUESTS' && !viewingUser ? 'text-primary' : 'text-gray-500'}`}>
                            <Compass size={22} strokeWidth={currentTab === 'QUESTS' && !viewingUser ? 2.5 : 2} />
                            <span className="text-[10px] font-bold">Quests</span>
                        </button>

                        <button
                            onClick={() => setShowActionModal(true)}
                            className="bg-primary text-black h-11 w-11 rounded-2xl flex items-center justify-center shadow-[0_0_15px_rgba(204,255,0,0.4)] hover:scale-105 active:scale-90 transition-all mx-2"
                        >
                            <Plus size={24} strokeWidth={3} />
                        </button>

                        <button onClick={() => handleNav('CHATS')} className={`flex flex-col items-center gap-1 transition-colors ${currentTab === 'CHATS' && !viewingUser ? 'text-primary' : 'text-gray-500'}`}>
                            <MessageSquare size={22} strokeWidth={currentTab === 'CHATS' && !viewingUser ? 2.5 : 2} />
                            <span className="text-[10px] font-bold">Echo</span>
                        </button>

                        <button onClick={() => handleNav('BOOK')} className={`flex flex-col items-center gap-1 transition-colors ${currentTab === 'BOOK' && !viewingUser ? 'text-primary' : 'text-gray-500'}`}>
                            <Ticket size={22} strokeWidth={currentTab === 'BOOK' && !viewingUser ? 2.5 : 2} />
                            <span className="text-[10px] font-bold">Dibs</span>
                        </button>
                    </div>
                </>
            )}

            {showQuestList && <DailyQuestListModal onClose={() => setShowQuestList(false)} />}
        </AestheticAppBackground>
    );
}

const App = () => (
    <ToastProvider>
        <MainContent />
    </ToastProvider>
);

export default App;
