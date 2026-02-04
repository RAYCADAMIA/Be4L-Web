import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft, Settings, User as UserIcon, Info, LogOut, Share2,
    MoreVertical, Grid, FileText, ImageIcon,
    Check, X, Camera, Phone, Mail, Globe, Shield,
    Bell, Trash2, Smartphone, HelpCircle, Star, QrCode, Copy, Download,
    UserPlus, Users, Search, Activity, Compass, LayoutDashboard, ShoppingBag, Plus, Send,
    Zap, ChevronRight
} from 'lucide-react';
import { CreatePostModal } from './CreatePostModal';
import { User as UserType, Capture, Quest, QuestStatus, DibsItem } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '../contexts/NavigationContext';
import { supabaseService } from '../services/supabaseService';
import { EKGLoader, GradientButton } from './ui/AestheticComponents';
import QuestCard from './QuestCard';
import { useToast } from './Toast';
import { COLORS, MOCK_USER, OTHER_USERS } from '../constants';
import { dailyService } from '../services/dailyService';
import OperatorOnboarding from './Dibs/OperatorOnboarding';
import { Hero3DScene } from './Landing/Hero3DScene';
import OperatorDashboard from './Dibs/OperatorDashboard';
import OperatorProfileScreen from './Dibs/OperatorProfileScreen';
import { Operator } from '../types';
import ProfileHeader from './ProfileHeader';
import DibsItemCard from './DibsItemCard';
import PostCard from './PostCard';

interface ProfileScreenProps {
    user: UserType;
    onBack: () => void;
    onLogout?: () => void;
    onOpenPostDetail?: (c: Capture) => void;
    onOpenQuest?: (q: Quest) => void;
    onOpenUser?: (u: UserType) => void;
    onProfileUpdate?: (updatedUser: UserType) => void;
    currentUserId?: string;
    theme?: 'dark' | 'light';
    onToggleTheme?: () => void;
    onOpenChat?: (id: string, name: string) => void;
    onNavigate?: (tab: 'HOME' | 'QUESTS' | 'CHATS' | 'BOOK' | 'SEARCH' | 'NOTIFICATIONS') => void;
}

type ProfileView = 'MAIN' | 'ACCOUNT' | 'SETTINGS' | 'ABOUT' | 'ADD_FRIENDS' | 'FRIENDS_LIST' | 'FOLLOWING_LIST' | 'DIBS_ONBOARD' | 'OPERATOR_PORTAL';

