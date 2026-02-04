import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Compass, Zap, MapPin, Calendar, Camera, Play, Users, MessageCircle, Trophy, Globe } from 'lucide-react';

const FEATURES = [
    {
        id: 'QUEST',
        title: 'QUEST',
        subtitle: 'Your Daily Adventure Engine',
        description: "Create, discover, and join quests. Whether it's a casual pickleball game or a road trip to the unknown with your friends or with random people who loves doing side quests.",
        color: '#10B981', // Neon Emerald
        icon: Compass,
        image3d: '/assets/landing/quest_3d_icon.png',
        details: [
            { title: 'Canon', desc: 'Future-dated plans. "Pickleball tomorrow?"', icon: Calendar },
            { title: 'Sponty', desc: 'Right now. "Who\'s free for a hike?"', icon: Zap },
            { title: 'Quest Drop Feature', desc: 'Earn real money for challenges. Can you swim with your school uniform on for ₱500?', icon: Trophy }
        ]
    },
    {
        id: 'LORE',
        title: 'LORE',
        subtitle: 'Capture Life. Don\'t Just Post It.',
        description: "Capture unforgettable moments and share them with friends as they happen in real-time. every stories are worth to tell",
        color: '#06B6D4', // Cyan
        icon: Camera,
        image3d: '/assets/landing/lore_3d_icon.png', // Fixed Broken Path
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
        color: '#2DD4BF', // Electric Teal
        icon: MapPin,
        image3d: '/assets/landing/dibs_3d_icon.png',
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
        color: '#A5F3FC', // Light Cyan
        icon: MessageCircle,
        image3d: '/assets/landing/chat_3d_icon.png', // Fixed Broken Path
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
                            <h4 className="text-xs font-black text-white mb-2 font-display uppercase tracking-[0.15em] animate-liquid-text">{detail.title}</h4>
                            <p className="text-[10px] text-cool-grey/80 leading-relaxed font-sans font-medium">{detail.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Visual/Graphic */}
            <div className="flex-1 w-full aspect-square md:aspect-[4/3] relative group">
                <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                        animate={{
                            y: [0, -20, 0],
                            rotate: [0, 3, -3, 0]
                        }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                        className="w-[90%] h-[90%] md:w-full md:h-full max-w-lg"
                    >
                        <img
                            src={feature.image3d}
                            alt={feature.title}
                            className="w-full h-full object-contain filter drop-shadow-[0_0_80px_rgba(255,255,255,0.05)]"
                        />
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}

export default FeatureShowcase;
