import React, { useState, useEffect, useRef } from 'react';
import {
    User as UserIcon, PlusSquare, ChevronLeft, Phone,
    Zap, Camera, Heart, MessageCircle, Star, Music,
    MapPin, Sparkles, Ghost, ShoppingBag, Globe,
    Compass, Command, Flame
} from 'lucide-react';
import { motion } from 'framer-motion';
import { supabaseService } from '../services/supabaseService';
import { useToast } from './Toast';
import { ImageCropper } from './ImageCropper';
import { User as UserType } from '../types';
import { MOCK_USER, MOCK_OPERATOR, MOCK_ADMIN } from '../constants';
import { GlassCard, GlowText, GradientButton } from './ui/AestheticComponents';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const floatingPool = [
    Zap, Camera, Heart, MessageCircle, Star, Music, MapPin,
    Sparkles, Ghost, ShoppingBag, Globe, Compass, Command, Flame
];

const FloatingIcon = ({ index }: { index: number }) => {
    const Icon = floatingPool[index % floatingPool.length];

    // Better randomization for positions
    const x = `${(index * 23.3) % 100}%`;
    const y = `${(index * 31.7) % 100}%`;
    const delay = (index % 12) * 0.8;
    const duration = 18 + (index % 20);
    const size = 14 + (index % 12); // Variant sizes
    const blur = index % 3 === 0 ? 'blur(1px)' : 'blur(0px)';
    const opacity = index % 4 === 0 ? 0.05 : 0.15;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{
                opacity: [0, opacity, opacity * 0.6, opacity, 0],
                scale: [0.6, 1.1, 0.9, 1.1, 0.6],
                rotate: [0, index % 2 === 0 ? 30 : -30, 0],
                x: [0, (index % 5 - 2) * 50, 0],
                y: [0, (index % 4 - 1.5) * 70, 0]
            }}
            transition={{
                duration: duration,
                repeat: Infinity,
                delay: delay,
                ease: "easeInOut"
            }}
            style={{
                position: 'absolute',
                left: x,
                top: y,
                filter: blur,
                zIndex: index % 5
            }}
            className="p-3 bg-white/[0.015] backdrop-blur-3xl rounded-[1.5rem] border border-white/5 shadow-2xl pointer-events-none"
        >
            <Icon size={size} className="text-electric-teal/30" strokeWidth={1.5} />
        </motion.div>
    );
};

