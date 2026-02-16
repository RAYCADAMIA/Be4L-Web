import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AnimationOrchestrator } from '../Landing/AnimationOrchestrator';
import { HeroSection } from '../Landing/HeroSection';
import { VisionSection } from '../Landing/VisionSection';
import { PhoneShowcaseSection } from '../Landing/PhoneShowcaseSection';
import { RoadmapSection } from '../Landing/RoadmapSection';
import { FeatureShowcase } from '../Landing/FeatureShowcase';
import { PartnerPitch, UserCTA, Starfield, TeamRecruitment, PoweredBy } from '../Landing/LandingComponents';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Sparkles, ArrowRight, Star, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabaseService } from '../../services/supabaseService';
import { generateRandomQuests } from '../../utils/questGenerator';
import { QuestType } from '../../types';
import QuestCard from '../QuestCard';
import DibsItemCard from '../DibsItemCard';
import DibsCard from '../DibsCard';
import { PartnerPostCard } from '../Dibs/PartnerFeed';
import { MOCK_QUESTS } from '../../constants';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import HorizontalRail from '../Shared/HorizontalRail';

// Local HorizontalRail replaced by Shared component


export const GuestHome: React.FC = () => {
    const navigate = useNavigate();
    const [brands, setBrands] = useState<any[]>([]);
    const [discoveryItems, setDiscoveryItems] = useState<any[]>([]);
    const [discoveryQuests, setDiscoveryQuests] = useState<any[]>([]);
    const [partnerPosts, setPartnerPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadGuestData = async () => {
            setLoading(true);
            try {
                const [opData, itemData, questData, postData] = await Promise.all([
                    supabaseService.dibs.getOperators(),
                    supabaseService.dibs.getAllItems(),
                    supabaseService.quests.getQuests(),
                    supabaseService.partner.getPosts()
                ]);

                // Usage of random quests for variety
                const canonRandom = generateRandomQuests('All', new Date(), 8, QuestType.CANON);
                const spontyRandom = generateRandomQuests('All', new Date(), 4, QuestType.SPONTY);

                const allQuests = [
                    ...(questData || []),
                    ...canonRandom,
                    ...spontyRandom
                ];

                setDiscoveryQuests(allQuests.sort(() => Math.random() - 0.5).slice(0, 12));

                if (opData) {
                    const filteredOps = opData.filter((op: any) =>
                        op.category === 'venue' || op.category === 'event'
                    );
                    setBrands(filteredOps.slice(0, 4));
                }
                if (itemData && opData) {
                    const enrichedItems = itemData
                        .filter((item: any) => {
                            const brand = opData.find((b: any) => b.user_id === item.operator_id);
                            return brand && (brand.category === 'venue' || brand.category === 'event');
                        })
                        .slice(0, 7);
                    setDiscoveryItems(enrichedItems);
                }
                if (postData) {
                    setPartnerPosts(postData.slice(0, 5));
                }

            } catch (err) {
                console.error("Guest feed load failed", err);
                setDiscoveryQuests(MOCK_QUESTS.slice(0, 5));
            }
            setLoading(false);
        };
        loadGuestData();
    }, []);

    const handleJoinClick = () => {
        navigate('/auth');
    };

    // Guest Auth Trigger for interactions
    const handleAuthTrigger = () => {
        navigate('/auth');
    };

    return (
        <AnimationOrchestrator>
            <div className="relative w-full min-h-screen bg-transparent pb-20">
                {/* 1. Hero Section (Visual Intro) */}
                <HeroSection onJoinClick={handleJoinClick} />

                {/* 2. Dashboard Content (Below Hero) */}
                <div className="relative z-10 pt-6 pb-12">

                    {/* Dashboard Header */}
                    <div className="px-6 mb-12">
                        <div className="flex items-center justify-between mb-2">
                            <h1 className="text-4xl md:text-5xl font-black font-fui text-white pr-12">
                                What's the plan?
                            </h1>
                        </div>
                        <p className="text-electric-teal font-black uppercase tracking-[0.2em] text-[10px] mb-4">
                            Do a side quest now to farm aura points
                        </p>
                        <div className="flex items-center gap-2 group cursor-pointer">
                            <MapPin size={18} className="text-electric-teal group-hover:animate-bounce" />
                            <p className="text-cool-grey font-bold text-sm tracking-widest uppercase">
                                Davao City, PH
                            </p>
                        </div>
                    </div>

                    {/* Quest Feed (Reordered: Now 3rd) */}
                    <section className="mb-12">
                        <div className="px-6 flex items-center justify-between mb-8">
                            <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/40 flex items-center gap-2 px-1">
                                <Sparkles size={14} className="text-electric-teal" /> DISCOVER QUESTS
                            </h2>
                            <button onClick={() => navigate('/quests')} className="flex items-center gap-2 group text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors">
                                View All <ArrowRight size={14} />
                            </button>
                        </div>
                        <HorizontalRail className="gap-6 px-6 snap-x pb-4">
                            {discoveryQuests.map(quest => (
                                <motion.div
                                    whileHover={{ y: -5 }}
                                    key={quest.id}
                                    className="min-w-[320px] max-w-[320px] snap-center whitespace-normal"
                                >
                                    <QuestCard
                                        quest={quest}
                                        currentUser={null} // Guest
                                        onJoin={handleAuthTrigger}
                                        onOpenDetail={(q) => {
                                            if (q.id) {
                                                navigate(`/app/quests?quest=${q.id}`);
                                            }
                                        }}
                                    />
                                </motion.div>
                            ))}
                            <button
                                onClick={() => navigate('/quests')}
                                className="flex flex-col items-center justify-center min-w-[120px] h-[200px] gap-3 text-gray-500 hover:text-white transition-all group shrink-0"
                            >
                                <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-electric-teal group-hover:text-black group-hover:border-electric-teal transition-all">
                                    <ArrowRight size={20} />
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-[0.2em]">View All</span>
                            </button>
                        </HorizontalRail>
                    </section>

                    {/* Brands Section (Reordered: Now 4th) */}
                    {brands.length > 0 && (
                        <section className="mb-12">
                            <div className="px-6 flex items-center justify-between mb-8">
                                <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/40 flex items-center gap-2 px-1">
                                    <Star size={14} className="text-electric-teal" /> HOT BRANDS
                                </h2>
                                <button onClick={() => navigate('/dibs')} className="flex items-center gap-2 group text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors">
                                    Explore Brands <ArrowRight size={14} />
                                </button>
                            </div>
                            <HorizontalRail className="gap-6 px-6 snap-x pb-4">
                                {brands.map((brand) => (
                                    <div key={brand.user_id} className="min-w-[300px] max-w-[300px] snap-center">
                                        <DibsCard
                                            operator={brand}
                                            isMe={false}
                                            onClick={() => navigate('/app/shop/' + brand.slug)} // Or trigger auth if strict
                                        />
                                    </div>
                                ))}
                                <button
                                    onClick={() => navigate('/dibs')}
                                    className="flex flex-col items-center justify-center min-w-[120px] h-[200px] gap-3 text-gray-500 hover:text-white transition-all group shrink-0"
                                >
                                    <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-electric-teal group-hover:text-black group-hover:border-electric-teal transition-all">
                                        <ArrowRight size={20} />
                                    </div>
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em]">View All</span>
                                </button>
                            </HorizontalRail>
                        </section>
                    )}

                    {/* Brand Updates (Reordered: Now 5th, Renamed from Partner Updates) */}
                    {partnerPosts.length > 0 && (
                        <section className="mb-12">
                            <div className="px-6 flex items-center justify-between mb-8">
                                <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/40 flex items-center gap-2 px-1">
                                    <Send size={14} className="text-electric-teal" /> BRAND UPDATES
                                </h2>
                            </div>
                            <HorizontalRail className="gap-6 px-6 snap-x pb-4">
                                {partnerPosts.map(post => (
                                    <div key={post.id} className="snap-center">
                                        <PartnerPostCard
                                            post={post}
                                            onOpenProfile={(id) => {
                                                const op = brands.find(b => b.user_id === id);
                                                if (op) navigate('/app/shop/' + op.slug);
                                            }}
                                        />
                                    </div>
                                ))}
                            </HorizontalRail>
                        </section>
                    )}

                    {/* Urge Section (Marketing Content) (6th) */}
                    <div id="vibe-check-section" className="scroll-mt-32">
                        <UserCTA onJoinClick={handleAuthTrigger} />
                    </div>

                    {/* Phone Showcase Section (Marketing Content) (7th) */}
                    <div id="phone-showcase">
                        <PhoneShowcaseSection />
                    </div>

                    {/* How Quests Works (8th, Renamed) */}
                    <section className="py-12 px-6 relative overflow-hidden">
                        <div className="max-w-7xl mx-auto">
                            <div className="text-center mb-16 space-y-4">
                                <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-white font-fui">
                                    How Quests <span className="text-electric-teal animate-pulse">Works</span>
                                </h3>
                                <p className="text-cool-grey text-sm max-w-md mx-auto">
                                    Complete side quests, earn rewards, and build your aura.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                                {/* Step 1 */}
                                <div className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all group text-center space-y-6">
                                    <div className="w-16 h-16 mx-auto rounded-2xl bg-electric-teal/10 flex items-center justify-center text-electric-teal border border-electric-teal/20 group-hover:scale-110 transition-transform">
                                        <Send size={28} />
                                    </div>
                                    <div className="space-y-3">
                                        <h4 className="text-lg font-black uppercase tracking-wide text-white">1. Create / Join</h4>
                                        <p className="text-cool-grey text-xs leading-relaxed">
                                            Invite friends or join randoms for sports, travel, jobs, training, or any side quest.
                                        </p>
                                    </div>
                                </div>
                                {/* Step 2 */}
                                <div className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all group text-center space-y-6">
                                    <div className="w-16 h-16 mx-auto rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20 group-hover:scale-110 transition-transform">
                                        <Sparkles size={28} />
                                    </div>
                                    <div className="space-y-3">
                                        <h4 className="text-lg font-black uppercase tracking-wide text-white">2. Sponty</h4>
                                        <p className="text-cool-grey text-xs leading-relaxed">
                                            Undecided? Let the random quest generator decide, or challenge someone: "Swim with your uniform on for ₱500".
                                        </p>
                                    </div>
                                </div>
                                {/* Step 3 */}
                                <div className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all group text-center space-y-6">
                                    <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20 group-hover:scale-110 transition-transform">
                                        <Star size={28} />
                                    </div>
                                    <div className="space-y-3">
                                        <h4 className="text-lg font-black uppercase tracking-wide text-white">3. Complete</h4>
                                        <p className="text-cool-grey text-xs leading-relaxed">
                                            Have fun and Complete the quest. Be 4 Life.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* How Dibs Work (9th, Renamed) */}
                    <section className="py-12 px-6 relative overflow-hidden">
                        <div className="max-w-7xl mx-auto">
                            <div className="text-center mb-16 space-y-4">
                                <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-white font-fui">
                                    How Dibs <span className="text-purple-500 animate-pulse">Work</span>
                                </h3>
                                <div className="h-1 w-12 bg-purple-500 mx-auto rounded-full" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                                {/* Step 1 */}
                                <div className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-purple-500/30 transition-all group text-center space-y-6">
                                    <div className="w-16 h-16 mx-auto rounded-full bg-white/5 flex items-center justify-center text-white border border-white/10 group-hover:bg-purple-500/20 transition-colors">
                                        <MapPin size={28} />
                                    </div>
                                    <div className="space-y-3">
                                        <h4 className="text-lg font-black uppercase tracking-wide text-white">1. Choose Brands</h4>
                                        <p className="text-cool-grey text-xs leading-relaxed">
                                            Find exclusive social brands from different domains: sports, events, flea markets, hotels, etc.
                                        </p>
                                    </div>
                                </div>
                                {/* Step 2 */}
                                <div className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-purple-500/30 transition-all group text-center space-y-6">
                                    <div className="w-16 h-16 mx-auto rounded-full bg-white/5 flex items-center justify-center text-white border border-white/10 group-hover:bg-purple-500/20 transition-colors">
                                        <ArrowRight size={28} />
                                    </div>
                                    <div className="space-y-3">
                                        <h4 className="text-lg font-black uppercase tracking-wide text-white">2. Call Dibs</h4>
                                        <p className="text-cool-grey text-xs leading-relaxed">
                                            One-tap booking system. Pay and receive your unique code. We keep it simple.
                                        </p>
                                    </div>
                                </div>
                                {/* Step 3 */}
                                <div className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-purple-500/30 transition-all group text-center space-y-6">
                                    <div className="w-16 h-16 mx-auto rounded-full bg-white/5 flex items-center justify-center text-white border border-white/10 group-hover:bg-purple-500/20 transition-colors">
                                        <Star size={28} />
                                    </div>
                                    <div className="space-y-3">
                                        <h4 className="text-lg font-black uppercase tracking-wide text-white">3. Show Up</h4>
                                        <p className="text-cool-grey text-xs leading-relaxed">
                                            Enjoy and chill with convenience.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Marketing Vision & Features (10th, 11th) - Dictionary + Manifesto */}
                    <div id="vision" className="scroll-mt-32">
                        <VisionSection />
                    </div>

                    {/* Feature Showcase (12th) */}
                    <div id="features" className="scroll-mt-32">
                        <FeatureShowcase />
                    </div>

                    {/* In Partnership With (13th) */}
                    <div id="powered-by">
                        <PoweredBy />
                    </div>

                    {/* Roadmap (14th) */}
                    <div id="roadmap" className="scroll-mt-32">
                        <RoadmapSection />
                    </div>

                    {/* Are you an Operator (15th) */}
                    <PartnerPitch />

                    {/* Are you up for a side quest (16th) */}
                    <TeamRecruitment />
                </div>
            </div>
        </AnimationOrchestrator>
    );
};


