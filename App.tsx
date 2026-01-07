import React, { useState, useEffect, useRef } from 'react';
import { ToastProvider, useToast } from './components/Toast';
import { Home, Compass, PlusSquare, Map as MapIcon, User, Search, Camera, Send, X, ArrowRight, Grid, Image as ImageIcon, Trophy, Swords, UserPlus, ChevronLeft, Phone, AtSign, FileText, Upload, Check, Minus, Plus, MessageCircle, Bell, Music, MapPin, Zap, RefreshCw, Flashlight, Mic, Tag, Calendar, DollarSign, Lock, Globe, Users, Clock, MapPinOff, MoreHorizontal, Share2, Smile, Reply, Edit2, Play, Pause, ExternalLink, Flag, Trash2, History as HistoryIcon, MoreVertical, Heart, MessageSquare, Ticket, Activity } from 'lucide-react';
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
import MyQuestsScreen from './components/MyQuestsScreen';
import CreateQuestScreen from './components/CreateQuestScreen';
import BookScreen from './components/BookScreen';
import PostDetailScreen from './components/PostDetailScreen';
import ChatListScreen from './components/Chat/ChatListScreen';
import ChatDetailScreen from './components/Chat/ChatDetailScreen';
import ProfileScreen from './components/ProfileScreen';
import { audioService } from './services/audioService';
import { AestheticAppBackground, GradientButton, FeedPlaceholder, GlassCard, GlowText, EKGLoader, HeartbeatTransition } from './components/ui/AestheticComponents';
import SearchScreen from './components/SearchScreen';
import NotificationsScreen from './components/NotificationsScreen';
import NotFoundScreen from './components/NotFoundScreen';
import { dailyService } from './services/dailyService';
import DualCameraView from './components/DualCameraView';
import { generateRandomQuests } from './utils/questGenerator';
import DailyQuestListModal from './components/DailyQuestListModal';

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
                    <div className={`relative flex items-center justify-center p-4 bg-black/40 backdrop-blur-3xl rounded-[24px] border transition-all duration-1000 ${isFlatline ? 'border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.1)]' : 'border-primary/10 shadow-2xl'} mb-12`}>
                        <h1 className={`text-4xl font-black italic tracking-tighter transition-all duration-1000 drop-shadow-[0_0_15px_rgba(204,255,0,0.5)] ${isFlatline ? 'text-gray-600 opacity-50' : 'text-primary neon-text'}`}>
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
                                className={isFlatline ? "animate-flatline-pulse" : "animate-ekg-sync"}
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
                        <h1 className="text-5xl font-black italic text-primary mb-2 drop-shadow-[0_0_15px_rgba(204,255,0,0.5)]">Be4L</h1>
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

                    <div className="mt-6 mb-8">
                        <GradientButton onClick={() => setStep('PHONE')} fullWidth>
                            Get Started
                        </GradientButton>
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
                    <div className="mt-6 mb-8">
                        <GradientButton onClick={handleVerify} disabled={isLoading || !isOtpValid} fullWidth>
                            {isLoading ? 'Verifying...' : 'Verify OTP'}
                        </GradientButton>
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

