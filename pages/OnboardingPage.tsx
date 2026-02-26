import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../utils/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Camera, Loader2, Check, AtSign, User as UserIcon, AlignLeft } from 'lucide-react';
import { Starfield } from '../components/Landing/LandingComponents';
import { useAuth } from '../contexts/AuthContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import Cropper from 'react-easy-crop';
import { useToast } from '../components/Toast';
import getCroppedImg from '../utils/cropImage';

export const OnboardingPage: React.FC = () => {
    const navigate = useNavigate();
    useDocumentTitle('Setup Profile');
    const { updateUser } = useAuth();
    const { showToast } = useToast();

    // Step 1: Basics (Name, Username)
    // Step 2: Profile (PFP, Bio)
    // Step 3: Done
    const [step, setStep] = useState(1);

    // Form State
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [bio, setBio] = useState('');

    // Crop State
    const [imageToCrop, setImageToCrop] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

    // Logic State
    const [checkingHandle, setCheckingHandle] = useState(false);
    const [handleAvailable, setHandleAvailable] = useState<boolean | null>(null);
    const [avatarBlob, setAvatarBlob] = useState<Blob | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
        const fetchExistingProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                if (user.user_metadata?.full_name) setName(user.user_metadata.full_name);
                if (user.user_metadata?.name) setName(user.user_metadata.name);
                if (user.user_metadata?.avatar_url) setPreviewUrl(user.user_metadata.avatar_url);

                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (profile) {
                    if (profile.name) setName(profile.name);
                    if (profile.username) {
                        setUsername(profile.username);
                        setHandleAvailable(true);
                    }
                    if (profile.bio) setBio(profile.bio);
                    if (profile.avatar_url) setPreviewUrl(profile.avatar_url);
                }
            }
        };
        fetchExistingProfile();
    }, []);

    const checkHandle = async (value: string) => {
        const cleanValue = value.toLowerCase().replace(/\s/g, '');
        setUsername(cleanValue);
        setHandleAvailable(null);
        if (cleanValue.length < 3) return;

        setCheckingHandle(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('username')
                .eq('username', cleanValue)
                .limit(1);

            if (!error && data && data.length === 0) {
                setHandleAvailable(true);
            } else {
                setHandleAvailable(false);
            }
        } catch (err) {
            console.error("Handle Check Error:", err);
        } finally {
            setCheckingHandle(false);
        }
    };

    const onCropComplete = useCallback((_area: any, pixels: any) => {
        setCroppedAreaPixels(pixels);
    }, []);

    const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.addEventListener('load', () => setImageToCrop(reader.result as string));
        reader.readAsDataURL(file);
    };

    const applyCrop = async () => {
        if (!imageToCrop || !croppedAreaPixels) return;
        const croppedBlob = await getCroppedImg(imageToCrop, croppedAreaPixels);
        if (croppedBlob) {
            setAvatarBlob(croppedBlob);
            setPreviewUrl(URL.createObjectURL(croppedBlob));
            setImageToCrop(null);
        }
    };

    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => prev - 1);

    const finishOnboarding = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No user found');

            let avatarPath = (previewUrl && previewUrl.startsWith('http')) ? previewUrl : null;
            if (avatarBlob) {
                const fileName = `${user.id}-${Date.now()}.jpg`;
                const filePath = `${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('avatars')
                    .upload(filePath, avatarBlob, { contentType: 'image/jpeg' });

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('avatars')
                    .getPublicUrl(filePath);

                avatarPath = publicUrl;
            }

            const updates = {
                name,
                username: username,
                handle: `@${username}`,
                bio,
                avatar_url: avatarPath,
                onboarding_completed: true
            };

            const upsertData = {
                id: user.id,
                ...updates,
                updated_at: new Date().toISOString()
            };

            const { error: profileError } = await supabase
                .from('profiles')
                .upsert(upsertData, { onConflict: 'id' });

            if (profileError) throw profileError;

            updateUser(upsertData);
            setStep(3);

        } catch (err: any) {
            console.error('Onboarding Error:', err);
            showToast('Setup Failed: ' + (err.message || String(err)), 'error');
        } finally {
            setLoading(false);
        }
    };

    const isStep1Valid = name.trim().length > 0 && username.length >= 3 && handleAvailable;
    const isStep2Valid = true;

    return (
        <div className="fixed inset-0 w-full h-full bg-transparent flex items-center justify-center overflow-y-auto p-4 md:p-6 lg:p-8 select-none touch-none overscroll-none scrollbar-hide">
            {/* Atmosphere - Match AuthPage */}
            <div className="vibrant-glow opacity-60">
                <div className="blob blob-1 !opacity-40 scale-125" />
                <div className="blob blob-2 !opacity-30 scale-125" />
                <div className="blob blob-3 !opacity-20 scale-125" />
            </div>

            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-cyan-500/10 pointer-events-none" />
            <Starfield />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-[360px] w-full relative z-30"
            >
                <div className="relative bg-[#09090B]/30 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] shadow-[0_48px_120px_-30px_rgba(0,0,0,0.8)] overflow-hidden">
                    {/* Progress Bar */}
                    {step < 3 && (
                        <div className="absolute top-0 left-0 h-1 bg-gradient-to-r from-indigo-500 to-cyan-500 transition-all duration-700 ease-out z-50" style={{ width: `${(step / 2) * 100}%` }} />
                    )}

                    <div className="p-8 relative z-10 text-center">
                        <AnimatePresence mode="wait">

                            {/* STEP 1: BASICS */}
                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <div className="text-center pt-8">
                                        <p className="text-cool-grey text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Let's get you set up</p>
                                    </div>

                                    <div className="space-y-4 text-left">
                                        {/* Name */}
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-4">Full Name</label>
                                            <div className="relative group">
                                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-electric-teal transition-all duration-300">
                                                    <UserIcon size={16} />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    className="w-full pl-14 pr-6 py-4 bg-black/40 border border-white/10 rounded-2xl text-white font-black text-[11px] focus:bg-black/60 focus:border-electric-teal/40 transition-all outline-none"
                                                    placeholder="Your Name"
                                                />
                                            </div>
                                        </div>

                                        {/* Username */}
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-4">Username</label>
                                            <div className="relative group">
                                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-electric-teal transition-all duration-300">
                                                    <AtSign size={16} />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={username}
                                                    onChange={(e) => checkHandle(e.target.value)}
                                                    className="w-full pl-14 pr-12 py-4 bg-black/40 border border-white/10 rounded-2xl text-white font-black text-[11px] focus:bg-black/60 focus:border-electric-teal/40 transition-all outline-none"
                                                    placeholder="username"
                                                />
                                                <div className="absolute right-5 top-1/2 -translate-y-1/2">
                                                    {checkingHandle ? (
                                                        <Loader2 className="animate-spin text-white/30" size={16} />
                                                    ) : username.length >= 3 ? (
                                                        handleAvailable ? (
                                                            <Check className="text-electric-teal" size={16} />
                                                        ) : (
                                                            <span className="text-red-500 text-[9px] font-black">TAKEN</span>
                                                        )
                                                    ) : null}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <button
                                            onClick={nextStep}
                                            disabled={!isStep1Valid}
                                            className="w-[70%] mx-auto py-3 rounded-xl bg-white text-black font-black font-fui uppercase tracking-[0.15em] text-xs hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-white/10"
                                        >
                                            Next
                                        </button>

                                        <button onClick={() => navigate('/auth')} className="py-2 text-[9px] font-bold uppercase tracking-widest text-white/30 hover:text-white transition-colors">
                                            Back
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {/* STEP 2: PROFILE (FINAL) */}
                            {step === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <div className="text-center pt-8">
                                        <p className="text-cool-grey text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Show us who you are</p>
                                    </div>

                                    <div className="flex justify-center py-4">
                                        <div className="relative group cursor-pointer">
                                            <div className="w-28 h-28 rounded-full overflow-hidden bg-black/40 border-2 border-white/5 group-hover:border-electric-teal/30 transition-all shadow-inner relative">
                                                {previewUrl ? (
                                                    <img src={previewUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-white/5 to-transparent gap-2">
                                                        <Camera size={24} className="text-white/10 group-hover:text-electric-teal transition-colors" />
                                                        <span className="text-[7.5px] text-white/10 font-black uppercase tracking-[0.2em] group-hover:text-white/40 transition-colors">Select Image</span>
                                                    </div>
                                                )}
                                            </div>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                                onChange={handleAvatarUpload}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1 text-left">
                                        <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest ml-3">Bio</label>
                                        <div className="relative group">
                                            <div className="absolute left-4 top-3 text-white/20 group-focus-within:text-electric-teal transition-colors">
                                                <AlignLeft size={14} />
                                            </div>
                                            <textarea
                                                value={bio}
                                                onChange={(e) => setBio(e.target.value)}
                                                className="w-full pl-10 pr-4 py-2 bg-black/20 border border-white/10 rounded-xl text-white font-bold text-xs focus:bg-black/40 focus:border-electric-teal/50 transition-all outline-none resize-none h-20"
                                                placeholder="Write a short bio..."
                                                maxLength={150}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <button
                                            onClick={finishOnboarding}
                                            disabled={loading}
                                            className="w-[70%] mx-auto py-3 rounded-xl bg-white text-black font-black font-fui uppercase tracking-[0.15em] text-xs hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-white/10"
                                        >
                                            {loading ? <Loader2 className="animate-spin" size={14} /> : 'Finish'}
                                        </button>

                                        <button onClick={prevStep} className="py-2 text-[9px] font-bold uppercase tracking-widest text-white/30 hover:text-white transition-colors">
                                            Back
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {/* STEP 3: COMPLETION (Was 4) */}
                            {step === 3 && (
                                <motion.div
                                    key="complete"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center space-y-6 py-2"
                                >
                                    <div className="space-y-4">
                                        <div className="w-16 h-16 rounded-full bg-electric-teal/10 mx-auto flex items-center justify-center border border-electric-teal/20 shadow-[0_0_40px_rgba(45,212,191,0.2)] animate-pulse">
                                            <Check size={28} className="text-electric-teal" />
                                        </div>

                                        <div className="space-y-1">
                                            <h1 className="text-3xl font-black font-fui uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-white/50">
                                                All Set
                                            </h1>
                                        </div>

                                        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-left space-y-2 backdrop-blur-sm max-w-[240px] mx-auto">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-white/10 overflow-hidden">
                                                    {previewUrl ? <img src={previewUrl} className="w-full h-full object-cover" /> : <UserIcon className="p-1.5 text-white/50" />}
                                                </div>
                                                <div>
                                                    <h3 className="text-xs font-bold text-white">{name}</h3>
                                                    <p className="text-[9px] text-white/50 font-medium">@{username}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => navigate('/app/home')}
                                        className="w-[80%] mx-auto py-4 rounded-2xl bg-white text-black font-black uppercase tracking-[0.4em] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_40px_rgba(255,255,255,0.15)] text-[11px]"
                                    >
                                        Enter Be4L
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.div>

            {/* Cropper Overlay */}
            <AnimatePresence>
                {imageToCrop && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-6"
                    >
                        <div className="relative w-full max-w-sm aspect-square bg-[#09090B] rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl">
                            <Cropper
                                image={imageToCrop}
                                crop={crop}
                                zoom={zoom}
                                aspect={1}
                                onCropChange={setCrop}
                                onCropComplete={onCropComplete}
                                onZoomChange={setZoom}
                                cropShape="round"
                                showGrid={false}
                            />
                        </div>

                        <div className="w-full max-w-xs mt-12 space-y-8 flex flex-col items-center">
                            <div className="w-full space-y-4">
                                <label className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40 block text-center">Zoom Level</label>
                                <input
                                    type="range"
                                    value={zoom}
                                    min={1}
                                    max={3}
                                    step={0.1}
                                    aria-labelledby="Zoom"
                                    onChange={(e) => setZoom(Number(e.target.value))}
                                    className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-white"
                                />
                            </div>

                            <div className="flex gap-4 w-full">
                                <button
                                    onClick={() => setImageToCrop(null)}
                                    className="flex-1 py-4 px-6 rounded-2xl bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={applyCrop}
                                    className="flex-1 py-4 px-6 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-zinc-100 transition-all"
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
