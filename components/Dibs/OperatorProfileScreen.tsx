import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, ArrowRight, MapPin, Users, Star, MessageCircle, Heart, Share2, Grid, Info,
    ShoppingBag, Settings, QrCode, BadgeCheck, ChevronLeft, Phone, Globe, Instagram, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabaseService } from '../../services/supabaseService';
import { Operator, DibsItem } from '../../types';
import { EKGLoader, FloatingTabs } from '../ui/AestheticComponents';
import BookingModal from './BookingModal'; // We might replace this with the new Flow later
import { useNavigation } from '../../contexts/NavigationContext';
import { useAuth } from '../../contexts/AuthContext';
import OperatorDashboard from './OperatorDashboard'; // Import Dashboard
import ProfileHeader from '../ProfileHeader';
import DibsItemCard from '../DibsItemCard';

interface OperatorProfileScreenProps {
    operatorData?: Operator;
    isOwnerView?: boolean;
}

const OperatorProfileScreen: React.FC<OperatorProfileScreenProps> = ({ operatorData, isOwnerView = false }) => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const { user: currentUser } = useAuth(); // Get current user

    const [localTab, setLocalTab] = useState<'showcase' | 'services' | 'about'>('services');

    const [operator, setOperator] = useState<Operator | null>(operatorData || null);
    const [items, setItems] = useState<DibsItem[]>([]);
    const [loading, setLoading] = useState(!operatorData);
    const [selectedItem, setSelectedItem] = useState<DibsItem | null>(null);
    const [isFollowing, setIsFollowing] = useState(false);

    // View State for Dashboard Overlay
    const [showDashboard, setShowDashboard] = useState(false);
    const [initialDashboardTab, setInitialDashboardTab] = useState<'overview' | 'orders' | 'verify' | 'menu' | 'business'>('overview');
    const [isOwner, setIsOwner] = useState(isOwnerView);

    // Local tab state initialization
    useEffect(() => {
        // Default is 'services' (Dibs) per user request
        setLocalTab('services');
    }, [slug, operatorData]);

    useEffect(() => {
        const loadData = async () => {
            // Case 1: Data passed via Props (Owner Profile View)
            if (operatorData) {
                setOperator(operatorData);
                const itemsData = await supabaseService.dibs.getItems(operatorData.user_id);
                setItems(itemsData);
                setIsOwner(true); // Explicitly set owner if passed
                setLoading(false);
                return;
            }

            // Case 2: Fetch by Slug (Public View)
            if (!slug) return;
            setLoading(true);

            const opData = await supabaseService.dibs.getOperatorBySlug(slug);
            if (opData) {
                setOperator(opData);
                const itemsData = await supabaseService.dibs.getItems(opData.user_id);
                setItems(itemsData);

                // Check Ownership
                if (currentUser && currentUser.id === opData.user_id) {
                    setIsOwner(true);
                }
            }
            setLoading(false);
        };
        loadData();
    }, [slug, currentUser, operatorData]);

    const handleFollow = () => {
        setIsFollowing(!isFollowing);
        if (operator) {
            if (!isFollowing) supabaseService.dibs.followOperator(operator.user_id);
            else supabaseService.dibs.unfollowOperator(operator.user_id);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-deep-black">
                <EKGLoader />
            </div>
        );
    }

    if (!operator) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-deep-black text-white">
                <h2 className="text-2xl font-black uppercase">Operator Not Found</h2>
                <button onClick={() => navigate(-1)} className="mt-4 text-primary underline">Go Back</button>
            </div>
        );
    }

    return (
        <div className="min-h-full bg-transparent text-white pb-32 relative">

            {/* 1. Header (Unified Standard) */}
            <ProfileHeader
                user={{
                    ...(currentUser || { id: '', username: 'guest', name: 'Guest', aura: { score: 1000, trend: 0, last_updated_at: '' } }),
                    name: operator.business_name,
                    username: operator.slug, // Use slug as handle for operators
                    avatar_url: operator.logo_url || operator.cover_photo_url,
                    cover_url: operator.cover_photo_url,
                    bio: operator.bio,
                    is_operator: true,
                    followers_count: operator.followers_count,
                    aura: { score: 4.8, trend: 0, last_updated_at: '' } // Standard rating
                } as any}
                isMe={isOwner} // Owner viewing own profile
                isOwner={isOwner}
                onBack={() => navigate(-1)}
                onFollow={handleFollow}
                isFollowing={isFollowing}
                onManagePage={() => {
                    setInitialDashboardTab('overview');
                    setShowDashboard(true);
                }}
                onEditProfile={() => { }} // Could link to settings
                locationText={operator.location_text}
                onMessage={async () => {
                    if (currentUser) {
                        const chat = await supabaseService.chat.getOrCreatePersonalChat(
                            currentUser.id,
                            operator.user_id,
                            operator.business_name
                        );
                        if (chat) {
                            navigate('/app/chat', { state: { openChatId: chat.id, openChatName: chat.name } });
                        }
                    }
                }}
            />

            {/* 2. Sticky Info Bar / Tabs (TikTok Shop Style) - Glassy Motif aligned with Cover */}
            <div className="sticky top-[72px] md:top-[80px] z-40 max-w-4xl mx-auto px-4 mt-4 w-full">
                <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] flex items-center justify-around px-2 shadow-2xl">
                    {[{ label: 'Posts', value: 'showcase' }, { label: 'Dibs', value: 'services' }, { label: 'Deets', value: 'about' }].map((tab) => (
                        <button
                            key={tab.value}
                            onClick={() => setLocalTab(tab.value as any)}
                            className="relative py-4 px-4 flex flex-col items-center justify-center min-w-[80px]"
                        >
                            <span className={`text-[11px] font-black uppercase tracking-widest transition-colors ${localTab === tab.value ? 'text-white' : 'text-gray-500'}`}>
                                {tab.label}
                            </span>
                            {localTab === tab.value && (
                                <motion.div
                                    layoutId="opActiveTab"
                                    className="absolute bottom-1 w-8 h-0.5 bg-electric-teal shadow-[0_0_10px_rgba(45,212,191,0.5)]"
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                            )}
                        </button>
                    ))}
                </div>
            </div>


            {/* Content Area */}
            <div className="flex-1 px-4 max-w-4xl mx-auto min-h-[50vh] pt-4">
                <AnimatePresence mode="wait">

                    {/* SHOWCASE TAB (Gallery + Highlights) */}
                    {localTab === 'showcase' && (
                        <motion.div
                            key="showcase"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            {/* Featured Photos Masonry */}
                            <div className="columns-2 md:columns-3 gap-4 space-y-4">
                                {operator.gallery && operator.gallery.map((photo: any, i: number) => (
                                    <div key={i} className="break-inside-avoid rounded-2xl overflow-hidden border border-white/10 bg-white/5 relative group cursor-pointer">
                                        <img src={photo.photo_url} className="w-full object-cover" loading="lazy" />
                                    </div>
                                ))}
                                {/* Fallback if empty */}
                                {(!operator.gallery || operator.gallery.length === 0) && (
                                    <div className="col-span-full h-32 flex items-center justify-center text-gray-600 text-xs font-bold uppercase tracking-widest border border-dashed border-white/10 rounded-2xl">
                                        No media showcase yet
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* SERVICES TAB (SHOP) */}
                    {localTab === 'services' && (
                        <motion.div
                            key="services"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="grid grid-cols-2 gap-4 pb-24"
                        >
                            {(items || []).filter(item => isOwner || item.is_active !== false).map(item => (
                                <DibsItemCard
                                    key={item.id}
                                    item={item}
                                    onClick={() => setSelectedItem(item)}
                                />
                            ))}
                        </motion.div>
                    )}

                    {/* ABOUT TAB */}
                    {localTab === 'about' && (
                        <motion.div
                            key="about"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            <div className="bg-white/[0.03] border border-white/5 rounded-3xl p-6">
                                <h3 className="font-black uppercase tracking-widest mb-4 flex items-center gap-2 text-xs">
                                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/70 animate-pulse-slow">
                                        About {operator.business_name}
                                    </span>
                                </h3>
                                <p className="text-gray-300 text-sm leading-loose whitespace-pre-wrap">{operator.bio}</p>
                            </div>

                            {/* Location & Map */}
                            <div className="bg-white/[0.03] border border-white/5 rounded-3xl overflow-hidden">
                                <div className="p-6 pb-2">
                                    <h3 className="text-white font-black uppercase tracking-widest flex items-center gap-2 text-xs">
                                        <MapPin size={14} className="text-electric-teal" />
                                        Location
                                    </h3>
                                    <p className="text-gray-400 text-xs mt-1">{operator.location_text || 'Davao City, Philippines'}</p>
                                </div>
                                <div className="h-48 w-full bg-zinc-800 relative group overflow-hidden">
                                    {operator.google_maps_link ? (
                                        <div className="w-full h-full">
                                            <iframe
                                                title="Location Map"
                                                src={(() => {
                                                    const link = operator.google_maps_link;
                                                    if (link.includes('src="')) {
                                                        const match = link.match(/src="([^"]+)"/);
                                                        return match ? match[1] : link;
                                                    }
                                                    return link;
                                                })()}
                                                width="100%"
                                                height="100%"
                                                style={{ border: 0 }}
                                                allowFullScreen={false}
                                                loading="lazy"
                                                referrerPolicy="no-referrer-when-downgrade"
                                                className="opacity-60 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
                                            />
                                            <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-deep-black to-transparent pointer-events-none" />
                                        </div>
                                    ) : (
                                        <>
                                            {/* Mock Google Map View */}
                                            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80&w=1000')] bg-cover opacity-40 grayscale group-hover:grayscale-0 transition-all duration-700" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-deep-black via-transparent to-transparent" />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-10 h-10 bg-electric-teal rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(45,212,191,0.5)] border border-white/20">
                                                    <MapPin size={24} className="text-black" />
                                                </div>
                                            </div>
                                        </>
                                    )}
                                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center bg-black/60 backdrop-blur-md p-3 rounded-xl border border-white/10 group-hover:border-electric-teal/50 transition-colors">
                                        <span className="text-[10px] font-bold text-white uppercase tracking-widest">Get Directions</span>
                                        <div className="flex items-center gap-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-electric-teal animate-pulse" />
                                            <ArrowRight size={16} className="text-electric-teal" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Contact & Hours */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 space-y-4">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Contact Details</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <Phone size={14} className="text-electric-teal" />
                                            <span className="text-xs text-white font-medium">+63 912 345 6789</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Instagram size={14} className="text-electric-teal" />
                                            <span className="text-xs text-white font-medium">@{operator.slug}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Globe size={14} className="text-electric-teal" />
                                            <span className="text-xs text-white font-medium">www.{operator.slug}.com</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 space-y-4">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Operating Hours</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-400">Mon - Fri</span>
                                            <span className="text-xs text-white font-bold">10:00 - 22:00</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-400">Sat - Sun</span>
                                            <span className="text-xs text-white font-bold">08:00 - 00:00</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-electric-teal">
                                            <Clock size={12} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Open Now</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>

            {/* Bottom Padding for Mobile Nav Bar Visibility */}
            <div className="h-32 md:h-0" />


            {/* OWNER OVERLAY: DASHBOARD */}
            <AnimatePresence>
                {showDashboard && isOwner && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed inset-0 z-[100] bg-deep-void overflow-y-auto"
                    >
                        <OperatorDashboard
                            onBack={() => setShowDashboard(false)}
                            initialTab={initialDashboardTab}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* BOOKING MODAL (Legacy flow, will upgrade to Customizable Page later) */}
            <AnimatePresence>
                {selectedItem && (
                    <BookingModal
                        isOpen={!!selectedItem}
                        onClose={() => setSelectedItem(null)}
                        item={selectedItem}
                        operator={operator}
                    />
                )}
            </AnimatePresence>

        </div>
    );
};

export default OperatorProfileScreen;
