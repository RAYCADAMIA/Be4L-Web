import React, { useState, Suspense } from 'react';
import { Home, Compass, MessageCircle, ShoppingBag, Aperture, User } from 'lucide-react';
import { DesktopSidebar } from '../navigation/DesktopSidebar';
import { GlobalHeader } from '../navigation/GlobalHeader';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate, useLocation, Outlet, useNavigate, useSearchParams } from 'react-router-dom';
import { useNavigation } from '../../contexts/NavigationContext';
import { motion, AnimatePresence } from 'framer-motion';
import ProfileOverlay from '../Profile/ProfileOverlay';
import { OnboardingTour } from '../Onboarding/OnboardingTour';
import { AuraParticles } from '../Effects/AuraParticles';
import { Footer } from '../Shared/Footer';
import { AuthScreen } from '../AuthScreen';
import { BrandOnboardingWizard } from '../Dibs/BrandOnboardingWizard';
import { supabaseService } from '../../services/supabaseService';

export const PlatformLayout: React.FC = () => {
    const { user, loading } = useAuth();
    const { tabs } = useNavigation();
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [isOnboardingBrand, setIsOnboardingBrand] = useState(false);
    // Initialize as true if on landing page to prevent mid-refresh glitch
    const [isSplashActive, setIsSplashActive] = useState(() => {
        const isRoot = location.pathname === '/';
        const hasShownBefore = (window as any).__hasSplashShown;

        // If we load on a non-root page, mark splash as already seen
        if (!isRoot && !hasShownBefore) {
            (window as any).__hasSplashShown = true;
        }

        return isRoot && !hasShownBefore;
    });

    const selectedProfileId = searchParams.get('profile');

    // Listen for custom events
    React.useEffect(() => {
        const handleAuthTrigger = () => setShowAuthModal(true);
        const handleSplashStart = () => setIsSplashActive(true);
        const handleSplashEnd = () => setIsSplashActive(false);

        window.addEventListener('trigger-auth-modal', handleAuthTrigger);
        window.addEventListener('splash-started', handleSplashStart);
        window.addEventListener('splash-finished', handleSplashEnd);

        return () => {
            window.removeEventListener('trigger-auth-modal', handleAuthTrigger);
            window.removeEventListener('splash-started', handleSplashStart);
            window.removeEventListener('splash-finished', handleSplashEnd);
        };
    }, []);

    React.useEffect(() => {
        if (user?.is_operator) {
            supabaseService.dibs.getOperators().then((ops: any[]) => {
                const myOp = ops.find(o => o.user_id === user.id);
                setIsOnboardingBrand(myOp?.status === 'onboarding');
            });
        } else {
            setIsOnboardingBrand(false);
        }
    }, [user]);

    const closeProfile = () => {
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('profile');
        setSearchParams(newParams);
    };

    if (loading) return (
        <div className="h-screen w-full bg-deep-black flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
    );

    if (!user) {
        if (location.pathname.startsWith('/app/myprofile')) {
            return <Navigate to="/auth" replace />;
        }
    }

    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    React.useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const navItems = [
        { label: 'Home', path: !user ? '/' : '/app/home', icon: Home },
        { label: 'Dibs', path: user ? '/app/dibs' : '/dibs', icon: ShoppingBag },
        { label: 'Quests', path: user ? '/app/quests' : '/quests', icon: Compass },
        { label: 'Chat', path: '/app/chat', icon: MessageCircle }, // Restricted
        { label: 'Lore', path: user ? '/app/lore' : '/lore', icon: Aperture },
    ];

    const shouldShowFooter = ['/', '/quests', '/dibs', '/app/home', '/app/quests', '/app/dibs', '/app/lore'].includes(location.pathname) || location.pathname === '/' || location.pathname.startsWith('/quests') || location.pathname.startsWith('/dibs');

    const segments = location.pathname.split('/').filter(Boolean);
    const isProfileOrDashboard =
        location.pathname.startsWith('/app/myprofile') ||
        location.pathname.startsWith('/app/shop/') ||
        location.pathname.startsWith('/app/dashboard') ||
        (segments.length === 2 && segments[0] === 'app' && !['home', 'lore', 'quests', 'chat', 'dibs', 'admin', 'dashboard', 'shop'].includes(segments[1]));

    const isChatDetailView = location.pathname.includes('chat') && searchParams.has('id');
    const shouldShowHeader = !isSplashActive && location.pathname !== '/auth' && !isProfileOrDashboard && !(isChatDetailView && isMobile);

    const mainRef = React.useRef<HTMLDivElement>(null);

    // Scroll to top on route change
    React.useEffect(() => {
        if (mainRef.current) {
            mainRef.current.scrollTo(0, 0);
        }
    }, [location.pathname]);

    return (
        <div className="flex flex-col h-[100dvh] w-full overflow-hidden text-white bg-transparent">
            <AnimatePresence>
                {shouldShowHeader && (
                    <motion.div
                        key="global-header"
                        initial={{ y: -100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -100, opacity: 0 }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        className="fixed top-0 left-0 right-0 z-[100] pointer-events-none"
                    >
                        <div className="pointer-events-auto">
                            <GlobalHeader />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex flex-1 overflow-hidden relative">
                <AnimatePresence>
                    {tabs.length > 0 && user && !isSplashActive && (
                        <motion.div
                            key="desktop-sidebar"
                            initial={{ x: -50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -50, opacity: 0 }}
                            className="fixed z-40 pointer-events-none transition-all duration-500
                                 top-32 left-6 flex-col hidden md:flex
                             "
                        >
                            <div className="pointer-events-auto">
                                <DesktopSidebar />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <main ref={mainRef} className="flex-1 relative h-full overflow-y-auto no-scrollbar z-10 flex flex-col pt-0 pb-0">
                    {/* Content Wrapper with padding to clear the Bottom Nav Bar */}
                    <div className={`grow shrink-0 w-full flex flex-col min-h-full ${isChatDetailView ? 'pb-0' : 'pb-32'} md:pb-0`}>
                        <Outlet key={location.pathname} />
                    </div>
                    {shouldShowFooter && <Footer />}
                </main>
            </div>

            {/* Mobile Bottom Bar - Fixed Centering and Clipping */}
            <AnimatePresence>
                {!isSplashActive && location.pathname !== '/auth' && !isChatDetailView && (
                    <motion.div
                        key="mobile-nav"
                        initial={{ y: 100, x: "-50%", opacity: 0 }}
                        animate={{ y: 0, x: "-50%", opacity: 1 }}
                        exit={{ y: 100, x: "-50%", opacity: 0 }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        className={`md:hidden fixed bottom-8 left-1/2 w-[calc(100%-2.5rem)] max-w-sm h-16 bg-white/[0.08] backdrop-blur-3xl border border-white/10 flex items-center justify-around z-[100] rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] px-2 transition-opacity duration-500 ${isChatDetailView ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                    >
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));

                            return (
                                <button
                                    key={item.label}
                                    id={`nav-${item.label.toLowerCase()}-mobile`}
                                    onClick={() => {
                                        if (item.label === 'Lore') return;
                                        if (!user && item.label === 'Profile') {
                                            setShowAuthModal(true);
                                        } else {
                                            navigate(item.path);
                                        }
                                    }}
                                    className={`group flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-all duration-300 relative ${isActive ? 'text-primary' : 'text-white/40 hover:text-white'} ${item.label === 'Lore' ? 'cursor-not-allowed opacity-50' : ''}`}
                                >
                                    <div className="relative p-1">
                                        <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} className="relative z-10" />
                                        {item.label === 'Lore' && (
                                            <span className="absolute -top-1 -right-2 bg-primary text-[5px] text-black px-1 rounded-full font-black tracking-tighter shadow-lg shadow-primary/20">SOON</span>
                                        )}
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
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Global Overlays */}
            <ProfileOverlay
                userId={selectedProfileId}
                onClose={closeProfile}
            />
            {/* <OnboardingTour /> */}
            <AuraParticles trigger={user?.aura_points || 0} />

            <AnimatePresence>
                {isOnboardingBrand && (
                    <BrandOnboardingWizard onComplete={() => setIsOnboardingBrand(false)} />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showAuthModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] flex items-center justify-center p-6 backdrop-blur-2xl bg-black/60"
                        onClick={() => setShowAuthModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="w-full max-w-5xl mx-4"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Suspense fallback={<div className="text-white text-center">Loading...</div>}>
                                <AuthScreen onClose={() => setShowAuthModal(false)} />
                            </Suspense>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