export const SplashScreen: React.FC<{ onComplete: (user: UserType) => void }> = ({ onComplete }) => {
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
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleDevLogin = (user: UserType) => {
        login(user);
        if (user.is_operator) {
            navigate('/app/home');
        } else if (user.is_admin) {
            navigate('/app/admin');
        } else {
            navigate('/app/home');
        }
    };

    const isPhoneValid = phone.length === 10;
    const isOtpValid = otp.length === 4;

    useEffect(() => {
        if (step === 'SPLASH') {
            const flatlineTimer = setTimeout(() => setIsFlatline(true), 6000); // Trigger EKG flatline earlier
            const fadeOutTimer = setTimeout(() => setSplashFadingOut(true), 8500); // Start fade out
            const timer = setTimeout(() => onComplete(MOCK_USER), 11000); // Auto-redirect to Home
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
            <div className={`absolute inset-0 flex flex-col items-center justify-center p-6 bg-transparent z-[100] transition-opacity duration-[2000ms] ease-in-out ${splashFadingOut ? 'opacity-0' : 'opacity-100'} animate-in fade-in duration-[1500ms]`}>
                {/* Floating Holographic Icons - Ultra High Density */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {Array.from({ length: 48 }).map((_, i) => (
                        <FloatingIcon key={i} index={i} />
                    ))}
                </div>
                <div className={`flex flex-col items-center justify-center w-full max-w-xs ${!isFlatline ? 'animate-heartbeat' : ''}`}>
                    <div className={`absolute w-48 h-48 bg-primary/10 blur-[80px] rounded-full pointer-events-none transition-opacity duration-1000 ${isFlatline ? 'opacity-0' : 'opacity-100'}`} />
                    <div className={`relative flex items-center justify-center px-8 py-4 bg-black/40 backdrop-blur-3xl rounded-3xl transition-all duration-1000 border ${isFlatline ? 'border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.1)]' : 'border-white/5 shadow-2xl'} mb-12`}>
                        <h1 className={`text-5xl font-black italic tracking-tighter transition-all duration-1000 ${isFlatline ? 'text-gray-600 opacity-50' : 'animate-liquid-text'}`} style={{ textShadow: isFlatline ? 'none' : '0 0 20px rgba(45, 212, 191, 0.3)' }}>
                        </h1>
                    </div>

                    <div className="relative flex flex-col items-center">
                        <svg width="160" height="40" viewBox="0 0 200 40" className="drop-shadow-[0_0_10px_rgba(45,212,191,0.4)]">
                            <path
                                d="M 0 20 L 20 20 L 22 5 L 25 35 L 28 20 L 65 20 L 67 5 L 70 35 L 73 20 L 95 20 C 95 18, 98 18, 100 20 C 102 22, 105 22, 105 20 C 105 18, 102 18, 100 20 C 98 22, 95 22, 95 20 L 122 20 L 124 5 L 127 35 L 130 20 L 165 20 L 167 5 L 170 35 L 173 20 L 200 20"
                                fill="none"
                                stroke={isFlatline ? "rgba(239,68,68,0.2)" : "rgba(45,212,191,0.05)"}
                                strokeWidth="2"
                                strokeLinecap="round"
                            />
                            <path
                                d="M 0 20 L 20 20 L 22 5 L 25 35 L 28 20 L 65 20 L 67 5 L 70 35 L 73 20 L 95 20 C 95 18, 98 18, 100 20 C 102 22, 105 22, 105 20 C 105 18, 102 18, 100 20 C 98 22, 95 22, 95 20 L 122 20 L 124 5 L 127 35 L 130 20 L 165 20 L 167 5 L 170 35 L 173 20 L 200 20"
                                fill="none"
                                stroke={isFlatline ? "#ef4444" : "#2DD4BF"}
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
                        <h1 className="text-5xl font-black italic animate-liquid-text mb-2" style={{ textShadow: '0 0 20px rgba(45, 212, 191, 0.3)' }}>Be4L</h1>
                        <p className="text-white/40 text-[9px] tracking-[0.2em] uppercase font-bold text-center w-full">always for life</p>
                    </div>
                    {/* Feature cards simplified for brevity in extraction, ensuring imports work */}
                    <div className="mt-6 mb-8 flex flex-col gap-3">
                        <GradientButton onClick={() => setStep('PHONE')} fullWidth>
                            Get Started
                        </GradientButton>
                        <div className="flex flex-col gap-2 w-full mt-2">
                            <p className="text-[9px] text-white/20 font-black uppercase tracking-widest text-center mb-1">Dev Login Override (Local)</p>
                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    onClick={() => handleDevLogin(MOCK_USER)}
                                    className="py-3 bg-white/5 border border-white/5 hover:bg-white/10 rounded-xl text-[9px] font-black uppercase tracking-wider text-white/50 hover:text-white transition-all shadow-[0_0_10px_rgba(45,212,191,0.05)]"
                                >
                                    User
                                </button>
                                <button
                                    onClick={() => handleDevLogin(MOCK_OPERATOR)}
                                    className="py-3 bg-white/5 border border-white/5 hover:bg-white/10 rounded-xl text-[9px] font-black uppercase tracking-wider text-white/50 hover:text-white transition-all shadow-[0_0_10px_rgba(45,212,191,0.05)]"
                                >
                                    Operator
                                </button>
                                <button
                                    onClick={() => handleDevLogin(MOCK_ADMIN)}
                                    className="py-3 bg-white/5 border border-white/5 hover:bg-white/10 rounded-xl text-[9px] font-black uppercase tracking-wider text-white/50 hover:text-white transition-all shadow-[0_0_10px_rgba(45,212,191,0.05)]"
                                >
                                    Admin
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Phone Step */}
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

            {/* OTP Step */}
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
                        <div className="flex flex-col gap-2 w-full mt-2">
                            <p className="text-[9px] text-white/20 font-black uppercase tracking-widest text-center mb-1">Dev Login Override (Local)</p>
                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    onClick={() => handleDevLogin(MOCK_USER)}
                                    className="py-3 bg-white/5 border border-white/5 hover:bg-white/10 rounded-xl text-[9px] font-black uppercase tracking-wider text-white/50 hover:text-white transition-all shadow-[0_0_10px_rgba(45,212,191,0.05)]"
                                >
                                    User
                                </button>
                                <button
                                    onClick={() => handleDevLogin(MOCK_OPERATOR)}
                                    className="py-3 bg-white/5 border border-white/5 hover:bg-white/10 rounded-xl text-[9px] font-black uppercase tracking-wider text-white/50 hover:text-white transition-all shadow-[0_0_10px_rgba(45,212,191,0.05)]"
                                >
                                    Operator
                                </button>
                                <button
                                    onClick={() => handleDevLogin(MOCK_ADMIN)}
                                    className="py-3 bg-white/5 border border-white/5 hover:bg-white/10 rounded-xl text-[9px] font-black uppercase tracking-wider text-white/50 hover:text-white transition-all shadow-[0_0_10px_rgba(45,212,191,0.05)]"
                                >
                                    Admin
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Setup Step */}
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
                                    {avatarPreview ? <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" /> : <UserIcon size={48} className="text-white/20" />}
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
