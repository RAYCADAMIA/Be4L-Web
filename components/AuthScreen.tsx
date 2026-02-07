import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabaseService } from '../services/supabaseService';
import { MOCK_USER, MOCK_OPERATOR, MOCK_ADMIN } from '../constants';
import { User as UserType } from '../types';
import { ArrowRight, Loader2, Mail, Lock, X, Github, Chrome, User, Terminal, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AccountRecoveryModal } from './AccountRecoveryModal';

interface AuthScreenProps {
    onClose: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onClose }) => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [isLogin, setIsLogin] = useState(false); // Default to Sign Up as per user request
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showRecovery, setShowRecovery] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                // Determine if input is email or username
                let loginEmail = email;
                if (!email.includes('@')) {
                    // Assume username - try to resolve to email
                    const resolvedEmail = await supabaseService.auth.getEmailByUsername(email);
                    if (!resolvedEmail) {
                        setError('Username not found');
                        setLoading(false);
                        return;
                    }
                    loginEmail = resolvedEmail;
                }

                const result = await supabaseService.auth.signInWithEmail(loginEmail, password);
                if (result) {
                    login(result);
                    onClose();
                    navigate('/app/home');
                } else {
                    setError('Invalid credentials');
                }
            } else {
                if (password !== confirmPassword) {
                    setError('Passwords do not match');
                    setLoading(false);
                    return;
                }
                const result = await supabaseService.auth.signUpWithEmail(email, password, '');
                if (result) {
                    if (result.session && result.user) {
                        // Auto-logged in after sign up
                        const newUser: any = {
                            id: result.user.id,
                            email: result.user.email,
                            username: '', // Explicitly empty to trigger onboarding
                            streak_count: 0,
                            is_new_user: true
                        };
                        login(newUser);
                        onClose();
                        navigate('/onboarding');
                    } else if (result.user) {
                        // Needs email verification
                        setError('Check your email to verify and proceed to setup!');
                    }
                } else {
                    setError('Failed to create account');
                }
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setError('');
        setLoading(true);
        try {
            await supabaseService.auth.signInWithGoogle();
        } catch (err: any) {
            setError(err.message || 'Google sign-in failed');
            setLoading(false);
        }
    };

    const handleDevLogin = (user: UserType) => {
        login(user);
        onClose();
        if (user.is_operator) {
            navigate('/app/home');
        } else if (user.is_admin) {
            navigate('/app/admin');
        } else {
            navigate('/app/home');
        }
    };

    const handleGuestLogin = () => {
        const randomId = Math.floor(1000 + Math.random() * 9000);
        const guestUser: UserType = {
            ...MOCK_USER,
            id: `guest_${randomId}`,
            name: 'Guest',
            username: `guest${randomId}`,
            handle: `@guest${randomId}`,
            onboarding_completed: true,
            is_new_user: false // Force established state
        };
        login(guestUser);
        onClose();
        navigate('/app/home');
    };

    return (
        <div className="relative w-full bg-white/[0.02] backdrop-blur-md border border-white/5 rounded-[1.5rem] md:rounded-[3rem] overflow-hidden shadow-2xl flex flex-col lg:flex-row items-stretch min-h-[500px] lg:min-h-[650px]">

            {/* Left Side: Dynamic Virtual Interface */}
            <div className="hidden lg:flex flex-1 relative items-center justify-center p-12 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-electric-teal/10 via-transparent to-electric-teal/5" />

                {/* 3D-like Composition */}
                <div className="relative w-full h-[500px] flex items-center justify-center">

                    {/* Background Glow */}
                    <div className="absolute w-[500px] h-[500px] bg-electric-teal/5 blur-[120px] rounded-full animate-pulse" />

                    {/* Floating Interface Elements */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative z-10 w-full flex items-center justify-center"
                    >
                        {/* Central "Core" */}
                        <motion.div
                            animate={{
                                rotateY: [0, 360],
                                rotate: [0, 45, 0]
                            }}
                            transition={{
                                duration: 20,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                            className="w-48 h-48 rounded-full border border-white/10 flex items-center justify-center p-4 backdrop-blur-sm"
                        >
                            <div className="w-full h-full rounded-full border border-electric-teal/20 flex items-center justify-center">
                                <div className="w-12 h-12 rounded-full bg-electric-teal/10 animate-pulse shadow-[0_0_30px_rgba(45,212,191,0.2)]" />
                            </div>
                        </motion.div>

                        {/* Orbiting Cards */}
                        {[0, 120, 240].map((angle, i) => (
                            <motion.div
                                key={i}
                                animate={{
                                    rotate: [angle, angle + 360],
                                }}
                                transition={{
                                    duration: 15,
                                    repeat: Infinity,
                                    ease: "linear"
                                }}
                                className="absolute w-full h-full"
                            >
                                <motion.div
                                    animate={{
                                        rotate: [0, -360],
                                        y: [0, -10, 10, 0]
                                    }}
                                    transition={{
                                        rotate: { duration: 15, repeat: Infinity, ease: "linear" },
                                        y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                                    }}
                                    className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-32 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-3"
                                >
                                    <div className="w-full h-full border border-white/5 rounded-xl bg-gradient-to-br from-white/5 to-transparent flex flex-col gap-2 p-2">
                                        <div className="w-4 h-4 rounded bg-electric-teal/20" />
                                        <div className="w-full h-1 bg-white/10 rounded-full" />
                                        <div className="w-2/3 h-1 bg-white/10 rounded-full" />
                                    </div>
                                </motion.div>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Scanning Line Effect */}
                    <motion.div
                        animate={{
                            top: ['0%', '100%', '0%']
                        }}
                        transition={{
                            duration: 10,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                        className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-electric-teal/20 to-transparent z-20"
                    />
                </div>
            </div>

            {/* Right Side: Small Minimalistic Auth Box */}
            <div className="flex-1 lg:flex-none lg:w-[480px] flex items-center justify-center lg:justify-end p-4 md:p-10 relative">

                <div className="relative w-full max-w-[340px]">
                    {/* Deep Glass Container */}
                    <div className="relative bg-deep-void/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] overflow-hidden">

                        {/* Neon Haze / Glow Effects */}
                        <div className="absolute inset-0 shadow-[0_0_100px_rgba(45,212,191,0.05)] pointer-events-none" />
                        <div className="absolute -top-20 -left-20 w-40 h-40 bg-electric-teal/10 blur-[80px] rounded-full pointer-events-none" />
                        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-electric-teal/10 blur-[80px] rounded-full pointer-events-none" />

                        {/* Content Wrapper */}
                        <div className="relative z-10 p-6 md:p-10 flex flex-col items-center">

                            {/* Header */}
                            <div className="text-center mb-8 space-y-3">
                                <h2 className="text-3xl font-black font-fui animate-liquid-text uppercase tracking-tighter transition-all">
                                    {isLogin ? 'Welcome Back' : 'Start Your Lore'}
                                </h2>
                                <div className="space-y-1">
                                    <p className="text-cool-grey font-bold text-[10px] uppercase tracking-[0.2em] leading-tight">
                                        {isLogin ? 'Log in to continue' : 'Join the giant friend group'}
                                    </p>
                                    {!isLogin && (
                                        <p className="text-electric-teal/60 font-medium text-[9px] uppercase tracking-widest animate-pulse">
                                            Experience more, worry less. ✦
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Error Alert */}
                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="w-full mb-4 p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold text-center uppercase tracking-widest"
                                    >
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="w-full space-y-3">

                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="relative group"
                                >
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-electric-teal transition-colors">
                                        <User size={14} />
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-white/5 border border-transparent rounded-full text-white placeholder-white/10 text-xs font-medium focus:bg-white/10 focus:border-electric-teal/30 transition-all outline-none"
                                        placeholder={isLogin ? "USERNAME OR EMAIL" : "EMAIL"}
                                        aria-label="Email or Username"
                                        required
                                    />
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="relative group"
                                >
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-electric-teal transition-colors">
                                        <Lock size={14} />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-12 pr-12 py-3 bg-white/5 border border-transparent rounded-full text-white placeholder-white/10 text-xs font-medium focus:bg-white/10 focus:border-electric-teal/30 transition-all outline-none"
                                        placeholder="PASSWORD"
                                        aria-label="Password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                    </button>
                                </motion.div>

                                <AnimatePresence>
                                    {isLogin && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="text-right"
                                        >
                                            <button
                                                type="button"
                                                onClick={() => setShowRecovery(true)}
                                                className="text-[9px] font-bold text-white/30 hover:text-white uppercase tracking-widest transition-colors"
                                            >
                                                Forgot Password?
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <AnimatePresence>
                                    {!isLogin && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                            animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                                            exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                            className="relative group overflow-hidden"
                                        >
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-electric-teal transition-colors">
                                                <Lock size={14} />
                                            </div>
                                            <input
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-transparent rounded-full text-white placeholder-white/10 text-xs font-medium focus:bg-white/10 focus:border-electric-teal/30 transition-all outline-none"
                                                placeholder="CONFIRM PASSWORD"
                                                aria-label="Confirm Password"
                                                required={!isLogin}
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <motion.button
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 mt-2 bg-white text-black font-black uppercase text-[10px] tracking-[0.3em] rounded-full hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={16} /> : (isLogin ? 'Log In' : 'Sign Up')}
                                    {!loading && <ArrowRight size={14} />}
                                </motion.button>
                            </form>

                            {/* Divider */}
                            <div className="flex items-center gap-4 w-full my-6">
                                <div className="flex-1 h-px bg-white/5" />
                                <span className="text-white/10 text-[8px] font-black uppercase tracking-widest">OR</span>
                                <div className="flex-1 h-px bg-white/5" />
                            </div>

                            {/* Social Buttons & Guest Access */}
                            <div className="flex flex-col w-full gap-2">
                                <button
                                    onClick={handleGoogleSignIn}
                                    disabled={true}
                                    className="w-full py-2.5 bg-white/5 border border-white/5 rounded-full opacity-30 cursor-not-allowed transition-all flex items-center justify-center gap-2 text-white/40 text-[10px] uppercase font-black"
                                >
                                    <Chrome size={12} />
                                    Google (Coming Soon)
                                </button>

                                <button
                                    onClick={handleGuestLogin}
                                    className="w-full py-3 bg-electric-teal/5 border border-electric-teal/10 rounded-full hover:bg-electric-teal/10 transition-all flex items-center justify-center gap-2 text-electric-teal text-[9px] uppercase font-black tracking-widest mt-1"
                                >
                                    Preview as guest to explore <span className="animate-liquid-text ml-1 normal-case">Be4L</span>
                                </button>

                                {!isLogin && (
                                    <div className="mt-2 text-center">
                                        <p className="text-[9px] text-electric-teal/70 font-bold uppercase tracking-widest animate-pulse">
                                            ✨ Join now to become a Founding Member
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Dev Mode Section */}
                            {/* Dev Mode Section - DISABLED FOR PRE-LAUNCH */}
                            {/* <div className="mt-4 pt-4 border-t border-white/5">
                                <div className="flex flex-col gap-2">
                                    <p className="text-[8px] text-white/20 font-black uppercase tracking-widest text-center flex items-center justify-center gap-1">
                                        <Terminal size={8} /> Local Dev Access
                                    </p>
                                    <div className="grid grid-cols-3 gap-2">
                                        <button onClick={() => handleDevLogin(MOCK_USER)} className="py-2 bg-white/5 hover:bg-white/10 rounded-lg text-[8px] font-bold text-white/50 hover:text-white uppercase transition-colors">User</button>
                                        <button onClick={() => handleDevLogin(MOCK_OPERATOR)} className="py-2 bg-white/5 hover:bg-white/10 rounded-lg text-[8px] font-bold text-white/50 hover:text-white uppercase transition-colors">Operator</button>
                                        <button onClick={() => handleDevLogin(MOCK_ADMIN)} className="py-2 bg-white/5 hover:bg-white/10 rounded-lg text-[8px] font-bold text-white/50 hover:text-white uppercase transition-colors">Admin</button>
                                    </div>
                                </div>
                            </div> */}

                            {/* Switch Mode */}
                            <div className="mt-8 text-center">
                                <button
                                    onClick={() => setIsLogin(!isLogin)}
                                    className="text-white/20 text-[9px] uppercase font-black tracking-[0.2em] hover:text-white transition-colors group"
                                >
                                    {isLogin ? (
                                        <>Don't have an account? <span className="text-white/40 group-hover:text-white ml-1">Sign Up</span></>
                                    ) : (
                                        <>Already have an account? <span className="text-white/40 group-hover:text-white ml-1">Log In</span></>
                                    )}
                                </button>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Close Button Interactions */}
                <button
                    onClick={onClose}
                    aria-label="Close"
                    className="absolute top-4 right-4 lg:hidden p-3 text-white/30 hover:text-white hover:bg-white/10 rounded-full transition-all"
                >
                    <X size={24} />
                </button>

                {/* Desktop Close Button */}
                <button
                    onClick={onClose}
                    aria-label="Close"
                    className="hidden lg:block absolute -top-8 -right-8 p-3 text-white/30 hover:text-white hover:bg-white/10 rounded-full transition-all"
                >
                    <X size={24} />
                </button>
            </div>
            <AccountRecoveryModal isOpen={showRecovery} onClose={() => setShowRecovery(false)} />
        </div>
    );
};
