import React from 'react';
import { motion } from 'framer-motion';
import { Starfield, HUDMenu } from '../components/Landing/LandingComponents';
import { useNavigate } from 'react-router-dom';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export const AboutPage: React.FC = () => {
    const navigate = useNavigate();
    useDocumentTitle('About');

    return (
        <div className="relative min-h-screen bg-[#09090b] text-white selection:bg-electric-teal/30 overflow-x-hidden">
            <Starfield />
            <HUDMenu onJoinClick={() => navigate('/')} isScrolled={true} />

            <main className="relative z-10 flex items-center justify-center min-h-screen px-6 py-20">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                    className="max-w-2xl w-full"
                >
                    <div className="glass-panel p-10 md:p-16 rounded-[4rem] border-white/5 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-electric-teal/5 to-transparent pointer-events-none" />

                        <h1 className="text-sm font-black font-fui text-electric-teal tracking-[0.5em] uppercase mb-12 text-center">
                            The Manifesto
                        </h1>

                        <div className="space-y-12 relative">
                            <p className="text-2xl md:text-3xl font-black font-display tracking-tight leading-tight text-white/90">
                                The world is an open map. <br />
                                But we are stuck scrolling.
                            </p>

                            <p className="text-xl md:text-2xl font-medium text-cool-grey leading-relaxed">
                                Be4L is the HUD that helps you log off and live. We don't want your attention on the screen; we want your presence in the world.
                            </p>

                            <div className="pt-8 border-t border-white/10">
                                <p className="text-base text-white/60 leading-relaxed">
                                    "We choose side quests over main plots. We choose stories over status. We choose life."
                                </p>
                            </div>
                        </div>

                        {/* Mask image gradient effect */}
                        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#09090b] via-[#09090b]/80 to-transparent pointer-events-none" />
                    </div>
                </motion.div>
            </main>
        </div>
    );
};
