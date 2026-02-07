import React from 'react';
import { Home, Compass, MessageCircle, ShoppingBag, Aperture } from 'lucide-react';
import { DesktopSidebar } from '../navigation/DesktopSidebar';
import { GlobalHeader } from '../navigation/GlobalHeader';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate, useLocation, Outlet, useNavigate, useSearchParams } from 'react-router-dom';
import { useNavigation } from '../../contexts/NavigationContext';
import { motion, AnimatePresence } from 'framer-motion';
import ProfileOverlay from '../Profile/ProfileOverlay';
import QuestOverlay from '../Quest/QuestOverlay';

export const PlatformLayout: React.FC = () => {
    const { user, loading } = useAuth();
    const { tabs } = useNavigation();
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const selectedProfileId = searchParams.get('profile');
    const selectedQuestId = searchParams.get('quest');

    const closeProfile = () => {
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('profile');
        setSearchParams(newParams);
    };

    const closeQuest = () => {
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('quest');
        setSearchParams(newParams);
    };

    if (loading) return (
        <div className="h-screen w-full bg-deep-black flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
    );

    if (!user) {
        sessionStorage.setItem('be4l_redirect', location.pathname);
        return <Navigate to="/login" replace />;
    }

    const navItems = [
        { label: 'Home', path: '/app/home', icon: Home },
        { label: 'Lore', path: '/app/lore', icon: Aperture },
        { label: 'Quests', path: '/app/quests', icon: Compass },
        { label: 'Chat', path: '/app/chat', icon: MessageCircle },
        { label: 'Dibs', path: '/app/dibs', icon: ShoppingBag },
    ];

    return (
        <div className="flex flex-col h-screen w-full overflow-hidden text-white">
            <GlobalHeader />

            <div className="flex flex-1 overflow-hidden relative">
                <AnimatePresence>
                    {tabs.length > 0 && (
                        <motion.div
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -20, opacity: 0 }}
                            className="fixed z-40 pointer-events-none transition-all duration-500
                                 top-20 left-0 right-0 flex justify-center px-4
                                 md:top-32 md:left-6 md:right-auto md:h-auto md:px-0 md:flex-col
                             "
                        >
                            <div className="pointer-events-auto">
                                <DesktopSidebar />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <main className="flex-1 relative h-full overflow-y-auto no-scrollbar z-10 flex flex-col pt-0 pb-0">
                    <Outlet />
                </main>
            </div>

            {/* Mobile Bottom Bar */}
            <div className={`md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm h-16 bg-white/[0.08] backdrop-blur-3xl border border-white/10 flex items-center justify-around z-50 rounded-full shadow-2xl px-2 transition-all duration-500 ${location.pathname.startsWith('/app/chat') && searchParams.has('id') ? 'opacity-0 translate-y-10 pointer-events-none' : 'opacity-100'}`}>
                {navItems.map((item) => {
                    const isActive = item.path === '/app/home'
                        ? location.pathname === '/app/home'
                        : location.pathname.startsWith(item.path.split('?')[0]);

                    return (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={`group flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-all duration-300 relative ${isActive ? 'text-primary' : 'text-white/40 hover:text-white'}`}
                        >
                            <div className="relative p-1">
                                <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} className="relative z-10" />
                                {isActive && (
                                    <motion.div
                                        layoutId="mobileActiveNav"
                                        className="absolute inset-0 bg-white/10 rounded-full border border-white/20 -z-0 shadow-[0_0_15px_rgba(204,255,0,0.1)]"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                            </div>
                            <span className="text-[9px] font-bold uppercase tracking-wider mt-1">{item.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Global Overlays */}
            <ProfileOverlay
                userId={selectedProfileId}
                onClose={closeProfile}
            />
            <QuestOverlay
                questId={selectedQuestId}
                onClose={closeQuest}
            />
        </div>
    );
};

