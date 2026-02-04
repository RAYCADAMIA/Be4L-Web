import React from 'react';
import { motion } from 'framer-motion';
import { Starfield, HUDMenu } from '../../components/Landing/LandingComponents';
import { useNavigate } from 'react-router-dom';
import {
    Zap,
    Users,
    Shield,
    ArrowRight,
    Target,
    QrCode,
    Layout,
    MessageCircle,
    TrendingUp,
    Camera,
    PlayCircle
} from 'lucide-react';

export const PartnerPitchPage: React.FC = () => {
    const navigate = useNavigate();

    const sections = [
        {
            id: 'engine',
            icon: Target,
            badge: 'GAMIFIED GROWTH',
            title: 'DRIVE TRAFFIC WITH QUEST DROPS',
            desc: 'Turn your venue into a live target. Drop time-sensitive quests to fill your slots instantly.',
            example: 'Example: "First 5 groups to check in at our court get 50% off." Drive urgency, drive real footsteps.',
            color: 'text-electric-teal'
        },
        {
            id: 'verification',
            icon: QrCode,
            badge: 'SEAMLESS OPS',
            title: 'SECURE QR VERIFICATION',
            desc: 'Every quest participant is verified. Real-time QR ticket confirmation ensures valid traffic and zero friction.',
            example: 'No more manual lists. Scan, verify, and let them play.',
            color: 'text-blue-400'
        },
        {
            id: 'branding',
            icon: Layout,
            badge: 'ABSOLUTE BRANDING',
            title: 'YOUR BUSINESS, YOUR RULES',
            desc: 'Get your own dedicated partner page. Upload high-res photos, videos, and custom Lore to showcase your vibe.',
            example: 'It\'s like a social media profile, but built for closing sales.',
            color: 'text-purple-400'
        },
        {
            id: 'community',
            icon: MessageCircle,
            badge: 'TRIBE BUILDING',
            title: 'STAY CONNECTED WITH YOUR COMMUNITY',
            desc: 'Convert one-time visitors into a loyal community. Message your followers and drop exclusive quests to your tribe.',
            example: 'We help you create the community; we give you the tools to keep them.',
            color: 'text-pink-400'
        }
    ];

    return (
        <div className="relative min-h-screen text-white selection:bg-electric-teal/30 overflow-x-hidden bg-deep-black">
            <Starfield />
            <HUDMenu onJoinClick={() => navigate('/')} isScrolled={true} />

            <main className="relative z-10 pt-40 pb-32 px-6">
                <div className="max-w-7xl mx-auto">

                    {/* Hero Section */}
                    <div className="text-center space-y-12 mb-40">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="space-y-6"
                        >
                            <span className="text-[10px] md:text-sm font-black text-electric-teal uppercase tracking-[0.5em] animate-liquid-text">
                                THE OPERATOR ENGINE
                            </span>
                            <h1 className="text-5xl md:text-9xl font-black font-fui animate-liquid-text tracking-tighter uppercase leading-[0.85]">
                                UPSCALE YOUR <br />
                                <span className="text-white">OPERATIONS.</span>
                            </h1>
                            <p className="text-xl md:text-3xl text-cool-grey max-w-4xl mx-auto font-medium font-sans mt-8 leading-relaxed">
                                Most marketing is noise. Be4L is the signal. <br />
                                We don't just "show" your business; <span className="text-white">we drive real foot traffic</span> through intentional, gamified engagement.
                            </p>
                        </motion.div>

                        <div className="flex flex-col md:flex-row items-center justify-center gap-6 mt-12">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/partner/apply')}
                                className="bg-white text-black font-black px-12 py-6 rounded-2xl font-fui text-xl shadow-[0_0_40px_rgba(45,212,191,0.3)] flex items-center gap-4 group"
                            >
                                START YOUR PILOT QUEST
                                <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
                            </motion.button>

                            <div className="px-8 py-3 rounded-full border border-white/10 bg-white/5 backdrop-blur-md">
                                <span className="text-[10px] font-black uppercase tracking-widest text-cool-grey">
                                    <span className="text-white animate-pulse">●</span> EXCLUSIVE PILOT TESTING LIVE
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Image Break - Premium Visual */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1 }}
                        className="relative w-full aspect-[16/9] md:aspect-[21/9] rounded-[2rem] md:rounded-[4rem] overflow-hidden mb-40 border border-white/5 shadow-2xl"
                    >
                        <img
                            src="/assets/landing/partner_venue_hero.png"
                            alt="The Be4L Experience"
                            className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-700 opacity-60"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20" />
                        <div className="absolute bottom-12 left-12 right-12 flex justify-between items-end">
                            <div className="space-y-2">
                                <h2 className="text-4xl font-black italic tracking-tighter uppercase animate-liquid-text">Vibrant Community.</h2>
                                <p className="text-cool-grey font-bold uppercase tracking-widest text-xs">Real-world engagement at its peak.</p>
                            </div>
                            <div className="hidden md:flex gap-4">
                                <div className="p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 flex items-center gap-3">
                                    <Users className="text-electric-teal" size={24} />
                                    <div>
                                        <p className="text-lg font-black leading-none">5k+</p>
                                        <p className="text-[8px] font-bold uppercase text-cool-grey tracking-widest">Active Questers</p>
                                    </div>
                                </div>
                                <div className="p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 flex items-center gap-3">
                                    <TrendingUp className="text-electric-teal" size={24} />
                                    <div>
                                        <p className="text-lg font-black leading-none">+250%</p>
                                        <p className="text-[8px] font-bold uppercase text-cool-grey tracking-widest">Traffic Spike</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Value Sections */}
                    <div className="space-y-40">
                        {sections.map((section, i) => (
                            <div key={section.id} className={`flex flex-col md:flex-row items-center gap-16 ${i % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                                <motion.div
                                    initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    className="flex-1 space-y-8"
                                >
                                    <div className="space-y-4 text-center md:text-left">
                                        <span className={`text-[10px] font-black uppercase tracking-[0.4em] ${section.color} bg-white/5 px-4 py-2 rounded-lg`}>
                                            {section.badge}
                                        </span>
                                        <h2 className="text-3xl md:text-6xl font-black font-fui text-white tracking-tighter uppercase leading-tight animate-liquid-text">
                                            {section.title}
                                        </h2>
                                        <p className="text-lg md:text-xl text-cool-grey font-medium leading-relaxed font-sans">
                                            {section.desc}
                                        </p>
                                    </div>

                                    <div className="p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/10 space-y-4 relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                                            <section.icon size={80} />
                                        </div>
                                        <div className="flex items-center gap-3 text-white uppercase font-black text-sm tracking-tighter">
                                            <Zap className="text-electric-teal" size={18} />
                                            The Operator Alpha
                                        </div>
                                        <p className="text-base text-cool-grey italic font-sans pr-12 relative z-10">
                                            "{section.example}"
                                        </p>
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    className="flex-1 w-full"
                                >
                                    <div className="glass-panel p-6 md:p-12 rounded-[2rem] md:rounded-[3rem] border-white/5 shadow-2xl space-y-8 relative flex items-center justify-center group overflow-hidden">
                                        {/* Decorative Graphics */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-electric-teal/10 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                                        {/* Feature specific "graphic" placeholders */}
                                        {section.id === 'engine' && (
                                            <div className="relative w-full h-full flex items-center justify-center">
                                                <div className="w-64 h-64 border-4 border-electric-teal/20 rounded-full animate-ping absolute" />
                                                <div className="w-48 h-48 border-2 border-electric-teal/40 rounded-full animate-pulse absolute" />
                                                <Target size={120} className="text-electric-teal relative z-10" strokeWidth={1} />
                                            </div>
                                        )}
                                        {section.id === 'verification' && (
                                            <div className="relative w-full h-full flex flex-col items-center justify-center gap-8">
                                                <QrCode size={180} className="text-electric-teal opacity-80" strokeWidth={1} />
                                                <div className="flex gap-4">
                                                    {[1, 2, 3].map(j => (
                                                        <div key={j} className="h-2 w-12 rounded-full bg-electric-teal/20" />
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {section.id === 'branding' && (
                                            <div className="relative w-full h-full grid grid-cols-2 gap-4">
                                                <div className="bg-white/5 rounded-3xl p-4 flex flex-col justify-end gap-2">
                                                    <Camera size={24} className="text-white/40" />
                                                    <div className="h-2 w-1/2 bg-white/10 rounded-full" />
                                                </div>
                                                <div className="row-span-2 bg-white/5 rounded-3xl flex items-center justify-center">
                                                    <PlayCircle size={48} className="text-white/40" />
                                                </div>
                                                <div className="bg-white/5 rounded-3xl" />
                                            </div>
                                        )}
                                        {section.id === 'community' && (
                                            <div className="relative w-full h-full flex flex-col items-center justify-center gap-6">
                                                <div className="flex -space-x-6">
                                                    {[1, 2, 3, 4].map(j => (
                                                        <div key={j} className="w-20 h-20 rounded-full bg-white/5 border-4 border-deep-black flex items-center justify-center bg-gradient-to-br from-white/10 to-transparent">
                                                            <Users size={24} className="opacity-40" />
                                                        </div>
                                                    ))}
                                                </div>
                                                <p className="text-xs font-black tracking-[0.5em] text-electric-teal uppercase">Connected Tribe</p>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            </div>
                        ))}
                    </div>

                    {/* Pilot Quest Emphasis */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="mt-60 mb-20 p-12 md:p-24 rounded-[5rem] bg-gradient-to-br from-white/[0.05] to-transparent border border-white/10 text-center space-y-12 relative overflow-hidden"
                    >
                        {/* Background Decoration */}
                        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
                            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-electric-teal blur-[150px] rounded-full animate-aurora-slow" />
                        </div>

                        <div className="space-y-4 relative z-10">
                            <span className="inline-block px-6 py-2 rounded-full bg-electric-teal text-black text-[10px] font-black uppercase tracking-[0.4em]">
                                THE VANGUARD OPPORTUNITY
                            </span>
                            <h2 className="text-4xl md:text-8xl font-black font-fui text-white tracking-tighter uppercase leading-[0.85] animate-liquid-text">
                                JOIN THE <br />
                                <span className="text-white">PILOT QUEST.</span>
                            </h2>
                            <p className="text-xl md:text-2xl text-cool-grey max-w-3xl mx-auto font-medium font-sans mt-8">
                                We are currently looking for the <span className="text-white font-black italic">first few partners</span> on each category for pilot testing only.
                                Secure your spot as a pioneer in the Be4L ecosystem.
                            </p>
                        </div>

                        <div className="pt-8 relative z-10">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/partner/apply')}
                                className="px-16 py-8 rounded-[2.5rem] bg-electric-teal text-black font-black font-fui text-2xl shadow-[0_30px_60px_rgba(45,212,191,0.4)] hover:shadow-[0_45px_100px_rgba(45,212,191,0.6)] transition-all flex items-center gap-6 mx-auto uppercase"
                            >
                                APPLY FOR PILOT
                                <Shield size={28} />
                            </motion.button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-20 border-t border-white/5 mt-12 relative z-10">
                            {['Early Access', 'Core Feature Input', 'Priority Support', 'Genesis Badge'].map(perk => (
                                <div key={perk} className="space-y-2">
                                    <div className="w-8 h-8 rounded-full bg-electric-teal/20 flex items-center justify-center mx-auto mb-2">
                                        <Zap size={14} className="text-electric-teal" />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-cool-grey">{perk}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                </div>
            </main>
        </div>
    );
};
