import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabaseService } from '../services/supabaseService';
import { MOCK_USER, MOCK_OPERATOR, MOCK_ADMIN } from '../constants';
import { User as UserType } from '../types';
import { ArrowRight, Loader2, Mail, Lock, X, Github, Chrome, User, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AuthScreenProps {
    onClose: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onClose }) => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [isLogin, setIsLogin] = useState(false); // Default to Sign Up as per user request
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                const result = await supabaseService.auth.signInWithEmail(email, password);
                if (result) {
                    login(result);
                } else {
                    setError('Invalid credentials');
                }
            } else {
                const result = await supabaseService.auth.signUpWithEmail(email, password, '');
                if (result) {
                    if (result.user) {
                        setError('Check your email for the magic link!');
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
                                        <p className="text-electric-teal/60 font-medium text-[9px] uppercase tracking-widest italic animate-pulse">
                                            Experience more, worry less. ✦
                                        </p>
                                    )}
                                </div>
                            </div>

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
                                        placeholder="EMAIL"
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
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-white/5 border border-transparent rounded-full text-white placeholder-white/10 text-xs font-medium focus:bg-white/10 focus:border-electric-teal/30 transition-all outline-none"
                                        placeholder="PASSWORD"
                                        required
                                    />
                                </motion.div>

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
                                <div className="flex w-full gap-2">
                                    <button
                                        onClick={handleGoogleSignIn}
                                        disabled={loading}
                                        className="flex-1 py-2.5 bg-white/5 border border-white/5 rounded-full hover:bg-white/10 transition-all flex items-center justify-center gap-2 text-white/40 text-[10px] uppercase font-black"
                                    >
                                        <Chrome size={12} />
                                        Google
                                    </button>
                                    <button
                                        className="flex-1 py-2.5 bg-white/5 border border-white/5 rounded-full hover:bg-white/10 transition-all flex items-center justify-center gap-2 text-white/40 text-[10px] uppercase font-black opacity-20 cursor-not-allowed"
                                    >
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.45-1.03 3.12-1.03.82 0 2.29.43 3.08 1.48-2.6 1.47-2.14 5.38.48 6.55-.54 1.55-1.32 3.1-2.08 4.23h.02zM13 3.5c.57-.86 1.44-1.5 2.34-1.5.06 1.05-.59 2.15-1.25 2.76-.62.58-1.58 1.03-2.47.89-.09-1.03.62-1.92 1.38-2.15z" /></svg>
                                        Apple
                                    </button>
                                </div>

                                <button
                                    onClick={() => handleDevLogin(MOCK_USER)}
                                    className="w-full py-2.5 bg-electric-teal/5 border border-electric-teal/10 rounded-full hover:bg-electric-teal/10 transition-all flex items-center justify-center gap-2 text-electric-teal text-[10px] uppercase font-black tracking-widest mt-1"
                                >
                                    Login as Guest
                                </button>
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

                {/* Close Button Interaction */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 lg:hidden p-3 text-white/30 hover:text-white hover:bg-white/10 rounded-full transition-all"
                >
                    <X size={24} />
                </button>
            </div>

            {/* Desktop Close Button outside the box */}
            <button
                onClick={onClose}
                className="hidden lg:block absolute -top-8 -right-8 p-3 text-white/30 hover:text-white hover:bg-white/10 rounded-full transition-all"
            >
                <X size={24} />
            </button>
        </div>
    );
};
