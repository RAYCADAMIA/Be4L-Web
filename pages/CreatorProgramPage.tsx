import React from 'react';
import { motion } from 'framer-motion';
import { Starfield, HUDMenu } from '../components/Landing/LandingComponents';
import { Footer } from '../components/Shared/Footer';
import { useNavigate } from 'react-router-dom';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import {
    Zap,
    Users,
    ArrowRight,
    TrendingUp,
    DollarSign,
    Handshake,
    Video,
    BarChart3,
    Sparkles,
    Star,
    Heart
} from 'lucide-react';

export const CreatorProgramPage: React.FC = () => {
    const navigate = useNavigate();
    useDocumentTitle('Be4L Creator Program');

    const sections = [
        {
            id: 'matchmaking',
            icon: Handshake,
            badge: 'BRAND MATCHMAKING',
            title: 'GET MATCHED WITH LOCAL BRANDS',
            desc: 'No more cold DMs. We connect you directly with businesses that match your niche and audience. Brand matching has never been the same.',
            example: 'A local cafe needs foot traffic → You create a \"morning coffee run\" vlog → You earn from every booking through your link.',
            color: 'text-purple-400'
        },
        {
            id: 'earn',
            icon: DollarSign,
            badge: 'PERFORMANCE PAY',
            title: 'EARN FROM EVERY TRANSACTION',
            desc: 'No flat fees. No upfront negotiations. You earn a commission from every successful booking driven by your content. The more you convert, the more you earn.',
            example: 'Your TikTok drives 50 reservations → You earn a percentage of each → Real income, not just \"exposure.\"',
            color: 'text-electric-teal'
        },
        {
            id: 'content',
            icon: Video,
            badge: 'AUTHENTIC CONTENT',
            title: 'CREATE LORE, NOT ADS',
            desc: 'Post your real experiences to the Be4L Lore feed. Tag partner brands, and your content automatically becomes a bookable experience.',
            example: 'Film your side quest at a partner venue → Tag them → Your post becomes a booking funnel.',
            color: 'text-pink-400'
        },
        {
            id: 'analytics',
            icon: BarChart3,
            badge: 'CREATOR DASHBOARD',
            title: 'TRACK YOUR IMPACT',
            desc: 'See exactly how many clicks, bookings, and commissions your content generates. Full transparency, real-time analytics.',
            example: 'Your dashboard shows: 2,300 link clicks → 180 bookings → ₱12,400 earned this month.',
            color: 'text-blue-400'
        }
    ];

    return (
        <div className="relative min-h-screen text-white selection:bg-purple-400/30 overflow-x-hidden bg-deep-black">
            <Starfield />
            <HUDMenu onJoinClick={() => navigate('/')} isScrolled={true} />

            <main className="relative z-10 pt-40 pb-32 px-6">
                <div className="max-w-4xl mx-auto">

                    {/* Hero Section */}
                    <div className="text-center space-y-12 mb-40">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="space-y-6"
                        >
                            <span className="text-[10px] md:text-sm font-black uppercase tracking-[0.5em] bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
                                BE4L CREATOR PROGRAM
                            </span>
                            <h1 className="text-5xl md:text-8xl font-black font-fui brand-text-dusk tracking-tighter uppercase leading-[0.85]">
                                YOUR CONTENT. <br />
                                <span className="text-white">YOUR INCOME.</span>
                            </h1>
                            <p className="text-xl md:text-3xl text-cool-grey max-w-4xl mx-auto font-medium font-sans mt-8 leading-relaxed">
                                Stop creating for free. Join the Be4L Creator Program and <span className="text-white">turn your influence into real revenue</span> by connecting with local brands that need your voice.
                            </p>
                        </motion.div>

                        <div className="flex flex-col md:flex-row items-center justify-center gap-6 mt-12">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/Careers/Creator-Program/apply')}
                                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-black px-12 py-6 rounded-2xl font-fui text-xl shadow-[0_0_40px_rgba(168,85,247,0.3)] flex items-center gap-4 group"
                            >
                                JOIN CREATOR PROGRAM
                                <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
                            </motion.button>

                            <div className="px-8 py-3 rounded-full border border-purple-500/20 bg-purple-500/5 backdrop-blur-md">
                                <span className="text-[10px] font-black uppercase tracking-widest text-cool-grey">
                                    <span className="text-purple-400 animate-pulse">●</span> ACCEPTING APPLICATIONS
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* How it works - Simple 3-step */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mb-40"
                    >
                        <h2 className="text-center text-2xl md:text-3xl font-black uppercase tracking-tighter text-white font-fui mb-16">
                            How It <span className="text-purple-400">Works</span>
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                { step: '01', title: 'Apply & Get Verified', desc: 'Submit your profile. We review your content and audience to verify you as a Be4L Creator.', icon: Star },
                                { step: '02', title: 'Get Matched', desc: 'We pair you with local brands that align with your niche. No searching, no cold outreach.', icon: Heart },
                                { step: '03', title: 'Create & Earn', desc: 'Create content, share your unique booking link, and earn commissions from every transaction.', icon: Sparkles },
                            ].map((item) => (
                                <div key={item.step} className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-purple-500/30 transition-all group text-center space-y-6">
                                    <div className="w-16 h-16 mx-auto rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20 group-hover:scale-110 transition-transform">
                                        <item.icon size={28} />
                                    </div>
                                    <div className="space-y-3">
                                        <span className="text-[10px] font-black text-purple-400/60 uppercase tracking-[0.3em]">Step {item.step}</span>
                                        <h4 className="text-lg font-black uppercase tracking-wide text-white">{item.title}</h4>
                                        <p className="text-cool-grey text-xs leading-relaxed">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Feature Sections */}
                    <div className="space-y-40">
                        {sections.map((section, i) => (
                            <div id={section.id} key={section.id} className={`flex flex-col md:flex-row items-center gap-16 ${i % 2 === 1 ? 'md:flex-row-reverse' : ''} scroll-mt-32`}>
                                <motion.div
                                    initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    className="flex-1 space-y-8"
                                >
                                    <div className="space-y-4 text-center md:text-left">
                                        <span className={`text-[10px] font-black uppercase tracking-[0.4em] ${section.color} bg-white/5 px-4 py-2 rounded-lg`}>
                                            {section.badge}
                                        </span>
                                        <h2 className="text-3xl md:text-6xl font-black font-fui text-white tracking-tighter uppercase leading-tight brand-text-dusk">
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
                                            <Zap className="text-purple-400" size={18} />
                                            Creator Alpha
                                        </div>
                                        <p className="text-base text-cool-grey font-sans pr-12 relative z-10">
                                            "{section.example}"
                                        </p>
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    className="flex-1 w-full"
                                >
                                    <div className="glass-panel p-6 md:p-12 rounded-[2rem] md:rounded-[3rem] border-white/5 shadow-2xl space-y-8 relative flex items-center justify-center group overflow-hidden min-h-[280px]">
                                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                                        {section.id === 'matchmaking' && (
                                            <div className="relative w-full h-full flex items-center justify-center">
                                                <div className="flex items-center gap-8">
                                                    <div className="w-24 h-24 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                                                        <Video size={40} className="text-purple-400" />
                                                    </div>
                                                    <div className="flex flex-col items-center gap-1">
                                                        <div className="w-12 h-[2px] bg-gradient-to-r from-purple-400 to-pink-400" />
                                                        <Handshake size={24} className="text-pink-400" />
                                                        <div className="w-12 h-[2px] bg-gradient-to-r from-pink-400 to-orange-400" />
                                                    </div>
                                                    <div className="w-24 h-24 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                                                        <TrendingUp size={40} className="text-orange-400" />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {section.id === 'earn' && (
                                            <div className="relative w-full h-full flex flex-col items-center justify-center gap-6">
                                                <div className="flex items-end gap-3">
                                                    {[40, 60, 45, 80, 65, 90].map((h, idx) => (
                                                        <motion.div
                                                            key={idx}
                                                            initial={{ height: 0 }}
                                                            whileInView={{ height: h }}
                                                            transition={{ delay: idx * 0.1 }}
                                                            className="w-8 rounded-t-lg bg-gradient-to-t from-electric-teal/40 to-electric-teal/80"
                                                        />
                                                    ))}
                                                </div>
                                                <p className="text-xs font-black tracking-[0.5em] text-electric-teal uppercase">Growing Revenue</p>
                                            </div>
                                        )}
                                        {section.id === 'content' && (
                                            <div className="relative w-full h-full grid grid-cols-2 gap-4">
                                                <div className="bg-white/5 rounded-3xl p-6 flex flex-col items-center justify-center gap-3">
                                                    <Video size={32} className="text-pink-400" />
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Your Lore</span>
                                                </div>
                                                <div className="bg-white/5 rounded-3xl p-6 flex flex-col items-center justify-center gap-3">
                                                    <DollarSign size={32} className="text-electric-teal" />
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Their Booking</span>
                                                </div>
                                            </div>
                                        )}
                                        {section.id === 'analytics' && (
                                            <div className="relative w-full h-full flex flex-col items-center justify-center gap-6">
                                                <div className="grid grid-cols-3 gap-6">
                                                    {[
                                                        { label: 'Clicks', value: '2.3K' },
                                                        { label: 'Bookings', value: '180' },
                                                        { label: 'Earned', value: '₱12.4K' },
                                                    ].map(stat => (
                                                        <div key={stat.label} className="text-center">
                                                            <p className="text-2xl font-black text-white">{stat.value}</p>
                                                            <p className="text-[8px] font-bold uppercase tracking-widest text-cool-grey">{stat.label}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                                <BarChart3 size={48} className="text-blue-400 opacity-50" />
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            </div>
                        ))}
                    </div>

                    {/* CTA Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="mt-60 mb-20 p-12 md:p-24 rounded-[5rem] bg-gradient-to-br from-purple-500/[0.08] to-transparent border border-purple-500/10 text-center space-y-12 relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
                            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-500 blur-[150px] rounded-full animate-aurora-slow" />
                        </div>

                        <div className="space-y-4 relative z-10">
                            <span className="inline-block px-6 py-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] font-black uppercase tracking-[0.4em]">
                                THE CREATOR OPPORTUNITY
                            </span>
                            <h2 className="text-4xl md:text-8xl font-black font-fui text-white tracking-tighter uppercase leading-[0.85] brand-text-dusk">
                                READY TO <br />
                                <span className="text-white">GET PAID?</span>
                            </h2>
                            <p className="text-xl md:text-2xl text-cool-grey max-w-3xl mx-auto font-medium font-sans mt-8">
                                We're building the <span className="text-white font-black">first wave of Be4L Creators</span>.
                                Apply now and be among the first to monetize through our brand matchmaking system.
                            </p>
                        </div>

                        <div className="pt-8 relative z-10">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/Careers/Creator-Program/apply')}
                                className="px-16 py-8 rounded-[2.5rem] bg-gradient-to-r from-purple-500 to-pink-500 text-white font-black font-fui text-2xl shadow-[0_30px_60px_rgba(168,85,247,0.4)] hover:shadow-[0_45px_100px_rgba(168,85,247,0.6)] transition-all flex items-center gap-6 mx-auto uppercase"
                            >
                                JOIN NOW
                                <Sparkles size={28} />
                            </motion.button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-20 border-t border-white/5 mt-12 relative z-10">
                            {['No Upfront Cost', 'Commission Based', 'Brand Matching', 'Creator Dashboard'].map(perk => (
                                <div key={perk} className="space-y-2">
                                    <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-2">
                                        <Zap size={14} className="text-purple-400" />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-cool-grey">{perk}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                </div>
            </main>

            <Footer />
        </div>
    );
};

export default CreatorProgramPage;
