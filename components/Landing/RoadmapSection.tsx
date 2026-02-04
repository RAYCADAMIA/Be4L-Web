import React from 'react';
import { motion } from 'framer-motion';

const milestones = [
    { date: 'Nov 2025', title: 'The Spark', status: 'done', desc: 'Realize that we all share the passion of living life to the fullest and what it is to truly live not just to exist. Envisioned a side quest-focused lifestyle platform.' },
    { date: 'Dec 2025', title: 'Core Development', status: 'done', desc: 'Building the fundamental Quest, Booking, and Story systems.' },
    { date: 'Q1 2026', title: 'Web Beta Release', status: 'done', desc: 'Public launch of the Be4L web platform for early testers.' },
    { date: 'Q1 2026', title: 'Exclusive Brand Partnership', status: 'upcoming', desc: 'Selected partners to be one of the first founding pilot brands. Places, Events, and Merchants.' },
    { date: 'Q1 2026', title: 'Quest Drop Launch', status: 'upcoming', desc: 'First wave of real-world challenges with official rewards.' },
    { date: 'Q1 2026', title: 'App Launch', status: 'upcoming', desc: 'Official release on App Store and Google Play.' },
    { date: 'Q2 2026', title: 'Tokenization', status: 'upcoming', desc: 'Launching token ecosystem and exploring opportunities for users.' },
    { date: '∞', title: 'Live Life', status: 'upcoming', desc: 'The future is ours to take. More milestones to reach.' }
];

export const RoadmapSection: React.FC = () => {
    return (
        <section className="py-32 px-6 relative overflow-hidden select-none">
            <div className="max-w-6xl mx-auto relative z-10">
                <div className="mb-24 text-center">
                    <h2 className="text-xs uppercase tracking-[0.5em] text-electric-teal font-black mb-4 font-display opacity-60">The Adventure</h2>
                    <h3 className="text-5xl md:text-7xl font-black text-white tracking-tighter font-display uppercase animate-liquid-text">Roadmap</h3>
                </div>

                <div className="relative">
                    {/* Vertical Line - Electric Teal */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-electric-teal/50 via-electric-teal/50 to-transparent hidden md:block" />

                    <div className="space-y-16">
                        {milestones.map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1], delay: index * 0.1 }}
                                viewport={{ once: true, margin: '-50px' }}
                                className={`relative flex flex-col md:flex-row items-center gap-8 ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
                            >
                                {/* Indicator Dot */}
                                <div className="absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-black border-2 border-electric-teal z-10 hidden md:block" />

                                <div className="w-full md:w-1/2">
                                    <div className={`p-8 md:p-10 rounded-[2rem] glass-panel transition-all duration-500 group ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'} text-center hover:border-electric-teal/40 hover:-translate-y-1.5`}>
                                        <div className={`flex flex-col ${index % 2 === 0 ? 'md:items-end' : 'md:items-start'} items-center gap-2 mb-4`}>
                                            <span className={`${item.date === '∞' ? 'text-2xl md:text-3xl translate-y-1' : 'text-[10px]'} font-black uppercase tracking-[0.3em] text-electric-teal font-display animate-liquid-text`}>{item.date}</span>
                                            {item.status === 'done' ? (
                                                <span className="px-3 py-1 rounded-full bg-electric-teal text-black text-[7px] font-black uppercase tracking-[0.2em] font-display">MILESTONE MET</span>
                                            ) : (
                                                <span className="px-3 py-1 rounded-full bg-white/5 text-cool-grey text-[7px] font-black uppercase tracking-[0.2em] border border-white/10 font-display">INCOMING</span>
                                            )}
                                        </div>
                                        <h4 className="text-3xl md:text-5xl font-black text-white mb-3 tracking-tighter font-display uppercase animate-liquid-text">{item.title}</h4>
                                        <p className="text-cool-grey text-base md:text-lg font-medium leading-relaxed font-sans opacity-80">{item.desc}</p>
                                    </div>
                                </div>
                                <div className="hidden md:block w-1/2" />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>


        </section>
    );
};
