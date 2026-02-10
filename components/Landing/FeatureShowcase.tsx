import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Compass, Zap, MapPin, Calendar, Camera, Play, Users, MessageCircle, Trophy, Globe } from 'lucide-react';

const FEATURES = [
    {
        id: 'QUEST',
        title: 'QUEST',
        subtitle: 'Your Daily Adventure Engine',
        description: "Create, discover, and join quests. Whether it's a casual pickleball game or a road trip to the unknown with your friends or with random people who loves doing side quests.",
        color: '#2DD4BF',
        icon: Compass,
        details: [
            { title: 'Canon', desc: 'Future-dated plans. "Pickleball tomorrow?"', icon: Calendar },
            { title: 'Sponty', desc: 'Happening Right now. "No destination, just driving. who\'s down?"', icon: Zap },
            { title: 'Quest Drop', desc: 'Earn real money for real-world challenges. Will you swim with your school uniform on for ₱500?', icon: Trophy }
        ]
    },
    {
        id: 'LORE',
        title: 'LORE',
        subtitle: 'Capture Life. Don\'t Just Post It.',
        description: "Capture unforgettable moments and share them with friends as they happen in real-time. every stories are worth to tell",
        color: '#06B6D4',
        icon: Camera,
        details: [
            { title: 'Real-time', desc: 'No filters needed. Just raw life.', icon: Play },
            { title: 'Offline Mode', desc: 'Capture now, sync when you\'re back.', icon: Zap },
            { title: 'My Lore', desc: 'Your personal archive of adventures.', icon: Globe }
        ]
    },
    {
        id: 'DIBS',
        title: 'DIBS',
        subtitle: 'Social Booking for the Real World',
        description: "A smart booking system for everything. Compare operators, check profiles, and secure your spot.",
        color: '#10B981',
        icon: Zap,
        details: [
            { title: 'Venues', desc: 'Courts, Studios, Fields', icon: MapPin },
            { title: 'Events', desc: 'Competitions, Concerts, Parties', icon: Globe },
            { title: 'Services', desc: 'Coaches, Guides, Photographers', icon: Users }
        ]
    },
    {
        id: 'CHAT',
        title: 'CHAT',
        subtitle: 'The Lobby',
        description: "Coordinate quests and connect with people who share your intent. No more dead group chats.",
        color: '#8B5CF6',
        icon: MessageCircle,
        details: [
            { title: 'Lobbies', desc: 'Temporary spaces for active quests.', icon: Users },
            { title: 'Intent Based', desc: 'Connect with purpose.', icon: Compass },
            { title: 'Coordination', desc: 'Make it happen.', icon: MessageCircle }
        ]
    }
];

export const FeatureShowcase: React.FC = () => {
    return (
        <section className="py-32 px-4 relative overflow-hidden">
            <div className="max-w-7xl mx-auto space-y-40 relative z-10">
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
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className={`flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-12 md:gap-20`}
        >
            {/* Text Content */}
            <div className="flex-1 space-y-10 text-center md:text-left">
                {/* Horizontal Header: Pill + Title (From Image 3 & 4) */}
                <div className="flex flex-row items-center gap-3 md:gap-6 justify-start flex-wrap md:flex-nowrap">
                    <div className="inline-flex items-center gap-2 md:gap-3 glass-panel rounded-full px-3 py-1.5 md:px-5 md:py-2 border border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)] shrink-0">
                        <feature.icon size={14} className="md:size-4" style={{ color: feature.color }} />
                        <span className="text-[8px] md:text-xs font-black tracking-[0.25em] text-white/90 uppercase font-display whitespace-nowrap">
                            {feature.subtitle}
                        </span>
                    </div>
                    <h2 className="text-4xl md:text-8xl font-black tracking-tighter text-white font-display animate-liquid-text uppercase leading-none shrink-0">
                        {feature.title}
                    </h2>
                </div>

                <p className="text-lg md:text-xl text-cool-grey font-medium leading-relaxed max-w-xl mr-auto md:mx-0 font-sans opacity-80 text-left">
                    {feature.description}
                </p>

                {/* Micro Features */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                    {feature.details.map((detail, i) => (
                        <div
                            key={i}
                            className="p-5 rounded-[2rem] glass-panel border-white/5 hover:border-white/20 hover:-translate-y-1.5 transition-all duration-500 group cursor-default bg-white/[0.01]"
                        >
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4 mx-auto md:mx-0 group-hover:bg-white/10 transition-colors">
                                <detail.icon size={20} className="opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" style={{ color: feature.color }} />
                            </div>
                            <h3 className="text-xs font-black text-white mb-2 font-display uppercase tracking-[0.15em] animate-liquid-text">{detail.title}</h3>
                            <p className="text-[10px] text-cool-grey/80 leading-relaxed font-sans font-medium">{detail.desc}</p>
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
                            opacity: [0.1, 0.2, 0.1],
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
                        className="relative z-10 w-48 h-48 md:w-64 md:h-64 rounded-[3rem] bg-white/[0.03] border border-white/10 backdrop-blur-xl flex items-center justify-center shadow-2xl shadow-black/40"
                    >
                        <feature.icon
                            size={120}
                            style={{ color: feature.color }}
                            className="filter drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] opacity-90"
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
