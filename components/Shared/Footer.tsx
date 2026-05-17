import React, { useState } from 'react';
import { StarIcon } from './StarIcon';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Loader2, X } from 'lucide-react';
import { supabase } from '../../utils/supabaseClient';

const ADMIN_EMAIL = 'raycadamia@gmail.com';

const ADMIN_PASS = 'NoMatterWhatHappen';

const AdminLoginModal: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
    const navigate = useNavigate();
    const [accessCode, setAccessCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const normalizedCode = accessCode.trim().toUpperCase();

        if (normalizedCode === 'BEGONIA') {
            // Standard bypass for admin hub
            sessionStorage.setItem('be4l_admin_authorized', 'true');
            
            // Artificial delay for feel
            setTimeout(() => {
                setLoading(false);
                onClose();
                navigate('/be4l-admin');
            }, 800);
        } else {
            setLoading(false);
            setError('Invalid master access code.');
        }
    };

    if (!open) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[200] flex items-center justify-center p-6 backdrop-blur-2xl bg-black/70"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-sm bg-[#111] border border-white/10 rounded-3xl p-8 space-y-6 relative"
                >
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white/20 hover:text-white transition-colors"
                    >
                        <X size={18} />
                    </button>

                    <div className="text-center space-y-3">
                        <div className="w-14 h-14 rounded-2xl bg-electric-teal/10 border border-electric-teal/20 flex items-center justify-center mx-auto">
                            <Shield size={24} className="text-electric-teal" />
                        </div>
                        <h2 className="text-lg font-black uppercase tracking-tighter">Admin Access</h2>
                        <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Authorized Personnel Only</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 mb-1.5 block">Access Code</label>
                            <input
                                type="password"
                                value={accessCode}
                                onChange={(e) => setAccessCode(e.target.value)}
                                placeholder="ENTER CODE"
                                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/15 focus:outline-none focus:border-electric-teal/30 transition-all font-sans text-center tracking-[0.5em]"
                                required
                                autoFocus
                            />
                        </div>

                        {error && (
                            <p className="text-red-400 text-[10px] font-bold text-center leading-tight uppercase tracking-widest">{error}</p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 rounded-xl bg-white text-black font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] transition-all disabled:opacity-50 mt-2"
                        >
                            {loading ? <Loader2 size={14} className="animate-spin" /> : <Shield size={14} />}
                            {loading ? 'Verifying...' : 'Enter Admin Hub'}
                        </button>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export const Footer: React.FC = () => {
    const [showAdminLogin, setShowAdminLogin] = useState(false);

    return (
        <footer className="relative pt-16 pb-32 px-6 border-t border-white/5 bg-black/40">
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-col md:flex-row items-start justify-between gap-12 md:gap-16">
                    {/* 1. Brand Section */}
                    <div className="space-y-6 min-w-[280px]">
                        <div className="flex items-center gap-4 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                            <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 group-hover:border-electric-teal/40 transition-all shadow-lg shadow-black/20">
                                <StarIcon className="w-6 h-6 text-electric-teal drop-shadow-[0_0_8px_rgba(45,212,191,0.5)]" />
                            </div>
                            <span className="text-2xl font-black tracking-tighter font-display flex items-center gap-2 animate-liquid-text">
                                Be4L
                                <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Beta</span>
                            </span>
                        </div>
                        <p className="text-cool-grey text-sm font-medium leading-[1.6] max-w-xs opacity-70 font-sans">
                            Curated social experience for the lore you've yet to live.
                        </p>
                        <div className="flex gap-3">
                            {/* Instagram */}
                            <a
                                href="https://www.instagram.com/be4l.app/"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Instagram"
                                className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/[0.03] border border-white/5 text-cool-grey hover:text-white hover:border-electric-teal/40 transition-all hover:-translate-y-1 group"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:text-electric-teal transition-colors">
                                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                                </svg>
                            </a>
                            {/* TikTok */}
                            <a
                                href="https://www.tiktok.com/@be4l.app"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="TikTok"
                                className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/[0.03] border border-white/5 text-cool-grey hover:text-white hover:border-electric-teal/40 transition-all hover:-translate-y-1 group"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="group-hover:text-electric-teal transition-colors">
                                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.88-2.88 2.89 2.89 0 0 1 2.88-2.88c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15.2a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V9.37a8.16 8.16 0 0 0 4.76 1.53v-3.45a4.85 4.85 0 0 1-1-.76z" />
                                </svg>
                            </a>
                            {/* Email */}
                            <a
                                href="mailto:be4L.app@gmail.com"
                                aria-label="Email"
                                className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/[0.03] border border-white/5 text-cool-grey hover:text-white hover:border-electric-teal/40 transition-all hover:-translate-y-1 group"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:text-electric-teal transition-colors">
                                    <rect width="20" height="16" x="2" y="4" rx="2" />
                                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Link Columns Group - Fixed Horizontal side-by-side */}
                    <div className="flex gap-12 md:gap-24">
                        {/* 2. Platform Column */}
                        <div className="space-y-6">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 font-display">Platform</h4>
                            <ul className="space-y-3">
                                <li><Link to="/about" className="text-xs font-bold text-cool-grey hover:text-white transition-colors block">About</Link></li>
                                <li><Link to="/partner" className="text-xs font-bold text-cool-grey hover:text-white transition-colors block">Partner</Link></li>
                                <li><Link to="/team" className="text-xs font-bold text-cool-grey hover:text-white transition-colors block">Team</Link></li>
                                <li><a href="#vision" className="text-xs font-bold text-cool-grey hover:text-white transition-colors block">Vision</a></li>
                            </ul>
                        </div>

                        {/* 3. Legal Column */}
                        <div className="space-y-6">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 font-display">Legal</h4>
                            <ul className="space-y-3">
                                <li><Link to="/privacy" className="text-xs font-bold text-cool-grey hover:text-white transition-colors block">Privacy Policy</Link></li>
                                <li><Link to="/terms" className="text-xs font-bold text-cool-grey hover:text-white transition-colors block">Terms of Service</Link></li>
                                <li><a href="#" className="text-xs font-bold text-cool-grey hover:text-white transition-colors block">Cookie Policy</a></li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Partnership Extension - High Visibility & Accessible */}
                <div className="mt-16 pt-12 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-12">
                    <div className="flex flex-col items-center md:items-start gap-4">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/80">In Partnership With</span>
                        <div className="flex items-center gap-6 group">
                            <div className="bg-white p-5 rounded-2xl transition-all duration-500 shadow-2xl shadow-black/50 hover:scale-105 active:scale-95">
                                <img
                                    src="/assets/landing/partnership_v2.jpg"
                                    alt="AdDU & DDVentures Partnership"
                                    className="h-12 md:h-14 w-auto object-contain"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="text-center md:text-right space-y-3">
                        <p className="text-xs text-white/90 font-bold tracking-widest uppercase">
                            <button
                                onClick={() => setShowAdminLogin(true)}
                                className="hover:text-electric-teal transition-colors cursor-pointer"
                                aria-label="Admin access"
                            >
                                &copy;
                            </button>
                            {' '}{new Date().getFullYear()} Be4L Inc. All Rights Reserved.
                        </p>
                        <p className="text-[12px] text-electric-teal font-black uppercase tracking-[0.4em]">
                            Chase The Lore
                        </p>
                    </div>
                </div>
            </div>

            {/* Admin Login Modal */}
            <AdminLoginModal open={showAdminLogin} onClose={() => setShowAdminLogin(false)} />
        </footer>
    );
};
