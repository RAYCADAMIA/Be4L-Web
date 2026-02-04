import React, { useState, useEffect } from 'react';
import { supabaseService } from '../services/supabaseService';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Trophy, Zap, Target, Star, LayoutGrid, Sparkles, ChevronRight, Users, ArrowRight, Send } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MOCK_QUESTS } from '../constants';
import QuestCard from './QuestCard';
import DibsItemCard from './DibsItemCard';
import DibsCard, { Operator } from './DibsCard';
import { PhoneShowcaseSection } from './Landing/PhoneShowcaseSection';

export const HomePage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [showLeaderboard, setShowLeaderboard] = useState(false);

    const [brands, setBrands] = useState<any[]>([]);
    const [discoveryItems, setDiscoveryItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadHomePageData = async () => {
            setLoading(true);
            try {
                const [opData, itemData] = await Promise.all([
                    supabaseService.dibs.getOperators(),
                    supabaseService.dibs.getAllItems()
                ]);
                if (opData) {
                    // Match BookScreen filtering: only venue and event
                    const filteredOps = opData.filter((op: any) =>
                        op.category === 'venue' || op.category === 'event'
                    );
                    setBrands(filteredOps.slice(0, 4)); // Show top 4 for better grid balance
                }
                if (itemData && opData) {
                    // Enrich items with their operators for consistent display
                    const enrichedItems = itemData
                        .filter((item: any) => {
                            const brand = opData.find((b: any) => b.user_id === item.operator_id);
                            return brand && (brand.category === 'venue' || brand.category === 'event');
                        })
                        .slice(0, 7);
                    setDiscoveryItems(enrichedItems);
                }
            } catch (err) {
                console.error("Home feed load failed", err);
            }
            setLoading(false);
        };
        loadHomePageData();
    }, []);

    const discoveryQuests = MOCK_QUESTS.slice(0, 7);

    const displayName = user?.username || user?.email?.split('@')[0] || 'Friend';

    const [feedback, setFeedback] = useState('');
    const [feedbackStatus, setFeedbackStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

    const handleFeedbackSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!feedback) return;
        setFeedbackStatus('submitting');
        setTimeout(() => {
            setFeedbackStatus('success');
            setFeedback('');
            setTimeout(() => setFeedbackStatus('idle'), 3000);
        }, 1500);
    };

    if (!user) return null;

    return (
        <div className="flex-1 h-full relative overflow-y-auto no-scrollbar bg-deep-black pb-0 pt-24">

            {/* Header / Aura Toggle */}
            <div className="px-6 mb-12">
                <div className="flex items-center justify-between mb-2">
                    <motion.h1
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-4xl md:text-5xl font-black font-fui text-white italic pr-12"
                    >
                        What's the plan, <span className="animate-liquid-text">{displayName}</span>.
                    </motion.h1>
                </div>
                <div className="flex items-center gap-2 group cursor-pointer">
                    <MapPin size={18} className="text-electric-teal group-hover:animate-bounce" />
                    <p className="text-cool-grey font-bold text-sm tracking-widest uppercase">
                        Davao City, PH
                    </p>
                </div>
            </div>



            {/* Brands Section (Moved Up) */}
            <section className="mb-24">
                <div className="px-6 flex items-center justify-between mb-8">
                    <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/40 flex items-center gap-2 px-1">
                        <Star size={14} className="text-electric-teal" /> HOT BRANDS
                    </h2>
                    <button onClick={() => navigate('/app/dibs')} className="flex items-center gap-2 group text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors">
                        Explore Brands <ArrowRight size={14} />
                    </button>
                </div>
                <div className="flex overflow-x-auto no-scrollbar gap-6 px-6 snap-x pb-4 items-center">
                    {brands.map((brand) => (
                        <div key={brand.user_id} className="min-w-[300px] max-w-[300px] snap-center">
                            <DibsCard
                                operator={brand}
                                isMe={brand.user_id === user.id}
                                onClick={(slug) => navigate('/app/shop/' + slug)}
                            />
                        </div>
                    ))}
                    {/* Floating View All */}
                    <button
                        onClick={() => navigate('/app/dibs')}
                        className="flex flex-col items-center justify-center min-w-[120px] h-[200px] gap-3 text-gray-500 hover:text-white transition-all group shrink-0"
                    >
                        <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-electric-teal group-hover:text-black group-hover:border-electric-teal transition-all">
                            <ArrowRight size={20} />
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-[0.2em]">View All</span>
                    </button>
                </div>
            </section>

            {/* Discover Quest (Slidable) */}
            <section className="mb-20">
                <div className="px-6 flex items-center justify-between mb-8">
                    <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/40 flex items-center gap-2 px-1">
                        <Sparkles size={14} className="text-electric-teal" /> DISCOVER QUESTS
                    </h2>
                    <button onClick={() => navigate('/app/quests')} className="flex items-center gap-2 group text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors">
                        View All <ArrowRight size={14} />
                    </button>
                </div>
                <div className="flex overflow-x-auto no-scrollbar gap-6 px-6 snap-x pb-4 items-center">
                    {discoveryQuests.map(quest => (
                        <motion.div
                            whileHover={{ y: -5 }}
                            key={quest.id}
                            className="min-w-[320px] max-w-[320px] snap-center"
                        >
                            <QuestCard
                                quest={quest}
                                currentUser={user}
                                onJoin={() => { }}
                                onOpenDetail={(q) => {
                                    const newParams = new URLSearchParams(searchParams);
                                    newParams.set('quest', q.id);
                                    setSearchParams(newParams);
                                }}
                            />
                        </motion.div>
                    ))}
                    {/* Floating View All */}
                    <button
                        onClick={() => navigate('/app/quests')}
                        className="flex flex-col items-center justify-center min-w-[120px] h-[200px] gap-3 text-gray-500 hover:text-white transition-all group shrink-0"
                    >
                        <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-electric-teal group-hover:text-black group-hover:border-electric-teal transition-all">
                            <ArrowRight size={20} />
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-[0.2em]">View All</span>
                    </button>
                </div>
            </section>

            {/* Discover Dib Items (Slidable) */}
            <section className="mb-24">
                <div className="px-6 flex items-center justify-between mb-8">
                    <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/40 flex items-center gap-2 px-1">
                        <Sparkles size={14} className="text-electric-teal" /> DISCOVER ITEMS
                    </h2>
                    <button onClick={() => navigate('/app/dibs')} className="flex items-center gap-2 group text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors">
                        Browse All <ArrowRight size={14} />
                    </button>
                </div>
                <div className="flex overflow-x-auto no-scrollbar gap-6 px-6 snap-x pb-4 items-center">
                    {discoveryItems.map((item, idx) => (
                        <div key={idx} className="min-w-[300px] max-w-[300px] snap-center">
                            <DibsItemCard
                                item={item as any}
                                operator={brands.find(b => b.user_id === (item as any).operator_id)}
                                onClick={() => navigate('/app/dibs?item=' + (item as any).id)}
                            />
                        </div>
                    ))}
                    {/* Floating View All */}
                    <button
                        onClick={() => navigate('/app/dibs')}
                        className="flex flex-col items-center justify-center min-w-[120px] h-[200px] gap-3 text-gray-500 hover:text-white transition-all group shrink-0"
                    >
                        <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-electric-teal group-hover:text-black group-hover:border-electric-teal transition-all">
                            <ArrowRight size={20} />
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-[0.2em]">View All</span>
                    </button>
                </div>
            </section>

            {/* Dynamic Community Feedback & Coming Soon Footer */}
            <section className="px-6 py-20 bg-deep-black relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />

                <div className="max-w-2xl mx-auto text-center space-y-12 relative z-10">
                    {/* Coming Soon Message */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="space-y-2 opacity-40"
                    >
                        <p className="text-cool-grey font-bold text-[9px] tracking-[0.2em] uppercase">
                            More features coming soon
                        </p>
                        <p className="text-xs md:text-sm font-black tracking-[0.3em] uppercase animate-liquid-text">
                            ~Badsiro
                        </p>
                    </motion.div>

                    {/* Feedback Form */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="p-8 md:p-12 bg-white/[0.02] backdrop-blur-3xl rounded-[3rem] border border-white/10 space-y-8 group hover:border-electric-teal/20 transition-all duration-700 shadow-2xl"
                    >
                        <div className="space-y-4">
                            <h3 className="text-base md:text-lg font-black tracking-tight text-white uppercase">
                                Help us improve <span className="animate-liquid-text normal-case">Be4L</span>
                            </h3>
                            <p className="text-gray-500 text-[11px] font-medium tracking-tight px-6 leading-relaxed opacity-60">
                                We are still early in the game. Your feedback helps us shape the future of <span className="text-white">Be4L</span>. What should we build next?
                            </p>
                        </div>

                        {feedbackStatus === 'success' ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="py-10 flex flex-col items-center justify-center space-y-4"
                            >
                                <div className="w-14 h-14 rounded-full bg-electric-teal/10 text-electric-teal flex items-center justify-center border border-electric-teal/20 shadow-[0_0_30px_rgba(45,212,191,0.1)]">
                                    <Sparkles size={24} />
                                </div>
                                <div className="space-y-1 text-center">
                                    <p className="text-white font-bold text-sm tracking-tight">Thank you for your feedback!</p>
                                    <p className="text-electric-teal/60 font-black uppercase tracking-widest text-[9px]">Keep being for life.</p>
                                </div>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleFeedbackSubmit} className="space-y-4 max-w-sm mx-auto w-full">
                                <div className="relative group/input">
                                    <textarea
                                        value={feedback}
                                        onChange={(e) => setFeedback(e.target.value)}
                                        placeholder="Send us a feedback..."
                                        rows={3}
                                        required
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-white placeholder:text-white/10 focus:outline-none focus:border-electric-teal/30 focus:bg-white/[0.06] transition-all text-sm font-medium resize-none shadow-inner"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={feedbackStatus === 'submitting'}
                                    className="w-full py-4 bg-white text-black font-black rounded-2xl hover:bg-electric-teal hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 group"
                                >
                                    {feedbackStatus === 'submitting' ? (
                                        <span className="animate-pulse">Sending feedback...</span>
                                    ) : (
                                        <>
                                            Send Feedback <Send size={12} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            </form>
                        )}

                        <div className="flex items-center justify-center gap-1.5 opacity-20">
                            <div className="w-1 h-1 rounded-full bg-white" />
                            <div className="w-1 h-1 rounded-full bg-white" />
                            <div className="w-1 h-1 rounded-full bg-white" />
                        </div>
                    </motion.div>
                </div>

                {/* Ambient Glows */}
                <div className="absolute -bottom-48 -left-48 w-96 h-96 bg-electric-teal/10 blur-[120px] rounded-full pointer-events-none" />
                <div className="absolute -top-48 -right-48 w-96 h-96 bg-purple-500/5 blur-[120px] rounded-full pointer-events-none" />
            </section>

        </div>
    );
};
