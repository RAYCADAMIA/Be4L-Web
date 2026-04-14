import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, User, CheckSquare, Plus, X, Menu, Zap } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '../../contexts/NavigationContext';
import { motion, AnimatePresence } from 'framer-motion';
import { TaskWindow, NotificationWindow, ProfileWindow, SearchWindow } from './ControlDropdowns';
import { StarIcon } from '../Shared/StarIcon';
import { supabaseService } from '../../services/supabaseService';
import { useOnClickOutside } from '../../hooks/useOnClickOutside';

export const GlobalHeader: React.FC = () => {
    const { user } = useAuth();
    const { tabs, activeTab, setActiveTab } = useNavigation();
    const navigate = useNavigate();
    const location = useLocation();
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeControl, setActiveControl] = useState<'tasks' | 'notifications' | 'profile' | null>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const searchContainerRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<{ quests: any[], brands: any[], people: any[], items: any[] }>({ quests: [], brands: [], people: [], items: [] });
    const [isSearching, setIsSearching] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 640);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Functional Search Logic
    useEffect(() => {
        const performSearch = async () => {
            if (searchQuery.length < 2) {
                setSearchResults({ quests: [], brands: [], people: [], items: [] });
                return;
            }
            setIsSearching(true);
            try {
                const results = await supabaseService.search.globalSearch(searchQuery);
                setSearchResults(results);
            } catch (error) {
                console.error("Search failed:", error);
            } finally {
                setIsSearching(false);
            }
        };

        const timer = setTimeout(performSearch, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useOnClickOutside(dropdownRef, () => setActiveControl(null));
    useOnClickOutside(searchContainerRef, () => {
        setIsSearchOpen(false);
        setSearchQuery('');
    });

    // Simplified Guest Header
    const [isSplashActive, setIsSplashActive] = useState(false);

    useEffect(() => {
        const handleStart = () => setIsSplashActive(true);
        const handleEnd = () => setIsSplashActive(false);
        window.addEventListener('splash-started', handleStart);
        window.addEventListener('splash-finished', handleEnd);
        return () => {
            window.removeEventListener('splash-started', handleStart);
            window.removeEventListener('splash-finished', handleEnd);
        };
    }, []);

    if (!user) {
        return (
            <div className="relative">
                <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-8 py-4 sm:py-6 pointer-events-none">
                    {/* 1. Logo */}
                    <div className={`pointer-events-auto flex items-center gap-3 transition-all duration-700 ${isSplashActive ? 'opacity-0 -translate-y-4' : 'opacity-100 translate-y-0'}`}>
                        <button
                            onClick={() => {
                                if (location.pathname === '/') {
                                    const scroller = document.querySelector('.overflow-y-auto');
                                    if (scroller) scroller.scrollTo({ top: 0, behavior: 'smooth' });
                                    else window.scrollTo({ top: 0, behavior: 'smooth' });
                                } else {
                                    navigate('/');
                                }
                            }}
                            className="focus:outline-none shrink-0"
                        >
                            <div className="flex items-center gap-2">
                                <StarIcon className="w-8 h-8 text-primary drop-shadow-primary" />
                                <h1 className="text-3xl font-black tracking-tighter brand-text-dusk">
                                    Be4L
                                </h1>
                            </div>
                        </button>
                    </div>

                    {/* 2. Center Tabs (Public) */}
                    <div className="hidden md:flex pointer-events-auto absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                        <div className="flex items-center justify-center h-[52px] p-1.5 bg-[var(--bg-glass)] backdrop-blur-3xl rounded-full border border-[var(--border-glass)] shadow-2xl">
                            {[
                                { label: 'Home', path: '/' },
                                { label: 'Lore', path: '/lore' },
                                { label: 'Quests', path: '/quests' },
                                { label: 'Chat', path: '/app/chat' },
                                { label: 'Dibs', path: '/dibs' }
                            ].map(item => {
                                const isActive = item.path === '/'
                                    ? location.pathname === '/'
                                    : location.pathname.startsWith(item.path);

                                return (
                                    <button
                                        key={item.path}
                                        onClick={() => {
                                            if (item.label === 'Lore') return;
                                            if (item.path.startsWith('/app/') && item.path !== '/app/chat') {
                                                navigate('/auth');
                                            } else {
                                                navigate(item.path);
                                            }
                                        }}
                                        className={`relative h-10 px-6 flex items-center justify-center rounded-full text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-300 z-10 ${isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'} ${item.label === 'Lore' ? 'cursor-not-allowed opacity-50' : ''}`}
                                    >
                                        <span className="relative z-10">
                                            {item.label}
                                            {item.label === 'Lore' && (
                                                <span className="absolute -top-3 -right-6 bg-primary text-[6px] text-black px-1.5 py-0.5 rounded-full font-black tracking-tighter shadow-lg shadow-primary/20">SOON</span>
                                            )}
                                        </span>
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeTabGlobalGuest"
                                                className="absolute inset-0 bg-white/10 rounded-full border border-white/10 -z-10"
                                                transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                                            />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* 3. Sign In Button */}
                    <div className="pointer-events-auto">
                        <button
                            onClick={() => navigate('/auth')}
                            className="h-[42px] px-6 bg-white text-black rounded-full font-bold text-xs uppercase tracking-wider hover:bg-gray-200 transition-colors shadow-lg shadow-white/10"
                        >
                            Sign In
                        </button>
                    </div>
                </header>
            </div>
        );
    }

    const isChatDetail = location.pathname.startsWith('/app/chat') && new URLSearchParams(location.search).has('id');

    return (
        <div className="relative">
            <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-8 py-4 sm:py-6 pointer-events-none">

                {/* 1. Floating Logo (Left) + Search */}
                <div className="pointer-events-auto flex items-center gap-1 sm:gap-3 transition-all duration-500 opacity-100 min-w-0">
                    <button
                        onClick={() => {
                            if (location.pathname === '/app/home') {
                                const scroller = document.querySelector('.overflow-y-auto');
                                if (scroller) scroller.scrollTo({ top: 0, behavior: 'smooth' });
                                else window.scrollTo({ top: 0, behavior: 'smooth' });
                            } else {
                                navigate('/app/home');
                            }
                        }}
                        className="focus:outline-none shrink-0"
                    >
                        <div className="flex items-center gap-2">
                            <StarIcon className="w-8 h-8 text-primary logo-glow" />
                            <AnimatePresence mode="wait">
                                {!isSearchOpen && (
                                    <motion.h1
                                        key="logo-text"
                                        initial={{ opacity: 0, width: 0, x: -10 }}
                                        animate={{ opacity: 1, width: 'auto', x: 0 }}
                                        exit={{ opacity: 0, width: 0, x: -10 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                        className="text-3xl font-black tracking-tighter brand-text-dusk overflow-hidden whitespace-nowrap"
                                    >
                                        Be4L
                                    </motion.h1>
                                )}
                            </AnimatePresence>
                        </div>
                    </button>

                    <AnimatePresence>
                        {!isSearchOpen && !location.pathname.startsWith('/app/chat') && (
                            <motion.div
                                key="global-search-trigger"
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: 'auto' }}
                                exit={{ opacity: 0, width: 0 }}
                                className="flex relative items-center ml-1"
                            >
                                <button
                                    onClick={() => {
                                        setIsSearchOpen(true);
                                        setTimeout(() => searchInputRef.current?.focus(), 100);
                                    }}
                                    className="w-10 h-10 flex items-center justify-center rounded-full text-gray-400 hover:text-white transition-colors"
                                >
                                    <Search size={22} strokeWidth={2.5} />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className={`${isSearchOpen ? 'flex ml-1' : 'hidden'} items-center h-[40px] sm:h-[52px] relative`} ref={searchContainerRef}>
                        <motion.div
                            initial={false}
                            animate={{
                                width: isSearchOpen ? (isMobile ? '180px' : '320px') : '100%',
                            }}
                            className={`flex items-center h-full sm:h-[52px] w-full overflow-hidden transition-all duration-300 relative z-[100] ${isSearchOpen ? 'bg-white/[0.04] backdrop-blur-3xl border border-white/10 rounded-full p-1 pr-3 shadow-[0_8px_32px_rgba(0,0,0,0.3)]' : 'sm:w-[52px]'}`}
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
                                placeholder="Search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-transparent border-none outline-none text-[11px] sm:text-xs font-black tracking-widest w-full text-white placeholder-white/20 ml-1 selection:bg-electric-teal/30"
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
                                            setSearchQuery('');
                                        }}
                                        className="shrink-0 p-1 hover:bg-white/10 rounded-full text-gray-400 hover:text-white ml-0.5"
                                    >
                                        <X size={14} />
                                    </motion.button>
                                )}
                            </AnimatePresence>
                        </motion.div>

                        <AnimatePresence>
                            {(isSearchOpen || searchQuery.length > 0) && isSearchOpen && (
                                <div className="fixed sm:absolute top-[72px] sm:top-full left-1/2 sm:left-0 -translate-x-1/2 sm:translate-x-0 w-[92vw] sm:w-[400px] mt-1 z-[90]">
                                    <SearchWindow
                                        query={searchQuery}
                                        setSearchQuery={setSearchQuery}
                                        results={searchResults}
                                        isSearching={isSearching}
                                        onClose={() => {
                                            setIsSearchOpen(false);
                                            setSearchQuery('');
                                        }}
                                    />
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* 2. CENTER TABS */}
                <div className="hidden md:flex pointer-events-auto absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="flex items-center justify-center h-[52px] p-1.5 bg-[var(--bg-glass)] backdrop-blur-3xl rounded-full border border-[var(--border-glass)] shadow-2xl">
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
                                    id={`nav-${item.label.toLowerCase()}`}
                                    onClick={() => {
                                        if (item.label === 'Lore') return;
                                        navigate(item.path);
                                    }}
                                    className={`relative h-10 px-6 flex items-center justify-center rounded-full text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-300 z-10 ${isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'} ${item.label === 'Lore' ? 'cursor-not-allowed opacity-50' : ''}`}
                                >
                                    <span className="relative z-10">
                                        {item.label}
                                        {item.label === 'Lore' && (
                                            <span className="absolute -top-3 -right-6 bg-primary text-[6px] text-black px-1.5 py-0.5 rounded-full font-black tracking-tighter shadow-lg shadow-primary/20">SOON</span>
                                        )}
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

                {/* 3. Floating Control Pill */}
                <div className="relative pointer-events-auto transition-all duration-500 opacity-100" ref={dropdownRef}>
                    <nav className="flex items-center gap-1 h-[52px] p-1.5 bg-[var(--bg-glass)] backdrop-blur-3xl border border-[var(--border-glass)] rounded-full shadow-lg transition-all hover:border-white/20 relative">
                        <div className="flex items-center gap-0.5 relative">
                            <div className="relative z-20">
                                <button
                                    id="nav-tasks"
                                    onClick={() => setActiveControl(activeControl === 'tasks' ? null : 'tasks')}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${activeControl === 'tasks' ? 'bg-white/10 text-white shadow-xl backdrop-blur-3xl border border-white/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                    aria-label="Tasks"
                                >
                                    <CheckSquare size={18} strokeWidth={2.5} />
                                </button>
                            </div>

                            <div className="relative z-20">
                                <button
                                    id="nav-notifications"
                                    onClick={() => setActiveControl(activeControl === 'notifications' ? null : 'notifications')}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 relative ${activeControl === 'notifications' ? 'bg-white/10 text-white shadow-xl backdrop-blur-3xl border border-white/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                    aria-label="Notifications"
                                >
                                    <Bell size={18} strokeWidth={2.5} />
                                    <div className="absolute top-3 right-3 w-1.5 h-1.5 bg-primary rounded-full border border-black" />
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center pl-1 pr-1 relative z-20">
                            <button
                                id="nav-profile"
                                onClick={() => setActiveControl(activeControl === 'profile' ? null : 'profile')}
                                className={`w-9 h-9 rounded-full overflow-hidden border transition-all relative group flex items-center justify-center ${activeControl === 'profile' ? 'border-primary shadow-[0_0_15px_rgba(204,255,0,0.2)]' : 'border-white/10 hover:border-primary/50'}`}
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

                    <AnimatePresence>
                        {activeControl === 'tasks' && (
                            <div className="absolute top-full right-0 mt-1 z-[200]">
                                <TaskWindow />
                            </div>
                        )}
                        {activeControl === 'notifications' && (
                            <div className="absolute top-full right-0 mt-1 z-[200]">
                                <NotificationWindow />
                            </div>
                        )}
                        {activeControl === 'profile' && (
                            <div className="absolute top-full right-0 mt-1 z-[200]">
                                <ProfileWindow onClose={() => setActiveControl(null)} />
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </header>
        </div>
    );
};
