import React from 'react';
import { StarIcon } from './StarIcon';

export const Footer: React.FC = () => {
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
                            OBX-Inspired platform for the lore you've yet to live.
                        </p>
                        <div className="flex gap-3">
                            <a
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
                            {/* Placeholder for others */}
                            {['TW', 'TK'].map(social => (
                                <a key={social} href="#" aria-label={`Follow us on ${social}`} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/[0.03] border border-white/5 text-cool-grey hover:text-white hover:border-white/20 transition-all hover:-translate-y-1">
                                    <div className="w-4 h-4 rounded-full bg-current opacity-20" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Link Columns Group - Fixed Horizontal side-by-side */}
                    <div className="flex gap-12 md:gap-24">
                        {/* 2. Platform Column */}
                        <div className="space-y-6">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 font-display">Platform</h4>
                            <ul className="space-y-3">
                                <li><a href="/about" className="text-xs font-bold text-cool-grey hover:text-white transition-colors block">About</a></li>
                                <li><a href="/partner" className="text-xs font-bold text-cool-grey hover:text-white transition-colors block">Partner</a></li>
                                <li><a href="/team" className="text-xs font-bold text-cool-grey hover:text-white transition-colors block">Team</a></li>
                                <li><a href="#vision" className="text-xs font-bold text-cool-grey hover:text-white transition-colors block">Vision</a></li>
                            </ul>
                        </div>

                        {/* 3. Legal Column */}
                        <div className="space-y-6">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 font-display">Legal</h4>
                            <ul className="space-y-3">
                                <li><a href="/privacy" className="text-xs font-bold text-cool-grey hover:text-white transition-colors block">Privacy Policy</a></li>
                                <li><a href="/terms" className="text-xs font-bold text-cool-grey hover:text-white transition-colors block">Terms of Service</a></li>
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
                            &copy; {new Date().getFullYear()} Be4L platform. All Rights Reserved.
                        </p>
                        <p className="text-[12px] text-electric-teal font-black uppercase tracking-[0.4em] animate-pulse">
                            Chase The Lore
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};
