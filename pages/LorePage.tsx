import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send, ImageIcon } from 'lucide-react';
import { Hero3DScene } from '../components/Landing/Hero3DScene';
import { useAuth } from '../contexts/AuthContext';
import { supabaseService } from '../services/supabaseService';
import { EKGLoader } from '../components/ui/AestheticComponents';
import PostCard from '../components/PostCard';
import { Operator } from '../types';

export const LorePage: React.FC = () => {
    const { user } = useAuth();
    const [vault, setVault] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [myOperatorData, setMyOperatorData] = useState<Operator | null>(null);
    const [waitlistEmail, setWaitlistEmail] = useState('');
    const [waitlistSubmitted, setWaitlistSubmitted] = useState(false);

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
        if (!user) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                // 1. Fetch Vault (Lore)
                const captures = await supabaseService.captures.getVault(user.id);
                setVault(captures || []);

                // 2. Operator Specific Data (if applicable)
                if (user.is_operator) {
                    const allOps = await supabaseService.dibs.getOperators();
                    const myOp = allOps?.find(op => op.user_id === user.id);
                    setMyOperatorData(myOp || null);
                }
            } catch (err) {
                console.error("Lore page data fetch error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    if (!user) return null;

    return (
        <div className="min-h-full bg-transparent relative overflow-y-auto no-scrollbar px-4 pb-20">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-4xl mx-auto py-6"
            >
                {loading ? (
                    <div className="py-20 flex justify-center"><EKGLoader /></div>
                ) : (
                    <>
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
                                        onClick={() => console.log("Post Detail", item)}
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
                                                <span className="animate-liquid-text">Lore</span> is a social feed of your memories and your friends' captures. Revisit your collected lores and personal legacy anytime here on your <span className="animate-liquid-text">My Lore</span>.
                                            </p>
                                            <p className="text-sm font-bold text-gray-400 leading-relaxed">
                                                Join our waitlist to be among the first founding members of <span className="animate-liquid-text">Be4L</span>.
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
                                    <Hero3DScene isPaused={false} />
                                </motion.div>
                            </div>
                        )}

                        {(user.is_operator && !myOperatorData?.gallery?.length && !vault.length) && (
                            <div className="py-32 text-center opacity-30 flex flex-col items-center">
                                <ImageIcon size={48} className="mb-4 text-gray-700" />
                                <p className="text-xs font-black uppercase tracking-widest text-gray-500">No memories found</p>
                            </div>
                        )}
                    </>
                )}
            </motion.div>
        </div>
    );
};
