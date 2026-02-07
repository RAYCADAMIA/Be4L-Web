import React from 'react';
import { motion } from 'framer-motion';
import { Starfield, HUDMenu } from '../Landing/LandingComponents';
import { useNavigate } from 'react-router-dom';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

interface LegalLayoutProps {
    children: React.ReactNode;
    title: string;
    lastUpdated?: string;
}

export const LegalLayout: React.FC<LegalLayoutProps> = ({ children, title, lastUpdated = "2026" }) => {
    const navigate = useNavigate();
    useDocumentTitle(title);

    return (
        <div className="relative min-h-screen bg-[#09090b] text-white selection:bg-electric-teal/30 overflow-x-hidden">
            <Starfield />
            <HUDMenu onJoinClick={() => navigate('/')} isScrolled={true} />

            <main className="relative z-10 pt-40 pb-20 px-6">
                <article className="max-w-3xl mx-auto glass-panel p-8 md:p-12 rounded-[2.5rem] border-white/5 shadow-2xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-4xl md:text-5xl font-black font-fui text-electric-teal tracking-tighter mb-4 uppercase">
                            {title}
                        </h1>
                        <p className="text-cool-grey font-mono text-[10px] uppercase tracking-[0.3em] mb-12">
                            Effective Date: {lastUpdated}
                        </p>

                        <div className="prose prose-invert prose-teal max-w-none space-y-8 font-sans text-cool-grey leading-relaxed">
                            {children}
                        </div>
                    </motion.div>
                </article>
            </main>
        </div>
    );
};
