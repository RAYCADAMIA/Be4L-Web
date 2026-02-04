import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { PartnerApplyForm } from '../components/Partner/PartnerApplyForm';

export const PartnerPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-black text-white selection:bg-electric-teal/30">
            {/* Header / Intro */}
            <section className="relative py-32 px-6 overflow-hidden">
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-7xl font-black mb-8 leading-tight"
                    >
                        Partner with <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-teal via-cyan-400 to-indigo-400">Be4L</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-gray-400 max-w-2xl mx-auto font-medium"
                    >
                        We're building an operating system for life.
                        Join us in creating a community where people actually live, explore, and connect.
                    </motion.p>
                </div>
                {/* Aurora Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[100vw] h-[60vh] bg-gradient-to-b from-electric-teal/10 via-transparent to-transparent blur-[120px] pointer-events-none" />
            </section>

            {/* Why Partner? */}
            <section className="py-24 px-6 bg-neutral-900/50">
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="p-10 rounded-3xl bg-white/5 border border-white/10"
                    >
                        <h3 className="text-2xl font-bold mb-4">Reach Gen Z</h3>
                        <p className="text-gray-400 leading-relaxed">
                            Connect with a generation that values authenticity, experiences, and community over passive consumption.
                        </p>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="p-10 rounded-3xl bg-white/5 border border-white/10"
                    >
                        <h3 className="text-2xl font-bold mb-4">Host Social Quests</h3>
                        <p className="text-gray-400 leading-relaxed">
                            Turn your business or venue into a destination for side quests, challenges, and local lores.
                        </p>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="p-10 rounded-3xl bg-white/5 border border-white/10"
                    >
                        <h3 className="text-2xl font-bold mb-4">Reward Real Life</h3>
                        <p className="text-gray-400 leading-relaxed">
                            Incentivize real-world interactions and reward users for completing meaningful activities.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Application Form Section */}
            <section id="apply" className="py-32 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-black mb-4">Ready to Launch?</h2>
                        <p className="text-gray-400">Tell us about your organization and let's build something epic together.</p>
                    </div>

                    <div className="p-8 md:p-12 rounded-[3.5rem] bg-neutral-900 border border-white/10 shadow-2xl">
                        <PartnerApplyForm />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 border-t border-white/5 text-center">
                <button
                    onClick={() => navigate('/')}
                    className="text-xs font-bold uppercase tracking-widest text-white/30 hover:text-white transition-colors"
                >
                    Back to Main
                </button>
            </footer>
        </div>
    );
};

export default PartnerPage;
