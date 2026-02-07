import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabaseService } from '../services/supabaseService';
import { X, Mail, Check, Lock, Loader2, ArrowRight } from 'lucide-react';
import { useToast } from './Toast';

interface AccountRecoveryModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AccountRecoveryModal: React.FC<AccountRecoveryModalProps> = ({ isOpen, onClose }) => {
    const { showToast } = useToast();
    const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Email, 2: OTP, 3: New Password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const { success, error } = await supabaseService.auth.sendEmailOtp(email);
            if (success) {
                setStep(2);
                showToast('Recovery code sent to email', 'success');
            } else {
                setError(error || 'Failed to send code');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const { user, error } = await supabaseService.auth.verifyEmailOtp(email, otp);
            if (user) {
                setStep(3);
                showToast('Code verified', 'success');
            } else {
                setError(error || 'Invalid code');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const { success, error } = await supabaseService.auth.updatePassword(newPassword);
            if (success) {
                showToast('Password updated successfully', 'success');
                onClose();
                // Reset styling or state if needed
            } else {
                setError(error || 'Failed to update password');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/90 backdrop-blur-md"
                    onClick={onClose}
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-sm bg-[#0A0A0B] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header Graphic */}
                    <div className="h-32 bg-gradient-to-b from-electric-teal/10 to-transparent flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                        <div className="w-16 h-16 rounded-full bg-electric-teal/10 flex items-center justify-center animate-pulse">
                            <Lock size={24} className="text-electric-teal" />
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 text-white/30 hover:text-white transition-colors z-20"
                    >
                        <X size={20} />
                    </button>

                    <div className="p-8">
                        <div className="text-center mb-6">
                            <h3 className="text-xl font-black font-fui uppercase tracking-tighter text-white mb-2">Account Recovery</h3>
                            <p className="text-[10px] text-cool-grey font-bold uppercase tracking-widest">
                                {step === 1 && "Enter your email to receive a code"}
                                {step === 2 && `Enter the code sent to ${email}`}
                                {step === 3 && "Set your new secure password"}
                            </p>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold text-center uppercase tracking-widest">
                                {error}
                            </div>
                        )}

                        {step === 1 && (
                            <form onSubmit={handleSendOtp} className="space-y-4">
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="EMAIL ADDRESS"
                                        className="w-full pl-12 pr-4 py-3 bg-white/5 border border-transparent rounded-xl text-white text-xs font-bold focus:bg-white/10 focus:border-electric-teal/30 transition-all outline-none placeholder-white/20"
                                        required
                                        autoFocus
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 bg-white text-black font-black uppercase text-[10px] tracking-[0.2em] rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={14} /> : 'Send Code'}
                                </button>
                            </form>
                        )}

                        {step === 2 && (
                            <form onSubmit={handleVerifyOtp} className="space-y-4">
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20">
                                        <div className="flex gap-1">
                                            {[...Array(3)].map((_, i) => <div key={i} className="w-1 h-1 rounded-full bg-current" />)}
                                        </div>
                                    </div>
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        placeholder="ENTER CODE"
                                        className="w-full pl-12 pr-4 py-3 bg-white/5 border border-transparent rounded-xl text-white text-xs font-bold focus:bg-white/10 focus:border-electric-teal/30 transition-all outline-none placeholder-white/20 tracking-[0.5em] text-center"
                                        required
                                        autoFocus
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 bg-white text-black font-black uppercase text-[10px] tracking-[0.2em] rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={14} /> : 'Verify'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="w-full text-[9px] text-white/30 uppercase font-black hover:text-white transition-colors"
                                >
                                    Wrong Email?
                                </button>
                            </form>
                        )}

                        {step === 3 && (
                            <form onSubmit={handleUpdatePassword} className="space-y-4">
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="NEW PASSWORD"
                                        className="w-full pl-12 pr-4 py-3 bg-white/5 border border-transparent rounded-xl text-white text-xs font-bold focus:bg-white/10 focus:border-electric-teal/30 transition-all outline-none placeholder-white/20"
                                        required
                                        autoFocus
                                        minLength={6}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 bg-electric-teal text-black font-black uppercase text-[10px] tracking-[0.2em] rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(45,212,191,0.3)]"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={14} /> : 'Reset Password'}
                                </button>
                            </form>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
