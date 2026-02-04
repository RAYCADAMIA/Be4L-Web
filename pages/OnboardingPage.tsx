import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../utils/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Camera, ChevronRight, Loader2, Check, AtSign } from 'lucide-react';
import { Starfield } from '../components/Landing/LandingComponents';

import { useAuth } from '../contexts/AuthContext';

export const OnboardingPage: React.FC = () => {
    const navigate = useNavigate();
    const { updateUser } = useAuth(); // Destructure updateUser
    const [step, setStep] = useState(1);
    const [handle, setHandle] = useState('');
    const [checkingHandle, setCheckingHandle] = useState(false);
    const [handleAvailable, setHandleAvailable] = useState<boolean | null>(null);
    const [avatar, setAvatar] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const checkHandle = async (value: string) => {
        setHandle(value);
        setHandleAvailable(null);
        if (value.length < 3) return;

        setCheckingHandle(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('username')
                .eq('username', value)
                .single();

            if (error && error.code === 'PGRST116') {
                setHandleAvailable(true); // No user found = available
            } else {
                setHandleAvailable(false);
            }
        } catch (err) {
            console.error(err);
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

    const finishOnboarding = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No user found');

            let avatarPath = null;
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
                username: handle,
                avatar_url: avatarPath
            };

            const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    ...updates,
                    updated_at: new Date().toISOString()
                });

            if (profileError) throw profileError;

            // Sync with local context so HomePage updates immediately
            updateUser(updates);

            setStep(3); // Go to Disclaimer

        } catch (err) {
            console.error('Onboarding Error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen bg-[#09090b] text-white flex items-center justify-center p-6 overflow-hidden">
            <Starfield />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full relative z-10"
            >
                <div className="glass-panel p-10 rounded-[3rem] border-white/5 shadow-2xl">

                    {/* Progress Bar */}
                    <div className="flex gap-2 mb-8">
                        <div className={`h-1 flex-1 rounded-full transition-colors ${step >= 1 ? 'bg-electric-teal' : 'bg-white/10'}`} />
                        <div className={`h-1 flex-1 rounded-full transition-colors ${step >= 2 ? 'bg-electric-teal' : 'bg-white/10'}`} />
                    </div>

                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="space-y-2 text-center">
                                    <h1 className="text-3xl font-black font-fui uppercase tracking-tighter">Claim Your Handle</h1>
                                    <p className="text-cool-grey font-medium">This is how the squad finds you.</p>
                                </div>

                                <div className="relative">
                                    <AtSign className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30" size={20} />
                                    <input
                                        type="text"
                                        value={handle}
                                        onChange={(e) => checkHandle(e.target.value.toLowerCase().replace(/\s/g, ''))}
                                        className="w-full pl-14 pr-12 py-5 bg-white/5 border border-white/10 rounded-2xl text-xl font-bold font-fui tracking-wide focus:border-electric-teal/50 transition-all outline-none"
                                        placeholder="username"
                                        autoFocus
                                    />
                                    <div className="absolute right-5 top-1/2 -translate-y-1/2">
                                        {checkingHandle ? (
                                            <Loader2 className="animate-spin text-white/30" size={20} />
                                        ) : handle.length >= 3 ? (
                                            handleAvailable ? (
                                                <Check className="text-electric-teal" size={20} />
                                            ) : (
                                                <span className="text-red-500 text-xs font-bold uppercase">Taken</span>
                                            )
                                        ) : null}
                                    </div>
                                </div>

                                <button
                                    onClick={() => setStep(2)}
                                    disabled={!handleAvailable || handle.length < 3}
                                    className="w-full py-4 rounded-2xl bg-white text-black font-black font-fui uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    Next <ChevronRight size={18} />
                                </button>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div className="space-y-2 text-center">
                                    <h1 className="text-3xl font-black font-fui uppercase tracking-tighter">Drop a PFP</h1>
                                    <p className="text-cool-grey font-medium">Make it recognizable.</p>
                                </div>

                                <div className="flex justify-center">
                                    <div className="relative group">
                                        <div className="w-40 h-40 rounded-full overflow-hidden bg-white/5 border-2 border-white/10 group-hover:border-electric-teal/50 transition-all">
                                            {previewUrl ? (
                                                <img src={previewUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/5 to-transparent">
                                                    <span className="text-6xl font-black text-white/10 font-fui">
                                                        {handle.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 w-12 h-12 rounded-full bg-electric-teal text-black flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-[0_0_20px_rgba(45,212,191,0.3)]">
                                            <Camera size={20} />
                                        </label>
                                        <input
                                            type="file"
                                            id="avatar-upload"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleAvatarUpload}
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={finishOnboarding}
                                    disabled={loading}
                                    className="w-full py-4 rounded-2xl bg-white text-black font-black font-fui uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(45,212,191,0.1)]"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="animate-spin" size={18} />
                                            SYNCING...
                                        </>
                                    ) : (
                                        "I'M READY"
                                    )}
                                </button>
                                <button onClick={() => setStep(1)} className="w-full text-center text-xs font-bold uppercase tracking-widest text-white/30 hover:text-white transition-colors">
                                    Back
                                </button>
                            </motion.div>
                        )}
                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center space-y-8"
                            >
                                <div className="space-y-4">
                                    <h1 className="text-4xl font-black font-fui uppercase tracking-tighter text-electric-teal animate-pulse">
                                        Welcome, Founding Member
                                    </h1>
                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-left space-y-4">
                                        <p className="text-sm text-cool-grey leading-relaxed">
                                            <strong className="text-white block mb-1">⚠️ Pre-Launch Prototype Access</strong>
                                            You are experiencing an early prototype version of Be4L. Some features (Echo, Quests) are currently using <strong>mock data</strong> for demonstration purposes.
                                        </p>
                                        <p className="text-sm text-cool-grey leading-relaxed">
                                            <strong className="text-white block mb-1">🚀 Official Launch: Feb 6, 2026</strong>
                                            The full MVP with real-time features will go live this Friday. Your handle and profile are secured as a Founding Member.
                                        </p>
                                        <div className="pt-2 border-t border-white/5 mt-2">
                                            <a
                                                href="https://www.instagram.com/be4l.app/"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 group"
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
                                                </div>
                                                <span className="text-[11px] font-black uppercase tracking-widest text-[#E4405F] group-hover:text-white transition-colors">
                                                    Follow our IG page
                                                </span>
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => navigate('/app/home')}
                                    className="w-full py-4 rounded-2xl bg-white text-black font-black font-fui uppercase tracking-widest hover:scale-[1.05] active:scale-[0.95] transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)]"
                                >
                                    Enter the Lore
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

        </div>
    );
};
