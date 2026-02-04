import React from 'react';
import { motion } from 'framer-motion';

export const VisionSection: React.FC = () => {
    return (
        <section className="py-20 px-6 relative overflow-hidden select-none">
            <div className="max-w-5xl mx-auto text-center space-y-24 relative z-10">

                {/* 1. Definition - Alive Glass Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
                    viewport={{ once: true }}
                    className="relative glass-panel rounded-[3rem] overflow-hidden group"
                >
                    {/* Alive Gradient Border */}


                    <div className="relative p-6 md:p-16 rounded-[3rem] h-full w-full">
                        {/* Background Glow */}


                        <h2 className="text-sm uppercase tracking-[0.5em] text-electric-teal font-black mb-8 relative z-10 font-display animate-liquid-text">Dictionary</h2>

                        <div className="text-left max-w-2xl mx-auto space-y-6 relative z-10">
                            <div className="flex flex-wrap items-baseline gap-4">
                                <h3 className="text-3xl md:text-7xl font-black tracking-tighter font-display animate-liquid-text uppercase">Side Quest</h3>
                                <span className="text-cool-grey font-mono text-xs md:text-sm uppercase tracking-[0.2em] font-bold opacity-60">
                                    [noun, slang]
                                </span>
                            </div>
                            <p className="text-lg md:text-2xl text-cool-grey font-medium leading-[1.6] font-sans max-w-2xl border-l-2 border-electric-teal/20 pl-6 py-2">
                                Whimsical, unplanned adventures taken during daily life. Exploring a new hobby, wandering off during a social event, joining a random pickup game, or crashing a house party with new friends.
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* 2. Manifesto */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1], delay: 0.2 }}
                    viewport={{ once: true }}
                    className="space-y-8"
                >
                    <h2 className="text-3xl md:text-6xl font-black text-white tracking-tighter leading-tight font-display uppercase">
                        This is what <br className="hidden md:block" />
                        <span className="animate-liquid-text decoration-electric-teal underline decoration-2 underline-offset-8">living</span> actually is.
                    </h2>

                    <p className="text-lg text-cool-grey max-w-2xl mx-auto font-medium leading-relaxed font-sans">
                        Life isn't just about the main quest (the job, the routine).
                        It's about the <span className="animate-liquid-text font-black uppercase tracking-tighter">side quests</span>.
                        The random pickleball game. The solo hiking trip. The midnight concert.
                    </p>
                </motion.div>

                {/* 3. Closing Statement */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1], delay: 0.4 }}
                    viewport={{ once: true }}
                    className="glass-panel p-6 md:p-14 rounded-[2.5rem] shadow-2xl max-w-4xl mx-auto"
                >
                    <p className="text-xl md:text-3xl font-black text-white leading-tight font-display tracking-tighter">
                        "Be4L is a giant friend group <br />
                        always down for <span className="animate-liquid-text font-black uppercase tracking-tighter">side quests</span> and adventures."
                    </p>
                    <p className="mt-8 text-lg font-bold tracking-[0.3em] text-electric-teal font-display">
                        We choose to be for life.
                    </p>
                </motion.div>

            </div>


        </section>
    );
};
