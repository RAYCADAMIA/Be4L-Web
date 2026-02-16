import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabaseService } from '../../services/supabaseService';
import { ArrowRight, Loader2, Mail, Lock, Eye, EyeOff, Chrome } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AuthBoxProps {
    onSuccess?: () => void;
    initialMode?: 'login' | 'signup';
    hideHeader?: boolean;
}

export const AuthBox: React.FC<AuthBoxProps> = ({ onSuccess, initialMode = 'login', hideHeader = false }) => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [isLogin, setIsLogin] = useState(initialMode === 'login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                let loginEmail = email;
                if (!email.includes('@')) {
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
                    onSuccess?.();
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
                        const newUser: any = {
                            id: result.user.id,
                            email: result.user.email,
                            username: '',
                            streak_count: 0,
                            is_new_user: true
                        };
                        login(newUser);
                        onSuccess?.();
                        navigate('/onboarding');
                    } else if (result.user) {
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

    const handleGuestLogin = async () => {
        setLoading(true);
        try {
            const result = await supabaseService.auth.signInAsGuest();
            if (result) {
                login(result);
                onSuccess?.();
                navigate('/app/home');
            }
        } catch (err: any) {
            setError(err.message || 'Guest login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative w-full max-w-[460px]">
            {/* Deep Glass Container */}
            <div className="relative bg-[#0F0F12]/60 backdrop-blur-3xl border border-white/10 rounded-[2rem] overflow-hidden">

                <div className="relative z-10 p-8 md:p-12 flex flex-col items-center justify-center">
                    {/* Header - Conditionally Hidden */}
                    {!hideHeader && (
                        <div className="text-center mb-6 space-y-1">
                            <h2 className="text-2xl md:text-3xl font-black font-display text-gradient-static uppercase tracking-[-0.02em] drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] pr-2">
                                {isLogin ? 'Welcome Back' : 'Create Account'}
                            </h2>
                            <p className="text-white font-black text-[10px] uppercase tracking-[0.25em] opacity-80 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
                                {isLogin ? 'Log in to continue your lore' : 'Join the be4l community'}
                            </p>
                        </div>
                    )}

                    {/* Error Alert */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0, scale: 0.95 }}
                                animate={{ opacity: 1, height: 'auto', scale: 1 }}
                                exit={{ opacity: 0, height: 0, scale: 0.95 }}
                                className="w-full mb-6 p-4 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-[10px] font-black uppercase tracking-widest text-center shadow-lg drop-shadow-sm"
                            >
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="w-full space-y-3">
                        <div className="relative group">
                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-electric-teal transition-all duration-300 drop-shadow-sm">
                                <Mail size={16} />
                            </div>
                            <label htmlFor="auth-email" className="sr-only">Email or Username</label>
                            <input
                                id="auth-email"
                                type="text"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-14 pr-6 py-3.5 bg-black/40 border border-white/20 rounded-xl text-white placeholder-white/40 text-[13px] font-bold focus:bg-black/60 focus:border-electric-teal focus:ring-1 focus:ring-electric-teal/30 transition-all outline-none shadow-sm"
                                placeholder={isLogin ? "EMAIL OR USERNAME" : "YOUR EMAIL"}
                                required
                            />
                        </div>

                        <div className="relative group">
                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-electric-teal transition-all duration-300 drop-shadow-sm">
                                <Lock size={16} />
                            </div>
                            <label htmlFor="auth-password" className="sr-only">Password</label>
                            <input
                                id="auth-password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-14 pr-12 py-3.5 bg-black/40 border border-white/20 rounded-xl text-white placeholder-white/40 text-[13px] font-bold focus:bg-black/60 focus:border-electric-teal focus:ring-1 focus:ring-electric-teal/30 transition-all outline-none shadow-sm"
                                placeholder="PASSWORD"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-all drop-shadow-sm"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>

                        {!isLogin && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="relative group"
                            >
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-electric-teal transition-all duration-300 drop-shadow-sm">
                                    <Lock size={16} />
                                </div>
                                <label htmlFor="auth-confirm-password" className="sr-only">Confirm Password</label>
                                <input
                                    id="auth-confirm-password"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full pl-14 pr-6 py-3.5 bg-black/40 border border-white/20 rounded-xl text-white placeholder-white/40 text-[13px] font-bold focus:bg-black/60 focus:border-electric-teal focus:ring-1 focus:ring-electric-teal/30 transition-all outline-none shadow-sm"
                                    placeholder="CONFIRM PASSWORD"
                                    required={!isLogin}
                                />
                            </motion.div>
                        )}

                        <motion.button
                            type="submit"
                            disabled={loading}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            className="w-full py-3.5 bg-white text-black font-black uppercase text-[11px] tracking-[0.4em] rounded-xl hover:bg-zinc-100 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" size={16} /> : (isLogin ? 'Log In' : 'Sign Up')}
                            {!loading && <ArrowRight size={14} />}
                        </motion.button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-5 w-full my-4">
                        <div className="flex-1 h-px bg-white/5" />
                        <span className="text-white/30 text-[9px] font-black uppercase tracking-[0.4em] pr-2">OR</span>
                        <div className="flex-1 h-px bg-white/5" />
                    </div>

                    {/* Social Access Only (Google disabled) */}
                    <div className="flex flex-col w-full gap-3">
                        <button
                            disabled={true}
                            className="w-full py-3.5 bg-white/5 border border-white/10 rounded-xl opacity-40 cursor-not-allowed flex items-center justify-center gap-3 text-white/60 text-[11px] uppercase font-black tracking-[0.15em] drop-shadow-sm"
                        >
                            <Chrome size={14} />
                            Google (Coming Soon)
                        </button>
                    </div>

                    {/* Switch Mode */}
                    <div className="mt-6 pt-4 border-t border-white/5 w-full text-center">
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-white/40 text-[11px] uppercase font-black tracking-[0.2em] hover:text-white transition-all group drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]"
                        >
                            {isLogin ? (
                                <>Don't have an account? <span className="text-white group-hover:text-electric-teal ml-2 transition-colors">Create Now</span></>
                            ) : (
                                <>Already have an account? <span className="text-white group-hover:text-electric-teal ml-2 transition-colors">Sign In</span></>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
