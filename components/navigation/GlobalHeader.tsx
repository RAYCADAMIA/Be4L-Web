import React, { useState, useRef } from 'react';
import { Search, Bell, User, CheckSquare, Plus, X, Menu } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '../../contexts/NavigationContext';
import { motion, AnimatePresence } from 'framer-motion';

export const GlobalHeader: React.FC = () => {
    const { user } = useAuth();
    const { tabs, activeTab, setActiveTab } = useNavigation();
    const navigate = useNavigate();
    const location = useLocation();
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);

    if (!user) return null;

    const isChatDetail = location.pathname.startsWith('/app/chat') && new URLSearchParams(location.search).has('id');
    const isMobile = window.innerWidth < 768; // Simple mobile check

    return (
        <div className="relative">
            <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-8 py-4 sm:py-6 pointer-events-none">

                {/* 1. Floating Logo (Left) + Search */}
                <div className={`pointer-events-auto flex items-center gap-3 transition-all duration-500 ${isChatDetail && isMobile ? 'opacity-0 -translate-y-4 scale-95 pointer-events-none' : 'opacity-100'}`}>
                    <button
                        onClick={() => {
                            if (location.pathname === '/app/home' || location.pathname === '/app/quests') {
                                // Find any scrollable containers and reset them
                                const scrollers = document.querySelectorAll('.overflow-y-auto');
                                scrollers.forEach(s => s.scrollTo({ top: 0, behavior: 'smooth' }));
                            }
                            navigate('/app/home');
                        }}
                        className="focus:outline-none shrink-0"
                    >
                        <div className="flex items-center gap-2">
                            <h1 className="text-3xl font-black tracking-tighter animate-liquid-text italic">
                                Be4L
                            </h1>
                        </div>
                    </button>

                    {!isSearchOpen && !location.pathname.startsWith('/app/chat') && (
                        <div className="flex sm:hidden relative items-center ml-2">
                            <button
                                onClick={() => {
                                    setIsSearchOpen(true);
                                    setTimeout(() => searchInputRef.current?.focus(), 100);
                                }}
                                className="w-10 h-10 flex items-center justify-center rounded-full text-gray-400 hover:text-white transition-colors"
                            >
                                <Search size={22} strokeWidth={2.5} />
                            </button>
                        </div>
                    )}

                    {isSearchOpen && (
                        /* Invisible Backdrop for click-outside/blur behavior on mobile */
                        <div
                            className="fixed inset-0 z-40 bg-transparent"
                            onClick={() => setIsSearchOpen(false)}
                        />
                    )}

                    <div className={`${isSearchOpen ? 'flex absolute left-[70px] top-1/2 -translate-y-1/2 z-50' : 'hidden sm:flex'} items-center h-[40px] sm:h-[52px]`}>
                        <motion.div
                            initial={false}
                            animate={{
                                width: isSearchOpen ? '260px' : '100%',
                            }}
                            className={`flex items-center h-full sm:h-[52px] w-full overflow-hidden transition-all duration-300 ${isSearchOpen ? 'bg-white/[0.08] backdrop-blur-3xl border border-white/10 rounded-full p-1 pr-3 shadow-xl' : 'sm:w-[52px]'}`}
                        >
                            <button
                                onClick={() => {
                                    if (!isSearchOpen) {
                                        setIsSearchOpen(true);
                                        setTimeout(() => searchInputRef.current?.focus(), 100);
                                    }
                                }}
                                className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full shrink-0 transition-colors ${isSearchOpen ? 'text-white' : 'text-gray-400 hover:text-primary hover:bg-white/5'}`}
                            >
                                <Search size={20} strokeWidth={2.5} />
                            </button>

                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Search..."
                                className={`bg-transparent border-none outline-none text-xs sm:text-sm font-bold w-full text-white placeholder-gray-500 ml-1 ${isSearchOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                            />

                            <AnimatePresence>
                                {isSearchOpen && (
                                    <motion.button
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsSearchOpen(false);
                                        }}
                                        className="shrink-0 p-1 hover:bg-white/10 rounded-full text-gray-400 hover:text-white ml-0.5"
                                    >
                                        <X size={14} />
                                    </motion.button>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </div>
                </div>

                {/* 2. CENTER TABS (Universal Navigation) - Hidden on Mobile */}
                <div className="hidden md:flex pointer-events-auto absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="flex items-center justify-center h-[52px] p-1.5 bg-white/[0.08] backdrop-blur-3xl rounded-full border border-white/10 shadow-2xl">
                        {[
                            { label: 'Home', path: '/app/home' },
                            { label: 'Lore', path: '/app/lore' },
                            { label: 'Quests', path: '/app/quests' },
                            { label: 'Chat', path: '/app/chat' },
                            { label: 'Dibs', path: '/app/dibs' }
                        ].map(item => {
                            const isActive = item.path === '/app/home'
                                ? location.pathname === '/app/home'
                                : location.pathname.startsWith(item.path);
                            return (
                                <button
                                    key={item.path}
                                    onClick={() => navigate(item.path)}
                                    className={`relative h-10 px-6 flex items-center justify-center rounded-full text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-300 z-10 ${isActive ? 'text-white' : 'text-white/40 hover:text-white'}`}
                                >
                                    <span className="relative z-10">
                                        {item.label}
                                    </span>
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeTabGlobal"
                                            className="absolute inset-0 bg-white/10 rounded-full border border-white/10 -z-10"
                                            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 3. Floating Control Pill (Right) */}
                <div className={`pointer-events-auto transition-all duration-500 ${isChatDetail && isMobile ? 'opacity-0 translate-y-4 scale-95 pointer-events-none' : 'opacity-100'}`}>
                    <nav className="flex items-center gap-1 h-[52px] p-1.5 bg-white/[0.08] backdrop-blur-3xl border border-white/10 rounded-full shadow-lg transition-all hover:border-white/20">
                        {/* Control Icons - Now visible on both Mobile & Desktop */}
                        <div className="flex items-center gap-0.5">
                            <button className="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-colors" aria-label="Tasks">
                                <CheckSquare size={18} strokeWidth={2.5} />
                            </button>

                            <button className="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-colors relative" aria-label="Notifications">
                                <Bell size={18} strokeWidth={2.5} />
                                <div className="absolute top-3 right-3 w-1.5 h-1.5 bg-primary rounded-full border border-black" />
                            </button>
                        </div>

                        {/* User Profile */}
                        <div className="flex items-center pl-1 pr-1">
                            <button
                                onClick={() => navigate('/app/myprofile')}
                                className="w-9 h-9 rounded-full overflow-hidden border border-white/10 hover:border-primary transition-all relative group flex items-center justify-center"
                            >
                                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
                                {user.avatar_url ? (
                                    <img src={user.avatar_url} className="w-full h-full object-cover" alt="User" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                                        <User size={14} className="text-gray-500" />
                                    </div>
                                )}
                            </button>
                        </div>
                    </nav>
                </div>


            </header >
        </div >
    );
};
