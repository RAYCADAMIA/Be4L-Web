// Last Updated: 2026-02-06
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../utils/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Camera, ChevronRight, Loader2, Check, AtSign, User as UserIcon, Calendar, AlignLeft } from 'lucide-react';
import { Starfield } from '../components/Landing/LandingComponents';
import { useAuth } from '../contexts/AuthContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export const OnboardingPage: React.FC = () => {
    const navigate = useNavigate();
    useDocumentTitle('Setup Profile');
    const { updateUser } = useAuth();

    // Step 1: Basics (Name, Username, Birthdate)
    // Step 2: Profile (PFP, Bio)
    // Step 3: Done
    const [step, setStep] = useState(1);

    // Form State
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [birthdate, setBirthdate] = useState('');
    const [bio, setBio] = useState('');

    // Logic State
    const [checkingHandle, setCheckingHandle] = useState(false);
    const [handleAvailable, setHandleAvailable] = useState<boolean | null>(null);
    const [avatar, setAvatar] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const [ageError, setAgeError] = useState('');

    React.useEffect(() => {
        const fetchExistingProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                // Pre-fill from user metadata (e.g. Google auth)
                if (user.user_metadata?.full_name) setName(user.user_metadata.full_name);
                if (user.user_metadata?.name) setName(user.user_metadata.name);
                if (user.user_metadata?.avatar_url) setPreviewUrl(user.user_metadata.avatar_url);

                // Check for existing profile record
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
                    if (profile.birthdate) setBirthdate(profile.birthdate);
                    if (profile.avatar_url) setPreviewUrl(profile.avatar_url);
                }
            }
        };
        fetchExistingProfile();
    }, []);

    const validateAge = (date: string) => {
        if (!date) return;
        setBirthdate(date);
        const birth = new Date(date);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        if (age < 18) {
            setAgeError('Must be 18+ years old');
        } else {
            setAgeError('');
        }
    };

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

    const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        setAvatar(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => prev - 1);

    const finishOnboarding = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                // Try establishing session explicitly if missing? For now just error.
                // Or maybe we are in a state where user is not logged in but should be?
                // Throwing error to be caught below.
                throw new Error('No user found');
            }

            let avatarPath = (previewUrl && previewUrl.startsWith('http')) ? previewUrl : null;
            if (avatar) {
                const fileExt = avatar.name.split('.').pop();
                const fileName = `${user.id}-${Math.random()}.${fileExt}`;
                const filePath = `${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('avatars')
                    .upload(filePath, avatar);

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
                birthdate,
                avatar_url: avatarPath,
                onboarding_completed: true
            };

            console.log('Finalizing profile for user:', user.id, updates);

            const upsertData = {
                id: user.id,
                ...updates,
                updated_at: new Date().toISOString()
            };

            console.log('Sending upsert data:', upsertData);

            const { error: profileError } = await supabase
                .from('profiles')
                .upsert(upsertData, { onConflict: 'id' });

            if (profileError) {
                console.error('Database Upsert Error Detailed:', profileError);
                throw profileError;
            }

            console.log('SUCCESS: Profile upserted with data:', upsertData);
            updateUser(upsertData); // Use complete upsertData to ensure consistency
            setStep(3); // Go to Completion

        } catch (err: any) {
            console.error('Onboarding Error:', err);
            const errorMsg = err.message || (typeof err === 'object' ? JSON.stringify(err) : String(err));
            alert('Setup Failed: ' + errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const isStep1Valid = name.trim().length > 0 && username.length >= 3 && handleAvailable && birthdate && !ageError;
    const isStep2Valid = true; // Bio and PFP are optional by default in UX, but encouraged

    return (
        <div className="relative min-h-screen bg-[#09090b] text-white flex items-center justify-center p-6 overflow-hidden">
            <Starfield />
            {/* Ambient Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-electric-teal/5 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-500/5 blur-[120px] rounded-full animate-pulse delay-1000" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-[320px] w-full relative z-10"
            >
                <div className="relative bg-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden">
                    {/* Decorative Top */}
                    <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-electric-teal/5 to-transparent pointer-events-none" />

                    {/* Progress Bar */}
                    {step < 3 && (
                        <div className="absolute top-0 left-0 h-1 bg-electric-teal transition-all duration-500" style={{ width: `${(step / 2) * 100}%` }} />
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
                                    <div className="text-center space-y-1">
                                        <h1 className="text-xl font-black font-fui uppercase tracking-tighter text-white">The Basics</h1>
                                        <p className="text-cool-grey text-[10px] font-bold uppercase tracking-widest">Let's get you set up</p>
                                    </div>

                                    <div className="space-y-3 text-left">
                                        {/* Name */}
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest ml-3">Full Name</label>
                                            <div className="relative group">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-electric-teal transition-colors">
                                                    <UserIcon size={14} />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    className="w-full pl-10 pr-4 py-2 bg-black/20 border border-white/10 rounded-xl text-white font-bold text-xs focus:bg-black/40 focus:border-electric-teal/50 transition-all outline-none"
                                                    placeholder="Your Name"
                                                />
                                            </div>
                                        </div>

                                        {/* Username */}
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest ml-3">Username</label>
                                            <div className="relative group">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-electric-teal transition-colors">
                                                    <AtSign size={14} />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={username}
                                                    onChange={(e) => checkHandle(e.target.value)}
                                                    className="w-full pl-10 pr-10 py-2 bg-black/20 border border-white/10 rounded-xl text-white font-bold text-xs focus:bg-black/40 focus:border-electric-teal/50 transition-all outline-none"
                                                    placeholder="username"
                                                />
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                    {checkingHandle ? (
                                                        <Loader2 className="animate-spin text-white/30" size={14} />
                                                    ) : username.length >= 3 ? (
                                                        handleAvailable ? (
                                                            <Check className="text-electric-teal" size={14} />
                                                        ) : (
                                                            <span className="text-red-500 text-[9px] font-bold">TAKEN</span>
                                                        )
                                                    ) : null}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Birthdate */}
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest ml-3">Birthdate</label>
                                            <div className="relative group">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-electric-teal transition-colors">
                                                    <Calendar size={14} />
                                                </div>
                                                <input
                                                    type="date"
                                                    value={birthdate}
                                                    onChange={(e) => validateAge(e.target.value)}
                                                    className={`w-full pl-10 pr-4 py-2 bg-black/20 border ${ageError ? 'border-red-500/50' : 'border-white/10'} rounded-xl text-white font-bold text-xs focus:bg-black/40 focus:border-electric-teal/50 transition-all outline-none [color-scheme:dark]`}
                                                />
                                                {ageError && (
                                                    <p className="text-red-500 text-[8px] font-bold mt-1 ml-3 uppercase tracking-wider">{ageError}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={nextStep}
                                        disabled={!isStep1Valid}
                                        className="w-[70%] mx-auto py-3 rounded-xl bg-white text-black font-black font-fui uppercase tracking-[0.15em] text-xs hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-white/10"
                                    >
                                        Next
                                    </button>
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
                                    <div className="text-center space-y-1">
                                        <h1 className="text-xl font-black font-fui uppercase tracking-tighter text-white">Profile Photo</h1>
                                        <p className="text-cool-grey text-[10px] font-bold uppercase tracking-widest">Show us who you are</p>
                                    </div>

                                    <div className="flex justify-center py-2">
                                        <div className="relative group cursor-pointer">
                                            <div className="w-24 h-24 rounded-full overflow-hidden bg-black/40 border-2 border-white/10 group-hover:border-electric-teal/50 transition-all shadow-inner">
                                                {previewUrl ? (
                                                    <img src={previewUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-white/5 to-transparent gap-1">
                                                        <Camera size={20} className="text-white/20 group-hover:text-electric-teal transition-colors" />
                                                        <span className="text-[8px] text-white/20 font-bold uppercase tracking-widest group-hover:text-white/50 transition-colors">Upload</span>
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
                                            <p className="text-electric-teal font-bold uppercase tracking-widest text-[9px]">Welcome to the inner circle</p>
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
                                        className="w-[70%] mx-auto py-3 rounded-xl bg-white text-black font-black font-fui uppercase tracking-[0.15em] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] text-xs"
                                    >
                                        Enter Be4L
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.div>
        </div>

    );
};