const ProfileScreen: React.FC<ProfileScreenProps> = ({ user, onBack, onLogout, onOpenPostDetail, onOpenQuest, onOpenUser, onProfileUpdate, currentUserId, theme = 'dark', onToggleTheme, onOpenChat, onNavigate }) => {
    const isMe = user.id === currentUserId;
    const { user: currentUser } = useAuth();
    const [localTab, setLocalTab] = useState<'DIBS' | 'LORE' | 'QUESTS' | 'ABOUT' | 'TAGGED'>('DIBS');
    const [showMenu, setShowMenu] = useState(false);
    const [vault, setVault] = useState<any[]>([]);
    const [showQr, setShowQr] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreatePost, setShowCreatePost] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showPfpModal, setShowPfpModal] = useState(false);
    const [showFollowers, setShowFollowers] = useState(false);
    const [showFollowing, setShowFollowing] = useState(false);
    const [showAuraModal, setShowAuraModal] = useState(false);
    const [view, setView] = useState<'PROFILE' | 'SETTINGS'>('PROFILE');
    const [loadingQuests, setLoadingQuests] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
    const [isFollowLoading, setIsFollowLoading] = useState(false);

    // Confirmation States
    const [showDiscardModal, setShowDiscardModal] = useState(false);
    const { showToast } = useToast();
    const [userQuests, setUserQuests] = useState<Quest[]>([]);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Quest Filters
    const [questFilter, setQuestFilter] = useState<'ACTIVE' | 'CREATED' | 'JOINED' | 'HISTORY'>('ACTIVE');
    const [dibsFilter, setDibsFilter] = useState<'ALL' | 'UNREDEEMED' | 'REDEEMED'>('ALL');

    // Operator Logic
    const [myOperatorData, setMyOperatorData] = useState<Operator | null>(null);
    const [myItems, setMyItems] = useState<DibsItem[]>([]);
    const [loadingOperator, setLoadingOperator] = useState(false);
    const [loadingItems, setLoadingItems] = useState(false);
    const [myBookings, setMyBookings] = useState<any[]>([]);
    const [loadingBookings, setLoadingBookings] = useState(false);
    const [waitlistEmail, setWaitlistEmail] = useState('');
    const [waitlistSubmitted, setWaitlistSubmitted] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<any | null>(null);

    const handleWaitlistSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!waitlistEmail) return;
        setWaitlistSubmitted(true);
        // Mock API call
        setTimeout(() => {
            setWaitlistEmail('');
        }, 1500);
    };

    useEffect(() => {
        const fetchProfileData = async () => {
            setLoadingQuests(true);
            try {
                // 1. Fetch Vault (Lore)
                const captures = await supabaseService.captures.getVault(user.id);
                setVault(captures || []);

                // 2. Fetch Quests (If not operator or just general)
                const qr = await supabaseService.quests.getMyQuests(user.id);
                setUserQuests(qr || []);

                // 3. Fetch Follow Status
                if (!isMe && currentUserId) {
                    const status = await supabaseService.profiles.getFollowStatus(currentUserId, user.id);
                    setIsFollowing(status);
                }

                // 4. Operator Specific Data
                if (user.is_operator) {
                    setLoadingOperator(true);
                    setLoadingItems(true);
                    const allOps = await supabaseService.dibs.getOperators();
                    const myOp = allOps?.find(op => op.user_id === user.id);
                    setMyOperatorData(myOp || null);

                    if (myOp) {
                        const itemsData = await supabaseService.dibs.getItems(myOp.user_id);
                        setMyItems(itemsData);
                    }
                    setLoadingOperator(false);
                    setLoadingItems(false);
                }

                // 5. User Bookings (Actual Dibs they called)
                if (isMe) {
                    setLoadingBookings(true);
                    const bookings = await supabaseService.dibs.getMyBookings(user.id);
                    setMyBookings(bookings || []);
                    setLoadingBookings(false);
                }
            } catch (err) {
                console.error("Profile data fetch error:", err);
            } finally {
                setLoadingQuests(false);
            }
        };

        fetchProfileData();
    }, [user.id, currentUserId, isMe, user.is_operator]);

    useEffect(() => {
        setLocalTab(user.is_operator ? 'LORE' : 'LORE'); // User wants LORE first
    }, [user.id]);

    const handleFollowToggle = async () => {
        if (!currentUserId) return;
        setIsFollowLoading(true);
        try {
            if (isFollowing) {
                await supabaseService.users.unfollow(user.id);
                setIsFollowing(false);
            } else {
                await supabaseService.users.follow(user.id);
                setIsFollowing(true);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsFollowLoading(false);
        }
    };

    const handleMessageClick = () => {
        if (onOpenChat) onOpenChat(user.id, user.name);
    };

    const handleAvatarClick = () => {
        if (isMe) setShowPfpModal(true);
    };

    return (
        <div className="flex-1 min-h-full bg-transparent text-white relative">
            <ProfileHeader
                user={user}
                isMe={isMe}
                isOwner={isMe}
                onBack={onBack}
                onSettings={() => setView('SETTINGS')}
                onEditProfile={() => setShowEditModal(true)}
                onAddPost={() => setShowCreatePost(true)}
                onLogout={() => setShowLogoutConfirm(true)}
                onManagePage={() => setLocalTab('DIBS')}
                onFollow={handleFollowToggle}
                onMessage={async () => {
                    const chat = await supabaseService.chat.getOrCreatePersonalChat(
                        currentUser?.id || '',
                        user.id,
                        user.name
                    );
                    if (chat && onNavigate) {
                        onNavigate('CHATS');
                    }
                }}
                isFollowing={isFollowing}
                onMore={() => setShowMenu(true)}
                onAvatarClick={() => setShowPfpModal(true)}
                locationText={user.location_text}
                onShowFollowers={() => setShowFollowers(true)}
                onShowFollowing={() => setShowFollowing(true)}
                onShowAuraStats={() => setShowAuraModal(true)}
            />

            <div className="sticky top-[72px] md:top-[80px] z-40 max-w-4xl mx-auto px-4 mt-4 w-full">
                <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] flex items-center justify-around px-2 shadow-2xl">
                    {(user.is_operator ? [
                        { label: 'Lore', value: 'LORE' },
                        { label: 'Dibs', value: 'DIBS' }
                    ] : [
                        { label: 'My Lore', value: 'LORE' },
                        { label: 'Side Quests', value: 'QUESTS' },
                        ...(isMe ? [{ label: 'Dibbed', value: 'DIBS' } as any] : [])
                    ])
                        .map((tab) => {
                            const isActive = localTab === tab.value;
                            return (
                                <button
                                    key={tab.value}
                                    onClick={() => setLocalTab(tab.value as any)}
                                    className="relative py-4 px-4 flex flex-col items-center justify-center min-w-[120px]"
                                >
                                    <span className={`text-[11px] font-black uppercase tracking-widest transition-colors ${isActive ? 'text-white' : 'text-gray-500 hover:text-white/60'}`}>
                                        {tab.label}
                                    </span>
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeTabUnderline"
                                            className="absolute bottom-1 w-8 h-0.5 bg-electric-teal shadow-[0_0_10px_rgba(45,212,191,0.5)]"
                                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                        />
                                    )}
                                </button>
                            );
                        })}
                </div>
            </div>

            <div className="flex-1 max-w-4xl mx-auto px-4 w-full min-h-[50vh] pt-4 pb-32">
                {localTab === 'DIBS' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="py-6"
                    >
                        {user.is_operator ? (
                            loadingItems ? (
                                <div className="py-20 flex justify-center"><EKGLoader /></div>
                            ) : myItems.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {myItems.map(item => (
                                        <DibsItemCard
                                            key={item.id}
                                            item={item}
                                            onClick={() => {
                                                if (isMe) window.location.href = '/app/dashboard/menu';
                                                else console.log("Item", item.id);
                                            }}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 text-center bg-white/5 rounded-[2.5rem] border border-white/5 border-dashed">
                                    <ShoppingBag size={48} className="mb-4 text-gray-700" />
                                    <p className="text-xs font-black uppercase tracking-widest text-gray-500">No active dibs</p>
                                </div>
                            )
                        ) : (
                            // Regular User Dibs History ("Dibbed")
                            <div className="space-y-8">
                                {/* Filter Tabs */}
                                <div className="flex p-1 bg-white/5 border border-white/10 rounded-2xl w-fit">
                                    {[
                                        { id: 'ALL', label: 'All' },
                                        { id: 'UNREDEEMED', label: 'Unredeemed' },
                                        { id: 'REDEEMED', label: 'Redeemed' }
                                    ].map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setDibsFilter(tab.id as any)}
                                            className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${dibsFilter === tab.id ? 'bg-white text-black' : 'text-gray-500 hover:text-white'}`}
                                        >
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>

                                {loadingBookings ? (
                                    <div className="py-20 flex justify-center"><EKGLoader /></div>
                                ) : (() => {
                                    const filteredBookings = myBookings.filter(bk => {
                                        if (dibsFilter === 'UNREDEEMED') return bk.status === 'CONFIRMED';
                                        if (dibsFilter === 'REDEEMED') return bk.status === 'REDEEMED';
                                        return true;
                                    });

                                    if (filteredBookings.length > 0) {
                                        return (
                                            <div className="space-y-6">
                                                {filteredBookings.map((bk) => (
                                                    <div
                                                        key={bk.id}
                                                        onClick={() => setSelectedBooking(bk)}
                                                        className="bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-6 flex flex-col md:flex-row gap-6 relative overflow-hidden group shadow-xl hover:bg-white/[0.05] transition-all cursor-pointer active:scale-[0.98]"
                                                    >
                                                        <div className="w-full md:w-24 h-24 rounded-2xl overflow-hidden bg-white/5 shrink-0 border border-white/5">
                                                            <img src={bk.item?.image_url || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32'} className="w-full h-full object-cover" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex justify-between items-start mb-2">
                                                                <div>
                                                                    <h4 className="text-lg font-black italic text-white uppercase tracking-tight mb-0.5 animate-liquid-text">{bk.item?.title || 'Dibs Item'}</h4>
                                                                    <p className="text-[9px] font-black uppercase tracking-widest text-electric-teal animate-liquid-text italic">{bk.operator?.business_name || 'Operator'}</p>
                                                                </div>
                                                                <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.2em] border ${bk.status === 'CONFIRMED'
                                                                    ? 'bg-electric-teal border-electric-teal text-black'
                                                                    : bk.status === 'REDEEMED'
                                                                        ? 'bg-white/10 border-white/20 text-gray-400'
                                                                        : 'bg-yellow-500/20 border-yellow-500/30 text-yellow-500'
                                                                    }`}>
                                                                    {bk.status.replace('_', ' ')}
                                                                </div>
                                                            </div>
                                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-white/5">
                                                                <div>
                                                                    <p className="text-[8px] font-black uppercase tracking-widest text-gray-600 mb-0.5">Code</p>
                                                                    <p className="text-xs font-mono font-black text-white">{bk.booking_ref}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-[8px] font-black uppercase tracking-widest text-gray-600 mb-0.5">Amount</p>
                                                                    <p className="text-xs font-black text-white">₱{bk.total_amount}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-[8px] font-black uppercase tracking-widest text-gray-600 mb-0.5">Date</p>
                                                                    <p className="text-xs font-black text-white">{new Date(bk.created_at).toLocaleDateString()}</p>
                                                                </div>
                                                                <div className="flex items-end justify-end">
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); setShowQr(true); }}
                                                                        className="p-1.5 bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
                                                                    >
                                                                        <QrCode size={14} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    }

                                    return (
                                        <div className="flex flex-col items-center justify-center py-24 text-center bg-white/5 rounded-[2.5rem] border border-white/5 border-dashed">
                                            <ShoppingBag size={48} className="mb-4 text-gray-800" />
                                            <p className="text-xs font-black uppercase tracking-widest text-gray-500">No {dibsFilter.toLowerCase()} Dibbs</p>
                                            <p className="text-[10px] text-gray-600 mt-2">Your filtered history will appear here.</p>
                                        </div>
                                    );
                                })()}
                            </div>
                        )}
                    </motion.div>
                )}

                {localTab === 'LORE' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="py-6"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {user.is_operator && myOperatorData?.gallery ? (
                                myOperatorData.gallery.map((photo: any, idx: number) => (
                                    <div key={idx} className="aspect-[4/3] rounded-[2.5rem] overflow-hidden border border-white/10 bg-white/5 relative group cursor-pointer shadow-xl">
                                        <img src={photo.photo_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="gallery" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                                    </div>
                                ))
                            ) : (
                                vault.map((item, idx) => (
                                    <PostCard
                                        key={idx}
                                        capture={item}
                                        onClick={() => onOpenPostDetail?.(item)}
                                    />
                                ))
                            )}
                        </div>
                        {(!user.is_operator) && (
                            <div className="max-w-xl mx-auto py-12 px-6 text-center">
                                <p className="text-xl md:text-2xl font-black uppercase tracking-tighter mb-4 animate-liquid-text">
                                    "A glance of your memories"
                                </p>
                                <div className="relative p-10 bg-white/[0.03] backdrop-blur-3xl rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden group">
                                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-electric-teal/10 blur-[80px]" />
                                    <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/10 blur-[80px]" />

                                    <div className="relative z-10 space-y-4">
                                        <p className="text-[10px] font-black uppercase tracking-[0.4em] animate-liquid-text">Capturing Lore coming soon</p>
                                        <div className="space-y-4">
                                            <p className="text-sm font-bold text-gray-400 leading-relaxed px-4">
                                                <span className="animate-liquid-text italic">Lore</span> is a social feed of your memories and your friends' captures. Revisit your collected lores and personal legacy anytime on your <span className="animate-liquid-text italic">profile</span>.
                                            </p>
                                            <p className="text-sm font-bold text-gray-400 leading-relaxed">
                                                Join our waitlist to be among the first founding members of <span className="animate-liquid-text italic">Be4L</span>.
                                            </p>
                                        </div>
                                        <div className="pt-4 max-w-sm mx-auto w-full">
                                            {!waitlistSubmitted ? (
                                                <form
                                                    onSubmit={handleWaitlistSubmit}
                                                    className="relative group/form w-full"
                                                >
                                                    <div className="relative flex items-center bg-white/5 border border-white/10 rounded-2xl p-1.5 focus-within:border-electric-teal/50 transition-all">
                                                        <Mail size={16} className="ml-4 text-gray-500" />
                                                        <input
                                                            type="email"
                                                            required
                                                            value={waitlistEmail}
                                                            onChange={(e) => setWaitlistEmail(e.target.value)}
                                                            placeholder="Enter your email"
                                                            className="flex-1 bg-transparent border-none outline-none px-3 text-sm text-white placeholder:text-gray-600 w-full"
                                                        />
                                                        <button
                                                            type="submit"
                                                            className="px-6 py-3 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-electric-teal transition-all active:scale-95 flex items-center gap-2"
                                                        >
                                                            Join <Send size={12} />
                                                        </button>
                                                    </div>
                                                </form>
                                            ) : (
                                                <div className="py-2 text-electric-teal font-black uppercase tracking-widest text-[10px] animate-pulse">
                                                    You are now on the waitlist, we will email you once the app is about to launch
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* 3D Showcase Integration */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.5, duration: 1 }}
                                    className="relative w-full h-[60vh] -mt-12"
                                >
                                    <Hero3DScene />
                                </motion.div>
                            </div>
                        )}
                        {(user.is_operator && !myOperatorData?.gallery?.length && !vault.length) && (
                            <div className="py-32 text-center opacity-30 flex flex-col items-center">
                                <ImageIcon size={48} className="mb-4 text-gray-700" />
                                <p className="text-xs font-black uppercase tracking-widest text-gray-500">No memories found</p>
                            </div>
                        )}
                    </motion.div>
                )}

                {localTab === 'QUESTS' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="py-6 space-y-8"
                    >
                        {/* Venture Log Header with Status Filters */}
                        <div className="flex flex-col md:flex-row gap-4 items-center justify-between px-1">
                            <div className="flex items-center gap-4">
                                <div className="flex p-1 bg-white/5 border border-white/10 rounded-2xl">
                                    {[
                                        { id: 'CREATED', label: 'Hosted' },
                                        { id: 'JOINED', label: 'Joined' },
                                        { id: 'ACTIVE', label: 'Active' },
                                        { id: 'HISTORY', label: 'Completed' }
                                    ].map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setQuestFilter(tab.id as any)}
                                            className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${questFilter === tab.id ? 'bg-white text-black' : 'text-gray-500 hover:text-white'}`}
                                        >
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {loadingQuests ? (
                                <div className="col-span-full py-20 flex justify-center"><EKGLoader /></div>
                            ) : (() => {
                                const filteredQuests = userQuests.filter(q => {
                                    if (questFilter === 'CREATED') return q.creator_id === user.id;
                                    if (questFilter === 'JOINED') return q.creator_id !== user.id;
                                    if (questFilter === 'ACTIVE') return q.status === 'PUBLISHED' || q.status === 'STARTED';
                                    if (questFilter === 'HISTORY') return q.status === 'COMPLETED' || q.status === 'CANCELLED';
                                    return true;
                                });

                                if (filteredQuests.length > 0) {
                                    return filteredQuests.map(q => (
                                        <QuestCard
                                            key={q.id}
                                            quest={q}
                                            currentUser={user}
                                            onJoin={() => { }}
                                            onOpenDetail={() => onOpenQuest?.(q)}
                                        />
                                    ));
                                }

                                return (
                                    <div className="col-span-full py-24 text-center bg-white/5 rounded-[2.5rem] border border-white/5 border-dashed flex flex-col items-center">
                                        <Activity size={48} className="mb-4 text-gray-800" />
                                        <p className="text-xs font-black uppercase tracking-widest text-gray-500">No {questFilter.toLowerCase()} quests</p>
                                        <p className="text-[10px] text-gray-600 mt-2">Your quest engagement will be tracked here.</p>
                                    </div>
                                );
                            })()}
                        </div>
                    </motion.div>
                )}
            </div>

            {showQr && (
                <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-6" onClick={() => setShowQr(false)}>
                    <div className="bg-card w-full max-w-sm rounded-[2rem] p-6 flex flex-col items-center relative" onClick={e => e.stopPropagation()}>
                        <QrCode size={180} className="text-white" />
                        <button onClick={() => setShowQr(false)} className="mt-8 text-electric-teal font-bold">CLOSE</button>
                    </div>
                </div>
            )}

            {showPfpModal && (
                <div className="fixed inset-0 z-[70] bg-black/95 flex items-center justify-center p-6 animate-in fade-in duration-200" onClick={() => setShowPfpModal(false)}>
                    <img src={user.avatar_url} className="w-full max-w-md aspect-square rounded-full object-cover border-4 border-electric-teal shadow-[0_0_50px_rgba(45,212,191,0.3)]" alt="full pfp" />
                </div>
            )}

            <AnimatePresence>
                {view === 'DIBS_ONBOARD' && (
                    <div className="fixed inset-0 z-[100] bg-deep-void">
                        <OperatorOnboarding
                            onCancel={() => setView('MAIN')}
                            onComplete={() => {
                                onProfileUpdate?.({ ...user, is_operator: true });
                                window.location.href = '/app/home';
                            }}
                        />
                    </div>
                )}

            </AnimatePresence>

            {/* Logout Confirmation Modal */}
            <AnimatePresence>
                {showLogoutConfirm && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
                            onClick={() => setShowLogoutConfirm(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-[#0A0A0A] border border-white/10 rounded-[2.5rem] p-8 w-full max-w-sm relative z-10 shadow-3xl text-center"
                        >
                            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <LogOut size={32} className="text-red-500" />
                            </div>
                            <h3 className="text-xl font-black uppercase italic tracking-tighter text-white mb-2">Are you sure?</h3>
                            <p className="text-xs font-bold text-gray-500 leading-relaxed mb-8">
                                You're about to log out of Be4L. You'll need to sign in again to access your lore and quests.
                            </p>
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => {
                                        onLogout?.();
                                        setShowLogoutConfirm(false);
                                    }}
                                    className="w-full py-4 bg-red-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all active:scale-95"
                                >
                                    Yes, Log Out
                                </button>
                                <button
                                    onClick={() => setShowLogoutConfirm(false)}
                                    className="w-full py-4 bg-white/5 text-gray-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                                >
                                    Stay Logged In
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Delete Account Confirmation Modal */}
            <AnimatePresence>
                {showDeleteConfirm && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/90 backdrop-blur-2xl"
                            onClick={() => setShowDeleteConfirm(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-[#0A0A0A] border border-red-500/20 rounded-[2.5rem] p-10 w-full max-w-md relative z-10 shadow-3xl text-center"
                        >
                            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-8">
                                <Trash2 size={40} className="text-red-500" />
                            </div>
                            <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white mb-4">PERMANENT DELETION</h3>
                            <p className="text-sm font-bold text-gray-400 leading-relaxed mb-10">
                                This action is <span className="text-red-500 font-black underline">irreversible</span>. All your memories (Lore), quests history, and aura points will be permanently scrubbed from the Be4L network.
                            </p>
                            <div className="flex flex-col gap-4">
                                <button
                                    onClick={() => {
                                        // Final delete logic
                                        showToast("Account deletion requested. This will take up to 24 hours.", "info");
                                        setShowDeleteConfirm(false);
                                    }}
                                    className="w-full py-5 bg-red-500 text-white rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(239,68,68,0.3)] hover:bg-red-600 transition-all active:scale-95"
                                >
                                    CONFIRM DELETION
                                </button>
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="w-full py-5 bg-white shadow-xl text-black rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] transition-all hover:scale-[1.02] active:scale-95"
                                >
                                    KEEP MY MEMORIES
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Ticket Modal */}
            <AnimatePresence>
                {selectedBooking && (
                    <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/90 backdrop-blur-2xl"
                            onClick={() => setSelectedBooking(null)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-electric-teal border-none rounded-[3rem] w-full max-w-sm relative z-10 shadow-[0_20px_60px_rgba(45,212,191,0.4)] overflow-hidden text-black p-8 flex flex-col items-center"
                        >
                            {/* Checkmark Icon */}
                            <div className="w-16 h-16 bg-black/10 rounded-full flex items-center justify-center mb-6">
                                <Check size={32} />
                            </div>

                            <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-1">Dibs Called!</h3>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-8 opacity-60">Booking Submitted</p>

                            {/* Booking Code Box */}
                            <div className="w-full bg-black/10 rounded-3xl p-8 mb-8 text-center border border-black/5">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-50">Booking Code</p>
                                <p className="text-4xl font-mono font-black tracking-tighter">{selectedBooking.booking_ref}</p>
                            </div>

                            {/* Divider Line */}
                            <div className="w-full h-px bg-black/10 mb-8" />

                            {/* Reservation Details */}
                            <div className="w-full space-y-4">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50">Reservation Details</p>
                                <div className="flex justify-between items-end">
                                    <span className="text-xs font-bold leading-tight max-w-[70%]">{selectedBooking.item?.title}</span>
                                    <span className="text-xs font-black">x1</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-xs opacity-60 font-bold uppercase tracking-widest">Date</span>
                                    <span className="text-xs font-black">{new Date(selectedBooking.created_at).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-xs opacity-60 font-bold uppercase tracking-widest">Operator</span>
                                    <span className="text-xs font-black">{selectedBooking.operator?.business_name}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => setSelectedBooking(null)}
                                className="mt-8 px-8 py-3 bg-black text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
                            >
                                Done
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Edit Profile Modal */}
            <AnimatePresence>
                {showEditModal && (
                    <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/90 backdrop-blur-2xl"
                            onClick={() => setShowEditModal(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-[#0A0A0A] border border-white/10 rounded-[3rem] w-full max-w-md relative z-10 shadow-3xl overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="p-8 border-b border-white/5 flex items-center justify-between">
                                <h3 className="text-xl font-black uppercase italic tracking-tighter text-white">Edit Profile</h3>
                                <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                                    <X size={20} className="text-white" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                                {/* Cover Update */}
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-electric-teal">Cover Photo</p>
                                    <div className="relative h-32 w-full rounded-2xl overflow-hidden group cursor-pointer border border-white/10">
                                        <img src={user.cover_url || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32'} className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-500" />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Camera size={24} className="text-white" />
                                        </div>
                                    </div>
                                </div>

                                {/* Avatar Update */}
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-electric-teal">Profile Picture</p>
                                    <div className="relative w-24 h-24 rounded-full overflow-hidden group cursor-pointer border-2 border-white/10 mx-auto">
                                        <img src={user.avatar_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Camera size={20} className="text-white" />
                                        </div>
                                    </div>
                                </div>

                                {/* Bio Update */}
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-electric-teal">Bio</p>
                                    <textarea
                                        defaultValue={user.bio}
                                        placeholder="Write your odyssey..."
                                        rows={4}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white focus:border-electric-teal outline-none transition-all placeholder:text-gray-700 font-medium"
                                    />
                                </div>
                            </div>

                            <div className="p-8 border-t border-white/5">
                                <button
                                    onClick={() => {
                                        // Mock update for now
                                        setShowEditModal(false);
                                    }}
                                    className="w-full py-4 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-electric-teal transition-all active:scale-95"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <CreatePostModal
                isOpen={showCreatePost}
                onClose={() => setShowCreatePost(false)}
                currentUser={user}
            />
            <div className="h-32 md:h-0" />
            {/* Followers/Following Modals */}
            <AnimatePresence>
                {(showFollowers || showFollowing) && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-zinc-900 border border-white/10 rounded-[2.5rem] w-full max-w-sm overflow-hidden flex flex-col max-h-[70vh]"
                        >
                            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white">
                                    {showFollowers ? 'Followers' : 'Following'}
                                </h3>
                                <button
                                    onClick={() => { setShowFollowers(false); setShowFollowing(false); }}
                                    className="p-2 rounded-full bg-white/5 text-gray-400 hover:text-white"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                                {/* Mock Users */}
                                {OTHER_USERS.slice(0, showFollowers ? 5 : 4).map(u => (
                                    <div
                                        key={u.id}
                                        onClick={() => {
                                            if (onOpenProfile) onOpenProfile(u.id);
                                            setShowFollowers(false);
                                            setShowFollowing(false);
                                        }}
                                        className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-2xl transition-all cursor-pointer group"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-zinc-800 border border-white/10 overflow-hidden">
                                            <img src={u.avatar_url} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs font-black text-white group-hover:text-electric-teal transition-colors animate-liquid-text italic">{u.name}</p>
                                            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest animate-liquid-text italic">@{u.username}</p>
                                        </div>
                                        <ChevronRight size={14} className="text-gray-700 group-hover:text-white transition-colors" />
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Aura Stats Modal */}
            <AnimatePresence>
                {showAuraModal && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-black border border-white/10 rounded-[2.5rem] w-full max-w-sm overflow-hidden flex flex-col p-8"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3 text-electric-teal">
                                    <Activity size={24} />
                                    <div>
                                        <h3 className="text-xl font-black italic tracking-tighter leading-none animate-liquid-text">
                                            {Math.round((user.aura?.score || user.reliability_score || 4.8) * 100).toLocaleString()}
                                        </h3>
                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Social Reputation</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowAuraModal(false)}
                                    className="p-2 rounded-full bg-white/5 text-gray-400 hover:text-white"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 border-b border-white/5 pb-2">Recent Trajectories</p>
                                <div className="space-y-4">
                                    {(user as any).aura_history?.map((tx: any) => (
                                        <div key={tx.id} className="flex items-center justify-between group">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${tx.amount > 0 ? 'bg-electric-teal/10 text-electric-teal' : 'bg-red-500/10 text-red-500'}`}>
                                                    {tx.amount > 0 ? <Zap size={14} className="fill-current" /> : <Shield size={14} />}
                                                </div>
                                                <div>
                                                    <p className="text-[11px] font-black text-white group-hover:text-electric-teal transition-colors">{tx.reason}</p>
                                                    <p className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">{new Date(tx.created_at).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <span className={`text-xs font-black italic ${tx.amount > 0 ? 'text-electric-teal' : 'text-red-500'}`}>
                                                {tx.amount > 0 ? '+' : ''}{tx.amount}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-8 p-4 bg-white/5 rounded-2xl border border-white/5">
                                <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest leading-relaxed">
                                    Aura points are computed based on your consistency, reliability, and social feedback. High aura unlocks exclusive sectors and quests.
                                </p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProfileScreen;
