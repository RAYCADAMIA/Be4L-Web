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

    return (
        <>
            <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-8 py-4 sm:py-6 pointer-events-none">

                {/* 1. Floating Logo (Left) + Search */}
                <div className="pointer-events-auto flex items-center gap-3">
                    <button
                        onClick={() => navigate('/app/home')}
                        className="focus:outline-none shrink-0"
                    >
                        <div className="flex items-center gap-2">
                            <h1 className="text-3xl font-black tracking-tighter animate-liquid-text italic">
                                Be4L
                            </h1>
                        </div>
                    </button>

                    <div className="hidden sm:flex relative items-center h-[52px]">
                        <motion.div
                            initial={false}
                            animate={{
                                width: isSearchOpen ? '260px' : '52px',
                            }}
                            className={`flex items-center h-[52px] overflow-hidden transition-all duration-300 ${isSearchOpen ? 'bg-white/[0.08] backdrop-blur-3xl border border-white/10 rounded-full p-1.5 pr-3 shadow-xl' : ''}`}
                        >
                            <button
                                onClick={() => {
                                    if (!isSearchOpen) {
                                        setIsSearchOpen(true);
                                        setTimeout(() => searchInputRef.current?.focus(), 100);
                                    }
                                }}
                                className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${isSearchOpen ? 'text-white' : 'text-gray-400 hover:text-primary hover:bg-white/5'}`}
                            >
                                <Search size={20} strokeWidth={2.5} />
                            </button>

                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Search Cosmos..."
                                className={`bg-transparent border-none outline-none text-sm font-bold w-full text-white placeholder-gray-500 ml-1 ${isSearchOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
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
                                        className="shrink-0 p-1.5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white ml-1"
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
                <div className="pointer-events-auto">
                    <nav className="flex items-center gap-1 h-[52px] p-1.5 bg-white/[0.08] backdrop-blur-3xl border border-white/10 rounded-full shadow-lg transition-all hover:border-white/20">
                        {/* Quick Actions - Desktop View */}
                        <div className="hidden md:flex items-center gap-0.5">
                            <button className="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center text-gray-500 hover:text-white transition-colors" aria-label="Tasks">
                                <CheckSquare size={18} strokeWidth={2.5} />
                            </button>

                            <button className="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center text-gray-500 hover:text-white transition-colors relative" aria-label="Notifications">
                                <Bell size={18} strokeWidth={2.5} />
                                <div className="absolute top-3 right-3 w-1.5 h-1.5 bg-primary rounded-full border border-[#0F0F11]" />
                            </button>
                        </div>

                        {/* Hamburger Menu Toggle - Mobile View */}
                        <div className="flex md:hidden items-center">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isMenuOpen ? 'bg-primary text-black' : 'hover:bg-white/5 text-gray-400 hover:text-white'}`}
                            >
                                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
                            </button>
                        </div>

                        {/* User Profile */}
                        <div className="pl-1 pr-1">
                            <button
                                onClick={() => navigate('/app/myprofile')}
                                className="w-10 h-10 rounded-full overflow-hidden border border-white/10 hover:border-primary transition-all relative group"
                            >
                                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
                                {user.avatar_url ? (
                                    <img src={user.avatar_url} className="w-full h-full object-cover" alt="User" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-surface">
                                        <User size={16} className="text-gray-500" />
                                    </div>
                                )}
                            </button>
                        </div>
                    </nav>
                </div>

                {/* Mobile Dropdown Menu */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -20 }}
                            className="absolute top-24 right-4 md:right-8 z-[100] w-64 p-2 bg-white/[0.08] backdrop-blur-3xl border border-white/10 rounded-[2rem] shadow-2xl pointer-events-auto"
                        >
                            <div className="flex flex-col gap-1">
                                <button className="flex items-center gap-4 px-4 py-4 rounded-2xl hover:bg-white/5 text-gray-300 hover:text-white transition-all group">
                                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                                        <CheckSquare size={18} strokeWidth={2.5} />
                                    </div>
                                    <span className="text-xs font-black uppercase tracking-widest">Tasks Hub</span>
                                </button>
                                <button className="flex items-center gap-4 px-4 py-4 rounded-2xl hover:bg-white/5 text-gray-300 hover:text-white transition-all group">
                                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary/20 group-hover:text-primary transition-colors relative">
                                        <Bell size={18} strokeWidth={2.5} />
                                        <div className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-primary rounded-full" />
                                    </div>
                                    <span className="text-xs font-black uppercase tracking-widest">Notifications</span>
                                </button>
                                <div className="h-[1px] bg-white/5 my-1 mx-4" />
                                {/* Removed Mobile Create Button */}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header >
        </>
    );
};