const CameraFlow: React.FC<{ onClose: () => void, onPost?: () => void, onCapture?: (url: string) => void, currentUser: UserType }> = ({ onClose, onPost, onCapture, currentUser }) => {
    const [images, setImages] = useState<{ main: string | null, sec: string | null }>({ main: null, sec: null });
    const [caption, setCaption] = useState('');
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
    const [isCapturing, setIsCapturing] = useState(false);
    const [isRecording, setIsRecording] = useState(false); // Video Recording State
    const [recordingTime, setRecordingTime] = useState(0);
    const [captureStep, setCaptureStep] = useState<'IDLE' | 'MAIN_CAPTURED' | 'SWITCHING' | 'DONE'>('IDLE');
    const [switchingQuote, setSwitchingQuote] = useState('');
    const [flashOn, setFlashOn] = useState(false);
    const { showToast } = useToast();

    // Preview Logic State
    const [isSwapped, setIsSwapped] = useState(false);
    const [showTagModal, setShowTagModal] = useState(false);

    // Metadata State
    const [taggedUsers, setTaggedUsers] = useState<UserType[]>([]);
    const [location, setLocation] = useState<string | null>(null);
    const [locationCoords, setLocationCoords] = useState<{ latitude: number, longitude: number } | null>(null);
    const [musicTrack, setMusicTrack] = useState<string | null>(null);
    const [isDetectingMusic, setIsDetectingMusic] = useState(false);
    const [isDetectingLoc, setIsDetectingLoc] = useState(false);

    // Capture detected time
    const [musicStartTime, setMusicStartTime] = useState<number>(0);

    // Toggles
    const [isLocEnabled, setIsLocEnabled] = useState(false);
    const [isMusicEnabled, setIsMusicEnabled] = useState(false);

    // Submission State
    const [isSending, setIsSending] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Initialize Camera
    useEffect(() => {
        let mounted = true;

        const startCamera = async () => {
            // Reset flash state when camera starts/switches
            setFlashOn(false);

            try {
                if (streamRef.current) {
                    streamRef.current.getTracks().forEach(track => track.stop());
                }
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: facingMode,
                        width: { ideal: 1280 },
                        height: { ideal: 720 }
                    },
                    audio: true // Always request audio so we can record video if needed
                });

                if (mounted && videoRef.current) {
                    videoRef.current.srcObject = stream;
                    streamRef.current = stream;
                }
            } catch (err) {
                console.error("Camera error:", err);
                // alert("Could not access camera. Please allow permissions.");
            }
        };

        if (captureStep !== 'DONE') {
            startCamera();
        }

        return () => {
            mounted = false;
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };

    }, [facingMode, captureStep]);

    // Handle Flash Toggle
    const toggleFlash = async () => {
        if (!streamRef.current) return;
        const track = streamRef.current.getVideoTracks()[0];
        const newFlashState = !flashOn;
        setFlashOn(newFlashState);
        try {
            await track.applyConstraints({
                advanced: [{ torch: newFlashState }] as any
            });
        } catch (e) {
            console.log("Flash not supported on this device/camera");
        }
    };

    // Handle Sequential Capture Logic
    const captureFrame = () => {
        if (!videoRef.current || !canvasRef.current) return null;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Mirror if front camera
        if (facingMode === 'user') {
            ctx?.translate(canvas.width, 0);
            ctx?.scale(-1, 1);
        }

        ctx?.drawImage(video, 0, 0);
        return canvas.toDataURL('image/jpeg', 0.8);
    };

    const handleShutterPress = async () => {
        if (isCapturing || isRecording) return;

        // If in Video Mode, this is the start of a HOLD
        longPressTimerRef.current = setTimeout(() => {
            startRecording();
        }, 300); // 300ms hold to start recording
    };

    const handleShutterRelease = () => {
        if (longPressTimerRef.current) {
            clearTimeout(longPressTimerRef.current);
            longPressTimerRef.current = null;
        }

        if (isRecording) {
            stopRecording();
        } else {
            // Tapped (released before hold threshold), treat as photo
            handleTakePhoto();
        }
    };

    const startRecording = () => {
        if (!streamRef.current) return;
        setIsRecording(true);
        setRecordingTime(0);

        const mediaRecorder = new MediaRecorder(streamRef.current);
        mediaRecorderRef.current = mediaRecorder;
        chunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunksRef.current.push(e.data);
        };

        mediaRecorder.onstop = () => {
            const blob = new Blob(chunksRef.current, { type: 'video/webm' });
            const videoUrl = URL.createObjectURL(blob);
            // Handling Video Review Flow would go here.
            // For now, we'll just treat it similar to image flow or log it.
            console.log("Video Captured:", videoUrl);
            setImages({ main: videoUrl, sec: null }); // Hack: Putting video in main for preview
            setCaptureStep('DONE');
            setIsRecording(false);
        };

        mediaRecorder.start();

        // Start Timer
        const interval = setInterval(() => {
            setRecordingTime(prev => prev + 1);
        }, 1000);

        // Auto-stop after 15s (Lore max?)
        setTimeout(() => {
            if (mediaRecorder.state === 'recording') stopRecording();
            clearInterval(interval);
        }, 15000);
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
        setIsRecording(false);
    };


    const handleTakePhoto = async () => {
        if (isCapturing) return;
        setIsCapturing(true);

        // 1. Capture Main Image
        const img1 = captureFrame();
        if (!img1) return;

        setCaptureStep('MAIN_CAPTURED');

        // Pick random quote
        setSwitchingQuote(POSITIVE_QUOTES[Math.floor(Math.random() * POSITIVE_QUOTES.length)]);

        // 2. Prepare for Second Capture (Switch Camera)
        const nextMode = facingMode === 'environment' ? 'user' : 'environment';
        setFacingMode(nextMode);
        setCaptureStep('SWITCHING');

        // Allow time for camera to switch and exposure to settle
        setTimeout(() => {
            // 3. Capture Second Image
            const img2 = captureFrame();

            // 4. Finalize
            setImages({
                main: img1, // First capture is always main (big)
                sec: img2   // Second capture is pip
            });
            setCaptureStep('DONE');
            setIsCapturing(false);
        }, 3000);
    };

    const toggleCamera = () => {
        if (!isCapturing && captureStep === 'IDLE') {
            setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
        }
    };

    // --- Preview / Editing Logic ---

    // ... removed handleSwapImages local ...

    const toggleLocation = () => {
        const next = !isLocEnabled;
        setIsLocEnabled(next);
        if (next) {
            detectLocation();
        } else {
            setLocation(null);
            setLocationCoords(null);
        }
    };

    const [spotifyConnected, setSpotifyConnected] = useState(false);
    const [showSpotifyModal, setShowSpotifyModal] = useState(false);

    // ... existing ...

    const toggleMusic = () => {
        if (!isMusicEnabled) {
            // Turning ON
            if (!spotifyConnected) {
                setShowSpotifyModal(true);
            } else {
                setIsMusicEnabled(true);
                detectMusic();
            }
        } else {
            // Turning OFF
            setIsMusicEnabled(false);
            setMusicTrack(null);
            setMusicStartTime(0);
        }
    };

    const detectLocation = () => {
        setIsDetectingLoc(true);

        if (!navigator.geolocation) {
            showToast("Geolocation is not supported by your browser", 'error');
            setIsDetectingLoc(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                setLocationCoords({ latitude, longitude });

                try {
                    // Reverse Geocoding via OSM Nominatim (Free, no key required for low usage)
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                    const data = await response.json();

                    // Extract a nice short name
                    const city = data.address.city || data.address.town || data.address.village || data.address.suburb;
                    const area = data.address.neighbourhood || data.address.road;
                    const shortName = city ? (area ? `${area}, ${city}` : city) : "Pinned Location";

                    setLocation(shortName);
                } catch (e) {
                    console.error("Geocoding failed", e);
                    setLocation(`${latitude.toFixed(2)}, ${longitude.toFixed(2)}`);
                } finally {
                    setIsDetectingLoc(false);
                }
            },
            (error) => {
                console.error("Error detecting location", error);
                showToast("Unable to retrieve location. Check permissions.", 'error');
                setIsDetectingLoc(false);

                // Fallback Mock (so user sees something during demo if they deny)
                setLocation("Downtown Metro (Mock)");
            }
        );
    };

    const detectMusic = () => {
        setIsDetectingMusic(true);
        // Simulate checking Spotify
        setTimeout(() => {
            // Random chance to have no music playing (20% chance)
            const isPlaying = Math.random() > 0.2;

            if (isPlaying) {
                const SONGS = ["Espresso - Sabrina", "BIRDS OF A FEATHER - Billie", "Not Like Us - Kendrick", "Good Luck, Babe - Chappell"];
                setMusicTrack(SONGS[Math.floor(Math.random() * SONGS.length)]);
                // Simulate capturing the CURRENT timestamp of the song
                // When we play it back later, we will play 30s starting from this point
                setMusicStartTime(Math.floor(Math.random() * 60) + 30);
            } else {
                setMusicTrack(null);
                setMusicStartTime(0);
                setIsMusicEnabled(false); // Turn off if nothing playing
                showToast("No song currently playing on Spotify.", 'info');
            }
            setIsDetectingMusic(false);
        }, 1500);
    };

    const toggleTag = (u: UserType) => {
        if (taggedUsers.find(x => x.id === u.id)) {
            setTaggedUsers(prev => prev.filter(x => x.id !== u.id));
        } else {
            setTaggedUsers(prev => [...prev, u]);
        }
    };

    const handleSend = async () => {
        if (isSending) return; // Prevent duplicates
        setIsSending(true);

        // If in Chat/Usage mode (returning image only)
        if (onCapture) {
            // Return the main image (or the one user decided is main)
            // Just sending one image for chat for now
            onCapture(images.main || '');
            onClose();
            return;
        }

        try {
            const newCapture: Capture = {
                id: `c-${Date.now()}`,
                user_id: currentUser.id,
                user: currentUser,
                front_image_url: images.sec || '',
                back_image_url: images.main || '',
                location_name: location || '',
                location_coords: locationCoords || undefined,
                music_track: musicTrack || undefined,
                music_start_time: musicStartTime,
                caption: caption,
                created_at: new Date().toISOString(),
                tagged_users: taggedUsers,
                privacy: 'public',
                reaction_count: 0,
                comment_count: 0,
                reactions: []
            };

            const result = await supabaseService.captures.postCapture(newCapture);

            if (result.success) {
                showToast("Lore Posted!", 'success');
                if (onPost) onPost();
                onClose();
            } else {
                showToast(result.error || "Failed to post Lore. Check logs.", 'error');
            }
        } catch (e) {
            console.error("Failed to post", e);
            showToast("Unexpected error while posting.", 'error');
        } finally {
            setIsSending(false);
        }
    };

    // --- RENDER CAPTURE PHASE ---
    if (captureStep !== 'DONE') {
        return (
            <div className="absolute inset-0 z-[60] bg-black flex flex-col safe-area-bottom">
                {/* Be4L Logo Overlay */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 z-40 text-primary font-black italic tracking-tighter text-xl pointer-events-none drop-shadow-md">
                    Be4L
                </div>

                {/* Main Camera Feed */}
                <div
                    className="absolute inset-0 bg-gray-900"
                    onClick={toggleCamera} // Tap to Flip
                >
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className={`w-full h-full object-cover transition-opacity duration-300 ${captureStep === 'SWITCHING' ? 'opacity-0' : 'opacity-100'} ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
                    />
                    <canvas ref={canvasRef} className="hidden" />

                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/40 pointer-events-none" />

                    {/* Capture Progress Overlay */}
                    {isCapturing && (
                        <div className="absolute inset-0 flex items-center justify-center z-30 bg-black">
                            <p className="text-white font-bold text-[13px] uppercase tracking-[0.2em] text-center px-4 animate-in fade-in duration-500">
                                {captureStep === 'SWITCHING' ? switchingQuote : 'CAPTURING...'}
                            </p>
                        </div>
                    )}
                </div>

                {/* Top Controls - Left Only */}
                <div className="absolute top-6 left-4 z-20">
                    <button onClick={onClose} className="p-3 bg-black/20 backdrop-blur-md rounded-full text-white border border-white/10 hover:bg-white/10 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Bottom Controls */}
                <div className="absolute bottom-0 left-0 right-0 pb-12 pt-20 px-8 flex flex-col items-center justify-end z-20 bg-gradient-to-t from-black/80 to-transparent pointer-events-none gap-6">



                    <div className="w-full flex items-center justify-between">
                        {/* Flash (Bottom Left) */}
                        <button
                            onClick={toggleFlash}
                            className={`p-3 backdrop-blur-md rounded-full border transition-all pointer-events-auto ${flashOn ? 'bg-primary/20 border-primary text-primary' : 'bg-black/20 border-white/10 text-white hover:bg-white/10'}`}
                        >
                            <Zap size={24} className={flashOn ? "fill-current" : "opacity-80"} />
                        </button>

                        {/* Shutter (Bottom Center) */}
                        <button
                            onMouseDown={handleShutterPress}
                            onMouseUp={handleShutterRelease}
                            onTouchStart={handleShutterPress}
                            onTouchEnd={handleShutterRelease}
                            disabled={isCapturing}
                            className={`w-20 h-20 rounded-full border-[5px] flex items-center justify-center active:scale-95 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] pointer-events-auto disabled:opacity-50 ${isRecording ? 'border-red-500 bg-red-500/20' : 'border-white bg-white/10'}`}
                        >
                            <div className={`rounded-full shadow-inner transition-all duration-300 ${isRecording ? 'w-8 h-8 bg-red-500 rounded-sm' : 'w-16 h-16 bg-white'}`} />

                            {/* Recording Timer Overlay - REMOVED per user request */}
                            {isRecording && null}
                        </button>

                        {/* Flip (Bottom Right) */}
                        <button
                            onClick={toggleCamera}
                            disabled={isCapturing}
                            className="p-3 bg-black/20 backdrop-blur-md rounded-full text-white border border-white/10 hover:bg-white/10 transition-colors pointer-events-auto"
                        >
                            <RefreshCw size={24} className="opacity-80" />
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    // --- RENDER PREVIEW / EDIT PHASE ---
    return (
        <div className="absolute inset-0 z-[60] bg-black flex flex-col safe-area-bottom">
            {/* Be4L Logo Overlay (Always Visible) */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-40 text-primary font-black italic tracking-tighter text-xl pointer-events-none drop-shadow-md">
                Be4L
            </div>

            {/* Header (Always Visible) */}
            <div className="px-4 py-4 flex justify-between items-center z-10">
                <button onClick={() => { setCaptureStep('IDLE'); setIsCapturing(false); }} className="p-2 bg-black/50 rounded-full"><ChevronLeft className="text-white" /></button>
                <button onClick={onClose} className="p-2 bg-black/50 rounded-full"><X className="text-white" /></button>
            </div>

            {/* Main Image Area */}
            {/* Main Image Area (Using DualCameraView) */}
            <div className="flex-1 px-4">
                <DualCameraView
                    frontImage={images.sec || ''}
                    backImage={images.main || ''}
                    musicTrack={isMusicEnabled ? (isDetectingMusic ? "Detecting..." : musicTrack || "Music") : undefined}
                    locationName={isLocEnabled ? (isDetectingLoc ? "Detecting..." : location || "Location") : undefined}
                    isSwapped={isSwapped}
                    onSwap={setIsSwapped}
                    aspectRatio="h-full"
                    rounded="rounded-3xl"
                />
            </div>

            {/* Bottom Controls (Always Visible) */}
            <div className="px-4 py-6">

                {/* Metadata Chips - Minimalist Row */}
                <div className="relative flex justify-center gap-2 mb-6 h-8">

                    {/* Transparent Backdrop for Click-Outside to Dismiss Tag Modal */}
                    {showTagModal && (
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setShowTagModal(false)}
                        />
                    )}

                    {/* Tag Button */}
                    <button
                        onClick={() => setShowTagModal(!showTagModal)}
                        className={`flex items-center gap-1 px-3 rounded-full text-[10px] font-bold border transition-all h-full ${taggedUsers.length > 0 ? 'bg-primary/20 border-primary text-primary' : 'bg-surface border-white/10 text-gray-500 hover:text-white'}`}
                    >
                        <Tag size={12} />
                        {taggedUsers.length > 0 && <span>{taggedUsers.length}</span>}
                    </button>

                    {/* Compact Tag Popup - Positioned absolutely above the row */}
                    {showTagModal && (
                        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-card border border-white/10 rounded-xl p-2 w-48 shadow-xl z-50 animate-in fade-in slide-in-from-bottom-2">
                            <div className="flex justify-end items-center mb-1 pb-1 border-b border-white/10 px-1">
                                <button onClick={() => setShowTagModal(false)}><X size={10} className="text-white" /></button>
                            </div>
                            <div className="max-h-32 overflow-y-auto no-scrollbar space-y-1">
                                {OTHER_USERS.map(user => {
                                    const isSelected = !!taggedUsers.find(u => u.id === user.id);
                                    return (
                                        <div key={user.id} onClick={() => toggleTag(user)} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 cursor-pointer">
                                            <div className="flex items-center gap-2">
                                                <img src={user.avatar_url} className="w-5 h-5 rounded-full" />
                                                <span className="text-white text-[10px] font-bold">{user.username}</span>
                                            </div>
                                            {isSelected && <Check size={10} className="text-primary" strokeWidth={3} />}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Location Toggle */}
                    <button
                        onClick={toggleLocation}
                        className={`flex items-center gap-1.5 px-3 rounded-full text-[10px] font-bold border transition-all h-full ${isLocEnabled ? 'bg-primary/20 border-primary text-primary' : 'bg-surface border-white/10 text-gray-500'}`}
                    >
                        {isLocEnabled ? <MapPin size={12} /> : <MapPinOff size={12} />}
                        {isLocEnabled && <span className="max-w-[80px] truncate">{isDetectingLoc ? "..." : location || "Loc"}</span>}
                    </button>

                    {/* Music Toggle */}
                    <button
                        onClick={toggleMusic}
                        className={`flex items-center gap-1.5 px-3 rounded-full text-[10px] font-bold border transition-all h-full relative overflow-hidden ${isMusicEnabled ? 'bg-primary/20 border-primary text-primary' : 'bg-surface border-white/10 text-gray-500'}`}
                    >
                        <div className="relative">
                            <Music size={12} />
                            {!isMusicEnabled && <div className="absolute inset-0 border-t border-current rotate-45 top-[5px] scale-125" />}
                        </div>
                        {isMusicEnabled && <span className="max-w-[80px] truncate">{isDetectingMusic ? "..." : musicTrack || "Music"}</span>}
                    </button>
                </div>

                {/* Input & Send */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 shrink-0">
                        <img src={currentUser.avatar_url} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={caption}
                            onChange={(e) => setCaption(e.target.value.slice(0, 100))}
                            placeholder="Add a caption..."
                            className="w-full bg-transparent text-white font-medium placeholder-gray-500 outline-none pr-8 text-sm"
                        />
                        <span className={`absolute right-0 top-1/2 -translate-y-1/2 text-[10px] font-bold ${caption.length >= 100 ? 'text-red-500' : 'text-gray-600'}`}>
                            {100 - caption.length}
                        </span>
                    </div>
                    <button
                        onClick={handleSend}
                        disabled={isSending}
                        className={`px-6 py-2 font-black rounded-full uppercase text-xs tracking-wider transition-colors ${isSending ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-white text-black hover:bg-primary'}`}
                    >
                        {isSending ? 'Posting Lore...' : 'Post Lore'}
                    </button>
                </div>
            </div>

            {/* Spotify Connect Modal */}
            {showSpotifyModal && (
                <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-200" onClick={() => setShowSpotifyModal(false)}>
                    <div className="bg-card w-full max-w-sm rounded-3xl border border-white/10 p-8 flex flex-col items-center relative text-center" onClick={e => e.stopPropagation()}>
                        <div className="w-16 h-16 rounded-full bg-[#1DB954]/10 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(29,185,84,0.2)]">
                            <Music size={32} className="text-[#1DB954]" />
                        </div>

                        <h3 className="text-2xl font-black italic text-white uppercase mb-2">Connect Music</h3>
                        <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                            Link your Spotify account to automatically share your vibe with every capture.
                        </p>

                        <div className="flex gap-3 w-full">
                            <button
                                onClick={() => setShowSpotifyModal(false)}
                                className="flex-1 py-4 bg-surface text-gray-400 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-white/10 hover:text-white transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    setSpotifyConnected(true);
                                    setIsMusicEnabled(true);
                                    setShowSpotifyModal(false);
                                    detectMusic();
                                    showToast("Spotify Connected!", 'success');
                                }}
                                className="flex-1 py-4 bg-[#1DB954] text-black rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-[#1ed760] transition-colors shadow-[0_0_20px_rgba(29,185,84,0.3)]"
                            >
                                Connect
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};









const PulseFeed: React.FC<{
    onOpenProfile: () => void,
    onOpenPostDetail: (c: Capture) => void,
    onUserClick: (u: UserType) => void,
    refreshTrigger: number,
    currentUser: UserType,
    onNavigate: (tab: 'HOME' | 'QUESTS' | 'CHATS' | 'BOOK' | 'SEARCH' | 'NOTIFICATIONS') => void,
    onLaunchCamera: () => void,
    hasUserPostedToday: boolean,
    onOpenQuestList: () => void
}> = ({ onOpenProfile, onOpenPostDetail, onUserClick, refreshTrigger, currentUser, onNavigate, onLaunchCamera, hasUserPostedToday, onOpenQuestList }) => {
    const [captures, setCaptures] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Scroll Logic
    const [showTopBar, setShowTopBar] = useState(true);
    const lastScrollY = useRef(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const lastClickTimeRef = useRef(0);

    const handleLogoClick = () => {
        const now = Date.now();
        if (now - lastClickTimeRef.current < 300) {
            // Double Click -> Go Home (or if specific behavior needed)
            onNavigate('HOME');
        } else {
            // Single Click -> Scroll to Top
            containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
        }
        lastClickTimeRef.current = now;
    };

    const handleScroll = () => {
        const currentScrollY = containerRef.current?.scrollTop || 0;
        if (currentScrollY < 10) {
            setShowTopBar(true);
        } else if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
            // Scrolling Down
            setShowTopBar(false);
        } else if (currentScrollY < lastScrollY.current) {
            // Scrolling Up
            setShowTopBar(true);
        }
        lastScrollY.current = currentScrollY;
    };

    useEffect(() => {
        setLoading(true);
        const fetchFeed = async () => {
            const data = await supabaseService.captures.getFeed();
            setCaptures(data);
            setLoading(false);
        };
        fetchFeed();
    }, [refreshTrigger, currentUser.last_posted_date]); // Re-check if user posts

    const handleTimerZero = () => {
        // Reset the pulse feed (remove all posts and refresh)
        setCaptures([]);
        setLoading(true);

        // Wait briefly for visual reset then re-fetch (simulating new window)
        setTimeout(async () => {
            const data = await supabaseService.captures.getFeed();
            setCaptures(data);
            setLoading(false);
        }, 1500);
    };

    return (
        <div className="relative flex-1 h-full w-full flex flex-col overflow-hidden">
            {/* Top Bar - Absolute Overlay */}
            <TopBar
                visible={showTopBar}
                onOpenProfile={onOpenProfile}
                user={currentUser}
                onLogoClick={handleLogoClick}
                onSearchClick={() => onNavigate('SEARCH')}
                onNotificationsClick={() => onNavigate('NOTIFICATIONS')}
                onQuestListClick={onOpenQuestList}
                onTimerZero={handleTimerZero}
            />

            {/* Scrollable Content */}
            <div
                ref={containerRef}
                onScroll={handleScroll}
                className="flex-1 h-full overflow-y-auto pb-24 pt-24 px-4 no-scrollbar flex flex-col"
            >
                {/* Pulse Feed Only - Lore removed here */}
                {/* REMOVED: Pulse Feed Pill per user request */}

                <HeartbeatTransition loading={loading} label="Syncing Pulse...">
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
            </div>
        </div>
    );
};


// --- Refactored & New Components ---

const QuestsScreen: React.FC<{
    onOpenQuest: (q: Quest) => void,
    onOpenCompetition: (c: Competition) => void,
    onOpenMyQuests: () => void,
    onOpenProfile: () => void,
    currentUser: UserType,
    onNavigate: (tab: 'HOME' | 'QUESTS' | 'CHATS' | 'BOOK' | 'SEARCH' | 'NOTIFICATIONS') => void,
    onReset?: () => void,
    onOpenQuestList: () => void
}> = ({ onOpenQuest, onOpenCompetition, onOpenMyQuests, onOpenProfile, currentUser, onNavigate, onReset, onOpenQuestList }) => {
    const [activeTab, setActiveTab] = useState<'SIDE_QUESTS' | 'COMPETITIONS'>('SIDE_QUESTS');
    const [activeCat, setActiveCat] = useState('All');
    const [quests, setQuests] = useState<Quest[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Month display logic
    const dateScrollRef = useRef<HTMLDivElement>(null);
    const [displayedMonth, setDisplayedMonth] = useState('');
    const [displayedYear, setDisplayedYear] = useState('');
    const [showYear, setShowYear] = useState(false);

    const handleDateScroll = () => {
        if (!dateScrollRef.current) return;
        const scrollLeft = dateScrollRef.current.scrollLeft;
        const itemWidth = 60; // Approximate width of date-item + gap
        const index = Math.round(scrollLeft / itemWidth);
        const focusDate = new Date();
        focusDate.setDate(focusDate.getDate() + index);

        const monthName = focusDate.toLocaleString('default', { month: 'long' });
        const year = focusDate.getFullYear();
        setDisplayedMonth(monthName);
        setDisplayedYear(year.toString());
        setShowYear(year > new Date().getFullYear());
    };

    useEffect(() => {
        handleDateScroll(); // Init
    }, []);

    // Scroll Logic
    const [showTopBar, setShowTopBar] = useState(true);
    const lastScrollY = useRef(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const lastClickTimeRef = useRef(0);

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
        if (currentScrollY < 10) {
            setShowTopBar(true);
        } else if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
            setShowTopBar(false);
        } else if (currentScrollY < lastScrollY.current) {
            setShowTopBar(true);
        }
        lastScrollY.current = currentScrollY;
    };

    const handleJoin = (id: string) => {
        alert("Joined quest!");
    };

    useEffect(() => {
        setLoading(true);
        // Generate random quests for the selected category and date
        const randomQuests = generateRandomQuests(activeCat, selectedDate, 15);

        // Fetch existing quests from service and combine with generated ones
        supabaseService.quests.getQuests(activeCat).then(existingQuests => {
            // Combine existing and random quests
            const allQuests = [...existingQuests, ...randomQuests];
            setQuests(allQuests);
            setLoading(false);
        });
    }, [activeCat, activeTab, selectedDate]);

    return (
        <div className="flex-1 h-full overflow-hidden relative">
            <TopBar
                visible={showTopBar}
                onOpenProfile={onOpenProfile}
                user={currentUser}
                onLogoClick={handleLogoClick}
                onSearchClick={() => onNavigate('SEARCH')}
                onNotificationsClick={() => onNavigate('NOTIFICATIONS')}
                onQuestListClick={onOpenQuestList}
                onReset={onReset}
            />

            <div
                ref={containerRef}
                onScroll={handleScroll}
                className="flex-1 h-full overflow-y-auto pb-24 pt-24 no-scrollbar"
            >
                {/* Tabs & My Quests */}
                <div className="px-4 mb-4">
                    <div className="flex gap-4">
                        <button
                            onClick={() => setActiveTab('SIDE_QUESTS')}
                            className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${activeTab === 'SIDE_QUESTS' ? 'bg-surface border-white/20 text-primary shadow-[0_0_15px_rgba(204,255,0,0.1)]' : 'bg-transparent border-transparent text-gray-600 hover:text-gray-400'}`}
                        >
                            Side Quests
                        </button>
                        <button
                            onClick={() => setActiveTab('COMPETITIONS')}
                            className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${activeTab === 'COMPETITIONS' ? 'bg-surface border-white/20 text-white shadow-sm' : 'bg-transparent border-transparent text-gray-600 hover:text-gray-400'}`}
                        >
                            Competitions
                        </button>
                        <button
                            onClick={onOpenMyQuests}
                            className="w-12 h-11 rounded-xl bg-surface border border-white/10 flex items-center justify-center text-primary hover:bg-white/10 transition-colors"
                        >
                            <HistoryIcon size={20} />
                        </button>
                    </div>
                </div>

                {/* Date Selector */}
                {activeTab === 'SIDE_QUESTS' && (
                    <div className="px-4 mb-4">
                        <div className="flex gap-2 mb-2 items-center">
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-1">
                                {displayedMonth}{showYear && ` ${displayedYear}`}
                            </span>
                        </div>
                        <div
                            ref={dateScrollRef}
                            onScroll={handleDateScroll}
                            className="flex overflow-x-auto gap-3 no-scrollbar pb-2"
                        >
                            {[...Array(30)].map((_, i) => {
                                const d = new Date();
                                d.setDate(d.getDate() + i);
                                const isSelected = d.toDateString() === selectedDate.toDateString();
                                return (
                                    <button
                                        key={i}
                                        onClick={() => setSelectedDate(d)}
                                        className={`flex-shrink-0 w-12 h-14 rounded-xl flex flex-col items-center justify-center transition-all ${isSelected ? 'bg-primary text-black scale-110 shadow-lg' : 'bg-surface text-gray-500 border border-white/5'}`}
                                    >
                                        <span className="text-[10px] font-bold uppercase">{d.toLocaleString('default', { weekday: 'short' })}</span>
                                        <span className="text-sm font-black italic">{d.getDate()}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Categories */}
                {/* Categories - Consolidated to 6 Core + All, fitting in single row */}
                <div className="flex justify-between gap-1 px-4 mb-8 mt-2">
                    {['All', 'Sports', 'Adventures', 'Travel', 'Social', 'Train', 'Others'].map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCat(cat)}
                            className={`flex-1 py-2 rounded-full text-[8.5px] font-black uppercase tracking-tighter transition-all duration-300 ${activeCat === cat ? 'bg-primary text-black scale-[1.05] shadow-[0_0_15px_rgba(204,255,0,0.3)]' : 'bg-surface/40 border border-white/5 text-gray-500 hover:text-gray-300'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <HeartbeatTransition loading={loading} label="Loading Quests...">
                    {activeTab === 'SIDE_QUESTS' ? (
                        <div className="px-4 space-y-4">
                            {quests.filter(q => {
                                if (activeCat !== 'All' && q.category !== activeCat) return false;
                                if (q.type === QuestType.COMPETITION) return false;
                                const qDate = new Date(q.start_time);
                                if (isNaN(qDate.getTime())) return false;
                                return qDate.toDateString() === selectedDate.toDateString();
                            }).map(q => (
                                <div key={q.id} onClick={() => onOpenQuest(q)} className="cursor-pointer hover:opacity-90 transition-opacity">
                                    <QuestCard quest={q} onJoin={() => handleJoin(q.id)} />
                                </div>
                            ))}
                            {quests.filter(q => {
                                if (activeCat !== 'All' && q.category !== activeCat) return false;
                                if (q.type === QuestType.COMPETITION) return false;
                                const qDate = new Date(q.start_time);
                                return qDate.toDateString() === selectedDate.toDateString();
                            }).length === 0 && (
                                    <div className="text-center mt-10">
                                        <p className="text-gray-500 text-xs uppercase tracking-widest mb-2">No Quests Found</p>
                                        <button onClick={() => setActiveCat('All')} className="text-primary text-[10px] font-bold uppercase">View All Categories</button>
                                    </div>
                                )}
                        </div>
                    ) : (
                        <div className="px-4 space-y-4">
                            {MOCK_COMPETITIONS
                                .filter(c => activeCat === 'All' || c.category === activeCat)
                                .map(competition => (
                                    <CompetitionCard
                                        key={competition.id}
                                        competition={competition}
                                        onClick={() => onOpenCompetition(competition)}
                                    />
                                ))}
                            {MOCK_COMPETITIONS.filter(c => activeCat === 'All' || c.category === activeCat).length === 0 && (
                                <p className="text-center text-gray-500 text-xs mt-10 uppercase tracking-widest">No Competitions Found</p>
                            )}
                        </div>
                    )}
                </HeartbeatTransition>
            </div>
        </div>
    );
};


const ActionScreen: React.FC<{ onClose: () => void, onLaunchCamera: () => void, onLaunchQuest: () => void }> = ({ onClose, onLaunchCamera, onLaunchQuest }) => {
    return (
        <div
            className="absolute inset-0 z-[60] bg-black/60 backdrop-blur-md flex flex-col items-center justify-end pb-24 animate-in fade-in duration-200"
            onClick={onClose}
        >
            <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="absolute top-12 right-6 p-2 bg-black/40 backdrop-blur-md rounded-full text-white border border-white/10"><X size={24} /></button>

            <div
                className="flex items-center justify-center gap-12 w-full mb-8"
            >
                <button
                    onClick={(e) => { e.stopPropagation(); onLaunchCamera(); onClose(); }}
                    className="flex flex-col items-center gap-3 group"
                >
                    <div className="w-14 h-14 rounded-full bg-surface/90 backdrop-blur-sm border border-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors shadow-[0_0_15px_rgba(204,255,0,0.3)]">
                        <Camera size={24} className="text-primary" />
                    </div>
                    <span className="font-bold text-xs text-white drop-shadow-md">Lore?</span>
                </button>

                <button
                    onClick={(e) => { e.stopPropagation(); onLaunchQuest(); onClose(); }}
                    className="flex flex-col items-center gap-3 group"
                >
                    <div className="w-14 h-14 rounded-full bg-surface/90 backdrop-blur-sm border border-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors shadow-[0_0_15px_rgba(204,255,0,0.3)]">
                        <Compass size={24} className="text-primary" />
                    </div>
                    <span className="font-bold text-xs text-white drop-shadow-md">New Quest</span>
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

    const [currentTab, setCurrentTab] = useState<'HOME' | 'QUESTS' | 'CHATS' | 'BOOK' | 'SEARCH' | 'NOTIFICATIONS' | 'PROFILE'>('HOME');
    const [showActionModal, setShowActionModal] = useState(false);
    const [activeFlow, setActiveFlow] = useState<'NONE' | 'CAMERA' | 'QUEST'>('NONE');

    // Feed refresh trigger
    const [refreshFeed, setRefreshFeed] = useState(0);

    // Post Detail State
    const [selectedPost, setSelectedPost] = useState<Capture | null>(null);

    // Viewed User State (For viewing others or myself)
    const [viewingUser, setViewingUser] = useState<UserType | null>(null);

    // Quest Interaction State
    const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
    const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null);
    const [showMyQuests, setShowMyQuests] = useState(false);

    const [activeChat, setActiveChat] = useState<{ id: string, name: string } | null>(null);
    const [previousTab, setPreviousTab] = useState<'HOME' | 'QUESTS' | 'CHATS' | 'BOOK' | 'SEARCH' | 'NOTIFICATIONS' | 'PROFILE'>('HOME');
    const [showQuestList, setShowQuestList] = useState(false);

    const handleFeedReset = () => {
        setRefreshFeed(prev => prev + 1);
        showToast("New Pulse Window Started!", 'success');
    };
    const windowStart = dailyService.getCurrentWindowStart();
    const hasUserPostedToday = currentUser.last_posted_date && new Date(currentUser.last_posted_date).getTime() >= windowStart.getTime();



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
    const handleQuestCreated = () => {
        setActiveFlow('NONE');
        setCurrentTab('QUESTS');
    };

    // Nav Helpers

    const handleNav = (tab: 'HOME' | 'QUESTS' | 'CHATS' | 'BOOK' | 'SEARCH' | 'NOTIFICATIONS') => {
        if (tab === 'SEARCH' || tab === 'NOTIFICATIONS') {
            setPreviousTab(currentTab);
        }
        setViewingUser(null);
        setCurrentTab(tab);
    }

    const renderScreen = () => {
        switch (currentTab) {
            case 'HOME': return <PulseFeed onOpenProfile={handleOpenProfile} onOpenPostDetail={setSelectedPost} onUserClick={handleUserClick} refreshTrigger={refreshFeed} currentUser={currentUser} onNavigate={handleNav} onLaunchCamera={() => setActiveFlow('CAMERA')} hasUserPostedToday={hasUserPostedToday} onOpenQuestList={() => setShowQuestList(true)} onReset={handleFeedReset} />;
            case 'QUESTS': return (
                <QuestsScreen
                    onOpenQuest={setSelectedQuest}
                    onOpenCompetition={setSelectedCompetition}
                    onOpenMyQuests={() => setShowMyQuests(true)}
                    onOpenProfile={handleOpenProfile}
                    currentUser={currentUser}
                    onNavigate={handleNav}
                    onReset={handleFeedReset}
                    onOpenQuestList={() => setShowQuestList(true)}
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
                        onBack={() => {
                            setViewingUser(null);
                            setCurrentTab(previousTab);
                        }}
                        onLogout={() => { setViewingUser(null); setIsAuthenticated(false); }}
                        onOpenPostDetail={setSelectedPost}
                        onOpenMyQuests={() => { setViewingUser(null); setShowMyQuests(true); }}
                        onOpenUser={handleUserClick}
                        onProfileUpdate={(updatedUser) => {
                            if (updatedUser.id === currentUser.id) {
                                setCurrentUser(updatedUser);
                            }
                            setViewingUser(updatedUser);
                        }}
                    />
                ) : <NotFoundScreen onHome={() => handleNav('HOME')} onBack={() => handleNav('HOME')} />
            );
            default: return <NotFoundScreen onHome={() => handleNav('HOME')} onBack={() => handleNav('HOME')} />;
        }
    };


    return (
        <AestheticAppBackground className="relative w-full max-w-md mx-auto h-[100dvh] border-x border-white/10 shadow-2xl overflow-hidden">
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
                            onClose={() => setSelectedQuest(null)}
                            onJoin={() => { showToast("Requested!", 'success'); setSelectedQuest(null); }}
                        />
                    )}

                    {selectedCompetition && (
                        <CompetitionDetailsScreen onClose={() => setSelectedCompetition(null)} competition={selectedCompetition} />
                    )}

                    {showMyQuests && (
                        <MyQuestsScreen
                            onBack={() => setShowMyQuests(false)}
                            onOpenQuest={(q) => { setShowMyQuests(false); setSelectedQuest(q); }}
                        />
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
                                // IMMEDIATE UNLOCK: Manually update state so the feed unlocks instantly
                                setCurrentUser(prev => ({ ...prev, last_posted_date: new Date().toISOString() }));
                                fetchUser();
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

                    {activeFlow === 'QUEST' && <CreateQuestScreen onClose={() => setActiveFlow('NONE')} onQuestCreated={handleQuestCreated} />}

                    {/* Bottom Navigation */}
                    <div className="absolute bottom-0 w-full bg-black/80 backdrop-blur-md border-t border-white/5 px-6 py-2 pb-6 flex justify-between items-center z-50">
                        <button onClick={() => handleNav('HOME')} className={`flex flex-col items-center gap-1 transition-colors ${currentTab === 'HOME' && !viewingUser ? 'text-primary' : 'text-gray-500'}`}>
                            <Activity size={22} strokeWidth={currentTab === 'HOME' && !viewingUser ? 2.5 : 2} />
                            <span className="text-[10px] font-bold">Pulse</span>
                        </button>

                        <button onClick={() => handleNav('QUESTS')} className={`flex flex-col items-center gap-1 transition-colors ${currentTab === 'QUESTS' && !viewingUser ? 'text-primary' : 'text-gray-500'}`}>
                            <Compass size={22} strokeWidth={currentTab === 'QUESTS' && !viewingUser ? 2.5 : 2} />
                            <span className="text-[10px] font-bold">Quests</span>
                        </button>

                        <button onClick={() => setShowActionModal(true)} className="bg-primary text-black h-9 w-9 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(204,255,0,0.3)] hover:scale-105 transition-transform mx-2">
                            <Plus size={20} strokeWidth={2.5} />
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
