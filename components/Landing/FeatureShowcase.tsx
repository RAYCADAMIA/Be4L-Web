import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Compass, Zap, MapPin, Calendar, Camera, Play, Users, MessageCircle, Trophy, Globe } from 'lucide-react';

const FEATURES = [
    {
        id: 'QUEST',
        title: 'QUEST',
        subtitle: 'Your Daily Adventure Engine',
        description: "Create, discover, and join quests. Whether it's a casual pickleball game or a road trip to the unknown with your friends or with random people who loves doing side quests.",
        color: '#FF8C00',
        icon: Compass,
        details: [
            { title: 'Planned', desc: 'Future-dated plans. "Pickleball tomorrow?"', icon: Calendar },
            { title: 'Spontaneous', desc: 'Happening Right now. "No destination, just driving."', icon: Zap },
            { title: 'Challenges', desc: 'Earn real money for real-world challenges.', icon: Trophy }
        ]
    },
    {
        id: 'LORE',
        title: 'LORE',
        subtitle: 'Capture Life. Don\'t Just Post It.',
        description: "Capture unforgettable moments and share them with friends as they happen in real-time. every stories are worth to tell",
        color: '#E34234',
        icon: Camera,
        details: [
            { title: 'Real-time', desc: 'No filters needed. Just raw life.', icon: Play },
            { title: 'Offline Mode', desc: 'Capture now, sync when you\'re back.', icon: Zap },
            { title: 'Memories', desc: 'Your personal archive of adventures.', icon: Globe }
        ]
    },
    {
        id: 'DIBS',
        title: 'DIBS',
        subtitle: 'Smart Social Booking',
        description: "Secure your spot with premium brands in a single tap. From midnight matches to exclusive socials—pick, book, and be there.",
        color: '#FFB854',
        icon: Zap,
        details: [
            { title: 'Explore Brands', desc: 'Find premium Courts, Hubs, Events, and Competitions.', icon: MapPin },
            { title: 'Instant Booking', desc: 'No queues. No friction. Just instant booking.', icon: Zap },
            { title: 'Live Discovery', desc: 'Find what to do and book it immediately.', icon: Globe }
        ]
    },
    {
        id: 'CHAT',
        title: 'CHAT',
        subtitle: 'Connect',
        description: "Coordinate quests and connect with those who share your intent. Join squads or go global. Let's all be friends!",
        color: '#800020',
        icon: MessageCircle,
        details: [
            { title: 'Global', desc: 'Talk to everyone.', icon: Users },
            { title: 'Squads', desc: 'Groups for friends.', icon: Compass },
            { title: 'Quests', desc: 'Coordinate plans.', icon: MessageCircle }
        ]
    }
];

export const FeatureShowcase: React.FC = () => {
    return (
        <section className="py-12 px-6 relative overflow-hidden">
            <div className="max-w-4xl mx-auto space-y-32 relative z-10">
                {FEATURES.map((feature, index) => (
                    <FeatureBlock key={feature.id} feature={feature} index={index} />
                ))}
            </div>
        </section>
    );
};

const FeatureBlock: React.FC<{ feature: typeof FEATURES[0], index: number }> = ({ feature, index }) => {
    const isEven = index % 2 === 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 80 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            className={`flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-10 md:gap-16`}
        >
            {/* Text Content */}
            <div className="flex-1 space-y-8 text-center md:text-left">
                {/* Vertical Header: Title + Pill Below */}
                <div className="flex flex-col items-center md:items-start gap-4">
                    <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white font-display brand-text-dusk uppercase leading-none">
                        {feature.title}
                    </h2>
                    <div className="inline-flex items-center gap-2 md:gap-3 glass-panel rounded-full px-3 py-1.5 md:px-4 md:py-1.5 border border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)]">
                        <feature.icon size={12} className="md:size-3.5" style={{ color: feature.color }} />
                        <span className="text-[8px] md:text-[10px] font-black tracking-[0.2em] text-white/80 uppercase font-display whitespace-nowrap">
                            {feature.subtitle}
                        </span>
                    </div>
                </div>

                <p className="text-base md:text-lg text-cool-grey font-medium leading-relaxed max-w-xl mx-auto md:mx-0 font-sans opacity-80 text-center md:text-left">
                    {feature.description}
                </p>

                {/* Micro Features - Slightly Shrinked */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    {feature.details.map((detail, i) => (
                        <div
                            key={i}
                            className="p-4 rounded-[1.5rem] glass-panel border-white/5 hover:border-white/20 hover:-translate-y-1 transition-all duration-500 group cursor-default bg-white/[0.01]"
                        >
                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center mb-3 mx-auto md:mx-0 group-hover:bg-white/10 transition-colors">
                                <detail.icon size={16} className="opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" style={{ color: feature.color }} />
                            </div>
                            <h3 className="text-[10px] font-black text-white mb-1.5 font-display uppercase tracking-[0.1em] brand-text-dusk">{detail.title}</h3>
                            <p className="text-[9px] text-cool-grey/80 leading-relaxed font-sans font-medium">{detail.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Visual/Graphic - Stylized Debris Style Icon */}
            <div className="flex-1 w-full flex items-center justify-center relative group">
                <div className="relative w-full max-w-sm aspect-square flex items-center justify-center">
                    {/* Background Glow */}
                    <motion.div
                        animate={{
                            scale: [1, 1.1, 1],
                            opacity: [0.05, 0.1, 0.05],
                        }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-0 blur-[80px] rounded-full"
                        style={{ backgroundColor: feature.color }}
                    />

                    {/* Floating Main Icon Graphic */}
                    <motion.div
                        animate={{
                            y: [0, -40, 0],
                            rotate: [0, 5, -5, 0],
                            scale: [1, 1.05, 1]
                        }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        className="relative z-10 w-40 h-40 md:w-56 md:h-56 rounded-[2.5rem] bg-white/[0.03] border border-white/10 backdrop-blur-xl flex items-center justify-center shadow-2xl shadow-black/40"
                    >
                        <feature.icon
                            size={90}
                            style={{ color: feature.color }}
                            className="md:size-[110px] filter drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] opacity-90"
                        />

                        {/* Decorative internal rings */}
                        <div className="absolute inset-4 rounded-[2.5rem] border border-white/5 pointer-events-none" />
                        <div className="absolute inset-8 rounded-[2rem] border border-white/[0.02] pointer-events-none" />
                    </motion.div>

                    {/* Orbiting particles */}
                    {[...Array(3)].map((_, i) => (
                        <motion.div
                            key={i}
                            animate={{
                                rotate: 360,
                                scale: [1, 1.5, 1],
                            }}
                            transition={{
                                rotate: { duration: 10 + i * 5, repeat: Infinity, ease: "linear" },
                                scale: { duration: 3, repeat: Infinity, ease: "easeInOut", delay: i }
                            }}
                            className="absolute w-2 h-2 rounded-full"
                            style={{
                                backgroundColor: feature.color,
                                left: `${50 + 40 * Math.cos(i * (Math.PI * 2 / 3))}%`,
                                top: `${50 + 40 * Math.sin(i * (Math.PI * 2 / 3))}%`,
                                filter: `blur(2px) drop-shadow(0 0 5px ${feature.color})`,
                                opacity: 0.5
                            }}
                        />
                    ))}
                </div>
            </div>
        </motion.div>
    );
}

export default FeatureShowcase;
