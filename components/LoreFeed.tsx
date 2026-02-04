import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Camera } from 'lucide-react';
import { Capture, User as UserType } from '../types';
import { supabaseService } from '../services/supabaseService';
import DualCameraPost from './DualCameraPost';
import TopBar from './TopBar';
import { FloatingTabs, FeedPlaceholder, HeartbeatTransition } from './ui/AestheticComponents';
import { RecallGridView } from './RecallGridView';

export const LoreFeed: React.FC<{
    onOpenProfile: () => void,
    onOpenPostDetail: (c: Capture) => void,
    onUserClick: (u: UserType) => void,
    refreshTrigger: number,
    currentUser: UserType,
    onNavigate: (tab: 'HOME' | 'QUESTS' | 'CHATS' | 'BOOK' | 'SEARCH' | 'NOTIFICATIONS') => void,
    onLaunchCamera: () => void,
    hasUserPostedToday: boolean,
    onOpenQuestList: () => void,
    onReset?: () => void,
    forceLoading?: boolean
}> = ({ onOpenProfile, onOpenPostDetail, onUserClick, refreshTrigger, currentUser, onNavigate, onLaunchCamera, hasUserPostedToday, onOpenQuestList, onReset, forceLoading }) => {
    const [activeFeed, setActiveFeed] = useState<'discover' | 'friends'>('discover');
    const [captures, setCaptures] = useState<any[]>([]);
    const [recallCaptures, setRecallCaptures] = useState<Capture[]>([]);
    const [loading, setLoading] = useState(true);
    // Scroll Logic for Sync Top Bar
    const [topBarY, setTopBarY] = useState(0);
    const lastScrollY = useRef(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const lastClickTimeRef = useRef(0);

    const [showGrid, setShowGrid] = useState(false);
    const [pullDistance, setPullDistance] = useState(0);
    const touchY = useRef(0);
    const touchStartX = useRef(0);
    const touchStartY = useRef(0);

    const handlePointerDown = (e: React.PointerEvent) => {
        touchStartX.current = e.clientX;
        touchStartY.current = e.clientY;
        if (containerRef.current?.scrollTop === 0) {
            touchY.current = e.clientY;
        } else {
            touchY.current = 0;
        }
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (touchY.current === 0) return;
        const deltaY = e.clientY - touchY.current;

        if (!showGrid && (containerRef.current?.scrollTop || 0) <= 0) {
            setPullDistance(Math.max(0, deltaY));
        }
    };

    const handleWheel = (e: React.WheelEvent) => {
        if (containerRef.current?.scrollTop === 0 && e.deltaY < -50 && !showGrid) {
            setShowGrid(true);
            if (window.navigator.vibrate) window.navigator.vibrate(10);
        }
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        if (pullDistance > 220) {
            setShowGrid(true);
            if (window.navigator.vibrate) window.navigator.vibrate(15);
        }
        setPullDistance(0);
        touchY.current = 0;

        const deltaX = e.clientX - touchStartX.current;
        const deltaY = e.clientY - touchStartY.current;

        // Horizontal swipe: move distance > 50 and must be more horizontal than vertical
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
            if (deltaX > 50 && activeFeed === 'friends') {
                handleFeedSwitch('discover');
            } else if (deltaX < -50 && activeFeed === 'discover') {
                handleFeedSwitch('friends');
            }
        }
    };

    const handleLogoClick = () => {
        const now = Date.now();
        if (now - lastClickTimeRef.current < 300) {
            onNavigate('HOME');
        } else {
            containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
        }
        lastClickTimeRef.current = now;
    };

    const handleScroll = () => {
        const currentScrollY = containerRef.current?.scrollTop || 0;
        const delta = currentScrollY - lastScrollY.current;

        if (currentScrollY > 10) {
            setTopBarY(prev => {
                const newY = prev - delta;
                return Math.max(-80, Math.min(0, newY)); // Cap at top bar height (~80px)
            });
        } else {
            setTopBarY(0);
        }

        lastScrollY.current = currentScrollY;
    };

    const fetchFeedData = async () => {
        setLoading(true);
        try {
            const feedData = await supabaseService.captures.getFeed(activeFeed, currentUser.id);
            setCaptures(feedData);

            const recallData = await supabaseService.captures.getRecallCaptures(currentUser.id);
            setRecallCaptures(recallData);
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    useEffect(() => {
        fetchFeedData();
    }, [refreshTrigger, currentUser.last_posted_date, activeFeed]);

    const isLoading = loading || forceLoading;

    const handleFeedSwitch = (type: 'discover' | 'friends') => {
        if (activeFeed === type) return;
        setActiveFeed(type);
        // Haptic
        if (window.navigator.vibrate) window.navigator.vibrate(5);
    };

    return (
        <div className="relative flex-1 h-full w-full flex flex-col overflow-hidden">
            {/* Top Bar - Absolute Overlay */}


            {/* SECONDARY HEADER - TABS (Fixed behavior under TopBar) */}
            {!showGrid && (
                <motion.div
                    animate={{ y: topBarY }}
                    transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                    className="absolute top-[20px] left-0 right-0 z-40 flex items-center justify-center pt-2 pointer-events-none"
                >
                    <FloatingTabs
                        activeTab={activeFeed}
                        onChange={(val) => handleFeedSwitch(val as 'discover' | 'friends')}
                        tabs={[
                            { label: 'Discover', value: 'discover' },
                            { label: 'Friends', value: 'friends' }
                        ]}
                    />
                </motion.div>
            )}

            {/* Overscroll Indicators Overlay - Fixed position outside screen transition */}
            <AnimatePresence>
                {pullDistance > 20 && !showGrid && (
                    <motion.div
                        key="pull-indicator-feed"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            y: Math.min(pullDistance * 0.25, 40) // Responsive y-offset
                        }}
                        exit={{ opacity: 0, scale: 0.8, y: -20 }}
                        className="absolute top-[140px] left-0 right-0 z-[60] flex flex-col items-center pointer-events-none"
                    >
                        <div className="bg-black/90 backdrop-blur-2xl px-6 py-3 rounded-full border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.6)] flex items-center gap-3">
                            <motion.div
                                animate={{ y: pullDistance > 220 ? 4 : 0 }}
                                transition={{ repeat: Infinity, duration: 0.8, repeatType: 'reverse' }}
                            >
                                <ChevronDown size={14} className={pullDistance > 220 ? 'text-primary' : 'text-white/40'} />
                            </motion.div>
                            <span className={`text-[10px] font-black uppercase tracking-[0.4em] transition-colors duration-300 ${pullDistance > 220 ? 'text-primary' : 'text-white/40'}`}>
                                {pullDistance > 220 ? 'Release for Recall' : 'Pull for Recall'}
                            </span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {!showGrid ? (
                    <motion.div
                        key="lore-feed"
                        initial={{ opacity: 0, y: window.innerHeight }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: window.innerHeight }}
                        transition={{ type: 'spring', damping: 28, stiffness: 220 }}
                        ref={containerRef}
                        onScroll={handleScroll}
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        onWheel={handleWheel}
                        className="flex-1 h-full overflow-y-auto pb-14 pt-[80px] px-4 no-scrollbar flex flex-col lore-feed-container"
                    >
                        <HeartbeatTransition loading={isLoading}>
                            <div className="flex-1 flex flex-col min-h-full">
                                {captures.length === 0 ? (
                                    <FeedPlaceholder
                                        title="Be the First"
                                        description="No Lore has been shared yet. Start the chain!"
                                        icon={<Camera size={40} />}
                                        buttonLabel="Post Lore"
                                        onAction={onLaunchCamera}
                                    />
                                ) : (
                                    <div className="space-y-4">
                                        {captures.map(c => (
                                            <DualCameraPost
                                                key={c.id}
                                                capture={c}
                                                onOpenDetail={onOpenPostDetail}
                                                onUserClick={onUserClick}
                                                currentUser={currentUser}
                                                isLocked={!hasUserPostedToday}
                                                onUnlock={onLaunchCamera}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </HeartbeatTransition>
                    </motion.div>
                ) : (
                    <RecallGridView
                        key="recall-view-container" // Key for proper AnimatePresence handling
                        captures={recallCaptures}
                        onOpenDetail={onOpenPostDetail}
                        onClose={() => setShowGrid(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};
